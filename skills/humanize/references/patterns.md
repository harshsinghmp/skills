# Humanize pattern catalog

Use these patterns as **diagnostic signals**, not automatic rewrite rules. Flag clusters and context rather than isolated words.

## Content patterns

### P01 Significance inflation
**Signals:** stands as, serves as, testament, pivotal moment, vital role, underscores its importance, marks a major shift, reflects a broader trend, setting the stage, indelible mark.

**Problem:** A routine fact is inflated into a sweeping historical or strategic claim.

**Fix:** State the fact. Keep the broader interpretation only when the source supports it.

### P02 Notability name-dropping
**Signals:** lists of famous publications, follower counts, "leading expert", "independent coverage" used only to prove importance.

**Fix:** Keep sources that add real context. Otherwise compress or remove.

### P03 Superficial -ing tail
**Signals:** highlighting, underscoring, emphasizing, reflecting, symbolizing, fostering, showcasing, ensuring, contributing to.

**Fix:** Delete the tail or rewrite its actual information as a supported statement.

### P04 Promotional language
**Signals:** vibrant, breathtaking, renowned, stunning, nestled, must-visit, groundbreaking, world-class, state-of-the-art, rich cultural heritage.

**Fix:** Replace adjective-driven praise with observable facts.

### P05 Vague attribution
**Signals:** experts say, researchers believe, industry reports suggest, observers note, widely regarded.

**Fix:** Name the source or remove the attribution. Never invent a source.

### P06 Formulaic challenges/outlook
**Signals:** despite these challenges, faces several challenges, future outlook, looking ahead, continues to thrive.

**Fix:** State the actual problem, evidence, action, or plan. Remove boosterism.

### P07 AI-heavy vocabulary cluster
**Watch:** delve, tapestry, realm, multifaceted, pivotal, crucial, robust, seamless, foster, leverage, utilize, facilitate, enhance, showcase, underscore, intricate, transformative, elevate, garner, bolster.

Treat these as context signals. A technical term or legitimate word is not a violation by itself.

### P08 Copula avoidance
**Signals:** serves as, stands as, boasts, features, offers, represents, marks when simple is/has would be clearer.

**Fix:** Prefer is, are, has, or a direct verb.

## Language and rhetoric

### P09 Binary contrast formula
**Signals:** not X but Y, it's not just X, the question isn't X, not because X, because Y.

**Fix:** State the actual point directly when the contrast adds no information.

### P10 Forced triad
**Signals:** every idea appears in groups of three, especially abstract nouns.

**Fix:** Use the number the content genuinely requires. Keep a legitimate tricolon.

### P11 Synonym cycling
**Signals:** protagonist -> main character -> central figure -> hero; tool -> platform -> solution -> system when all refer to the same thing.

**Fix:** Repeat the clearest term.

### P12 False range
**Signals:** from X to Y where X and Y do not form a meaningful continuum.

**Fix:** Name the actual topics or items.

### P13 Subjectless or agentless construction
**Signals:** mistakes were made, no configuration required, results are preserved automatically.

**Fix:** Name the actor when doing so improves clarity. Preserve passive when the actor is irrelevant or unknown.

### P14 False agency
**Signals:** the decision emerged, the data tells us, the market rewards, the complaint becomes a fix.

**Fix:** Name the person, team, system, or mechanism that actually acts.

### P15 Narrator from a distance
**Signals:** people tend to, one might say, nobody designed this, there is a sense that.

**Fix:** Put the reader or real actor in the sentence when appropriate.

### P16 Lazy extremes
**Signals:** everyone, nobody, always, never, every, completely used as vague authority.

**Fix:** Scope the claim to the evidence.

## Structure and composition

### P17 Throat-clearing
**Signals:** it is worth noting, here's the thing, here's what I mean, let me be clear, let's dive in, in this article we will explore.

**Fix:** Start with the point.

### P18 Interpretive metadiscourse
**Signals:** this matters, the key point is, as you can see, that is the whole point, in other words when redundant.

**Fix:** Replace the commentary with the evidence or cut it.

### P19 Demonstrative kicker
A vague fragment after a complete point: "That matters." "This is where the risk hides." "That's the whole thing."

**Fix:** Cut it or connect the actual consequence.

### P20 Formulaic punchlines
**Signals:** repeated short fragments, "that's it", "the old rules were gone", "and that's when everything changed."

**Fix:** Preserve isolated emphasis when it belongs to the voice. Remove stacked manufactured drama.

### P21 Aphorism / pull-quote formula
**Signals:** X is the new Y, X is the language of Y, X becomes a trap, X is where Y meets Z.

**Fix:** State the concrete claim.

### P22 Fake-candid opening
**Signals:** Honestly? Real talk. Look. The thing is. Let's be honest.

**Fix:** Keep conversational speech when authentic; remove staged honesty before routine claims.

### P23 Phantom objection
**Signals:** I'm not saying, don't get me wrong, some might argue, this isn't really about X, you could frame it another way.

**Fix:** Keep a real named objection. Remove defensive residue that answers nobody.

### P24 Fake alternative
**Signals:** a tempting approach would be, one might be tempted to, an obvious approach would be, you might think X but.

**Fix:** Keep alternatives that a reader genuinely needs to evaluate. Remove abandoned drafting residue.

### P25 Generic summary ending
**Signals:** in conclusion, ultimately, overall, the future looks bright, exciting times ahead, step in the right direction.

**Fix:** End on the last useful fact, takeaway, or real next action.

