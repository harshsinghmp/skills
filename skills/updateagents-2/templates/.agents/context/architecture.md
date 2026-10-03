# 🏗️ Architecture & Workspace Layout — {{PROJECT_NAME}}

## 1. System Topology & Stack
- **Framework & Runtime**: {{FRAMEWORK_DETAILS}}
- **Styling Engine**: {{STYLING_DETAILS}}
- **Animation Layer**: {{ANIMATION_DETAILS}}
- **State Management**: {{STATE_DETAILS}}
- **Mobile Target**: {{MOBILE_DETAILS}}
- **CMS & Commerce**: {{CMS_COMMERCE_DETAILS}}
- **Database & Auth**: {{DATABASE_AUTH_DETAILS}}
- **Deployment**: {{DEPLOYMENT_DETAILS}}

## 2. Directory Structure

```
./
├── AGENTS.md                                # Root agent contract & entry point
├── .memory/                                 # Persistent cognitive memory store
├── .agents/
│   ├── context/                             # Durable project truth files
│   ├── standards/                           # Progressive disclosure rule modules
│   ├── workflows/                           # Phase-based workflow protocols
│   ├── archive/                             # Timestamped retired plans & artifacts
│   ├── research/                            # Deep research briefs, deepwork & scans
│   ├── artifacts/                           # Agent-generated plans & walkthroughs
│   ├── goals/                               # Session goals & sprint milestones
│   └── skills/                              # Installed agent skills
├── docs/                                    # Documentation, specs & blueprints
└── src/                                     # Source code entry points & components
```

## 3. Operational Invariants & Boundaries
1. **Always-Latest Package Resolution**: All dependencies resolve strictly to `@latest`.
2. **Deterministic Quality Gates**: Every merge requires passing tests, clean lint, and secret hygiene check.
3. **Agent Containment Rule**: All agent artifacts, scratchpads, and plans live strictly inside `./.agents/*`.
4. **Secret Defense**: Never commit `.env` or plaintext credentials. Follow the Vibeguard protocol.

## 4. Verification Workflow
- **Tests**: Executed via project test runner (`bun test`, `vitest`, etc.).
- **Build**: Verified production build command.
- **Security**: Pre-ship secret audit via environment secret scanner (e.g. `gitleaks detect` or local audit).
