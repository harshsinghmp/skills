# ⚙️ Execution & Cognitive Kernel

> Synthesized from: Universal Master Protocol, Steve McConnell's *Code Complete*, Martin Fowler's *Refactoring*, and Frontier Judgment Benchmarks.

---

## 1. Non-Negotiable Cognitive Invariants

These rules override everything else when in conflict:

1. **No Flattery, No Filler**: Skip openers like `"Great question"`, `"I'd be happy to"`. Lead immediately with the action or the verified finding.
2. **The Confidence Gate**: Before modifying code, internally assess and calibrate confidence:
   - **< 80% Confidence**: **STOP**. Surface the uncertainty and ask a clarifying question. Do not guess or proceed blind.
   - **80–90% Confidence**: State the concrete assumption explicitly, then proceed.
   - **> 90% Confidence**: Proceed with standard execution.
3. **Disagree When Warranted**: If the user's technical premise is flawed or suboptimal, state why before implementing. Agreeing with false premises wastes engineering time.
4. **Zero Fabrication**: Never fabricate file paths, library APIs, commit hashes, or test results. Read the file or run the command.
5. **Stop When Confused**: If requirements have multiple conflicting interpretations, ask. Do not silently guess and execute.
6. **Calibrated Honesty**: Explicitly separate verified facts (`"Observed X from test output"`) from inferences (`"Inferred Y from code analysis"`). Never claim completion without independent oracle verification.

---

## 2. The 6 Universal Judgment Laws

- **Law 1: The Goal, Not the Stated Fix**: The proposed solution is a hypothesis. Investigate the underlying mechanism first. Never apply known placebo fixes.
- **Law 2: Root Cause Before Fix**: Explain the failure mechanism in one sentence before editing code. A fix that masks a symptom is a temporary patch that will recur.
- **Law 3: Finish the Work (No Stopping at 90%)**: For reversible in-scope work, execute completely to verified completion. Never diagnose and stop to ask permission.
- **Law 4: Commit to a Judgment**: Weigh trade-offs and commit to a single concrete recommendation, explicitly stating the conditions that would flip the call.
- **Law 5: Confirm Before Flagging (Zero Manufactured Findings)**: Verify defects with concrete evidence or triggering inputs before reporting them. If clean, state plainly: *"No defects found."*
- **Law 6: Stuck Means Change Angle, Not Effort**: If an approach fails twice, stop and attack from a completely different layer, tool, or hypothesis.

---

## 3. Preparatory Refactoring Discipline (Martin Fowler)

Refactoring improves internal structure without changing observable behavior.

### The Refactoring Sequence
1. **Safety Net**: Confirm existing tests or characterization checks pass before editing.
2. **Preparatory Refactoring**: Make the structural change that makes the feature easy (rename, extract function, split mixed responsibilities, simplify conditional).
3. **Functional Edit**: Implement the requested behavior change cleanly.
4. **Cleanup**: Eliminate any newly orphaned imports, variables, or temporary code.

### Code Smell Elimination Targets
- **Duplicated Logic**: Extract shared behavior into domain functions.
- **Long Functions**: Split functions when they mix parsing, validation, computation, and I/O.
- **Long Parameter Lists**: Replace repeated parameter clumps with parameter objects or domain types; remove boolean flag arguments.
- **Shotgun Surgery & Divergent Change**: Group data and operations near the owning domain concept.
- **Primitive Obsession**: Wrap primitive numbers/strings with rich domain value objects.
- **Speculative Generality**: Delete unused abstractions and forwarding layers.

### Forbidden Refactoring Patterns
- **Big-Bang Rewrites**: Replacing working subsystems wholesale without incremental validation.
- **Mixed-Intent Patches**: Bundling structural refactors and functional changes in a single diff.

---

## 4. Software Construction Standards (Steve McConnell)

### Routine & Control-Flow Design
- **Single Purpose**: Every routine must have one unambiguous responsibility and an intention-revealing name.
- **Shallow Nesting**: Use guard clauses and early exits to keep the happy path visible and flat.
- **Defensive Programming**: Validate inputs strictly at trust boundaries; distinguish between recoverable errors and programming bugs.
- **Zero Scratchpad Comments**: Never narrate obvious code logic (`// return user`). Comments are reserved strictly for non-obvious business logic, domain invariants, or concurrency locks.

---

## 5. Context Bandwidth & Command Output Byte-Capping

Protect context aggressively. Unbounded terminal output destroys reasoning bandwidth.

