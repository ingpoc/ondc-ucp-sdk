#!/usr/bin/env bash
set -eo pipefail

# Auto-rebuild api-server when routes change
# Boris-style: Automate "must rebuild after adding routes" pattern

WATCH_DIR="packages/website/api-server/src"

echo "👀 Watching $WATCH_DIR for route changes..."
echo "Press Ctrl+C to stop"
echo ""

last_checksum=""

while true; do
  current_checksum=$(find "$WATCH_DIR" -name "*.ts" -type f -exec sha256sum {} \; | sort | sha256sum | cut -d' ' -f1)

  if [ "$current_checksum" != "$last_checksum" ]; then
    echo "🔄 Route files changed, rebuilding api-server..."
    cd packages/website/api-server
    pnpm build --silent 2>/dev/null || true
    cd ../../../..

    # Check if server is running and needs restart
    if curl -s http://localhost:3001/health >/dev/null 2>&1; then
      echo "✅ Server still running. Manual restart recommended if routes changed."
    fi

    last_checksum="$current_checksum"
  fi

  sleep 2
done
