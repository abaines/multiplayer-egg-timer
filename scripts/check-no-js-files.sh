#!/usr/bin/env bash
# Check for unauthorized JavaScript files in the repository
# Usage: ./scripts/check-no-js-files.sh

set -e

# Find all .js files excluding allowed ones
JS_FILES=$(find . -type f -name "*.js" \
  -not -path "./node_modules/*" \
  -not -path "./dist/*" \
  -not -path "./build/*" \
  -not -path "./coverage/*" \
  -not -path "./scripts/generate-version.js" \
  -not -name "*.config.js" \
  -not -name ".eslintrc.js" \
  2>/dev/null || true)

if [ -n "$JS_FILES" ]; then
  echo "Error: JavaScript files are not allowed in this project (except config files)."
  echo "Found the following .js files:"
  echo "$JS_FILES"
  exit 1
else
  echo "✓ No unauthorized JavaScript files found"
fi
