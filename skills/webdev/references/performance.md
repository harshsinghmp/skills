# performance — Performance: profile first, fix the measured bottleneck, verify in field data.

## Intake

- Field data (CrUX/GA4/RUM) or lab access
- Symptom (LCP slow? INP? CLS?)
- Templates affected (all? one?)
- Constraints (CMS, third-party scripts, image pipeline)

## Deliverable

Performance report: measured baselines, bottleneck diagnosis with evidence, fixes applied in impact order, before/after lab + field verification.

## Procedure

1. Baseline from field data (CrUX/RUM); lab (Lighthouse) only as secondary — field is truth.
2. Reproduce the bottleneck: which template, which asset, which third-party — extremes first (slowest supported device, throttled network); the worst case defines the budget.
3. Fix in impact order: images (AVIF/WebP, dimensions, lazy), fonts (subset, swap), JS (split, defer), third-parties (delay, facade).
4. Re-measure lab after each fix; don't stack unverifiable changes.
5. Watch field data over 28 days for the real verdict.
6. Document the budget going forward (weight/size thresholds per template).

## Quality gate

- [ ] Baseline existed before fixes, including the slowest supported device/network extreme.
- [ ] Every fix traces to a measured bottleneck.
- [ ] Lab re-measured after each fix.
- [ ] Field data (not just lab) shows the verdict.
- [ ] Performance budget documented.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
