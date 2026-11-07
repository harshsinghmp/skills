# cross — Cross-platform: Expo for React teams, Flutter for fresh starts — one codebase, both stores.

## Intake

- Team's web skills (React? none?)
- App depth (CRUD/content vs platform-deep)
- Native modules needed (maps, bluetooth, biometrics — module availability decides)
- Release strategy (EAS/Play+AppStore pipelines)

## Deliverable

A buildable Expo or Flutter app running on both platforms: shared screens/logic, native-module integrations, and EAS/Fastlane release pipelines wired.

## Procedure

1. Pick the engine: Expo (React team, CRUD/content app) or Flutter (fresh start, custom UI, either team).
2. Structure: one navigation model, shared logic layer (state/API), thin platform surfaces.
3. Check native modules FIRST (maps, payments, biometrics) — missing modules change the engine decision.
4. Build screens with the engine's native-feel components (not least-common-denominator web-ish UI).
5. Platform branches only where behavior truly differs (permissions, back-gesture, safe areas). Shared UI mechanics: inputs ≥16 (no platform zoom trap); safe-area insets honored on both platforms; semantic color tokens with light+dark verified per platform; icons optically aligned (nudge by eye, stroke matched to text weight).
6. Touch-state inventory per control: default/pressed/disabled/loading/empty/error on both platforms — no happy-path-only controls.
7. Extremes-first testing: smallest/oldest device on EACH platform first; breakpoints where content breaks, not device presets.
8. Offline: engine's local storage (AsyncStorage/SQLite or Hive/Drift); cache-then-network where warranted.
9. Release: EAS Build/Submit (Expo) or Fastlane (Flutter); test on both platforms before store submission.

## Quality gate

- [ ] Engine choice justified against the ladder (team + depth + modules).
- [ ] Native module availability verified before build start.
- [ ] UI feels native on BOTH platforms (no web-ish compromise).
- [ ] Inputs ≥16, safe-area + semantic-token parity (light+dark) on both platforms, touch-state inventory complete, icons optically aligned.
- [ ] Extremes-first tested on both platforms (smallest/oldest first).
- [ ] Offline strategy implemented where the domain warrants.
- [ ] Both-platform device tests + release pipeline wired.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
