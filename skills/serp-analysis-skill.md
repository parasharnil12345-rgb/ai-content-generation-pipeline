---
skill: SERP Analysis Skill
version: 1.0
file: /skills/serp-analysis-skill.md
purpose: SERP interpretation for content generation. Provides the process for reading SERP results to validate hook directions, the five common SERP patterns and their hook opportunities, and the Para 2 source selection hierarchy.
load when:
  - Interpreting SERP results to validate or challenge a hook direction
  - Selecting a Para 2 source from SERP results
  - Analysing keyword intent from the SERP composition
---

> **PORTFOLIO VERSION NOTE:** This file is a sanitised copy of a production skill. The worked examples in the production version are built around real career paths and real competitor/employer domains observed during live SERP research; those have been replaced with one consistent "EXAMPLE CAREER PATH" so the reasoning process is visible without exposing real research data. Every rule, pattern, and hierarchy is reproduced in full.

## 4.1 What This Skill Is and When to Load It

The SERP data block from the search API returns the top 10 organic search results for the page keyword. For each result the block provides the title, URL, a short snippet, and the domain (university careers centres, competitor job boards, professional bodies, employer career pages). This skill teaches how to read SERP results specifically for content generation: what to look for, what the results tell you about student intent, how to use them to validate or challenge the hook direction, and how to identify Para 2 source candidates.

Load this skill for any session where SERP results need to be interpreted for hook validation, Para 2 source selection, or keyword intent analysis. Load it alongside the Content Generation Skill whenever generating a new page (SERP validation of the hook direction is a pre-generation step). Load it alongside the Reddit Voice Skill when the SERP results include Reddit or forum pages that need cross-referencing.

## 4.2 Reading SERP Results for Hook Validation

The SERP results tell you what the student has already been exposed to before arriving on the page. If the top 5 results all describe the career (what it is, what employers exist, what the salary is), the student has read descriptions. The page must reveal what the descriptions do not say. If a top 5 result already reveals the mechanism the hook intended to reveal, the student may already know the hook's claim and the hook needs a different angle.

**Four-step process.** Run all four steps in sequence.

1. **Read the top 5 organic results.** For each result, read the title and snippet. Identify the specific claim the result is making about this career path.
2. **Classify each claim as describing or revealing.** Describing means the result explains what the career is (roles, employers, salary bands, general pathway). Revealing means the result names a specific market mechanism the student would not have predicted.
3. **If all top 5 results are describing:** the hook direction is validated. The page has genuine opportunity to reveal. Proceed with the intended hook direction.
4. **If any top 5 result already reveals the mechanism the hook intended:** the hook needs a different angle. The student may already know this specific mechanism. Return to the career path hook directions in the Content Generation Skill and select a different angle to reveal, or reformulate the reveal at a deeper level.

**Worked example — EXAMPLE CAREER PATH.** The intended hook direction reveals that internships are the primary selection mechanism for graduate hiring rather than supplementary work experience. Reading a hypothetical SERP for this keyword: if the top 5 results contain university careers centre pages describing what internships are, employer pages listing their internship programmes as work opportunities, and general graduate careers portal pages listing the field as a discipline, all five are describing. The hook direction is validated. If the top 5 instead contains a forum thread or a competitor page explicitly stating "internships are the primary graduate hiring pipeline and applying to graduate roles without an internship offer is significantly harder," the specific mechanism is already public and the hook needs a different angle (for example, revealing the specific timing arithmetic or the specific credential signalling within the internship application process).

## 4.3 Five Common SERP Patterns

Every SERP composition falls into one of five recurring patterns. Each pattern signals a different student intent and creates a different hook opportunity.

**Pattern 1: university careers centre pages dominate.** More than three of the top five results are university careers centre pages.
- Signal: students are in early research mode, looking for basic orientation.
- Hook opportunity: reveal something the careers centre pages do not say. University careers centres consistently avoid uncomfortable truths. The hook opportunity is in that gap.

**Pattern 2: professional body pages dominate.** More than three of the top five are professional body websites.
- Signal: students are looking for qualification pathways.
- Hook opportunity: the market mechanism behind the qualification. Not just what the qualification is, but how it is used as a screening signal by employers.

**Pattern 3: employer career pages dominate.** More than three of the top five are employer career pages.
- Signal: students are already in application mode.
- Hook opportunity: the specific application mechanism. What happens after the student applies to these employers, not just that these employers exist.

**Pattern 4: competitor job board pages dominate.** More than three of the top five are competitor career platforms.
- Signal: students are looking for job listings.
- Hook opportunity: the intelligence that job listings do not provide. Job listings show what is available; the hook reveals the timeline, the mechanism, or the hidden filter that determines whether the student will actually be shortlisted.

**Pattern 5: Reddit and forum pages appear in the top 10.** At least one forum thread appears in the top 10 organic results.
- Signal: students are looking for peer experience because official sources have not answered their question.
- Hook opportunity: cross-reference the forum results with the Reddit data block (see the Reddit Voice Skill). Forum content typically reveals the specific confusion or anxiety students hold about this career path. The forum content is often the source of the Tier 1 FAQ question for the page.

