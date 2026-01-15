---
name: ondc-ucp-sdk
description: ONDC UCP SDK - TypeScript monorepo for buyer/seller webapps and gateway
keywords: typescript, monorepo, vite, react, pnpm, ondc
project_type: typescript-monorepo
framework: node
language: TypeScript
---

# ondc-ucp-sdk

**Purpose**: ONDC UCP SDK monorepo with buyer/seller webapps (Vite/React) and API gateway.

---

## Project Overview

| Aspect | Details |
|--------|---------|
| **Type** | TypeScript monorepo |
| **Framework** | Node.js + Vite/React |
| **Language** | TypeScript |
| **Package Manager** | pnpm |
| **Dev Servers** | API (3001), Buyer (3000), Seller (3002) |

---

## Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript |
| Runtime | Node.js + pnpm |
| Frontends | React + Vite |
| Backend | Node.js API gateway |
| Build | Vite (dev), tsc/esbuild (production) |

### Project Structure

| Directory | Purpose |
|-----------|---------|
| `packages/website/api-server` | Express/Node API gateway (port 3001) |
| `packages/website/buyer` | Buyer webapp - Vite/React (port 3000) |
| `packages/website/seller` | Seller webapp - Vite/React (port 3002) |
| `packages/gateway` | SDK gateway package |
| `packages/seller-sdk` | Seller SDK |
| `packages/shared` | Shared utilities |
| `.claude/` | Claude Code configuration |
| `.claude/config/` | Project settings (auto-detected) |
| `.claude/progress/` | State tracking |
| `.claude/scripts/` | Automation scripts (customized for ONDC) |

---

## Common Commands

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Start dev servers | `pnpm dev` |
| Run tests | `pnpm test` |
| Run tests with coverage | `pnpm test -- --coverage` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| Build | `pnpm build` |
| Restart servers | `.claude/scripts/restart-servers.sh` |
| Health check | `.claude/scripts/health-check.sh` |
| Check state | `.claude/scripts/check-state.sh` |
| Get current feature | `.claude/scripts/get-current-feature.sh` |

---

## Development Servers

| Server | Port | Purpose | Start |
|--------|------|---------|-------|
| API Gateway | 3001 | Backend API | `pnpm dev` from api-server/ |
| Buyer Webapp | 3000 | Buyer UI | `pnpm dev` from buyer/ |
| Seller Webapp | 3002 | Seller UI | `pnpm dev` from seller/ |

**Start all:** `pnpm dev` from monorepo root

---

## Testing

| Type | Command | Coverage |
|------|---------|----------|
| Unit tests | `pnpm test` | `.claude/scripts/run-tests.sh` |
| Unit tests (watch) | `pnpm test -- --watch` | - |
| Unit tests (coverage) | `pnpm test -- --coverage --run` | - |
| API endpoints | `curl http://localhost:3001/health` | Health check script |

---

## Automation Scripts

All customized for ONDC monorepo:

| Script | Purpose | Notes |
|--------|---------|-------|
| `health-check.sh` | Verify Node/pnpm/disk + dev servers | Checks all 3 ports |
| `run-tests.sh` | Run unit tests + API endpoint tests | Skips endpoints if servers down |
| `restart-servers.sh` | Stop/clear Vite cache/start servers | Clears .vite directories |
| `feature-commit.sh` | Commit with conventional format | `feat(SCOPE)`, `fix(SCOPE)` |
| `check-state.sh` | Get current state | From state.json |
| `get-current-feature.sh` | Get next pending feature | From feature-list.json |

---

## MCP Servers

### token-efficient MCP

**Use for**: Data processing >50 items, CSV/logs, code execution

| Tool | Use For | Savings |
|------|---------|---------|
| `execute_code` | Python/Bash/Node in sandbox | 98%+ |
| `process_csv` | CSV with filters | 99% |
| `process_logs` | Log pattern matching | 95% |

### context-graph MCP

**Use for**: Decision traces, semantic search, learning loops

| Tool | Purpose |
|------|---------|
| `context_store_trace` | Store decision with category + outcome |
| `context_query_traces` | Semantic search for similar decisions |
| `context_update_outcome` | Mark success/failure after implementation |

---

## Config Files

| File | Purpose |
|------|---------|
| `.claude/config/project.json` | Project settings (TypeScript monorepo) |
| `.claude/CLAUDE.md` | Quick reference (this file) |
| `.claude/progress/state.json` | Current state (INIT/IMPLEMENT/TEST/COMPLETE) |
| `.claude/progress/feature-list.json` | Feature list with status tracking |
| `.mcp.json` | MCP server configuration |
