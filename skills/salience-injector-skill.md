---
skill: Salience Injector Skill
version: 1.0
file: /skills/salience-injector-skill.md
purpose: Career path vocabulary mapping. Provides the salience word approach for every career path, specifies where each term must appear in generated content, and gives the diagnostic procedure for content that lacks field-specific vocabulary.
load when:
  - Reviewing content that feels generic despite passing structural checks
  - Generating content for a career path where previous generations have lacked field-specific vocabulary
  - Applying the sentence craft review's specificity step from the Content Generation Skill
---

> **PORTFOLIO VERSION NOTE:** This file is a sanitised copy of a production vocabulary-calibration skill. The production version contains a hand-built salience word list for roughly forty real career paths across two real markets — real employer names, real credentials, real regulatory bodies. That vocabulary data is a curated commercial asset, so the full list below has been reduced to one worked "EXAMPLE CAREER PATH" entry. Every rule about what salience words are, where they must appear, and how to diagnose their absence is reproduced in full.

## 3.1 What This Skill Is and When to Load It

Salience words are the field-specific vocabulary terms that make generated content feel genuinely specific to a career path and market. Their presence is what separates rung 3 content from rung 4-5 content on the specificity ladder. A section that contains the correct salience words for its career path signals to the reader that the page was written by someone with specific market knowledge. A section that lacks them reads as generic career advice.

Load this skill in any review session where content feels generic despite passing structural checks. Load it for any generation session for a career path where previous generations have lacked field-specific vocabulary. Load it whenever the sentence craft review's specificity step (documented in the Content Generation Skill) is being applied to any section.

## 3.2 What Salience Words Are and Are Not

Salience words are the terms that a practitioner in this field would use naturally in conversation. They are the vocabulary that signals the page was written by someone with specific market knowledge rather than generic career knowledge. A student reading a page with correct salience words feels they are getting insider intelligence. A student reading a page without them feels they are reading a generic careers website.

Salience words are not jargon for its own sake. Jargon is vocabulary used to appear technical. Salience words are vocabulary used because that is what practitioners actually say when they discuss the work. The test: does a practising professional in this field use this term in normal conversation about the job? If yes, it is a salience word. If it only appears in textbooks or press releases, it is jargon and does not belong on the page.

The connection to the specificity ladder is direct. A sentence at rung 3 (specific to career and country) can be complete and technically correct without any salience words. The same sentence at rung 4 (specific to career, country, and employer type) requires salience words to reach that rung. This is the mechanism by which vocabulary determines specificity.

**Worked example using EXAMPLE CAREER PATH content.** The same idea expressed at two rungs.

Rung 3 sentence (no salience words): "Graduates in this field typically pursue a professional qualification and enter industry roles."

Rung 4 sentence (salience words present): "Leading firms select their graduate intake predominantly from their internship cohort, and stated pathway intention is the primary credential signal for shortlisting."

The rung 3 sentence is not wrong. It is accurate. But it could appear on any generic careers site. The rung 4 sentence uses named, specific vocabulary a practitioner would use naturally, signalling that the page understands the specific market mechanism.

## 3.3 Where Salience Words Must Appear

Four page locations have minimum salience word requirements. A page that meets all four is at rung 4 or above across its high-visibility sections.

**The hook (two sentences).** At least two career path salience words must appear across the hook's two sentences. A hook without salience words is at rung 2. It describes the career category rather than the specific market.

**The types table What You'll Work On column.** Every cell must contain at least one salience word (a specific tool name, standard, regulatory body, or specific process term). Cells without salience words are at rung 3 at best and often at rung 2.

**The employer skills section.** Every bullet in this section must contain at least one salience word in its plain text (not just in the bold imperative). The section framing sentence must also contain at least one salience word.

**The application stages.** At least three of the five stages must reference career-path-specific processes, tools, or bodies by name. Generic stage guidance without salience words reads as advice for any professional services career, not advice for this specific path.

Sections not on this list (city table, salary table, Market Insight, career progression, FAQs) also benefit from salience words but do not have hard minimums.

## 3.4 Salience Word List Structure (EXAMPLE CAREER PATH)

