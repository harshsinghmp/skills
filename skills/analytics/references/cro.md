# cro — CRO: find the funnel leak, then fix it with a disciplined experiment.

## Intake

- Funnel steps and current conversion rates
- Traffic volume per step (is there enough to test?)
- Analytics/tools access and existing hypotheses
- Constraints (brand, legal, technical)
- Default stack: PostHog experiments plus Clarity/Hotjar recordings; else any A/B tool plus session replay.

## Deliverable

A CRO plan: a funnel audit with drop-off by step, prioritized hypotheses (impact × confidence × effort), a test spec for the top hypothesis, and a results read-out template.

## Procedure

1. Audit the funnel step by step; find the biggest drop-off with enough traffic to matter.
2. Form hypotheses from evidence: session recordings, surveys, support tickets, heuristics.
3. Prioritize with impact × confidence × effort; pick the top hypothesis.
4. Write a test spec: the single variable, control vs variant, primary metric, sample size/duration.
5. Ensure enough sample size before declaring significance — no peeking and stopping.
6. Run the test; read results against the pre-registered metric and guardrails.
7. Ship winners, document losers, and feed learning into the next hypothesis.
8. Score hypotheses Impact-Confidence-Ease; write each as "If we change X, metric Y moves because rationale Z".
9. Size samples for 80% power at 95% significance with a minimum duration set before launch; no early stops.

## Quality gate

- [ ] Biggest leak (with traffic) identified first.
- [ ] Hypotheses grounded in evidence, not opinion.
- [ ] One variable per test.
- [ ] Sample size/duration set before launch.
- [ ] Hypotheses ICE-scored and written If-change-then-metric-because-rationale.
- [ ] Sample sized at 80% power / 95% significance with minimum duration enforced.
- [ ] Results read against a pre-registered metric.
- [ ] Learning documented for the next cycle.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
