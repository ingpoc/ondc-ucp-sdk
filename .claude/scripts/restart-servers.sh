#!/bin/bash
# restart-servers.sh
#
# Purpose: Restart dev servers for ondc-agent-gateway
#
# Restarts:
# - API server (port 3001)
# - Seller webapp (port 3002)
# - Buyer webapp (port 3000)

echo "=== Restarting ONDC Servers ==="

# Clear Vite cache (solves stale cache issues)
echo "Clearing Vite cache..."
rm -rf /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/seller/.vite
rm -rf /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/buyer/.vite
rm -rf /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/seller/node_modules/.vite
rm -rf /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/buyer/node_modules/.vite

# Kill existing processes
echo "Stopping servers..."
pkill -f "node.*api-server" || true
pkill -f "node.*seller" || true
pkill -f "node.*buyer" || true
sleep 1

# Start API server
echo "Starting API server (port 3001)..."
cd /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/api-server
node dist/index.js > /tmp/api-server.log 2>&1 &
API_PID=$!
sleep 2

# Start seller webapp
echo "Starting seller webapp (port 3002)..."
cd /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/seller
npm run dev > /tmp/seller.log 2>&1 &
SELLER_PID=$!
sleep 2

# Start buyer webapp
echo "Starting buyer webapp (port 3000)..."
cd /Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/packages/website/buyer
npm run dev > /tmp/buyer.log 2>&1 &
BUYER_PID=$!
sleep 2

# Verify servers started
echo ""
echo "Verifying servers..."
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
  echo "✓ API server (3001) running"
else
  echo "✗ API server failed to start"
  cat /tmp/api-server.log
  exit 1
fi

if curl -s http://localhost:3002/ >/dev/null 2>&1; then
  echo "✓ Seller webapp (3002) running"
else
  echo "✗ Seller webapp failed to start"
  cat /tmp/seller.log
  exit 1
fi

if curl -s http://localhost:3000/ >/dev/null 2>&1; then
  echo "✓ Buyer webapp (3000) running"
else
  echo "✗ Buyer webapp failed to start"
  cat /tmp/buyer.log
  exit 1
fi

echo ""
echo "✅ All servers restarted successfully"
exit 0
