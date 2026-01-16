#!/usr/bin/env bash
set -eo pipefail

# Pre-commit check for problematic ESM imports
# Boris-style: Block recurring dependency issues

echo "🔍 Checking for problematic ESM imports..."

blocked_imports=(
  "from 'libsodium-wrappers'"
  'from "libsodium-wrappers"'
  "from '@ondc/seller-sdk'"
  'from "@ondc/seller-sdk"'
)

issues=0

for file in $(git diff --cached --name-only | grep -E '\.(ts|tsx)$'); do
  for blocked in "${blocked_imports[@]}"; do
    if git show ":$file" 2>/dev/null | grep -q "$blocked"; then
      echo "❌ BLOCKED: $file contains blocked import: $blocked"
      echo "   See .claude/rules/esm-imports.md for workaround"
      issues=$((issues + 1))
    fi
  done
done

if [ $issues -gt 0 ]; then
  echo ""
  echo "❌ Pre-commit check failed: $issues blocked import(s) found"
  echo "   Comment out the import and add a TODO reference to esm-imports.md"
  exit 1
fi

echo "✅ No blocked ESM imports found"
