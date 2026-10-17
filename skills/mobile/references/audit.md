# audit — mobile audit mode

## When to Use

- **Store audit**: Verify app listing, keywords, screenshots, ratings, and store compliance are current
- **Launch audit**: Check iOS/Android launch readiness (store accounts, certificates, preview video, build submitted)
- **Accessibility audit**: Check mobile a11y per the checklist below (RN/Expo/SwiftUI/UIKit/Compose)

## Accessibility checklist

Source: `Community-Access/accessibility-agents` `mobile-accessibility`, raw SKILL.md fetched per lane-a-skillshub-remainder.md #10; enrich-only, no new skill or mode.

- [ ] Every interactive element and image carries `accessibilityLabel` (RN) / `contentDescription` (Compose) / `.accessibilityLabel` (SwiftUI); decorative elements explicitly hidden (`importantForAccessibility="no"` / `accessible={false}` / `.accessibilityHidden(true)`).
- [ ] Every interactive element declares a role (`accessibilityRole` / `Role.Button` etc. / traits); state-bearing elements expose state (`accessibilityState`, `stateDescription`); non-obvious actions carry a hint (`accessibilityHint`).
- [ ] Touch targets meet platform minimums: iOS 44×44pt (HIG), Android 48×48dp (Material), mobile web 44×44 CSS px (WCAG 2.5.5; 24×24 floor under 2.2 AA).
- [ ] Screen-reader flow verified: modals trap focus (`accessibilityViewIsModal` / `Modal`), dynamic content announces via live regions, reading order sane.
- [ ] Per-platform semantics used, not RN-only props pasted everywhere (SwiftUI modifiers, UIKit `UIAccessibility` traits, Compose `semantics` incl. `mergeDescendants`).
- [ ] Automated cover where cheap: `@testing-library/react-native` role/state assertions (`getByRole`, `toHaveAccessibilityState`); E2E label assertions (Maestro `assertVisible` on labels).

## Checklist

- [ ] App Store listing updated with latest version, screenshots, and release notes
- [ ] Keyword strategy documented and current
- [ ] Ratings and reviews monitored (weekly sweep)
- [ ] App Store/Play Store compliance checked (privacy policy, age rating, permissions)
- [ ] Latest store build version matches shipped version
- [ ] In-app analytics events firing correctly (see `analytics` audit)
- [ ] Push notification certificates valid (iOS)
- [ ] Google Play signing key current and backed up (Android)

## Severity & routing

| Severity | Action | Route to |
|:---|:---|:---|
| Store listing stale (>30 days) | `AUTO-REPAIR` | `content` (update listing copy) |
| Missing privacy policy URL | `PROPOSE-DIFF` | `qa-launch` (block release) |
| Certificate expired | `PROPOSE-DIFF` | `devops` (renew + re-sign) |
| Analytics events not firing | `REPORT-ONLY` | `analytics` audit |
| App not on latest OS version | `AUTO-REPAIR` | mobile (update build target) |

## Output

`.agents/artifacts/audit-mobile-<ts>.md` with findings table per canonical spec: `../skills/references/audit-mode-guidance.md`.
