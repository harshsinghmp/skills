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
- Agent toolchain caches (`OpenCode`, `Claude Code`, `Cursor`, `Codex`, `Gemini/Antigravity`, `Continue`, `MCP & LSP servers`).

`clean-system-cache` provides native, zero-dependency cleaners (**pure Bash** on Linux/macOS and **native CMD batch** on Windows) that purge only disposable caches while enforcing **three-tier capability classification**, **active running session protection**, and **zero impact on cookies, logins, tabs, agent memory, or repository code**.

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
5. **Zero Dependencies**: Requires no Python, Node, or external interpreters.
