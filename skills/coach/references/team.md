# ☀️ Team & Developer Execution Mode (`coach:team`)

> **Council Lead**: **Crew** (Operations & Delivery Lead) & **Nexus** (Quality Gate)  
> **Target Scope**: Internal agency delivery squads, autonomous AI subagents, and lead engineers.  
> **Core Objective**: Optimize controllable execution inputs, prevent context fragmentation, eliminate silent blockers, and enforce vertical tracer slices with verified test gates.

---

## 🧭 The 18 Team & Engineering Pain Points Solved

| # | Pain Point | Core Failure Mechanism | Coach Automated Solution & Invariant |
| :--- | :--- | :--- | :--- |
| **P9** | **Laundry-List Standups** | 45-minute verbal status claims with zero forensic evidence. | **Git-Grounded Check-In**: Status generated from `git log --since="24 hours ago"`. Scores 5 controllable inputs (0–10). |
| **P10** | **The Silent Blocker Epidemic** | Engineers spin wheels for >60m on broken APIs before escalating. | **60-Minute Escalation Gate**: If working branch has no commits/green tests in 60m, auto-escalates to `dead-letter`. |
| **P11** | **Context Switching & Ping Thrashing** | Mid-sprint interruptions destroy cognitive flow across 4+ client channels. | **Deep-Work Ringfence**: Tracks continuous focus blocks (≥4 hours). Alerts leadership when switch frequency exceeds 3/day. |
| **P12** | **Kitchen-Sink Pull Requests** | 2,000-line monster PRs mixing refactors, features, and config tweaks. | **Atomic Diff Ceiling**: PR diffs >300 lines or spanning multiple decoupled domains are blocked from review. |
| **P13** | **Test-After Rationalization** | Writing happy-path tests after code, testing internal implementation mocks. | **TDD Seam Gate**: Enforces red-before-green vertical slices. Unconfirmed seams score 0 pts on daily effort. |
| **P14** | **"Works on My Machine" Crashes** | Local state differs from production runtimes and CI. | **Clean-Clone Pre-Merge Contract**: Verification commands must execute from a clean clone with pinned package toolchains. |
| **P15** | **Figma-to-Code Drift** | Designers build arbitrary pixel layouts; devs write ad-hoc CSS overrides. | **Design Token Fence**: Audits component styles against DTCG token variables (`brand.md`, OKLCH) before PR approval. |
| **P16** | **Tooling & Linter Mismatches** | Divergent formatter configs cause thousands of lines of git churn. | **Modern Tool Primacy Audit**: Enforces repository-pinned linter/formatter (`biome`, `ruff`, modern CLI matrix). |
| **P17** | **Multi-Client Context Leaks** | Secrets or logic from Client A accidentally committed to Client B repository. | **Vibeguard Domain Isolation**: Scans diffs for foreign tenant IDs, credentials, or private client keys before staging. |
| **P18** | **Junior Dev Onboarding Drag** | Seniors spend weeks hand-holding juniors through basic repo setups. | **Interactive Simulation Runway**: Autonomous pairing harness guides new hires through reproducible sandboxed tasks. |
| **P19** | **Burnout & "Crunch" Normalization** | Continuous firefighting creates chronic exhaustion and high staff turnover. | **Friction Index Alert**: Evaluates consecutive late-night pushes vs. deep work ratio, triggering capacity recalibration. |
| **P20** | **Toxic / Passive-Aggressive Reviews** | Dismissive review comments crush morale and stall delivery velocity. | **Constructive Feedback Filter**: Translates accusatory review remarks into objective architectural questions. |
| **P21** | **The "Competence Curse"** | Top 20% engineers get overloaded with 80% of tough tickets and burn out. | **Cognitive Load Heatmap**: Balances task allocation across team members based on PR cyclomatic complexity. |
| **P22** | **Impact Disconnect** | Engineers feel like ticket cogs, unaware if features moved client revenue. | **Revenue Impact Ledger**: Maps closed GitHub issues directly to client business KPIs during weekly retros. |
| **P23** | **Frontend vs Backend Finger-Pointing** | Mismatched API payloads cause friction during final milestone assembly. | **Contract-First Seam Locking**: OpenAPI/tRPC/Zod schemas locked and verified before writing UI or endpoint logic. |
| **P24** | **Skill Stagnation & Boredom** | Monotonous agency CRUD apps drive ambitious talent to leave. | **10% Mastery Stretch Track**: Allocates 10% sprint capacity to exploratory architecture and performance profiling. |
| **P25** | **AI Hallucination & Slop Ingestion** | Engineers blindly paste unchecked AI code into production repositories. | **AI Co-Pilot Governance**: AI agents subjected to identical TDD gates, linters, and adversarial review verifications. |
| **P45** | **Inconsistent Cross-Squad Quality** | Squad A ships clean code while Squad B ships rushed technical debt. | **Universal Hardening Gate**: All squads pass identical automated gauntlets (`audit`, `qa-launch`, `muse-security`). |

---

## ⚡ Execution Procedure

```
┌────────────────────────────────┐     ┌────────────────────────────────┐
│ 1. Forensic Git Extraction     │ ──► │ 2. Controllable Scoring        │
│ git log, diff stat, test runs  │     │ 5 Pillars (0–2 pts each)       │
└────────────────────────────────┘     └────────────────────────────────┘
                                                       │
┌────────────────────────────────┐                     ▼
│ 4. Emit daily-standup.md       │ ◄── ┌────────────────────────────────┐
│ Focus priority, blocker ticket │     │ 3. Blocker & Stall Triage      │
└────────────────────────────────┘     │ Escalation to dead-letter      │
                                       └────────────────────────────────┘
```

### Step 1: Forensic Git Extraction
Execute automated inspection of git history:
```bash
git log --since="24 hours ago" --oneline
git diff --stat HEAD~1 HEAD
```

### Step 2: Score Controllable Inputs (1–10 Effort Rubric)
Evaluate the 5 core discipline pillars using `references/effort-rubric.md`:
1. **TDD Rigor (0–2)**: Red watched fail before green? Vertical tracer slice? (0 pts if unconfirmed seam).
2. **Diff Discipline (0–2)**: Atomic commit? <300 lines? Zero unrelated formatting?
3. **Hygiene & Security (0–2)**: Clean secret scan? Zero exposed tokens? Linters passed?
4. **Deep Work Focus (0–2)**: ≥4 hours continuous flow on Top 1 MIT?
5. **Blocker Triage (0–2)**: Blockers isolated within 60 minutes and routed to `dead-letter`?

### Step 3: Blocker Triage
If an engineer or agent is blocked >60 minutes:
1. Isolate the exact failing seam or missing dependency.
2. File a structured entry in `.agents/context/dead-letter.md` or invoke `dead-letter`.
3. Switch active branch to secondary task to preserve deep-work momentum.

### Step 4: Emit Standup Artifact
Generate `daily-standup.md` documenting verifiable accomplishments, effort score, and tomorrow's Single Most Important Task (MIT).
