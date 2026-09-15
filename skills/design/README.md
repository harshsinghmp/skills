# 🎨 design

The design department head: one skill, seven modes — ui, ux, wireframe, logo, branding, socials, graphics. Creates original design from a brief or idea and outputs buildable tokens and specs.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill design
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Design the marketing site for this SaaS brief — start with wireframes.
```

```text
Create a logo and brand identity for our new fintech client.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **ui** | design a page, screen, or dashboard | Design interfaces: layouts, hierarchy, tokens, and component states. |
| **ux** | map flows, journeys, or site structure | UX structure: flows, information architecture, journey maps, friction audits. |
| **wireframe** | wireframe pages or flows | Low-fidelity structure: grayscale blocks, content priorities, layout intent. |
| **logo** | design a logo or mark | Logo design: brief → concept territories → refinement → variants and usage rules. |
| **branding** | build a brand identity system | Brand identity system: from logo+brief to tokens, assets rules, and voice guidelines. |
| **socials** | build a social template kit | Social design system: profile kit, post templates per format, grid rhythm. |
| **graphics** | produce a graphic asset (banner, OG image, flyer) | Graphic assets: web banners, OG/share images, hero art, print-adjacent collateral. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
