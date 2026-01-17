#!/bin/bash
set -eo pipefail

# cart_view.sh - View cart contents
# Usage: cart_view.sh [session_id]

SESSION_ID="${1:-}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Build URL with session ID if provided
if [ -n "$SESSION_ID" ]; then
  URL="${API_BASE}/api/cart?sessionId=${SESSION_ID}"
else
  URL="${API_BASE}/api/cart"
fi

# Call cart view API
RESPONSE=$(curl -s -X GET "$URL" \
  -H "Content-Type: application/json")

# Output response
echo "$RESPONSE" | jq '.'