## 4.4 Using SERP Data for Para 2 Source Selection

Para 2 requires exactly one external hyperlink to a source that proves the hook's mechanism. SERP results often contain the correct source. Apply the source hierarchy to select the best candidate, then apply the rejection rules to eliminate unsuitable candidates.

**Para 2 source hierarchy (best to worst).** Prefer higher-ranked sources when multiple candidates are available.

1. **Employer's own careers page with a specific programme date or intake size.** A named employer stating a specific fact about their own recruitment is the strongest possible source.
2. **Professional body page with a specific regulatory or programme fact.** Professional bodies publish authoritative pathway facts that prove market mechanisms.
3. **Government data source with a specific statistic.** Government sources are authoritative for occupation-level facts.
4. **Industry association page with a specific market fact.** Lower priority than government data but higher than university careers pages.
5. **University careers centre page.** Lowest priority. University careers pages often lack the specific market fact needed to prove a hook's mechanism.

**Rejection rules.** Do not use a SERP result as the Para 2 source if any of the following apply.

- **Internal platform URL.** The result is from the tool's own domain. Using an internal URL as Para 2 is a critical failure flagged by the Para 2 URL validation monitoring check. Regenerate Para 2 with an external source.
- **Stale time-sensitive content.** The result is more than 18 months old and cites time-sensitive programme dates.
- **Forum or Reddit source.** The result is from Reddit, a professional forum, or user-generated discussion content. Forums are not verifiable external sources for the proof role of Para 2.
- **Competitor job board.** Competitor job boards aggregate listings; they are not primary sources for market mechanism facts.

**Worked example — EXAMPLE CAREER PATH SERP.** The top 5 results include: (1) a named employer's careers page listing the current summer internship intake and application window, (2) a professional body page describing qualification modules, (3) a university careers centre general overview, (4) a forum thread discussing internship experiences, (5) a competitor job board listing internships. Apply the hierarchy: (1) is Level 1 (employer own page, specific fact), (2) is Level 2 (professional body, specific programme fact), (3) is Level 5 (university careers), (4) is rejected under the forum rule, (5) is rejected under the competitor job board rule. Select (1) as the Para 2 source if it is under 18 months old and cites recurring programme framing, or select (2) if (1) violates the staleness rule.

## 4.5 What SERP Data Cannot Tell You

SERP data shows what students are finding, not what students need. A student searching for this career path who only finds description pages still needs the mechanism revealed. The SERP result showing what is available does not tell you what the hook's revelation should be.

The hook direction from the Content Generation Skill takes precedence over SERP data for determining what to reveal. SERP validates or challenges the hook direction, it does not create the hook direction. A SERP result showing that competitor pages already reveal the intended mechanism is a signal to choose a different angle at the same level or a deeper level, not a signal to follow the competitor's approach or to abandon the reveal in favour of matching what competitors say.

SERP data also cannot tell you what the correct salience words are, what the correct regulatory bodies are, or what the correct FAQ questions should be. Those come from the Salience Injector Skill, the Localisation Skill, and the Reddit Voice Skill respectively. SERP is one input to the pre-generation review, not the sole input.

## 4.6 SERP Analysis Checklist

Complete this checklist during pre-generation review and when selecting a Para 2 source. Order matches the work sequence.

**Hook validation.**
[ ] Top 5 organic results read (title and snippet for each) -- if no: hook validation cannot complete
[ ] Each of the top 5 results classified as describing or revealing -- if no: cannot determine whether the hook direction is validated
[ ] SERP composition matched to one of the five patterns in Section 4.3 -- if no: hook opportunity signal not identified
[ ] Hook direction confirmed as validated (all top 5 describing) OR flagged as needing a different angle (a top 5 result already reveals the intended mechanism) -- if no: proceeding with generation may produce a hook the student has already read elsewhere

**Para 2 source selection.**
[ ] Para 2 source hierarchy (Section 4.4 levels 1 to 5) applied to identify best candidate from the SERP results -- if no: Para 2 source not systematically selected
[ ] Candidate source excluded if it is a platform internal URL -- if no: Para 2 URL validation will fire a critical warning after generation
[ ] Candidate source excluded if it is more than 18 months old and cites time-sensitive dates -- if no: staleness rule violation risks stale content in Para 2
[ ] Candidate source excluded if it is from Reddit, a forum, or a competitor job board -- if no: Para 2 source is not verifiable as an external primary source

**Boundary check.**
[ ] Hook direction taken from the Content Generation Skill Section 1.4 (not derived from what SERP results say) -- if no: SERP has been used as a source of hook direction rather than as validation, which is a category error
[ ] SERP data used only for hook validation and Para 2 source selection (not for salience words, regulatory bodies, or FAQ questions) -- if no: SERP has been asked for information it cannot provide
