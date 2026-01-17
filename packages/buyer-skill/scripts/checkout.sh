#!/bin/bash
set -eo pipefail

# checkout.sh - Generate checkout quote
# Usage: checkout.sh <session_id> <address.json>

SESSION_ID="${1:?Error: session_id required}"
ADDRESS_FILE="${2:?Error: address.json file required}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Read address from file
if [ ! -f "$ADDRESS_FILE" ]; then
  echo "Error: Address file not found: $ADDRESS_FILE" >&2
  exit 1
fi

ADDRESS=$(cat "$ADDRESS_FILE")

# Build request body
REQUEST_BODY=$(cat <<EOF
{
  "sessionId": "${SESSION_ID}",
  "deliveryAddress": ${ADDRESS}
}
EOF
)

# Call checkout API
RESPONSE=$(curl -s -X POST "${API_BASE}/api/checkout/quote" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# Output response
echo "$RESPONSE" | jq '.'
