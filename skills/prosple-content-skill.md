---
skill: Content Generation Skill
version: 1.0
file: /skills/prosple-content-skill.md
purpose: Primary operating guide for generating and reviewing career-path landing pages against the complete quality standard.
load when:
  - Generating a page for any career path
  - Reviewing a generated page against the quality standard
  - Diagnosing a specific quality failure identified during review
  - Adding a new career path to the tool
---

> **PORTFOLIO VERSION NOTE:** This file is a sanitised copy of a production content-quality skill. The production version documents ten real career paths across two real markets, each with specific worked examples naming real employers, real regulatory bodies, and real credentials, built up over multiple rounds of live stress-testing. That per-path editorial detail is the proprietary output of the underlying business, so every worked example below has been collapsed to one consistent, clearly-labelled "EXAMPLE CAREER PATH" instead of the ten real ones. Every structural rule, test, mechanism, and checklist is reproduced in full — this is genuinely reusable content-quality-engineering methodology with no proprietary data of its own.

## 1.1 What This Skill Is and When to Load It

This skill is the primary operating guide for the content generator. It contains the complete quality standard for generating and reviewing career-path landing pages: argument structure, page elements with word counts, hook quality rules, bullet dimension lock, Para 2 rules, transitions, sentence craft, FAQs, monitoring system reference, pre-generation checklist, review workflow, five signals of a complete page, and known limitations with responses.

Load this skill for sessions that generate a page, review a generated page, diagnose a specific quality failure, or add a new career path. For sessions focused only on localisation, salience gaps, or SERP or Reddit interpretation, load the relevant dedicated skill instead.

## 1.2 The Four-Part Argument

Every generated page is a four-part argument. Not a template, not a structure with variable content, an argument. The four parts:

1. **Hook.** The thesis. Two sentences that reveal the hidden market mechanism the student did not know about before arriving on the page.
2. **Para 2.** The proof. One externally sourced fact that proves the hook's mechanism is real. Exactly one hyperlink to an external source.
3. **Four quick action bullets.** The practical response. Four actions the student must take differently because the hook's revelation is real.
4. **Everything else.** The elaboration. Every remaining section (types, employer skills, city table, application stages, salary and Market Insight, career progression, FAQs) answers the hook's question from a different angle.

The self-checking mechanism. Convert the hook into the question it creates. Every subsequent section must answer that question. If a section does not answer it, the section is either structurally wrong or needs rewriting.

**Worked example — EXAMPLE CAREER PATH.** The example hook direction reveals that graduate hiring runs through a structured intern-to-grad conversion pipeline, not through open graduate applications. Convert this into the question it creates: *how does the conversion pipeline work and how do I get on the right side of it before applications open?* Every section on the page must answer some part of that question. The types table answers what kinds of work the intern cohort does. The employer skills section answers what firms are filtering for when they select the intern cohort. The application stages answer the sequence for competing to enter the intern cohort. The FAQs answer the specific student anxieties about not making it into the intern cohort. If any section answers a different question (for example, generic advice about the profession), that section fails the self-check and must be rewritten.

## 1.3 Page Structure and Word Count Reference

Every generated page contains eleven elements in this exact order:

1. **H1 heading**: 8 to 14 words
2. **Hook**: 25 to 45 words, two sentences
3. **Para 2**: 20 to 35 words, one external hyperlink
4. **Four quick action bullets**: 80 to 130 words combined, bold imperative plus plain text per bullet
5. **Types table**: 280 to 400 words including H2 heading and framing sentence
6. **Employer skills section**: 280 to 380 words including H2, framing sentence, and 4 to 5 bullets
7. **City table**: 60 to 120 words, hyperlinked city or region links
8. **Application stages**: 250 to 320 words, five numbered stages under H2
9. **Salary table and Market Insight**: 100 to 160 words including two-sentence Market Insight
10. **Career progression table**: 220 to 320 words, four-row table with footnote
11. **FAQs**: 500 to 650 words, three FAQ answers under H2