The production file contains a complete salience word list for every real career path the tool covers, organised by country where the career path exists in both markets. One worked entry in the real format, illustrating the density and mix of specific terms (tools, credentials, regulatory bodies, and employer types) a real list contains:

**EXAMPLE CAREER PATH.**
- [Professional body abbreviation] ([Professional body full name])
- [Named credential or qualification pathway]
- large-firm
- mid-tier
- service line
- [Named regulator]
- [Named industry-standard software tool]
- rolling shortlist
- [Named employer type, e.g. "boutique advisory"]
- [Named accounting/reporting standard or equivalent for the field]

To adapt this skill for your own domain, replace this entry with one list per career path your tool covers, following the same mix: an abbreviated professional body plus its full name on first use, a specific qualification pathway, specific software or tools, specific regulatory bodies, and specific employer-segment vocabulary (large-firm vs mid-tier vs boutique, or your domain's equivalent).

## 3.5 Diagnosing Missing Salience Words

Three diagnostic levels apply when a section lacks salience words. Run the diagnosis in order: check level 1 first, then level 2, then level 3. The correct fix depends on which level applies.

**Level 1: zero salience words in the section.** The section is at rung 1 or rung 2 on the specificity ladder. It does not mention any specific employer, standard, body, tool, or process term for this career path. The fix: rewrite the section from the career path hook direction (documented in the Content Generation Skill Section 1.4). Do not attempt to inject vocabulary into the existing structure. The problem is not the vocabulary, it is that the section was written without specific market knowledge in the first place.

**Level 2: some sentences contain salience words, others do not.** The section is uneven. Sentences with salience words land at rung 4. Sentences without them land at rung 2 or rung 3. The fix: elevate each low-rung sentence by adding a named example, a specific standard, a named employer, or a named process. This is targeted repair. The section structure is correct; individual sentences need lifting.

**Level 3: salience words present but they feel forced.** Salience words appear in the required density but reading the section it feels like the terms were dropped in artificially. The fix is not vocabulary. The problem is sentence structure. Salience words should emerge from genuinely specific content. The sentence claims something specific, and the salience word is the natural way to state the specific thing. If the salience word can be removed and the sentence still makes the same claim, the word was decorative. Rewrite the sentence to make the specific claim first, and the correct salience word will emerge from it.

**Worked example applied to an EXAMPLE CAREER PATH employer skills section.** If the four employer skills bullets contain zero of the career path's salience terms, Level 1 applies. Rewrite the entire section from the career path's hook direction. If two of four bullets contain terms and two do not, Level 2 applies to the two lacking bullets. Elevate each by adding a specific named firm, a specific standard, or a specific pathway. If all four bullets contain terms but the terms read as bolt-ons (a firm name dropped into an otherwise generic bullet with no functional connection to the bullet's specific claim), Level 3 applies. Rewrite the bullet's core claim to be genuinely specific, then the salience term will be the natural way to say it.

## 3.6 Salience Word Checklist

Complete this checklist during the sentence craft review's specificity step. Order matches the four required locations in Section 3.3.

**Hook.**
[ ] At least two salience words for this career path appear across the hook's two sentences -- if no: hook is at rung 2, rewrite from the career path direction in the Content Generation Skill Section 1.4

**Types table.**
[ ] Every What You'll Work On cell contains at least one salience word (specific tool, standard, regulatory body, or process term) -- if no: identify the cells lacking terms and apply Section 3.5 diagnosis Level 2

**Employer skills section.**
[ ] The framing sentence contains at least one salience word -- if no: rewrite framing sentence to name what the employer filter actually looks for
[ ] Every bullet's plain text (not just the bold imperative) contains at least one salience word -- if no: apply Section 3.5 diagnosis to identify whether Level 1, 2, or 3 applies

**Application stages.**
[ ] At least three of the five stages reference career-path-specific processes, tools, or bodies by name -- if no: generic stage guidance detected, elevate at least three stages

**Section-wide diagnosis.**
[ ] For any section flagged with missing salience words, Section 3.5 diagnostic level (1, 2, or 3) has been identified -- if no: fix will be applied to wrong problem
[ ] Fix applied matches the diagnostic level (rewrite for Level 1, elevate for Level 2, restructure sentence for Level 3) -- if no: injecting vocabulary into a Level 1 or Level 3 problem will not fix the underlying issue
