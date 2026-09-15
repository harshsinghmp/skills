# ✍️ content

The content studio department head: one skill, six modes — blog, copy, email, video, case-study, humanize. Source-anchored writing, then an editorial pass that keeps it human.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill content
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Write a 1,500-word SEO blog post on React Server Components for our dev blog.
```

```text
Draft a 5-email onboarding sequence and a launch case study for our SaaS.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **blog** | SEO blog post or article | Blog: intent-matched, SEO-aware articles from a keyword brief. |
| **copy** | website / landing page copy | Copy: hero, feature, and CTA copy built around one action. |
| **email** | email campaign or sequence | Email: sequences and campaigns with one action per send. |
| **video** | video script | Video: hook, structure, and shot direction for the target platform. |
| **case-study** | customer case study | Case study: a before/after customer story with real numbers and a quote. |
| **humanize** | prose humanization | Humanize: strip AI-sounding patterns while locking facts and voice. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
