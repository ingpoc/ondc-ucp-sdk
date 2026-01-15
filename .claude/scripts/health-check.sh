#!/bin/bash
# Health check for ondc-agent-gateway monorepo
#
# Purpose: Fast health diagnosis for TypeScript monorepo
#
# Exit codes:
#   0 = healthy
#   1 = broken (shows error immediately)

set -e

GATEWAY_PORT=3000
ISSUES_FOUND=0

echo "=== Health Check ==="

# ============================================================================
# Check infrastructure
# ============================================================================

check_infrastructure() {
  echo ""
  echo "Checking infrastructure..."

  # 1. Node.js version
  if command -v node >/dev/null 2>&1; then
    local node_version=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 20 ]; then
      echo "✗ Node.js version must be >= 20 (current: $(node -v))" >&2
      echo "Fix: nvm install 20 && nvm use 20" >&2
      ISSUES_FOUND=1
    else
      echo "✓ Node.js $(node -v)"
    fi
  else
    echo "✗ Node.js not installed" >&2
    ISSUES_FOUND=1
  fi

  # 2. pnpm
  if command -v pnpm >/dev/null 2>&1; then
    echo "✓ pnpm $(pnpm -v)"
  else
    echo "✗ pnpm not installed" >&2
    echo "Fix: npm install -g pnpm" >&2
    ISSUES_FOUND=1
  fi

  # 3. Disk space
  local disk_usage=$(df -h . | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ "$disk_usage" -gt 90 ]; then
    echo "✗ Disk space critically low: ${disk_usage}% used" >&2
    ISSUES_FOUND=1
  else
    echo "✓ Disk space OK (${disk_usage}% used)"
  fi

  # 4. Check if packages exist (only after initial setup)
  if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
      echo "⚠ Dependencies not installed"
      echo "Fix: pnpm install" >&2
    else
      echo "✓ Dependencies installed"
    fi
  else
    echo "⚠ Project not initialized (no package.json)"
    echo "This is expected for first setup"
  fi

  # Exit if critical issues found
  if [ $ISSUES_FOUND -eq 1 ]; then
    echo "" >&2
    echo "❌ Infrastructure check FAILED" >&2
    exit 1
  fi
}

# Run infrastructure check
check_infrastructure

# ============================================================================
# Check build status (only if packages exist)
# ============================================================================

if [ -f "package.json" ] && [ -d "node_modules" ]; then
  echo ""
  echo "Checking build status..."

  # Check if TypeScript compiles
  if pnpm typecheck 2>/dev/null; then
    echo "✓ TypeScript compiles"
  else
    echo "⚠ TypeScript has errors (run: pnpm typecheck)"
  fi
fi

# ============================================================================
# Check development servers (if running)
# ============================================================================

echo ""
echo "Checking development servers..."

# Check API server (port 3001)
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
  echo "✓ API server (3001)"
else
  echo "⚠ API server (3001) not responding (run: pnpm dev)"
fi

# Check Buyer webapp (port 3000)
if curl -s http://localhost:3000 >/dev/null 2>&1; then
  echo "✓ Buyer webapp (3000)"
else
  echo "⚠ Buyer webapp (3000) not responding (run: pnpm dev)"
fi

# Check Seller webapp (port 3002)
if curl -s http://localhost:3002 >/dev/null 2>&1; then
  echo "✓ Seller webapp (3002)"
else
  echo "⚠ Seller webapp (3002) not responding (run: pnpm dev)"
fi

# ============================================================================
# Final result
# ============================================================================

echo ""
echo "✅ Health check passed"
exit 0
