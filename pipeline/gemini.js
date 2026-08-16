const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const FALLBACK_MESSAGE =
  'Gemini research unavailable — Claude will write qualitatively without citing specific statistics.';

function buildPrompt(keyword, country) {
  return `You are a labour market researcher specialising in graduate employment in ${country}. Provide research on '${keyword}' covering all six categories below. Every fact you return MUST be formatted as a markdown hyperlink with the source URL: [Full sentence stating the fact](https://exact-source-url.com). If you cannot find a real source URL for a fact, do not include it. Only include facts you can link to a real, live source.

CATEGORY 1 — APPLICATION WINDOW TIMING (most important for this research):
What months do major employers open applications for ${keyword} in ${country}? Name at least 3 specific employers and their specific application opening months or windows. Include whether programmes are rolling or have a fixed close date. This information will be used in content to tell students exactly when to apply.

CATEGORY 2 — WORKFORCE AND DEMAND:
Current workforce size or employment numbers for this field in ${country}. Year-on-year demand or growth rate. Any recent government or industry reports confirming demand outlook.

CATEGORY 3 — STUDENT-SPECIFIC INTELLIGENCE:
Intern-to-graduate conversion rates where available. Typical cohort sizes at major employers. Application-to-offer ratios. Anything that gives a student a concrete sense of competition and odds.

CATEGORY 4 — REGULATORY AND PROFESSIONAL BODY CONTEXT:
Key professional registration or qualification requirements. Body membership numbers. Any 2025 or 2026 changes to registration pathways or requirements.

CATEGORY 5 — RECENT MARKET DEVELOPMENTS:
Any 2025 or 2026 specific developments affecting hiring in this field and country. Policy changes, sector growth, major employer expansions or contractions, industry disruptions.

CATEGORY 6 — SALARY CONTEXT (for body text only, not salary table):
External salary benchmarks from credible sources (Hays, Robert Walters, SEEK, Engineers Australia, CA ANZ etc.). Must include source name and year. These figures may appear in article body text but will never override the employer's own platform salary data in the salary table.

Return 6 to 8 facts total across all categories. Prioritise Categories 1 and 3 as these most directly help students. Format every fact as [sentence](url). Discard any fact you cannot link to a real source URL.`;
}

// Keep only lines that contain a proper markdown hyperlink [text](http...).
// The upgraded prompt organises facts under six category headers and doesn't mandate
// a leading "-" marker (unlike the old prompt), so filtering must key on the hyperlink
// pattern itself, not on bullet formatting — otherwise category header lines would be
// harmless but a strict "-" requirement risks discarding every real fact if Gemini
// doesn't happen to bullet them, silently forcing the fallback message every time.
function validateFacts(raw) {
  console.log('\n── Gemini raw response ──────────────────────────────────────\n' + raw + '\n────────────────────────────────────────────────────────────\n');
  const lines = raw.split('\n');
  const valid = lines.filter(line => /\[.+?\]\(https?:\/\/.+?\)/.test(line.trim()));
  if (valid.length === 0) {
    console.warn('Gemini returned no valid hyperlinked facts — using fallback message.');
    return FALLBACK_MESSAGE;
  }
  console.log(`Gemini: ${valid.length} valid hyperlinked facts retained out of ${lines.filter(l => l.trim()).length} non-empty lines.`);
  return valid.join('\n');
}

async function tryModel(modelName, prompt) {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function runGeminiResearch(keyword, country) {
  const prompt = buildPrompt(keyword, country);
  try {
    const raw = await tryModel('gemini-2.5-flash', prompt);
    return validateFacts(raw);
  } catch (primaryErr) {
    console.warn(`gemini-2.5-flash failed (${primaryErr.message}), retrying with gemini-2.0-flash…`);
    try {
      const raw = await tryModel('gemini-2.0-flash', prompt);
      return validateFacts(raw);
    } catch (fallbackErr) {
      console.error(`gemini-2.0-flash also failed (${fallbackErr.message}), returning fallback message.`);
      return FALLBACK_MESSAGE;
    }
  }
}

module.exports = { runGeminiResearch };
