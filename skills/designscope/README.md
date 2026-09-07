# 🎨 designscope

Point at any visual source — a screenshot, a live website, or a Figma file — and extract
its structured design system and responsive component layout tree. `designscope` produces
artifacts another AI (or human) can build from: a `design.md` brief with complete CSS Grid/Flexbox
layout trees, a W3C DTCG `design-tokens.json`, and an optional WCAG accessibility report.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill designscope
```

## Use

Describe the task in plain language. The skill's frontmatter supplies the trigger
language your agent runtime uses for discovery:

```text
Extract the design system and component layout tree from https://example.com.
```

```text
Deconstruct this landing page screenshot into CSS Grid / Flexbox container blocks.
```

```text
Copy this navbar and give me a rebuild spec.
```

## What you get

| Artifact | Purpose |
| :--- | :--- |
| `design.md` | Full design analysis: identity, tokens, components, Section 4.5 Component Layout Tree (DOM/Flexbox/CSS Grid), reconstruction notes, Do's/Don'ts |
| `design-tokens.json` | Structured tokens in W3C Design Tokens Community Group format (`$value`/`$type`) — ready for Style Dictionary, Figma Variables, Tokens Studio |
| `design-a11y.md` | Optional WCAG 2.1 contrast report for extracted color pairs |
| `element.md` | Element mode: one component as a rebuild spec, or visual art as a token-grounded image prompt |

## How it works

1. **Capture** — direct vision for images; web fetch + CSS variable extraction for URLs;
   Figma MCP tools for Figma links; native browser screenshots when HTML is empty.
2. **Analyze & Extract Layout Tree** — six layers from identity to brand rules, plus an Art Direction QA pass and Section 4.5 Component Layout Tree extraction (container decomposition, CSS Grid/Flexbox specifications, and token-grounded hierarchy).
3. **Generate** — `design.md` with confidence markers (✅ ⚠️ ❓), real hex codes, mandatory
   Open Questions, Do's/Don'ts, and structural layout trees, plus DTCG tokens when concrete values were extracted.
4. **Verify** — every deliverable passes `scripts/lint_design_md.py` before handoff.

Outputs work directly as briefs for AI builders (Cursor, opencode, Copilot, v0, Lovable)
and as client brand documentation.

## Scripts & References

- `references/layout-tree-extraction.md` — Responsive layout tree decomposition guide.
- `scripts/extract_css_vars.py <URL>` — Pull `--*` custom properties as explicit tokens.
- `scripts/check_contrast.py --pair "#111827,#FFFFFF"` — WCAG contrast table.
- `scripts/lint_design_md.py <design.md>` — Validate output contract and frontmatter.
- `scripts/verify_design.py <tokens.json> <URL>` — Audit token drift vs live site.

## License

[MIT](LICENSE)
