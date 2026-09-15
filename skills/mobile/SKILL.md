---
name: mobile
aliases: ["mobile-apps", "app-development", "ios-development", "android-development", "react-native", "expo", "flutter"]
description: "Full mobile app department: iOS (SwiftUI), Android (Compose), cross-platform (React Native/Expo, Flutter), progressive web apps, and app store optimization — routed through five modes. Use when asked to build, refactor, or ship mobile apps, convert web apps to native/PWA, implement native features (camera, push, offline), or improve app store visibility. Not for websites (webdev) or UI motion (animate mobile refs)."
argument-hint: "[ios|android|cross|pwa|aso]"
user-invocable: true
version: 1.0.0
author: Harsh Singh
license: MIT
platforms: [macos, linux, windows]
category: agency-delivery
metadata:
  category: agency-delivery
  priority: 27
  aliases: ["mobile-apps", "app-development", "ios-development", "android-development", "react-native", "expo", "flutter"]
  suggested_skills: ["new-project", "webdev", "design", "code-review"]
  hermes:
    tags: ["mobile", "ios", "android", "swiftui", "compose", "react-native", "expo", "flutter", "capacitor", "pwa", "aso", "app-store", "play-store", "push-notifications", "offline-first"]
    related_skills: ["new-project", "webdev", "design", "code-review"]
    suggested_skills: ["new-project", "webdev", "design", "code-review"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  openclaw:
    category: agency-delivery
    suggested_skills: ["new-project", "webdev", "design", "code-review"]
    primary_triggers: ["mobile app", "ios app", "android app", "react native", "expo app", "flutter app", "pwa", "app store optimization", "push notifications", "offline app"]
    requires_tools: ["bash", "view_file", "write_to_file", "replace_file_content", "run_command", "grep_search"]
  compatibility: [hermes, openclaw, claude-code, codex, cursor, gemini-cli, opencode]
---

# 📱 mobile — Mobile Apps Department

One head skill for mobile. Choose the honest path: web already exists → wrap (Capacitor/PWA); React team → Expo; fresh + performance-critical or platform-deep → native. Never pick a stack by hype. Every mode ends with the platform's build running on a device or emulator, not just compiled.

---

## Modes — quick commands

Every invocation resolves to exactly **one** mode. Match the request, then load only the matched reference:

| Mode | Trigger phrases | Behavior | Reference |
|:---|:---|:---|:---|
| **ios** | "ios app", "swiftui", "app store submission" | SwiftUI-first iOS build, HIG compliance, store submission | [references/ios.md](references/ios.md) |
| **android** | "android app", "jetpack compose", "play store" | Compose-first Android build, Material 3, Play submission | [references/android.md](references/android.md) |
| **cross** | "react native", "expo app", "flutter app", "cross-platform mobile" | Expo (React Native) or Flutter cross-platform build | [references/cross.md](references/cross.md) |
| **pwa** | "pwa", "make it installable", "offline web app" | Installable, offline-capable progressive web app | [references/pwa.md](references/pwa.md) |
| **aso** | "app store optimization", "aso", "store ranking", "more app installs" | App Store Optimization: keywords, listing, ratings loop, review responses | [references/aso.md](references/aso.md) |

Only the resolved mode's reference is loaded — the rest stay on disk, saving tokens on every run.

---

## When to Use

- Building a new mobile app (native, cross-platform, or web-wrapped).
- Converting an existing web app to iOS/APK or a PWA.
- Implementing native capabilities: camera, push, biometrics, offline storage.
- Refactoring or optimizing an existing mobile app.
- App store optimization: listings, keywords, screenshots, review handling.

### Anti-Triggers

- Websites and web apps → `webdev`.
- Scaffolding the project → `new-project` (it handles Expo/Capacitor presets).
- Animation inside mobile UI → `animate` (its mobile reference), not this skill.

---

## Quick Reference

### Stack path ladder (decide before any mode)

| Situation | Path |
|:---|:---|
| Working web app; app must mirror it | Wrap: Capacitor (web stack) or PWA if install/offline only |
| React/JS team; app is CRUD + content | Expo (React Native) |
| Fresh start, either team; fast iteration both platforms | Flutter |
| Platform-deep (widgets, watch, AR, fine perf) or single platform | Native: SwiftUI / Compose |

Decision inputs: team's existing skills > app depth requirements > budget > long-term maintenance.

### Verification gate (every mode)

- Builds on the platform toolchain (`xcodebuild`, `gradle`, `expo`/`eas`, `flutter build`).
- Runs on a device or emulator — captured logs/screenshots as evidence.
- Store pre-flight passes (bundle size, permissions justified, signing).

### Suite contracts

- Project scaffold with Expo/Capacitor wiring → `new-project` first.
- Server/API work the app consumes → `webdev` (backend mode).

---

## Procedure

1. **Intake.** establish the honest stack path (wrap existing web / cross / native) before writing a line — from team skills, app depth, and budget; the answer drives everything.
2. **Resolve the mode.** Match the request against the mode table; exactly one mode. Ambiguous → ask one question, then proceed.
3. **Execute the mode playbook.** Load `references/<mode>.md` and follow its Intake → Deliverable → Procedure → Quality gate in order.
4. **Gate and deliver.** Pass this file's Verification checklist plus the mode's quality gate, then deliver the artifact where the client expects it.

---

## Pitfalls

- Choosing a stack by hype instead of the ladder — the expensive mistake.
- Testing only in the simulator — device performance and permissions differ.
- Offline as an afterthought — mobile networks are the default environment, not the edge case.
- Ignoring platform HIGs (Apple/Material) — rejection risk + clunky feel.
- Push permissions asked at launch with no context — denied forever after.
- Bundle bloat from web habits — unused polyfills and images ship to every user.
- ASO treated as a launch-day task — it shapes name, keywords, and screenshots from day one.

---

## Verification

- [ ] Stack path decided via the ladder and stated with rationale before build.
- [ ] The platform's own build toolchain ran green.
- [ ] App runs on a device or emulator with captured evidence.
- [ ] Native permissions justified (only those used, with purpose strings).
- [ ] Offline/degraded-network behavior tested, not assumed.
- [ ] Store pre-flight checks pass (size, signing, listing assets).
