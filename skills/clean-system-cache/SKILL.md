---
name: clean-system-cache
aliases: ["clean-cache","purge-cache","cache-cleaner","disk-cleanup"]
description: "Cross-platform developer, designer, and browser cache cleaner for Windows, Linux, and macOS. Safely purges only unreferenced, dangling, and disposable caches from package managers (uv, npm, bun, pip, pnpm, yarn, cargo, go, dotnet, composer, gradle, brew), IDEs and compilers (xcode, android, vscode, cursor, cypress), containers (docker, podman), creative suites (adobe media cache, photoshop temp, figma, blender, electron), and web browsers (chrome, chromium, brave, edge, firefox, zen, vivaldi, safari). Enforces active running session protection and strict cache-only isolation with zero external runtimes (pure Bash on POSIX, native CMD on Windows)."
version: 1.0.0
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

## When to Use

### Trigger Conditions
Execute this skill when:
1. **Low Disk Space Warnings**: Disk capacity drops below comfortable working thresholds due to accumulated build layers, package archives, or scratch media files.
2. **Dangling Build Layers**: Docker BuildKit layers, Xcode DerivedData, Android build-cache, or Go/Cargo build artifacts consume tens of gigabytes without active references.
3. **Bloated Web Browser Caches**: Google Chrome, Mozilla Firefox, Zen, Brave, or Microsoft Edge disk caches grow to multiple gigabytes of stale HTTP responses.
4. **Stale Designer Scratch Files**: Adobe Premiere, After Effects, Audition (`.cfa` / `.pek` audio peak caches), or Figma desktop app caches lock up storage.
5. **Dormant `node_modules` Directories**: Old, abandoned repository folders hog dozens of gigabytes across user project directories.

### Anti-Triggers
Do **NOT** use this skill for:
- Wiping active project code, git histories, or working repository files.
- Cleaning browser cookies, logins, saved passwords, bookmarks, or user profiles (the skill strictly protects them).
- Purging virtual environments (`.venv`) or active Docker containers and volumes.
- Deleting global binary installations (`~/.cargo/bin`, `~/.nvm`, etc.).

---

## Quick Reference

### 11-Point Cache Architecture Matrix

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
│ 11. Project Audits      │ Dormant node_modules scanner across project trees      │
└─────────────────────────┴────────────────────────────────────────────────────────┘
```

### Safety & Running Session Protection Contracts

| Protected Area | Skill Invariant |
| :--- | :--- |
| **Active Browser Sessions & Live Tabs** | **PROTECTED.** Process detection checks if any browser is running (`pgrep` / `tasklist`). Active sessions are skipped in execution mode so running tabs and websockets are never disrupted. |
| **Browser Cookies, Passwords & History** | **NEVER TOUCHED.** Purges purely disposable HTTP cache (`Cache_Data`, `cache2/entries`). User profiles, cookies, logins, and bookmarks remain 100% intact. |
| **Project Repositories & Source Code** | **NEVER TOUCHED.** Does not alter active git working directories or files. |
| **Virtual Environments (`.venv`)** | **PRESERVED.** Cleans package download wheels only; never touches virtual environments. |
| **Active Containers & Volumes** | **PRESERVED.** Prunes dangling build layers only; active containers, images, and volumes are untouched. |
| **Installed Global Binaries** | **PRESERVED.** Binaries in `~/.cargo/bin`, `~/.nvm`, `%APPDATA%`, etc. are never touched. |

---

## Procedure

### Phase 1: Pre-Flight Inspection (Dry Run)
Before modifying disk contents, run an inspection to calculate reclaimable space across all installed tools:

- **Linux & macOS**:
  ```bash
  clean-system-cache/scripts/clean-cache.sh --dry-run
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /dry-run
  ```

### Phase 2: Targeted or Selective Purging
If you want to target specific subsystems (e.g. only web browsers or package managers):

- **Web Browsers Only**:
  ```bash
  clean-system-cache/scripts/clean-cache.sh --tool browser
  ```
- **Specific Tools**:
  ```bash
  clean-system-cache/scripts/clean-cache.sh --tool uv,npm,firefox,zen,docker,adobe
  ```

### Phase 3: Comprehensive Cache Execution
Execute full cleanup across all installed tools. Any tool not present on the system is dynamically and silently skipped:

- **Linux & macOS**:
  ```bash
  clean-system-cache/scripts/clean-cache.sh
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd
  ```

### Phase 4: Dormant `node_modules` Audit
Scan project directories for abandoned node_modules folders consuming massive disk space:

- **Linux & macOS**:
  ```bash
  clean-system-cache/scripts/clean-cache.sh --scan-node-modules ~/Projects
  ```
- **Windows CMD**:
  ```cmd
  clean-system-cache\scripts\clean-cache.cmd /scan-node-modules C:\Projects
  ```

---

## Pitfalls

- **Never Clean Caches of Actively Running Browsers**: Attempting to purge active browser files can crash open tabs or corrupt SQLite index databases. The script automatically guards against this by checking running processes.
- **Never Touch Profile Directories**: Cookies, sessions, bookmarks, and passwords live in `~/.mozilla`, `~/.config`, `%APPDATA%`, and `~/Library/Application Support/`. Never delete these directories.
- **Never Assume Python or External Interpreters**: Developer machines may have corrupted Python or node runtimes; cache cleaners must run on native shell (`bash` on POSIX, `cmd` on Windows).
- **Never Prune Active Docker Images or Named Volumes**: Only prune dangling build layers (`docker builder prune -f`), never containers or database volumes.

---

## Verification

Before marking cleanup complete, verify:
1. `clean-cache.sh --dry-run` or `clean-cache.cmd /dry-run` executes without errors.
2. Only disposable cache directories were targeted.
3. Active browser sessions were protected and skipped if running.
4. User cookies, credentials, and repository code remain 100% intact.
5. Disk free space increased as reported by `df -h` or `dir`.
