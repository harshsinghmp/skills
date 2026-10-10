# pwa — PWA: installable, offline-capable web app — service worker, manifest, storage strategy.

## Intake

- Existing web app (framework, routes, data sources)
- Offline expectations (full offline? read-only cache? offline-first?)
- Install surfaces targeted (mobile home screen, desktop)
- Push needs (web push opt-in strategy)

## Deliverable

An installable PWA: valid manifest, service worker with an explicit caching strategy per route/asset class, offline fallback page, install prompts, and (optionally) web push.

## Procedure

1. Audit the app: routes, assets, API calls — classify each as cache-first, network-first, or stale-while-revalidate.
2. Manifest: name, icons (192/512 + maskable), theme, display standalone, start URL.
3. Service worker: precache shell, runtime caching per strategy; explicit cache versioning + cleanup.
4. Offline fallback page for un-cached navigations; queue mutations (background sync where supported).
5. Install: beforeinstallprompt handling for Android/desktop; iOS Add-to-Homescreen guidance (no prompt API). UI mechanics: form inputs ≥16px (prevents iOS zoom on focus); safe-area insets honored in standalone display mode (notch/gesture bar); semantic color tokens verified in both color schemes; icons optically aligned (nudge by eye, stroke matched to text weight).
6. Touch-state inventory per control: default/pressed/disabled/loading/empty/error — no happy-path-only controls. Extremes-first: smallest viewport/oldest target device first; breakpoints where content breaks, not device presets.
6. Push (optional): web push VAPID keys, opt-in UX with context, notification UX per platform.
7. Verify with Lighthouse PWA audit + real offline testing (DevTools offline + airplane-mode device).

## Quality gate

- [ ] Lighthouse PWA pass (installable + fast + SW-controlled).
- [ ] Real offline test: shell loads, cached routes work, fallback shows.
- [ ] Cache versioned with cleanup — no unbounded growth.
- [ ] Icons maskable + correct sizes.
- [ ] Inputs ≥16px, safe-area + semantic-token parity (both schemes), touch-state inventory complete, icons optically aligned; extremes-first tested.
- [ ] Push only with explicit opt-in UX.

## Sources

Reference URLs provided for this mode are listed here. When a cited source conflicts with a default above, the source wins — record the override and why.
