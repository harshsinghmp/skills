# ⚡ Stage-0 Fast-Skip Protocol

This document specifies the architecture, execution rules, and performance constraints of the **Stage-0 Fast-Skip Gate**.

---

## 🎯 Design Principle: Zero Token Waste

AI agents frequently burn thousands of tokens repeatedly re-reading repository configuration files, re-checking standard templates, and printing lengthy explanations of things that were already correct.

The **Fast-Skip Gate** enforces a binary pre-flight check:
- If a repository is already verified AI-ready, **do not burn tokens**.
- Output a single-line receipt and exit immediately.

---

## ⚡ Execution Mechanism

The gate runs a non-destructive, sub-100ms shell check across the 13 tracked assets:

```bash
#!/usr/bin/env bash
# High-Speed 12-Asset Health Verification

PASS=0
FAIL=0

# 1. Root Router
[ -f "AGENTS.md" ] && [ $(wc -l < "AGENTS.md") -le 50 ] && ((PASS++)) || ((FAIL++))

# 2. DOX Container
[ -d ".agents/standards" ] && [ -d ".agents/context" ] && ((PASS++)) || ((FAIL++))

# 3. Tool / MCP Config (modern agent tool config breadth)
{ [ -f ".mcp.json" ] || [ -d ".gemini" ] || [ -d ".claude" ] || [ -d ".cursor" ]; } && ((PASS++)) || ((FAIL++))

# 4. LLMs Discovery
[ -f "llms.txt" ] && ((PASS++)) || ((FAIL++))

# 5. CI Workflow
[ -d ".github/workflows" ] && ((PASS++)) || ((FAIL++))

# 6. Issue Templates
[ -d ".github/ISSUE_TEMPLATE" ] && ((PASS++)) || ((FAIL++))

# 7. PR Template
[ -f ".github/pull_request_template.md" -o -f ".github/PULL_REQUEST_TEMPLATE.md" ] && ((PASS++)) || ((FAIL++))

# 8. Dependabot
[ -f ".github/dependabot.yml" ] && ((PASS++)) || ((FAIL++))

# 9. Changelog
[ -f "CHANGELOG.md" ] && ((PASS++)) || ((FAIL++))

# 10. Contributing Protocol
[ -f "CONTRIBUTING.md" ] && ((PASS++)) || ((FAIL++))

# 11. Durable Documentation
{ [ -d "docs" ] || [ -d ".agents/context" ]; } && ((PASS++)) || ((FAIL++))

# 12. Secret Hygiene
[ -f ".gitignore" ] && grep -qE "^\.e\[n\]v" .gitignore && [ -f ".env.example" ] && ((PASS++)) || ((FAIL++))

if [ "$PASS" -eq 12 ]; then
  echo "[ai-ready] Repository is AI-ready (13/13). Skipping pass."
  exit 0
else
  echo "[ai-ready] Repository score: $PASS/12. Remediation required."
  exit 1
fi
```

---

## 🛑 Exit Invariants

When the Fast-Skip check succeeds (`PASS == 12`):
1. **Single Line Output**: The agent must output only:
   ```text
   [ai-ready] Repository is AI-ready (13/13). Skipping pass.
   ```
2. **Immediate Turn Termination / Next Task**: The agent immediately moves to the user's primary feature request or command.
3. **No Retrospective Analysis**: Do not explain why the files are compliant, do not re-list the file paths, and do not congratulate the user. Silence is efficiency.
