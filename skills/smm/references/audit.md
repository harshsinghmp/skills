# audit — smm audit mode

## When to Use

- **Content audit**: Verify posts followed the style guide, engagement is authentic
- **Channel audit**: Check cross-platform consistency, posting cadence

## Checklist

- [ ] All published posts pass `humanize` anti-slop scan
- [ ] Engagement metrics not inflated by bot activity
- [ ] Cross-posts maintain brand voice per platform
- [ ] Content calendar followed (no >2 day gaps without reason)
- [ ] Hashtag strategy documented per post
- [ ] Community responses answered within SLA (24h)
- [ ] Analytics dashboards reference correct UTM parameters

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| AI slop detected | `AUTO-REPAIR` | `humanize` |
| Bot-inflated metrics | `REPORT-ONLY` | `analytics` |
| Missed posting cadence | `REPORT-ONLY` | `coach` |
| Off-brand content published | `PROPOSE-DIFF` | `content` (take down + redo) |

## Output

`.agents/artifacts/audit-smm-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
