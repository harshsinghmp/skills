# 🎨 designscope

Point at any visual source — a screenshot, a live website, or a Figma file — and extract
its structured design system. `designscope` produces artifacts another AI (or human) can
build from: a `design.md` brief, a W3C DTCG `design-tokens.json`, and an optional WCAG
accessibility report.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill designscope
```

## Use

Describe the task in plain language. The skill's frontmatter supplies the trigger
language your agent runtime uses for discovery:

```text
Extract the design system from https://example.com and generate the token JSON.
```

```text
Copy this navbar and give me a rebuild spec.
```

## What you get

| Artifact | Purpose |
| :--- | :--- |
| `design.md` | Full design analysis: identity, tokens, components, layout, reconstruction notes, Do's/Don'ts |
| `design-tokens.json` | Structured tokens in W3C Design Tokens Community Group format (`$value`/`$type`) — ready for Style Dictionary, Figma Variables, Tokens Studio |
| `design-a11y.md` | Optional WCAG 2.1 contrast report for extracted color pairs |
| `element.md` | Element mode: one component as a rebuild spec, or visual art as a token-grounded image prompt |

## How it works

1. **Capture** — direct vision for images; web fetch + CSS variable extraction for URLs;
   Figma MCP tools for Figma links; native browser screenshots when the HTML is empty.
2. **Analyze** — six layers from identity to brand rules, plus an Art Direction QA pass.
3. **Generate** — `design.md` with confidence markers (✅ ⚠️ ❓), real hex codes, mandatory
   Open Questions and Do's/Don'ts, plus DTCG tokens when concrete values were extracted.
4. **Verify** — every deliverable passes `scripts/lint_design_md.py` before handoff.

Outputs work directly as briefs for AI builders (Cursor, opencode, Copilot, v0, Lovable)
and as client brand documentation.

## Scripts

All scripts are Python stdlib-only — no pip install required.

```bash
python scripts/extract_css_vars.py <URL> --output ./css-vars.json   # pull --* custom properties
python scripts/check_contrast.py --pair "#111827,#FFFFFF"           # WCAG contrast table
python scripts/lint_design_md.py <design.md>                        # validate output contract
python scripts/verify_design.py <tokens.json> <URL>                 # audit token drift vs live site
```

## License

[MIT](LICENSE)
