---
name: clean-system-cache
aliases: ["clean-cache","purge-cache","cache-cleaner","disk-cleanup"]
description: "Self-learning cross-platform cache cleaner for Windows, Linux, and macOS. On every run it scans for and removes safe-to-delete caches: XDG cache dirs, exact editor/app cache dirs (Cache, GPUCache, CachedData, Code Cache), AUR helper and desktop index caches, package-manager and browser-automation caches, and dormant project artifacts (node_modules, Cargo target, Python venvs, Go vendor, .NET obj/bin, .next, .turbo, .parcel-cache, __pycache__, pytest/mypy/ruff caches). Detection pairs names with manifests (target needs Cargo.toml, venvs pyvenv.cfg), staleness uses the newest file, risky locations are report-only, and discoveries are re-validated before deletion. Session-, config-, and data-affecting paths are skipped and offered as numbered per-app/per-project options. Decisions are remembered per app and project. Trash, Downloads, /tmp strays, and data folders ALWAYS require explicit confirmation. Protects active sessions. Use when asked to clean caches, free disk space, or purge build layers."
argument-hint: "clean cache, free disk space, purge build layers"
user-invocable: true
version: 1.1.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: reflection-maintenance
metadata:
  category: reflection-maintenance
  priority: 20
  aliases: ["clean-cache","purge-cache","cache-cleaner","disk-cleanup"]
  suggested_skills: ["audit","periodic-retreat","code-review","gauntlet-loop"]
  hermes:
    tags: [cache, cleanup, disk-space, maintenance, devtools, designer-tools, browser, chrome, firefox, zen, brave, edge, safari, xcode, docker, adobe, figma, blender, windows, linux, macos, bash, cmd]
    related_skills: [audit, periodic-retreat, code-review, gauntlet-loop]
    suggested_skills: [audit, periodic-retreat, code-review, gauntlet-loop]
    requires_tools: [bash, run_command, view_file, write_to_file]
  openclaw:
    category: reflection-maintenance
    suggested_skills: [audit, periodic-retreat, code-review, gauntlet-loop]
    primary_triggers: ["clean system cache","purge developer caches","free up disk space","clean browser cache","purge build cache"]
    requires_tools: [bash, run_command, view_file, write_to_file]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 🧹 Clean System Cache — Cross-Platform Developer, Designer & Browser Cache Cleaner

> **Aliases**: `clean-cache` | `purge-cache` | `cache-cleaner` | `disk-cleanup`

Safely reclaim tens of gigabytes of disk space by purging **only unreferenced, dangling, and disposable caches** produced by installed developer, designer, and web browser toolchains across **Windows, Linux, and macOS**.

Requires **zero external runtimes** (no Python, no Node, no dependencies):
- **Linux & macOS**: Pure Bash / POSIX (`scripts/clean-cache.sh`)
- **Windows**: Native Command Prompt batch script (`scripts/clean-cache.cmd`)

---

## Modes

Every invocation resolves to exactly one mode. Load **only** the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
| :--- | :--- | :--- | :--- |
| **`clean`** *(default)* | "clean cache", "free disk space" | Scans the system, purges every SAFE discovery plus T1 catalog caches, then reports what needs a decision grouped by app/project. | this file |
| **`audit`** | "cache audit", "inventory caches", "pre-purge audit" | Classify purge candidates safe/protected/ask-first with du-verified reclaim estimates; dry-run only. | [references/audit.md](references/audit.md) |
| **`select`** | "what would you delete", "let me choose", "browse candidates" | Catalog → browse → numbered multi-select → confirmed delete; decisions are learned. | [references/candidate-catalog.md](references/candidate-catalog.md) |
| **`learn`** | "remember this", "stop asking", "forget that" | Inspect and edit the persisted per-app/per-project decisions. | this file |

