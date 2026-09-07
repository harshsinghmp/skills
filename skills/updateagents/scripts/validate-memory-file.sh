#!/bin/bash
# validate-memory-file.sh - Validates AGENTS.md structure, size, and boundary compliance

set -euo pipefail

FILE="${1:-AGENTS.md}"

echo "🔍 Validating agent instruction file: $FILE"

# 1. Check file exists
if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# 2. Check file size (<10KB max, <5KB preferred)
SIZE=$(wc -c < "$FILE")
echo "📄 File size: $SIZE bytes"

if [ "$SIZE" -ge 10240 ]; then
  echo "❌ Hard Error: File exceeds 10KB maximum limit ($SIZE bytes)"
  exit 1
elif [ "$SIZE" -ge 5120 ]; then
  echo "⚠️  Warning: File is between 5-10KB (consider trimming)"
else
  echo "✅ File size is within recommended range (<5KB)"
fi

# 3. Check MuseMemory boundary (.memory/** must never be in instruction files)
if grep -q "\.memory/memory\.db" "$FILE" 2>/dev/null; then
  echo "❌ Safety Error: Found raw .memory database references in instruction file"
  exit 1
fi
echo "✅ MuseMemory hard boundary respected"

# 4. Check for Core Invariants or Essential Sections
if grep -q "Core Turn Invariants" "$FILE" || grep -q "DOX Rail" "$FILE" || grep -q "Quick Start" "$FILE"; then
  echo "✅ Recognized governance architecture verified"
else
  echo "⚠️  Notice: Custom governance structure detected"
fi

# 5. Check for accidental credentials/tokens
if grep -iE '(sk-[a-zA-Z0-9]{20,}|ghp_[a-zA-Z0-9]{20,}|BEGIN (RSA|EC|OPENSSH) PRIVATE KEY)' "$FILE" 2>/dev/null; then
  echo "❌ Critical Security Error: Credential pattern detected in instruction file!"
  exit 1
fi
echo "✅ Zero secret leakage verified"

echo "🎉 Validation PASSED for $FILE"
