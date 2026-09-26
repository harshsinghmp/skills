# Clean System Cache (`clean-system-cache`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Type: Agent Skill](https://img.shields.io/badge/Type-Agent%20Skill-blue.svg?style=for-the-badge)](#)
[![Triggers: /clean-cache](https://img.shields.io/badge/Triggers-%2Fclean--cache%20%7C%20%2Fpurge--cache-purple.svg?style=for-the-badge)](#)

Safely reclaim tens of gigabytes of disk space by purging **only unreferenced, dangling, and disposable caches** produced by installed developer, designer, and web browser toolchains across **Windows, Linux, and macOS**.

---

## 🧭 What is this?

Developer and designer workstations accumulate massive disk bloat over time:
- Package manager download archives (`uv`, `npm`, `bun`, `pip`, `pnpm`, `cargo`, `go`, `nuget`, `composer`, `gradle`).
- Mobile & IDE compilation caches (`Xcode DerivedData`, `Android Studio build-cache`, `Cypress`).
- Container build layers (`Docker BuildKit`, `Podman`).
- Creative suite scratch files (`Adobe Media Cache .cfa/.pek`, `Photoshop temp`, `Figma`, `Blender`).
- Browser HTTP response caches (`Chrome`, `Firefox`, `Zen`, `Brave`, `Edge`, `Vivaldi`, `Safari`).

`clean-system-cache` provides native, zero-dependency cleaners (**pure Bash** on Linux/macOS and **native CMD batch** on Windows) that purge only disposable caches while enforcing **active running session protection** and **zero impact on cookies, logins, tabs, or repository code**.

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

# Clean all installed caches (skips missing or active running apps)
clean-system-cache/scripts/clean-cache.sh

# Clean web browser caches only
clean-system-cache/scripts/clean-cache.sh --tool browser

# Scan for dormant node_modules folders
clean-system-cache/scripts/clean-cache.sh --scan-node-modules ~/Projects
```

### Windows (Native Command Prompt — CMD)
```cmd
:: Preview cleanup without deleting (Dry Run)
clean-system-cache\scripts\clean-cache.cmd /dry-run

:: Execute full cleanup
clean-system-cache\scripts\clean-cache.cmd

:: Clean browser caches only
clean-system-cache\scripts\clean-cache.cmd /tool browser
```

---

## 🛡️ Safety Invariants

1. **Running Session Protection**: If an application or browser is open, cache cleanup is skipped in execution mode so active sessions, tabs, and websockets are never interrupted.
2. **Strictly "Cache Only"**: Never touches cookies, saved passwords, logins, bookmarks, history, tabs, or user profiles.
3. **Zero Dependencies**: Requires no Python, Node, or external interpreters.
