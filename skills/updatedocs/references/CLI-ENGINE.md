## 🛠️ Automated CLI Engine (`scripts/updatedocs.ts`) & 21-Point Governance Suite

The `updatedocs` skill ships with a high-performance Bun CLI (`scripts/updatedocs.ts`) designed to solve the 21 primary pain points web agencies and software engineering teams face when keeping documentation synchronized:

```bash
# Run comprehensive 21-point documentation audit
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --audit

# Fast pre-commit / CI gate with sub-10ms fast-skip (0 token waste)
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --check

# Audit code environment variables vs .env.example vs README
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --env-audit

# Validate relative markdown links and internal #heading-anchors
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --link-lint

# Check and auto-quote syntax in Mermaid diagram node labels
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --mermaid-guard

# Test syntax of fenced TypeScript, JavaScript, and JSON code snippets
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --test-snippets

# Score answer-first information density and detect conversational AI filler
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --density-check

# Verify zero-drift parity between README.md, llms.txt, and AGENTS.md
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --sync-audience

# Generate a non-technical, client-branded CLIENT_HANDOFF.md guide
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --client-manual

# Sanitize internal tickets (PROJ-123) and secrets from client docs
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --sanitize-jargon

# Synchronize open source licenses in CREDITS.md with package.json
bun skills/core-engine/updatedocs/scripts/updatedocs.ts --credits-sync

# Documentation point ledger: catch up, gate, checkpoint, ship, publish
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --ledger
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --check-points
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --checkpoint
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --release v1.2.0
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --whats-new --audience user
bun skills/core-engine/updatedocs/scripts/updatedocs.ts . --write-changelog --write-client-changelog
```

### The 21 Documentation Quality Invariants
1. **Verified Code Snippets**: Fenced code blocks must pass syntax and brace balance checks (`--test-snippets`).
2. **Environment Variable Parity**: Every `process.env` in code must be present in `.env.example` (`--env-audit`).
3. **CLI Argument Alignment**: Documented CLI flags must match `parseArgs` options byte-for-byte.
4. **API Route Schema Sync**: Backend routes and parameters must match API reference tables.
5. **Accurate Directory Trees**: Architecture ASCII trees in READMEs must mirror disk layout.
6. **Surgical Block Replacements**: Updates must target specific markdown sections, preserving human tone and `git blame`.
7. **Answer-First Density**: Zero conversational AI filler (*"In this guide, we explore..."*). High signal-to-noise ratio (`--density-check`).
8. **Dual-Audience Consistency**: Human docs (`README.md`) and AI context files (`llms.txt`, `AGENTS.md`) must stay in zero-drift sync (`--sync-audience`).
9. **Automated CLI Suite**: Full tooling in `scripts/updatedocs.ts`.
10. **Pre-Commit Fast-Skip Gate**: Sub-10ms `.docs.hash` check skips execution when docs and git are clean (`--fast-skip`), wasting zero tokens.
11. **Markdown Link Integrity**: Zero broken relative links or dead `#anchor-slugs` (`--link-lint`).
12. **Mermaid Diagram Safety**: Flowchart labels with special characters `()` `:` must be quoted (`--mermaid-guard`).
13. **Shield & Badge Parity**: Version and license badges must match `package.json` and release tags.
14. **Cross-Platform Commands**: Commands in docs must provide POSIX and PowerShell compatibility.
15. **Meaningful Docstrings**: JSDocs must explain non-obvious invariants and exceptions, never state the obvious.
16. **Client Non-Technical Manuals**: Standalone, jargon-free `CLIENT_HANDOFF.md` for CMS and marketing teams (`--client-manual`).
17. **Jargon & Secret Defense**: Automated redaction of internal ticket numbers and staging hosts (`--sanitize-jargon`).
18. **SemVer Breaking Change Guardian**: Breaking changes mandate a `### ⚠️ Breaking Changes` entry in `CHANGELOG.md`.
19. **Fresh Clone 5-Minute Test**: README quickstart commands must work from a clean clone without undocumented prerequisites.
20. **Open Source Attribution**: Third-party dependencies must be accurately attributed in `CREDITS.md` (`--credits-sync`).
21. **Documentation Point Ledger**: Every code change that owes docs is a sequential `DP-####` point with developer/user/agent coverage, a documented watermark, and shipped state (`.docs-ledger.json`, `--ledger` / `--checkpoint` / `--check-points`). A cached `.docs.hash` never hides pending points, and `updateagents --docs-backlog` consumes completed agent-facing points.

---
