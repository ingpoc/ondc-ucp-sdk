#!/usr/bin/env bash
set -eo pipefail

# Validate API contracts between frontend and backend
# Boris-style: Automate checks for recurring API mismatches

echo "🔍 Validating API contracts..."

frontend_api_calls=$(grep -r "'/api/\|\"/api/" packages/website/buyer/src packages/website/seller/src 2>/dev/null | grep -o "'/api/[^']*\"\|\"/api/[^\"]*\"" | sort -u || true)
backend_routes=$(grep -r "router\.(get\|post\|put\|delete)" packages/website/api-server/src 2>/dev/null | grep -o "'/api/[^']*'" | sort -u || true)

echo "Frontend API calls found:"
echo "$frontend_api_calls"
echo ""
echo "Backend routes defined:"
echo "$backend_routes"
echo ""

# Check for param mismatches
echo "🔍 Checking parameter naming consistency..."

frontend_params=$(grep -r "params.*q\|params.*query" packages/website/buyer/src packages/website/seller/src 2>/dev/null || true)
backend_params=$(grep -r "req\.query\.q\|req\.query\.query" packages/website/api-server/src 2>/dev/null || true)

if echo "$frontend_params" | grep -q "\.q"; then
  if ! echo "$backend_params" | grep -q "req\.query\.q\|req\.query\.query.*=.*req\.query\.q"; then
    echo "⚠️  WARNING: Frontend uses 'q' but backend may not accept it"
    echo "   Backend should accept both 'q' and 'query' for compatibility"
    echo "   See .claude/rules/api-contracts.md"
  fi
fi

echo "✅ API contract validation complete"
