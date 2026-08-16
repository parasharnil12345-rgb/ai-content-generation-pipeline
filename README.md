# AI Content Generator — Portfolio Version

This is a sanitised, fully functional copy of a production content-generation tool that was built for a real graduate-careers platform operating in Australia and New Zealand. It generates SEO landing pages — long-form, structurally exact, factually grounded career-path pages — through a five-step research-and-writing pipeline, with a real-time monitoring layer that checks the model's own output against a documented quality standard after every generation.

The goal of this repository is to show the actual engineering: the real pipeline architecture, the real prompt structure (including prompt caching), the real post-processing monitoring system, and the real "skill" documents that encode the quality standard the content is held to. The only thing that has been removed is the platform's proprietary data layer — real employer names, real salary figures, real curated career-path taxonomy, and real URL inventory — which has been replaced with clearly fictional, clearly labelled example data throughout. Everywhere a real career path, employer, or regulatory fact appeared in the original, this version shows the identical mechanism working against **one consistent example career path** instead.

## What this is not

This is not a simplified summary, a slide deck, or a rewritten "clean" version built to look impressive. It is the actual working code — the same prompt-assembly logic, the same streaming architecture, the same monitoring checks — with the data layer swapped out. It runs. `npm install && npm start` produces a working local server that generates real content end to end, using your own API keys.

## Architecture overview

The tool is a five-step pipeline, orchestrated by [server.js](server.js) and streamed to the browser over Server-Sent Events so the UI can show live progress and stream tokens as the model writes:

1. **SERP research** ([pipeline/serp.js](pipeline/serp.js)) — fetches the top 10 organic results, "People Also Ask" questions, and related searches for the target keyword via the Serper API. Used to validate the intended hook angle and to select a sourced fact for the page's second paragraph.
2. **Reddit research** ([pipeline/reddit.js](pipeline/reddit.js)) — searches Reddit (via the same Serper API, scoped with `site:reddit.com`) for real student discussion about the career path. Used to calibrate FAQ question selection and page tone against actual student anxiety, not assumed anxiety.
3. **Market research** ([pipeline/gemini.js](pipeline/gemini.js)) — asks Gemini for six categories of labour-market intelligence (application timing, workforce size, student-specific intelligence, regulatory context, recent developments, salary context), with a strict requirement that every returned fact carry a real, checkable source URL. Facts without a URL are discarded before they ever reach the writer.
4. **Platform data** ([pipeline/prosple.js](pipeline/prosple.js)) — the tool's own structured data layer: curated employer lists, salary bands, career-path-specific vocabulary ("salience words"), and a city/region page index ([lib/url-index.js](lib/url-index.js)) built by parsing the platform's own URL inventory. This is the layer that has been replaced with fictional example data in this portfolio version — the lookup and fallback logic (keyword-to-career-path detection, salary-parent fallback for disciplines with no data of their own, URL-slug parsing for city pages) is the real, unmodified algorithm.
5. **Writing** ([pipeline/writer.js](pipeline/writer.js)) — assembles a large, highly structured system prompt from the outputs of steps 1 through 4 and streams a Claude-generated page back to the browser token by token.

## The prompt: structure and caching

[pipeline/writer.js](pipeline/writer.js) is the centre of the system. The prompt is deliberately split into a **static prefix** and a **dynamic suffix**, sent as two separate content blocks in the same message, with Anthropic prompt caching (`cache_control: { type: 'ephemeral' }`) applied only to the static block:

- **Static (cached):** the full writing-craft rulebook — hook-quality tests, a "bullet dimension lock" mechanism that prevents four action items from silently repeating the same point, transition and section-flow rules, sentence-level craft rules (a five-rung specificity ladder, an "active student" actionability test, evidence-form requirements), and the FAQ voice framework. None of this content changes between generations, so caching it cuts both cost and latency on every run after the first.
- **Dynamic (fresh every call):** the career-path-specific hook direction, the research data assembled from steps 1 through 4, and the mandatory content structure for this specific page (word budgets, table formats, the Para 2 hyperlink-enforcement sequence, salary and career-progression table rules).

The most proprietary part of the original prompt — ten real career-path hook directions, each naming real employers and real hidden market mechanisms discovered through live testing — has been collapsed into a single, clearly labelled **EXAMPLE CAREER PATH** block that shows the full shape a real direction takes (what to reveal, the question it creates, which of three sentence-2 structures to use, which salience vocabulary to inject) without exposing the real ones.

