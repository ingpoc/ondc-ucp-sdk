---
name: local
description: Quick reference - ONDC monorepo dev servers and scripts
keywords: quick-ref, scripts, monorepo, vite
---

# Quick Reference

## Dev Servers & Commands

| Task | Command |
|------|---------|
| Start servers | `pnpm dev` (all 3 ports) |
| Run tests | `.claude/scripts/run-tests.sh` |
| Health check | `.claude/scripts/health-check.sh` |
| Restart servers | `.claude/scripts/restart-servers.sh` |
| Check state | `.claude/scripts/check-state.sh` |
| Commit | `.claude/scripts/feature-commit.sh feat SCOPE "msg"` |

## State Machine

| State | Next | Trigger |
|-------|------|---------|
| START | INIT | Project setup complete |
| INIT | IMPLEMENT | Features defined |
| IMPLEMENT | TEST | Code implemented |
| TEST | COMPLETE | All tests pass |

## Key Paths

| File | Purpose |
|------|---------|
| `.claude/config/project.json` | Project config (pnpm, ports) |
| `.claude/progress/state.json` | Current state |
| `.claude/progress/feature-list.json` | Features to implement |

## MCP Tools

| Tool | Use For |
|------|---------|
| `execute_code` | Sandbox Python/Bash/Node (98% savings) |
| `process_csv` | CSV processing (99% savings) |
| `process_logs` | Log analysis (95% savings) |
| `context_store_trace` | Store decisions |
| `context_query_traces` | Find similar decisions |
