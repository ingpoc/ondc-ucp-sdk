#!/bin/bash
# feature-commit.sh (ONDC customized)
#
# Purpose: Commit implementation with feature ID for traceability
#
# ONDC Configuration:
# - Uses conventional commits: feat(SCOPE): message, fix(SCOPE): message
# - Scopes: WEBSITE, API, AGENT-001, AGENT-002, etc (from recent commits)
# - Automatically detects scope from changed files
#
# Usage: ./feature-commit.sh <type> <scope> [message]
# Example: ./feature-commit.sh feat WEBSITE "Add product search"
# Example: ./feature-commit.sh fix API "Handle null catalog response"

set -e

COMMIT_TYPE=$1
SCOPE=$2
MESSAGE=$3

if [ -z "$COMMIT_TYPE" ] || [ -z "$SCOPE" ]; then
  echo "Usage: feature-commit.sh <type> <scope> [message]" >&2
  echo "Types: feat, fix, refactor, test, docs, chore" >&2
  echo "Scopes: WEBSITE, API, AGENT-001, AGENT-002, etc" >&2
  exit 1
fi

# Validate commit type
if ! [[ "$COMMIT_TYPE" =~ ^(feat|fix|refactor|test|docs|chore)$ ]]; then
  echo "Error: Invalid commit type '$COMMIT_TYPE'. Must be: feat, fix, refactor, test, docs, chore" >&2
  exit 1
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
  echo "No changes to commit" >&2
  exit 0
fi

# Construct ONDC conventional commit format
COMMIT_MSG="${COMMIT_TYPE}(${SCOPE}): ${MESSAGE:-implementation}"

echo "Committing: $COMMIT_MSG"
git add -A
git commit -m "$COMMIT_MSG"

exit 0