`references/candidate-catalog.md` is the `select` mode's support reference, not a separate routed mode.

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Low Disk Space Warnings**: Disk capacity drops below comfortable working thresholds due to accumulated build layers, package archives, or scratch media files.
2. **Dangling Build Layers**: Docker BuildKit layers, Xcode DerivedData, Android build-cache, or Rust `target/`, `node_modules`, and Python venv artifacts consume tens of gigabytes without active references.
3. **Bloated Web Browser Caches**: Google Chrome, Mozilla Firefox, Zen, Brave, or Microsoft Edge disk caches grow to multiple gigabytes of stale HTTP responses.
4. **Stale Designer Scratch Files**: Adobe Premiere, After Effects, Audition (`.cfa` / `.pek` audio peak caches), or Figma desktop app caches lock up storage.
5. **Dormant `node_modules` Directories**: Old, abandoned repository folders hog dozens of gigabytes across user project directories.
6. **Stale Local Package & Desktop Caches**: AUR helper build caches (`~/.cache/yay`, `~/.cache/Shelly`), the `tracker3` file index, thumbnail/fontconfig/AppStream/KDE caches, Flatpak HTTP caches, or GPU shader caches quietly grow to gigabytes.
7. **Dormant Project Artifacts**: `.next`, `.turbo`, `.parcel-cache`, `__pycache__`, `.pytest_cache`, `.mypy_cache`, `node_modules`, Rust `target/`, abandoned virtualenvs, Go `vendor/`, and .NET `obj/bin` sit untouched in project folders for weeks. Detection requires the artifact's manifest, and staleness is measured by the newest file inside.
8. **Package Archives & Trash**: `/var/cache/pacman/pkg`, `/var/cache/apt/archives`, `/var/cache/dnf`, or `~/.local/share/Trash` dominate the disk — these are confirmation-gated, never automatic.
9. **Host Vitals & Machine Inventory (`host-vitals`)**: Deterministically inspecting hardware vitals (CPU cores, GPU PCIe bus, kernel version, display resolution, RAM) via `bun skills/reflection-maintenance/clean-system-cache/scripts/host-vitals.ts`.

### Anti-Triggers
Do **NOT** use this skill for:
- Wiping active project code, git histories, or working repository files.
- Cleaning browser cookies, logins, saved passwords, bookmarks, or user profiles (the skill strictly protects them).
- Purging an **active** project environment (`.venv`) or active Docker containers and volumes. Only dormant venvs are offered, with an export-dependencies caution.
- Deleting global binary installations (`~/.cargo/bin`, `~/.nvm`, etc.).
- Purging capability-coupled agent caches while sessions are active or offline without rehydration access.

---

## Quick Reference

### 16-Point Cache Architecture Matrix

