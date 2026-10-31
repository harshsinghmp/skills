# 📜 Git Workflow, Commits & Release Standards

## 1. Branch Architecture & Rules

### Branch Hierarchy
- `{{production_branch}}`: Production branch. **Never commit directly to {{production_branch}}.**
- `{{integration_branch}}`: Staging/integration branch.
- `feature/*`: Created from `{{integration_branch}}` for individual features or tasks.
- `release/*`: Created from `{{integration_branch}}` when changes are ready for production; merged into `{{production_branch}}`, then back into `{{integration_branch}}`.
- `hotfix/*`: Created from `{{production_branch}}` for urgent production fixes; merged into both `{{production_branch}}` and `{{integration_branch}}`.

### Branching Rules
1. Feature branches must always be created from `{{integration_branch}}`.
2. Use descriptive branch names (`feat/auth-session`, `fix/db-pool-leak`).
3. Every merge into `{{integration_branch}}` or `{{production_branch}}` requires a Pull Request and code review.
4. Do not rewrite or force-push `{{production_branch}}` or `{{integration_branch}}` history.
5. Prefer `git rebase` within feature branches to keep history clean and linear.
6. For production bugs, use `hotfix/*` rather than merging unfinished work from `{{integration_branch}}`.
7. Prefer a new revert commit over rewriting shared history.
8. **Atomic PR per Feature Protocol**: Give each independently deliverable feature its own dedicated feature branch and PR. Keep coordinated changes needed for that feature together; never batch unrelated features or workstreams into one PR. This rule is per feature, not per skill.

---

## 2. Meaningful Git Commit Standard

Every commit must follow this structured format:

```
<type>(<scope>): <imperative summary>

- Why: [Brief explanation of the motivation/problem solved]
- What: [Bullet list of specific files, components, or mechanisms changed]
- Verification: [Evidence that tests, builds, and verification probes passed]
```

### Commit Formatting Rules
- **Subject (≤50 chars)**: Capitalized imperative Conventional Commit (e.g., `feat(drift): Add AST symbol drift scanner`).
- **Body (≤72 chars/line)**: Focus on why and non-obvious rationale instead of restating the diff; avoid pronouns (`I`, `we`) and meta-phrasing (`This commit...`).
- **Issue References**: Link issues at the bottom (e.g., `Closes #123`, `Resolves #456`).

### Allowed Commit Types
- `feat`: A new feature or capability.
- `fix`: A bug fix or defect resolution.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `docs`: Documentation-only changes.
- `style`: Changes that do not affect code logic (formatting, whitespace).
- `test`: Adding or refactoring tests and verification probes.
- `chore`: Maintenance tasks, dependency updates, build tooling.
- `ci`: CI/CD pipeline and automation configuration.

### Rejection Gate
Vague commit messages like `update`, `fix`, `minor changes`, or `wip` are rejected by the Quality Assurance Gate.

---

## 3. Scope of Work & Sprint Lifecycle

All development moves across 4 deterministic lifecycle phases:

```
[ 📋 Requested ] ──► [ 📅 Planned ] ──► [ ⚡ In Progress ] ──► [ ✅ Done ]
 (Issues / PRs)     (Sprint Backlog)    (Active PR / Milestone)  (Shipped)
```

1. **📋 Requested**: Community proposals, PR suggestions, and ecosystem requests pending sprint triage.
2. **📅 Planned**: Scoped SOW items selected for the upcoming sprint.
3. **⚡ In Progress**:
   - Feature branch created from `{{integration_branch}}` (`feat/*`).
   - Dedicated GitHub milestone created and draft PR opened against `{{integration_branch}}`.
   - Item moved to *In Progress* on the roadmap board.
4. **✅ Done**:
   - Tests and static typing pass cleanly (`bun test`, `tsc --noEmit`).
   - PR merged into `{{integration_branch}}`, fast-forwarded to `{{production_branch}}`, and milestone closed.
   - Item moved to *Done* on the roadmap board.

---

## 4. Releases & Semantic Versioning (vX.Y.Z)

All releases and git tags follow strict `vX.Y.Z` semantic versioning:

- **X (Major)**: Breaking architectural changes, core schema shifts, or protocol overhauls (`vX.0.0`).
- **Y (Feature)**: Substantive new agent capabilities, MCP tools, or CLI subcommands (`vX.Y.0`).
- **Z (Minor / Hotfix)**: Bug fixes, security patches, performance, and urgent hotfixes (`vX.Y.Z`).

### Release Invariants
- Sync `package.json` `version` with the `vX.Y.Z` tag in the release commit.
- **Derived-artifact sync**: any version bump regenerates the repo's declared derived artifacts **in the same commit**. Every derived artifact is declared together with (a) the command that regenerates it and (b) the equivalent `--check` gate that fails CI on drift; declare each bundle as `{{artifact_name}}` ↔ regenerate: `{{regen_command}}` ↔ check: `{{check_command}}` (placeholders, filled by the project. One repo's instance — not law: `claims.json` ↔ regenerate `bun run claims:generate` ↔ check `bun run claims:check`).
- Stage on `release/v{{SEMVER}}` from `{{integration_branch}}` → merge to `{{production_branch}}` → back-merge to `{{integration_branch}}`.
- CI publishes on `v*` tag push (`git tag -a vX.Y.Z -m "release: vX.Y.Z"`). Never publish manually.
- **README "What's New" Rule**:
  - Keep only current release/feature highlights in `README.md` under `## 🚀 What's New` under 5 line.
  - Do not accumulate historical version blocks (`### vX.Y.Z`) or put version headers inside `What's New`.
  - Use a clean, plain-English bullet list; keep detailed versioned history in `CHANGELOG.md`.

---

## 5. Clean Package Syntax & Versioning

- In `<owner>/<repo>#<ref>` package syntax, `#<ref>` is a Git reference. Keep repository/install targets clean (for example, `npx skills add <owner>/<repo>`); never append or publish raw commit SHAs or arbitrary branch refs.
- Installers may run `git clone --depth 1 --branch <ref>`; a commit SHA is not a remote branch and fails with `fatal: Remote branch <sha> not found`. Add a ref only when required, and use a valid branch or tag.
- For package tools that accept an explicit version/tag, use `@latest` only when latest is explicitly requested. Otherwise omit redundant version arguments.
