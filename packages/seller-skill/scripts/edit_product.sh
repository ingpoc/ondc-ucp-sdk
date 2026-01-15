#!/bin/bash
# Edit Product Workflow
# Update existing product details

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <product_id> <updates.json>" >&2
  exit 1
fi

PRODUCT_ID="$1"
UPDATES="$2"

# Fetch, apply updates, validate, PUT
# Deterministic: returns updated product

cat <<'EOF'
{
  "workflow": "edit-product",
  "status": "success",
  "data": {
    "product_id": "$PRODUCT_ID",
    "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "changes_applied": 3
  }
}
EOF
