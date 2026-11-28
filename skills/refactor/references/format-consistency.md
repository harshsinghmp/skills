# Value-Format Consistency

Makes every rendered price, date, number and unit derive from one formatter with one set of
locale rules, and pins it with tests so it cannot drift back.

## When to Use

- The same price renders as `$19`, `19.00 USD`, `19 USD` or `€19` on different pages of one
  product.
- Dates disagree across components in the same locale (`03/04/2025` beside `4 March 2025`,
  or a day lost to timezone conversion).
- Switching locale or currency changes the label but not the value, or the value but not the
  label.
- Number separators, decimal commas, unit spacing (`5 kg` vs `5kg`) or percent scaling
  differ between page, email and invoice.
- A locale launch, currency addition, or `Intl`/library upgrade requires auditing every
  hardcoded format before it ships.

## Procedure

1. Sweep source and output, not just source. Find format primitives: `toFixed(`,
   `toLocaleString(`, `toLocaleDateString`, `Intl.`, `dayjs(`/`moment(`/`date-fns`
   `format(`, `$${`, literal `$ € £ ¥`, `toUpperCase()` on currency codes, `Math.round(x *
   100)`, `replace('.', ',')`, `'%'`, and hand-written unit strings. Then grep fixtures,
   snapshots, email templates and CMS-rendered HTML — content authored in a CMS hides
   formats that code search never sees. Record file:line, sample input, current output, and
   whether it is user-facing.
2. Classify every hit before changing any: display formatting, business calculation, or data
   at rest. Only display is in scope. Reformatting stored or charged values to match a
   display bug is a data change disguised as a fix.
3. Build the single source of the format — one module wrapping the platform's `Intl` APIs
   with fixed option sets, one function per kind: `money(amountMinor, currency, locale)`,
   `date(instant, locale, style)`, `number(value, locale, options)`, `unit(value, unit,
   locale)`, `percent(fraction, locale)`. Inputs are explicit and typed — integer minor units
   for money, ISO-8601 or an epoch instant for dates. The formatter never reads ambient
   locale, timezone or currency; the caller passes them from the request, user profile or
   tenant.
4. Pin the locale rules the formatter must not reinvent: minor-unit digits come from the
   currency, not a global 2 (JPY 0, KWD 3); symbol position and spacing per locale; decimal
   and grouping separators per locale, including non-Latin digit shapes; date order, month
   and weekday names per locale; one stated timezone policy per surface (user zone for UI,
   UTC or the business zone for billing); unit spacing and plural forms from the locale's
   plural rules. Do not hand-roll any of this — the platform already encodes it and only
   needs explicit inputs.
5. Round at one boundary only: format the value that is stored or charged, and keep
   arithmetic in integer minor units. A `toFixed` in the middle of a calculation yields
   totals that do not equal the sum of the displayed rows.
6. Write the tests that pin it: table-driven cases per formatter × locale (at minimum a
   default locale, one with a decimal comma, one with a zero-minor-digit currency, and one
   right-to-left locale) × edges (zero, negative, very large, half-cent rounding,
   single-digit day, DST transition, month boundary). Add at least one rendered-level
   assertion — a component or page test showing the expected string — so a component that
   bypasses the formatter fails the suite.
7. Migrate a live site in this order:
   - Land the formatter and its tests unused.
   - Migrate by user impact: checkout and pricing first, then product lists, then
     transactional email and receipts, then admin and internal views.
   - One route or component per change, with before/after output for the same seeded data.
   - Delete the superseded helpers and add a lint rule or CI grep that fails on a raw format
     primitive outside the formatter and its tests.
   - Audit CMS-authored and translated strings last, since that work is content editing, not
     code.
8. Where the same value is formatted in five places for five different reasons the real
   problem is duplication — hand that to `sweep.md` after the formatter lands, so the sweep
   unifies call sites instead of changing output.

## Verification

- Exactly one implementation of money, date, number and unit formatting exists; a grep for
  format primitives returns only that module plus its tests.
- Every row in the discovery sweep is marked migrated, intentionally raw (with a reason), or
  out of scope — no unclassified hits.
- Formatter tests cover at least four locales, including a decimal-comma locale, a
  zero-minor-digit currency and an RTL locale.
- The same seeded data renders identically on every page and in email, proven by a shared
  fixture rather than by eye.
- Arithmetic consistency holds: displayed line items sum to the displayed total for a fixture
  with rounding-prone values.
- The migration shipped with before/after evidence per surface and no regressed page.
- A CI guard exists that would fail a newly introduced raw format call.

## Anti-Patterns

- Editing each page's string until the screenshots match the design, leaving the formatter
  unbuilt and the bug reproduced wherever the next page is written.
- Hardcoding a default locale, currency or timezone inside the formatter, so the "fix" is
  correct only for the launch market.
- Reformatting stored or charged values to make the display consistent, which changes money
  instead of presentation.
