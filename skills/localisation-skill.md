---
skill: AU/NZ Localisation Skill
version: 1.0
file: /skills/localisation-skill.md
purpose: Complete localisation reference for generating and reviewing AU and NZ career path content. Prevents jurisdiction errors, wrong statute names, wrong regulatory bodies, and regressions on documented data fixes.
load when:
  - Reviewing any generated page before publishing
  - Adding a new career path
  - Updating content after a regulatory or statutory change
  - Any session where AU or NZ-specific rules apply
---

> **PORTFOLIO VERSION NOTE:** This file is a sanitised copy of a production skill. The production version names real regulatory bodies, real statutes, and real employers for roughly forty real career paths, built up from a documented set of over seventy real data corrections found during live stress-testing — that correction log is itself a proprietary record of the underlying business's quality control work. The spelling and currency conventions below are standard English/publishing conventions and are reproduced verbatim; the regulatory-body reference, the "critical distinctions" list, and the known-fixes log have each been reduced to one illustrative fictional entry showing the pattern.

## 2.1 What This Skill Is and When to Load It

Localisation errors are wrong statute names, wrong regulatory body names, wrong currency formatting, wrong spelling, or wrong references to programmes that no longer exist. Every localisation error is immediately visible to a practitioner in that field. A specialist reading the wrong statute name for their jurisdiction stops reading. A practitioner sees a defunct programme referenced as current and knows the page is out of date. These errors damage page credibility on first read and cannot be corrected after publication without a full content refresh.

Load this skill when reviewing any generated page before publishing, when adding a new career path to the tool, when updating content after a regulatory or statutory change, or in any session where AU or NZ-specific rules apply. Load this skill in addition to the Content Generation Skill when reviewing content: that skill covers argument structure and craft, this skill covers jurisdiction correctness.

## 2.2 Spelling Rules

Use British and Australian English throughout all AU and NZ content. Every word below has one correct spelling on generated pages. The common wrong spelling appears in parentheses.

- **programme** (not program)
- **labour** (not labor)
- **organisation** (not organization)
- **honour** (not honor)
- **analyse** (not analyze)
- **centre** (not center)
- **licence** as a noun, **license** as a verb: "the professional licence" but "firms license their software"
- **practise** as a verb, **practice** as a noun: "candidates practise interview questions" but "the accounting practice"

**Programme exception.** When quoting an employer's official programme name that uses American spelling, match the employer's spelling in that specific reference only. In every other context including generic references and headings, use programme.

## 2.3 Currency Rules

**AU pages.** Use AUD. Format as "AUD $[amount]" or "A$[amount]" in tables. Use "$[amount]" in prose when the AU context is already clear on the page.

**NZ pages.** Use NZD. Format as "NZD $[amount]" or "NZ$[amount]" in tables. Use "$[amount]" in prose when the NZ context is already clear on the page.

Never mix currencies on the same page. A single page presents salary and financial data in one currency only. Never assume AU salary figures apply to NZ pages or NZ figures apply to AU pages. Salary differences between the two markets are material and cross-referencing them creates misleading page content.

## 2.4 Regulatory Bodies and Key Terms by Career Path (Structure)

In production, this section lists the correct regulatory bodies, professional bodies, statutes, and key terms for every real career path the tool generates, with the AU and NZ versions kept strictly separate wherever a career path exists in both markets. One worked entry, in the real format:

**EXAMPLE CAREER PATH (NZ).**
- [Professional body abbreviation] ([professional body full name]): the professional body
- [Named regulator]: the relevant conduct or tax authority
- [Named reporting-standards body]: sets the jurisdiction's own accounting/reporting standards
- The jurisdiction's qualification structure uses [current pathway name], not [a retired or superseded pathway name] — note any programme that has been renamed or restructured so the retired name is never used as if still current

**EXAMPLE CAREER PATH (AU).**
- [Equivalent professional body for the other market]: professional body, alternative or equivalent qualification
- [Named regulator]: the relevant conduct or tax authority for this market
- The two markets' bodies and statutes are never interchangeable — the mechanism for keeping AU and NZ terminology separate is the same regardless of career path

To adapt this skill for your own domain, replace this entry with one pair of entries (or one entry per market you operate in) per career path, each naming the real regulatory bodies, statutes, and terms for that specific market — and flagging any body or statute that has recently been renamed, merged, or repealed, since a stale name is the single most common credibility failure a specialist reader catches.

## 2.5 Critical Jurisdiction Distinctions: Never Confuse These

In production, this section lists several commonly confused pairs specific to the real career paths and real statutes the tool covers. Each is a hard rule: getting one wrong is a jurisdiction error, not a style preference. One worked entry, in the real format:

