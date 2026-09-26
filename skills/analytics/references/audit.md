# audit — analytics audit mode

## When to Use

- **Data audit**: Verify analytics events fire correctly, definitions match implementation
- **Reporting audit**: Check dashboards reflect real state (no phantom metrics)

## Checklist

- [ ] All tracked events have documented definitions in `.agents/standards/`
- [ ] Event names match implementation (no `page_view` vs `pageview` drift)
- [ ] UTM parameters consistent across campaigns
- [ ] No duplicate event firing (single-fire per page load)
- [ ] Conversion funnel definitions documented and stable
- [ ] Dashboard filters match documented date ranges
- [ ] No credentials or PII in analytics payloads

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Event not firing | `REPORT-ONLY` | `webdev` (fix instrumentation) |
| Definition drift | `AUTO-REPAIR` | `updatedocs` + re-tag |
| PII in analytics payload | `PROPOSE-DIFF` | `secretary` (approval + purge) |
| Funnel definition changed mid-quarter | `REPORT-ONLY` | `analytics` (re-baseline) |

## Output

`.agents/artifacts/audit-analytics-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
