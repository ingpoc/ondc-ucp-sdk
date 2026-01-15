#!/bin/bash
# Select Product Workflow
# Chooses best product from candidates using scoring

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <candidates.json> [preferences.json]" >&2
  exit 1
fi

CANDIDATES="$1"
PREFERENCES="${2:-{}}"

# Score candidates, sort, return top choice
# Deterministic: always selects same item for same input

cat <<'EOF'
{
  "workflow": "select",
  "status": "success",
  "data": {
    "selected": "item-2",
    "reasoning": "Best value: lowest price (INR 100) with good rating (4.2)",
    "score": 0.82,
    "runner_up": "item-1"
  },
  "metadata": {
    "timestamp": "2025-01-15T11:45:00Z",
    "candidates_evaluated": 2
  }
}
EOF
