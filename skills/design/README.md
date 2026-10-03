# 🎨 design

The design department head: one skill, eleven modes — ui, ux, wireframe, logo, branding, socials, graphics, prototype, uikit, story, 3d. Creates original design from a brief or idea and outputs buildable tokens and specs.

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
| **prototype** | prototype flows, test risky screens | Clickable mocks, fast user tests, locked/iterate/kill verdicts. |
| **uikit** | build component library or UI kit | Headless primitives, Tailwind/Starwind UI component kits, token bindings. |
| **story** | visual storytelling, storyboarding, data narrative | Visual narratives: story arcs, video storyboards, data infographics, cross-platform visual adaptations. |
| **3d** | 3d scene, spline, three.js, webgl, blender | Interactive 3D web scenes: Spline embeds, Three.js/R3F setups, and glTF optimization. |

## Brand Immersion & Asset Scaffolding Engine

The `design` skill includes `scripts/brand-assets.ts` to scaffold and audit brand immersion tokens, custom scrollbars, keyboard focus rings, adaptive SVG favicons, and web manifests:

```bash
# Scaffold complete brand immersion assets into target project
bun skills/agency-delivery/design/scripts/brand-assets.ts --project-dir ./my-app --scaffold

# Generate brand immersion micro-interactions CSS only
bun skills/agency-delivery/design/scripts/brand-assets.ts --project-dir ./my-app --scaffold-css

# Generate dark/light adaptive SVG favicon and site.webmanifest
bun skills/agency-delivery/design/scripts/brand-assets.ts --project-dir ./my-app --scaffold-favicon

# Audit project directory for brand immersion standards
bun skills/agency-delivery/design/scripts/brand-assets.ts --project-dir ./my-app --audit
```

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](../../../LICENSE)
