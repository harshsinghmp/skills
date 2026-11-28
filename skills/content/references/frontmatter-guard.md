# frontmatter-guard — Unquoted YAML Syntax Protection & Frontmatter Sanitizer

This reference codifies frontmatter syntax protection for markdown (`.md`) and MDX (`.mdx`) content across static site generators and CMS frameworks (Astro, Next.js Contentlayer, Docusaurus, Nuxt Content, Hugo).

---

## The Defect: YAML Mapping Delimiter Trap

In YAML frontmatter, an unquoted colon followed by a space (`: `) is the canonical key-value delimiter. When authors write titles, descriptions, or subtitles containing subtitles or ratios:

```yaml
---
title: AI Agents: The Next Evolution of Coding
description: Fast, reliable, and secure: a guide for teams
tags: [ai, agents]
---
```

Standard YAML parsers (`js-yaml`, `yaml`, Gray-Matter) interpret `The Next Evolution of Coding` as an illegal nested mapping entry without a key, throwing fatal build-time errors:
- `YAMLException: bad indentation of a mapping entry`
- `YAMLParseError: Mapping values are not allowed in this context`

Similar syntax breakages occur when unquoted values contain curly braces `{ }`, brackets `[ ]`, or hash symbols `#`.

---

## The Invariant

1. **Auto-Quoting Strings**: Any frontmatter scalar value containing colons (`: `), curly braces (`{`), brackets (`[`), or leading hashes (`#`) **MUST** be enclosed in double quotes (`"..."`).
2. **Double-Quote Escaping**: Internal double quotes must be cleanly escaped as `\"`.
3. **Automated Pre-Flight Lint**: All generated blog posts, case studies, and documentation must pass the frontmatter linter before commit.

---

## Valid vs Invalid Syntax

### ❌ Fatal Syntax Errors:
```yaml
---
title: System Architecture: Deep Dive into Micro-frontends
description: The 80: 20 rule in modern software
---
```

### ✅ Clean Quoted Syntax:
```yaml
---
title: "System Architecture: Deep Dive into Micro-frontends"
description: "The 80: 20 rule in modern software"
---
```

---

## CLI Commands (`frontmatter-guard.ts`)

```bash
# Lint markdown and MDX files for frontmatter syntax violations
bun skills/agency-delivery/content/scripts/frontmatter-guard.ts --lint ./content

# Automatically sanitize and quote illegal unquoted scalars in place
bun skills/agency-delivery/content/scripts/frontmatter-guard.ts --fix ./content
```