Total page target: 1,800 to 2,200 words. This is the operational target confirmed across multiple generations. A page under 1,800 words is under-elaborated; a page over 2,200 words has redundant content that dilutes the argument.

Below-target consequence: the element is not doing its job. Above-target consequence: the element is duplicating what an earlier element already said.

## 1.4 Hook Quality: Three Tests and the Career Path Direction Pattern

Every hook must pass three tests before the page is accepted.

**Test 1: Information value.** After reading the two hook sentences, does the student know something specific they could not have predicted before arriving on the page? The hook must reveal, not describe. A hook that summarises what the career is (what practitioners in this field do, day to day) has described. A hook that reveals a mechanism the student did not know operates in this market has revealed.

Illustrative fail (describes, EXAMPLE CAREER PATH): "Graduates in this field work in large firms, mid-tier firms, or industry roles across the country's major cities." The sentence is accurate. It could appear on any generic careers site. The student could have predicted every fact in it before reading.

Illustrative pass (reveals, EXAMPLE CAREER PATH): a hook that reveals the intern-to-grad conversion mechanism (that graduate cohorts are selected predominantly from intern cohorts before general graduate applications open). This is a claim the student could not have predicted from a generic understanding of the field.

**Test 2: Language.** Every word must be specific. Replace abstract nouns with named entities. Remove hedging qualifiers (often, typically, generally, usually, in many cases). No comma-joined sentences doing two jobs at once.

Illustrative fail (hedged and comma-joined): "Graduates in this field typically pursue a professional qualification, and this pathway generally involves a professional body registration process." Two hedging qualifiers ("typically", "generally"), a comma-joined compound sentence doing two jobs, and abstract nouns instead of named entities.

Illustrative pass (specific, single job per sentence): "[Named credential] registration is the primary credential signal [named employer type] uses to categorise internship applicants." One sentence, one job, specific named entities, no hedges.

**Test 3: Coherence.** The hook must match the page keyword exactly. A hook about one specific discipline on a page targeting six disciplines is incoherent. A hook about graduate roles on a page targeting internships is incoherent.

Illustrative fail: a hook about one narrow sub-discipline on a broad multi-discipline keyword page. A hook about only one discipline leaves the reader in the other disciplines with no revealed mechanism for their situation.

Illustrative pass: a hook about the discipline-differentiation problem itself (that treating the field as one undifferentiated market is the strategic error). This matches the broad keyword because it addresses all disciplines through the meta-observation that they differ.

**Sentence 2 must raise stakes, not restate sentence 1.** Three correct sentence 2 structures:

- **Structure A: personal consequence.** Name the specific consequence for the student who does not know the hook's truth.
- **Structure B: strategic change.** Name the specific strategic change the student must make because the hook's truth is real.
- **Structure C: reveal the hidden process.** Reveal the mechanism behind the market phenomenon named in sentence 1.

**The restatement trap.** Remove sentence 2. Does sentence 1 still communicate the hook's full point? If yes, sentence 2 is restating. Rewrite sentence 2 to raise stakes using Structure A, B, or C.

**Statistics rule.** A specific percentage in the hook requires a sourced figure. Unsourced percentages must use directional language ("the large majority," "most graduates," "a small share") not a specific number. Fabricating a percentage to sound authoritative is a hook failure that damages page credibility if a reader checks the source.

**The career path hook direction pattern.** In production, every career path the tool covers has its own direction entry in this section — what to reveal, the question it creates, and which sentence 2 structure to use. These are directions, not template sentences; they are never reproduced verbatim in generated content. One worked entry, in the real format:

**EXAMPLE CAREER PATH.** Reveal that graduate hiring is dominated by a structured intern-to-grad conversion pipeline, not by open graduate applications. The graduate pool competes for what the intern cohort has already claimed. Question created: *how does the mechanism work and how do I get on the right side of it before applications open?* Sentence 2 structure: **C** (reveal the hidden process of how the intern cohort becomes the graduate cohort).

