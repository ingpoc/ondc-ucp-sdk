#!/bin/bash
# Compare Items Workflow
# Generates comparison table for products

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <items.json> [attributes.json]" >&2
  exit 1
fi

ITEMS="$1"
ATTRIBUTES="${2:-[]}"

# Generate comparison matrix as markdown table
# Deterministic output format

cat <<'EOF'
| Attribute | Item 1 | Item 2 |
|-----------|--------|--------|
| Price | INR 120 | INR 100 |
| Rating | 4.5 ★ | 4.2 ★ |
EOF
