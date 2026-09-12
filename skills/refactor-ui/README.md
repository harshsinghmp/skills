# 🪄 refactor-ui

**Turn "developer-designed" interfaces into polished, accessible, production-ready UI — with AI agents.**

`refactor-ui` gives any coding agent a deterministic design-engineering method: a
mode for every job, 11 hard heuristics, modern responsive/typography/theming
techniques, and two zero-dependency verification scripts. No taste required —
the rules are the taste.

Based on the atomic heuristics of *Refactoring UI* (Wathan & Schoger), extended
with modern techniques (container queries, WCAG 2.2, theming parity, z-scale
discipline) distilled from a 127-source corpus of production agent skills.

---

## ⚡ Install

```bash
# Just this skill
npx skills add harshsinghmp/muse-skills --skill refactor-ui

# Or the complete suite
npx skills add harshsinghmp/muse-skills
```

**Requirements:** any agent runtime with file + shell tools (any AI coding agent — Claude Code, Codex, Cursor, Gemini CLI, OpenCode, etc.). Scripts run with [Bun](https://bun.sh)
and have **zero dependencies**.

---

## 🎯 Pick a mode, say the words

| Say | Mode | What you get |
|:---|:---|:---|
| *"Review this UI"* | **review** (default) | Verdict + severity table. No edits. |
| *"Audit this UI for contrast and anti-patterns"* | **audit** | Scripted scan + WCAG 2.2 AA check → scored report (Block/Approve) |
| *"Refactor this component / make it professional"* | **improve** | The 5-step refactor, applied |
| *"Make all pages consistent"* | **sweep** | Multi-page consistency matrix → batched fixes |
| *"Extract design tokens / too many grays"* | **tokens** | Named token scales; pixels don't move |
| *"Final pass before launch"* | **polish** | Ship-readiness triage; zero smuggled redesigns |

Every mode: **proof-gated findings** (no invented problems), **honest
verification** (unrun checks are reported as `Not verified`), and a
**Block/Approve verdict** you can act on.

---

## 🔍 What it checks

- **Hierarchy** — squint test, focal point, tiered de-emphasis
- **Spacing** — 4px/8px ramp, 2× grouping ratio, concentric radii
- **Typography** — 6-tier scale, 60–75ch measure, line-height by role, tabular numerals
- **Color** — token discipline, semantic states, WCAG 2.2 AA (blocking)
- **Depth** — layered shadows vs structural borders, named z-scale, surface ladder
- **Responsive** — container-aware components, logical properties, safe areas, 200% zoom
- **States** — the 5-state anti-slop gate: Empty · Loading · Error · Success · Overflow
- **Themes** — light/dark parity on logos, icons, charts, focus rings

---

## 🧪 Verification scripts (zero dependencies)

```bash
# Anti-pattern scanner: arbitrary pixels, low-contrast grays, raw z-index,
# symmetric shadows, missing tracking on uppercase, missing focus alternatives
bun refactor-ui/scripts/audit-ui.ts src/components/

# WCAG contrast checker with AA/AAA + large-text/UI thresholds
bun refactor-ui/scripts/check-contrast.ts #64748b #ffffff
bun refactor-ui/scripts/check-contrast.ts #ffffff #18181b --large --aaa
```

Both scripts exit non-zero on findings — drop them straight into CI.

---

## 📖 How a run works

1. **Name the mode** (or just describe the problem — the trigger phrases route it).
2. The agent loads **only that mode's contract** from `references/modes.md` — tokens stay low.
3. Findings require **proof** (a binding rule + runtime path + one deterministic fix). Invented problems don't survive.
4. You get a **severity table** (`Severity | Location | Before | After | Why`), a **verdict**, and routing to companion skills (`designscope` for extraction, `animate` for motion, `gauntlet-loop` for hardening).
5. Say the word and the next mode executes — review → improve → audit is the common chain.

A worked example lives in [`examples/sample-5-state-refactor.md`](examples/sample-5-state-refactor.md).

---

## 🤝 Plays well with

| Skill | Why |
|:---|:---|
| [`designscope`](../designscope/SKILL.md) | Extract a design system from a URL/screenshot first; refactor against it |
| [`animate`](../animate/SKILL.md) | This skill owns static polish + the static-cue rule; motion choreography lives there |
| [`gauntlet-loop`](../gauntlet-loop/SKILL.md) | Harden the refactored surface (security headers, multi-viewport gates) |
| [`code-review`](../code-review/SKILL.md) | Interaction-correctness defects found during review route here |

---

## 📜 Attribution

Design principles from [*Refactoring UI*](https://refactoringui.com/) by Adam
Wathan & Steve Schoger (© Tailwind Labs Inc.). Skill formulation by Harsh Singh
for the [Muse Skills](https://github.com/harshsinghmp/muse-skills) ecosystem.
MIT licensed. Concept credit to `gnurio/refactoring-ui-plugin`.
