#!/bin/bash
# restart-servers.sh
#
# Purpose: Build and optionally start dev servers for TypeScript monorepo
#
# Usage: ./restart-servers.sh [--build-only|--watch]
#   --build-only  Only build, don't start watch mode
#   --watch       Start TypeScript in watch mode (default if no flags)
#
# For this SDK project:
# - Builds all packages in the monorepo
# - Optionally watches for changes

set -e

BUILD_ONLY=false
WATCH_MODE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --build-only)
      BUILD_ONLY=true
      shift
      ;;
    --watch)
      WATCH_MODE=true
      shift
      ;;
    *)
      echo "Usage: $0 [--build-only] [--watch]"
      exit 1
      ;;
  esac
done

echo "=== ONDC Agent Gateway Build ==="

# ============================================================================
# Check dependencies
# ============================================================================

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# ============================================================================
# Build all packages
# ============================================================================

echo ""
echo "Building packages..."

if pnpm build 2>&1; then
  echo "✓ Build successful"
else
  echo "✗ Build failed" >&2
  exit 1
fi

# ============================================================================
# Type check
# ============================================================================

echo ""
echo "Running type check..."

if pnpm typecheck 2>&1; then
  echo "✓ Type check passed"
else
  echo "✗ Type check failed" >&2
  exit 1
fi

# ============================================================================
# Optional watch mode
# ============================================================================

if [ "$BUILD_ONLY" = true ]; then
  echo ""
  echo "=== Build completed ==="
  exit 0
fi

if [ "$WATCH_MODE" = true ]; then
  echo ""
  echo "Starting watch mode..."
  echo "Press Ctrl+C to stop"
  pnpm build --watch
fi

echo ""
echo "=== Build completed ==="
echo ""
echo "Available commands:"
echo "  pnpm build      - Build all packages"
echo "  pnpm typecheck  - Type check all packages"
echo "  pnpm test       - Run tests"
echo "  pnpm dev        - Start development mode (when available)"

exit 0