**FOR ALL OTHER CAREER PATHS.** Before defaulting to a generic hook, identify the specific hidden mechanism, threshold, or process for this career path that a student could not have predicted, convert it into the question it creates, and select the sentence 2 structure (A, B, or C) that fits.

## 1.5 The Bullet Dimension Lock

Every bullet on every page must address exactly one of five named dimensions. The dimensions are always written in capital letters.

- **TIMING.** When to act and what happens if the window is missed. Application deadlines, rolling shortlist mechanics, year-in-degree positioning, sequence of milestones within a recruitment cycle.
- **CREDENTIAL_SIGNAL.** What qualification, certification, membership, or stated intention to signal in the application. Professional body memberships, stated pathway intentions, specific certifications.
- **TECHNICAL_PROOF.** What specific technical evidence to demonstrate. Software certifications, portfolio depth, specific tool proficiency, demonstrated project examples.
- **STRATEGY.** Which employers to target in what order using what positioning. Mid-tier versus top-tier, boutique versus large-firm, primary versus secondary application windows.
- **MARKET_MECHANISM.** How the specific market or hiring process actually works. Owned by the hook. Almost never assigned to a bullet.

**Ownership rules.** The hook always owns MARKET_MECHANISM. If the hook also names a specific timing fact, it also owns TIMING. No bullet may use a dimension the hook already owns. No two bullets may use the same dimension.

**The assignment process.** Run all five steps before drafting any bullet.

1. Identify every dimension the hook owns.
2. Assign Bullet 1 the most time-sensitive unused dimension.
3. Assign Bullet 2 a different unused dimension.
4. Assign Bullet 3 a different unused dimension.
5. Assign Bullet 4 the final unused dimension.

**The 8-word imperative cap.** The bold imperative at the start of each bullet is 8 words maximum. Post-processing monitoring flags any imperative exceeding 8 words.

**EXAMPLE CAREER PATH dimension analysis (worked example).** The example hook reveals that internships are the primary selection mechanism. The hook does not name a specific timing fact. Hook ownership: MARKET_MECHANISM only. Available for bullets: TIMING, CREDENTIAL_SIGNAL, TECHNICAL_PROOF, STRATEGY. Assignment:

- **Bullet 1 = TIMING.** The most time-sensitive dimension for a student who has just accepted that internships are the decision mechanism: when to apply for the internships themselves.
- **Bullet 2 = CREDENTIAL_SIGNAL.** What professional body pathway intention to signal upfront so the firm categorises the applicant correctly.
- **Bullet 3 = TECHNICAL_PROOF.** What specific technical certification to acquire before applying to eliminate a first-week onboarding gap.
- **Bullet 4 = STRATEGY.** Which employer segment to target for the second-chance application window.

Do not draft the bullet text until the dimension assignment is complete. Drafting bullets and then classifying them is the common failure mode that produces dimension conflicts.

## 1.6 Para 2 Rules

Para 2 proves the hook's mechanism using one externally sourced fact. Four-step verification runs before Para 2 is accepted.

1. **Select the fact.** The fact must directly prove the hook's mechanism, not provide context around it. A fact about the profession generally does not prove a specific mechanism claim.
2. **Verify the URL is external.** The hyperlink must not link to any of the platform's own URLs. An internal platform URL in Para 2 is a critical failure. The post-processing monitoring check flags this and the reviewer regenerates Para 2 only.
3. **Count hyperlinks.** Exactly one hyperlink in Para 2. Zero hyperlinks fails the proof requirement (unless the sourced-fallback rule below applies). Two or more hyperlinks dilutes the proof and confuses the sourcing.
4. **Verify the proof.** Read Para 2 and ask: does this prove the hook's specific claim, or does it provide context that surrounds the claim without proving it? Context is not proof. Rewrite Para 2 if the answer is context.

**Staleness rule.** Use recurring framing not specific past-year dates. Correct: "applications typically open in late July each year." Incorrect: "in 2024, applications opened on 22 July." Specific past-year dates become stale immediately and require replacement with each cycle.

