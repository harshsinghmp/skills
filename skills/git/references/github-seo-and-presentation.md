# GitHub SEO, Presentation & Copywriting Guide

This reference defines the standards for optimizing repository discoverability, social preview metadata, and README visual hierarchy.

---

## 1. Repository SEO & Metadata Standards

When preparing a repository for public visibility or tagging a release, run an automated metadata sync pass using the GitHub CLI:

### 1.1 Topics & Tags (`--add-topic`)
- Extract domain keywords from `package.json` keywords, skill manifests, and problem domain.
- Format: Lowercase, alphanumeric, hyphenated (e.g., `agent-skills`, `ai-agents`, `context-management`, `developer-tools`).
- Target: 10 to 20 precise topics that match developer search intent and AI crawler discovery indices.
- Command:
  ```bash
  gh repo edit <owner>/<repo> --add-topic "ai-agents,agent-skills,devops,git-workflow,triage,semver"
  ```

### 1.2 Description & Homepage
- **Description (≤120 characters)**: Action-oriented, keyword-rich, and clearly communicating the exact product outcome.
  - *Good*: "Autonomous end-to-end Git release engine with anti-slop issue triage, strict branch gating, and automated doc sync."
  - *Bad*: "A helper tool for git and github with some cool automation scripts."
- **Homepage URL**: Link to official documentation, landing page, or deployed package.
- Command:
  ```bash
  gh repo edit <owner>/<repo> --description "<description>" --homepage "<homepage-url>"
  ```

---

## 2. Social Preview & Open Graph (OG) Standards

- **Asset Path**: Maintain a high-resolution 1280×640 PNG/SVG banner in `assets/banner.svg` or `assets/banner.png` (or `.github/social-preview.png`).
- **Visual Design**:
  - High-contrast background (dark theme preferred `#0b0f19` or `#141413`).
  - Clear, legible title typography (bold sans-serif).
  - One crisp subtitle highlighting the core value proposition.
  - Centered or balanced composition without edge clipping.

---

## 3. High-Conversion README Structure & Copywriting

Every README should follow the *Refactoring UI* visual hierarchy and plain-prose copywriting standard:

### 3.1 Above the Fold
1. **Centered Header & Banner**: Title, brand banner, and semantic badge strip (Release, License, Bun/Node version, Tests Passing, Agent Runtimes).
2. **The Hook (1–2 sentences)**: State the exact painful failure mode being solved.
3. **The Solution (TL;DR)**: One concise paragraph explaining how this repository fixes that failure mode permanently.

### 3.2 Visual Architecture Flow
- Use clean ASCII diagrams or Mermaid flowcharts to visualize lifecycle stages, data pipelines, or branch models.
- Avoid walls of dense unformatted prose.

### 3.3 The Copy-Paste Quickstart
- Provide a 3-line copy-paste code block that gets the user or agent running immediately without setup friction.

### 3.4 Plain Prose Anti-Slop Discipline
- **No Inflated Corporate Hype**: Avoid "game-changing", "revolutionary", "pivotal moment", "powerhouse".
- **No Cliché Triads**: Do not force phrases into artificial groups of three ("innovation, inspiration, insights").
- **No Emoji Spilling**: Use emojis strictly as functional section glyphs; never sprinkle emojis throughout sentences.
- **Evidence Receipts**: Always cite concrete test counts, benchmark numbers, and exact command outputs.
