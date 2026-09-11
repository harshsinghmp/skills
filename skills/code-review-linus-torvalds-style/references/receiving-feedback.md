# Receiving Feedback — rigor over compliance

Loaded by the `receive` mode: review feedback has arrived on your work and needs
acting on. The failure mode this lane exists for is **performative agreement** —
implementing feedback because it arrived, not because it is correct.

## Protocol

1. **Verify before implementing.** Check every piece of feedback against the actual
   code. Read the lines the reviewer cites; confirm the claimed behavior exists.
2. **Classify each item** into exactly one response:
   - **Implement** — verified correct; apply it (one commit per finding when more
     than one).
   - **Rebut** — verified wrong; answer with evidence (test output, spec reference,
     line citations), never with deference. A reviewer can be wrong; the code is the
     arbiter.
   - **Ask** — genuinely ambiguous; reply with one specific question, not a restate
     of the feedback.
3. **Risk-gate before applying.** Feedback touching authentication, payments,
   migrations, or public contracts gets investigation before application — never a
   blind edit, however senior the source.
4. **Close the loop.** After applying, re-verify the original concern is actually
   addressed (not just the literal suggestion implemented) and report what was done
   per item.

## Anti-patterns

- "Great catch!" followed by an unverified edit — sycophancy is not review.
- Silent partial application (implementing 3 of 5 items, mentioning none).
- Complying with mutually contradictory feedback instead of surfacing the conflict.
- Treating the review as an approval ritual to survive rather than a correctness
  instrument.
