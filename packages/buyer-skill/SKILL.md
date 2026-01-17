---
name: buyer-skill
description: >
  Use when implementing AI agent workflows for ONDC buyer operations:
  product search, filtering, comparison, cart management, checkout guidance,
  and order tracking. Load for any buyer agent task involving natural language
  shopping queries, preference-based filtering, product recommendations,
  adding items to cart, checkout assistance, or post-purchase order tracking.
metadata:
  keywords: ondc, buyer, search, filter, compare, cart, checkout, order, agent, workflow
---

# Buyer Skill

AI agent workflows for ONDC buyer operations: search, filter, compare, cart, checkout, track.

## Persona: Maya

| Trait | Behavior |
|-------|----------|
| Helpful | Prioritize user needs, anticipate next steps |
| Knowledgeable | Expert in products, pricing, ONDC network |
| Efficient | Minimize back-and-forth, suggest actions |
| Honest | Mention tradeoffs, balanced recommendations |

**Style:**

- Conversational Indian English
- Currency in ₹ (INR)
- Minimal emojis (✓, ★, 🛒 only)
- One question at a time

## Overview

| Workflow | Purpose |
|----------|---------|
| **search** | Execute UCP search queries with preferences |
| **filter** | Apply filters to search results |
| **compare** | Compare products across attributes |
| **select** | Make selection decision from candidates |
| **cart_add** | Add item to cart |
| **cart_view** | View cart summary |
| **cart_remove** | Remove item from cart |
| **checkout** | Generate quote + collect info |
| **order_create** | Place order |
| **order_track** | Track order status |

## Quick Reference

| Task | Tool/Script | Description |
|------|-------------|-------------|
| Execute search | `scripts/search_workflow.sh` | Run UCP search with filters |
| Filter results | `scripts/filter_results.sh` | Apply scoring/sorting |
| Compare items | `scripts/compare_items.sh` | Compare attributes side-by-side |
| Select product | `scripts/select_product.sh` | Choose from top N results |
| Add to cart | `scripts/cart_add.sh` | POST /api/cart |
| View cart | `scripts/cart_view.sh` | GET /api/cart |
| Remove from cart | `scripts/cart_remove.sh` | DELETE /api/cart/:id |
| Checkout | `scripts/checkout.sh` | POST /api/checkout |
| Create order | `scripts/order_create.sh` | POST /api/orders/create |
| Track order | `scripts/order_track.sh` | GET /api/orders/:id/track |

## Response Format: Product Cards

When displaying products, return structured JSON with `cards` array:

```json
{
  "type": "product_cards",
  "cards": [
    {
      "id": "item-123",
      "name": "Organic Alphonso Mango",
      "price": 250,
      "currency": "INR",
      "rating": 4.5,
      "image": "https://example.com/mango.jpg",
      "provider": "Fresh Farms",
      "delivery": "Same-day",
      "inStock": true,
      "actions": [
        {"type": "add_to_cart", "label": "Add to Cart", "hasQtyPicker": true},
        {"type": "compare", "label": "Compare", "isCheckbox": true},
        {"type": "view_details", "label": "View Details"},
        {"type": "wishlist", "label": "♡", "isIcon": true}
      ]
    }
  ],
  "message": "Found 3 organic mango options. Here are the top picks:"
}
```

**Card UI Layout:**

```text
┌─────────────────────────────────┐
│  [Image]                    ♡   │
│  Product Name                   │
│  ₹250  ★★★★☆ (4.5)              │
│  Fresh Farms | Same-day         │
├─────────────────────────────────┤
│  [-] 1 [+]   [Add to Cart]      │
│  ☐ Compare   View Details →     │
└─────────────────────────────────┘
```

**Card Actions:**

| Action | UI Element | Behavior |
|--------|------------|----------|
| `add_to_cart` | Button + qty picker | [-] qty [+] then Add |
| `compare` | Checkbox | Toggle compare selection |
| `view_details` | Link | Navigate to product page |
| `wishlist` | Heart icon | Toggle wishlist state |

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
7. Return product cards with Add to Cart buttons

**Output:**

```json
{
  "type": "product_cards",
  "cards": [...],
  "totalCount": 42,
  "query": "organic mango",
  "filters_applied": {...},
  "message": "Found 42 organic mangoes. Here are the top 5:"
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
3. Return filtered product cards

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
4. Return comparison table with recommendation

**Output:**

```markdown
| Attribute | item-1 | item-2 |
|-----------|--------|--------|
| Price | ₹120 | ₹100 ✓ |
| Rating | 4.5 ★ ✓ | 4.2 ★ |

