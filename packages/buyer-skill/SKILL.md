---
name: buyer-skill
description: Use when implementing AI agent workflows for ONDC buyer operations: product search, filtering, comparison, and selection decisions. Load for any buyer agent task involving search queries, preference-based filtering, or product comparison logic.
metadata:
  keywords: ondc, buyer, search, filter, compare, agent, workflow, preferences, ucp
---

# Buyer Skill

AI agent workflows for ONDC buyer operations: search, filter, compare, select.

## Overview

| Workflow | Purpose |
|----------|---------|
| **search** | Execute UCP search queries with preferences |
| **filter** | Apply filters to search results |
| **compare** | Compare products across attributes |
| **select** | Make selection decision from candidates |

## Quick Reference

| Task | Tool/Script | Description |
|------|-------------|-------------|
| Execute search | `scripts/search_workflow.sh` | Run UCP search with filters |
| Filter results | `scripts/filter_results.sh` | Apply scoring/sorting |
| Compare items | `scripts/compare_items.sh` | Compare attributes side-by-side |
| Select product | `scripts/select_product.sh` | Choose from top N results |

## Workflows

### 1. Search Workflow

**Purpose:** Execute product search with buyer preferences

**Input:**

```json
{
  "query": "organic mango",
  "category": "grocery",
  "preferences": {
    "maxPrice": 200,
    "minRating": 4.0,
    "sortBy": "price"
  },
  "location": {
    "latitude": 12.97,
    "longitude": 77.59
  }
}
```

**Steps:**

1. Build UCPSearchQuery from input
2. Call ucpToBecknIntent() to translate
3. Execute ONDC /search via ONDCClient
4. Wait for on_search callback
5. Translate becknToUcpCatalog()
6. Apply scoreAndSortItems()
7. Return top N results

**Output:**

```json
{
  "items": [...],
  "totalCount": 42,
  "query": "organic mango",
  "filters_applied": {...}
}
```

### 2. Filter Workflow

**Purpose:** Narrow down search results with constraints

**Input:**

```json
{
  "items": [...],
  "filters": {
    "priceRange": {"max": 150},
    "verifiedOnly": true,
    "deliveryDays": {"max": 2}
  }
}
```

**Steps:**

1. Parse UCPCatalog items
2. Apply each filter sequentially
3. Return filtered subset

### 3. Comparison Workflow

**Purpose:** Compare products across key attributes

**Input:**

```json
{
  "items": [
    {"id": "item-1", "price": {"value": "120"}, "rating": {"value": 4.5}},
    {"id": "item-2", "price": {"value": "100"}, "rating": {"value": 4.2}}
  ],
  "attributes": ["price", "rating", "delivery"]
}
```

**Steps:**

1. Extract attributes for each item
2. Build comparison matrix
3. Highlight differences
4. Return comparison table

**Output:**

```markdown
| Attribute | item-1 | item-2 |
|-----------|--------|--------|
| Price | INR 120 | INR 100 |
| Rating | 4.5 ★ | 4.2 ★ |
```

### 4. Selection Workflow

**Purpose:** Choose best product from candidates

**Input:**

```json
{
  "candidates": [...],
  "preferences": {...}
}
```

**Steps:**

1. Score each candidate with scoreItem()
2. Sort by score descending
3. Return top choice + reasoning

**Deterministic Output:**

```json
{
  "selected": "item-2",
  "reasoning": "Best value: lowest price (INR 100) with good rating (4.2)",
  "score": 0.82,
  "runner_up": "item-1"
}
```

## Scripts

| Script | Purpose | Args |
|--------|---------|------|
| `search_workflow.sh` | Execute full search workflow | `<query.json>` |
| `filter_results.sh` | Filter catalog items | `<catalog.json> <filters.json>` |
| `compare_items.sh` | Compare items side-by-side | `<items.json>` |
| `select_product.sh` | Select from candidates | `<candidates.json>` |

## Response Format

All workflows return deterministic JSON:

```json
{
  "workflow": "search|filter|compare|select",
  "status": "success|partial|error",
  "data": {...},
  "metadata": {
    "timestamp": "2025-01-15T11:45:00Z",
    "items_processed": 42
  }
}
```

## References

| Resource | Load When |
|----------|-----------|
| `references/ucp-protocol.md` | Implementing search/filter |
| `references/scoring-algorithm.md` | Understanding preferences |
| `references/decision-framework.md` | Making selections |

## Integration

**With Gateway:**

- Uses ONDCClient from @ondc-agent/shared
- Translates via ucpToBecknIntent()
- Receives BecknOnSearchResponse

**With Website:**

- Provides agent-powered search enhancement
- Adds preference-based auto-filtering
- Enables "buy it for me" functionality