**Illustrative pattern — [Statute A] (Market 1) vs [Statute B] (Market 2).**
[Statute A] is Market 1's governing statute for this subject area. [Statute B] is Market 2's equivalent statute. Using [Statute B]'s name on a Market 1 page is a jurisdiction error. Using [Statute A]'s name on a Market 2 page is a jurisdiction error. The two statutes cover similar territory but they are not interchangeable, and any specialist reading the wrong statute name on the wrong-market page stops reading.

A second common pattern in the real file: two bodies that sound similar but administer different functions within the same market (a listing-rules administrator versus a conduct regulator, for example) — the fix is always the same: name the exact body responsible for the exact function being described, never the more familiar or more general body.

A third common pattern: a policy or programme that was renamed or repealed and replaced with a current equivalent — the fix is to always use the current name, and only reference the old name in explicit historical context if necessary.

To adapt this skill for your own domain, populate this section with the specific pairs your own content repeatedly confuses, found the same way the production list was built: by tracking every jurisdiction-level correction made during live review.

## 2.6 Known Data Fixes: What Was Corrected (Structure)

In production, this section is a running log of every documented localisation fix made to the real data layer, each stated as: what was wrong, what it was changed to, and which career paths were affected. Reviewers checking for regressions use this list before publishing new content. One worked entry, in the real format:

1. **[Wrong term or attribution] → [correct term or attribution].** Wrong: [what the page said]. Correct: [why it was wrong and what the accurate statement is]. Career paths affected: [which real career paths this fix applies to].

The value of this section is entirely in it being kept current and specific — every fix a reviewer makes to jurisdiction, regulatory-body, or named-entity content during live review should be logged here in this exact three-part format (wrong, correct-and-why, affected paths), so the same mistake is never reintroduced on a later regeneration of the same career path.

## 2.7 City Table Expected Entry Counts (Structure)

In production, this section is a reference table of the expected city/region table entry count for every real career path, used during review to identify pages with data gaps (a career path that should return 20+ city pages but returns 3 signals a data problem, not a content problem). One illustrative row:

| Career path | Expected entries | Notes |
|---|---|---|
| EXAMPLE CAREER PATH | 15 to 20 | Concentrated in the country's two or three largest cities |

To adapt this skill for your own domain, populate this table from your own data layer's actual output per career path, and use material deviations from the expected count as a signal to investigate the data layer rather than the generated content.

## 2.8 Localisation Review Checklist

Complete this checklist during and after review of any generated page. Order matches the work sequence.

**Spelling.**
[ ] All key words use British or Australian spelling (programme, labour, organisation, honour, analyse, centre) -- if no: replace American spelling globally
[ ] Any "program" references are exceptions for official employer programme names only -- if no: replace with programme
[ ] Licence used as noun, license used as verb -- if no: correct usage per meaning
[ ] Practise used as verb, practice used as noun -- if no: correct usage per meaning

**Currency.**
[ ] Page uses only one currency throughout (AUD for AU pages, NZD for NZ pages) -- if no: replace mixed currency references
[ ] Currency formatting matches: AUD $[amount] or A$[amount] for AU, NZD $[amount] or NZ$[amount] for NZ -- if no: reformat all currency references

**Regulatory bodies and statutes.**
[ ] Every named regulatory body matches the career path market -- if no: replace with correct body for the market
[ ] Statute names match the correct market and have not been swapped between AU and NZ -- if no: jurisdiction error, correct immediately
[ ] Listing/conduct-style body attributions are correct and not swapped between adjacent regulators -- if no: correct attribution
[ ] No policy or programme is referenced as current if it has been renamed, merged, or repealed -- if no: replace with the current name
[ ] Any "universal" claim about a named test, assessment, or requirement is reframed as an example unless it is genuinely universal -- if no: reframe as example

**Data fixes and named entities.**
[ ] Named entities requiring exact spelling (accented characters, apostrophes, capitalisation) are spelled correctly -- if no: correct spelling
[ ] No specific software version numbers are cited -- if no: replace with "current release"
[ ] No specific certification product names are cited if they are known to change frequently -- if no: replace with generic framing and a pointer to the current official source
[ ] No named major project or initiative is cited as current if it has since completed or been superseded -- if no: replace with the current equivalent
[ ] No named employer is cited as offering a specific programme it does not actually run -- if no: remove or correct the reference
[ ] Qualifiers like "predominantly" are used instead of "exclusively" wherever the underlying fact is a strong majority rather than a universal rule -- if no: replace qualifier
[ ] Any named professional title used on the page is a real, current title in that jurisdiction -- if no: replace with the correct current title

**City table.**
[ ] City table entry count within expected range for this career path (see Section 2.7) -- if no: investigate data gap or accept a documented, known limitation
