# Clean System Cache (`clean-system-cache`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /clean-cache](https://img.shields.io/badge/Triggers-%2Fclean--cache%20%7C%20%2Fpurge--cache-purple.svg?style=for-the-badge)](#)

Safely reclaim tens of gigabytes of disk space by purging **only unreferenced, dangling, and disposable caches** produced by installed developer, designer, and web browser toolchains across **Windows, Linux, and macOS**.

---

## 🧭 What is this?

Developer and designer workstations accumulate massive disk bloat over time:
- Package manager download archives (`uv`, `npm`, `bun`, `pip`, `pnpm`, `cargo`, `go`, `nuget`, `composer`, `gradle`).
- AUR helper build caches (`yay`, `shelly`, `paru`).
- Mobile & IDE compilation caches (`Xcode DerivedData`, `Android Studio build-cache`, `Cypress`).
- Container build layers (`Docker BuildKit`, `Podman`).
- Desktop indexes and scratch caches (`tracker3`, thumbnails, `fontconfig`, `AppStream`, GStreamer, KDE `.kcache`, Flatpak per-app HTTP caches, GPU shaders).
- Browser-automation runtimes (`Playwright`, `Puppeteer`) and other download caches (`mise`, `nvm` tarballs, `pnpm` metadata, `TypeScript` server, `aria` templates, headless Chrome).
- Creative suite scratch files (`Adobe Media Cache .cfa/.pek`, `Photoshop temp`, `Figma`, `Blender`).
- Browser HTTP response caches (`Chrome`, `Firefox`, `Zen`, `Brave`, `Edge`, `Vivaldi`, `Safari`).
- Agent toolchain caches (`OpenCode`, `Claude Code`, `Cursor`, `Codex`, `Gemini/Antigravity`, `Continue`, `MCP & LSP servers`).

`clean-system-cache` provides native, zero-dependency cleaners (**pure Bash** on Linux/macOS and **native CMD batch** on Windows) that purge only disposable caches while enforcing **three-tier capability classification**, **active running session protection**, **browse-before-delete candidate inspection**, and **zero impact on cookies, logins, tabs, agent memory, or repository code**.

---

## ⚡ Installation

```bash
npx skills add harshsinghmp/muse-skills --skill clean-system-cache
```

---

## 🚀 Usage & Triggers

### Linux & macOS (Bash)
```bash
# Preview reclaimable cache without deleting (Dry Run)
clean-system-cache/scripts/clean-cache.sh --dry-run

# Clean all installed caches in safe mode (preserves T2 capability caches)
clean-system-cache/scripts/clean-cache.sh

# Opt-in to purge capability-coupled caches with Rehydration Manifest
clean-system-cache/scripts/clean-cache.sh --include-coupled

# Clean agent toolchain caches only
clean-system-cache/scripts/clean-cache.sh --tool agents

# Clean web browser caches only
clean-system-cache/scripts/clean-cache.sh --tool browser

# Scan for dormant node_modules folders
clean-system-cache/scripts/clean-cache.sh --scan-node-modules ~/Projects
```

### 🔎 Browse & choose what gets deleted

Anything expensive or irreversible is never deleted by a normal run. Inspect it, then pick:

```bash
# Numbered catalog: id, tier (T1/ASK/ASK!), measured size, exact paths
clean-system-cache/scripts/clean-cache.sh --list

# Same catalog as JSON, for agents that build the menu themselves
clean-system-cache/scripts/clean-cache.sh --list --json

# See exactly which files/folders a candidate owns (largest first)
clean-system-cache/scripts/clean-cache.sh --browse ask-trash
clean-system-cache/scripts/clean-cache.sh --browse app-orca --depth 2

# Multi-select menu: 1,3 | 1-4 | all | none | b <n> browse | q
clean-system-cache/scripts/clean-cache.sh --interactive

# Delete exactly the chosen ids (numbers from --list work too)
clean-system-cache/scripts/clean-cache.sh --only ask-pacman,ask-tmp --dry-run
clean-system-cache/scripts/clean-cache.sh --only ask-pacman,ask-tmp --yes
```

Typical confirmation-gated candidates: Recycle/Trash (irreversible), pacman/apt/dnf
package archives (sudo), stale `/tmp` entries (irreversible), old rustup toolchains and
nvm node versions, the Go module cache, Docker images, unused Flatpak runtimes, opencode
session snapshots, and `profile-sync-daemon` backups (stop `psd` first).

### 🧠 It scans, learns, and remembers

Every run performs a discovery pass, not just the fixed catalog:

```bash
# Full scan: caches, app config caches, dormant project build caches (nothing deleted)
clean-system-cache/scripts/clean-cache.sh --discover

# Same scan and purge the SAFE discoveries
clean-system-cache/scripts/clean-cache.sh --discover --clean-safe

# Point it at your projects and set the dormancy window (persisted)
clean-system-cache/scripts/clean-cache.sh --projects ~/projects:~/work --dormant 21
```