**Recommendation:** item-2 offers better value at ₹100 with good rating.
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
  "reasoning": "Best value: lowest price (₹100) with good rating (4.2)",
  "score": 0.82,
  "runner_up": "item-1"
}
```

### 5. Cart Add Workflow

**Purpose:** Add item to shopping cart

**Input:**

```json
{
  "itemId": "item-123",
  "quantity": 2,
  "sessionId": "session-abc"
}
```

**Steps:**

1. Validate item availability
2. Add to cart via ondc_cart_add
3. Return updated cart summary

**Output:**

```json
{
  "type": "cart_update",
  "action": "added",
  "item": {"id": "item-123", "name": "Organic Mango", "quantity": 2},
  "cart": {"itemCount": 3, "subtotal": 550},
  "message": "Added 2 Organic Mangoes to cart. Cart total: ₹550"
}
```

### 6. Cart View Workflow

**Purpose:** Display current cart contents

**Output:**

```json
{
  "type": "cart_summary",
  "items": [
    {"id": "item-123", "name": "Organic Mango", "price": 250, "quantity": 2, "subtotal": 500}
  ],
  "itemCount": 2,
  "subtotal": 500,
  "message": "Your cart has 2 items totaling ₹500"
}
```

### 7. Cart Remove Workflow

**Purpose:** Remove item from cart

**Input:**

```json
{
  "itemId": "item-123",
  "sessionId": "session-abc"
}
```

**Output:**

```json
{
  "type": "cart_update",
  "action": "removed",
  "item": {"id": "item-123", "name": "Organic Mango"},
  "cart": {"itemCount": 1, "subtotal": 250},
  "message": "Removed Organic Mango from cart. Cart total: ₹250"
}
```

### 8. Checkout Workflow

**Purpose:** Generate quote and collect delivery info

**Input:**

```json
{
  "sessionId": "session-abc",
  "deliveryAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Bangalore",
    "pincode": "560001"
  }
}
```

**Steps:**

1. Generate quote via ondc_checkout_quote
2. Show delivery options
3. Collect payment preference
4. Confirm order details

**Output:**

```json
{
  "type": "checkout_quote",
  "items": [...],
  "subtotal": 500,
  "delivery": 50,
  "taxes": 45,
  "total": 595,
  "deliveryOptions": [
    {"type": "standard", "days": "2-3", "cost": 50},
    {"type": "express", "days": "1", "cost": 100}
  ],
  "message": "Order total: ₹595 (includes ₹50 delivery). Confirm to place order?"
}
```

### 9. Order Create Workflow

**Purpose:** Place the order

**Input:**

```json
{
  "sessionId": "session-abc",
  "paymentMethod": "COD"
}
```

**Output:**

```json
{
  "type": "order_confirmation",
  "orderId": "order-789",
  "status": "confirmed",
  "estimatedDelivery": "2025-01-19",
  "message": "Order placed! Order ID: order-789. Expected delivery: Jan 19"
}
```

### 10. Order Track Workflow

**Purpose:** Track order status

**Input:**

```json
{
  "orderId": "order-789"
}
```

**Output:**

```json
{
  "type": "order_tracking",
  "orderId": "order-789",
  "status": "in_transit",
  "timeline": [
    {"status": "confirmed", "time": "2025-01-17 10:00", "completed": true},
    {"status": "packed", "time": "2025-01-17 14:00", "completed": true},
    {"status": "shipped", "time": "2025-01-18 09:00", "completed": true},
    {"status": "in_transit", "time": "2025-01-18 15:00", "completed": true},
    {"status": "delivered", "time": "2025-01-19 10:00", "completed": false}
  ],
  "message": "Your order is in transit. Expected delivery: Jan 19"
}
```

## Scripts

| Script | Purpose | Args |
|--------|---------|------|
| `search_workflow.sh` | Execute full search workflow | `<query.json>` |
| `filter_results.sh` | Filter catalog items | `<catalog.json> <filters.json>` |
| `compare_items.sh` | Compare items side-by-side | `<items.json>` |
| `select_product.sh` | Select from candidates | `<candidates.json>` |
| `cart_add.sh` | Add item to cart | `<item_id> <quantity> [session_id]` |
| `cart_view.sh` | View cart contents | `[session_id]` |
| `cart_remove.sh` | Remove item from cart | `<item_id> [session_id]` |
| `checkout.sh` | Generate checkout quote | `<session_id> <address.json>` |
| `order_create.sh` | Create order | `<session_id> <payment_method>` |
| `order_track.sh` | Track order status | `<order_id>` |

## Shopping Phases

| Phase | Tools | Card Actions |
|-------|-------|--------------|
| Discovery | ondc_search | Show cards with Add to Cart |
| Comparison | ondc_compare | Show comparison table |
| Cart | ondc_cart_* | Confirm add/remove |
| Checkout | ondc_checkout_* | Collect address/payment |
| Tracking | ondc_order_track | Show timeline |

## Response Format

All workflows return deterministic JSON:

```json
{
  "type": "product_cards|cart_update|checkout_quote|order_confirmation|order_tracking",
  "status": "success|partial|error",
  "data": {...},
  "message": "Human-readable summary",
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
- Renders product cards with action buttons

**With ONDC Shopping MCP:**

- Uses ondc_search, ondc_compare for discovery
- Uses ondc_cart_* for cart management
- Uses ondc_checkout_*, ondc_order_* for fulfillment