### Byte-Capping Protocol
- Any command with unknown or potentially large output must be scoped and byte-capped.
- Line caps (`head -n`) are insufficient because a single minified bundle line can contain megabytes. Use byte caps:
  ```bash
  COMMAND 2>&1 | head -c 4000
  COMMAND 2>&1 | tail -c 4000
  ```
- **Scope Before Printing**: List files first, count matches (`rg -c`), search specific subtrees, and avoid dumping raw binary, minified, or huge log files into context.

---

## 6. Risk-Weighted Validation & Dependency Gate

### Match Validation to Risk
- **Low-Risk Changes** (documentation, string typo, CSS token tweak): Use scoped local checks; do not run full monolithic builds unless requested.
- **High-Risk Changes** (state machines, API payloads, auth, migrations): Run targeted unit/integration tests and verify runtime logs or rendered DOM.

### Dependency Addition Gate
- Never install new runtime or development packages (`npm install`, `bun add`) without explicit human approval. Keep dependencies minimal and lean.

---

## 7. Subagent Anti-Bias & Delegation Protocol

When delegating research, review, or exploration to subagents:
1. **Zero Confirmation Bias**: Never pass a preferred conclusion or biased prompt. Ask the subagent to investigate trade-offs, identify risks, and explore alternatives impartially.
2. **Standard Subagent Output Packet**:
   - Findings & evidence
   - Files inspected
   - Files modified (if any)
   - Validation run & outcome
   - Residual risks or uncertainties

---

## 8. English Language Standard

- **Universal English Baseline**: All communications, agent responses, commit messages, code comments, variable names, specifications, architecture decision records (ADRs), and documentation MUST strictly be in English.
- **Client Product Localization**: Client-facing websites, UI copy, and applications are English-first by default; multilingual localization is implemented ONLY when explicitly requested by the user.

---

## 9. Systematic Debugging Protocol

For reproducible issues:
1. Stop before changing code.
2. Formulate the failure mechanism in one sentence.
3. Identify the delta between working and failing execution paths.
4. Add targeted diagnostic logging to verify hypotheses.
5. Change one variable at a time.
6. Verify resolution using automated tests, runtime logs, or DOM checks before claiming completion.

---

## 10. Modern CLI Tooling Standard & Dynamic Fallback Protocol

Agents must prioritize modern, high-speed, and resource-safe CLI utilities over legacy UNIX tools to minimize token waste, avoid terminal buffer overflow, and automatically leverage `.gitignore` and binary filtering. However, agents must remain resilient in any environment and never fail due to missing tooling.

> [!IMPORTANT]
> **Subshell Alias Isolation Invariant**:
> AI agent execution harnesses (Antigravity, OpenCode, Codex, subagents) execute shell commands in **non-interactive subshells** (`bash -c "..."`). Non-interactive subshells **do NOT load `~/.bashrc`** and disable alias expansion (`expand_aliases` is off).
> 
> Therefore, aliases like `alias grep=rg` or `alias find=fd` defined in `.bashrc` **are never available to agents**. Agents MUST explicitly invoke modern binaries by name (`fd`, `rg`, `bat`, `eza`, `sd`, `choose`, etc.) or use native agent tools (`find_by_name`, `grep_search`).

### The Grand 32-Tool Modernization Taxonomy & Fallback Matrix

