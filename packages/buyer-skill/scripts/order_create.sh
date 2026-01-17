#!/bin/bash
set -eo pipefail

# order_create.sh - Create order
# Usage: order_create.sh <session_id> <payment_method>

SESSION_ID="${1:?Error: session_id required}"
PAYMENT_METHOD="${2:?Error: payment_method required (COD|UPI|CARD|NETBANKING)}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Validate payment method
case "$PAYMENT_METHOD" in
  COD|UPI|CARD|NETBANKING)
    ;;
  *)
    echo "Error: Invalid payment method. Use COD, UPI, CARD, or NETBANKING" >&2
    exit 1
    ;;
esac

# Build request body
REQUEST_BODY=$(cat <<EOF
{
  "sessionId": "${SESSION_ID}",
  "paymentMethod": "${PAYMENT_METHOD}"
}
EOF
)

# Call order create API
RESPONSE=$(curl -s -X POST "${API_BASE}/api/orders/create" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_BODY")

# Output response
echo "$RESPONSE" | jq '.'
