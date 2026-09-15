# 📣 paidads

The paid advertising department head: one skill, ten channel and ops modes. Shared campaign doctrine first, then the per-platform playbook — Google, Meta, LinkedIn, Reddit, TikTok, Snapchat, YouTube, programmatic, retargeting, and account audit.

## Install

```bash
npx skills add harshsinghmp/muse-skills --skill paidads
```

## Use

Describe the task in plain language; the frontmatter triggers discovery:

```text
Build a Google Search campaign for our B2B SaaS — budget $5k/mo, target CPL $80.
```

```text
Audit our Meta ads account — CPMs doubled this quarter.
```

## Modes

| Mode | Request it with | Deliverable |
|:---|:---|:---|
| **google** | Google Search, Performance Max, Shopping, Display | Google Ads: Search, Performance Max, Shopping, Display — intent capture structure. |
| **meta** | Meta (Facebook/Instagram) campaigns | Meta Ads: feed/stories/reels structure, Advantage+ and manual learning discipline. |
| **linkedin** | LinkedIn B2B campaigns | LinkedIn Ads: firmographic targeting, sponsored content, lead-gen forms for B2B. |
| **reddit** | Reddit promoted posts and community targeting | Reddit Ads: community targeting with native, non-promotional creative rules. |
| **tiktok** | TikTok in-feed and Spark ads | TikTok Ads: creative-first, Spark ads, rapid-fatigue management. |
| **snapchat** | Snapchat Snap Ads, Story Ads, AR lenses | Snapchat Ads: Snap/Story ads and AR lenses for younger demographics. |
| **youtube** | YouTube video campaigns | YouTube Ads: skippable in-stream, Shorts, discovery — hook-driven video structure. |
| **programmatic** | programmatic/DSP display and video | Programmatic: DSP display/video buying, brand safety, supply path. |
| **retargeting** | cross-channel retargeting funnels | Retargeting: audience pools, frequency caps, cross-channel funnels. |
| **audit** | audit an ad account | Account audit: structure, tracking, creative, budget — findings with evidence. |

## How it works

1. **Intake** — the department gate in SKILL.md Quick Reference.
2. **Mode resolution** — one mode per run; only its reference loads (token-efficient).
3. **Execute** — the mode playbook in `references/`.
4. **Gate** — verification checklist before delivery.

## License

[MIT](LICENSE)
