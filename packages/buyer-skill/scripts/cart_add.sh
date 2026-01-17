#!/bin/bash
set -eo pipefail

# cart_add.sh - Add item to cart
# Usage: cart_add.sh <item_id> <quantity> [session_id]

ITEM_ID="${1:?Error: item_id required}"
QUANTITY="${2:-1}"
SESSION_ID="${3:-}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Build request body
REQUEST_BODY=$(cat <<EOF
{
  "itemId": "${ITEM_ID}",
  "quantity": ${QUANTITY}
EOF
)

if [ -n "$SESSION_ID" ]; then
  REQUEST_BODY=$(echo "$REQUEST_BODY" | jq --arg sid "$SESSION_ID" '. + {sessionId: $sid}')
else
  REQUEST_BODY=$(echo "$REQUEST_BODY" | jq '. + {}')
fi

REQUEST_BODY="${REQUEST_BODY}}"

# Call cart add API
RESPONSE=$(curl -s -X POST "${API_BASE}/api/cart" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# Output response
echo "$RESPONSE" | jq '.'
