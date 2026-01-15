---
name: seller-skill
description: Use when implementing AI agent workflows for ONDC seller operations: adding products, editing inventory, previewing buyer view, optimizing listings. Load for any seller agent task involving catalog management, product optimization, or search visibility.
keywords: ondc, seller, catalog, inventory, product, optimize, preview, agent, workflow
---

# Seller Skill

AI agent workflows for ONDC seller operations: add, edit, optimize, preview.

## Overview

| Workflow | Purpose |
|----------|---------|
| **add-product** | Add new product to catalog with optimization |
| **edit-product** | Update existing product details |
| **preview** | Preview how product appears in buyer search |
| **optimize** | Suggest improvements for better visibility |

## Quick Reference

| Task | Tool/Script | Description |
|------|-------------|-------------|
| Add product | `scripts/add_product.sh` | Add product with auto-optimization |
| Edit product | `scripts/edit_product.sh` | Update product details |
| Preview search | `scripts/preview_search.sh` | Check buyer visibility |
| Optimize listing | `scripts/optimize_listing.sh` | Improve ranking |

## Workflows

### 1. Add Product Workflow

**Purpose:** Add new product to seller catalog with SEO optimization

**Input:**

```json
{
  "name": "Organic Alphonso Mango",
  "description": "Premium grade A alphonso mangoes from Ratnagiri",
  "price": {
    "currency": "INR",
    "value": "250"
  },
  "category": "grocery",
  "images": ["https://example.com/mango.jpg"]
}
```

**Steps:**

1. Validate required fields (name, price, category)
2. Optimize description for search (add keywords)
3. Generate SEO-friendly product ID
4. Build BecknItem structure
5. POST to /api/catalog/products
6. Return success + preview URL

**Output:**

```json
{
  "workflow": "add-product",
  "status": "success",
  "data": {
    "product_id": "item-abc123",
    "created_at": "2025-01-15T11:50:00Z",
    "preview_url": "/catalog/item-abc123/preview"
  }
}
```

### 2. Edit Product Workflow

**Purpose:** Update existing product details

**Input:**

```json
{
  "product_id": "item-abc123",
  "updates": {
    "price": {"value": "225"},
    "description": "Premium organic alphonso mangoes - 20% discount"
  }
}
```

**Steps:**

1. Fetch existing product
2. Apply updates
3. Re-validate constraints
4. PUT to /api/catalog/products/{id}
5. Return updated product

### 3. Preview Workflow

**Purpose:** Check how product appears in buyer search results

**Input:**

```json
{
  "product_id": "item-abc123",
  "search_query": "organic mango"
}
```

**Steps:**

1. Execute search with product keywords
2. Find product in results
3. Return position + surrounding items
4. Suggest improvements if ranking low

**Output:**

```json
{
  "workflow": "preview",
  "status": "success",
  "data": {
    "position": 3,
    "total_results": 42,
    "above_competition": ["item-xyz", "item-def"],
    "suggestions": [
      "Add 'premium' to description",
      "Lower price by 10% to rank higher"
    ]
  }
}
```

### 4. Optimize Workflow

**Purpose:** Suggest improvements for better search visibility

**Input:**

```json
{
  "product_id": "item-abc123"
}
```

**Steps:**

1. Analyze current product attributes
2. Compare with top-ranking competitors
3. Generate suggestions for:
   - Price adjustments
   - Description keywords
   - Image quality
   - Category selection
4. Return prioritized recommendations

**Deterministic Output:**

```json
{
  "workflow": "optimize",
  "status": "success",
  "data": {
    "current_rank": 8,
    "potential_rank": 3,
    "suggestions": [
      {"action": "lower_price", "impact": "high", "detail": "Reduce by 10% to match competitors"},
      {"action": "add_keywords", "impact": "medium", "detail": "Add 'premium', 'organic' to description"}
    ]
  }
}
```

## Scripts

| Script | Purpose | Args |
|--------|---------|------|
| `add_product.sh` | Add product with optimization | `<product.json>` |
| `edit_product.sh` | Update product details | `<product_id> <updates.json>` |
| `preview_search.sh` | Check search visibility | `<product_id> <query.json>` |
| `optimize_listing.sh` | Generate improvement suggestions | `<product_id>` |

## Response Format

All workflows return deterministic JSON:

```json
{
  "workflow": "add-product|edit-product|preview|optimize",
  "status": "success|partial|error",
  "data": {...},
  "metadata": {
    "timestamp": "2025-01-15T11:50:00Z",
    "product_id": "item-abc123"
  }
}
```

## References

| Resource | Load When |
|----------|-----------|
| `references/catalog-protocol.md` | Product structure |
| `references/seo-optimization.md` | Improving visibility |
| `references/pricing-strategy.md` | Price recommendations |

## Integration

**With API Server:**

- POST /api/catalog/products (add)
- PUT /api/catalog/products/:id (edit)
- GET /api/search (preview ranking)

**With Buyer Skill:**

- Uses search workflow for preview
- Leverages scoring algorithm for optimization
