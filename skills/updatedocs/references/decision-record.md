# Decision Record with Approval Evidence

Captures one decision, the options rejected beside it, and a resolvable pointer to who
approved it, so the choice can be re-audited months later without asking anyone.

## When to Use

- A choice had real alternatives and someone will ask "why not X?" after the people in the
  room have moved on.
- A rejected option must survive in writing next to the chosen one: vendor, hosting model,
  schema shape, dependency, protocol.
- An approval arrived verbally or in chat and must be pointable later for audit, compliance
  or client sign-off.
- An earlier decision is being reversed and the original record must stay intact rather
  than be edited into agreement.
- Documentation drift has produced behaviour whose rationale exists only in a PR thread, a
  ticket comment, or nobody's memory.

## Procedure

1. One record per decision. If the decision has two heads ("which database and which ORM"),
   write two records and cross-link them. Assign an id as `DR-YYYYMMDD-<slug>`, or use the
   repo's existing sequence (`DR-014`) if one is already in use — never introduce a second
   numbering scheme beside the first.
2. Place it with the project's documentation, not in a chat archive: `docs/decisions/` by
   default, or the established equivalent if the repo already has one
   (`.agents/artifacts/decisions/` where working state is deliberately separated from
   shipped docs). Filename `<id>-<slug>.md`. Maintain one index file listing id, title,
   status, date and approver — the index is the entry point, the record is the detail.
3. Write the template sections in this fixed order:
   - **Status** — `proposed` | `accepted` | `rejected` | `superseded by DR-…`, each with a
     date.
   - **Context** — the constraint that forced a decision, as facts with links and numbers:
     deadline, cost ceiling, traffic figure, contractual requirement, existing consumer. No
     preferences, no adjectives.
   - **Options** — a table of every option considered plus "do nothing", with the two or
     three properties that actually discriminate as columns (cost, latency, lock-in,
     operational load, migration risk). Fill every cell, or write "unknown" and state how
     it would be resolved.
   - **Rejected, and why** — one short paragraph per rejected option: the specific
     disqualifier first, then the condition under which it becomes the right answer again
     ("revisit above 5k writes/s"). This is the section people return for.
   - **Decision** — the chosen option as a directive sentence, plus which parts are
     reversible and at what cost.
   - **Consequences** — what gets harder, what must now be maintained, and what is
     explicitly out of scope as a result.
   - **Approval** — approver's name, role, date, and evidence: a permalink to the PR
     review, issue comment, signed document or ticket id, with the approving sentence
     quoted. If the only evidence is verbal, record who heard it and when, and open a task
     to obtain written confirmation; an unconfirmed approval is not evidence.
4. Write the record with the change, not after it: same PR as the implementation, so review
   covers reasoning and code together. A record written retroactively is a rationalization
   and must be labelled as reconstructed.
5. Link out instead of duplicating. One line in the changelog under the release's
   Added/Changed section naming the record id (per `CHANGELOG-POLICY.md`), and one comment
   where the decision is load-bearing in code or config carrying the id plus a single
   sentence of reason. Three copies of the rationale drift; one record plus pointers does
   not.
6. Supersede, never overwrite. To reverse a decision, create a new record, set the old
   one's status to `superseded by <new id>` and leave its body untouched; the new record's
   Context links back and states what changed — new data, new constraint, changed price —
   that invalidated the old reasoning. The index shows current status only; the file keeps
   the history.
7. Keep a record to roughly one screen. Supporting analysis, benchmarks and cost tables live
   in the design document it links to, not in the record.
8. When a decision changes what the documentation claims, hand the propagation to a
   `updatedocs` sync pass rather than editing prose by hand in several places; the record
   remains the source of the reasoning.

## Verification

- Each record has an id, a status with date, and exactly one named approver.
- The approval evidence link resolves for a reader who lacks access to the author's inbox —
  no "see Slack".
- The options table holds at least two real alternatives plus "do nothing", each with filled
  discriminator columns.
- Every rejected option names a disqualifier and a revival condition.
- The changelog line and the code comment both reference the record id, and both still
  resolve.
- Superseded records exist unedited with forward-pointing status, and the index agrees with
  the filesystem — no orphan records, no missing rows.
- A reader can reconstruct the reasoning from the record alone, without the PR thread.

## Anti-Patterns

- A decision log that records only the winner, which makes it a changelog of conclusions and
  useless at the moment the choice is questioned.
- "Team agreed" as approval evidence, with no name, no timestamp and no link — unpointable,
  therefore not evidence.
- Editing or deleting an old record so the history matches today's opinion; supersede it and
  state what changed.
