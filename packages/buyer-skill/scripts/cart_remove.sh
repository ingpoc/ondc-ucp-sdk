#!/bin/bash
set -eo pipefail

# cart_remove.sh - Remove item from cart
# Usage: cart_remove.sh <item_id> [session_id]

ITEM_ID="${1:?Error: item_id required}"
SESSION_ID="${2:-}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Build URL with session ID if provided
if [ -n "$SESSION_ID" ]; then
  URL="${API_BASE}/api/cart/${ITEM_ID}?sessionId=${SESSION_ID}"
else
  URL="${API_BASE}/api/cart/${ITEM_ID}"
fi

# Call cart remove API
RESPONSE=$(curl -s -X DELETE "$URL" \
  -H "Content-Type: application/json")

# Output response
echo "$RESPONSE" | jq '.'
