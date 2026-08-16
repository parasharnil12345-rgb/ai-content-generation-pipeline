require('dotenv').config();
const express = require('express');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const { markdownToDocx, Packer } = require('./lib/markdown-to-docx');
const { buildIndex, getLogs } = require('./lib/url-index');

const { runSerpResearch }   = require('./pipeline/serp');
const { runRedditResearch } = require('./pipeline/reddit');
const { runGeminiResearch } = require('./pipeline/gemini');
const { runProspleData }    = require('./pipeline/prosple');
const { runClaudeWriter }   = require('./pipeline/writer');

buildIndex();
getLogs().forEach(line => console.log(line));

// server.js had no Anthropic client of its own before this — pipeline/writer.js
// instantiates its own internally, but that file is out of scope here — so this
// is a new client, used only by the Check 2 classification call below.
const anthropicClient = new Anthropic();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function detectCountry(url) {
  if (!url) return null;
  if (url.includes('au.your-platform.com')) return 'Australia';
  if (url.includes('nz.your-platform.com')) return 'New Zealand';
  return null;
}

// Claude ignores the "no em dashes" prompt instruction often enough that we
// strip them here as a final, deterministic pass over the fully assembled output.
function stripEmDashes(text) {
  const count = (text.match(/—|&mdash;/g) || []).length;

  let cleaned = text.replace(/&mdash;/g, '—');
  cleaned = cleaned.replace(/ — /g, ', ');
  cleaned = cleaned.replace(/—/g, ', ');

  // Clean up artifacts: stray space before a comma, and doubled-up commas
  // that can appear when an em dash sat next to existing punctuation.
  cleaned = cleaned.replace(/\s+,/g, ',');
  cleaned = cleaned.replace(/,(\s*,)+/g, ',');

  return { cleaned, count };
}

// Word counting/splitting helpers shared by the FAQ and stage trimmers below.
// A markdown hyperlink [anchor text](url) counts as its anchor-text word count only.
function countWordsMarkdown(text) {
  const stripped = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  return stripped.trim().split(/\s+/).filter(Boolean).length;
}

// Splits on sentence-ending punctuation followed by whitespace, without ever
// breaking a [text](url) hyperlink apart — links are swapped for placeholder
// tokens first, split around, then restored.
function splitIntoSentences(text) {
  const links = [];
  const protectedText = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (m) => {
    links.push(m);
    return ` L${links.length - 1} `;
  });

  const rawSentences = protectedText
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  return rawSentences.map(s => s.replace(/ L(\d+) /g, (_, i) => links[Number(i)]));
}

function removeOrphanedBoldLabel(text) {
  return text.replace(/\*\*[^*]+:\*\*\s*$/, '').trim();
}

// Rebuilds a block sentence-by-sentence up to maxWords, always keeping the
// first sentence intact even if it alone exceeds the limit (never cuts mid-sentence).
function trimBlockToWordLimit(text, maxWords) {
  const input = text.trim();
  const originalWords = countWordsMarkdown(input);
  if (originalWords <= maxWords) {
    return { text: input, original: originalWords, final: originalWords, singleSentenceOverflow: false };
  }

  const sentences = splitIntoSentences(input);
  if (sentences.length === 0) {
    return { text: input, original: originalWords, final: originalWords, singleSentenceOverflow: false };
  }

  let result = sentences[0];
  let runningWords = countWordsMarkdown(result);
  const singleSentenceOverflow = runningWords > maxWords;

  for (let i = 1; i < sentences.length; i++) {
    const sentenceWords = countWordsMarkdown(sentences[i]);
    if (runningWords + sentenceWords <= maxWords) {
      result += ' ' + sentences[i];
      runningWords += sentenceWords;
    } else {
      break;
    }
  }

  result = removeOrphanedBoldLabel(result);
  if (!/[.?!]$/.test(result)) result += '.';

  return { text: result, original: originalWords, final: countWordsMarkdown(result), singleSentenceOverflow };
}

// Finds every markdown heading (any level) with its title and the character
// offset where its body text begins, in document order.
function getHeadings(markdown) {
  const headingRegex = /^(#{1,6})\s+(.*)$/gm;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
      headingStart: match.index,
      bodyStart: match.index + match[0].length,
    });
  }
  return headings;
}

