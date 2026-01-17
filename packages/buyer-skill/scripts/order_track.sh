#!/bin/bash
set -eo pipefail

# order_track.sh - Track order status
# Usage: order_track.sh <order_id>

ORDER_ID="${1:?Error: order_id required}"

API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Call order track API
RESPONSE=$(curl -s -X GET "${API_BASE}/api/orders/${ORDER_ID}/track" \
  -H "Content-Type: application/json")

# Output response
echo "$RESPONSE" | jq '.'
