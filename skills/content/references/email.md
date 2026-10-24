# email — Email: sequences and campaigns with one action per send.

## Intake

- Lifecycle moment (welcome, onboarding, nurture, re-engagement, launch)
- Sequence length and send cadence
- The one action each email earns
- Segmentation and personalization data available
- Default stack: listmonk + Mailgun, Klaviyo for ecommerce — or any ESP with equivalent sends.

## Deliverable

An email sequence: subject line + preview per send, body copy, one CTA each, cadence, segmentation logic, and a success metric per email.

## Procedure

1. Map the sequence to the lifecycle moment and the reader's state using a proven sequence formula from `copy.md` (e.g. **Rob Walling 5-Day Onboarding Drip**, **Wishpond 5-Part Lead Nurture**, **String of Pearls**, **PASOP Sequence**, or **6-Email Product Launch**).
2. Select subject lines from the 12 High-Open Subject Line Archetypes in `copy.md` (Curiosity Gap, Data/Numbered, How-To, Direct Inquiry, Social Endorsement, Punctuator, Shorty, etc.) with 2 variants for split-testing.
3. Shape body copy around the chosen formula: one action per send, short scannable paragraphs, and CTAs following the First-Person / RAD rules in `copy.md`.
4. Give each email exactly one action; sequence the actions toward the outcome.
5. For newsletters and publicly archived sends, ensure AEO/SEO indexing: include extractable 18-token standalone insight sentences and structured key takeaways.
6. Set cadence and timing from the reader's behavior, not a fixed drip.
6. Personalize with real data you have — never fake personalization.
7. Define the success metric and exit condition per email.
8. Map the narrative arc across the sequence plus branching logic: one action per send, conditional paths with exits for converted/unengaged readers.
9. Pass the bulk-sender deliverability gate: authentication set, one-click unsubscribe present, complaint rate under ceiling, list hygiene current. Infra spine (source: resend `email-best-practices` SKILL.md + `references/deliverability.md`, MIT — mechanisms only, client's own ESP/DNS tooling):
   - Authenticate the domain before first send: SPF TXT (`v=spf1 … ~all`), DKIM TXT from the ESP, DMARC starting `p=none` with `rua=` reporting, then tighten `p=quarantine; pct=25` → `p=reject`. Verify with `dig TXT` on the domain, `<selector>._domainkey`, and `_dmarc` — no output = record missing. Gmail/Yahoo/Microsoft reject or spam-filter unauthenticated mail.
   - Split sending purpose by subdomain (`t.` transactional vs `m.` marketing); low DNS TTL during setup, high after stable.
   - Warm new domains/IPs gradually (roughly 50–100/day week 1 → 5k–10k by week 4), starting with engaged users; never buy lists or spike volume.
   - Hold the ceilings: bounce <1% good (remove hard bounces immediately; soft-bounce retry 1h → 4h → 24h, drop after 3–5 fails), complaints <0.01% excellent / >0.05% critical (remove complainers immediately, feedback loops via Gmail Postmaster Tools / Yahoo / Microsoft SNDS).
   - Send idempotently with retry logic; process delivery/bounce/complaint webhook events into a suppression list; run list-hygiene jobs. Diagnose in order: auth → List-Unsubscribe header (required since Feb 2024) → reputation (Postmaster Tools, mail-tester, MXToolbox blacklists) → content → sending patterns.
10. Humanize pass; verify every claim and link.
11. For cold outbound (separate send on a separate domain — never mixed with lifecycle mail): personalization must connect to the problem (if the opening line is removable, it fails); interest-based CTAs ("worth exploring?") beat meeting asks; 3-5 touches with widening gaps, each adding new value, ending in a breakup email that honors the no.
12. Tier cold opens by seniority: executives get 2-3 strategic sentences (revenue, risk, competitive edge) — operational detail gets delegated; managers/ICs get tactical workflow pain and time savings.
13. Match hook effort to deal size: verbatim strong hooks (their exact words tied to relevance) for enterprise/competitive displacement; lite conceptual hooks for volume plays.
14. Audit every cold send against a quantified scorecard: score 1–10 per dimension (relevance, brevity, proof, CTA fit), deduct for killers (generic flattery, rhetorical questions, "I"-opener, premature meeting ask, em-dash/formulaic polish); first touch must pass the 15-second read-aloud at 75–100 words.
15. Judge outbound performance by reply rate first and positive-reply/meeting rate second; open and click rates are red herrings — never optimize for them.
16. Classify every reply before answering (positive, objection, deferral, referral, unsubscribe) and match the strategy: positives get a frictionless next step, objections get one proof point, deferrals get a timed trigger, unsubscribes get honored instantly with no counter.
17. Newsletter issues: open with a specific result plus one-line credibility plus the value promise; section flow problem → framework → steps → examples → forward-looking close; tune every field to the author's voice profile before drafting.
18. Size lifecycle sequences to the system (source: marketingskills `emails` SKILL.md): welcome 5–7 sends over 12–14 days, nurture 6–8, re-engagement 3–4 ending in a list-clean exit for the unengaged, onboarding 5–7 tied to activation milestones. Subject lines 40–60 characters; preview text 90–140 characters that extends the subject, never repeats it.

## Quality gate

- [ ] Sequence mapped to a recognized formula from `copy.md` (Walling 5-day, Wishpond, String of Pearls, PASOP, 6-email launch).
- [ ] Subject lines drawn from the 12 Subject Line Archetypes in `copy.md` with test variants.
- [ ] Each email has a single action and CTA follows RAD/First-Person rules.
- [ ] Cadence and segmentation defined.
- [ ] Personalization uses real data only.
- [ ] Publicly archived issues AEO-indexed with 18-token extractable insights.
- [ ] Success metric and exit condition per email.
- [ ] Branching paths with exits defined; arc holds across the sequence.
- [ ] Deliverability gate passed (auth, unsubscribe, complaint ceiling, hygiene).
- [ ] Purpose-split subdomains set; new senders warmed gradually; idempotent sends + webhook-driven suppression live.
- [ ] Humanize pass run.
- [ ] Cold outbound isolated on its own domain; personalization passes the removable-opening test; sequence ends in a breakup.
- [ ] Cold opens tiered by seniority (strategic-brief for execs, tactical for users); hook strength matched to deal size.
 - [ ] Cold copy scored with deductions logged; reply-rate-first verdict; every reply classified with a matched next step.
 - [ ] Lifecycle lengths match the system (welcome/nurture/re-engagement+exit/onboarding); subjects 40–60 chars, previews 90–140 chars extending the subject.

## Routing

- List/prospect sourcing questions → growth funnels mode (acquisition stage); warm nurture stays in this mode.
- Copy audit-only requests (scorecard + rewrite, no new send) stay in this mode; page-copy CTA work → content copy mode.
- Newsletter ideation (pillar × format grids) → smm content mode for the matrix.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