**Fallback rule.** If no external sourced fact is available for a specific hook mechanism, write Para 2 using documented career path knowledge and add an editorial note flagging that a sourced fact should be added before publishing. Do not fabricate a source. Do not use an internal platform URL as a substitute.

## 1.7 Transitions and Section Flow

Transitions between sections carry more weight than they appear to. The load-bearing framing sentence is the connective tissue that makes each section feel like the answer to the hook's question.

**The load-bearing sentence test.** Cut the framing sentence from any transition. If the transition still works without it, the sentence was decorative. Rewrite it to do structural work. If cutting it breaks the transition, the sentence was load-bearing and can stay.

**Types table framing sentence.** Must explain why the student needs to understand the sub-types now. Must not restate the H2 heading in prose.

Correct pattern (EXAMPLE CAREER PATH): "Your choice between specialisation and generalist positioning determines which employers will consider your internship application in the first shortlisting round." The sentence names the decision the student must make and the criterion for making it, and it identifies the immediate stakes.

Incorrect pattern: "There are several types of roles in this field. These include..." This pattern restates the heading and provides no decision context. The student learns nothing about why the sub-types matter or which one applies to their situation.

**Employer skills framing sentence.** Must use the contrast structure: what students assume the filter looks for (wrong assumption) versus what the employer actually assesses (correct answer). This structure makes the section feel like a correction of a misconception rather than a list of desirable qualities. Applied to EXAMPLE CAREER PATH: contrast the common assumption that employers filter primarily on academic results at the shortlisting stage against the documented reality that firms filter on stated pathway intention combined with demonstrated tool certification in the CV.

**Market Insight two-sentence rule.** Exactly two sentences. Sentence 1 names the specific factor driving salary variation for this career path. Sentence 2 gives evidence and creates forward pull toward the career progression table below. Must not be a comma-joined compound sentence attempting to do both jobs in one sentence.

Correct pattern (EXAMPLE CAREER PATH): "Salary variation at graduate level tracks employer segment more strongly than experience level, since all first-year associates start within a narrow band. Progression to senior associate at larger firms brings the largest single-year salary lift in this pathway." Two sentences: sentence 1 names the variation factor (employer segment), sentence 2 creates forward pull toward progression.

Incorrect pattern (comma-joined compound doing two jobs): "Salaries vary by employer and by experience, with progression to senior roles bringing higher pay and larger firms offering the largest lifts." One sentence attempting to name the factor, give the evidence, and create forward pull. The reader retains none of the three points clearly.

**Floating orientation paragraph.** A standalone paragraph beginning with "Your [X] determines..." that appears between the last quick action bullet and the types table H2 heading is a structural failure. This is not fixed by deleting the paragraph. The correct fix integrates the content into the types table framing sentence so the orientation becomes part of the transition rather than a separate element.

## 1.8 Sentence Craft and Table Cells

**One-job rule.** Every sentence does exactly one job. A sentence doing two jobs does neither well. The most common violation is a comma-joined compound sentence where a claim and its evidence are merged. Split into two sentences: claim, then evidence.

Illustrative failure (comma-joined compound, two jobs merged): "The internship application process opens in penultimate year and requires strong academic results, with successful candidates typically receiving offers before the end of that year." The sentence attempts to state the timing rule, name the entry criterion, and state the outcome timeline in one clause. The reader retains none of the three cleanly.

Illustrative fix (two sentences, one job each): "Internship applications open in penultimate year at leading employers. Successful candidates receive offers before the end of that year, which converts to a graduate role after final-year completion." Sentence 1 states the timing rule. Sentence 2 states the outcome timeline.

**Specificity ladder: five rungs.** Target: at least 70% of sentences at rung 4 or 5.

