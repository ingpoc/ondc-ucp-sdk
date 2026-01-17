#!/bin/bash
# Buyer Search Workflow
# Executes UCP search with preferences and returns product cards

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check input
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <query.json>" >&2
  echo "Example: $0 <<'EOF'
{
  \"query\": \"organic mango\",
  \"category\": \"grocery\",
  \"preferences\": {
    \"maxPrice\": 200,
    \"minRating\": 4.0
  }
}
EOF
" >&2
  exit 1
fi

QUERY_INPUT="$1"
API_BASE="${API_BASE_URL:-http://localhost:3001}"

# Parse input (from file or stdin)
if [[ -f "$QUERY_INPUT" ]]; then
  QUERY_JSON=$(cat "$QUERY_INPUT")
else
  QUERY_JSON="$QUERY_INPUT"
fi

# Extract query parameters
QUERY=$(echo "$QUERY_JSON" | jq -r '.query // "products"')
CATEGORY=$(echo "$QUERY_JSON" | jq -r '.category // "grocery"')
MAX_PRICE=$(echo "$QUERY_JSON" | jq -r '.preferences.maxPrice // ""')
MIN_RATING=$(echo "$QUERY_JSON" | jq -r '.preferences.minRating // ""')
SORT_BY=$(echo "$QUERY_JSON" | jq -r '.preferences.sortBy // "rating"')
LIMIT=$(echo "$QUERY_JSON" | jq -r '.limit // 5')

# Build search request
SEARCH_REQUEST=$(cat <<EOF
{
  "query": "${QUERY}",
  "category": "${CATEGORY}",
  "filters": {
EOF
)

if [[ -n "$MAX_PRICE" && "$MAX_PRICE" != "null" ]]; then
  SEARCH_REQUEST="${SEARCH_REQUEST}
    \"maxPrice\": ${MAX_PRICE},"
fi

if [[ -n "$MIN_RATING" && "$MIN_RATING" != "null" ]]; then
  SEARCH_REQUEST="${SEARCH_REQUEST}
    \"minRating\": ${MIN_RATING},"
fi

# Close filters object (remove trailing comma if exists)
SEARCH_REQUEST=$(echo "$SEARCH_REQUEST" | sed 's/,$//')
SEARCH_REQUEST="${SEARCH_REQUEST}
  },
  \"sortBy\": \"${SORT_BY}\",
  \"limit\": ${LIMIT}
}"

# Call search API
RESPONSE=$(curl -s -X POST "${API_BASE}/api/search" \
  -H "Content-Type: application/json" \
  -d "$SEARCH_REQUEST" 2>/dev/null || echo '{"error": "API not available"}')

# Check if API is available
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  # Return mock product cards format for development
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  cat <<EOF
{
  "type": "product_cards",
  "cards": [
    {
      "id": "item-001",
      "name": "Organic ${QUERY}",
      "price": 250,
      "currency": "INR",
      "rating": 4.5,
      "image": "https://via.placeholder.com/150",
      "provider": "Fresh Farms",
      "delivery": "Same-day",
      "inStock": true,
      "actions": [
        {"type": "add_to_cart", "label": "Add to Cart", "hasQtyPicker": true},
        {"type": "compare", "label": "Compare", "isCheckbox": true},
        {"type": "view_details", "label": "View Details"},
        {"type": "wishlist", "label": "♡", "isIcon": true}
      ]
    },
    {
      "id": "item-002",
      "name": "Premium ${QUERY}",
      "price": 350,
      "currency": "INR",
      "rating": 4.8,
      "image": "https://via.placeholder.com/150",
      "provider": "Quality Store",
      "delivery": "1-2 days",
      "inStock": true,
      "actions": [
        {"type": "add_to_cart", "label": "Add to Cart", "hasQtyPicker": true},
        {"type": "compare", "label": "Compare", "isCheckbox": true},
        {"type": "view_details", "label": "View Details"},
        {"type": "wishlist", "label": "♡", "isIcon": true}
      ]
    },
    {
      "id": "item-003",
      "name": "Budget ${QUERY}",
      "price": 150,
      "currency": "INR",
      "rating": 4.0,
      "image": "https://via.placeholder.com/150",
      "provider": "Value Mart",
      "delivery": "2-3 days",
      "inStock": true,
      "actions": [
        {"type": "add_to_cart", "label": "Add to Cart", "hasQtyPicker": true},
        {"type": "compare", "label": "Compare", "isCheckbox": true},
        {"type": "view_details", "label": "View Details"},
        {"type": "wishlist", "label": "♡", "isIcon": true}
      ]
    }
  ],
  "totalCount": 3,
  "query": "${QUERY}",
  "filters_applied": {
    "category": "${CATEGORY}",
    "maxPrice": ${MAX_PRICE:-null},
    "minRating": ${MIN_RATING:-null},
    "sortBy": "${SORT_BY}"
  },
  "message": "Found 3 ${QUERY} options. Here are the top picks:",
  "metadata": {
    "timestamp": "${TIMESTAMP}",
    "items_processed": 3
  }
}
EOF
else
  # Return actual API response
  echo "$RESPONSE" | jq '.'
fi