## The monitoring system

After the model streams a full page, [server.js](server.js) runs a set of post-processing checks against the output — two of which silently correct the content (em dash removal, application-stage trimming) and seven of which log a warning for a human reviewer rather than blocking the response:

- Para 2 URL validation (catches an internal platform link masquerading as an external source)
- Bullet dimension-conflict detection (uses a fast Haiku call to classify whether two of the four action bullets have collapsed onto the same underlying point)
- Bullet imperative word-count enforcement
- Hook comma-splice detection
- A "floating orientation paragraph" check for a specific structural drift pattern found during live testing
- Table cell word-count enforcement
- Section-specificity rating (another Haiku call, used to catch generic filler sentences in the FAQs, career-progression table, and types table)

This is a real example of treating LLM output the way you would treat any other unreliable system boundary: verify what actually came back, don't just trust the prompt to have worked.

## The skill files

[skills/](skills/) contains five markdown documents that were originally written as the operating reference for the humans reviewing this tool's output — not for the model. They encode the same quality standard as the prompt, but as a reviewer-facing checklist and diagnostic framework: argument structure, hook quality tests, the bullet dimension lock, transition rules, sentence craft, FAQ rules, a localisation reference (jurisdiction-correct regulatory bodies, statutes, and terminology for the two real markets), a vocabulary-calibration reference, a SERP-interpretation guide, and a Reddit-anxiety-classification guide.

Each file carries a portfolio-version note directly under its header explaining what was changed. In every case the structural methodology — every rule, test, checklist, and diagnostic procedure — is reproduced in full. What has been removed is the real per-career-path content: real employer names, real regulatory bodies and statutes, real salary figures, and the specific editorial judgments tied to each of the ten real career paths the production tool covers. Those have been consolidated into one consistent worked example per file so the reasoning process stays fully visible.

## Tech stack

- **Backend:** Node.js, Express, Server-Sent Events for streaming
- **LLM:** Anthropic Claude (`claude-sonnet-4-5` for writing, `claude-haiku-4-5` for fast classification checks during monitoring), Google Gemini (`gemini-2.5-flash` with a `gemini-2.0-flash` fallback) for market research
- **Search:** Serper API (Google SERP + Reddit search)
- **Export:** `docx` for server-side Word document generation from the generated markdown ([lib/markdown-to-docx.js](lib/markdown-to-docx.js))
- **Frontend:** a single static HTML page with no framework — a hand-rolled markdown-to-HTML renderer and an SSE client, in [public/index.html](public/index.html)

## Running it locally

```bash
npm install
cp .env.example .env   # add your own API keys
npm start
```

You will need your own keys for `ANTHROPIC_API_KEY`, `SERPER_API_KEY`, and `GEMINI_API_KEY`. The platform data layer in this version ([pipeline/prosple.js](pipeline/prosple.js) and [lib/url-index.js](lib/url-index.js)) is pre-populated with fictional example data for a handful of illustrative career paths, so the tool is runnable end to end without needing access to any real platform's data.

## What was sanitised, and how

Every file in this repository is either:

1. **Copied verbatim** from the production codebase, where the file contained no proprietary data to begin with ([pipeline/serp.js](pipeline/serp.js), [pipeline/reddit.js](pipeline/reddit.js), and the general-purpose parsing logic in [lib/markdown-to-docx.js](lib/markdown-to-docx.js) and [lib/url-index.js](lib/url-index.js)); or
2. **Copied with domain/brand substitutions only**, where the code's logic is unchanged but a hardcoded real domain or brand string has been replaced with a placeholder ([server.js](server.js), [pipeline/gemini.js](pipeline/gemini.js), [public/index.html](public/index.html)); or
3. **Rebuilt from scratch with fictional data**, where the file's entire purpose was to hold curated proprietary content ([pipeline/prosple.js](pipeline/prosple.js)'s employer/salary/vocabulary tables, [lib/url-index.js](lib/url-index.js)'s URL seed data); or
4. **Sanitised by consolidation**, where the file mixed genuinely reusable methodology with real per-career-path proprietary content, and the methodology has been kept in full while the real worked examples were collapsed into one consistent fictional example ([pipeline/writer.js](pipeline/writer.js), all five files in [skills/](skills/)).

Nothing in this repository — no employer name, no salary figure, no URL, no regulatory body, no statute name — is real production data.
