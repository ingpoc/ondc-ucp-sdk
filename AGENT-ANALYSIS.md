# ONDC Agent SDK: Phase 1 vs Phase 2 Analysis

**Purpose**: Compare direct SDK usage (Phase 1) vs AI Agent workflows (Phase 2) to determine optimal boundaries.

## Phase 1: Direct SDK Usage

### What Works Well

| Use Case | Why Direct SDK |
|----------|----------------|
| **Simple CRUD** | `/api/catalog/*` - straightforward data operations |
| **Health checks** | Status endpoints with no logic |
| **Basic search** | Category filter + pagination |
| **Mock catalog** | In-memory POC data store |
| **Type safety** | Full TypeScript types throughout |

### Limitations

| Limitation | Impact |
|------------|--------|
| **No optimization** | Can't suggest price changes or SEO improvements |
| **No workflow** | Each call is independent, no multi-step reasoning |
| **No learning** | Doesn't remember previous decisions |
| **No flexibility** | Exact inputs required, no natural language |
| **No analysis** | Can't compare products or explain recommendations |

## Phase 2: AI Agent Workflows

### What Works Well

| Use Case | Why Agent |
|----------|-----------|
| **Complex queries** | "Find organic mangoes under ₹500" → structured search |
| **Multi-step workflows** | Search → compare → select in one conversation |
| **Catalog optimization** | SEO + pricing analysis with recommendations |
| **Natural language** | Users describe needs, agent translates to API calls |
| **Tool composition** | Combines multiple MCP tools (search, scoring, context-graph) |

### Limitations

| Limitation | Impact |
|------------|--------|
| **Latency** | Agent orchestration adds overhead |
| **Cost** | Per-token pricing for all agent operations |
| **Non-deterministic** | Responses vary, harder to test |
| **Overkill** | Simple CRUD doesn't need LLM reasoning |

## Decision Matrix

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| Product CRUD | **Direct SDK** | Simple operations, deterministic |
| Search with filters | **Direct SDK** | Well-defined inputs, fast response |
| Product comparison | **Agent** | Needs analysis and explanation |
| Pricing optimization | **Agent** | Requires market analysis and reasoning |
| SEO suggestions | **Agent** | Content generation + semantic understanding |
| Catalog preview | **Agent** | Ranking analysis requires multi-step logic |
| Health/status | **Direct SDK** | No reasoning needed |
| Session management | **Agent** | Maintains context across turns |

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
├─────────────────────────────────────────────────────────────┤
│  Direct API Endpoints          │        Agent Endpoints      │
│  ┌─────────────────────────┐   │   ┌──────────────────────┐ │
│  │ GET/POST/PUT/DELETE     │   │   │ POST /api/agent/*    │ │
│  │ /api/catalog/*          │   │   │ - buyer              │ │
│  │ /api/search             │   │   │ - seller             │ │
│  │ /health                 │   │   │ - Streaming SSE      │ │
│  └─────────────────────────┘   │   └──────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ONDC SDK Layer (Shared)                                    │
│  - Types (Beckn, UCP)                                       │
│  - Scoring algorithms                                       │
│  - Protocol converters                                      │
├─────────────────────────────────────────────────────────────┤
│  Agent Layer (Claude Agent SDK + MCP)                       │
│  - buyer-skill, seller-skill                               │
│  - token-efficient MCP                                      │
│  - context-graph MCP                                        │
└─────────────────────────────────────────────────────────────┘
```

## Boundary Guidelines

### Use Direct SDK When

- Operation is CRUD (create, read, update, delete)
- Inputs/outputs are well-defined and typed
- Performance is critical
- Deterministic behavior required
- No reasoning or analysis needed

### Use Agent When

- Natural language input required
- Multi-step workflow needed
- Content generation (descriptions, SEO)
- Analysis or comparison required
- Recommendations needed
- Context from previous decisions helps

## Implementation Status

| Component | Type | Endpoint/Feature |
|-----------|------|------------------|
| Catalog CRUD | Direct SDK | `/api/catalog/*` |
| Search | Direct SDK | `/api/search` |
| Buyer Agent | Agent | `/api/agent/buyer` |
| Seller Agent | Agent | `/api/agent/seller` |
| Health Check | Direct SDK | `/health` |
| ONDC Callback | Direct SDK | `/on_search` |
| Chat UI | Client | `AgentChat` component |

## Next Steps

1. **Keep direct SDK** for all catalog operations
2. **Expand agent capabilities** for:
   - Competitor price analysis
   - SEO content generation
   - Inventory optimization
   - Sales trend analysis
3. **Add agent tools** for:
   - Direct catalog read access
   - Analytics data processing
   - Report generation
