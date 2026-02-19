#!/usr/bin/env bash
# Check for files exceeding the line limit
# Usage: ./scripts/check-file-line-limits.sh [max_lines]
# Default max_lines: 400

set -e

MAX_LINES=${1:-400}

# Check all TypeScript files for exceeding line limit
LARGE_FILES=$(find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -not -path "./build/*" \
  -not -path "./coverage/*" \
  -exec sh -c '
    lines=$(wc -l < "$1")
    if [ "$lines" -gt '"$MAX_LINES"' ]; then
      echo "$1 ($lines lines)"
    fi
  ' _ {} \; \
  2>/dev/null || true)

if [ -n "$LARGE_FILES" ]; then
  echo "Error: Files exceeding $MAX_LINES lines found:"
  echo "$LARGE_FILES"
  exit 1
else
  echo "✓ All files are within $MAX_LINES line limit"
fi
