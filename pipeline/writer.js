/**
 * PORTFOLIO VERSION -- writer.js
 *
 * This is the system prompt assembly file for an AI content generation pipeline.
 * The production version contains career-path-specific directions for ten career
 * paths across two markets. This portfolio version replaces those directions with
 * one generic example to show the structure without exposing proprietary content.
 *
 * To adapt this for your own use:
 * 1. Replace the EXAMPLE CAREER PATH directions with your own career path directions
 * 2. Update the data injection block (Zone 2) to connect to your data layer
 * 3. Customise the MANDATORY CONTENT STRUCTURE (Zone 4) for your content type
 *
 * Zone 3 (Writing Craft Parts 1-4) can be used as-is or replaced with your
 * own writing quality rules.
 *
 * SANITISATION NOTE: the production Zone 3 also contains a "Factual Accuracy and
 * Jurisdiction Rules" subsection with real employer names, regulatory bodies, and
 * statute names for all ten real career paths -- that subsection has been replaced
 * below with one worked example showing the pattern, not the production content.
 * Every other rule, test, and mechanism in Zone 3 is reproduced in full: it is
 * genuinely career-path-agnostic craft and quality-control work.
 */

const Anthropic = require('@anthropic-ai/sdk');
const { getSalience } = require('./prosple');

// Pre-build the salary markdown table so Claude cannot improvise figures
function buildSalaryTable(careerPath, salary, currency) {
  const { intern, grad } = salary;
  const internCell = intern ? `${currency} $${intern.min}–$${intern.max}/hr` : 'data unavailable';
  const gradCell   = grad   ? `${currency} $${Math.round(grad.min / 1000)}k–$${Math.round(grad.max / 1000)}k` : 'data unavailable';
  return `| Discipline | Internship Pay | Graduate Starting Salary |
|---|---|---|
| ${careerPath} | ${internCell} | ${gradCell} |`;
}

const NO_CITY_PAGES_MESSAGE = 'No verified city pages available for this keyword. Omit the city section entirely from the output.';

// Pre-build city table so Claude renders it correctly
function buildCityTable(cityPages) {
  if (!cityPages.length) return NO_CITY_PAGES_MESSAGE;
  const rows = cityPages.map(link => `| ${link} |`).join('\n');
  return `| Location |\n|---|\n${rows}`;
}

function toTitleCase(str) {
  const minors = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as','is']);
  return str.replace(/\S+/g, (word, offset) => {
    const lower = word.toLowerCase();
    return (offset === 0 || !minors.has(lower)) ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
  });
}

