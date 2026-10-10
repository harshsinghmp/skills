# 🧠 Context, Memory & Identity Protocol

## 1. Context Hygiene Protocol

At the start of every response, output: `[Context: ~X% used]`

### Thresholds
- **0% to 30%**: Fresh context
- **30% to 60%**: Normal
- **60% to 80%**: Caution
- **80%+**: Danger

### Compaction Gate
Never auto-compact. When context exceeds 70%, prompt:
> *"Context at ~70%. Want me to compact now, or continue? If we compact, I will preserve the current task state."*

Before compaction, confirm:
1. High-level goal of current build spec
2. Current architecture and data flow
3. What is already implemented and considered done
4. What is explicitly not done yet
5. The next concrete task to execute

---

## 2. Persistent Cognitive Memory (`./.memory` & Memory MCP)

The `./.memory` directory at the project root is the local persistent store managed by Cognitive Memory.

### Session Lifecycle & Concurrency
1. **Pre-Flight Grounding**: At session start, call `get_context()` to load `USER.md`, active `CURRENT.md` invariants, and check active concurrent agent workstreams before editing files.
2. **Multi-Agent Coordination (`CURRENT.md`)**:
   - When running parallel agents across separate chats, register session ID, active task, and target file scopes in `CURRENT.md` under `## 🤖 Active Concurrent Agent Workstreams`.
   - Never modify files currently claimed by another active agent's in-progress workstream.
3. **Durable Knowledge & Anti-Patterns**:
   - Capture verified architectural decisions (`type: "rule" | "architecture" | "adr"`).
   - Capture failed approaches (`type: "negative"`) to prevent repeating past mistakes.
   - Bind memories to AST code symbols rather than fragile line numbers.
4. **Supersession & Storage Hygiene**:
   - Call `memory_supersede()` when replacing outdated patterns so future sessions never hallucinate deprecated methods.
   - Run `memory optimize` periodically or on cadence (7 days / 48h idle) to purge test noise and defragment SQLite.

### ⚠️ Dual-File Distinction: `.memory/CURRENT.md` vs `./.agents/context/current.md`
- **`.memory/CURRENT.md` (Machine & Real-Time Coordination)**: Stores machine-readable active hard constraints, in-flight agent workstream locks, and pre-compaction session handoffs. Never dump static project overviews or changelogs here.
- **`./.agents/context/current.md` (Durable Shipped Reality)**: Owned by the project DOX tree. Stores the human-and-agent verified state of the codebase (verified shipped reality, live deliverables, runtime health oracle, and known gaps/placeholders). Updated during the Phase 5 Closeout DOX pass.

---

## 3. Two-Tier Identity & Context Resolution Cascade

Agent execution resolves identity and rules through a strict two-tier cascade:

### Tier 1: Local Project Scope (`./.agents/context/` & `./.agents/identity/`)
- **`product.md`**: Project domain, ICP, problem statement, and competitive wedge.
- **`architecture.md`**: Local directory layout, component anatomy, data stores, and ports.
- **`stack.md`**: Golden Stack Fence, package allowlist, forbidden blacklist, and Primary Council Lead.
- **`current.md`**: Living snapshot of verified shipped reality, live deliverables, and blockers.
- **`roadmap.md`**: Project 30-90 day milestones and backlog.
- **`brand.md` & `../brand/`**: Local voice, visual identity, customer personas, and W3C DTCG tokens.
- **`vision.md`** *(optional)*: Scoped product vision, target destination, and sprint principles.

### Tier 2: Global Principal Baseline (`~/.agents/identity/`)
When local project files do not specify an override, agents inherit baseline preferences from the user's global configuration:
1. **`user.md`** (Principal Identity): Founder/developer background, strengths, and communication style.
2. **`assistant.md`** (Assistant Stance & Council): Default delegation stance across Council Leads (**Sol**, **Jasper**, **Crew**, **Nexus**).
3. **`vision.md`** (Strategic Vision & Trajectory): Long-term intent, Current Reality $\rightarrow$ Target Destination trajectory, 90-day focus, and core personal values.
4. **`rules.md`** (Global Invariants): Machine-wide toolchain standards, zero-leak credential policies, and git conventions.
5. **`stack.md`** (Host Toolchain Inventory): Host operating system, detected runtimes (`bun`, `node`), and installed modern CLI set (`rg`, `fd`, `bat`, `eza`).

*Rule: Closer docs always control local execution details. Never duplicate global life goals into a project repository.*

### Durable-Memory Proposal Format
When a durable fact, preference, constraint, or recurring pattern is learned, propose a narrow Markdown diff:

```md
Proposed update: [one narrow change]
Target: [canonical file and section]
Reason: [why this is durable and behavior-changing]
Evidence: [user statement, file, command, test, or authoritative source]
Approval: pending human review
```

*Direct edits to identity, health, values, or authorization boundaries require explicit human review.*
