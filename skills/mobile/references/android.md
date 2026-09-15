# android — Android: Jetpack Compose, Material 3, Play Store release discipline.

## Intake

- App concept and screens (design spec)
- Android features (widgets, foreground services, Wear?)
- Play Console account + signing setup
- Backend API contract

## Deliverable

A buildable Compose app: Material 3 screens per spec, platform integrations, and a Play-release package (signed AAB, store listing, data-safety form).

## Procedure

1. Structure: single-activity Compose app; Navigation Compose with typed routes.
2. Data: Kotlin data classes + Retrofit/Ktor per API contract; coroutines + Flow, never blocking the main thread.
3. Build screens: Material 3 components, dynamic color where appropriate, edge-to-edge.
4. Platform services: DataStore for prefs, Room for offline cache, FCM push with rationale-then-ask.
5. States: loading/empty/error per screen; offline-first caching where the domain warrants. Touch-state inventory per control: default/pressed (ripple)/disabled/loading/empty/error — no control ships with only the happy path.
6. UI mechanics: text inputs ≥16sp equivalent (no zoom-inducing tiny type); edge-to-edge with WindowInsets/safe-area respected (status/nav bars, cutouts); semantic color tokens verified in light AND dark mode; nudge icons/asymmetric glyphs by eye to optical alignment (match icon stroke to text weight).
7. Extremes-first testing: smallest/oldest supported device first (low-RAM, small screen), then flagships — size content to where it breaks, not to device presets.
8. Test on emulator AND physical device (sizes, OEM quirks, permission flows).
7. Release: signed AAB, staged rollout, data-safety form, store listing assets.

## Quality gate

- [ ] Single-activity Compose structure (no fragment fossils).
- [ ] Main thread never blocked (coroutines verified).
- [ ] Material 3 components throughout.
- [ ] Device + emulator tested across sizes.
- [ ] Inputs ≥16sp, insets/safe-area respected edge-to-edge, semantic tokens parity in light+dark, touch-state inventory complete, icons optically aligned.
- [ ] Extremes-first tested (smallest/oldest device first).
- [ ] Release package: signed AAB + completed data-safety.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
