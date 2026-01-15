---
name: local
description: Quick reference for ondc-ucp-sdk
keywords: quick-ref, commands, state
---

# Quick Reference

## Purpose

ondc-ucp-sdk project

## Commands

| Task | Command |
|------|---------|
| Check state | `~/.claude/skills/orchestrator/scripts/check-state.sh` |
| Run tests | `~/.claude/skills/testing/scripts/run-unit-tests.sh` |
| Health check | `~/.claude/skills/implementation/scripts/health-check.sh` |
| Session entry | `~/.claude/skills/orchestrator/scripts/session-entry.sh` |


## State → Skill

| State | Skill |
|-------|-------|
| INIT | initialization/ |
| IMPLEMENT | implementation/ |
| TEST | testing/ |
| COMPLETE | context-graph/ |

## Config

| File | Purpose |
|------|---------|
| `.claude/config/project.json` | Project settings |
| `.claude/progress/state.json` | Current state |
| `.claude/progress/feature-list.json` | Features |
| `.mcp.json` | MCP servers |

## MCP Tools

**token-efficient**: `execute_code`, `process_csv`, `process_logs`
**context-graph**: `context_store_trace`, `context_query_traces`

## Logging to Context Graph

Any gap found in sdk implementation should be logged in context-graph.
What solution was used to bridge the gap in sdk implementation should also be logged in context-graph