// Trims each application-stage guidance block (H3 headings containing
// "✅ Stage N") down to 35 words, sentence by sentence.
function trimStages(markdown) {
  const headings = getHeadings(markdown);
  const logs = [];
  let totalWordsRemoved = 0;

  const stageHeadings = headings
    .map((h, idx) => ({ ...h, idx }))
    .filter(h => h.level === 3 && /✅\s*Stage\s*\d+/i.test(h.title));

  let result = markdown;
  for (let i = stageHeadings.length - 1; i >= 0; i--) {
    const h = stageHeadings[i];
    const bodyEnd = (h.idx + 1 < headings.length) ? headings[h.idx + 1].headingStart : markdown.length;
    const body = result.slice(h.bodyStart, bodyEnd);
    const stageNumMatch = h.title.match(/Stage\s*(\d+)/i);
    const stageNum = stageNumMatch ? stageNumMatch[1] : String(i + 1);

    const trimmed = trimBlockToWordLimit(body, 35);

    if (trimmed.original > 35) {
      if (trimmed.singleSentenceOverflow) {
        logs.unshift(`Stage trim warning: single sentence in stage ${stageNum} exceeds 35 words, kept intact`);
      }
      logs.unshift(`Stage trim: stage ${stageNum} reduced from ${trimmed.original} to ${trimmed.final} words`);
      totalWordsRemoved += (trimmed.original - trimmed.final);
      result = result.slice(0, h.bodyStart) + '\n\n' + trimmed.text + '\n\n' + result.slice(bodyEnd);
    }
  }

  return { text: result, logs, totalWordsRemoved };
}

// Career path names that legitimately act as a SALARY_PARENT fallback source in
// pipeline/prosple.js (or, more broadly, the generic default career path). If the salary
// table's discipline label or the career progression H2 ever shows one of these instead
// of the keyword's own career path, that's the label-bleed bug this check watches for.
const KNOWN_PARENT_FALLBACK_LABELS = [
  'Business, Commerce & Management',
  'Healthcare',
  'Civil & Structural Engineering',
  'Computer Science & Software Engineering',
  'Environment & Sustainability',
  'Mechanical & Mechatronic Engineering',
  'Mining & Resources Engineering',
  'Urban Planning',
  'Marketing',
  'Finance & Banking',
  'Government & Public Administration',
];

// Monitoring-only check: confirms the salary table label and the career progression H2
// both reflect the keyword's own career path rather than a parent fallback path name.
// Never modifies output or blocks generation.
function checkCareerPathLabelConsistency(markdown, keywordCareerPath) {
  if (!keywordCareerPath) return;

  const headerIdx = markdown.search(/\|\s*Discipline\s*\|/i);
  if (headerIdx !== -1) {
    const lines = markdown.slice(headerIdx).split('\n').map(l => l.trim()).filter(Boolean);
    const dataRow = lines[2]; // lines[0] = header, lines[1] = --- separator, lines[2] = first data row
    if (dataRow) {
      const firstCell = dataRow.split('|').map(c => c.trim()).filter(Boolean)[0];
      if (firstCell && firstCell !== keywordCareerPath && KNOWN_PARENT_FALLBACK_LABELS.includes(firstCell)) {
        console.warn(`WARNING: Salary table label mismatch. Expected ${keywordCareerPath}, found ${firstCell}. Page may need manual review.`);
      }
    }
  }

  const progressionMatch = markdown.match(/^##\s*What Is the Career Progression for (.+?) in .+\?$/mi);
  if (progressionMatch) {
    const progressionLabel = progressionMatch[1].trim();
    if (!progressionLabel.includes(keywordCareerPath)) {
      console.warn(`WARNING: Career progression H2 label mismatch. Expected ${keywordCareerPath}, found "${progressionLabel}". Page may need manual review.`);
    }
  }
}

// Splits the intro (everything before the first H2) into blank-line-separated
// paragraphs: [0] H1, [1] Para 1 (hook), [2] Para 2, [3+] quick action bullets.
function getIntroParagraphs(markdown) {
  const h2Idx = markdown.search(/\n##\s/);
  const intro = h2Idx === -1 ? markdown : markdown.slice(0, h2Idx);
  return intro.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
}

// Monitoring-only check: confirms Para 2 has exactly one hyperlink and that it
// points to an external URL, not an internal platform URL. Never modifies output.
function checkPara2Url(markdown) {
  const paras = getIntroParagraphs(markdown);
  const para2 = paras.length > 2 ? paras[2] : null;
  if (!para2) {
    console.log('Para 2 check: could not extract Para 2 -- skipping');
    return;
  }

  const links = [...para2.matchAll(/\[([^\]]*)\]\(([^)]*)\)/g)];
  const urls = links.map(m => m[2]);

  // Check 1a -- count
  if (urls.length === 0) {
    console.warn('WARNING: Para 2 has no hyperlink. External sourced fact required. Manual review needed.');
  } else if (urls.length === 1) {
    console.log('Para 2 check: 1 hyperlink found -- OK');
  } else {
    console.warn(`WARNING: Para 2 has ${urls.length} hyperlinks -- must be exactly 1. Manual review needed.`);
  }

  // Check 1b -- URL type
  const internalPrefixes = ['https://au.your-platform.com', 'https://nz.your-platform.com', 'http://au.your-platform.com', 'http://nz.your-platform.com'];
  let foundInternal = false;
  for (const url of urls) {
    if (internalPrefixes.some(prefix => url.startsWith(prefix))) {
      console.warn(`WARNING: Para 2 contains internal platform URL: ${url}. External URL required. Manual review needed.`);
      foundInternal = true;
    }
  }
  if (!foundInternal && urls.length > 0) {
    console.log('Para 2 check: external URL confirmed -- OK');
  }
}