**Auto-cleaned (no question)** — only these two scopes are ever cleaned silently:

| Scope | Why it is safe |
| :--- | :--- |
| `~/.cache/<app>` | The XDG cache contract: this directory is disposable by definition |
| `~/.config/<app>/{Cache,GPUCache,CachedData,Code Cache,ShaderCache,DawnCache,GrShaderCache,Crashpad}` | Exact cache dir names only; configs, `User/`, `workspaceStorage/` are never matched |

**Asked once, then remembered** — shown per project / per app with sizes and paths:

| Scope | Rule |
| :--- | :--- |
| `<project>/{.next,.nuxt,.svelte-kit,.turbo,.parcel-cache,.pytest_cache,__pycache__,.mypy_cache,.ruff_cache,.nyc_output,coverage,.angular,node_modules/.cache,node_modules/.vite}` | Only when untouched for `--dormant` days (default 14). Allow it once and later runs clean it while it stays dormant. |
| `~/.var/app/<id>/cache` | Per-app Flatpak cache. Skipped while that app is running, even after you allow it. |

**Always asks first** — everything else, forever:

- Trash / Recycle Bin, `Downloads`, stale `/tmp`, data folders and documents
- Project caches that are still being touched by an active build
- Browsers, agent runtimes, and `~/.cache/orca` / `~/.cache/ryoku`, which hold state next
  to their caches

```bash
# Remember a decision without deleting anything
clean-system-cache/scripts/clean-cache.sh --learn allow app:mpv
clean-system-cache/scripts/clean-cache.sh --learn deny  proj:/home/me/shop/.next
clean-system-cache/scripts/clean-cache.sh --learned
clean-system-cache/scripts/clean-cache.sh --learn forget proj:/home/me/shop/.next
```

After you allow an app cache or a project cache once, later runs clean it automatically
while its conditions still hold (project still dormant, Flatpak app still closed).
`ASK!` items — Trash, Downloads, `/tmp` strays, Flatpak app caches — are never learned:
they require a fresh confirmation every single run.

State lives in `~/.local/state/clean-system-cache/` (`learned.conf`, `last-scan.tsv`) and
`~/.config/clean-system-cache/config.conf`.

### Windows (Native Command Prompt — CMD)
```cmd
:: Preview cleanup without deleting (Dry Run)
clean-system-cache\scripts\clean-cache.cmd /dry-run

:: Execute full cleanup in safe mode (preserves T2 capability caches)
clean-system-cache\scripts\clean-cache.cmd

:: Opt-in to purge capability-coupled caches with Rehydration Manifest
clean-system-cache\scripts\clean-cache.cmd /include-coupled

:: Clean browser caches only
clean-system-cache\scripts\clean-cache.cmd /tool browser

:: Catalog, browse, then select
clean-system-cache\scripts\clean-cache.cmd /list
clean-system-cache\scripts\clean-cache.cmd /browse win-temp
clean-system-cache\scripts\clean-cache.cmd /interactive
clean-system-cache\scripts\clean-cache.cmd /only win-temp,win-recyclebin /yes
```

---

## 🛡️ Safety Invariants

1. **Three-Tier Capability Classification**:
   - **T1 Regenerable**: Disposable build layers, download tarballs, HTTP caches. Safe to purge silently.
   - **T2 Capability-Coupled**: Installed plugin packages, skill trees, MCP schemas, LSPs. **Preserved by default.** Only purged via explicit `--include-coupled` / `/include-coupled` opt-in, accompanied by a deterministic Rehydration Manifest.
   - **T3 Irreplaceable**: Auth credentials, session databases, agent memory (`.memory/**`), sovereign configs, git repos. **Never touched.**
2. **Running Session Protection**: If an application, browser, or agent runtime is running, cleanup is skipped in execution mode so active sessions, websockets, and tools are never interrupted.
3. **Capability Inventory Contract**: Verifies before-and-after capability counts in safe mode, guaranteeing zero tool/skill regressions.
4. **Strictly "Cache Only"**: Never touches cookies, saved passwords, logins, bookmarks, history, tabs, or user profiles.
5. **Browse-Before-Delete**: Every candidate has a stable id; `--browse` prints the exact paths and sizes, and nothing expensive or irreversible is deleted without an explicit selection plus confirmation.
6. **Scope-Bounded Discovery**: Only `~/.cache/*`, exact app `Cache` dirs, and dormant project build caches are ever cleaned automatically. Browsers, agent runtimes, `orca`/`ryoku` state, and `*-backup*` tree are excluded by rule, not by name luck.
7. **Learning Has Hard Limits**: Remembered `allow` decisions apply only to regenerable `ASK` items whose conditions still hold. Trash/Recycle Bin, Downloads, `/tmp` strays, and Flatpak app caches ignore learning and ask every run.
8. **Zero Dependencies**: Requires no Python, Node, or external interpreters.
