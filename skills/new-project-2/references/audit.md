# audit — new-project audit mode

## When to Use

- **Post-provision certification**: verify a freshly scaffolded or adopted project carries the complete agent infrastructure before the first real task runs in it.
- **Inherited-repo onboarding audit**: score an existing repository's agent-readiness and emit the shortest path to close the gaps (complements, never replaces, `updateagents:scorecard` which grades the DOX assets themselves).
- **Upgrade verification**: confirm a repo updated by a newer engine version actually adopted the new standards and gates.

## Checklist (readiness-level lens, evidence per check)

- [ ] **L1 Baseline — runnable basics**: one obvious command each for start / test / lint / type-check exists in package scripts and is quoted in the root instructions; suite green on a clean tree
- [ ] **L2 Documented**: root `AGENTS.md` is headed and sectioned (commands / architecture / conventions); describes *capabilities*, not brittle file paths (stale docs poison agent context); `.env.example` parity holds; ownership recorded
- [ ] **L3 Agent-ready — DOX container complete**: `.agents/context/` carries the required files (index, product, stack, current, roadmap as applicable); `.agents/standards/` complete and linked from the router; PR template carries the Landing Gate checklist line
- [ ] **L3 Gate wiring**: `landing-gate.yml` (or equivalent CI step) present with `fetch-depth: 0` and `GH_TOKEN`; branch protection makes it required; delivery vocabulary (LANDED/LOCAL) in the instructions
- [ ] **L4 Optimized — self-maintaining loop**: doc-sync gate (updatedocs fast-skip/dispatch drift check) in CI; capability-sweep wired; derived-artifact bundle declared with its regenerate + `--check` commands
- [ ] **Evidence rule**: every verdict cites the checked file or command output (pass / partial / fail); unassessable checks are skipped and excluded from scoring, never silently passed
- [ ] **Contiguous levels**: a repo cannot be credited L3 while L2 checks fail — report the highest contiguous cleared level, not the best single check
- [ ] **Monorepo discipline**: nested packages carry their own scoped instructions and inherit only what is true tree-wide

## Severity & routing

| Finding | Severity | Action |
|:---|:---|:---|
| No root instructions or no runnable test command | `BLOCK` | fix before any agent task runs in the repo |
| DOX container partially populated (context files missing) | `REQUEST-CHANGES` | emit the phased improvement plan (L2 → L3 gaps first) |
| Gate or CI wiring incomplete | `REQUEST-CHANGES` | provision via the engine, re-verify |
| Staleness only (docs old but accurate) | `REPORT-ONLY` | schedule the next sync pass |

## Sources

- Larridin Agent Readiness — 84 binary checks, nine categories, five levels (L1 Baseline → L5 Autonomous); skipped checks excluded from scoring; levels are contiguous
- Kodus `agent-readiness` — open-source alternative: 39 automated checks across seven pillars, one-command scoring
- agents.md spec — the AGENTS.md format and its placement/nesting conventions
- AI Hero — "A Complete Guide to AGENTS.md" (stale documentation poisons agent context; describe capabilities, not brittle paths)
- Cosmoscalibur — Agent Readiness Framework (nine technical pillars, ✅/⚠️/❌ evidence per criterion, phased improvement plan)
