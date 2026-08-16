---
skill: Reddit Voice Skill
version: 1.0
file: /skills/reddit-voice-skill.md
purpose: Extraction of student anxiety patterns from Reddit data for calibrating FAQ question selection, hook specificity, and page vocabulary. Translates between what students say on Reddit and what they need on the page.
load when:
  - Calibrating FAQ question selection for a page (particularly the Tier 1 FAQ)
  - Assessing whether the hook direction accounts for what students are actually discussing
  - Reviewing FAQ answers that feel generic
  - Calibrating page vocabulary against actual student language usage
---

> **PORTFOLIO VERSION NOTE:** This file is a sanitised copy of a production skill. The worked examples in the production version are built around real career paths, real subreddit communities, and real named employers observed in live Reddit research; those have been replaced with one consistent "EXAMPLE CAREER PATH" so the anxiety-classification method is visible without exposing real research data. Every rule and mapping is reproduced in full.

## 5.1 What This Skill Is and When to Load It

The Reddit data block returns student discussion posts about the target career path, sourced from relevant subreddits and career-specific communities. Each result includes the post title, a snippet of the top comment or post body, and the URL. This skill teaches how to extract the specific student anxieties, misconceptions, and questions from this content and use them to calibrate FAQ question selection, hook direction, and page vocabulary.

Load this skill in any session where FAQ questions need calibration (particularly the Tier 1 FAQ which corrects a dangerous misconception), any session where the hook direction needs to account for what students are actually discussing, any review session where FAQ answers feel generic, or any session where the page vocabulary needs calibration against student language usage.

## 5.2 The Core Principle

Students on Reddit say what they want but reveal what they need. This distinction is the operating principle of the entire skill. Every application of this skill runs through it.

What students say is on the surface: the direct question in the post title, the specific ask in the top comment. What students need is underneath: the market mechanism they do not understand that would make their surface question resolve itself. A page that answers the surface question without addressing the underlying need produces content that reads well but does not change what the student does next.

**Worked example.** A Reddit post asks "how do I get into this field?" The surface request is a list of steps. What the student needs is to understand the intern-to-grad conversion mechanism reality that makes those steps matter in a specific order. Without that understanding, any list of steps reads as generic advice. With that understanding, the same steps become a specific sequence with clear stakes attached to each step's timing. The hook addresses the underlying need. The FAQs may address the surface request directly, but the answers are only valuable if the page as a whole has already delivered the underlying mechanism.

## 5.3 Reading Reddit Data for Anxiety Patterns

The anxiety driving a Reddit post is rarely stated in the title. It is in the follow-up comments, the qualifiers, and the hedging language. Four anxiety patterns recur across career paths. Reading the Reddit data block means classifying the posts into these four patterns, then using the classification to calibrate the page.

**Pattern 1: fear of being too late.** Detection language in posts and comments: "is it too late," "have I missed," "already in final year," "should I have started earlier," "am I behind." This is the Tier 1 anxiety for career paths with timing-based mechanisms.

**Pattern 2: fear of not being competitive enough.** Detection language: "my grades are X, do I have a chance," "I don't have experience," "no internships yet," "my portfolio is empty." This is the Tier 1 anxiety for career paths with credential or portfolio threshold filters.

**Pattern 3: confusion about the mechanism.** Detection language: "how does X actually work," "I don't understand the process," "what happens after I apply," "how do they decide," "who picks candidates." This is the Tier 1 anxiety for career paths with non-obvious selection processes.

**Pattern 4: misconception about what matters.** Detection language: "does GPA matter," "is X firm good," "should I do Y first," "is it worth doing Z," "will A help me get into B." This pattern signals the student is optimising for the wrong variable. The Reddit posts are asking questions premised on a wrong understanding of what the market rewards. This is the hook opportunity: the hook reveals what actually matters, and the page rebuilds the student's mental model of what to optimise for.

Classify every read Reddit post into one of these four patterns before proceeding. A single career path SERP may return Reddit results that primarily fall into one pattern (this is the dominant anxiety) or return results that spread across two or more patterns (multiple anxieties, prioritise the one that appears most frequently as the Tier 1 anxiety).

## 5.4 Mapping Reddit Anxieties to FAQ Questions

The dominant Reddit anxiety pattern determines the Tier 1 FAQ question for the page. This is the most operationally useful mapping in this skill. All four mappings apply.

**Mapping 1: "is it too late" anxiety maps to a Tier 1 FAQ correcting the timeline.** FAQ question form: "I am in [specific year of degree or specific point in cycle], is it too late for me to pursue [specific pathway]?"

**Mapping 2: "not competitive enough" anxiety maps to a Tier 1 FAQ addressing the specific threshold.** FAQ question form: "Is my [grades / portfolio / experience level] good enough for [specific firm category or employer type]?"

**Mapping 3: "mechanism confusion" anxiety maps to a Tier 1 FAQ explaining the process.** FAQ question form: "How does [specific process or system] actually work?"

