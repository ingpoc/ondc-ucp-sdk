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
  UNIT_TESTS_PASSED=true
else
  echo ""
  echo "❌ Unit tests failed"
  echo "Full log: $LOG_FILE"
  exit 1
fi

# ============================================================================
# Run API integration tests (if servers are running)
# ============================================================================

echo ""
echo "Checking API endpoints..."

API_TESTS_FAILED=false

# Check health endpoint
if ! curl -s http://localhost:3001/health >/dev/null 2>&1; then
  echo "⚠ API server not running, skipping endpoint tests"
else
  echo "Testing API endpoints..."

  # Test /health
  if curl -s http://localhost:3001/health | grep -q "healthy"; then
    echo "✓ GET /health"
  else
    echo "✗ GET /health failed"
    API_TESTS_FAILED=true
  fi

  # Test /api/search
  if curl -s "http://localhost:3001/api/search?category=grocery&q=test" >/dev/null 2>&1; then
    echo "✓ GET /api/search"
  else
    echo "✗ GET /api/search failed"
    API_TESTS_FAILED=true
  fi

  # Test /api/catalog
  if curl -s http://localhost:3001/api/catalog >/dev/null 2>&1; then
    echo "✓ GET /api/catalog"
  else
    echo "✗ GET /api/catalog failed"
    API_TESTS_FAILED=true
  fi

  # Test POST /api/cart (add item)
  if curl -s -X POST http://localhost:3001/api/cart \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"test-health-check","item":{"id":"test-item","descriptor":{"name":"Test"}},"quantity":1}' \
    >/dev/null 2>&1; then
    echo "✓ POST /api/cart"
  else
    echo "✗ POST /api/cart failed"
    API_TESTS_FAILED=true
  fi

  # Test PUT /api/cart/buyer (update buyer info)
  if curl -s -X PUT http://localhost:3001/api/cart/buyer \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"test-health-check","name":"Test","email":"test@test.com","phone":"+919999999999"}' \
    >/dev/null 2>&1; then
    echo "✓ PUT /api/cart/buyer"
  else
    echo "✗ PUT /api/cart/buyer failed"
    API_TESTS_FAILED=true
  fi

  # Test POST /api/checkout
  if curl -s -X POST http://localhost:3001/api/checkout \
    -H "Content-Type: application/json" \
    -d '{"sessionId":"test-health-check"}' \
    >/dev/null 2>&1; then
    echo "✓ POST /api/checkout"
  else
    echo "✗ POST /api/checkout failed"
    API_TESTS_FAILED=true
  fi
fi

# ============================================================================
# Final result
# ============================================================================

echo ""
if [ "$API_TESTS_FAILED" = true ]; then
  echo "⚠ Some API tests failed"
  exit 1
else
  echo "✅ All tests passed"
  echo "Full log: $LOG_FILE"
  exit 0
fi
