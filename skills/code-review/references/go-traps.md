# Go Traps — defensive-Go checklist for reviewing Go diffs

> Source: `samber/cc-skills-golang` `golang-safety` (MIT, raw SKILL.md
> fetched 2026-09-19 from `github.com/samber/cc-skills-golang`) — checklist
> only, no process import. Consult as a candidate generator when the diff
> touches `**/*.go`; every candidate still enters through the buyer's
> evidence-first review steps. Concurrency primitives, security-relevant
> overflow, and panic debugging are out of scope here (route to the owning
> specialist).

Safety handles ourselves (non-adversarial programmer mistakes); security
handles attackers.

| Trap | Wrong shape | Right shape |
| :--- | :--- | :--- |
| **Typed-nil interface** | returning a typed nil pointer as an interface — `(type, nil)` is `!= nil` | return untyped `nil` for the nil case |
| **Nil map write** | `var m map[K]V; m[k] = v` panics | `make` or lazy-init in the method |
| **Bare type assertion** | `v := x.(T)` panics on mismatch | comma-ok `v, ok := x.(T)` |
| **`append` aliasing** | `b := append(a, x)` may share the backing array when capacity allows | full slice expression `a[:len(a):len(a)]`, or `slices.Clone` |
| **Defensive copies** | exported func/struct field hands out the internal slice/map | return `slices.Clone` / `maps.Clone`; unexported field + copying accessor |
| **`defer` in loops** | `defer f.Close()` inside a loop accumulates until function exit | extract loop body to a function so defer runs per iteration |
| **Silent truncation** | `int32(int64val)` wraps without error | bounds-check against `math.MaxInt32`/`MinInt32` first |
| **Float `==`** | `0.1+0.2 == 0.3` is false | epsilon comparison `math.Abs(a-b) < eps` |
| **Integer divide-by-zero** | panics | guard `divisor == 0` before dividing |
| **Nil channel** | blocks forever on send and receive | always initialize before use |
| **Zero-value design** | type unusable as `var x T` (nil map field) | design so the zero value is safe; `sync.Once` for lazy init |

Enforce mechanically where possible: `govet`, `staticcheck`, `errcheck`
in CI catch most of these before human review.