**Mapping 4: "wrong variable" anxiety maps to a Tier 1 FAQ correcting the misconception directly.** FAQ question form: the question a student would ask when they hold the misconception, answered by revealing what actually matters.

**Worked example — EXAMPLE CAREER PATH.** If the dominant Reddit anxiety pattern for the example career path is Pattern 1 ("is it too late"), the Tier 1 FAQ question form is: "I did not do an internship in my penultimate year, is it too late to be competitive for graduate roles?" This surfaces the timing misconception and the answer corrects it directly.

## 5.5 Reddit Language Calibration

Reddit language is more informal than the page should be, but it signals the vocabulary students actually use when thinking about their careers. Three calibration rules apply.

**Rule 1: abbreviation familiarity.** If Reddit posts consistently use an abbreviation without defining it, the page can use the same abbreviation without definition. Students searching this term already know it. Adding a definition would signal that the page assumes lower reader knowledge than the market actually holds, which reads as condescending or misdirected.

**Rule 2: employer nickname usage.** If Reddit posts use an employer's nickname, the page should use the full employer name on first reference and the abbreviation on subsequent references. The full name on first reference maintains formality; the nickname on subsequent references matches how students actually talk about the firm.

**Rule 3: vocabulary confusion signals.** If Reddit posts express confusion about a specific term, this confusion is the basis for a types table framing sentence or a Tier 3 FAQ answer. Distinguish clearly. Do not assume the student knows the distinction.

**Using Reddit data to calibrate hook specificity.** If the top Reddit posts about a career path are asking basic questions, the hook must not assume prior knowledge. Sentence 1 must be accessible to a student who has just started researching. If the top Reddit posts are asking advanced questions, the hook can assume basic knowledge and go straight to the mechanism. Sentence 1 can reference the market mechanism without defining it first.

## 5.6 What Reddit Data Cannot Tell You

Reddit data is self-selected. Students who post on Reddit are more anxious, more uncertain, and more likely to have missed something than the average student who does not post. The Reddit anxiety patterns identify the worst-case student concerns, not the concerns of every student who will read the page.

This creates a scope limit on how Reddit data influences the page. Reddit anxiety patterns are valid inputs for Tier 1 FAQ selection because the Tier 1 FAQ exists specifically to correct dangerous misconceptions, and Reddit surfaces those misconceptions reliably. Reddit anxiety patterns should not define the entire page's tone. A page written throughout in the register of Reddit's anxious posts reads as alarmist and drives away the confident student who knows the basics and is already positioned to compete.

The page serves both the anxious Reddit student and the confident student. The hook addresses both by revealing the mechanism (informative for the confident student, stakes-raising for the anxious student). The bullets address both by delivering specific actions (validation for the confident student, direction for the anxious student). The FAQs primarily address the Reddit student's concerns because the FAQ section is where specific anxieties get resolved.

## 5.7 Reddit Analysis Checklist

Complete this checklist when calibrating FAQ questions, when validating hook specificity, or when checking page vocabulary. Order matches the work sequence.

**Anxiety pattern identification.**
[ ] Reddit data block read (post titles and snippets for each result) -- if no: anxiety patterns cannot be identified
[ ] Each Reddit post classified into one of the four anxiety patterns (too late, not competitive enough, mechanism confusion, wrong variable) -- if no: dominant anxiety cannot be identified
[ ] Dominant anxiety pattern for this career path identified (most frequent pattern across the Reddit results) -- if no: Tier 1 FAQ selection cannot be calibrated

**FAQ question calibration.**
[ ] Tier 1 FAQ question form matches the dominant anxiety pattern per the Section 5.4 mappings -- if no: Tier 1 FAQ addresses the wrong student concern
[ ] Tier 1 FAQ question uses the specific career path variables (year, grades, portfolio, process name, misconception) for this career path -- if no: FAQ question reads as generic rather than career-path-specific

**Language calibration.**
[ ] Abbreviations used without expansion match what Reddit posts use without expansion -- if no: page either explains what students already know or leaves undefined what they do not know
[ ] Employer nicknames introduced full-name on first reference and abbreviated on subsequent references -- if no: page vocabulary does not match student usage
[ ] Terms Reddit posts express confusion about are distinguished clearly in the types table framing sentence or a Tier 3 FAQ answer -- if no: page assumes knowledge students do not have

**Hook specificity calibration.**
[ ] Hook accessibility level matches the Reddit question level (accessible if top Reddit posts ask basic questions, advanced if top posts ask advanced questions) -- if no: hook mismatches the actual reader knowledge level

**Boundary check.**
[ ] Page tone is not anxious or alarm-signalling throughout (Reddit anxiety patterns applied only to FAQ selection and vocabulary, not to page-wide tone) -- if no: page has adopted Reddit anxiety register and will drive away the confident student
[ ] Hook and body address both the anxious Reddit student and the confident student, not only the anxious student -- if no: page serves only the worst-case student concern