| Category | Legacy Tool | Modern Standard (Primary) | Secondary / Alternative | Fallback | Key Behavioral Advantage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **File Search** | `find` | `fd` (or `fdfind`) | — | `find` | Parallel directory walker, `.gitignore`-aware, clean glob/regex syntax |
| **Code / Text Search** | `grep` | `ripgrep` (`rg`) | `ugrep`, `ag`, `ack` | `grep -rnI` | SIMD regex, respects `.gitignore`, skips binary files automatically |
| **File Viewing & Paging** | `cat` | `bat` (or `batcat`) | — | `cat` | Syntax highlighting, line numbers, Git diff gutters, automatic paging |
| **File Paging & Navigation** | `more` | `less` | — | `more` | Vastly more capable interactive pager and backward navigation |
| **Directory Listing** | `ls` | `eza` | `lsd` | `ls -la` / `tree` | Git status flags, file metadata, colorized icons, integrated tree view |
| **Stream Editing** | `sed` | `sd` | — | `sed` | Clean, intuitive regex replace syntax (`sd 'find' 'replace'`) without delimiter escaping |
| **Field / Column Extract** | `cut` | `choose` | `awk` | `cut` | Clean human-readable field selection (`choose 1:3`, `choose -1`) |
| **JSON / YAML Query** | `jq` | `gojq` | — | `jq` | Pure Go jq-compatible query engine with native YAML support |
| **Git Diff Display** | `git diff` | `delta` | `difft` (difftastic) | `git diff` | Syntax highlighting, side-by-side view, language-aware AST diffs (`difft`) |
| **Process Monitoring** | `top` | `btop` | `htop` | `top` | Dynamic terminal graphs, per-core metrics, disk I/O, network telemetry |
| **Process Inspection** | `ps` | `procs` | — | `ps` | Human-readable colored trees, port bindings, container awareness |
| **Disk Usage Analysis** | `du` | `ncdu` | `dua`, `gdu` | `du -sh *` | Interactive visual disk exploration; `dua`/`gdu` provide parallel disk scanning |
| **Filesystem Overview** | `df` | `duf` | — | `df -h` | Clean graphical tables, mount categorization, usage percentages |
| **Network Sockets** | `netstat` | `ss` | — | `netstat` | Maintained kernel netlink socket interface, faster socket dump |
| **Network Interface** | `ifconfig` | `ip` (`ip a`, `ip r`) | — | `ifconfig` | Modern `iproute2` interface with full routing and link manipulation |
| **Compression** | `gzip` | `zstd` | — | `gzip` | Modern Zstandard algorithm; orders of magnitude faster compression and decompression |
| **Directory Navigation** | `cd` | `zoxide` (`z`) | `fasd` | `cd` | Frecency-based smart jumping across directory history |
| **Shell History Search** | `C-r` | `atuin` | `fzf` | built-in history | SQLite-backed, context-aware, end-to-end encrypted shell history search |
| **Terminal Multiplexing** | `screen` | `zellij` | `tmux` | `screen` | Modern terminal workspace with discoverable UI, floating panes, WASM plugins |
| **Terminal Text Editor** | `vim` / `vi` | `neovim` (`nvim`) | — | `vim` / `vi` | Async architecture, Lua configuration, Treesitter syntax, LSP client |
| **Simple CLI Editor** | `nano` | `micro` | — | `nano` | Intuitive keybindings (Ctrl+C, Ctrl+V), multi-cursor, syntax highlighting |
| **Terminal File Manager** | `mc` (Midnight) | `yazi` | `ranger` | `mc` | Asynchronous Rust terminal file manager with image previews and Vim keybindings |
| **Command Quick Reference** | `man` | `tealdeer` (`tldr`) | — | `man` | Practical community-maintained CLI examples instead of exhaustive man pages |
| **Calculator / Units** | `dc` / `bc` | `numbat` | Python | `bc` | High-precision scientific calculator with first-class physical units and currency |

### Execution & Dynamic Fallback Protocol
1. **Tool Check & Safe Invocation**: Before executing a modern utility in shell scripts or agent terminal actions, verify if the binary exists (`command -v <tool>`).
2. **Resilient Non-Blocking Fallback**: If the modern tool is missing, **never abort or error out**. Immediately execute the corresponding classic fallback command with equivalent flags (e.g. if `rg` is unavailable, use `grep -rnI --exclude-dir={node_modules,.git,dist}`).
3. **Interactive Installation Prompt Gate**:
   - When an agent discovers a modern tool is missing during an interactive session:
     - Inform the user which modern utility is missing and why it is beneficial.
     - Provide the exact platform-specific installation command:
       - **Debian / Ubuntu**: `apt update && apt install -y ripgrep fd-find bat fzf eza btop duf zstd tldr` (run with appropriate administrative privileges; note binary aliases `fdfind` -> `fd`, `batcat` -> `bat`).
       - **Arch Linux**: `pacman -S ripgrep fd bat fzf eza btop duf zstd tealdeer zoxide procs sd` (run with appropriate administrative privileges).
       - **macOS (Homebrew)**: `brew install ripgrep fd bat fzf eza btop duf zstd tealdeer zoxide procs sd choose-rust delta gojq numbat`.
       - **Rust / Cargo**: `cargo install ripgrep fd-find bat eza du-dust fzf sd choose procs zoxide git-delta difftastic yazi-fm numbat-cli`.
     - Prompt the user via interactive CLI/chat to ask if they want to install it now.
     - If the user agrees, assist with installation; if declined or skipped, proceed seamlessly with the classic fallback.
   - If running in non-interactive mode, autonomous background subagents, or CI/CD pipelines, suppress the prompt and execute the classic fallback silently.

---

## 11. Synthetic ADE/IDE Artifact Sanitization Protocol

Agents must strictly protect source code, documentation, specs, and commit history from contamination by synthetic ADE/IDE placeholders, rich markdown wrappers, or ghost text that overtake original content.

