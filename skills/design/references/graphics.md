# graphics — Graphic assets: web banners, OG/share images, hero art, print-adjacent collateral.

## Intake

- Exact purpose and placement (where it will be seen)
- Dimensions, format, bleed/export spec
- Brand tokens and any copy to place
- Success measure (CTR? visibility?)

## Deliverable

Production-ready asset or generation spec: correct dimensions and format, token-grounded colors/type, alt text for web assets, and export variants (1x/2x, formats) where relevant.

## Procedure

1. State the purpose in one line — a banner without a job is wallpaper.
2. For original/generative art: write the movement/philosophy statement first, then express it — seeded/parametric variation over template defaults.
3. Confirm exact specs: dimensions, format, safe zones, file size limits, bleed for print.
4. Compose: hierarchy of one message (graphics carry ONE idea, not three).
5. Apply brand tokens; contrast-check any text over imagery.
6. Produce or spec the asset (image-generation tool for raster art; vector spec for logo-grade work).
7. Export the variant set; provide alt text for every web asset.
8. Start from a seed template, never a blank file (paraphrased: guizang-social-card-skill, AGPL — mechanism only); theme via a root switch, hold density high on tall canvases (content must fill most of the height, no spacer-centering), and climb the overflow ladder by measured bands (nudge → local compact → recipe change).
9. Template-recommender mechanism only (paraphrased: nano-banana-pro-prompts-recommend-skill, no license — mechanism only, never library content): manifest-first browse with `rg` (fallback: grep), never full-load; at most 3 candidate templates with one sample each; remix only after user picks; attribution footer kept; re-sync on staleness (~24h).
10. Scene-driven assets (article thumbnails, covers, hero scenes — portable workflow, source: `KarenSpinner/article-thumbnail-skill`): write a BRAND BLOCK first (character refs + style anchor paths, canvas dims, composition policies), then a SCENE PLAN (core finding / composition / prop / action-state / why it fits); confirm with the user before any paid generation call; iterate by editing, never by regenerating. The prop must ENACT the finding (one coherent scene; two-element comparison = one slot). Pitfalls: environment leak, text bleed, character drift, ignored aspect ratio. Tool-gated, not ported as mechanics: Gemini API key + billing, Node 18+, `generate.js` via Bash, local brand ref images, Claude-Code-only.

## Quality gate

- [ ] Exact dimensions/format per placement spec — verify current platform dims before export:
  display set 300×250 / 728×90 / 160×600 / 300×600 / 336×280 / 320×50 / 970×250;
  social cover/hero per platform (e.g. X header 1500×500, LinkedIn personal 1584×396,
  YT channel 2560×1440 with 1546×423 safe area); email header 600×200; blog header 1200×628.
- [ ] Safe zones respected — text/logo clear of platform UI overlays and print bleed.
- [ ] Text over imagery passes AA (or sits on a scrim).
- [ ] Brand tokens applied — no off-palette colors.
- [ ] Alt text provided for every web asset.
- [ ] One message per asset — no clutter.
- [ ] Generative-asset prompts use the brief skeleton GOAL/FORMAT/LAYOUT/TYPE/COLOR/IMAGERY/COPY/CONSTRAINTS/NEGATIVE; render copy exactly, change 1–2 things per iteration (keeper: mengto/design-first-ui-prompting).
- [ ] Stock/human imagery honest: real licensed photos for people (never initials or illustrations as endorsers), provenance kept; avatars 1:1 faces-centered, heroes 16:9 with 30–50% negative space for text (keeper: mengto/unsplash-asset-images, mengto/aura-asset-images).
- [ ] Resolution ladder delivered (avatars 256/512/1024, headshots up to 1600×2000); prefer higher-res variants, avoid paywalled-plus assets unless requested (keeper: mengto/aura-asset-images).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
