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

## Compose performance audit (enrich — source: `android-skills-compose-performance-audit`, raw SKILL.md v1.0.0 fetched 2026-09-19)

Code-first, then profile. Collect the target Composable + its data flow
(state, remember, derived state, ViewModel) + symptoms before theorizing;
if code review is inconclusive, profile — Layout Inspector
(recomposition counts + highlights), Perfetto/System Trace (frame
timing), Macrobenchmark (startup/scroll). Profile release builds with R8
— debug overhead invalidates every number.

- **Hunt, in impact order:** recomposition storms (unstable params, broad
  state reads) → unstable/missing `LazyColumn` keys (`key = { it.id }`,
  never index identity) → heavy work in composition (sort/filter/format
  without `remember(key)`) → missing `remember` recreations → unstable
  lambdas (remember or method reference) → state read in the wrong phase
  (defer with `derivedStateOf`, lambda modifiers, `drawBehind`) →
  unsized async images (Coil/Glide + constraints) → layout thrash (deep
  nesting, intrinsics, `SubcomposeLayout` misuse).
- **Stability rules:** primitives stable; `List`/`Map`/`Set`, `var`-classes,
  lambdas NOT stable — `@Stable`/`@Immutable` (+ immutable collections)
  where truly immutable. Unstable data classes are the commonest storm
  source.
- **Verify:** re-run Layout Inspector + Macrobenchmark on-device (release)
  and report the before/after delta (recomposition counts, frame drops,
  jank). No delta, no done.

## APK/AAB static security scan — MobSF gate (enrich — source: `cybersecurity-skills-performing-android-app-static-analysis-with-mobsf`, Apache-2.0, signed SLSA L2, raw SKILL.md fetched 2026-09-19)

Run before release and as a CI gate on the signed artifact
(`security_score < 60` fails the build). Docker-isolated
(`opensecurity/mobile-security-framework-mobsf`), upload via REST API,
triage every HIGH manually (MobSF flags `password` in variable names —
patterns are leads, not findings).

- **Manifest:** exported components without permission guards,
  `debuggable=true`, `allowBackup=true`, missing `networkSecurityConfig`.
- **Code:** hardcoded keys/tokens, secrets in SharedPreferences, ECB /
  static-IV / hardcoded-key crypto.
- **Transport:** missing pinning, trust-all TrustManagers, cleartext HTTP.
- **Binary:** missing R8/ProGuard, weak native protections (canaries, NX,
  PIE), no debugger detection.
- Static-only by design — it misses runtime logic flaws, so this gate
  complements (never replaces) manual review and dynamic analysis. Keep
  MobSF matched to the app's `targetSdkVersion`; cover `.so` files with
  `checksec` + manual review.

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
