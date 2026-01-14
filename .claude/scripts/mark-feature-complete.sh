#!/bin/bash
# mark-feature-complete.sh
#
# Purpose: Update feature-list.json with new feature status
#
# Usage: ./mark-feature-complete.sh <feature-id> [status]
# Example: ./mark-feature-complete.sh TYPES-001 implemented
#
# Status values: pending, in_progress, implemented, tested, blocked

set -e

FEATURE_ID=$1
STATUS=${2:-"implemented"}

if [ -z "$FEATURE_ID" ]; then
  echo "Usage: mark-feature-complete.sh <feature-id> [status]" >&2
  echo "Status values: pending, in_progress, implemented, tested, blocked" >&2
  exit 1
fi

FEATURE_FILE=".claude/progress/feature-list.json"

if [ ! -f "$FEATURE_FILE" ]; then
  echo "Error: feature-list.json not found at $FEATURE_FILE" >&2
  exit 1
fi

# Check if feature exists
FEATURE_EXISTS=$(jq -r --arg id "$FEATURE_ID" '.features[] | select(.id == $id) | .id' "$FEATURE_FILE")
if [ -z "$FEATURE_EXISTS" ]; then
  echo "Error: Feature '$FEATURE_ID' not found in feature-list.json" >&2
  exit 1
fi

# Update status using jq
jq --arg id "$FEATURE_ID" --arg status "$STATUS" \
  '(.features[] | select(.id == $id)).status = $status' \
  "$FEATURE_FILE" > "${FEATURE_FILE}.tmp"

# Verify update was successful using jq (not grep - handles JSON formatting)
UPDATED_STATUS=$(jq -r --arg id "$FEATURE_ID" '.features[] | select(.id == $id) | .status' "${FEATURE_FILE}.tmp")
if [ "$UPDATED_STATUS" != "$STATUS" ]; then
  rm "${FEATURE_FILE}.tmp"
  echo "Error: Failed to update feature status (expected '$STATUS', got '$UPDATED_STATUS')" >&2
  exit 1
fi

# Move temp file to replace original
mv "${FEATURE_FILE}.tmp" "$FEATURE_FILE"

echo "Updated $FEATURE_ID status to: $STATUS"
exit 0
