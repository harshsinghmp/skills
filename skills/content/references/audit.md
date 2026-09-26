# audit — content audit mode

## When to Use

- **Content-quality audit**: Verify published content meets editorial standards
- **Fact-verification audit**: Check all claims have cited sources

## Checklist

- [ ] All published content passes `humanize` anti-slop scan
- [ ] Every factual claim has a source citation (URL or doc reference)
- [ ] No AI-tell patterns (significance inflation, forced triads, synonym cycling)
- [ ] Content matches brand voice guide
- [ ] Readability score within target range (Flesch 60+ for web)
- [ ] No outdated statistics or data (>1 year old without "as of" date)
- [ ] All images have alt text and attribution (if required)
- [ ] Internal links use descriptive anchor text
- [ ] Content calendar updated with publication dates
- [ ] Content-to-claims ledger (`evidence-ledger`) reconciled

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Uncited claim | `PROPOSE-DIFF` | `evidence-ledger` (add receipt) |
| AI slop detected | `AUTO-REPAIR` | `humanize` (rewrite) |
| Outdated statistic | `AUTO-REPAIR` | update + add "as of" date |
| Brand voice violation | `REPORT-ONLY` | `content` (revision) |
| Broken internal link | `AUTO-REPAIR` | `seo` audit |

## Output

`.agents/artifacts/audit-content-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