// Extracts the hook's bold key-insight text and each bullet's bold imperative
// text (up to and including the first full stop) for the Check 2 classification call.
function extractHookAndBullets(markdown) {
  const paras = getIntroParagraphs(markdown);
  if (paras.length < 3) return null;

  // Unlike bullets, the hook's bold span doesn't reliably end with a full stop
  // inside the ** — "**key insight phrase**, rest of sentence." is common — so
  // this matches up to the first closing ** rather than requiring a period first.
  const hookMatch = paras[1].match(/\*\*(.+?)\*\*/);
  if (!hookMatch) return null;
  const hook = hookMatch[1];

  const bullets = [];
  for (const p of paras.slice(3)) {
    const cleaned = p.replace(/^[-*]\s+/, '');
    const m = cleaned.match(/^\*\*(.+?)\.\*\*/);
    if (m) bullets.push(m[1] + '.');
  }

  if (bullets.length < 3) return null;
  return { hook, bullets };
}

// Monitoring-only check: uses a small Haiku classification call to detect whether
// the hook and quick action bullets are addressing four distinct dimensions of the
// student's problem, or whether the hook's dimension (or two bullets) collide.
// Fire-and-forget from the caller's perspective -- never blocks content delivery,
// never modifies output, and every failure mode degrades to a skip log line.
async function checkBulletDimensions(markdown) {
  const extracted = extractHookAndBullets(markdown);
  if (!extracted) {
    console.log('Bullet dimension check: could not extract hook or bullets -- skipping');
    return;
  }
  const { hook, bullets } = extracted;

  const userMessage = `Classify each of the following as exactly one of these five dimensions: TIMING, CREDENTIAL_SIGNAL, TECHNICAL_PROOF, STRATEGY, MARKET_MECHANISM.

TIMING: about when to apply, which window, which month, which week, which deadline.
CREDENTIAL_SIGNAL: about what qualification, body membership, certification, or pathway commitment to signal to employers.
TECHNICAL_PROOF: about what evidence of skills, tools, portfolio, or methods to show.
STRATEGY: about which employers to target, which pathway to take, which pool to compete in, or what most students get wrong strategically.
MARKET_MECHANISM: about how the market works, a hidden truth, or a structural reality of the hiring market.

Hook: ${hook}
Bullet 1: ${bullets[0]}
Bullet 2: ${bullets[1] || ''}
Bullet 3: ${bullets[2] || ''}
Bullet 4: ${bullets[3] || 'N/A'}

Return only a JSON object in this exact format with no other text:
{
  'hook': 'DIMENSION',
  'bullet1': 'DIMENSION',
  'bullet2': 'DIMENSION',
  'bullet3': 'DIMENSION',
  'bullet4': 'DIMENSION or null'
}`;

  let response;
  try {
    response = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: userMessage }],
    });
  } catch (err) {
    console.log('Bullet dimension check: API call failed -- skipping');
    return;
  }

  let parsed;
  try {
    const rawText = response.content[0].text;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch (err) {
    console.log('Bullet dimension check: classification failed -- skipping');
    return;
  }

  const bulletEntries = [
    { num: 1, value: parsed.bullet1 },
    { num: 2, value: parsed.bullet2 },
    { num: 3, value: parsed.bullet3 },
  ];
  if (parsed.bullet4 && parsed.bullet4 !== 'null') {
    bulletEntries.push({ num: 4, value: parsed.bullet4 });
  }

  // Check 2a -- hook vs bullet conflict
  let hookConflict = false;
  for (const b of bulletEntries) {
    if (b.value === parsed.hook) {
      hookConflict = true;
      console.warn(`WARNING: Bullet ${b.num} dimension (${b.value}) matches hook dimension (${parsed.hook}). This bullet should address a different dimension. Manual review needed.`);
    }
  }
  if (!hookConflict) {
    console.log('Bullet dimension check: no hook-bullet conflicts found -- OK');
  }

  // Check 2b -- bullet vs bullet conflict
  let bulletConflict = false;
  for (let i = 0; i < bulletEntries.length; i++) {
    for (let j = i + 1; j < bulletEntries.length; j++) {
      if (bulletEntries[i].value === bulletEntries[j].value) {
        bulletConflict = true;
        console.warn(`WARNING: Bullet ${bulletEntries[i].num} and Bullet ${bulletEntries[j].num} both address ${bulletEntries[i].value}. One should be rewritten to address a different dimension. Manual review needed.`);
      }
    }
  }
  if (!bulletConflict) {
    console.log('Bullet dimension check: no bullet-bullet conflicts found -- OK');
  }
}

