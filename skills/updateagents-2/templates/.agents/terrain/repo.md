# 🗺️ Terrain Map: Structural AST Tree, LOC Ratios & Entry Points

> **Purpose**: Pre-indexed repository architecture map, entry points, and structural ratios.

---

## 1. Primary Entry Points
- **Application Server**: `src/index.ts` (or `src/app/layout.tsx` / `src/pages/index.astro`)
- **Configuration Root**: `package.json`, `tsconfig.json`
- **Agent Governance Entry**: `AGENTS.md`
- **Testing Root**: `tests/`

## 2. Directory Structure & LOC Ratios
```
.
├── src/               # Application logic & UI components
├── tests/             # Behavioral & regression test suites
├── docs/              # Public product architecture documentation
├── .agents/
│   ├── brand/         # Brand tokens, OKLCH palettes, content map
│   ├── context/       # Local project context & decisions
│   ├── standards/     # Modular engineering standards (DOX)
│   └── terrain/       # Pre-indexed Wave 23 terrain maps
└── scripts/           # Standalone developer automation scripts
```

## 3. Module Boundaries & Data Flow
- Entry request flow traverses from API routes / pages through typed services down to the database schema.
- Components consume tokens from `.agents/brand/tokens/` or UnoCSS/Tailwind theme configuration.