### P26 Low-information treadmill
Repeated restatements of one claim with little new content.

**Fix:** Apply the "what is actually new here?" test sentence by sentence.

### P27 Heading echo
A heading is followed by a sentence that simply repeats the heading before the real content.

**Fix:** Delete the echo.

### P28 Paragraph interchangeability
Several paragraphs are self-contained mini-essays that could be rearranged without breaking the argument.

**Fix:** Strengthen dependencies, merge, reorder, or cut only when useful.

### P29 Whether-summary closure
A paragraph ends with a soft recap beginning with whether, overall, in summary, to sum up, or similar wording.

**Fix:** End on the concrete point.

## Formatting and communication

### P30 Structured-list syndrome
Bullets are used where flowing prose would be clearer, or every bullet uses the same bold label + colon pattern.

**Fix:** Use prose or a genuinely parallel list.

### P31 Decorative emphasis
Random bold spans, emoji headers, ornamental rules, over-sectioning, title-case hype headings.

**Fix:** Let formatting follow the medium and content.

### P32 Markdown bleeding
Markdown appears in plain email, SMS, or another surface that does not render it correctly.

**Fix:** Match the target medium.

### P33 Chatbot artifact
Signals include: I hope this helps, of course, certainly, you're absolutely right, would you like me to, let me know if you'd like.

**Fix:** Remove assistant chatter from standalone content.

### P34 Placeholder residue
Signals include [Your Name], [INSERT SOURCE], XX/XX/XXXX, TODO-style prose placeholders.

**Fix:** Complete the placeholder or remove the unfinished content.

### P35 AI citation markup leakage
AI-provider-specific citation tokens, orphan citation markers, RAG attribution tags, or internal reference syntax accidentally pasted into deliverables.

**Fix:** Remove provider internals and replace with real citations when the source matters.

### P36 AI tracking parameters
Suspicious AI-provider referral or tracking parameters appended to otherwise valid URLs.

**Fix:** Preserve legitimate query parameters. Remove only clearly editorially unwanted tracking artifacts when the task calls for URL cleanup.

## Documentation and repository patterns

### P37 Diff-anchored writing
Documentation narrates how the current implementation changed rather than describing current behavior.

**Fix:** Describe the current state. Keep history in changelogs, migrations, release notes, or historical docs.

### P38 Reasoning-chain leakage
Signals include "let me think", internal step labels, draft reasoning, discarded alternatives, or meta-analysis that belongs to the authoring process rather than the artifact.

**Fix:** Keep the conclusion and relevant evidence. Remove process residue.

### P39 Style/register shift
A section abruptly switches vocabulary, sentence construction, certainty, or tone relative to the surrounding authorial voice.

**Fix:** Match the established register without flattening legitimate quoted or source material.

### P40 Hyper-formal register
Bureaucratic wording appears where the medium calls for plain speech: it should be noted, in the context of, with regard to, implementation of.

**Fix:** Simplify when meaning is unchanged.

## Emerging / forensic patterns

### P41 Hyphenated-pair overuse
Uniformly hyphenated compounds even when grammar does not require them.

**Fix:** Use normal English hyphenation. Do not rewrite legitimate established compounds.

### P42 Unicode obfuscation
Zero-width characters, soft hyphens, suspicious homoglyphs, or control characters inserted to alter text appearance.

**Fix:** Normalize text when performing a deliberate cleanup task. Do not alter meaningful Unicode in code, identifiers, or languages that use it.

### P43 Argument residue
The final text contains rebuttals to claims that do not otherwise exist in the piece.

**Fix:** Remove the phantom rebuttal or state the underlying position directly.

### P44 Leftover hedge debris
Qualifiers from an earlier draft remain after the claim itself has become definite.

**Fix:** Re-evaluate each hedge against the current evidence and intended certainty.

### P45 Repeated sentence openings
Several sentences begin identically without a deliberate rhetorical reason.

**Fix:** Merge, vary the construction, or keep the repetition when it is intentional.

### P46 Repetitive transition stack
Multiple consecutive paragraphs begin with therefore, additionally, however, moreover, meanwhile, in contrast, or similar transition words.

**Fix:** Keep only transitions that establish a real relationship.

### P47 Section-template repetition
Many sections use the exact same rhetorical architecture, such as claim -> explanation -> example -> conclusion, even when the material does not require it.

**Fix:** Let section length and shape follow the content.

### P48 Synthetic emotional calibration
Emotion words are repeatedly inserted to manufacture warmth, concern, excitement, urgency, or humility without concrete reason.

**Fix:** State the event, reaction, or consequence and let the reader infer the emotion.

### P49 Manufactured specificity
A vague source has been turned into fake precision, such as invented metrics, timestamps, names, implementation details, or personal anecdotes.

**Fix:** Restore the evidence boundary.

### P50 Source-distance disclaimer
The prose spends more time explaining that information is limited than stating what the source actually establishes.

**Fix:** State the documented limit once, then stop. Never use the disclaimer to license a guess.

## False positives to protect

Do not flag these in isolation:

- polished grammar
- formal language
- one em dash
- one colon
- one semicolon
- one three-item list
- one short sentence
- one metaphor
- one rhetorical question
- repeated technical terminology
- plain reference prose
- valid passive voice
- legitimate hedging
- quotations containing watched phrases
- code containing watched strings
- headings that the medium requires
- a deliberate repeated phrase
- unsourced text by itself

The strongest signal is **a coherent cluster of formulaic choices that also weakens the writing**.
