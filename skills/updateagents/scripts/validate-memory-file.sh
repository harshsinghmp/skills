#!/bin/bash
# validate-memory-file.sh - Validates AGENTS.md/CLAUDE.md structure and size

set -euo pipefail

FILE="${1:-AGENTS.md}"

# Check file exists
if [ ! -f "$FILE" ]; then
  echo "❌ File not found: $FILE"
  exit 1
fi

# Check file size
SIZE=$(wc -c < "$FILE")
echo "📄 File size: $SIZE bytes"

if [ "$SIZE" -gt 10240 ]; then
  echo "⚠️  WARNING: File exceeds 10KB recommended maximum"
elif [ "$SIZE" -gt 5120 ]; then
  echo "ℹ️  File is between 5-10KB (consider trimming)"
else
  echo "✅ File size is within recommended range"
fi

# Check for required sections
REQUIRED_SECTIONS=("Quick Start" "Architecture" "Conventions" "Testing" "Gotchas")
MISSING=()

for section in "${REQUIRED_SECTIONS[@]}"; do
  if ! grep -q "$section" "$FILE"; then
    MISSING+=("$section")
  fi
done

if [ ${#MISSING[@]} -eq 0 ]; then
  echo "✅ All required sections present"
else
  echo "⚠️  Missing sections: ${MISSING[*]}"
fi

# Check for commands (backtick-wrapped)
COMMANDS=$(grep -o '`[^`]*`' "$FILE" | wc -l)
echo "📋 Found $COMMANDS inline code blocks (likely commands)"

if [ "$COMMANDS" -lt 3 ]; then
  echo "⚠️  Low command count - may be missing essential commands"
fi

# Check for last updated timestamp
if grep -q "Last updated\|Updated:" "$FILE"; then
  echo "✅ Contains update timestamp"
else
  echo "ℹ️  No update timestamp found (recommended to add)"
fi

echo ""
echo "Validation complete"
