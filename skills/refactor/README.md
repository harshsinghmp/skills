# 🪄 refactor

**Universal Refactoring Engine: Systematically evaluate, modernize, and refactor UI, code, architecture, performance, database schemas, and multi-page consistency.**

`refactor` provides coding agents with a deterministic, engineering-grade refactoring engine spanning seven specialized modes. Transforms legacy, messy, or inconsistent code and interfaces into clean, maintainable, and high-performance production assets without altering external behavior.

---

## ⚡ Install

```bash
# Install this skill
npx skills add harshsinghmp/muse-skills --skill refactor

# Or the complete suite
npx skills add harshsinghmp/muse-skills
```

---

## 🎯 Modes — Pick a mode, say the words

| Say | Mode | What you get |
|:---|:---|:---|
| *"Refactor this UI / make it look professional"* | **ui** | 10 Refactoring UI atomic heuristics, spacing ladders, container queries, and WCAG 2.2 contrast parity. |
| *"Refactor this function / reduce complexity"* | **code** | Cyclomatic complexity reduction, SOLID principles, dead code elimination, and TypeScript strict typing. |
| *"Refactor codebase structure / decouple modules"* | **architecture** | Structural decoupling, modular boundary enforcement, and breaking circular dependencies. |
| *"Optimize performance / fix memory leak"* | **perf** | Runtime bottlenecks, memory leak prevention, bundle size trimming, and virtualization. |
| *"Refactor schema / zero-downtime migration"* | **database** | Expand/contract migrations, non-breaking schema evolution, index tuning, and N+1 query batching. |
| *"Make all pages consistent / sweep components"* | **sweep** | Multi-page consistency matrix, token centralizations, and component variant unification. |
| *"Final polish before release / pre-merge pass"* | **polish** | Pre-release debt cleanup, deprecated API modernization, lint sanitization, and release verdict. |

---

## 🔍 Built-in Scripts & Tools

Zero-dependency Bun verification scripts:
- **Anti-Pattern Scanner**: `bun refactor/scripts/audit-ui.ts <file_or_dir>`
- **WCAG Contrast Checker**: `bun refactor/scripts/check-contrast.ts <file_or_dir>`

---

## License

[MIT](LICENSE)
