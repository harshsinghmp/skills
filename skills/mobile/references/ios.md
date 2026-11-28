# ios — iOS: SwiftUI-first, HIG compliance, App Store submission discipline.

## Intake

- App concept and screens (design spec from `design`)
- iOS features needed (widgets, watch, share extensions?)
- Apple Developer account + signing status
- Backend API contract (from `webdev` backend mode)

## Deliverable

A buildable SwiftUI app: navigable screens per spec, platform integration (network, storage, push), HIG-compliant components, and a store-ready submission package (screenshots, metadata, privacy answers).

## Procedure

1. Structure: SwiftUI app with navigation per HIG (NavigationStack, tabs, sheets — never web-style routing).
2. Model data: Swift structs/Codable against the API contract; no force-unwraps on network data.
3. Build screens: SwiftUI components with platform-native feel (SF Symbols, system animations).
4. Platform services: secure storage for tokens, standard prefs for settings, APNs push with purposeful permission ask.
5. States: loading/empty/error per screen; offline caching for previously fetched data. Touch-state inventory per control: default/pressed/disabled/loading/empty/error — no control ships with only the happy path.
6. UI mechanics: text inputs ≥16pt (prevents iOS auto-zoom on focus); respect safe-area insets (notch/Dynamic Island/Home indicator) via safe-area layout guides; semantic color tokens verified in light AND dark mode; nudge icons/asymmetric glyphs by eye to optical alignment (match icon stroke to text weight).
7. Extremes-first testing: smallest/oldest supported iPhone first, then the largest — size content to where it breaks, not to device presets.
8. Test on simulator AND a physical device (performance, permissions, gesture zones).
9. Store prep: privacy nutrition labels, screenshots per device size, review notes; submit via App Store Connect.

## Quality gate

- [ ] Navigation is HIG-native, not web-ported.
- [ ] No force-unwrapped network data.
- [ ] Device-tested, not just simulator.
- [ ] Permissions minimal and justified with purpose strings.
- [ ] Inputs ≥16pt, safe-area respected, semantic tokens parity in light+dark, touch-state inventory complete, icons optically aligned.
- [ ] Extremes-first tested (smallest/oldest device first).
- [ ] Submission package complete (metadata, privacy, screenshots).

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
