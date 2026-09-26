---
name: design
aliases: ["design-department", "ui-design", "visual-design", "graphic-design", "branding", "wireframe", "logo-design", "brandkit", "banner-creator", "stitch-design-taste", "starwind-ui", "uikit", "visual-storyteller", "storyboarding"]
description: "Full website design department: creates original visual design from a brief, idea, or reference — UI design, UX flows, wireframes, logos, brand identity, social templates, graphic assets, prototypes, component UI kits, and visual storytelling — routed through ten modes. Use when asked to design a website, page, or dashboard, create a wireframe or mockup, design a logo or brand identity, build social media templates, produce graphic assets, prototype flows, build UI kits, or architect visual narratives. Not for refactoring existing UI (refactor-ui), extracting a design system from a reference (designscope), or animation (animate)."
argument-hint: "[ui|ux|wireframe|logo|branding|socials|graphics|prototype|uikit|story]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 23
  aliases: ["design-department", "ui-design", "visual-design", "graphic-design", "branding", "wireframe", "logo-design", "brandkit", "banner-creator", "stitch-design-taste", "starwind-ui", "uikit", "visual-storyteller", "storyboarding"]
  suggested_skills: ["refactor-ui", "designscope", "animate", "new-project"]
  hermes:
    tags: ["design", "ui", "ux", "wireframe", "logo", "branding", "brand-identity", "social-media-design", "graphics", "visual-design", "design-tokens", "typography", "color", "layout", "starwind-ui", "brandkit", "banner-creator", "stitch-design-taste", "uikit", "visual-storytelling", "storyboard", "narrative-arc", "data-storytelling"]
    related_skills: ["refactor-ui", "designscope", "animate", "new-project"]
    suggested_skills: ["refactor-ui", "designscope", "animate", "new-project"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "find_by_name"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["refactor-ui", "designscope", "animate", "new-project"]
    primary_triggers: ["design a website", "design a landing page", "create a wireframe", "design a logo", "build a brand identity", "social media templates", "design our dashboard", "graphic design", "starwind-ui", "ui kit", "stitch design taste", "brandkit", "banner creator", "visual storytelling", "storyboard"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "grep_search", "find_by_name"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🎨 design — Website Design Department

One head skill for the whole design department. Creates original design from an idea, brief, or approved reference — structure first, then direction, then final art. Every decision is emitted as tokens and specs an engineer can build from.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **ui** | "design the homepage", "hi-fi mockup", "design this screen" | Full interface design pass: layout, hierarchy, tokens, states | [references/ui.md](references/ui.md) |
| **ux** | "map the user flow", "improve the UX", "information architecture", "ux-architect", "ux-researcher", "persona-walkthrough", "onboarding-ux", "ux-patterns" | UX architecture, user research, persona cognitive walkthroughs, onboarding flows, heuristic audits | [references/ux.md](references/ux.md) |
| **wireframe** | "wireframe the homepage", "low-fi layout", "structure first" | Grayscale structure with content plan, pre-visual-design | [references/wireframe.md](references/wireframe.md) |
| **logo** | "design a logo", "new mark", "refresh our logo" | Logo concept territories → refinement → variants + usage rules | [references/logo.md](references/logo.md) |
| **branding** | "brand identity", "brand guidelines", "brand system", "brandkit" | Full identity system: color, type, spacing, voice → brand.md + tokens | [references/branding.md](references/branding.md) |
| **socials** | "social templates", "post designs", "profile kit" | Social template system: profiles, post formats, grid consistency | [references/socials.md](references/socials.md) |
| **graphics** | "banner", "OG image", "hero art", "flyer", "banner-creator" | One-off graphic assets: banners, OG/social share, print-adjacent | [references/graphics.md](references/graphics.md) |
| **prototype** | "prototype this flow", "clickable mock", "test the riskiest screen first" | Riskiest-visual-unknown-first clickable mock → fast test → locked/iterate/kill verdict | [references/prototype.md](references/prototype.md) |
| **uikit** | "uikit", "ui kit", "component library", "starwind-ui", "stitch-design-taste", "design system components", "primitives" | Component libraries, headless primitives, Starwind UI / Tailwind component kits, tokens-to-components | [references/uikit.md](references/uikit.md) |
| **story** | "visual storytelling", "visual narrative", "storyboard", "data storytelling", "infographic narrative", "emotional journey" | Visual narrative design: story arcs (setup → conflict → resolution), video storyboards, infographics/data storytelling, emotional journeys, cross-platform visual adaptations | [references/story.md](references/story.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Designing a new site, page, or dashboard from a brief, idea, or approved mood references.
- Creating wireframes, user flows, or information architecture before any visual design.
- Designing a logo or full brand identity system (colors, type, voice rules).
- Building a social template system or graphic assets (banners, covers, OG images).
- Building industry-specific landing pages using structured layout templates (e.g. SaaS).

### Layout Templates

When designing landing pages by vertical type, load the corresponding layout template from `templates/`:
- **SaaS** (`templates/saas.md`): Canonical 9-section problem-solving landing page layout (Header/Nav → Hero → Logos/Trust Marquee → Features → Product Showcase → Pricing → Testimonials → Final CTA → Footer) aligned with 9 copywriting frameworks (AIDA, PASTOR, 4 P's, PRUNE, SLAP, So What?, PAPA, Star-Story-Solution, SPIN).

### Anti-Triggers

- Improving or refactoring an **existing** interface → `refactor-ui`.
- Extracting a design system **from a reference** (screenshot/URL/Figma) → `designscope`.
- Adding motion or animation → `animate`.
- Scaffolding the project repository → `new-project`.

---

## Quick Reference

### Department intake gate (every run)

| Question | Why |
|:---|:---|
| What is the business goal of this design? | Design without a goal is decoration |
| Who is the audience, and on what device/context? | Audience picks hierarchy, not taste |
| What brand inputs exist (tokens, brand doc, logo)? | Existing brand wins — never invent over it |
| What references or mood direction is approved? | Prevents rework after hi-fi |

Client has a live brand but no tokens → run `designscope` on their site first.

### Deliverable ladder

| Stage | Mode | Approved before next? |
|:---|:---|:---|
| Structure | `wireframe`, `ux` | Yes |
| Direction | `ui` style tile, `branding` tokens | Yes |
| Final art | `ui` hi-fi, `logo`, `socials`, `graphics` | Yes |

Skipping an approval gate is how rework happens.

### Defaults (client tokens override whenever they exist)

- Spacing: 4px base scale — 4/8/12/16/24/32/48/64.
- Type: one display + one text family, 1.25 (minor third) scale.
- Color roles: primary (brand), action (CTA), neutral (text/surface), semantic (success/warn/danger).
- Contrast: 4.5:1 body text, 3:1 large text — verified before delivery.
- Output shape: decisions as tokens (OKLCH/hex, DTCG naming) + component specs, not just pictures.

---

## Procedure

1. **Intake.** run the department intake gate in Quick Reference; client brand inputs win over invented direction every time.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Designing hi-fi before structure is agreed — rework machine. Wireframe approval comes first.
- Inventing brand colors when the client already has a brand — `designscope` their assets; existing tokens win.
- More than 2 type families, or decorative faces on body text.
- Happy-path-only components — every component needs hover, focus, disabled, loading, empty, and error states.
- Page-to-page aesthetic drift — one token set per project, extended, never forked.
- Delivering pictures without specs or tokens — engineers guess, pixels drift.
- Wrong mode resolved (branding request treated as ui) — deliverable shape is wrong; re-route.

---

## Verification

- [ ] Exactly one mode resolved and its reference playbook followed end to end.
- [ ] Every visual decision traces to an intake input (goal, audience, brand, or approved reference).
- [ ] Text/background pairs pass AA: 4.5:1 body, 3:1 large text.
- [ ] Spacing and type come from a stated scale; at most 2 type families.
- [ ] Components specified with all interactive states and responsive behavior.
- [ ] Existing-brand work used the client's tokens verbatim — nothing invented over them.