// Monitoring-only check: flags bold bullet imperatives exceeding 8 words. The system
// prompt specifies this limit but the model does not follow it consistently at
// generation time -- this is the reliable post-processing backstop. Never modifies output.
//
// The quick action bullets are rendered as bold-led paragraphs with NO leading "- "
// markdown list marker (confirmed against real generated output -- zero "- **" lines
// appear anywhere in any tested page). Scoping to paras.slice(3), the same isolation
// extractHookAndBullets already uses, is required for two reasons: (1) a markdown
// list-marker pattern would never match this format at all, and (2) scanning the
// whole document for any line starting with "**" would false-positive on the hook,
// which is also a bold-led paragraph ending in a full stop before the closing **.
function checkBulletImperativeLength(markdown) {
  const paras = getIntroParagraphs(markdown);
  const bulletParas = paras.slice(3);

  const pattern1 = /^\*\*([^*]+?)\.\*\*/;
  const pattern2 = /^\*\*([^*]+?)\*\*/;

  const imperatives = [];
  for (const para of bulletParas) {
    const line = para.replace(/^[-*]\s+/, '');
    let captured = null;
    const m1 = line.match(pattern1);
    if (m1) {
      captured = m1[1];
    } else {
      const m2 = line.match(pattern2);
      if (m2) {
        captured = m2[1];
      }
    }
    if (captured === null) continue;

    const trimmed = captured.trim();
    if (trimmed.endsWith(':')) continue; // label, not an imperative -- excluded, not counted

    imperatives.push(trimmed);
  }

  if (imperatives.length === 0) {
    if (markdown.length > 100) {
      console.log('Bullet imperative check: no imperatives extracted -- verify content format before publishing.');
    }
    return;
  }

  let violations = 0;
  for (const imperative of imperatives) {
    const words = imperative.split(/\s+/).filter(Boolean);
    if (words.length >= 9) {
      violations++;
      console.warn(`WARNING: Bullet imperative exceeds 8 words (${words.length} words): '${imperative}'. Manual review needed before publishing.`);
    }
  }

  if (violations > 0) {
    console.log(`Bullet imperative check: ${violations} violation(s) found. Review before publishing.`);
  } else {
    console.log(`Bullet imperative check: all ${imperatives.length} imperatives within 8 words -- OK`);
  }
}

