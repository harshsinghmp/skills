# Discovery Commands Reference

Quick reference for manual workspace inspection when automated tools are unavailable.

## Command Discovery

### Package.json scripts
```bash
# Modern: gojq or jq
gojq '.scripts' package.json 2>/dev/null || jq '.scripts' package.json 2>/dev/null || rg -A 20 '"scripts"' package.json
```

### Makefile targets
```bash
make -n 2>/dev/null || rg "^[a-zA-Z]" Makefile | choose 0 -d: 2>/dev/null || cat Makefile | grep "^[a-zA-Z]" | cut -d: -f1
```

### NPM/Yarn/Pnpm commands
```bash
fd -d 1 "^(package-lock\.json|yarn\.lock|pnpm-lock\.yaml)$" || ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
gojq -r '.packageManager' package.json 2>/dev/null || jq -r '.packageManager' package.json 2>/dev/null
```

### Python projects
```bash
rg -A 10 "\[tool\." pyproject.toml 2>/dev/null || grep -A 10 "\[tool\." pyproject.toml 2>/dev/null
bat requirements.txt 2>/dev/null | head -20 || head -20 requirements.txt 2>/dev/null
rg -A 5 "install_requires" setup.py 2>/dev/null || grep -A 5 "install_requires" setup.py
```

### Go projects
```bash
bat go.mod 2>/dev/null | head -20 || head -20 go.mod 2>/dev/null
go list -m all 2>/dev/null | head -10
```

### Rust projects
```bash
rg -A 10 "\[dependencies\]" Cargo.toml 2>/dev/null || grep -A 10 "\[dependencies\]" Cargo.toml
```

## Structure Analysis

### Directory layout
```bash
# Top-level structure (modern: eza tree/dirs or classic ls)
eza -D 2>/dev/null || ls -la | grep "^d"

# Source directories
fd -t d -d 2 "^(src|lib|app|packages)$" || find . -maxdepth 2 -type d -name "src" -o -name "lib" -o -name "app" -o -name "packages"

# Component patterns
fd "([cC]omponent|\.component\.)" | head -10 || find . -name "*.component.*" -o -name "*Component.*" | head -10
```

### File type distribution
```bash
fd -e ts -e tsx -e js -e jsx | wc -l
fd -e py | wc -l
fd -e go | wc -l
fd -e rs | wc -l
```

## Pattern Detection

### Import/export patterns
```bash
# TypeScript/JavaScript
rg "export (default|const|function)" src/ -g "*.ts" -g "*.tsx" | head -10

# Python
rg "(def |class )" src/ -g "*.py" | head -10

# Go
rg "func " . -g "*.go" -g "!*_test.go" | head -10
```

### Testing patterns
```bash
# Test file locations
fd "(\.test\.|\.spec\.)" | head -10

# Test framework detection
rg "describe\(|it\(|test\(" . -g "*.test.*" -g "*.spec.*" | head -5
rg "(pytest|unittest)" . -g "*.py" | head -5
```

### Configuration files
```bash
# Common config files
fd -d 1 "^(\.eslintrc|\.prettierrc|tsconfig\.json|vite\.config|next\.config|tailwind\.config)"

# CI/CD
fd "\.(yml|yaml)$" .github/workflows/
```

## Gotcha Detection

### Environment variables
```bash
rg "(process\.env|import\.meta\.env|os\.environ)" . -g "*.ts" -g "*.js" -g "*.py" | head -10
bat .env.example .env.template 2>/dev/null || cat .env.example .env.template 2>/dev/null
```

### TODOs and FIXMEs
```bash
rg "(TODO|FIXME|HACK|XXX)" . -g "*.ts" -g "*.js" -g "*.py" -g "*.go" | head -10
```

### Deprecated code
```bash
rg "(@deprecated|DEPRECATED)" . -g "*.ts" -g "*.js" -g "*.py" | head -10
```

## Integration Tool Commands

### cavemem
```bash
cavemem extract --format markdown
cavemem list --recent 10
cavemem search "build command"
```

### codegraph
```bash
codegraph analyze --format markdown
codegraph dependencies
codegraph architecture
```

### rtk
```bash
rtk scan --full
rtk conventions
rtk commands
```

### memoryagent
```bash
memoryagent capture --scope workspace
memoryagent list --workspace
memoryagent export --format markdown
```

### ponytail
```bash
ponytail extract --workspace
ponytail recent --limit 20
ponytail context --format markdown
```