- **Rung 1.** Generic truth about any career. Example content: "hard work and dedication are important." Cut or elevate.
- **Rung 2.** True for this career category but not this specific market. Example content: "practitioners need strong analytical skills." Elevate by adding market or country specificity.
- **Rung 3.** Specific to career and country. Example content: "graduates in this field typically pursue a professional qualification." Acceptable minimum but rarely optimal.
- **Rung 4.** Specific to career, country, and employer type. Example content: "leading firms select their graduate intake predominantly from their internship cohort." Strong.
- **Rung 5.** Specific to career, country, employer type, and moment. Example content: "the current intern intake competes for graduate positions before general graduate applications open." Excellent when the specific fact is sourced.

**Active student test.** After reading any sentence, does the student know something specific enough to act on in the next 48 hours? If not, elevate to a higher rung or cut the sentence.

Illustrative fail: "Consider a career in this field." The student cannot take a specific action within 48 hours based on this sentence.

Illustrative pass (EXAMPLE CAREER PATH salience words): "Confirm your professional pathway intention with the relevant body before submitting internship applications this cycle." The student can complete this specific action within 48 hours.

**Evidence sentence rule: three forms.** Every claim must be followed immediately by evidence in one of these three forms:

- **Form 1: named example.** A specific employer, programme, regulation, or standard by name.
- **Form 2: specific sourced quantity.** A number that comes from a citable source.
- **Form 3: specific consequence.** What happens to the student who ignores the claim.

A claim followed by no evidence is a rung 2 or rung 3 sentence in disguise. Add evidence in one of the three forms or cut the claim.

**Table cell length rules.** Post-processing monitoring flags cells over 20 words. Prompt-level targets are stricter than the enforcement limit:

- **Types table What You'll Work On column.** 12 words maximum per cell (prompt target), 20 words hard limit (post-processing enforcement).
- **Types table Related Sector column.** One sector name, 5 words maximum.
- **Types table Similar Role Titles column.** Maximum three titles, 15 words total.
- **Career progression Focus column.** 12 words maximum.
- **Career progression Responsibilities column.** 20 words maximum.

## 1.9 FAQ Rules

**The four-sentence formula.** Every FAQ answer contains exactly four sentences with specific jobs.

- **Sentence 1: direct answer naming a specific entity.** No preamble.
- **Sentence 2: specific detail not already on the page.** Must pass the redundancy test.
- **Sentence 3: practical action.** Must pass the connection test — could this action have been written without reading sentences 1 and 2?
- **Sentence 4: insider insight.** Must fail the careers centre test — a university careers centre would NOT publish this sentence.

**Four failure modes.**

- **Safe pivot.** The answer pivots from the uncomfortable question to something the writer is more comfortable answering.
- **Credential dump.** The answer lists information already on the page.
- **Percentage without context.** A percentage is given without naming what determines which group the student belongs to.
- **Generic sentence 4.** Sentence 4 reads like advice a university careers adviser would give.

**Question selection hierarchy: four tiers.**

- **Tier 1 (FAQ 1).** Corrects a dangerous misconception. Acting on the wrong belief costs the student most.
- **Tier 2 (FAQ 2).** Extends the hook's insight one level deeper.
- **Tier 3 (FAQ 3).** Resolves genuine ambiguity from the application stages.
- **Tier 4 (avoid as FAQ 1).** Personalises salary or career progression information. Acceptable as FAQ 3 in some cases; never acceptable as FAQ 1.

**Three voice tests.** Every FAQ answer must pass all three: careers centre test, mentor test, redundancy test.

## 1.10 Monitoring System Quick Reference

Nine post-processing checks run after every generation. Two are GUARANTEED (they modify content before delivery). Seven are MONITORING (they log warnings for reviewer action).