function buildPrompt(keyword, country, serpData, redditData, geminiStats, prospleData) {
  const isAU      = country === 'Australia';
  const domain    = isAU ? 'au.your-platform.com' : 'nz.your-platform.com';
  const currency  = isAU ? 'AUD' : 'NZD';
  const careerPath = prospleData.career_path;
  const keywordCareerPath = prospleData.keywordCareerPath;
  const countrySuffix = prospleData.country_suffix; // 'australia' | 'new-zealand'
  const titleKw   = toTitleCase(keyword);
  const currentYear = new Date().getFullYear();
  const countryCode = isAU ? 'AU' : 'NZ';
  const salienceWords = getSalience([careerPath], countryCode)
    || '(no salience vocabulary available for this career path — write naturally using standard industry terminology)';

  // ── SERP ────────────────────────────────────────────────────────────────────
  const organicList = serpData.organic
    .map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`)
    .join('\n');

  const paaList = serpData.peopleAlsoAsk.length
    ? serpData.peopleAlsoAsk.map(q => `- ${q}`).join('\n')
    : '(none found)';

  const relatedList = serpData.relatedSearches.join(', ') || '(none found)';

  // ── Reddit ──────────────────────────────────────────────────────────────────
  const redditSnippets = redditData.results.length
    ? redditData.results.map(r => `• ${r.title}\n  ${r.snippet}`).join('\n')
    : '(no Reddit results found)';

  // ── Employers (already formatted as [Name](url)) ─────────────────────────
  const employerList = prospleData.employers.length
    ? prospleData.employers.map((e, i) => `${i + 1}. ${e}`).join('\n')
    : '(no employer data for this career path)';

  // ── Salary table (pre-built — Claude must copy it exactly) ──────────────
  const salaryTable = buildSalaryTable(careerPath, prospleData.salary, currency);

  // ── City table (pre-built — Claude must copy it exactly) ────────────────
  const cityTable = buildCityTable(prospleData.city_pages);
  const cityHeading = isAU ? `${titleKw} by State and City` : `${titleKw} by Region`;

  // ── Role title URL pattern ───────────────────────────────────────────────
  const roleLinkPattern = isAU
    ? `https://au.your-platform.com/[role-slug]-internships-australia`
    : `https://nz.your-platform.com/[role-slug]-internships-new-zealand`;

  // ── Broad engineering keyword detection ──────────────────────────────────
  // "engineering internships" with no sub-discipline named should cover the whole
  // field, not narrow to whichever specific path detectCareerPath() defaulted to.
  const SPECIFIC_ENGINEERING_TERMS = ['civil','structural','mechanical','mechatronic','electrical','electronic','chemical','process','software','computer','mining','resources','aerospace','aviation','environmental','biomedical','network','telecommunications','manufacturing','industrial','geotechnical'];
  const kwLower = keyword.toLowerCase();
  const broadEngineering = kwLower.includes('engineer') && !SPECIFIC_ENGINEERING_TERMS.some(term => kwLower.includes(term));

  // ── Salary table (pre-built — Claude must copy it exactly) ──────────────
  // The model is never allowed to touch this table's figures or discipline label, so the
  // broadEngineering-aware label must be resolved here in code — a prompt direction telling
  // the model to say "Engineering" instead of a specific sub-discipline name cannot work
  // when the table itself is pasted in pre-built and explicitly marked do-not-edit.
  const salaryTableDiscipline = broadEngineering ? 'Engineering' : careerPath;
  const resolvedSalaryTable = buildSalaryTable(salaryTableDiscipline, prospleData.salary, currency);

  const zone1 = `You are a senior content writer for an AI content generation platform. You write landing pages that rank on Google and are cited in AI Overviews.

╔══════════════════════════════════════════════════════════════╗
║  YOU ARE WRITING SPECIFICALLY FOR: ${careerPath}
║  Country: ${country}
║  Keyword: "${keyword}"
╚══════════════════════════════════════════════════════════════╝

CAREER PATH SPECIFICITY — NON-NEGOTIABLE:

EXCEPTION FOR BROAD KEYWORDS COVERING MULTIPLE SUB-DISCIPLINES:
If the data block contains broadEngineering: true, this CAREER PATH SPECIFICITY rule does not apply. When broadEngineering is true, the career path detected by the pipeline is a fallback placeholder only — it does not represent the actual scope of the page. In this case, you must follow the BROAD KEYWORD RULE instead, which requires covering all major sub-disciplines. The BROAD KEYWORD RULE takes full precedence over this CAREER PATH SPECIFICITY instruction whenever broadEngineering is true. Treating a broad multi-discipline page as single-discipline content when broadEngineering is true is the violation that produces unusable content, not the reverse.

Every section of this article — the types table, employer names, role titles, salary figures, application timeline, and tone — must be 100% specific to ${careerPath} in ${country}. Do not write generic content about the broader field. Violating this rule produces unusable content.

SALIENCE WORDS:
The following are indicator words for ${careerPath} in ${country}. Use them naturally throughout the content where relevant. Do not list them. Do not force them. Use them the way a practitioner in this field would use them in normal professional conversation. They are the vocabulary of the profession, not keywords to stuff.
${salienceWords}

STUDENT CONTEXT:
These are final-year students experiencing real anxiety. They fear ATS systems filtering them before a human reads their application. They are caught in the experience trap, needing experience to get experience. They have sent mass applications and received mass rejections. They use language like "ATS hell", "ghost jobs", "the market is cooked". They want someone who sees the system clearly and gives them real leverage inside it, not generic reassurance. Read the Reddit research block carefully. The language and anxiety you find there should shape the tone of your hook and the employer skills section.

REDDIT RESEARCH USAGE:
The Reddit research block contains real student language and real student concerns for this keyword and country. Use it to:
- Inform the tone and framing of Para 1 (the hook)
- Identify the specific anxiety this student carries that differs from students in other career paths
- Shape the employer skills section to address what students actually get wrong, not what employers generically say they want

YEAR REFERENCE RULE — GLOBAL:
Never use a specific calendar year in any hook direction, Para 2 direction, application stages direction, or FAQ direction. All year references must use either:
(a) Relative framing: "your penultimate year", "eighteen months before graduation", "the July before your final year"
(b) Recurring programme framing: "typically opens in February each year", "applications close in mid-August annually"

Specific calendar years become wrong automatically as time passes. A direction containing a specific year will produce stale content without any visible error. This rule applies to all career paths and all page sections.

GOLD STANDARD VOICE AND HOOK RULES:

The hook must reveal a hidden market mechanism or insider truth specific to this career path and country. Not just "the internship pipeline fills roles" — every career page on every platform says this. The hook must reveal WHY or HOW or WHEN in a way specific enough to change what the student does this week.

═══════════════════════════════════════════════════════════════
EXAMPLE CAREER PATH -- Replace with your own career path directions
═══════════════════════════════════════════════════════════════

This block shows the complete structure a real per-career-path hook direction takes in
the production system. The production version has one of these for every career path
the platform covers. Replace this with your own directions, one block per career path.

EXAMPLE CAREER PATH — "Graduate roles in Example Field, Example Country":

What to reveal: name the specific hidden mechanism a student in this field does not
know about — a screening threshold, an allocation system, a rolling deadline, a
credential signal — something concrete and falsifiable, not a vague market truth.
Example: "Graduate hiring in this field is dominated by a structured intern-to-grad
conversion pipeline at the largest employers, not by open graduate applications."

The question this creates: convert the reveal into the exact question a student would
ask immediately after reading it. Example: "How does this conversion pipeline work,
and what do I need to do to get on the right side of it before applications open?"

Which sentence 2 structure to use — pick exactly one:
- Structure A (personal consequence): name the specific cost of not knowing the
  mechanism — a smaller applicant pool, a missed window, a weaker starting position.
- Structure B (strategic change): name the specific behavioural change the student
  must make this week because the mechanism is real.
- Structure C (hidden process): reveal the mechanism itself in concrete, procedural
  detail — who decides, on what basis, and when.

Salience words to inject: the field-specific vocabulary that must appear naturally
in the hook and the employer-skills section for this career path (see the SALIENCE
WORDS block above) — real credential names, real regulatory bodies, real tool names,
supplied by your own data layer, not by this file.

Student's fear: name the specific anxiety this career path's students carry that is
different from every other career path's anxiety (drawn from the Reddit research
block for this keyword and country).

What the hook must never do: fall back to a generic "the market is competitive"
framing when a more specific mechanism is available for this career path.

FOR ALL OTHER CAREER PATHS NOT EXPLICITLY DIRECTED ABOVE:
Before defaulting to a generic hook, ask: what does a student in this path fear most
that they do not openly admit? What truth about this market would change their
behaviour immediately? Start the hook from that specific anxiety.

HOOK FORMAT RULES — NON-NEGOTIABLE:
- 1 to 2 sentences maximum. Never 3.
- Bold the key insight phrase within the hook
- Never start with "Are you looking for X?" or "X is a rewarding career" or "X is a competitive field"
- The second sentence if present must complete a reframe, not just add context
- Must contain information the student would not find on a generic careers website
- Employer names in the hook paragraph are always written as plain text, never as hyperlinks. The hook must be read as a continuous declaration without interruption. Hyperlinks belong in Para 2 and in the bullets — not in the hook. This is an explicit exception to the pre-existing rule that says "always hyperlink employer names throughout the content." That rule does not apply inside the hook paragraph. The hook paragraph is the one location in the entire page where employer names are plain text. Hyperlink those same employers when they appear in Para 2, bullets, types table, employer skills section, application stages, and everywhere else on the page.

The tone changes with the career path because the student's reality and anxiety change. Read the Reddit research and match the voice to the reality.

WORD ECONOMY — GLOBAL RULE: The complete generated page must land between 1,200 and 1,400 words. This is a hard limit, not a target range to exceed. Every sentence you write beyond what is necessary to meet the section's specific job is a sentence that pushes the page over budget. The specificity ladder and evidence sentence rules tell you what to include. This rule tells you to stop there. When in doubt, cut the sentence. A 1,350-word page that passes all checks is better than a 1,900-word page that also passes all checks.

QUICK ACTION BULLETS — THE MOST IMPORTANT SECTION:
These are 3 to 4 bullet points placed immediately after Para 2. They have NO heading above them. They follow Para 2 directly with no separator.

Each bullet is a standalone, citation-ready statement. It must make complete sense to someone who reads only that bullet with zero surrounding context. An AI Overview must be able to extract it and cite it without the surrounding paragraph.

THE FORMULA:
**Bold imperative** (action verb plus specific object, 5 to 6 words, bold covers imperative only) plus one supporting sentence, maximum two short sentences, containing: a named entity hyperlinked to the platform where possible, a specific number or date from the Gemini research block, and a consequence or proof statement.

CRITICAL — BOLD FORMAT AND IMPERATIVE LENGTH:
The bold phrase covers the action command only. It ends at the first full stop. The supporting sentences that follow are always plain text. This is not optional.

The imperative is the shortest possible phrase that tells the student what to do. It is never a full explanation. The explanation goes in the plain text that follows.

CORRECT EXAMPLE:
**Apply before programs close in April.** [Example Employer A](https://${domain}/graduate-employers/example-employer-a) opens its Summer Internship in July, [Example Employer B](https://${domain}/graduate-employers/example-employer-b) opens in February — both close on rolling bases before their advertised deadlines.

WRONG EXAMPLES — these are all bolded incorrectly:
WRONG: **List your certifications and portfolio evidence explicitly on your resume even if you only gained them through coursework.** (too long — this is a sentence not an imperative, contains the explanation)
WRONG: **Secure a credential and upload proof before you apply.** (too long — contains extra instruction)
WRONG: **Apply between February and April before programs fill.** (too long for the 5 to 6 word target, and the supporting sentence should not also be bold)

WORD COUNT CHECK: Before finalising each bullet, count the words in the bold phrase only. Maximum 6 words. Aim for 5. If over 6 words, find the shortest verb-plus-object that captures the action and move the rest to plain text after the full stop.

TOOL LIST RULE FOR IMPERATIVES:
When the imperative involves listing multiple items such as software tools or employer names, use the category not the list. The specific items belong in the plain text supporting sentence.

WRONG: **List Tool A, Tool B, and Tool C explicitly on your resume.** (list in imperative)
CORRECT: **List your field-specific software on your resume.** Tool A, Tool B, and Tool C are the tools recruiters at [Example Employer A](https://${domain}/graduate-employers/example-employer-a) specifically look for — candidates who name them by version are shortlisted ahead of those who write 'proficient in relevant software.'

Note: specific tool names, certification names, or platform names must never appear in the bold imperative. Named specifics always move to the plain text supporting sentence.

DIFFERENTIATION CHECK:
After writing all 3 to 4 bullets, ask for each one — could this bullet appear on a page for a different career path with only the nouns swapped? If yes, rewrite that bullet.

THE MOST COMMON FAILURE: Writing a bullet about listing software or tools on a resume. Every technical discipline can say this. It is not specific enough for any single career path.

If you find yourself writing a bullet about listing software on a resume, replace it with one of the following types of content that IS genuinely specific:
- A credential or card requirement specific to this career path
- A specific application window with named employers and real months from the Gemini research block
- A strategy specific to how hiring works in this field
- A professional body membership that signals commitment

EXAMPLE CAREER PATH — BULLET IMPERATIVE WORD LIMIT PATTERN:
The bold imperative for a bullet has repeatedly run over length for at least one bullet on nearly every career path in testing; use a tighter target and move the excess detail into the supporting content.

Example career path, credential-signal bullet: imperative target is "Join the relevant professional body before applying" (7 words). The supporting content must name the specific body, its membership cost, and which employers explicitly list it in graduate hiring criteria.

For every bullet across every career path, if the generated imperative exceeds its target word count, move the excess words into the supporting content sentence rather than lengthening the bold imperative.

EXAMPLE CAREER PATH — BULLET FAILURE MODE AND FIX:
A common bullet failure mode is packing strategy AND context AND consequence all into the bold imperative, making it 9-10 words.

WRONG IMPERATIVE (too long): **Target mid-tier and boutique firms before larger firms reject you.** (10 words)
CORRECT IMPERATIVE (action command only, 5-7 words): **Target boutique firms if you miss the first round.** [Example Employer C](https://${domain}/graduate-employers/example-employer-c) and similar boutique firms explicitly weight demonstrated capability over academic performance — a portfolio of applied work can outweigh a marginal academic result specifically at boutique firms, not at the largest firms.

CRITICAL — ACTION FIRST, NOT STATS FIRST:
Each bullet must lead with an action the student should take. Statistics support the action, they are never the point of the bullet. The test: if you remove the bold imperative and what remains is just a market statistic with no direction, rewrite it. Ask: does this bullet change what the student does next? If no, it is too passive.

CRITICAL — APPLICATION TIMING MUST COME FROM GEMINI RESEARCH:
The application timing bullet must use the specific months and employer names from the Gemini research block for this career path and country. Do not use a generic window unless the research confirms it. If Gemini returns different months or employer-specific windows, use those. If timing varies significantly by employer, name the specific employers and their specific windows.

FALLBACK IF GEMINI RETURNS NO TIMING DATA:
If the Gemini research block does not contain any application window timing, do not invent months. Instead write the timing bullet using the best available information from the SERP data block. If SERP data also has no timing, write the bullet around a different strategic action that IS supported by the Gemini research — for example a conversion rate, a cohort size, or a credential requirement. Never fabricate a specific month or date that does not appear in the research blocks.

CRITICAL — DIFFERENTIATION:
The bullets must feel completely different for every career path. The angle, the anxiety addressed, and the strategic intelligence must change. If your bullets for two different career paths feel structurally identical with different nouns swapped in, rewrite them.

LENGTH: Each bullet readable in under 10 seconds. Bold imperative 5 to 6 words. Supporting content one sentence, two maximum. Never a paragraph.

EMPLOYER LINKS IN BULLETS: Where employer names appear in bullets, hyperlink to their platform profile: [Employer Name](https://${domain}/graduate-employers/slug)

EMPLOYER NAME AND URL INTEGRITY RULE — NON-NEGOTIABLE:
Every employer hyperlink must pair the employer's own name with that employer's own URL. Never pair an employer name with a different employer's URL.

The employer data block provides a list of employer names and their corresponding platform profile URLs. Each name maps to exactly one URL. When you create a hyperlink for an employer, use only that employer's own URL from the data block.

This means:
- [Example Employer A](https://${domain}/graduate-employers/example-employer-a) is correct — name and URL are the same employer
- [Example Employer A](https://${domain}/graduate-employers/example-employer-b) is WRONG — the name says Employer A but the URL goes to Employer B

Before writing each employer hyperlink, verify the name you are writing matches the slug in the URL you are using. The slug is the last segment of the URL path. It must correspond to the employer named.

If you are uncertain which URL belongs to which employer, write the employer name as plain text rather than creating a potentially mismatched hyperlink. A plain text employer name is always better than a hyperlink pointing to the wrong organisation.`;

  const zone2 = `═══════════════════════════════════════════════════════════════
RESEARCH DATA
═══════════════════════════════════════════════════════════════

## GEMINI MARKET RESEARCH — HYPERLINKED FACTS
Each fact below is already formatted as a markdown hyperlink: [sentence](url)
RULES:
- In Para 2: embed exactly ONE Gemini fact as an inline hyperlink. The fact sentence becomes the anchor text. Do not paraphrase it.
- In the quick action bullets: use specific months, dates, or numbers from this block, especially for the application-timing bullet.
- In FAQs: a Gemini figure is acceptable only if clearly attributed to its source and year, and only if it does not contradict the platform's own salary table for the same discipline.
- DO NOT cite any statistics that are not in this block.

${geminiStats}

## SERP RESEARCH — "${keyword}" in ${country}
Top 10 ranking pages:
${organicList}

People Also Ask:
${paaList}

Related searches: ${relatedList}

## REDDIT — STUDENT INSIGHTS
${redditSnippets}

## PLATFORM DATA — USE EXACTLY AS PROVIDED
// Replace this whole block with real data from your own data layer. The production
// version calls a data-layer module (see pipeline/prosple.js) that returns:
// employers      -- array of "[Name](url)" strings, pre-formatted for the model to
//                    paste verbatim, never invented by the model
// salaryData     -- { intern, grad } salary range strings, pre-built into a markdown
//                    table in code so the model can never improvise figures
// salienceWords  -- array of field-specific vocabulary strings for this career path
// cityPages      -- array of "[City Name](url)" strings for the city table section
// serpResults    -- from pipeline/serp.js
// redditResults  -- from pipeline/reddit.js
// geminiResearch -- from pipeline/gemini.js
Career Path: ${careerPath}
Keyword Career Path: ${keywordCareerPath}
Platform: https://${domain}
broadEngineering: ${broadEngineering}

EMPLOYERS — every employer name in your output must use the exact hyperlinked markdown format below. Never write an employer name as plain text anywhere in the article:
${employerList}

EXCEPTION FOR PARA 2: this employer-hyperlinking rule does not apply inside Para 2. Para 2's one hyperlink must point to an external source (see the EXTERNAL URL RULE below) — never to a platform employer profile from this list. If an employer named in Para 2 has no external source backing the specific claim being made, write that employer's name as plain text in Para 2 rather than linking it to its platform profile. The platform employer link for that same employer still belongs everywhere else on the page — types table, bullets, employer skills section, application stages, and FAQs.

SALARY DATA — paste this table exactly in section 9. Do not change any figures. Do not add rows. Do not use any other salary source:
${resolvedSalaryTable}

CITY PAGES — if this is a table, paste it exactly under the "${cityHeading}" heading in section 7, including every row with no truncation. Do not alter any link text or URLs. If this is the "No verified city pages available" message instead, omit section 7's city table entirely:
${cityTable}

PAGE URL (reference for constructing role title links): ${prospleData.page_url}
Role title link pattern: ${roleLinkPattern}`;

  const zone3 = `WRITING CRAFT — PART 1: NARRATIVE THREAD AND HOOK QUALITY

This section governs the most fundamental dimension of writing quality: whether the page reads as one coherent argument or as a series of disconnected sections. Read this entire section before writing a single word. The structural rules tell you what sections to produce. These craft rules tell you how to make every word in every section serve the same underlying purpose.

═══════════════════════════════════════════
THE MOST IMPORTANT RULE ON THIS PAGE:
The hook is the thesis. Every section is evidence.
═══════════════════════════════════════════

This is not a metaphor. It is a literal description of how the page must be constructed. The hook raises one specific question in the student's mind. Every section that follows — Para 2, bullets, types table, employer skills, city table, application stages, salary table, career progression, FAQs — must answer that question from a different angle. If any section does not answer the hook's question, that section is disconnected from the page's argument and will feel like filler.

─────────────────────────────────────────
THE SELF-CHECKING MECHANISM
─────────────────────────────────────────
This is the most important tool you have for maintaining narrative coherence. Use it without exception on every page you write.

STEP 1: Write the hook.
STEP 2: Immediately convert the hook into the question it raises in a student's mind. Write this question down explicitly. The question is not what you think the page is about — it is the question a student would ask after reading the hook.

STEP 2A — THE BULLET DIMENSION LOCK (mandatory structural constraint, not optional):

This constraint must be applied mechanically before writing bullet 1, 2, 3, and 4. It is not a suggestion. It is a structural rule that overrides the model's natural tendency to expand on the hook's strongest point.

BEFORE WRITING EACH BULLET, complete this sequence:

Step A: Assign the hook one of these five named dimensions. Use only these five labels:
   - TIMING: the hook states when to apply, which window, how early, which month, which week, or any deadline
   - CREDENTIAL SIGNAL: the hook states what qualification, body membership, or pathway commitment to signal
   - TECHNICAL PROOF: the hook states what evidence of skills, tools, or methods to show
   - STRATEGY: the hook states which employers to target, which pathway to take, or what most students get wrong
   - MARKET MECHANISM: the hook reveals how the market works, a hidden truth, or a structural reality

Step B: List which dimensions all previous bullets have already addressed.

Step C: The bullet you are about to write must address a dimension that has NOT been used by the hook or any previous bullet. If you cannot find an unused dimension, you have too many bullets and must cut one.

OWNERSHIP RULES — these apply without exception:

Rule 1: The hook always owns the MARKET MECHANISM dimension. No bullet may use MARKET MECHANISM as its primary dimension. Bullets provide practical responses to the market mechanism -- they do not restate it.

Rule 2: If the hook contains ANY specific timing language -- a month, a week, a specific deadline, a specific window, a specific period (e.g. "week one," "by March," "before August," "within a fortnight") -- then the hook also owns the TIMING dimension. No bullet may use TIMING as its primary dimension on that page. A bullet may reference timing in its plain text supporting sentence as evidence, but the bold imperative must address a different dimension.

Rule 3: If the hook does NOT contain specific timing language, the TIMING dimension is available for bullets to use. Check the hook carefully -- "apply early" is not specific timing, but "apply by March" is. If in doubt, TIMING is available.

DIMENSION ASSIGNMENT EXAMPLES:

These examples illustrate how to assign dimensions and which dimensions are available or unavailable for bullets on a given page. They describe the principle — do not use any wording from these examples in your generated content. Generate fresh wording each time.

Example 1 — A hook that owns TIMING:
A hook that states specific timing information (a month, a week, a specific window, a specific deadline, or a comparison between two time periods) owns the TIMING dimension. When TIMING is owned by the hook, no bullet may use TIMING as its primary dimension. The model must identify a different dimension for each bullet.
How to detect TIMING ownership: If you can answer the question "when should I apply?" by reading only the hook, TIMING is owned.
Available bullet dimensions when hook owns TIMING: CREDENTIAL SIGNAL, TECHNICAL PROOF, STRATEGY.
Not available: TIMING, MARKET MECHANISM.

Example 2 — A hook that owns MARKET MECHANISM only (no timing stated):
A hook that reveals how the market works without stating any specific timing information owns only the MARKET MECHANISM dimension. All other dimensions remain available for bullets, including TIMING.
How to detect no TIMING ownership: If reading the hook does not tell you when to apply, TIMING is available.
Available bullet dimensions when hook owns only MARKET MECHANISM: TIMING, CREDENTIAL SIGNAL, TECHNICAL PROOF, STRATEGY — all four are available.
Note: This is why a TIMING bullet is correct and necessary on some pages — it depends entirely on whether the hook already stated timing.

Example 3 — A hook that owns STRATEGY:
A hook that reveals which employers to target, which pool to compete in, or what strategic choice a student must make owns the STRATEGY dimension. No bullet may use STRATEGY as its primary dimension on that page.
How to detect STRATEGY ownership: If the hook answers the question "which employers should I target or avoid?" or "which pathway should I choose?", STRATEGY is owned.
Available bullet dimensions when hook owns STRATEGY: TIMING, CREDENTIAL SIGNAL, TECHNICAL PROOF.
Not available: STRATEGY, MARKET MECHANISM.
Important: A bullet that names a specific employer segment to target or avoid is using STRATEGY even if it frames itself as a timing or proof recommendation. Check the underlying action the bullet is directing — if it is fundamentally about which employers to pursue, it is STRATEGY.

AFTER WRITING ALL BULLETS — dimension listing:
Write out the dimension of each element explicitly before finalising:
Hook dimension: [state the dimension]
Bullet 1 dimension: [state the dimension]
Bullet 2 dimension: [state the dimension]
Bullet 3 dimension: [state the dimension]
Bullet 4 dimension (if present): [state the dimension]

If any two entries in this list share the same dimension label, or if any bullet's dimension matches the hook's dimension, rewrite the duplicate bullet to address an unused dimension.

STEP 3: Before writing each section, ask: "Is this section answering that question?"
STEP 4: If the answer is no, either rewrite the section so it answers the question or reconsider whether the hook is correct.
STEP 5: After completing the full page, read it back and verify that every section answers the hook's question from a different angle.

THE MECHANISM FULLY APPLIED — WORKED EXAMPLE:

Hook written: "Graduate hiring in Example Field is dominated by a structured intern-to-grad conversion pipeline, not by open graduate applications."

Hook converted to question: "If most graduate roles are filled through this conversion pipeline — how does that mechanism work, who controls it, and what do I need to do to get on the right side of it?"

Section-by-section check:
Para 2: A specific employer's application-window fact, hyperlinked to an external source. ANSWERS THE QUESTION — proves the mechanism is real and shows when it opens.
Bullets: Timing, credential signal, technical proof, strategy. ANSWERS THE QUESTION — tells the student what to do to get on the right side of the mechanism across four distinct dimensions.
Types table: Sub-disciplines with different firms and pathways. ANSWERS THE QUESTION — shows the full landscape of the mechanism the hook described.
Employer skills: What gatekeepers look for in candidates. ANSWERS THE QUESTION — tells the student what the mechanism's gatekeepers evaluate.
City table: Where opportunities exist geographically. ANSWERS THE QUESTION — shows where the mechanism operates geographically.
Application stages: How to navigate the process month by month. ANSWERS THE QUESTION — tells the student how to move through the mechanism.
Salary table: What getting through the mechanism is worth financially. ANSWERS THE QUESTION — tells the student the value of succeeding.
Career progression: Where success through the mechanism leads over time. ANSWERS THE QUESTION — tells the student the long-term consequence of getting in.
FAQs: Honest answers to the questions students ask about the mechanism. ANSWERS THE QUESTION — addresses the uncertainties that remain after reading everything above.

Every single section is answering the same underlying question from a different angle. This is why the page feels like one coherent argument rather than nine disconnected sections.

THE MECHANISM APPLIED TO A FAILURE — WORKED EXAMPLE:

Hook written: "Graduate programmes in Example Field open in March and shortlist on a rolling basis. Applications submitted after fortnight two compete for fewer than 30% of available interview slots."

Hook converted to question: "If the real deadline is two weeks after programmes open — what do I need to do in those two weeks and how do I prepare before then?"

Section-by-section check:
Bullet 1: "Apply in week one of programme opening." FAILS — the hook already answered this. The student was told the same timing instruction twice in three sentences. Bullet 1 must answer a different dimension of the question.

What bullet 1 should have done: answer a dimension the hook did not cover. The hook answered WHEN. Bullet 1 should have answered WHAT to signal, WHAT to prove, or WHICH strategy to use. For example, a credential-signal bullet that answers what to prepare in the two weeks before the window opens, which the hook did not cover.

This is how the self-checking mechanism identifies failure: the hook answered the timing question, so the bullet that also answers the timing question is not adding anything the hook did not already say.

─────────────────────────────────────────
THE THREE TESTS FOR HOOK QUALITY
─────────────────────────────────────────
A hook must pass all three tests simultaneously. Passing two out of three is still a failure. Apply all three tests to every hook before finalising it.

─────────────────────────────────────────
TEST 1 — THE INFORMATION VALUE TEST
─────────────────────────────────────────
Ask: Could the student have written this sentence themselves before reading the page? If yes, the hook has no information value and must be rewritten.

The information value test identifies hooks that describe rather than reveal. Describing the market tells the student what they already suspected. Revealing the market tells them something they could not have predicted.

FAILS THE TEST — DESCRIPTION:
A sentence fails this test if it describes a market characteristic the student already suspected before reading, such as "competitive", "requires technical skills", "uses internship pipelines", or "offers good career prospects." Ask: "Would a student who has already searched Google for this keyword have known this?" If yes, the hook fails the test. Rewrite by identifying the specific hidden mechanism, threshold, or process that the student could not have predicted.

PASSES THE TEST — REVELATION:
A sentence passes this test if it tells the student something genuinely new about how the market works — something specific to this career path and country that changes what they do next. The test: ask a student who has never read this content type before to predict what the hook says before reading it. If they predict it correctly, the hook fails. If they cannot predict it, the hook passes.

─────────────────────────────────────────
TEST 2 — THE LANGUAGE TEST
─────────────────────────────────────────
Ask: Does every word in this hook earn its place? Remove every vague qualifier, every hedge, every word that adds length without adding meaning.

Strong hooks use concrete nouns, active verbs, and specific quantities or names. Weak hooks use vague qualifiers (often, various, many, typically, generally), passive constructions, and abstract categories.

LANGUAGE DIAGNOSIS — apply this to every word in your hook:
- Is this noun concrete and specific? Replace abstract nouns (employers, opportunities, roles) with specific named entities where possible.
- Is this verb active and precise? Replace passive constructions (are filled, are assessed, are recruited) with active ones (screen out, fill before, allocate centrally, open in March).
- Does this qualifier add meaning? Candidates for removal include: often, various, many, typically, generally, some, certain, most. If removing the word changes nothing about the meaning, remove it.
- Is this sentence doing one job? If a sentence makes two distinct claims, split it or cut the weaker one.

After diagnosis: Read your hook aloud. Count the number of words that add no specific information. Each one is a candidate for removal. The hook should be shorter and more precise after this test.

THE CONTRAST STRUCTURE:
"X is not Y — it is Z" is the strongest hook structure when the revelation involves correcting a student misconception. Use it when the hook is most powerful as a correction:
"Graduate internships in Example Field are not work experience — they are the primary mechanism through which firms decide who gets graduate offers."

The contrast structure works because it first names what the student incorrectly believes, then corrects it. The correction is more memorable because the incorrect belief was named explicitly.

─────────────────────────────────────────
TEST 3 — THE COHERENCE TEST
─────────────────────────────────────────
Ask: Is this hook about the exact thing this page is about — not a broader category of it?

If the page is about a specific career path in a specific country, the hook must reveal something about that career path specifically. A hook about the broader field generally, or about the country's job market generally, fails the coherence test even if it passes the information value and language tests.

The coherence test also applies between the hook and the page keyword. If the keyword is broad and covers all disciplines, the hook must reflect that broad scope. A hook that narrows to one discipline when the keyword is broad fails the coherence test because it makes a promise (this page is for the whole field) that the content does not keep (this page is only for one discipline).

COHERENCE TEST FOR BROAD KEYWORDS:
When the keyword covers a broad category, the hook must explicitly address the breadth of that category. It must reveal something about how the broad category works that a student could not have predicted.

COHERENCE TEST FOR SPECIFIC KEYWORDS:
When the keyword is specific, the hook must reveal something specific to that exact market — not to the broader field generally.

─────────────────────────────────────────
THE HOOK SENTENCE 2 RULE
─────────────────────────────────────────
Sentence 2 of the hook must raise the stakes of sentence 1. It must not restate sentence 1 in different words. It must add new information — specifically the consequence or implication that makes sentence 1 matter to the student personally.

THE STAKES-RAISING TEST:
Remove sentence 2. Does sentence 1 still fully communicate the hook's point? If yes, sentence 2 is not doing its job. Sentence 2 must add something that changes what the student understands after reading it.

CORRECT SENTENCE 2 STRUCTURES:

Structure A — Names the personal consequence:
Sentence 1 states the market mechanism. Sentence 2 names the specific personal consequence for the student who does not understand the mechanism. The consequence must be concrete and specific to this career path — what they lose, what they compete for, or what happens to their application. Never state the consequence generically. Name the specific disadvantage in terms of pool size, offer type, or timeline.
Direction: After sentence 1 states the mechanism, sentence 2 must answer the question: "What happens to a student who does not know this?" The answer is the consequence sentence. Generate fresh wording specific to this career path — do not reuse phrasing from any example in this prompt.

Structure B — Names the implication that changes behaviour:
Sentence 1 states the market mechanism. Sentence 2 states the specific implication that changes what the student must do this week or this month. The implication must be specific enough that the student knows exactly what to do differently after reading it.
Direction: After sentence 1 states the mechanism, sentence 2 must answer the question: "What does the student need to do differently because of this?" The answer must be specific to this career path — not "apply early" or "prepare thoroughly" but the exact behavioural change this market mechanism requires. Generate fresh wording specific to this career path — do not reuse phrasing from any example in this prompt.

Structure C — Names the hidden process the student did not know existed:
Sentence 1 corrects a student misconception about how the market works. Sentence 2 reveals the actual process that was operating while the student held the incorrect belief — the real mechanism behind the market that the student must now understand to act correctly.
Direction: After sentence 1 corrects the misconception, sentence 2 must answer the question: "So what is actually happening instead?" Name the specific process, system, or timeline that the student did not know about. Include at least one concrete detail (a month, a percentage, a named body, a specific stage in the process) that makes the revelation actionable. Generate fresh wording specific to this career path — do not reuse phrasing from any example in this prompt.

WRONG SENTENCE 2 STRUCTURES:

Structure X — Restates sentence 1 in different words:
This failure occurs when sentence 2 expresses the same information as sentence 1 using synonyms or a slightly different frame. The student learns nothing new from reading sentence 2.
How to detect this failure: Remove sentence 2. Does sentence 1 still fully communicate the hook's point? If yes, sentence 2 is restating not raising stakes.
Direction to fix: Ask what NEW information sentence 2 adds. If you cannot name one piece of new information that did not exist in sentence 1, rewrite sentence 2 using Structure A, B, or C above.

Structure Y — Adds context instead of stakes:
This failure occurs when sentence 2 provides background information about the market rather than naming the personal consequence or implication for the student. Context belongs in Para 2 where it is sourced. The hook is for revelation, not background.
How to detect this failure: If sentence 2 could be moved to Para 2 without losing anything from the hook, it is providing context not raising stakes.
Direction to fix: Remove the context. Replace with a sentence that names specifically what the student wins or loses based on whether they understood sentence 1.

Structure Z — Explains sentence 1 instead of building on it:
This failure occurs when sentence 2 explains WHY sentence 1 is true rather than naming the consequence of sentence 1 being true. Explanation belongs in the types table or employer skills section. The hook must move forward, not explain itself.
How to detect this failure: If sentence 2 begins with "This is because..." or "The reason for this is..." or "This happens because..." or any equivalent explanatory opener, it is explaining not raising stakes.
Direction to fix: Ask what CONSEQUENCE follows from sentence 1 being true. State that consequence as sentence 2 instead of the explanation.

─────────────────────────────────────────
STATISTICS IN THE HOOK — NON-NEGOTIABLE
─────────────────────────────────────────
If the hook contains a specific statistic, percentage, or figure, it must be sourced with a hyperlink. There are no exceptions.

Unsourced statistics in the hook are more damaging than no statistic at all. A student who reads a specific percentage and cannot find a source for this figure will distrust every other claim on the page. The hook is the first thing they read. If the hook is untrustworthy, the page is untrustworthy.

Three options when a statistic strengthens the hook:
Option 1: Hyperlink it inline within the hook sentence: "[Only 5% of students in this field secure internships through open applications](source-url)" — the figure is sourced directly.
Option 2: Move it to Para 2 where the hyperlink format is mandatory. Remove the figure from the hook, make the hook's claim without the figure, then prove it with the sourced figure in Para 2.
Option 3: Remove the figure and make the hook's claim through specific named examples instead. A named employer's specific, verifiable process is more credible than an unsourced percentage.

NEVER state a figure in the hook without a source. This includes conversion rates, workforce sizes, programme sizes, acceptance rates, and application-to-offer ratios.

─────────────────────────────────────────
THE NARRATIVE THREAD ACROSS ALL SECTIONS
─────────────────────────────────────────
Once the hook is written and its question is identified, the narrative thread must run through every section. Here is what each section is doing in the argument and how it must connect to the hook's question:

Hook: Raises the question. States the hidden truth about how this market works.

Para 2: Provides the first answer to the question — external sourced proof that the mechanism is real. This is not a market overview. It is evidence that the hook's claim is true.

Bullets: Provide the practical answer to the question — what the student must do differently because of the hook's truth. Each bullet addresses a different dimension of the practical answer.

Types table: Maps the landscape the hook described. If the hook reveals that the market has different disciplines or tiers, the types table shows what those disciplines or tiers look like in practice.

Employer skills: Answers the question from the employer's perspective. What do the gatekeepers in this market look for? How does the hook's mechanism shape what employers evaluate?

City table: Answers the question geographically. Where in this country does the mechanism the hook described operate?

Application stages: Answers the question procedurally. How does a student navigate the mechanism the hook described, step by step?

Salary table: Answers the question financially. What is success through the mechanism worth in this market?

Career progression: Answers the question temporally. Where does success through the mechanism lead over time?

FAQs: Answers the remaining questions a student holds after reading all of the above. What uncertainties remain about the mechanism after the student has read everything?

─────────────────────────────────────────
THE ONE-JOB RULE
─────────────────────────────────────────
Every paragraph in this page has one job. The job of each paragraph is determined by what the reader needs to know next — not by what you want to say, not by what feels relevant, not by what adds length.

If a paragraph is doing two jobs simultaneously — for example, naming the mechanism AND giving application timing advice in the same paragraph — one of those jobs belongs in a different section. Split the paragraph or cut the weaker job.

The sign that a paragraph is doing two jobs: you can remove one sentence from the paragraph and the remaining sentences still make complete sense. The removed sentence belonged somewhere else.

The sign that a paragraph is doing zero jobs: you can remove the entire paragraph and the page loses nothing. This happens most often in the framing sentences before tables — "here is how the market breaks down" does zero jobs because the heading already told the reader what the table contains.

─────────────────────────────────────────
FORCED VERSUS NATURAL WRITING
─────────────────────────────────────────
Forced writing answers questions that were not asked. Natural writing answers the question the reader is actually holding in their mind at that moment.

This is the most important distinction in writing craft and the hardest to encode as a rule. The self-checking mechanism (convert hook to question, verify each section answers it) is the practical tool for ensuring natural writing. But the principle is broader.

AT EVERY MOMENT OF WRITING, ask:
"What question is the reader holding in their mind right now, having just read what came before?"

Then answer that question — not a related question, not a question you find easier to answer, not a question that lets you include information you want to include. The exact question the reader is holding.

EXAMPLE OF FORCED WRITING:
The hook establishes that the field is not a single market. The reader's question after reading the hook is: "What are the different markets and how do they differ?" The framing sentence before the types table says: "This field is broad with opportunities across many sectors." This answers a different question (how broad is the field?) rather than the question the reader is actually holding (what are the different markets?). It feels forced because it is answering a question the reader was not asking.

EXAMPLE OF NATURAL WRITING:
The hook establishes that the field is not a single market. The reader's question is: "What are the different markets and how do they differ?" The framing sentence says: "Your discipline determines which firms recruit you, which month they open, and which evidence you need before you apply." This answers the exact question the reader is holding. It feels natural because the reader was already asking this question before the sentence began.

─────────────────────────────────────────
THE FINAL READING TEST FOR NARRATIVE THREAD
─────────────────────────────────────────
After completing the full page, perform this check in sequence:

1. Write out the hook's question in one sentence.

2. Read each section heading in order. For each heading, write one sentence explaining how that section answers the hook's question. If you cannot write that sentence, the section is not answering the hook's question and must be revised.

3. Read the page from beginning to end as a student would. At each section transition, ask: "Do I understand why I am now reading this section rather than the previous section?" If the answer is no, the transition between those sections has failed and must be strengthened.

4. After reading the complete page, ask: "Could any section of this page be lifted out and placed on a different career path page without sounding wrong?" If yes, that section is not specific enough to this page's narrative thread. It must be revised to belong only here.

5. Ask: "Is there any question the hook raised that the page did not answer?" If yes, identify which section should have answered it and revise that section.

WRITING CRAFT — PART 2: TRANSITIONS AND SECTION FLOW

The structural rules tell you what sections to produce and in what order. Part 1 told you how to make the hook and introduction work as a coherent argument. Part 2 tells you how to make every section after the introduction feel like a natural continuation of what came before — not a new topic that has been pasted in, but the next logical step in one continuous argument.

Read this entire section before writing anything beyond the quick action bullets. The transitions between sections are as important as the sections themselves. A page with excellent sections connected by poor transitions reads as disconnected and assembled. A page with good sections connected by strong transitions reads as written.

═══════════════════════════════════════════
THE CORE PRINCIPLE OF SECTION FLOW:
Each section creates a small question the next section answers.
═══════════════════════════════════════════

The hook creates the big question. Para 2 partially answers it. The bullets begin answering it with actions. Each subsequent section completes one more layer of the answer. When a section does not create a question the next section answers, the transition between them has failed and the reader will feel a jolt — the sense that a new topic has started without warning.

─────────────────────────────────────────
THE LOAD-BEARING TRANSITION RULE
─────────────────────────────────────────
A transition tells the reader WHY the next section exists. It is not a label. It is not an introduction. It is the logical connection between what you just finished saying and what you are about to say.

THE TEST FOR A LOAD-BEARING TRANSITION:
A transition is load-bearing if removing it causes the reader to feel confused or jarred when moving from one section to the next. A transition is decorative (and therefore useless) if removing it causes the reader to feel nothing — they simply continue reading without noticing the absence.

THE LABEL VS THE TRANSITION:
A label names what the section contains. A transition explains why the student needs the section now, having read what came before.

LABEL (wrong): "Here is how the market breaks down."
This tells the reader nothing they could not infer from the heading. The heading already says what the table is about. The framing sentence adds zero information.

TRANSITION (correct): explain why the student needs to understand the different disciplines or tiers now, having just read the bullets. The framing sentence must connect the hook's insight directly to why the types table exists.
(Generate fresh wording specific to this career path — do not use this description as template text.)

THE TWO-PART FRAMING SENTENCE TEST:
Every framing sentence before the types table and employer skills section must do two things simultaneously:

1. CREATE A SPECIFIC EXPECTATION that the section will fulfil — not a general expectation ("here are the employer types") but a specific one ("the section will show you the different pathways and why each has different conversion rates").

2. CONNECT BACK TO THE HOOK OR BULLETS — the framing sentence must reference something specific from the introduction. The student should recognise the connection between the framing sentence and something they already read. If the framing sentence could have been written before the hook was drafted, it is not connecting back.

TEST ONE: Remove the framing sentence. Does the reader understand less about why the section exists? If yes, the framing sentence is load-bearing. If no, it is a label — rewrite it.

TEST TWO: Could this framing sentence be placed before a different section on a completely different career path page without sounding wrong? If yes, the framing sentence is generic — rewrite it.

─────────────────────────────────────────
THE QUESTION-ANSWER CHAIN
─────────────────────────────────────────
Map the question-answer chain for this specific page before writing any section. Here is what each section creates and answers:

SECTION: Quick action bullets
QUESTION THEY CREATE: "Okay, I know what to do differently — but which specific discipline, firm type, or format should I be targeting? What does the landscape actually look like?"
SECTION THAT ANSWERS: Types table

SECTION: Types table
QUESTION IT CREATES: "I can see the different disciplines and what they do — but what are these employers actually looking for when they screen applications? What distinguishes a shortlisted candidate from a rejected one?"
SECTION THAT ANSWERS: Employer skills

SECTION: Employer skills
QUESTION IT CREATES: "I understand what employers want — but where are these opportunities actually concentrated? Which cities or regions have the most activity in this discipline?"
SECTION THAT ANSWERS: City table

SECTION: City table
QUESTION IT CREATES: "I know where the opportunities are — now how do I actually apply? What is the step-by-step process and when does each stage happen?"
SECTION THAT ANSWERS: Application stages

SECTION: Application stages
QUESTION IT CREATES: "I know the process — so what will I actually earn if I get through it? Is this worth the effort?"
SECTION THAT ANSWERS: Salary table

SECTION: Salary table
QUESTION IT CREATES: "I can see the salary range — but how do I get to the upper end of that range? What does progression look like beyond the starting point?"
SECTION THAT ANSWERS: Career progression

SECTION: Career progression
QUESTION IT CREATES: "I understand the pathway — but I still have specific questions this page has not yet answered."
SECTION THAT ANSWERS: FAQs

IMPORTANT: Before writing each section, ask yourself: "Does the section before this one create the question I am about to answer?" If the preceding section does not create that question, either the preceding section needs a stronger ending or the transition into this section needs to explicitly name the question before answering it.

─────────────────────────────────────────
FRAMING SENTENCE RULES FOR THE TYPES TABLE
─────────────────────────────────────────
Position: the framing sentence appears on the line immediately before the ## What Types of... heading, as part of the content flow from bullets to table. It is never positioned after the heading.

The framing sentence before the types table H2 is placed immediately before the H2 heading. It is a single sentence (occasionally two sentences if genuinely needed). It appears after the bullets and before the types table heading.

WHAT THE FRAMING SENTENCE MUST DO:
It must explain why the student needs to understand the different discipline types NOW — having just read the hook, Para 2, and the bullets. The bullets told the student what to do. The framing sentence explains what they need to know first before they can do those things effectively.

The framing sentence must answer this question: "Why does the student need this table in order to act on what the bullets just told them?"

WHAT THE FRAMING SENTENCE MUST NOT DO:
It must not simply introduce the table. It must not say "there are several types of X" or "the X market is divided into different sectors." These are labels. The framing sentence must be a transition that earns the table's existence.

EXAMPLE CAREER PATH — TYPES TABLE STRUCTURE RULE:
Between the last quick action bullet and the ## What Types of... heading, there must be exactly ONE sentence functioning as the framing sentence. A standalone orientation paragraph must not appear in this position.

Do not generate any of the following as a standalone paragraph in this position:
- Any sentence beginning with "Your [X]..."
- Any sentence beginning with "Your [X] and [Y] together determine..."

If this orientation content must appear, it must be merged into the framing sentence itself as one combined sentence. It must not appear as a separate paragraph above the framing sentence.

For your career path: the framing sentence must make explicit that the axis the hook established (a specialisation, a firm tier, a pathway, a product area) determines everything the student needs to prepare next — which firms recruit them, which evidence they need, and what the graduate programme covers. Generate fresh wording that connects the hook's specific mechanism to the practical consequence of understanding the landscape before applying.

NO FLOATING ORIENTATION PARAGRAPH: a "Your [X] determines..." sentence (naming what the student's choice of specialty, product area, practice area, tech stack, or firm tier determines) may not appear as a standalone paragraph sitting between the quick action bullets and the types table H2 heading. This content is genuinely useful but a floating paragraph in this position is neither a bullet (no bold imperative) nor a framing sentence (does not sit immediately before the H2) nor part of the hook — it makes the page feel assembled rather than written. This content must become EITHER Bullet 4 (the fourth quick action bullet, formatted as a bold imperative plus supporting text) OR the framing sentence immediately preceding the types table H2 heading — never a freestanding paragraph. This orientation-sentence pattern recurred across multiple career paths during testing; the preferred integration is folding this content into the types table framing sentence, not into Bullet 4.

─────────────────────────────────────────
FRAMING SENTENCE RULES FOR THE EMPLOYER SKILLS SECTION
─────────────────────────────────────────
Position: the framing sentence appears on the line immediately before the ## What Do... heading, as part of the content flow from types table to employer skills. It is never positioned after the heading.

The framing sentence before the employer skills H2 is placed immediately before the H2 heading. It is a single sentence (occasionally two). It appears after the types table and before the employer skills heading.

WHAT THE FRAMING SENTENCE MUST DO:
It must reframe what the student is afraid of and reveal what the gatekeeper is actually looking for. The student comes to this section afraid that their qualifications are not sufficient. The framing sentence must correct this fear by naming the specific filter that actually operates — which is almost never what the student assumes it is.

The framing sentence must answer this question: "What is the student afraid of, and what is the employer actually looking for instead?"

THE GOLD STANDARD EMPLOYER SKILLS FRAMING SENTENCE STRUCTURE:
[What recruiters are NOT looking for] + [What they ARE looking for instead].

The first clause names and dismisses the student's fear. The second clause names the actual filter. Together they reframe the student's entire approach to the employer skills section.

EXAMPLE CAREER PATH — EMPLOYER SKILLS FRAMING DIRECTION:
Student's fear: the gatekeeper is filtering on grades and degree prestige.
Real filter: specific evidence that the student has applied field-relevant skills outside a classroom — named tools used on real projects, specific standards or methods knowledge, results from coursework applied to real problems.
The framing sentence must reveal: the specific type of evidence (named tools, named standards, real project outcomes) that distinguishes shortlisted from rejected candidates at the resume review stage.
The framing sentence must not say: anything generic about technical skills or qualifications — these are labels not the actual filter.
Generate fresh wording — do not reproduce these direction phrases in the framing sentence itself.

For all other career paths:
Identify what the student fears the gatekeeper is assessing — almost always grades, degree prestige, or work experience volume. Then identify what the gatekeeper is actually assessing — almost always specific demonstrable evidence of field-specific capability that cannot be faked through volume or credentials alone. Generate a framing sentence that names both sides of this contrast. The student's feared filter is dismissed in the first clause. The real filter is named in the second clause with enough specificity that the student knows exactly what to build. Generate fresh wording specific to this career path — do not use generic phrases.

WHAT THE EMPLOYER SKILLS FRAMING SENTENCE MUST NEVER DO:
- Say "here are the key things employers look for" — this is a label
- Say "employers in this field value the following qualities" — this is a label
- Use the word "qualities," "attributes," or "characteristics" — these are generic words that signal mechanical content
- Be removable without the reader noticing — if removal causes no jarring, it is not load-bearing

─────────────────────────────────────────
CITY TABLE TRANSITION
─────────────────────────────────────────
The city section has no framing sentence in the traditional sense — it has an H2 heading (statement format, not a question) and one to two sentences of geographic context before the city link table.

THE GEOGRAPHIC CONTEXT SENTENCES MUST BE SPECIFIC AND MUST ADD NEW INFORMATION:
The one to two sentences before the city table must name the actual geographic concentration of this specific career path in this specific country. They must not say "opportunities exist across multiple cities" or "this career path has presence in major metropolitan areas." These are labels.

CRITICAL: The geographic context must not repeat geographic information the hook already stated. If the hook named specific cities, the geographic context must add a different geographic dimension — the spread across states, the concentration by project type, the regional vs metropolitan split, or the employer type distribution by city. Repeating the hook's geographic content wastes the student's attention.

The geographic context must answer: "Where specifically is the concentration of this career path, and why is this geographic pattern relevant to how the student should apply? And what does this add beyond what the hook already told me?"

DIRECTION FOR GEOGRAPHIC CONTEXT SENTENCES:
Name the specific cities, states, or regions where this career path's employer concentration is highest and explain the practical implication for where the student should focus their application effort. Ensure the geographic context adds something the hook did not already state.

─────────────────────────────────────────
APPLICATION STAGES TRANSITION AND ENDING
─────────────────────────────────────────
The application stages section has no framing sentence — it begins directly with the H2 heading and then the five stages. The H2 question itself ("How Do You Apply for X in Y?") is the transition from the city table.

However the application stages section ENDS in a way that matters. The last stage (typically Stage 5 — offer and conversion) creates a natural question: "So what will I actually earn when I get through all of this?" This question must be implicitly present in how Stage 5 is written — the student should finish Stage 5 thinking about outcomes, not about process.

DIRECTION FOR STAGE 5 ENDING:
Stage 5 must not end on a procedural note (e.g. "you will be notified of the outcome by email within two weeks"). It must end on an outcome note — naming what success through Stage 5 means for the student's career specifically. This creates the forward pull toward the salary table.

The Stage 5 ending must name: what a successful candidate has now secured, and implicitly, why the salary table that follows is the relevant next piece of information.

Generate fresh wording specific to this career path that ends Stage 5 on the outcome, not the process.

─────────────────────────────────────────
SALARY TABLE TRANSITION AND THE MARKET INSIGHT LINE
─────────────────────────────────────────
The salary table section has no framing sentence — it begins directly with the H2 question. After the salary table, two elements appear:

1. Source line (mandatory, always present)
2. 💡 Market Insight: [one sentence of insider salary context]

THE MARKET INSIGHT LINE IS A TRANSITION, NOT A SUMMARY:
The Market Insight line is not a summary of what the salary table showed. The student can read the salary table themselves. The Market Insight line must add something the table cannot show — the insider context that explains what drives variation within the range, and implicitly creates the question: "How do I get to the upper end of that range?"

WHAT THE MARKET INSIGHT LINE MUST DO:
It must name the specific factor that drives salary variation within this career path — not "experience" (too generic) but the specific credential, specialisation, employer type, or market that pushes candidates from the lower bound to the upper bound. This creates the question the career progression table answers.

DIRECTION FOR STRONG MARKET INSIGHT LINES:
Name the specific factor within this career path that drives variation from the lower bound to the upper bound of the range. Generic factors like "experience" or "firm size" are not acceptable. Name the specific credential, specialisation, employer type, or certification that creates the variation.

THE FORWARD PULL REQUIREMENT:
After reading the salary table and the Market Insight line, the student must naturally wonder: "How do I achieve the outcome the Market Insight line describes?" This is the question the career progression table answers. If the Market Insight line does not create this question, the student will experience the career progression table as a new topic rather than the natural answer to what the Market Insight line implied.

─────────────────────────────────────────
CAREER PROGRESSION TABLE TRANSITION AND ENDING
─────────────────────────────────────────
The career progression section begins directly with its H2 question. After the table, one sentence appears naming the key professional registration or credential for this career path and country.

THE CREDENTIAL SENTENCE IS A TRANSITION, NOT A FOOTNOTE:
The credential sentence after the career progression table is often written as a footnote — a piece of administrative information about what registration is required. This is wrong. The credential sentence must be written as the answer to the question the career progression table implicitly raised: "What is the single most important thing I can do to progress through this table faster?"

WHAT THE CREDENTIAL SENTENCE MUST DO:
It must name the specific registration, body, or qualification that is the gating requirement for progression in this career path — and state its practical implication for the student reading this page right now. The student should finish the credential sentence understanding what they need to do, not just what exists.

DIRECTION FOR STRONG CREDENTIAL SENTENCES:
Name the single most important professional registration or credential in this career path and state its practical implication for the student's progression through the career progression table — specifically which stage it gates and what happens to salary and role eligibility once it is obtained.

─────────────────────────────────────────
FAQs AS THE FINAL TRANSITION — ANSWERING WHAT THE PAGE CREATED
─────────────────────────────────────────
The FAQs are not a generic Q&A section. They are the answer to the specific questions the page itself created in the student's mind. After reading the hook, types table, employer skills, application stages, salary table, and career progression table, a student has specific questions that none of those sections answered directly. Those are the FAQ questions.

THE FAQ QUESTION SELECTION RULE:
Select FAQ questions that could only be asked by a student who has already read this specific page. A question that could have appeared before the student started reading is a generic question — it belongs on any careers website. A question that could only arise from reading this specific page is a page-specific question — it belongs here.

HOW TO IDENTIFY PAGE-SPECIFIC FAQ QUESTIONS:
After completing all other sections, list the specific claims the page has made that a student might want to verify, challenge, or extend:
- A claim from the hook that raises a follow-up question
- A claim from the employer skills section that raises a specific question about the student's situation
- A claim from the application stages that raises a timing question specific to this career path
- A salary range claim that raises a question about variation

These questions are page-specific. They cannot be answered by a student who has not read the page. They are the FAQ questions.

GENERIC FAQ QUESTIONS TO AVOID:
- "What is a [career path] role?" — generic, any student already knows
- "Is [career path] a good career?" — generic, no career page should answer this
- "What qualifications do I need for [career path]?" — generic, the types table already answered this
- "How much does [career path] pay?" — generic, the salary table already answered this

The FAQ section must not duplicate what the salary table, types table, or employer skills section already stated. Each FAQ answer must add new information the student cannot find elsewhere on this page.

─────────────────────────────────────────
THE EMPLOYER SKILLS BULLETS — SECTION-INTERNAL FLOW
─────────────────────────────────────────
The employer skills section contains four to five bullets. These bullets must not all follow the same sentence structure. If every bullet follows the same pattern (employer names what they want → candidate should show X evidence → because Y), the section feels generated rather than written.

SENTENCE STRUCTURE VARIATION ACROSS BULLETS:
Each bullet in the employer skills section must use a different sentence structure from the bullets adjacent to it. The following three structures must be distributed across the bullets — no two adjacent bullets may share the same structure:

Structure A — Lead with the employer filter:
Begin the bullet body with what the employer sees when they screen. The filter comes first. What the student should do comes second.
Direction: Name the specific thing employers look for at the resume or interview stage, then explain what evidence satisfies that filter. Do not begin with "employers value" — begin with the specific filter observation itself.

Structure B — Lead with the contrast:
Begin the bullet body by naming what students think the filter is, then correct it with what the filter actually is. The contrast comes first. The evidence that satisfies the real filter comes second.
Direction: Name what the typical student emphasises (grades, volume of experience, generic soft skills) and contrast it with what the employer's screening process is actually looking for. This structure works best for the bullet that addresses the biggest student misconception about this employer type.

Structure C — Lead with the consequence:
Begin the bullet body by naming what happens to candidates who do not have this evidence — the specific consequence at application stage. The evidence type comes second.
Direction: Name what rejection looks like for candidates who lack this evidence (screened at resume review, failed the technical test, not shortlisted after first interview), then explain what evidence prevents this outcome. This structure works best for the highest-stakes filter — the one that eliminates most candidates.

VARIATION RULE: After writing all employer skills bullets, confirm that no two adjacent bullets use the same sentence structure. If bullets 2 and 3 both lead with the contrast, one must be rewritten to use Structure A or Structure C.

─────────────────────────────────────────
THE FINAL SECTION FLOW CHECK
─────────────────────────────────────────
After completing the full page, perform this section flow check before finalising:

CHECK 1 — Framing sentence before types table:
Read the framing sentence. Ask: does it tell the student WHY they need this table now, having just read the introduction? Or does it simply label the table?
If it labels: it fails. Rewrite using the framing sentence direction for this career path.
If it connects the introduction to the practical need for the table: it passes.

CHECK 2 — Framing sentence before employer skills:
Read the framing sentence. Ask: does it reframe what the student fears the gatekeeper is assessing? Does it correct that fear by naming what the gatekeeper is actually looking for?
If it simply says "here are the key things employers look for": it fails. Rewrite using the employer skills framing direction for this career path.
If it names the student's fear and corrects it with the real filter: it passes.

CHECK 3 — Geographic context sentences before city table:
Read the one to two sentences. Ask: do they name the specific geographic concentration of this career path and explain why the concentration matters for the student's application strategy?
If they say "opportunities exist across major cities": they fail. Rewrite with the specific geographic reality.
If they name specific cities or states and explain the practical implication: they pass.
Additionally: Do the geographic context sentences add new information the hook did not already state? If the hook named specific cities, do the geographic context sentences add a different geographic dimension rather than repeating the same cities? If they repeat the hook's geographic content: rewrite to add the missing dimension.

CHECK 4 — Stage 5 ending:
Read the last sentence of Stage 5. Ask: does it end on the outcome the student has achieved, creating a natural question about compensation and progression?
If it ends on the process (notification timeline, decision format): it fails. Rewrite to end on the outcome.
If it ends on what the student has now secured and implicitly points toward the salary table: it passes.

CHECK 5 — Market Insight line:
Read the Market Insight line. Ask: does it name the specific factor that drives variation within the salary range for this career path? Does it implicitly create the question: "How do I get to the upper end of that range?"
If it summarises the table: it fails. Rewrite using the Market Insight direction for this career path.
If it names the specific internal driver and creates forward pull toward career progression: it passes.

CHECK 6 — Credential sentence:
Read the credential sentence after the career progression table. Ask: does it name the specific registration and state its practical implication for a student reading this page today?
If it reads as administrative information ("X registration is required to practise in this field"): it fails. Rewrite to name the practical implication for the student's progression and timing.
If it tells the student what they need to do and when: it passes.

CHECK 7 — Employer skills bullet sentence structure variation:
List the opening structure of each employer skills bullet (A, B, or C). Are any two adjacent bullets using the same structure?
Structure A = lead with the employer filter (the specific thing employers look for first)
Structure B = lead with the contrast (what students think vs what is real)
Structure C = lead with the consequence (what happens to candidates who lack this evidence)
If any two adjacent bullets share the same structure: rewrite one to use a different structure.
If no two adjacent bullets share the same structure: it passes.

CHECK 8 — FAQ questions are page-specific:
Read each FAQ question. Ask: could this question have been asked by a student who has NOT read this page?
If yes: the question is generic and must be replaced with a question that arises specifically from reading this page.
If no — the question could only arise from reading this specific page: it passes.

CHECK 9 — The full section flow:
Read the page from the types table through to the career progression table in one pass. At each section boundary, ask: "Do I understand why I am now reading this section rather than the previous one?"
If any boundary feels like a jolt — a new topic starting without preparation: the transition has failed. Identify which boundary caused the jolt and rewrite the ending of the previous section or the framing of the new section.
If every boundary feels like a natural continuation: the section flow passes.

WRITING CRAFT — PART 3: SENTENCE CRAFT WITHIN SECTIONS

Parts 1 and 2 covered the architecture of the page — the narrative thread, the hook quality, the transitions between sections. Part 3 covers what happens inside each section. Two pages can have identical structure and transitions and still read very differently depending on how the sentences are constructed within each section.

The rules in Part 3 govern sentence-level decisions: rhythm, variety, precision, the difference between a sentence that is technically correct and one that is genuinely good. These rules do not add new structural requirements — they govern the quality of writing within the structure already specified.

Read this entire section before writing any body text. The craft rules apply to every sentence in every section.

═══════════════════════════════════════════
THE CORE PRINCIPLE OF SENTENCE CRAFT:
Every sentence must earn its place by doing exactly one job.
A sentence that does two jobs simultaneously does neither well.
A sentence that does zero jobs must be cut.
═══════════════════════════════════════════

─────────────────────────────────────────
THE ONE-JOB RULE FOR SENTENCES
─────────────────────────────────────────
Every sentence in the page has exactly one job. The job is determined by where the sentence sits in the section and what the reader needs at that moment.

The jobs a sentence can do:
- State a fact the student did not know
- Name a specific consequence of that fact
- Give a concrete action the student should take
- Provide a specific named example that proves the preceding claim
- Create a question the next sentence will answer
- Answer a question the previous sentence created

A sentence is doing zero jobs when:
- It restates something the previous sentence already said
- It states something the student already knew before reading the page
- It adds a hedge or qualifier that changes nothing ("it is worth noting that..." / "it should be mentioned that...")
- It transitions without adding information ("moving on to..." / "the next area to consider is...")

A sentence is doing two jobs when:
- It makes a claim AND provides the evidence for that claim in the same clause, when the claim and evidence would each be stronger as separate sentences
- It names an action AND explains why the action matters AND provides an example, when three sentences would be more precise than one

THE COMPRESSION TEST:
Read every sentence and ask: if I removed this sentence, would the reader lose information they need? If yes, the sentence is earning its place. If no, cut it. Every sentence in this content must pass the compression test.

─────────────────────────────────────────
THE FORCED VS NATURAL TEST AT SENTENCE LEVEL
─────────────────────────────────────────
Parts 1 and 2 covered the forced vs natural distinction at the section and transition level. Part 3 applies it at the sentence level.

Natural writing answers the question the reader is holding in their mind at that exact moment — the question created by the previous sentence. Forced writing answers a question that was never asked.

THE SENTENCE-LEVEL TEST:
Before writing any sentence, identify the question the previous sentence created. Write the current sentence as the answer to that question. If the current sentence does not answer the question the previous sentence created, it is in the wrong place — either move it or cut it.

This is different from the compression test (which checks if a sentence adds any information) and the active student test (which checks if the information is actionable). The forced vs natural test checks whether the sentence is the RIGHT information at the RIGHT moment in the reading sequence.

EXAMPLE OF FORCED SENTENCE:
Previous sentence: "Two named employers both require a specific credential before accepting internship offers."
Forced next sentence: "The credential is issued by a registered training organisation." — This answers the question "what is the credential?" which is not the question the previous sentence created. The previous sentence created the question "so when do I need to get it and how?"
Natural next sentence: Direction — answer the timing and acquisition question: name when to get it relative to the application process and how long it takes to obtain. Do not answer a different question.

APPLYING THE TEST CONSISTENTLY:
After writing each sentence, read the one before it and ask: "what question does that sentence create?" Then read the current sentence and ask: "does it answer that question?" If it answers a different question, the sentence is forced. Move it to where its question is actually asked, or cut it.

─────────────────────────────────────────
SENTENCE RHYTHM AND VARIETY
─────────────────────────────────────────
Mechanical content has uniform sentence rhythm. Every sentence follows the same structure. The reader's eye begins to skim because nothing is surprising. Strong content varies rhythm deliberately — short sentences for emphasis, longer sentences for evidence and explanation, the occasional very short sentence to create a beat.

THE RHYTHM PATTERN:
Do not write three consecutive sentences of the same length or the same structure. After two sentences of similar length, the third must be noticeably shorter or noticeably longer.

After two long sentences (20+ words each): write a short sentence (under 12 words) that drives the point home.
After two short sentences (under 12 words each): write a longer sentence that provides the evidence or explanation those short sentences require.
After two sentences beginning with the same grammatical structure (e.g. two sentences beginning with "Candidates who..."): vary the opening of the third sentence.

THE EMPHASIS SENTENCE:
Every important claim in the content should be followed by a short, emphatic sentence that makes the reader pause. The emphasis sentence does not add new information — it drives the preceding claim into the reader's memory by restating it in the fewest possible words.

Direction for generating emphasis sentences: after a complex claim with multiple clauses, write the core of that claim in under 8 words. Do not use the same words as the complex sentence — restate the point, do not repeat it.

Example pattern (direction only — generate fresh wording):
Long sentence: states a nuanced market reality with named entities, specific thresholds, and consequences for different student profiles.
Short emphasis sentence: drives the essential point home in under 8 words. The consequence or the action that follows from the long sentence's claim — stripped to its essential truth.

─────────────────────────────────────────
THE SPECIFICITY LADDER: FIVE RUNGS
─────────────────────────────────────────
Every piece of information in this content can be placed on a specificity ladder from most vague (rung 1) to most specific (rung 5). Strong content operates at rung 4 or 5 as often as possible. Rung 1 and 2 content must be either elevated to rung 4 or 5, or cut.

THE FIVE RUNGS:

Rung 1 (must cut or elevate): Generic truth about any career
"Internships are a good way to gain experience."
"Networking is important in this industry."
"Employers value candidates with strong communication skills."

Rung 2 (must elevate): True for this career category but not this specific market
"This field is highly competitive in this country."
"Employers in this field look for technical skills."
"Firms in this field value attention to detail."

Rung 3 (acceptable, can be stronger): True for this career in this country
"Structured graduate programmes in this country run summer internship programmes."
"Internships in this field in this country require a specific credential."

Rung 4 (strong): Specific to this career, this country, and this employer type
"Two named employers both run 10-week summer programmes that begin in November and end in February."
"Two named employers both list a specific credential as a condition of offer acceptance."

Rung 5 (excellent): Specific to this career, this country, this employer, and this moment
"Employer A's summer programme typically runs from late November to late February and includes a dedicated module in week three."
"Employer B's internship programme has closed within 14 days of opening in recent intakes due to rolling shortlisting."

Note: rung 5 specificity must never come from a hardcoded calendar year. A sentence naming a specific year is not more specific than one using recurring framing — it is only more fragile. Achieve rung 5 through named employers, named tools, named standards, and named processes, not through dates that expire.

APPLYING THE SPECIFICITY LADDER:
Before finalising any section, read each sentence and assign it a rung number. Any sentence at rung 1 or rung 2 must be revised to rung 3 or above. The research blocks (Gemini, SERP, Reddit, employer data, city data) provide the material to elevate from rung 2 to rung 4 or 5. Use them. Target: at least 70% of sentences in each section at rung 4 or 5.

─────────────────────────────────────────
THE ACTIVE STUDENT TEST
─────────────────────────────────────────
This is the most important sentence-level test in the entire writing craft framework. Apply it to every sentence in the content.

THE TEST: After reading this sentence, does the student know something they can act on?

A sentence passes this test if it gives the student:
- A specific employer to research
- A specific credential to start building
- A specific month to mark in their calendar
- A specific skill to demonstrate
- A specific misconception to discard
- A specific choice to make

A sentence fails this test if it leaves the student in the same position they were in before reading it. A sentence that is factually correct, well-written, and grammatically sound can still fail this test if it does not give the student anything to do with the information.

THE PASSIVE INFORMATION TRAP:
The passive information trap occurs when a sentence provides interesting market information that the student cannot act on. Examples:

"This sector employs a very large workforce." — Interesting, not actionable.
"This field has grown significantly in recent years." — Interesting, not actionable.
"The relevant qualification is highly regarded by employers." — True, not actionable.

Elevated versions that pass the active student test:
Direction for elevation: take the passive information and ask "what does a student do differently knowing this?" The answer is the elevated sentence. The passive information becomes the evidence for the action, not the main claim.

APPLYING THE ACTIVE STUDENT TEST:
After every sentence, ask: what does the student do next having read this? If the answer is "nothing — they just know something," elevate the sentence until the answer is "they do something specific."

─────────────────────────────────────────
THE NEVER-START-WITH-SAME-WORD RULE — TWO LEVELS
─────────────────────────────────────────
LEVEL 1 — WITHIN A SECTION: no two consecutive sentences begin with the same word. If sentence one begins "Candidates who..." sentence two must begin differently.

LEVEL 2 — ACROSS BULLETS OR TABLE ROWS: no two consecutive bullets or table row cells begin with the same word or grammatical structure. If bullet one begins with a bold imperative starting "Apply...", bullet two's imperative must start with a different verb.

Before finalising any section with multiple sentences, bullets, or rows, scan the first word of each. If two consecutive units share a first word, rewrite one.

─────────────────────────────────────────
THE EVIDENCE SENTENCE RULE: THREE FORMS
─────────────────────────────────────────
Every claim must be followed immediately by evidence in one of these three forms:

Form 1 — Named example: A specific employer, programme, regulation, or standard by name, proving the claim through a real instance.

Form 2 — Specific sourced quantity: A number that comes from a citable source — a specific count, percentage, or range with attribution.

Form 3 — Specific consequence: What happens to the student who ignores the claim, stated concretely.

A claim followed by no evidence is a rung 2 or rung 3 sentence in disguise. Add evidence in one of the three forms or cut the claim.

─────────────────────────────────────────
TABLE CELL LENGTH RULES
─────────────────────────────────────────
Post-processing monitoring flags cells over 20 words. Prompt-level targets are stricter than the enforcement limit:

- Types table "What You'll Work On" column: 12 words maximum per cell (prompt target), 20 words hard limit (post-processing enforcement).
- Types table "Related Sector" column: one sector name, 5 words maximum.
- Types table "Similar Role Titles" column: maximum three titles, 15 words total.
- Career progression "Focus and Responsibilities" column: 20 words maximum, one clause only.

WRITING CRAFT — PART 4: FAQ TONE AND THE FINAL READING TEST

─────────────────────────────────────────
THE FOUR-SENTENCE FAQ FORMULA
─────────────────────────────────────────
Every FAQ answer contains exactly four sentences with specific jobs.

Sentence 1: Direct answer naming a specific entity. No preamble. The first word begins the answer to the question. No "Great question" or "This depends on several factors."
Sentence 2: Specific detail not already on the page. Must pass the redundancy test — if the sentence could be removed without cost to the answer, it failed.
Sentence 3: Practical action. Must pass the connection test — could this action have been written without reading sentences 1 and 2? If yes, it is generic advice masquerading as a practical action.
Sentence 4: Insider insight. Must fail the careers centre test — a university careers centre would NOT publish this sentence.

FOUR FAILURE MODES:
- Safe pivot: the answer pivots from the uncomfortable question to something easier to answer. Detection: the key noun from the question does not appear in sentence 1.
- Credential dump: the answer lists information already on the page. Detection: no new information in sentences 2 through 4.
- Percentage without context: a percentage is given without naming what determines which group the student belongs to. Detection: a percentage appears but no action moves the student from the negative group to the positive group.
- Generic sentence 4: sentence 4 reads like advice a university careers adviser would give. Detection: the careers centre test passes (they would publish it). Rewrite to fail the test.

THREE VOICE TESTS — every FAQ answer must pass all three:
- Careers centre test: a university careers centre would not publish this specific answer.
- Mentor test: the answer reads like something a mentor with direct market experience would tell the student, not something scraped from a careers site.
- Redundancy test: no sentence in the answer could be removed without cost.

─────────────────────────────────────────
THE FIVE SIGNALS OF A COMPLETE PAGE
─────────────────────────────────────────
Reader-experience signals that automated checks cannot catch. Each stated as what the reader experiences, not what the writer did.

1. The hook creates urgency. The reader wants to keep reading after the hook.
2. The bullets feel different from each other. Each bullet addresses a distinctly different problem.
3. The employer skills section feels like a correction of a misconception. The reader finishes thinking "I was optimising for the wrong thing."
4. The Market Insight creates a question. The reader wants to know more about progression after the two sentences.
5. At least one FAQ answer says something the student did not want to hear.

═══════════════════════════════════════════════════════════════
FACTUAL ACCURACY RULES — WORKED EXAMPLE
═══════════════════════════════════════════════════════════════

The production version of this file contains an extensive "Factual Accuracy and
Jurisdiction Rules" section: one entry per real career path, correcting specific
regulator names, statute names, credential names, and employer facts identified
across four rounds of stress testing. That section is the single most
proprietary part of the entire system prompt — every line names a real
regulatory body, a real statute, or a real employer — so it has been removed
from this portfolio version rather than genericised line by line.

What follows is the PATTERN those entries all share, with a fictional example
in place of a real one, so the mechanism is visible without the content:

WORKED EXAMPLE — [Career path], [regulator confusion]:
[Regulator A] administers [specific function]. [Regulator B] is a different
body responsible for [different function] — the two are not interchangeable.
Never write "[Regulator B] compliance checks" when the content means
[Regulator A]'s specific function — write "[Regulator A] compliance checks"
instead.

Every real entry in the production file follows this same shape: name the
two things that get confused, state which is actually correct, give the
exact wrong phrase to never write and the exact right phrase to write instead.
Some entries correct a statute name that differs between the two markets this
system covers (the wrong statute for the wrong country is an immediate
credibility failure to any reader with domain knowledge). Some entries retire
a defunct organisation name after a real-world rebrand and specify its current
name. Some entries remove an unsourced statistic and replace it with
directional language. Some entries fix an incorrect employer attribution.

If you adapt this file for your own domain, this is the section to populate
first with your own domain's real, verifiable facts — regulator names,
statute names, credential names, and known data corrections specific to your
market. Each entry should be small, mechanical, and testable: a specific wrong
string that must never appear, and a specific right string that replaces it.`;

  const zone4 = `═══════════════════════════════════════════════════════════════
MANDATORY CONTENT STRUCTURE — FOLLOW EXACTLY IN ORDER
═══════════════════════════════════════════════════════════════

SPELLING RULE — PROGRAMME VS PROGRAM:
Use "programme" (British spelling) throughout all AU and NZ page content.
Exception: when quoting an employer's official programme name that uses American spelling (e.g. "Employer Graduate Program"), match the employer's spelling only in that specific official name reference.
In all other contexts — including general references to graduate programmes, internship programmes, training programmes, and career programmes — use "programme."
Never use "program" as a generic noun in any generated content.

1. H1: # How to Get ${titleKw} in ${country}

2. Para 1 — Hook (1 to 2 sentences)
State the hidden market truth about how this specific market works. Bold the key insight phrase. Never a generic opener. Never "Are you looking for X?" Read the Reddit research block first, the hook should address what students in this specific path actually fear.

3. Para 2 — Country Context (1 to 2 sentences):

CRITICAL STRUCTURAL RULE: Para 2 must ALWAYS be a separate paragraph from Para 1. The hook paragraph ends with a full stop. There is a paragraph break. Para 2 begins on a new line as a completely separate paragraph. Never embed the Gemini hyperlink inside the hook paragraph. Never combine Para 1 and Para 2 into one paragraph regardless of how short each is.

Para 2 provides country-specific market context. Embed one Gemini-sourced fact as an inline hyperlink using this exact format: [The full fact sentence as the anchor text](source-url). The entire fact sentence becomes the anchor text, not just a word or phrase.

EXTERNAL URL RULE — NON-NEGOTIABLE: The hyperlink in Para 2 must always point to an external URL. Acceptable sources: government reports, industry body publications, employer careers pages, university research, or credible news sources. Never link to a platform employer profile (au.your-platform.com/graduate-employers/ or nz.your-platform.com/graduate-employers/) or any other platform URL. Never link to a platform landing page or search result. The Gemini research block provides external URLs — use those. If no suitable external URL is available in the Gemini block, use a fact from the SERP data block that has an external source.

Do not write "according to" or "based on" before the hyperlink. Embed it naturally as a declarative statement.

PARA 2 HYPERLINK ENFORCEMENT — NON-NEGOTIABLE:

STEP 1 — SELECT THE FACT:
Find one fact from the Gemini research block that directly proves the hook's mechanism is real. An application timeline, a conversion rate, a programme size, a named employer's specific process, or a regulatory body's data all qualify. If no directly relevant fact exists in the Gemini block, use the most specific application timing fact available, or a relevant fact from the SERP data block.

STEP 1B — FALLBACK IF NO EXTERNAL SOURCE EXISTS ANYWHERE:
If the Gemini research block returns its research-unavailable fallback message and the SERP data block also contains no fact with a usable external URL, do not substitute a platform employer profile link to satisfy the hyperlink requirement. An employer name appearing in the EMPLOYERS data block is a hyperlink target for employer mentions elsewhere on the page — it is never a Para 2 source, and linking to it does not count as sourcing the claim. Write Para 2 from documented career-path knowledge without a hyperlink, and end the paragraph with the editorial marker "[SOURCE NEEDED — add a verified external citation before publishing]" so the gap is visible to a reviewer rather than hidden behind a fabricated or internal link. This is the only condition under which Para 2 may contain zero hyperlinks.

STEP 2 — VERIFY THE URL IS EXTERNAL:
Before using the URL, check it does not start with any of the following:
- https://au.your-platform.com
- https://nz.your-platform.com
- http://au.your-platform.com
- http://nz.your-platform.com
- au.your-platform.com (without https)
- nz.your-platform.com (without https)

If the URL starts with any of these patterns, it is an internal platform URL and must not be used in Para 2 — this includes a platform employer profile URL for an employer named in the sentence itself. Reject that fact entirely. Find a different fact with a different external URL. If no different fact with an external URL exists anywhere in the research blocks, apply STEP 1B instead of substituting the rejected internal URL. Repeat STEP 2 on any new URL. Do not proceed to STEP 3 until the URL passes this check or STEP 1B has been applied.

Acceptable URL patterns for Para 2 include:
- Government websites
- Industry body websites
- Employer careers pages on the employer's own domain
- Credible news and research sources
Any URL that is not on the platform's own domain and points to a real external source is acceptable.

STEP 3 — COUNT THE HYPERLINKS:
Para 2 must contain exactly one hyperlink, unless STEP 1B applies. After writing Para 2, count the hyperlinks in it.
- If the count is zero and STEP 1B does not apply: Para 2 is incomplete. Return to STEP 1 and add a hyperlinked fact before continuing.
- If the count is zero because STEP 1B applies: Para 2 is correctly formed, provided the "[SOURCE NEEDED]" marker is present. Proceed.
- If the count is one: Para 2 is correctly formed. Proceed.
- If the count is two or more: Para 2 has too many hyperlinks. Remove all but the single most relevant one. Keep only the hyperlink that most directly proves the hook's mechanism is real. Delete all others.

STEP 4 — FINAL VERIFICATION:
Before writing the quick action bullets, confirm:
- Para 2 exists as a separate paragraph from the hook (not combined)
- Para 2 contains exactly one hyperlink, or zero with the STEP 1B "[SOURCE NEEDED]" marker present
- If a hyperlink is present, its URL does not start with au.your-platform.com or nz.your-platform.com
- The fact in Para 2 relates directly to the hook's claim

If all four conditions are met, proceed to the bullets. If any condition fails, fix it before proceeding.

EXAMPLE CAREER PATH — PARA 2 STALENESS AND SPECIFICITY PATTERN:

The production version has one entry like this per real career path, each naming a
real employer and a real recurring cycle. This is the pattern, with a fictional
employer standing in for the real one:

Example career path: Para 2 must use recurring programme framing, not specific cycle
dates, and not specific day numbers either — a specific day number (e.g. "March
25th," "closes on 7 July") is exact-cycle information that changes between
recruitment cycles just like a year does, even with the year itself removed. Use
month-level framing only: name the month or the relative position within the month
(early/mid/late), never a specific day number or year.
Do not write: "[Example Employer]'s 2025 Graduate Programme applications opened in
March 2024 and closed in April 2024" — nor "opened on March 1st and closed on April
30th each year" (still names exact days, still goes stale as real cycle dates shift).
Write instead: "[Example Employer]'s Graduate Programme typically opens applications
in March and closes in April each year." Link to the firm's current graduate
programme page on the firm's own external domain, not a page for a specific year's
intake — and never to the firm's platform employer profile. Naming the firm as the
subject of this sentence does not trigger the standard employer-hyperlink rule; if
no external source is available, write the firm's name as plain text here and apply
STEP 1B instead of linking to its platform profile.

Replace this with one entry per career path in your own data, following the same
shape: durable month-level framing, a named real employer, a real external domain
to link to, and the STEP 1B fallback if no source is available.

4. QUICK ACTION BULLETS (3 to 4 bullets, no heading above them)
Follow all rules above. Directly after Para 2 with no separator.

BROAD KEYWORD RULE (multi-discipline keywords):

OVERRIDE NOTICE: When broadEngineering is true in the data block, this rule overrides the CAREER PATH SPECIFICITY instruction. The career path label in the data block is a pipeline detection fallback and must be ignored for content purposes. Cover all major disciplines as specified below.

If the data block contains broadEngineering: true, the page keyword covers multiple disciplines within a broader field and the content must reflect this. Do not narrow to one sub-discipline only.

When broadEngineering is true:
- The hook must address the multi-discipline nature of the field (see hook rules above)
- The types table must include rows for at least 5 distinct sub-disciplines within the field
- The employer skills section must acknowledge that different disciplines have different tools, different body memberships, and different assessment formats
- The application stages must acknowledge that different disciplines have different application windows
- FAQs should be selected to cover at least two different disciplines within the field
- The employer skills H2 heading must use the broad field name — never the narrow fallback discipline name. The data block's career path label is a pipeline fallback and must not appear in this heading when broadEngineering is true.
- The salary table discipline label must use the broad field name, not the narrow fallback discipline name.
- The career progression H2 heading must use the broad field name, not the narrow fallback discipline name.
- The employer skills intro paragraph must include at least one employer from a non-default discipline — not only employers from the fallback discipline, which would wrongly signal the section applies to that discipline only.

If broadEngineering is not in the data block or is false, cover only the specific matched career path sub-discipline, and the H2 headings and table labels use the specific matched career path name as normal.

5. H2: ## What Types of ${titleKw} Are Available in ${country}?

FRAMING SENTENCE POSITION: The framing sentence for the types table appears on the line immediately before the ## What Types of... heading. It is part of the content flow between the quick action bullets and the types table heading. The page structure at this point is: quick action bullets → framing sentence → ## What Types of... heading → table content. The framing sentence is never written after the ## What Types of... heading. The ## What Types of... heading is never the first element in this section.

TABLE CELL LENGTH — HARD LIMIT FOR EVERY CELL IN THIS TABLE:
Every cell in this table must be one line maximum. No cell may exceed 15 words. This applies to every row and every column without exception. Table cells are scanning content not reading content. A student must understand each cell in under two seconds. Do not write sentences with sub-clauses in table cells. Do not add evidence sentences inside table cells.

Related Sector column: one sector name only. Maximum 5 words. Do not list multiple sectors per cell.

Similar Role Titles column: maximum three role titles, comma-separated. Maximum 15 words total.

What You'll Work On column: name the primary project type and one specific tool or standard only. Maximum 12 words. Do not write a sentence — write a descriptor.
Correct: 'Financial modelling in Excel, discounted cash flow analysis, live deal transactions.'
Correct: 'Structured problem framing, client presentation development, cross-functional stakeholder workshops.'
Wrong: 'You will work on financial modelling in Excel including three-statement models and sensitivity analysis, live deal transactions with named clients, and cross-functional presentation development for board-level stakeholders across multiple engagement types.' (Too long — this is a sentence not a cell.)

Table columns: Related Sector | Similar Role Titles | What You'll Work On
- Similar Role Titles: hyperlink each to its platform category page using this EXACT pattern: ${roleLinkPattern}
  Derive [role-slug] by converting the role title to lowercase kebab-case.
- What You'll Work On: name specific tools, hyperlinked employer names from the employer list, real project types.
- 4 to 6 rows covering main sub-disciplines of ${careerPath} ONLY. Do not list sub-disciplines from other career paths.

6. H2: ## What Do ${careerPath} Employers Look For in ${currentYear}?
Use "${careerPath}" here, not the raw keyword, to avoid awkward phrasing.

FRAMING SENTENCE POSITION: The framing sentence for the employer skills section appears on the line immediately before the ## What Do... heading. It is part of the content flow between the types table and the employer skills heading. The page structure at this point is: types table content → framing sentence → ## What Do... heading → employer skills bullets. The framing sentence is never written after the ## What Do... heading. The ## What Do... heading is never the first element in this section.
4 to 5 bullet points. Each: **Bold label:** body text with specific evidence, tools, certifications, employer names, real actions. The colon after the bold label is acceptable here as a label separator, not a sentence connector. Use hyperlinked employer names from the list above where you name specific employers.

7. ${cityHeading}
This is an H2 statement, not a question, not a label. Write it exactly as: ## ${cityHeading}
1 to 2 sentences on geographic concentration specific to ${careerPath} in ${country}.
Then, if city pages exist, the single-column city table exactly as provided above (every row, unmodified, no truncation). If no city pages exist, omit the table and move directly to section 8.

WHEN NO CITY PAGES ARE AVAILABLE:
If the city pages data block contains "NO_CITY_PAGES_AVAILABLE" or is empty, omit the city table section entirely. Do not write a framing sentence. Do not write the H2 heading for this section. Do not write placeholder text or explain that city pages are unavailable. Skip directly from the employer skills section to the application stages section. The page is complete without a city table.

8. H2: ## How Do You Apply for ${titleKw} in ${country}?

5 stages. Each stage:
### ✅ Stage N: [Stage Name] ([Month range if known from Gemini research])
1 sentence only per stage. Maximum 2 sentences if the stage genuinely requires two distinct actions that cannot be combined into one sentence. Never 3 sentences.

The sentence must contain: the specific action the student takes + one named employer or credential or platform where relevant. Do not write general advice that applies to any career path.

WORD LIMIT PER STAGE: 34 words maximum per stage guidance text not counting the heading line.
TOTAL APPLICATION STAGES TARGET: 150 to 170 words including all 5 stage headings and guidance text combined. If over 170 words, reduce the longest stage to one short sentence. If under 150 words, the stages are too compressed — expand the thinnest stage with one additional specific detail (a named employer, platform, or credential) rather than padding with generic language.

9. H2: ## How Much Do ${titleKw} Pay in ${country}?

SALARY TABLE DISCIPLINE LABEL RULE — NON-NEGOTIABLE:
The discipline label in the first column of the salary table must always be the Keyword Career Path value from the data block. Never use the salary data fallback path name as the label, even if the salary figures themselves come from a parent path fallback.

The data block provides:
- Keyword Career Path: the career path detected from the keyword
- Salary figures: which may come from a parent path fallback

Always use the Keyword Career Path value as the discipline label. The salary figures can come from any fallback path but the label must always reflect the actual keyword.

Apply the same rule to the career progression H2. The H2 must read:
"What Is the Career Progression for [Keyword Career Path] in [Country]?"
Never substitute the parent fallback path name in either location.

SALARY TABLE ROWS — USE ONLY REAL PLATFORM DATA:
The salary data block provided contains the real current salary figures from your data layer. Use only what is in that block. Do not fabricate sub-discipline figures.

If the data block provides salary ranges for multiple sub-disciplines, create one row per sub-discipline.

If the data block provides only one salary range for the matched career path with no sub-discipline breakdown, use a single row for that career path. Write the career path name in the Discipline column exactly as it appears in the data.

Never invent salary ranges for sub-disciplines that are not explicitly provided in the data block.

Paste this exact salary table, do not modify any figures, do not add rows, do not cite any other source:

${resolvedSalaryTable}

Then write on its own line:
Source: platform data

Then write on the next line:
💡 **Market Insight:** [insider context about the salary pattern specific to ${careerPath} in ${country}]

MARKET INSIGHT SENTENCE STRUCTURE — TWO SENTENCES REQUIRED:
The Market Insight line must be exactly two sentences. Never one comma-joined sentence that merges the claim and the evidence. Never three or more sentences.

Sentence 1: Names the specific factor that drives variation within the salary range for this career path — the credential, specialisation, employer type, or certification that determines where in the range a candidate lands. This sentence makes a claim. It must be specific enough that the student knows which factor to pursue.

Sentence 2: Names the specific consequence for the student — what reaching the upper end of the range requires them to do or achieve. This sentence must create forward pull toward the career progression table. The student should finish reading sentence 2 with the implicit question "how do I get to the upper end of that range?" If sentence 2 does not create this question, it has not done its job.

WRONG (one comma-joined sentence doing two jobs):
"Graduates at larger firms start closer to the top of the range, while graduates at smaller firms start lower, with specialisation making the biggest long-term difference."
This merges the claim (firm size and specialisation determine salary) and the evidence into one sentence. Neither job is done well.

CORRECT (two sentences, one job each):
Sentence 1: "Specialisation determines starting salary within this field more than firm size or location."
Sentence 2: "Graduates who complete a named credential in their second year typically move into the upper part of the range within three years."

The Market Insight line must always be exactly two sentences. The first sentence makes the claim. The second provides the evidence and creates the forward pull toward career progression.

SALARY DATA RULES — PRECISE:
Salary table rows: current platform salary data ONLY. No exceptions.
Quick action bullets: Gemini salary figures acceptable if they contain a specific number, source name, and year.
Para 2: Gemini salary figures acceptable if hyperlinked to source.
Employer skills section: No salary figures.
Application stages: No salary figures.
Career progression table: No salary figures.
FAQs: Gemini salary figures acceptable if clearly attributed to source and year. If a Gemini salary figure contradicts the platform table figure for the same discipline, omit the Gemini figure and use only the platform figure.

10. H2: ## What Is the Career Progression for ${careerPath} in ${country}?

TABLE CELL LENGTH — HARD LIMIT FOR EVERY CELL IN THIS TABLE:
Every cell in this table must be one line maximum. This applies to every row and every column. Table cells are not prose sections. Do not write lists of activities separated by commas that run to 3-4 lines.

Focus and Responsibilities column: name the primary activity and the scope of responsibility only. Maximum 20 words. One clause only — no lists of four or five activities.
Correct: 'Managing a portfolio of accounts independently, reviewing junior staff work, leading client meetings.'
Correct: 'Running end-to-end delivery on assigned engagements with minimal senior oversight.'
Wrong: 'Managing a portfolio of accounts independently, reviewing and signing off on work prepared by junior staff, leading client-facing meetings without senior involvement, and completing professional qualification modules alongside full client load.' (Too long — this is a paragraph not a cell.)

Table with exactly four columns: Stage | Years of Experience | Typical Role Titles | Focus and Responsibilities
Exactly 4 rows: Intern/Entry Level | Graduate/Junior | Senior | Principal/Leadership, all cells specific to ${careerPath}, no generic content.
One sentence after the table naming the key professional registration or credential for ${careerPath} in ${country}.

11. H2: ## FAQs

3 questions maximum. Never 4 or 5. Always exactly 3.

Source the 3 questions from the People Also Ask data in the SERP block. Prioritise questions requiring salary figures, employer names, or local regulatory knowledge to answer properly. If the SERP block has fewer than 3 PAA questions, use the most relevant related searches.

Each answer follows this exact structure — 4 sentences:
Sentence 1: Direct answer — state it immediately, no build-up, no preamble
Sentence 2: Specific detail — name at least one employer, salary figure, location, qualification, or regulatory requirement specific to ${country} and this career path. Must not repeat information already on the page. Must not be findable by Googling the question.
Sentence 3: Practical action — what the student should do with the information from sentences 1 and 2. Must be specific enough to start this week. Must follow logically from sentences 1 and 2 — it could not have been written without reading them.
Sentence 4: Opinionated insider insight — something not findable on a generic careers website. Must pass the insider insight test: could this sentence have been written without specific knowledge of this career path and country? If yes, rewrite it.

FOUR-SENTENCE FAQ ANSWER — STRUCTURAL PATTERN:

This block shows the structural pattern every FAQ answer must follow. The content in brackets is placeholder text showing the TYPE of content required — replace every bracketed item with real, specific, named content from the research blocks. Never reproduce the bracketed placeholder text itself in the actual answer.

WRONG — one comma-joined sentence (never do this):
"Yes, and specifically at [firm], [detail about the firm], which means you should [action], and [insight about the market]."
This is one sentence. It has one full stop. It fails the sentence-count requirement regardless of its word count or how specific its content is. The presence of commas between clauses that should be separate sentences is the signal of this failure.

CORRECT — four sentences, four full stops:
"[Direct answer naming at least one specific firm, threshold, or regulatory requirement — minimum 10 words ending with a full stop.]
[Specific detail not already on this page and not findable by Googling this question — must name at least one employer, salary figure, location, qualification, or regulatory body specific to this country and career path — minimum 15 words ending with a full stop.]
[Practical action the student can start this week that follows logically from sentences 1 and 2 and could not have been written without reading them — minimum 10 words ending with a full stop.]
[Insider insight not findable on a generic careers website — something a university careers adviser would not know — specific to this career path and this country — minimum 15 words ending with a full stop.]"

COUNTING THE SENTENCES:
Before finalising each FAQ answer, count the full stops in it. A correct FAQ answer has exactly four full stops — one at the end of each sentence. If the answer has fewer than four full stops, it is incomplete. Add the missing sentences before moving to the next FAQ question.

CHECKING THE WORD COUNT:
A correct FAQ answer is at least 60 words total across all four sentences. If the total is under 60 words, at least one sentence is too short. Expand the shortest sentence first by adding a specific named entity, a salary figure, or a timing detail from the research blocks.

CRITICAL WARNING ABOUT PLACEHOLDERS:
The bracketed text [like this] in the CORRECT example above is placeholder text showing what type of content each sentence requires. These brackets must never appear in the actual FAQ answer. Replace every bracketed placeholder with real named content: real firm names, real salary figures, real month names, real credential names. An answer containing bracketed text has not been written — it is still a template.

CRITICAL WARNING ABOUT THE WRONG PATTERN:
The WRONG example above is shown only to illustrate what to avoid. Never write a FAQ answer in this pattern. The test: count the commas in your FAQ answer. If there are more than two commas in a single sentence, that sentence has absorbed multiple ideas that should be separate sentences. Split it.

WORD LIMIT PER ANSWER: 90 words maximum per answer. Count the words. If over 90 words, tighten Sentence 2, Sentence 3, or Sentence 4 rather than cutting any of them down to a fragment.

TOTAL FAQ SECTION TARGET: 230 to 280 words including the question headings. If over 280 words across all 3 questions, trim the longest answer first — but never below the minimum length enforcement below.

FAQ ANSWER LENGTH ENFORCEMENT:

Each FAQ answer must contain all four sentences. No exceptions. A FAQ answer of one word, one clause, or fewer than four sentences is a critical failure — it means at least one of the four required sentences is missing.

MINIMUM LENGTH PER ANSWER: Each complete FAQ answer (all four sentences combined) must be at least 50 words. If an answer is under 50 words, at least one required sentence is missing or severely compressed. Expand it before finalising the page.

MINIMUM LENGTH PER SENTENCE:
Sentence 1 (Direct answer): Minimum 10 words. States the answer immediately with no preamble. Cannot be a single word or a single clause. Must be a grammatically complete sentence that answers the question directly.
Sentence 2 (Specific detail): Minimum 15 words. Names at least one specific employer, salary figure, location, qualification, or regulatory requirement specific to this country and career path. Cannot be a sentence that could appear unchanged on any careers website.
Sentence 3 (Practical action): Minimum 10 words. States what the student should do with the information from sentences 1 and 2. Must be specific enough to start this week. Must follow logically from sentences 1 and 2 — it could not have been written without reading them. Cannot be generic advice like 'consider this when applying' or 'build relevant experience'.
Sentence 4 (Opinionated insider insight): Minimum 15 words. Contains something a student would not find on a generic careers website — a salary nuance, a firm-specific practice, a regulatory detail, a market behaviour, or a hiring pattern that requires insider knowledge to state. If this sentence reads like generic career advice ('networking is important', 'gaining experience helps', 'employers value commitment'), it fails. Rewrite it with something specific to this career path and country.

THE SENTENCE COUNT CHECK: Before finalising the FAQ section, count the sentences in each answer. If the count for any answer is not exactly four, that answer is incomplete and must be expanded before the page is finalised.

THE ONE-WORD ANSWER TEST: Before finalising the FAQ section, read each answer aloud. If any answer sounds like it could be written on a sticky note or answered with a head nod, it is too short. FAQ answers in this content are substantive explanations that add information the student cannot find elsewhere on the page — not acknowledgements or confirmations.

THE COMPRESSION WARNING: FAQ answers are the section most likely to be compressed when the model is under token or word-count pressure. If the page is already at or near the word count ceiling, do not compress FAQ answers. Instead trim the application stages section (reduce each stage to one sentence) or the career progression table descriptions (reduce to one clause per cell) before compressing FAQ answers. FAQ answers are never trimmed to meet the word count ceiling.

FAQ QUESTION SELECTION RULE:

The PAA (People Also Ask) data from the SERP block is a starting source only — not a final list. Before using any PAA question, apply this two-step filter:

STEP 1 — THE GENERIC TEST:
Ask: could this question have been asked by a student who has NOT read this page yet?
If yes, the question is generic. It belongs on any careers website. Discard it.
If no — the question could only arise from reading this specific page — keep it.

STEP 2 — THE DUPLICATION TEST:
Ask: does this question ask for information that this page has already provided (salary figures, qualification requirements, type descriptions)?
If yes, the question duplicates existing content. The student already has this answer. Discard it and replace with a question that addresses something the page raised but did not fully resolve.
If no — the question addresses something the page raised but left partially unanswered — keep it.

GENERIC QUESTIONS TO ALWAYS DISCARD (these patterns appear in every test and must never appear as FAQ questions):
- What is the average salary for [career path] in [country]? — the salary table already answered this
- Is there demand for [career path] in [country]? — generic, no student needs to ask this after reading a long page
- Do interns get paid in [country]? — generic across all career paths
- What qualifications do I need for [career path]? — the types table already answered this
- Is [career path] a good career? — generic, no career page should answer this
- Are [career path] professionals in demand in [country]? — generic market question, not a page-specific follow-up

PRIORITY ORDER FOR FAQ QUESTIONS — USE THIS SEQUENCE TO FIND PAGE-SPECIFIC QUESTIONS:

Priority 1: Questions arising from the hook's specific claim.
Priority 2: Questions arising from the salary table's specific range.
Priority 3: Questions arising from the application stages' specific timeline.
Priority 4: Questions arising from the employer skills section's specific filters.

MINIMUM STANDARD: At least 2 of 3 FAQ questions must be page-specific, arising from Priority 1, 2, 3, or 4 above. A FAQ section with 3 generic questions is a complete failure of this rule and must be rewritten before the page is finalised.

FAQ SELF-CHECK (apply before finalising the FAQ section):

Check A — Question specificity: Would a student who has not read this page be able to have asked this exact question? If yes, replace it with a question from Priority 1, 2, 3, or 4 above.
Check B — Answer duplication: Does any FAQ answer repeat information that appears verbatim in the salary table, types table, or employer skills section? If yes, rewrite the question to address something the page raised but left partially unanswered.
Check C — Page-specific count: Count the questions passing both Check A and Check B. If fewer than 2 of 3 questions are page-specific, the FAQ section fails and must be rewritten before the page is finalised.
Check D — Answer quality — insider insight: Read sentence 4 of each FAQ answer. Does it contain something a student would not find on a generic careers website? If sentence 4 reads like generic career advice, rewrite it with a specific insight unique to this career path and country.

The test for a strong FAQ section: a student who has read the entire page arrives at the FAQs with specific questions that the preceding sections raised but did not fully resolve. The FAQs resolve those specific questions. Each FAQ answer adds genuinely new, page-specific information. The insider insight in sentence 4 is the kind of answer a well-connected mentor would give — not what appears on a university careers centre website.`;

  const zone5a = `═══════════════════════════════════════════════════════════════
RULES APPLYING TO THE ENTIRE OUTPUT
═══════════════════════════════════════════════════════════════
- All employer names hyperlinked throughout: [Employer Name](https://${domain}/graduate-employers/slug)
- No em dashes anywhere in the output
- No colons used as sentence connectors in body text (label colons in employer skills bullets, and in "Source:" / "💡 Market Insight:" lines, are acceptable)
- ${isAU ? 'Australian' : 'New Zealand'} English throughout: organisation, programme, recognise, labour
- ${currency} stated explicitly wherever a figure appears, never just "$"
- Title case all keywords when used in headings
- Never write "In conclusion", "In summary", "To summarise"
- Never repeat the H2 question as the first sentence of the answer body
- Never write generic openers that could appear on any careers website
- Never write generic competency language: "strong communication skills", "team player", "passionate about finance", replace with specific tools, methods, or employer-named examples
- No pronoun antecedent ambiguity: every "it", "they", "this", "these" must clearly refer to a noun in the same sentence
- Never cite third-party salary sources in the salary TABLE — the table is platform data only
- Output the article ONLY, no preamble, no "Here is the article", no trailing commentary
- THE MARKET DEMAND SECTION IS PERMANENTLY REMOVED. Do not add it back under any heading including "What Is the Market Like", "Market and Demand", "Industry Outlook", or any variation. Market intelligence belongs only in the quick action bullets and opening paragraphs.`;

  const zone5b = `WORD COUNT BUDGET — STRICTLY ENFORCED:
Total target: 1,200 to 1,400 words. Hard limit. Count before finishing.

Section budgets:
- Para 1 and Para 2 combined: 50 to 70 words maximum
- Quick action bullets combined: 90 to 130 words maximum
- Types table framing sentence plus table content: 130 to 170 words maximum
- Employer skills framing sentence plus all bullets: 190 to 250 words maximum
- City section intro sentences only: 25 to 35 words maximum
- Application stages combined all 5 stages: 150 to 170 words maximum
- Salary Market Insight line only: 15 to 25 words maximum
- Career progression table content plus credential sentence: 60 to 80 words maximum
- FAQs combined all questions and answers: 230 to 280 words maximum

If over budget, cut application stages first (one sentence per stage), then career progression descriptions, then employer skills bullets. Never cut quick action bullets or opening paragraphs.`;

  // Zone 3 (Writing Craft Parts 1-4) and Zone 5b (word count budget) contain zero
  // ${} interpolations -- confirmed byte-identical across every generation regardless
  // of keyword, career path, or country -- so they form the cached prefix. Zone 5a
  // (rules applying to the entire output) looked static at a glance but actually
  // interpolates ${domain}/${isAU}/${currency}, so it stays in the dynamic suffix
  // alongside Zones 1, 2, and 4, which are keyword/career-path/research-data
  // dependent by design.
  const staticPrefix = zone3 + '\n\n' + zone5b;
  const dynamicSuffix = zone1 + '\n\n' + zone2 + '\n\n' + zone4 + '\n\n' + zone5a;

  return { staticPrefix, dynamicSuffix };
}

async function runClaudeWriter(keyword, country, serpData, redditData, geminiStats, prospleData, onToken) {
  const client = new Anthropic();
  const { staticPrefix, dynamicSuffix } = buildPrompt(keyword, country, serpData, redditData, geminiStats, prospleData);

  let fullContent = '';

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 6500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'text',
          text: staticPrefix,
          cache_control: { type: 'ephemeral' }
        },
        {
          type: 'text',
          text: dynamicSuffix
        }
      ]
    }]
  });

  stream.on('text', (text) => {
    fullContent += text;
    onToken(text);
  });

  const finalMsg = await stream.finalMessage();
  console.log('Token usage:', JSON.stringify(finalMsg.usage));
  return fullContent;
}

module.exports = { runClaudeWriter };