```
┌─────────────────────────┬────────────────────────────────────────────────────────┐
│ Suite / Category        │ Targeted Cache Layers (Disposable Only)                │
├─────────────────────────┼────────────────────────────────────────────────────────┤
│ 1. Package Managers     │ uv, npm (_npx, _logs), bun, pip, pnpm store, cargo, go │
│ 2. Language Ecosystems  │ dotnet (NuGet locals), composer, gradle, brew cleanup  │
│ 3. Mobile & Apple       │ Xcode DerivedData (macOS), Android build-cache         │
│ 4. IDE Workspace Caches │ VS Code & Cursor stale workspaceStorage audits         │
│ 5. Testing Frameworks   │ Cypress browser binary download cache                  │
│ 6. Containers           │ Docker BuildKit layers (prune -f), Podman build-cache  │
│ 7. Creative Media       │ Adobe Media Cache (.cfa, .pek), Photoshop temp files   │
│ 8. Design Applications  │ Figma desktop asset cache, Blender shader/preview cache│
│ 9. App Frameworks       │ Electron prebuilt binary download caches               │
│ 10. Web Browsers        │ Chrome, Firefox, Zen, Brave, Edge, Vivaldi, Safari     │
│ 11. Agent Toolchains    │ OpenCode, Claude Code, Cursor, Codex, Gemini, Continue │
│ 12. Project Artifacts   │ Dormant artifact scanner: node_modules, Cargo target,    │
│                         │ Python venvs, Go vendor, .NET obj/bin, build output,    │
│                         │ .next/.nuxt/.turbo/pytest/mypy/ruff caches             │
│ 13. Local Package helpers│ yay, shelly, paru build/clone caches (AUR)             │
│ 14. Desktop & Runtimes  │ tracker3 index, thumbnails, fontconfig, appstream,     │
│                         │ GStreamer, KDE .kcache, Flatpak app caches, GPU shaders,│
│                         │ quickshell, orca appimage, ryoku install, hyperframes, │
│                         │ headless Chrome, playwright, puppeteer, aria-template, │
│                         │ pnpm metadata, typescript, mise, nvm tarballs, logs    │
│ 15. Confirmation-gated  │ Trash, pacman/apt/dnf archives, journal, /tmp strays,  │
│                         │ rustup/nvm old editions, Go modcache, Docker, Flatpak  │
│ 16. Discovery & Learning│ XDG cache dirs, app Cache dirs, matcher-verified dormant │
│                         │ project artifacts, risky-path tagging, parallel sizing, │
│                         │ persisted allow/deny decisions per app/project         │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

### Three-Tier Cache Classification

| Tier | Classification | Policy & Invariants |
| :--- | :--- | :--- |
| **T1** | **Regenerable Build Artifacts** | Pure download archives, build layers, compiler caches, and HTTP caches (uv wheels, npm download tarballs, cargo crates, browser cache2). **Safe to purge silently.** |
| **T2** | **Capability-Coupled Caches** | Caches that back live agent capabilities, installed plugin packages, language server binaries, and remote skill payloads (e.g. `~/.cache/opencode/packages`, `~/.cache/opencode/npm`, `~/.cache/claude`, `~/.continue/cache`). **PRESERVED BY DEFAULT.** Purging removes working functionality until network rehydration. Purged ONLY with explicit `--include-coupled` / `--all-caches` / `/include-coupled` / `/all-caches` opt-in, and never without emitting a deterministic Rehydration Manifest. |
| **T3** | **Irreplaceable State & Auth** | Session databases, auth/credential stores, configurations, agent cognitive memory (`.memory/**`), sovereign configs (`~/.memory/` and `~/.config/muse/`), and git repositories. **NEVER TOUCHED UNDER ANY CIRCUMSTANCES.** |

Confirmation is a separate axis from the tier: a cache can be regenerable and still
deserve a question because it is expensive, needs `sudo`, or is irreversible.

| Class | Meaning | Deletion rule |
| :--- | :--- | :--- |
| `T1` | Known, regenerable on next tool use | Auto-purged by a normal run |
| `SAFE` | Discovered XDG cache / exact app cache dir | Auto-purged by a normal run (unless learned `deny`) |
| `ASK` | Regenerable but expensive, app-owned, or `sudo`-backed | Deleted on selection, then remembered as `allow` so later runs clean it when its conditions still hold |
| `ASK!` | Irreversible or personal (Trash, Downloads, `/tmp` strays, Flatpak app caches) | Always requires selection + confirmation; **never** learned, never automatic |

### Selection UX (browse before you delete)

| Flag | POSIX | Windows | Effect |
| :--- | :--- | :--- | :--- |
| Catalog | `--list` | `/list` | Known candidates: number, tier, measured size, exact paths |
| JSON | `--list --json` / `--discover --json` | — | Agent-parseable catalog (`{id,tier,size_kb,paths,age_days,risk,note}`) or discoveries (`{key,label,scope,tier,path,size_kb,age_days,risk,note}`) |
| Discover | `--discover` | `/discover` | Full scan of caches, app config caches, matcher-verified dormant project artifacts |
| Clean safe | `--clean-safe` | — | With `--discover`, also purge the SAFE discoveries |
| Browse | `--browse <key\|id\|num>` | `/browse <key>` | The files/folders that would be deleted, largest first |
| Depth | `--depth <n>` | — | Deeper tree for `--browse` |
| Select | `--interactive` | `/interactive` | Grouped menu: `1,3`, `1-3`, `all`, `none`, `b <n>`, `k <n>`, `q` |
| Apply | `--only <key,..> [--yes] [--confirm-irreversible]` | `/only <key,..> [/yes]` | Delete exactly the chosen items |
| Preview | `--dry-run` | `/dry-run` | Prints the plan without deleting |
| Projects | `--projects <dirs>` | — | Colon-separated roots to scan (persisted) |
| Dormant | `--dormant <days>` | — | Staleness threshold by newest file inside (default 14, persisted) |
| Min size | `--min-size <mb>` | — | Hide discoveries smaller than this (default 1 MB) |
| Learn | `--learn allow\|deny\|forget <keys>` | — | Record/undo a decision for future runs |
| Learned | `--learned` | — | Show every remembered decision |

Keys are stable (`ask-trash`, `app:mpv`, `flatpak:org.mozilla.thunderbird`,
`proj:/abs/path/.next`); the numbers are positional snapshots of the current scan.
Prefer keys in scripts and confirmations, and re-run `--list`/`--discover` before
quoting a number.

Non-negotiables when acting on someone's behalf:

1. **Show the paths.** Every `ASK`/`ASK!` row must be presented with the real paths from
   `--discover`, and `--browse <key>` output quoted when the user asks "what exactly?".
2. **Never broaden a selection.** `--only` takes explicit keys; do not translate "clean
   what's safe" into a selection containing `ASK!` items.
3. **`--yes` is consent for `ASK`, not for `ASK!`.** Only pass it after the user approved a plan
   that listed the same keys. Non-interactive shells refuse `ASK` without it; an `ASK!`
   selection additionally needs `--confirm-irreversible`, and an interactive terminal always
   asks for a typed `yes` for `ASK!`.
4. **Report what stayed.** Finish by naming the confirmation-gated items left alone,
   grouped by app/project, with their sizes.

### Discovery scope — what counts as safe

Auto-cleaned with no question:

| Scope | Rule |
| :--- | :--- |
| `~/.cache/*` | Whole directory. The XDG cache contract makes it disposable. Catalog entries and protected apps are skipped. |
| `~/.config/<app>/{Cache, GPUCache, CachedData, Code Cache, ShaderCache, DawnCache, GrShaderCache, Crashpad}` | Exact cache directory names only — never `User`, `workspaceStorage`, `settings.json`, or other config. |

Reported for a decision (never automatic the first time):

| Scope | Rule |
| :--- | :--- |
| `~/.var/app/<id>/cache` | Per-app Flatpak HTTP cache. Skipped while that app is running. |
| `<project>/<artifact>` | Only when the matcher confirms the artifact's shape **and** the newest file inside is older than `--dormant` days (default 14). |

### Artifact matchers — a directory name alone is not evidence

Distinctive names stand alone. Generic names require the owning project's
manifest, so a Maven `target/`, a source `vendor/`, or a `~/bin` folder is never
mistaken for a build cache. Symlinked artifacts are ignored.

| Artifact | Matcher | Caution |
| :--- | :--- | :--- |
| `node_modules` | Name only | Reinstall from the lockfile; needs registry access |
| `target` | Sibling `Cargo.toml` **or** `target/CACHEDIR.TAG` | Rebuilt by cargo; keep if offline artifacts are needed |
| `.venv`, `venv`, `.virtualenv` | Inside `pyvenv.cfg` | Export dependencies to `requirements.txt` first |
| `vendor` | Sibling `go.mod` | Recreated by `go mod vendor` |
| `obj`, `bin` | Sibling `*.csproj` (or `*.sln` for `obj`) | Rebuilt by `dotnet build` |
| `build` | Inside `CMakeCache.txt` **or** sibling `pubspec.yaml` | Rebuilt by the next configure/build |
| `.next`, `.nuxt`, `.svelte-kit`, `.turbo`, `.parcel-cache`, `.pytest_cache`, `__pycache__`, `.mypy_cache`, `.ruff_cache`, `.nyc_output`, `coverage`, `.angular` | Name only | Rebuilt on the next build/run |

Dormancy is the **newest file** inside the artifact, never the directory's own
mtime: editing an existing file does not change the directory mtime, which is
how an actively used cache would otherwise be misread as abandoned. Discovery
prunes at the match, so it never descends into `node_modules` or `target`, and
sizes are measured in parallel. Deletions remove the artifact directory itself,
not just its contents.

Never discovered, never auto-cleaned:

- browser profiles and agent runtimes (`~/.cache/mozilla`, `zen`, `chromium`,
  `google-chrome`, `BraveSoftware`, `opencode`, `claude`, `gemini`, `codex`, `mcp`, `lsp`)
- `~/.cache/orca` and `~/.cache/ryoku` (they hold leases/state next to their caches)
- `*-backup*` and `*-ovfs*` directories (profile-sync-daemon lowerdirs)
- Trash, `Downloads`, `/tmp`, `~/Documents`, and any data folder
- anything not matched by the tables above

### Learning — and its hard limits

Decisions persist in `$XDG_STATE_HOME/clean-system-cache/learned.conf`
(`<key>` TAB `allow|deny` TAB epoch), config in `~/.config/clean-system-cache/config.conf`,
the last scan in `~/.local/state/clean-system-cache/last-scan.tsv`.

- **`ASK` + allow** → the item is cleaned automatically on later runs, provided its
  conditions still hold (project cache still dormant, Flatpak app still closed).
  This is how "next time you already know" works.
- **`deny`** → the item is hidden from reports and menus. Undo with
  `--learn forget <key>` (or `--learned` to list keys).
- **Risky locations are never learned into automatic cleanup.** A learned `allow`
  on a project artifact is ignored while the path is tagged risky; the item stays
  report-only and requires an explicit `--only` selection.
- **`ASK!` is never learned.** Trash/Recycle Bin, `Downloads`, stale `/tmp`, and Flatpak
  app caches always require an explicit selection plus confirmation, on every run,
  forever. A learned `allow` on an `ASK!` key is ignored by design.
- **`ASK!` selections get a loud banner.** Before the confirmation prompt, the CLI prints a
  boxed `WARNING: IRREVERSIBLE DATA LOSS` that names each selected irreversible target and
  states there is no undo. The Windows CLI prints the same box, listing every `ASK!`
  candidate in the catalog. Never strip it, and never print it for a `T1`/`T2`-only selection —
  a warning that fires on safe work stops being read.

Learning is per key, so per app (`app:mpv`), per Flatpak app
(`flatpak:org.mozilla.thunderbird`), and per project cache
(`proj:/home/me/app/.next`) all work independently.

### Safety & Running Session Protection Contracts

| Protected Area | Skill Invariant |
| :--- | :--- |
| **Active Browser Sessions & Live Tabs** | **PROTECTED.** Process detection checks if any browser is running (`pgrep` / `tasklist`). Active sessions are skipped in execution mode so running tabs and websockets are never disrupted. |
| **Active Agent Runtime Sessions** | **PROTECTED.** Process detection checks running agents (`opencode`, `claude`, `cursor`, `code`, `gemini`, `codex`, `continue`, `aider`). Running agent sessions are skipped in execution mode to prevent dropping live tools or skills mid-task. |
| **T2 Capability-Coupled Caches** | **PRESERVED BY DEFAULT.** Plugin packages, language servers, MCP schemas, and downloaded skill trees are preserved. Only purged with explicit `--include-coupled` / `--all-caches` / `/include-coupled` / `/all-caches` opt-in and an accompanying Rehydration Manifest. |
| **T3 Agent Memory, Auth & State** | **NEVER TOUCHED.** Credentials (`~/.claude/settings.json`, `~/.gemini/settings.json`), session databases, agent memory (`.memory/**`), sovereign configs (`~/.memory/USER.md`, `~/.config/muse/`), and conversation histories are strictly forbidden. |
| **Browser Cookies, Passwords & History** | **NEVER TOUCHED.** Purges purely disposable HTTP cache (`Cache_Data`, `cache2/entries`). User profiles, cookies, logins, and bookmarks remain 100% intact. |
| **Project Repositories & Source Code** | **NEVER TOUCHED.** Does not alter active git working directories or files. |
| **Discovery Staleness** | **RE-VALIDATED AT DELETE.** Immediately before removing a discovered artifact, the matcher, dormancy, and (for Flatpak) running-state are re-checked. A path that was renamed, replaced, or became active is skipped with `path changed since discovery`. |
| **Risky Locations** | **REPORT-ONLY.** A project artifact inside `~/.config`, `~/.local/share`, `~/.cache`, a hidden top-level folder, a `.app` bundle, `Program Files`, or `AppData` is tagged `⚠` and never auto-cleaned, even after a learned `allow`. |
| **Symlinked Artifacts** | **IGNORED.** A `target`/`node_modules`/`.venv` that is a symlink is not an artifact; discovery and deletion both skip it. |
| **Virtual Environments (`.venv`)** | **PRESERVED BY DEFAULT.** Never auto-cleaned. An abandoned venv (dormant, containing `pyvenv.cfg`) is reported as `ASK` and deleted only on explicit selection, after dependencies are exported. |
| **Active Containers & Volumes** | **PRESERVED.** Prunes dangling build layers only; active containers, images, and volumes are untouched. |
| **Installed Global Binaries** | **PRESERVED.** Binaries in `~/.cargo/bin`, `~/.nvm`, `%APPDATA%`, etc. are never touched. |
| **Confirmation-Gated Candidates** | **NEVER AUTO-DELETED.** Trash, package archives, `/tmp` strays, session snapshots, and other `ASK`/`ASK!` entries require explicit selection. `ASK!` requires a typed `yes` in a terminal or the separate `--confirm-irreversible` flag; `--yes` alone is **not** sufficient for irreversible data. |
| **profile-sync-daemon Lowerdirs** | **EXPLAINED, NOT DELETED.** `~/.config/*-backup*` are live lowerdirs while `psd` runs. The skill reports the candidate and the stop-`psd` requirement instead of touching it. |
| **Sudo-Backed Cleanups** | **NEVER HANG ON A PASSWORD.** System candidates run only when `sudo -n true` succeeds; otherwise the exact command is printed for the user to run. |

---

## Procedure

### Phase 0: Discover → Browse → Select (never delete blind)
A normal run already cleans SAFE + T1. Phase 0 exists so anything expensive, personal,
or irreversible is a decision the user made with the paths in front of them.

- **Linux & macOS**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --discover           # full scan, nothing deleted
  clean-system-cache/scripts/clean-cache.sh --browse app:mpv     # exact files, largest first
  clean-system-cache/scripts/clean-cache.sh --interactive        # grouped menu, then confirm
  clean-system-cache/scripts/clean-cache.sh --only ask-pacman,ask-tmp --dry-run
  clean-system-cache/scripts/clean-cache.sh --only ask-pacman,ask-tmp --yes --confirm-irreversible
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /discover
  clean-system-cache\scripts\clean-cache.cmd /browse win-temp
  clean-system-cache\scripts\clean-cache.cmd /interactive
  clean-system-cache\scripts\clean-cache.cmd /only win-temp,win-recyclebin /yes /confirm-irreversible
  ```

When the user cannot type into a terminal, run `--discover`, present the `ASK`/`ASK!`
items as numbered options grouped per app and per project with real paths and sizes, and
apply only the chosen keys with `--only ... --yes`, adding `--confirm-irreversible`
when the selection includes any `ASK!` item. This is the agent-facing equivalent
of the interactive menu.

### Phase 1: Pre-Flight Inspection & Capability Inventory (Dry Run)
Before modifying disk contents, run an inspection to calculate reclaimable space and verify live capability counts:

- **Linux & macOS**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --dry-run
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /dry-run
  ```

The dry run already performs the full discovery pass, so it is also the report you
show the user: SAFE items (would be cleaned) plus ASK/ASK! items grouped by scope.

### Phase 2: Safe Default Cache Execution
A normal run purges T1 catalog caches **and** every discovered SAFE cache, guards
running sessions, and reports the rest:

- **Linux & macOS**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd
  ```

Discovery runs here on every invocation — there is no separate "learn the system" step
the user has to remember.

### Phase 3: Present the findings per app / per project
After the safe sweep, take the `item(s) need your decision` block and present it as
options. Group by scope and quote real paths and sizes:

- **App caches** — e.g. `app:mpv`, `flatpak:org.mozilla.thunderbird`, `cfg:obsidian:Cache`
- **Project caches** — e.g. `proj:/home/me/shop/.next`, only when dormant
- **System** — Trash, package archives, journal, `/tmp` strays

Offer the choice per item ("clean, keep, or show me"), never as a single
"delete everything" toggle. `--browse <key>` answers "what exactly is in it?".

### Phase 4: Record the decision so the next run knows
Selections made through `--interactive` or `--only` are learned automatically. To set a
decision without deleting anything:

```bash
clean-cache.sh --learn allow app:mpv                    # clean this app cache next run
clean-cache.sh --learn deny  proj:/home/me/shop/.next   # never suggest this again
clean-cache.sh --learned                                # review
clean-cache.sh --learn forget proj:/home/me/shop/.next  # undo
```

Learned `allow` only ever applies to regenerable `ASK` items whose conditions still
hold. `ASK!` items stay manual forever.

### Phase 5: Opt-in Capability Purge (`--include-coupled`)
When disk capacity requires purging capability-coupled caches, use the explicit opt-in flag. Running sessions remain guarded, and a deterministic Rehydration Manifest is printed:

- **Linux & macOS**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --include-coupled
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /include-coupled
  ```

### Phase 6: Targeted Subsystem Purging
Target specific subsystems (e.g. only browsers, agent runtimes, or package managers):

- **Web Browsers Only**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --tool browser
  ```
- **Agent Runtimes Only**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --tool agents
  ```
- **Specific Tools**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --tool uv,npm,firefox,zen,docker,adobe
  ```

### Phase 7: Dormant `node_modules` Audit
Scan project directories for abandoned node_modules folders consuming massive disk space:

- **Linux & macOS**:
  ```bash
  skills/reflection-maintenance/clean-system-cache/scripts/clean-cache.sh --scan-node-modules ~/Projects
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /scan-node-modules C:\Projects
  ```

---

## Pitfalls

- **Capability-Cache Purge Loses Installed Payloads**: purging agent-runtime package caches (`~/.cache/opencode/packages/*`, `~/.cache/opencode/npm/*`) can reclaim gigabytes but deletes installed plugin payloads and language servers, stripping skills mid-session until an unannounced re-download. Reinstallable is not disposable: preserve T2 capability caches by default, guard active runtimes, and provide rehydration manifests.
- **Never Clean Caches of Actively Running Browsers or Agents**: Attempting to purge active browser or agent files can crash open tabs, invalidate websockets, or kill language servers mid-session. The script automatically guards against this by checking running processes.
- **Never Touch Profile or State Directories**: Cookies, sessions, bookmarks, passwords, and agent cognitive memories live in `~/.mozilla`, `~/.config`, `~/.claude`, `.memory/**`, `%APPDATA%`, and `~/Library/Application Support/`. Never delete these directories.
- **Never Assume Python or External Interpreters**: Developer machines may have corrupted Python or node runtimes; cache cleaners must run on native shell (`bash` on POSIX, `cmd` on Windows).
- **Never Prune Active Docker Images or Named Volumes**: Only prune dangling build layers (`docker builder prune -f`), never containers or database volumes.
- **Never Delete profile-sync-daemon Backups While psd Runs**: `~/.config/*-backup*` (Chrome/Chromium profiles) are mounted as live lowerdirs. Stop `psd`, then delete — otherwise the browser profile is torn out from under an open session.
- **Never Bundle `ASK!` Into "Safe Cleanup"**: Trash and `/tmp` strays are unrecoverable. Present them as their own choice with sized paths, never as part of an "all safe caches" answer.
- **Never Guess Sizes**: `du` numbers quoted to a user must come from `--list`/`--browse` on that machine right then. A number from another machine or another week is misinformation.
- **Never Let `sudo` Prompt Mid-Script**: check `sudo -n true` first; when passwordless sudo is unavailable, print the exact command instead of blocking the run.
- **Never Trust a Partially-Failed `du`**: with `pipefail`, a `du | cut` pipeline can emit two values for an unreadable subdirectory and corrupt arithmetic. Sizes are read single-line (`du | awk 'NR==1'`), and any filesystem error during discovery is counted and reported: sizes are lower bounds, not exact.
- **Never Match a Generic Directory Name Alone**: `target`, `build`, `obj`, `bin`, `vendor`, and `venv` are common names. Require the owning manifest (`Cargo.toml`, `CMakeCache.txt`/`pubspec.yaml`, `*.csproj`, `go.mod`, `pyvenv.cfg`) before treating one as a build artifact. A Maven `target/` or a `~/bin` is not a cache.
- **Never Use the Directory mtime for Dormancy**: editing a file inside `target/` does not change the directory's mtime. Staleness is the newest file inside the artifact; using `find <dir> -maxdepth 0 -mtime +N` misreads an active cache as abandoned.
- **Never Delete a Discovery Without Re-validating It**: a scan can be minutes or hours old. Re-run the matcher and the dormancy check immediately before deletion; skip with `path changed since discovery` when the path was renamed, replaced, or became active.
- **Never Follow a Symlinked Artifact**: a symlinked `target`/`node_modules`/`.venv` is not the artifact and may point anywhere. Skip symlinks in both discovery and deletion.
- **Never Delete Outside the Three Discovery Scopes**: `~/.cache/*`, exact `<app>/Cache` dirs, and matcher-verified dormant project artifacts. "It looked like a cache" is not a rule; a path that does not match a documented matcher is only ever reported, never auto-cleaned.
- **Never Let Learning Override `ASK!`**: Trash/Recycle Bin, `Downloads`, stale `/tmp`, and Flatpak app caches must ask every single time. A learned `allow` on those keys is deliberately ignored — treat any suggestion to auto-clean them as a bug.
- **Never Treat a Project Cache as Dormant Without the Newest-File Check**: deleting `.next`/`target` under an active dev server breaks the running build. Dormancy (`--dormant`, default 14 days) is measured from the newest file inside the artifact; do not bypass it with a manual `--only` for a project the user is currently working in.
- **Never Delete `*-backup*` / `*-ovfs*` Config Trees**: those are profile-sync-daemon lowerdirs, not caches, even when they contain a `Cache` directory.

---

## Verification

Before marking cleanup complete, verify:
1. `clean-cache.sh --dry-run` or `clean-cache.cmd /dry-run` executes without errors.
2. Only disposable cache directories were targeted; T2 capability caches were preserved unless `--include-coupled` was explicitly passed.
3. **Capability Inventory Snapshot & Diff Contract**: Capability count before and after default cleanup matches identically (`count_after == count_before`), guaranteeing zero skill regressions.
4. Active browser and agent sessions were protected and skipped if running.
5. User cookies, credentials, agent memory, and repository code remain 100% intact.
6. Disk free space increased as reported by `df -h` or `dir`.
7. **Every deletion was inspectable first**: each `ASK`/`ASK!` item was shown with its paths (`--discover` / `--browse <key>`) before selection, and no irreversible item was deleted without a typed `yes` or an approved `--only ... --yes --confirm-irreversible`.
8. `--list` and `--list --json` agree on ids, tiers, and sizes; `--browse <key>` lists the same paths the delete path uses.
9. Sudo-backed candidates either ran with passwordless sudo or reported the exact command instead of hanging.
10. **Discovery stayed in scope**: every auto-cleaned path matched `~/.cache/*`, an exact app `Cache` dir, or a matcher-verified dormant project artifact. No browser profile, agent runtime, orca/ryoku state, or `*-backup*` tree was touched.
11. **Learning behaved**: `ASK` items selected in a prior run were cleaned automatically again (when still dormant/closed); `deny` items did not appear; `ASK!` items (Trash, Downloads, `/tmp`, Flatpak app caches) were still offered and still required confirmation; risky project artifacts stayed report-only despite a learned `allow`.
12. State files are the documented ones only: `~/.local/state/clean-system-cache/{learned.conf,last-scan.tsv}` and `~/.config/clean-system-cache/config.conf`.
13. **Matchers corroborated**: a `target/` without a sibling `Cargo.toml`/`CACHEDIR.TAG`, a `.venv` without `pyvenv.cfg`, a `vendor/` without `go.mod`, and a `build`/`obj`/`bin` without its project marker were not discovered. A symlinked artifact was not discovered.
14. **Dormancy used the newest file**: an artifact containing a file newer than `--dormant` days was not reported, even when the directory mtime was old.
15. **Discoveries were re-validated**: a path renamed, replaced, or made non-dormant after `--discover` was skipped with `path changed since discovery`, and its replacement was left intact.
16. **JSON carried the extra evidence**: `--discover --json` emitted `key`, `path`, `size_kb`, `age_days`, `risk`, and `note`; `--list --json` also emitted `age_days` and `risk` (null/empty for catalog entries).
17. **Unreadable paths were disclosed**: when `find`/`du` hit permission errors during discovery, the report stated that the measured sizes are lower bounds.
