# Discovery Commands Reference

Quick reference for manual workspace inspection when automated tools are unavailable.

## Command Discovery

### Package.json scripts
```bash
cat package.json | jq '.scripts' 2>/dev/null
grep -A 20 '"scripts"' package.json 2>/dev/null
```

### Makefile targets
```bash
make -n 2>/dev/null || cat Makefile | grep "^[a-zA-Z]" | cut -d: -f1
```

### NPM/Yarn/Pnpm commands
```bash
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
cat package.json | jq -r '.packageManager' 2>/dev/null
```

### Python projects
```bash
cat pyproject.toml | grep -A 10 "\[tool\." 2>/dev/null
cat requirements.txt 2>/dev/null | head -20
cat setup.py 2>/dev/null | grep -A 5 "install_requires"
```

### Go projects
```bash
cat go.mod 2>/dev/null | head -20
go list -m all 2>/dev/null | head -10
```

### Rust projects
```bash
cat Cargo.toml 2>/dev/null | grep -A 10 "\[dependencies\]"
```

## Structure Analysis

### Directory layout
```bash
# Top-level structure
ls -la | grep "^d"

# Source directories
find . -maxdepth 2 -type d -name "src" -o -name "lib" -o -name "app" -o -name "packages"

# Component patterns
find . -name "*.component.*" -o -name "*Component.*" | head -10
```

### File type distribution
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l
find . -type f -name "*.py" | wc -l
find . -type f -name "*.go" | wc -l
find . -type f -name "*.rs" | wc -l
```

## Pattern Detection

### Import/export patterns
```bash
# TypeScript/JavaScript
grep -r "export default\|export const\|export function" src/ --include="*.ts" --include="*.tsx" | head -10

# Python
grep -r "def \|class " src/ --include="*.py" | head -10

# Go
grep -r "func " . --include="*.go" | grep -v "_test.go" | head -10
```

### Testing patterns
```bash
# Test file locations
find . -name "*.test.*" -o -name "*.spec.*" | head -10

# Test framework detection
grep -r "describe\|it(\|test(" . --include="*.test.*" | head -5
grep -r "pytest\|unittest" . --include="*.py" | head -5
```

### Configuration files
```bash
# Common config files
ls .eslintrc* .prettierrc* tsconfig.json vite.config.* next.config.* tailwind.config.* 2>/dev/null

# CI/CD
ls .github/workflows/*.yml .gitlab-ci.yml Jenkinsfile 2>/dev/null
```

## Gotcha Detection

### Environment variables
```bash
grep -r "process.env\|import.meta.env\|os.environ" . --include="*.ts" --include="*.js" --include="*.py" | grep -v node_modules | head -10
cat .env.example .env.template 2>/dev/null
```

### TODOs and FIXMEs
```bash
grep -r "TODO\|FIXME\|HACK\|XXX" . --include="*.ts" --include="*.js" --include="*.py" --include="*.go" | grep -v node_modules | head -10
```

### Deprecated code
```bash
grep -r "@deprecated\|DEPRECATED" . --include="*.ts" --include="*.js" --include="*.py" | head -10
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
