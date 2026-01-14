#!/bin/bash
# run-tests.sh
#
# Purpose: Run unit tests for TypeScript monorepo using vitest
#
# Usage: ./run-tests.sh [--coverage] [--watch] [filter]
#   --coverage  Generate coverage report
#   --watch     Run in watch mode
#   filter      Optional test file/pattern filter
#
# Exit codes:
#   0 = All tests passed
#   1 = Tests failed

set -eo pipefail

COVERAGE=false
WATCH=false
FILTER=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --coverage)
      COVERAGE=true
      shift
      ;;
    --watch)
      WATCH=true
      shift
      ;;
    -*)
      echo "Usage: $0 [--coverage] [--watch] [filter]"
      exit 1
      ;;
    *)
      FILTER="$1"
      shift
      ;;
  esac
done

EVIDENCE_DIR="/tmp/test-evidence"
TIMESTAMP=$(date +%s)
LOG_FILE="$EVIDENCE_DIR/unit-tests-$TIMESTAMP.log"

# Create evidence directory
mkdir -p "$EVIDENCE_DIR"

echo "=== Running Unit Tests ==="
echo "Evidence log: $LOG_FILE"
echo ""

# Build test command
CMD="pnpm test"

if [ "$WATCH" = true ]; then
  CMD="$CMD -- --watch"
elif [ "$COVERAGE" = true ]; then
  CMD="$CMD -- --coverage --run"
else
  CMD="$CMD -- --run"
fi

if [ -n "$FILTER" ]; then
  CMD="$CMD $FILTER"
fi

echo "Running: $CMD"
echo ""

# Run tests and capture output
if $CMD 2>&1 | tee "$LOG_FILE"; then
  echo ""
  echo "✅ All tests passed"
  echo "Full log: $LOG_FILE"
  exit 0
else
  echo ""
  echo "❌ Tests failed"
  echo "Full log: $LOG_FILE"
  exit 1
fi