// Monitoring-only check: flags a specific comma-splice pattern recurring in hook
// sentence 2 for certain career paths despite a system-prompt guardrail added to
// prevent it. Never modifies output.
function checkHookCommaSplice(markdown) {
  const searchWindow = markdown.slice(0, 2000);
  const candidates = searchWindow.split(/\n\n+/);

  let hookText = null;
  for (const p of candidates) {
    const trimmed = p.trim();
    if (trimmed.startsWith('#')) continue;
    if (!trimmed.includes('**')) continue;
    if (trimmed.length < 30) continue;
    hookText = trimmed;
    break;
  }

  if (!hookText) {
    console.log('Hook comma splice check: could not extract hook paragraph -- skipping');
    return;
  }

  const stripped = hookText.replace(/\*\*/g, '');

  // Whitespace after the comma (\s+, not \s*) is what distinguishes a new clause
  // beginning from a mid-phrase use of the same word (e.g. "firms applying").
  const commaSplicePattern = /,\s+(?:applying\s|direct\s+application|candidates\s+who\s|this\s+(?:is|means|ensures|allows|requires)|it\s+(?:is|means|ensures|requires)|most\s+(?:positions|roles|firms|candidates|students|graduates|applications)|all\s+(?:positions|roles|firms|candidates)|these\s+(?:roles|positions|firms|applications))/i;

  if (commaSplicePattern.test(stripped)) {
    console.warn(`WARNING: Possible comma splice detected in hook paragraph. Two independent clauses may be joined by only a comma. Review hook sentence 2 before publishing. Hook excerpt: '${stripped.slice(0, 200)}'`);
  }
}

// Monitoring-only check: flags a "Your [X] determines..." orientation paragraph
// appearing as a standalone paragraph between the quick action bullets and the types
// table H2 heading. Prose-level structural constraints are not reliably enforced at
// this prompt length, so this is the reliable post-processing backstop. Never modifies output.
function checkFloatingOrientationParagraph(markdown) {
  const headings = getHeadings(markdown);
  const typesTableHeading = headings.find(h => h.level === 2 && /^what types? of/i.test(h.title));
  if (!typesTableHeading) return; // no types table H2 found -- nothing to check against

  const beforeH2 = markdown.slice(0, typesTableHeading.headingStart);
  const paras = beforeH2.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

  // Find the last quick-action-bullet paragraph (bold-led, starts with "**" --
  // confirmed format, no leading "- " marker, same as checkBulletImperativeLength).
  let lastBulletIdx = -1;
  for (let i = 0; i < paras.length; i++) {
    if (paras[i].startsWith('**')) lastBulletIdx = i;
  }
  if (lastBulletIdx === -1) return; // no bullets found -- nothing to check between

  // NOTE ON THE FRAMING-SENTENCE POSITION: the original design excluded the paragraph
  // immediately before the H2 on the theory that it is the (legitimately merged)
  // framing sentence. Tested directly against real captured content from confirmed prior
  // failures: in every case the floating paragraph IS the last paragraph before the H2 --
  // there is no separate framing sentence after it. An exclusion on that position means
  // the check never fires on any real violation, which defeats its purpose. "Your X
  // determines Y" is also the exact pattern a correctly merged framing sentence uses, so
  // position cannot reliably distinguish a fixed page from a broken one from text alone.
  // Since this check is monitoring-only (warns for manual review, never blocks or modifies
  // output), the safer choice is to flag every matching paragraph in the between-zone,
  // including the last one -- a false positive costs a human one paragraph of review; a
  // false negative silently reproduces the exact bug this check exists to catch.
  const lastParaIdx = paras.length - 1;

  for (let i = lastBulletIdx + 1; i <= lastParaIdx; i++) {
    const para = paras[i];
    if (para.startsWith('Your ') && /determines?/i.test(para)) {
      console.warn(`WARNING: Floating orientation paragraph detected before types table. Paragraph starts with 'Your ' and contains 'determines/determine'. This paragraph should be integrated into the framing sentence or Bullet 4. Manual review needed before publishing. Paragraph excerpt: '${para.slice(0, 120)}'`);
    }
  }
}

// Extracts the text body of a level-2 section between one H2 heading matching
// startPattern and the next H2 heading matching endPattern (or end of document
// if endPattern is null or no matching heading follows). Returns null if the
// start heading isn't found.
function extractSectionByHeading(markdown, startPattern, endPattern) {
  const headings = getHeadings(markdown);
  const startIdx = headings.findIndex(h => h.level === 2 && startPattern.test(h.title));
  if (startIdx === -1) return null;
  const start = headings[startIdx].bodyStart;

  let end = markdown.length;
  if (endPattern) {
    const endIdx = headings.findIndex((h, i) => i > startIdx && h.level === 2 && endPattern.test(h.title));
    if (endIdx !== -1) end = headings[endIdx].headingStart;
  }

  const body = markdown.slice(start, end).trim();
  return body.length ? body : null;
}