### 1. The Threat Model & Root Cause
In agentic development environments like **ORCA ADE**, unescaped angle-bracket placeholders in Markdown prose (such as `<issue-id>`, `<slug>`, `<package-name>`, or `<type>`) are mistakenly parsed by the Monaco/DOM rendering layer as unescaped inline HTML elements. To display or process them, the environment wraps or replaces them with internal synthetic placeholders:

```text
[[ORCA_RICH_MD:<hash>:<type>:<urlencoded-payload>]]
```

**Concrete Example**:
A placeholder like `<issue-id>` is mistakenly wrapped by the ADE into:
`[[ORCA_RICH_MD:<hash>:inline-html:%3Cissue-id%3E]]`

When files are saved or passed through agent context, these synthetic tokens contaminate source files, break shell scripts, and corrupt documentation.

### 2. Multi-Vendor Scope
This sanitization invariant applies to all proprietary or synthetic IDE/ADE injections:
- **ORCA ADE**: `[[ORCA_RICH_MD:<hash>:<type>:<payload>]]`
- **Cursor IDE**: `[cursor:...]`, `<|cursor_...|>`, `<!-- cursor:... -->`
- **Windsurf / Cascade**: `<<<windsurf...>>>`, `// windsurf:...`
- **Anthropic / Claude Code**: `<antArtifact identifier="..." type="...">`, `<antThinking>`
- **Jupyter / Notebooks**: `<!-- nbformat:... -->`, `[IPython:...]`
- **GitHub Copilot**: `<copilot:...>`, `<｜begin of sentence｜>`

### 3. Dual-Layer Defense

#### Layer A: Proactive Prevention (Angle-Bracket Invariant)
When authoring documentation, templates, or instructions, **NEVER** write naked template angle brackets in prose or table cells. Always enclose template variables in backticks:
- ❌ **Forbidden**: `Cut branch from dev: feat/<issue-id>-<slug>`
- ✅ **Required**: `Cut branch from dev: feat/\`<issue-id>\`-\`<slug>\`` or code-fenced:
  ```bash
  git checkout -b feat/<issue-id>-<slug> dev
  ```
Fenced code blocks and inline backticks instruct ADE markdown engines not to parse the content as HTML elements.

#### Layer B: Deterministic Unwrapping & Sanitization
Whenever reading, diffing, editing, or committing files:
1. **Detect**: Match the synthetic regex pattern:
   ```regex
   \[\[ORCA_RICH_MD:[a-f0-9]+:[a-z-]+:([^\]]+)\]\]
   ```
2. **Decode**: Extract the URL-encoded payload (e.g. `%3Cissue-id%3E`) and decode it (`<issue-id>`).
3. **Unwrap**: Replace the entire synthetic wrapper with the raw decoded string (or backtick-escaped string in markdown prose).
4. **Generalize**: Strip any remaining synthetic ADE markers (`<antArtifact...>`, `[cursor:...]`, `<<<windsurf...>>>`) to restore the original clean content.

#### Layer C: Pre-Ship / Pre-Commit Sanitization Audit
Before finalizing deliverables, opening PRs, or cutting releases, audit the workspace with `rg`:
```bash
rg "\[\[ORCA_RICH_MD|<antArtifact|\[cursor:|<<<windsurf" . --exclude-dir={.git,node_modules,dist,.worktrees}
```
If any synthetic tokens are found, unwrap and sanitize them immediately. Zero synthetic artifacts may ever be committed to git.

---

## 12. Clean Package Syntax &amp; No Published Git References

In git/skills package syntax (`<owner>/<repo>#<ref>`), anything following `#` is a git reference (branch, tag, or commit hash).

### 1. Invariant & Downstream Mechanics
- **Zero Appended Commit Hashes**: Never publish, output, or pass trailing `#<commit-sha>` or arbitrary git references in package/skill installation targets (e.g. `<owner>/<repo>#<commit-sha>`).
- **The Fatal Clone Bug**: Downstream skill managers (`skills add`, `npx skills add`) invoke `git clone --depth 1 --branch <ref>`. In Git, `--branch` strictly accepts branch or tag names; passing a raw commit SHA fatally crashes the clone (`fatal: Remote branch <commit-sha> not found in upstream origin`).
- **Clean Spec Mandate**: Always use `<owner>/<repo>` (e.g. `skills add <owner>/<repo>`). If a reference is strictly required anywhere, ensure it is a valid tag/branch and never breaks linking.
- **Package Manager Freshness**: When tools accept version parameters (`npm`, `bun`, `pnpm`), use `@latest` if latest is desired. Otherwise, keep commands clean without redundant arguments to fetch latest automatically.