| # | Check | Type | Trigger | Reviewer action |
|---|---|---|---|---|
| 1 | Em dash removal | GUARANTEED | Any em dash present | None: content modified automatically |
| 2 | Application stage trimming | GUARANTEED | Any stage over word cap | None: stages trimmed automatically |
| 3 | Para 2 URL validation | MONITORING | Internal platform URL OR more than one hyperlink | Regenerate Para 2 only, not full page |
| 4 | Bullet dimension conflict | MONITORING | Classifier detects two bullets as same dimension | Regenerate once. If recurs, fix in place using Section 1.5 assignment process |
| 5 | Bullet imperative word count | MONITORING | Bold imperative exceeds 8 words | Shorten imperative in place |
| 6 | Hook comma splice | MONITORING | Sentence 2 pattern matches comma splice | Rewrite hook sentence 2 as two complete sentences |
| 7 | Floating orientation paragraph | MONITORING | Standalone "Your [X] determines..." paragraph before types table H2 | See Section 1.7. If recurs on same page three times, fix in place permanently |
| 8 | Table cell word count | MONITORING | Any table cell over 20 words | Shorten cell content in place |
| 9 | Section specificity | MONITORING | Classifier rates any sentence in FAQs, career progression, or types table at rung 1 or rung 2 | Elevate the flagged sentence using the specificity ladder rules in Section 1.8 |

When multiple warnings fire, address blocking warnings first (Para 2 URL failure, hook fails information value test).

## 1.11 Pre-Generation Checklist, Review Workflow, and Five Signals

**Pre-generation checklist.** Run all five items before triggering generation. Any item that fails stops the generation.

1. Confirm the keyword matches the correct URL. Check the career path matrix. Wrong URL produces wrong-market content.
2. Confirm the data block is returning results for this career path. Empty data block produces a page with no employer names and no city entries.
3. Confirm the research block is returning fresh data. Data more than 18 months old produces stale Para 2 candidates.
4. Confirm the city table has entries for this career path. Empty city table on a page that should have one is a structural failure visible to the reader.
5. Note the expected monitoring warnings for this career path. Warnings already expected on this page do not require investigation when they fire.

**Standard review workflow.** Five steps in order after every generation. Total time: 12 to 15 minutes per page.

1. **Console log check (2 min).** Read the log against the Section 1.10 monitoring table. Resolve blocking warnings first.
2. **Word count scan (3 min).** Compare each section against the Section 1.3 ranges. Flag any section significantly outside its range.
3. **Five-question final reading test (5-7 min).** Run every question below in sequence. Binary pass or fail with one-sentence justification for each.
4. **Five signals check (2 min).** Read the page as a student would. Assess each signal below.
5. **Resolve and publish or regenerate.** If all steps pass, publish. If a signal fails, apply Section 1.7 or Section 1.9 fixes in place. If a rule test fails, apply the regeneration decisions in Section 1.10.

**The five questions of the final reading test (Step 3).**

1. **Hook test.** After reading the first two sentences, does the student know something specific enough to change what they do next?
2. **Introduction test.** After reading the hook, Para 2, and the four bullets, does the student have one market truth, one proof, and at least three distinct actions?
3. **Section flow test.** At each section boundary, does the student understand why they are reading this section now?
4. **Employer skills test.** Does the student know what evidence type the filter looks for, what a shortlisted application looks like, and what a rejected application looks like?
5. **FAQ test.** Has the student received at least two answers not findable by Googling, and at least one that requires changing their strategy?

**The five signals of a complete page.**

1. **The hook creates urgency.** The reader wants to keep reading after the hook.
2. **The bullets feel different from each other.** Each bullet addresses a distinctly different problem.
3. **The employer skills section feels like a correction of a misconception.** The reader finishes thinking "I was optimising for the wrong thing."
4. **The Market Insight creates a question.** The reader wants to know more about progression after the two sentences.
5. **At least one FAQ answer says something the student did not want to hear.**

## 1.12 Known Limitations

Known limitations persist despite prompt-level fix attempts, documented as: what it is, whether monitoring catches it, and the current reviewer response. In production this section names the specific real career paths where each pattern recurs; one worked entry, in the real format:

