# shape — Shaping an Ask Before It Gets Priced

## Intake

- The raw ask in the client's own words (verbatim, not rewritten)
- Who is asking and the deadline pressure they feel
- What they do today without it (the baseline)
- Any prior attempt, workaround, or abandoned version

## Deliverable

A shaped pitch — the internal commitment case, not the sales document:

- **Problem** — one specific story showing why the status quo fails
- **Appetite** — a band, plus what it deliberately excludes
- **Solution** — the elements, one level above a mockup
- **Rabbit holes** — each named and patched or fenced
- **No-gos** — what is explicitly not being done, in writing

## Procedure

1. **Grab-bag triage.** "Redesign X", "X 2.0", "refactor X" are not projects. Refuse until one problem is named: rewrite "redesign the site" as "sharing multiple files takes too many steps", then shape that.
2. **Appetite before design.** Size in bands, never from an estimate: Quick fix (≤2 days) · Small batch (1–2 weeks) · Big batch (one cycle band). An estimate starts from a design and ends with a number; an appetite starts with a number and ends with a design.
3. **Narrow the problem.** Flip "what could we build?" to "what's really going wrong?" Ask when the requester last hit the problem, not why they want the feature.
4. **Work at the right level of abstraction.** A slogan ("add ordering") gives nobody a basis for trade-offs; a finished mockup commits everyone to details that were never validated. Stay one level above a wireframe.
5. **De-risk: patch, fence, or cut.** Patch a hole by dictating the decision in writing · declare use cases out of bounds · cut whatever is not required to hold the appetite.
6. **Write all five ingredients.** No-gos are mandatory. A solution without a named problem has no test of fitness; a problem without a solution is unshaped work handed to a team under deadline.
7. **Bet it, and honour the bet.** A commitment means an uninterrupted band — pulling the team away for "just a day" costs the momentum, not the day. If it does not fit, re-shape it; it does not extend.

## Quality gate

- [ ] One named problem, in the client's words, with a baseline.
- [ ] An appetite band stated, and what it excludes.
- [ ] No-gos written down, not implied.
- [ ] Every rabbit hole either patched or fenced.
- [ ] Nothing priced, promised, or staffed before this artifact exists.

## Routing

- Pricing and the client-facing document → `proposal`
- Contracted scope and terms → `sow`
- Delivery tracking and change orders → `milestone`
- Request arriving mid-flight → `coach` (client mode, interception)
- Staffing and capacity decision → `multi-client`

## Sources

Shape Up — Ryan Singer (basecamp.com/shapeup). Mechanisms paraphrased and translated into agency terms; the book's product-team specifics and tooling are deliberately excluded. Terminology note: the no-extension commitment rule here is unrelated to the retry circuit breaker in `dead-letter`.