// Career progression and types table are markdown tables, not prose -- a plain
// sentence-splitter (which relies on terminal ".?!") collapses an entire table into
// one giant blob because table cells rarely end in sentence punctuation. This splits
// table rows into one ratable unit per row (cells joined, separator rows dropped)
// and runs ordinary sentence-splitting on whatever prose surrounds the table (the
// FAQ section, and the framing/credential sentences around the tables), then
// combines both into a single ordered list of ratable units.
function extractRatableUnits(sectionText) {
  const lines = sectionText.split('\n').map(l => l.trim()).filter(Boolean);
  const units = [];
  let proseBuffer = [];
  // Holds the most recently seen table row until we know whether the NEXT line is
  // a separator row -- if it is, this row was the column header and gets discarded
  // instead of pushed, since a header ("Related Sector | ... | What You'll Work On")
  // isn't ratable content and was showing up as a false rung-1 "trim candidate".
  let pendingTableRow = null;

  const flushProse = () => {
    if (proseBuffer.length) {
      units.push(...splitIntoSentences(proseBuffer.join(' ')));
      proseBuffer = [];
    }
  };
  const flushPendingRow = () => {
    if (pendingTableRow !== null) {
      units.push(pendingTableRow);
      pendingTableRow = null;
    }
  };

  for (const line of lines) {
    const isSeparator = /^\|[\s:|-]+\|$/.test(line);
    const isTableRow = !isSeparator && /^\|.*\|$/.test(line);

    if (isSeparator) {
      pendingTableRow = null; // discard -- the row that preceded this was the header
      continue;
    }
    if (isTableRow) {
      flushProse();
      flushPendingRow(); // a pending row not followed by a separator was real data, not a header
      const cells = line.slice(1, -1).split('|').map(c => c.trim()).filter(Boolean);
      pendingTableRow = cells.length ? cells.join(' -- ') : null;
    } else {
      flushPendingRow();
      if (!/^#{1,6}\s/.test(line)) proseBuffer.push(line);
    }
  }
  flushPendingRow();
  flushProse();

  return units.filter(s => s.trim().length > 0);
}

// Monitoring-only: sends one section's ratable units to Haiku for a 1-5 specificity
// rating and logs any rated 1 or 2 as trim candidates for human review. Never
// modifies content. Every failure path (no section found, API failure, parse
// failure) degrades to a skip log line rather than throwing.
//
// Haiku is asked to return {index, rating} pairs rather than echoing the full
// sentence text back -- verified necessary during testing: with the sentence text
// echoed back in every object, a 15-sentence FAQ section produced a response that
// hit max_tokens mid-string and failed to parse. Index-based responses are a small
// fraction of the token cost per item, which is what actually fixes the truncation
// (the max_tokens bump below is header-room on top of that, not the primary fix).
async function rateSectionSpecificity(sectionLabel, sectionText) {
  if (!sectionText) {
    console.log(`Section trim check: could not extract ${sectionLabel} -- skipping`);
    return;
  }

  const units = extractRatableUnits(sectionText);
  if (units.length === 0) {
    console.log(`Section trim check: could not extract ${sectionLabel} -- skipping`);
    return;
  }

  const prompt = `You are reviewing sentences in a career guidance page section for specificity. Rate each numbered sentence below on a scale of 1-5:
1 = Generic truth about any career (rung 1 specificity)
2 = True for this career category but not this market (rung 2)
3 = Specific to career and country (rung 3)
4 = Specific to career, country, and employer type (rung 4)
5 = Specific to career, country, employer, and moment (rung 5)

Return only a JSON array of objects with "index" (the sentence number below) and "rating" fields. Do not repeat the sentence text. Do not include any other text.

Sentences to rate:
${units.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;

  let response;
  try {
    response = await anthropicClient.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });
  } catch (err) {
    console.log(`Section trim check: Haiku call failed for ${sectionLabel} -- skipping`);
    return;
  }

  let ratings;
  try {
    const rawText = response.content[0].text;
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    ratings = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
  } catch (err) {
    console.log(`Section trim check: JSON parse failed for ${sectionLabel} -- skipping`);
    return;
  }

  const lowSpecificity = ratings.filter(r => r && (r.rating === 1 || r.rating === 2) && units[r.index - 1]);
  if (lowSpecificity.length > 0) {
    const lines = lowSpecificity.map(r => `- '${units[r.index - 1]}' (rated ${r.rating})`).join('\n');
    console.warn(`REVIEW: ${sectionLabel} contains ${lowSpecificity.length} low-specificity sentence(s) that may be trimming candidates. Rated 1 or 2 out of 5:\n${lines}\nManual review recommended if section is over word budget.`);
  }
}

// Monitoring-only check: flags rung 1/2 sentences in the three sections most likely
// to run over the recalibrated word-count targets -- FAQs, career progression, types
// table. Never modifies content, never blocks, never auto-trims -- flags candidates
// for a human to decide whether the section is actually over budget and, if so, which
// sentence to cut. The three Haiku calls are independent of each other and run in
// parallel; each is individually isolated so one failure never prevents the other two
// from completing.
async function checkSectionSpecificity(markdown) {
  const faqText = extractSectionByHeading(markdown, /^(frequently asked questions|faqs?)$/i, null);
  const progressionText = extractSectionByHeading(markdown, /^what is the career progression/i, /^(frequently asked questions|faqs?)$/i);
  const typesText = extractSectionByHeading(markdown, /^what types? of/i, /^what do .* look for/i);

  const sections = [
    ['FAQs', faqText],
    ['Career progression', progressionText],
    ['Types table', typesText],
  ];

  await Promise.all(sections.map(([label, text]) =>
    rateSectionSpecificity(label, text).catch(() => {
      console.log(`Section trim check: unexpected error for ${label} -- skipping`);
    })
  ));
}

// Monitoring-only check: scans every markdown table in the generated content (types
// table, career progression table, salary table, city table -- table-shape-agnostic,
// no knowledge of which table or column it's looking at) for cells exceeding 20 words.
// This is a looser backstop than the prompt-level 12-word target for the What You'll
// Work On column -- it exists to catch cases where the prompt target is missed by a
// wide margin, not to enforce the prompt's exact number. Never modifies output.
function checkTableCellWordCounts(markdown) {
  const lines = markdown.split('\n');

  function isPipeDelimited(line) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
    return (trimmed.match(/\|/g) || []).length >= 2;
  }

  // A separator row is a line where every character between each pair of pipes is a
  // hyphen, a colon, or a space (e.g. "|---|---|---|" or "|:---|:---:|---:|").
  function isSeparatorRow(line) {
    const trimmed = line.trim();
    const parts = trimmed.split('|').slice(1, -1);
    if (parts.length === 0) return false;
    return parts.every(part => /^[-: ]*$/.test(part) && part.includes('-'));
  }

  function stripMarkdown(text) {
    return text
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim();
  }

  let violations = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Step A: keep only pipe-delimited rows that are not themselves separator rows.
    if (!isPipeDelimited(line) || isSeparatorRow(line)) continue;

    // Step B: discard header rows -- a table row immediately followed by a separator row.
    const nextLine = lines[i + 1] || '';
    if (isPipeDelimited(nextLine) && isSeparatorRow(nextLine)) continue;

    // Step C: split by |, discard index 0 (before leading |), index 1 (row label),
    // and the trailing empty index (after trailing |).
    const cells = line.trim().split('|');
    let bodyCells = cells.slice(2);
    if (bodyCells.length && bodyCells[bodyCells.length - 1].trim() === '') {
      bodyCells = bodyCells.slice(0, -1);
    }

    // Step D
    for (const rawCell of bodyCells) {
      const stripped = stripMarkdown(rawCell);
      if (!stripped) continue;
      const words = stripped.split(/\s+/).filter(Boolean);
      if (words.length > 20) {
        violations++;
        console.warn(`WARNING: Table cell exceeds 20 words (${words.length} words): '${stripped.slice(0, 60)}'. Manual review before publishing.`);
      }
    }
  }

  // Step E: silent pass -- log nothing when zero violations.
  if (violations > 0) {
    console.log(`Table cell check: ${violations} cell(s) exceed 20 words. Review before publishing.`);
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/generate', async (req, res) => {
  const { keyword, pageUrl } = req.body;

  if (!keyword || !pageUrl) {
    return res.status(400).json({ error: 'keyword and pageUrl are required' });
  }

  const country = detectCountry(pageUrl);
  if (!country) {
    return res.status(400).json({ error: 'URL must be from au.your-platform.com or nz.your-platform.com' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data) => {
    if (!res.writableEnded) res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    send({ type: 'start', country, keyword });

    // Step 1 — SERP research
    send({ type: 'step', step: 1, label: 'SERP research' });
    const serpData = await runSerpResearch(keyword, country);
    send({ type: 'step_done', step: 1 });

    // Step 2 — Reddit research
    send({ type: 'step', step: 2, label: 'Reddit research' });
    const redditData = await runRedditResearch(keyword, country);
    send({ type: 'step_done', step: 2 });

    // Step 3 — Gemini market stats (must run before Claude)
    send({ type: 'step', step: 3, label: 'Market stats (Gemini)' });
    const geminiStats = await runGeminiResearch(keyword, country);
    send({ type: 'step_done', step: 3 });

    // Step 4 — Platform internal data
    send({ type: 'step', step: 4, label: 'Platform internal data' });
    const prospleData = await runProspleData(keyword, country, pageUrl);
    send({ type: 'step_done', step: 4 });

    // Step 5 — Claude writer (streaming tokens back to client)
    send({ type: 'step', step: 5, label: 'Writing content' });
    const content = await runClaudeWriter(
      keyword, country, serpData, redditData, geminiStats, prospleData,
      (token) => send({ type: 'token', text: token })
    );

    const { cleaned, count } = stripEmDashes(content);
    console.log(`Post-processing: replaced ${count} em dashes`);

    const stageResult = trimStages(cleaned);
    stageResult.logs.forEach(line => console.log(line));

    console.log(`Post-processing complete: removed ${stageResult.totalWordsRemoved} words from application stages`);

    const finalMarkdown = stageResult.text;

    checkCareerPathLabelConsistency(finalMarkdown, prospleData.keywordCareerPath);

    checkPara2Url(finalMarkdown);

    // Fire-and-forget: none of these three checks are awaited in the response path,
    // so they add zero latency to content delivery. checkBulletDimensions makes a
    // real Haiku API call and dominates the wall-clock time of this block; the other
    // two are pure synchronous regex checks that complete in microseconds regardless.
    // Each check has its own independent try/catch so a failure in one can never
    // prevent the others from running.
    (async () => {
      try {
        await checkBulletDimensions(finalMarkdown);
      } catch (err) {
        console.log('Bullet dimension check: unexpected error -- skipping');
      }

      try {
        checkBulletImperativeLength(finalMarkdown);
      } catch (err) {
        console.log(`Bullet imperative check: error -- ${err.message}. Skipping.`);
      }

      try {
        checkHookCommaSplice(finalMarkdown);
      } catch (err) {
        console.log(`Hook comma splice check: error -- ${err.message}. Skipping.`);
      }

      try {
        checkFloatingOrientationParagraph(finalMarkdown);
      } catch (err) {
        console.log(`Floating orientation paragraph check: error -- ${err.message}. Skipping.`);
      }

      try {
        await checkSectionSpecificity(finalMarkdown);
      } catch (err) {
        console.log(`Section trim check: unexpected error -- ${err.message}. Skipping.`);
      }

      try {
        checkTableCellWordCounts(finalMarkdown);
      } catch (err) {
        console.log(`Table cell check: error -- ${err.message}. Skipping.`);
      }
    })();

    send({ type: 'complete', wordCount: finalMarkdown.trim().split(/\s+/).length, markdown: finalMarkdown });
  } catch (err) {
    console.error('Pipeline error:', err);
    send({ type: 'error', message: err.message });
  } finally {
    res.end();
  }
});

app.post('/api/download', async (req, res) => {
  const { markdown, keyword } = req.body;
  if (!markdown) return res.status(400).json({ error: 'markdown is required' });

  try {
    const doc = markdownToDocx(markdown, keyword || 'generated-content');
    const buffer = await Packer.toBuffer(doc);
    const filename = (keyword || 'generated-content').replace(/\s+/g, '-').toLowerCase() + '.docx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('DOCX generation error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Content Generator running at http://localhost:${PORT}`);
});