1. **Floating orientation paragraph.** Persists on a documented subset of career paths despite multiple prompt-level fix attempts. Monitored by check 7. When it fires: apply the Section 1.7 fix (integrate into framing sentence). After three consecutive occurrences on the same page, fix in place permanently and skip regeneration.
2. **Dimension conflicts.** A meaningful share of runs produce a genuine dimension conflict flagged by check 4. When it fires: regenerate once. If the same conflict recurs, fix in place using the Section 1.5 assignment process rather than continuing to regenerate.
3. **Word count overrun.** Pages consistently generate at 1,800 to 2,200 words. This is not a bug — this is the correct operational target recalibrated after live generations confirmed this as the real output length. Do not attempt to compress to a shorter target.
4. **Table cell length overshoot below monitoring threshold.** The prompt-level target for the What You'll Work On column is 12 words per cell. The model consistently overshoots by 1 to 4 words. The post-processing monitoring check only fires at 20+ words, so this overshoot goes uncaught by automated checks. When identified in review: shorten cells over 12 words in place.

**Career path matrix quick reference.** In production, every career path the tool generates has a row in this table with its URL and the specific monitoring warnings expected to fire on that path. Reviewers use it during the pre-generation checklist (Section 1.11 item 5). One illustrative row:

| Career path | URL | Expected monitoring warnings |
|---|---|---|
| EXAMPLE CAREER PATH | your-platform.com/example-career-path-internships | Floating paragraph, bullet imperative (1-2 per run) |

## Skill 1 Checklist

Complete this checklist during and after every review. Order matches the work sequence.

**Pre-generation.**
[ ] Keyword matches the correct URL for this career path -- if no: fix keyword or URL before generating
[ ] Data block returning results -- if no: stop and investigate data layer before generating
[ ] Research block returning data under 18 months old -- if no: stop, no fresh Para 2 source available
[ ] City table has entries for this career path -- if no: stop or accept documented gap (see Localisation Skill)
[ ] Expected monitoring warnings noted from Section 1.12 -- if no: unexpected warnings will slow review

**During review: console log.**
[ ] All check 3 (Para 2 URL) warnings resolved by regenerating Para 2 only -- if no: page cannot publish
[ ] All check 4 (dimension conflict) warnings resolved by regeneration or in-place fix -- if no: bullets do not deliver four distinct actions
[ ] All check 5 (imperative over 8 words) warnings resolved in place -- if no: prompt discipline drifts
[ ] All check 6 (hook comma splice) warnings resolved by rewriting sentence 2 -- if no: hook fails Test 2
[ ] All check 7 (floating paragraph) warnings resolved by integrating into framing sentence -- if no: transition fails
[ ] All check 8 (table cell over 20 words) warnings resolved by shortening cells -- if no: table cells become paragraphs
[ ] All check 9 (rung 1-2 sentence) warnings resolved by elevating to rung 4-5 -- if no: page reads as generic

**During review: word counts.**
[ ] All 11 elements within their Section 1.3 ranges -- if no: identify under-elaborated or duplicating elements
[ ] Total page 1,800 to 2,200 words -- if no: check for missing sections (under) or duplication (over)

**During review: five-question reading test.**
[ ] Hook test passes -- if no: rewrite hook from Section 1.4 direction
[ ] Introduction test passes -- if no: rewrite failing element
[ ] Section flow test passes -- if no: rewrite framing sentence
[ ] Employer skills test passes -- if no: apply contrast structure
[ ] FAQ test passes -- if no: rewrite failing FAQ

**During review: five signals.**
[ ] Hook creates urgency -- if no: sentence 2 restatement trap likely, apply Section 1.4 restatement test
[ ] Bullets feel different from each other -- if no: dimension lock violated, apply Section 1.5 assignment
[ ] Employer skills feels like a correction of a misconception -- if no: contrast structure missing, apply Section 1.7
[ ] Market Insight creates a question -- if no: sentence 2 closed the topic, rewrite for forward pull
[ ] At least one FAQ says something the student did not want to hear -- if no: safe pivot in one or more FAQs, apply Section 1.9

**Post-review.**
[ ] Publish or regenerate decision made per Section 1.10 rules -- if no: unresolved failure will reach reader
[ ] Known limitations firing on this page were expected per Section 1.12 -- if no: investigate as new failure pattern
