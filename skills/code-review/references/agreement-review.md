# Agreement Review — the cross-boundary falsification engine

> Source: `pm-skills-code-review` (raw SKILL.md fetched 2026-09-19 from
> `github.com/phuryn/pm-skills`) — mechanism only. Loaded by the `audit`
> mode: the defects reviewers miss are rarely visible inside one file.

The unit of review here is the **agreement**, not the file. Missed defects
are disagreements between two participants that each look reasonable alone —
caller/callee, producer/consumer, writer/later-reader, two branches that
should establish the same state. One engine, three anchors: **correctness**
(agreements across a boundary, default) · **performance** (workload →
demand → growth/contention → consequence) · **security** (source → trust
boundary → sink, attacker controls the source). Sub-cases activate
independently; one root cause with two impacts is reported once, with both.

## Shared engine

Map a flow → identify an obligation → inspect every participant →
construct a violating execution → trace the consequence → attempt
refutation → report. Build one minimal map first (inputs, flows, state
owners, external deps, observable effects); never one map per sub-case.

## Correctness: hold the agreement in working notes

A boundary is semantic, not a file split. For each consequential
agreement record: participants / value-effect exchanged / authority (who
decides the real answer) / identity-lifetime / required relationship /
evidence / orderings / observable consequence. Evidence comes from specs,
contracts, language semantics, tests encoding an expectation, or a
necessary producer/consumer relationship — a consumer's implementation
alone never proves the consumer right. Start where agreements break:
transformed/negotiated values, reassigned identities, async boundaries,
persist-and-reload, effects that must agree — then a local pass over plain
bugs so the anchor never becomes a filter.

## Force a violating execution

A suspicion is not a finding until you construct the execution that breaks
it: requested value ≠ accepted/effective value; two operations live with
varied completion order; identity changed between observation and use;
distinct transitions that should end equivalent; failure injected between
effects; empty / exact-boundary / adjacent-boundary inputs. Establish
reachability — never assume it.

Two classes need a forced probe, not a checklist mention:
**authority reconciliation** (follow a proposed value through validation;
find downstream state still derived from the proposal where the authority
can return something different) and **identity/correlation** (trace how a
result finds its entity; prove the key unique, stable, live long enough
under overlap, reorder, removal, reuse).

## Refutation: five parts or it isn't a finding

1. Supported obligation (what must hold + evidence).
2. Feasible execution (inputs, state, ordering the system permits).
3. Concrete contradiction (where the obligation fails).
4. Observable consequence (wrong output, state, effect, progress).
5. Examined counterargument (strongest preventing/repairing mechanism).

Keep / Drop (cited evidence defeats it) / Unresolved (unknown contract —
listed separately, never as a finding). **Absorption is not prevention**:
a cache that usually holds, a retry that usually succeeds, a default
usually right — coincidence with good odds, not a guarantee. Drop only on
a mechanism making the execution *impossible*, named. "Works nearly
always" describes a race, not a refutation. Zero supported findings is a
valid result; never group by file — dedup by violated agreement and root
cause.

## Fan-out and report

Fan out over complete flows or connected agreement groups — never over
files, never one worker per defect class (file-partitioning hides exactly
the cross-boundary defects worth finding). Workers inspect both sides,
return candidates + evidence + refutations; strong candidates get a
separate verification pass. Tell workers they are reading, not editing,
and confirm the tree is unchanged after the run.

Report: `[Severity] [Dimension] consequence` / Expectation (+evidence) /
Trigger / Defect (violated relationship, both participants cited) /
Impact / Refutation checked / Remedy / Verification (executed vs
established-from-source). Then coverage per sub-case: examined with
findings · examined, none supported · N/A with reason · not examined with
reason. "No supported findings in scope" — never "bug-free".
