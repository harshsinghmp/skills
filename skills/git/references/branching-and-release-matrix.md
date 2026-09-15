# Branching, Commits & Release Matrix

This reference documents the branch management protocol, conventional commit syntax, and release versioning rules enforced by the `git` skill.

---

## 1. Branch Hierarchy & Invariants

```
               [ feature/* / fix/* ]
                        ▲
                        │ (Cut from dev)
                        ▼
[ master ] ◀─────── [ dev ] ───────▶ [ release/vX.Y.Z ] ───▶ [ master ]
(Production)        (Staging)        (Release Stage)          (Tag vX.Y.Z)
    │                                                              ▲
    └─────────────── [ hotfix/* ] ─────────────────────────────────┘
                     (Merged to master & back-merged to dev)
```

| Branch | Purpose | Protection Rule | Merge Policy |
| :--- | :--- | :--- | :--- |
| `master` | Production release truth. | **HARD PROTECTED**. Never commit directly. | Merges only from `release/*` or `hotfix/*` via PR/signed merge. |
| `dev` | Integration and staging branch. | Active integration target. | Merges from `feature/*`, `fix/*`, and back-merges from `master`. |
| `feature/*` / `feat/*` | Feature development lanes. | Created strictly from `dev`. | Merges back into `dev` via PR once verified. |
| `fix/*` | Non-urgent bugfix lanes. | Created strictly from `dev`. | Merges back into `dev` via PR once verified. |
| `release/vX.Y.Z` | Staged release stabilization. | Cut from `dev` when ready. | Merges into `master` (no-ff), then back-merges into `dev`. |
| `hotfix/*` | Urgent production fixes. | Created strictly from `master`. | Merges into `master` AND back-merged into `dev`. |

---

## 2. Conventional Commit Message Protocol

Every commit must follow this deterministic format:

```text
<type>(<scope>): <summary>

[optional body: Why / Non-obvious rationale / Verification]

[optional footer: Closes #123 / Refs #456]
```

### Commit Types
- `feat`: A new user-facing capability or skill.
- `fix`: A bug fix or defect remediation.
- `docs`: Documentation updates, README changes, context files.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding or correcting tests.
- `chore`: Tooling, dependency, or configuration updates.

### Rules
1. **Subject Line**: Imperative, capitalized, ≤50 characters (e.g. `Feat(git): Add universal release lifecycle`).
2. **Body**: Wrapped at ≤72 characters. State *why* the change exists and what was verified; never restate the obvious git diff.
3. **No Pronouns or Meta-Phrasing**: Avoid "I fixed this" or "This commit updates".
4. **Issue Linkage**: Link the GitHub issue at the bottom (e.g. `Closes #5`).

---

## 3. Semantic Versioning (`vX.Y.Z`) Rules

- **Major (`vX.0.0`)**: Breaking architectural changes, core schema overhauls, or removed interfaces.
- **Minor (`vX.Y.0`)**: Substantive new agent skills, new CLI commands, or backwards-compatible capabilities.
- **Patch (`vX.Y.Z`)**: Bug fixes, security patches, performance tuning, and documentation corrections.

### Invariants:
- Sync `package.json` `"version"` with the git tag in the release commit.
- Tag releases with annotated git tags: `git tag -a vX.Y.Z -m "release: vX.Y.Z"`.
- Never push untracked artifacts or unredacted secrets into a release.

---

## 4. Worktree Parallel Lanes (Multi-Agent & Dev-Server Protection)

When multiple agents or tasks operate concurrently, or when running persistent development servers (`bun dev`, Vite, test watchers), use Git worktrees instead of in-place `git checkout -b`:

```text
/repo-root/               (Main Working Tree on 'dev' or active branch)
├── .git/                 (Shared repository database)
└── .worktrees/           (Explicitly gitignored)
    ├── feat-login/       (Isolated checkout on 'feat/login')
    └── feat-billing/     (Isolated checkout on 'feat/billing')
```

### Protocol:
1. **Directory**: Always isolate worktrees in `.worktrees/` at repo root (guaranteed `.gitignore` entry).
2. **Creation**: `git worktree add .worktrees/feat-<slug> -b feat/<slug> dev`
3. **Bootstrap**: Install dependencies inside `.worktrees/feat-<slug>` prior to test runs.
4. **Teardown**: Once PR is merged to `dev`, remove worktree and prune:
   ```bash
   git worktree remove .worktrees/feat-<slug>
   git worktree prune
   ```

*(See [Worktree Parallel Lanes Protocol](worktree-parallel-lanes.md) for sandbox fallback and submodule guards).*

---

## 5. Monorepo Tag Scoping (`{package}-vX.Y.Z` vs `vX.Y.Z`)

In multi-package repositories, global tags collide and obscure package-level version progression.

### Heuristics for Monorepos:
Detected if any of the following exist:
- `pnpm-workspace.yaml`
- `lerna.json`
- `turbo.json`
- `packages/` directory containing package manifests

### Tagging Rules:
- **Single-Package Repo**: Use standalone SemVer: `vX.Y.Z` (e.g. `v2.1.0`).
- **Monorepo / Multi-Package**: Scope tags to the package name: `{package}-vX.Y.Z` (e.g. `web-v1.4.0`, `@muse/core-v2.0.1`).
- **Release Target**: Direct release notes and GitHub release titles to the specific scoped package tag.

*(See [Monorepo Tagging & Pre-Release Sanitization Protocol](monorepo-and-sanitization.md) for visibility checks and artifact purging).*

---

## 6. Related References

- 🌲 [Worktree Parallel Lanes Protocol](worktree-parallel-lanes.md)
- ⚔️ [Merge Conflict Resolution & Git Recovery Playbook](conflict-resolution-and-recovery.md)
- 📦 [Monorepo Tagging & Pre-Release Sanitization Protocol](monorepo-and-sanitization.md)
- 🛡️ [Anti-Slop Issue Intake Matrix](anti-slop-triage.md)
- 🎨 [GitHub SEO & Open Graph Presentation Guide](github-seo-and-presentation.md)

