# UCP Protocol Reference

UCP (Unified Commerce Protocol) types and operations for ONDC buyer workflows.

## Key Types

### UCPSearchQuery

```typescript
{
  query?: string;           // Free text search
  category?: string;        // Product category
  location?: UCPLocation;   // Search area
  limit?: number;           // Max results
  priceRange?: { min?, max? };
  minRating?: number;       // 0-5 scale
  preferences?: UCPSearchPreferences;
}
```

### UCPSearchPreferences (Scoring Weights)

```typescript
{
  priceWeight?: number;     // Lower price = higher score
  distanceWeight?: number;  // Closer = higher score
  ratingWeight?: number;    // Higher rating = higher score
  deliveryWeight?: number;  // Faster = higher score
  verifiedBonus?: number;   // Additive for verified sellers
}
```

### UCPItem

```typescript
{
  id: string;
  name: string;
  description?: string;
  price: UCPPrice;
  provider: UCPProvider;
  rating?: UCPRating;
  location?: UCPLocation;
}
```

## Functions

| Function | Purpose |
|----------|---------|
| `ucpToBecknIntent()` | Convert UCP query to Beckn format |
| `becknToUcpCatalog()` | Convert Beckn response to UCP catalog |
| `scoreAndSortItems()` | Rank items by preferences |
| `scoreItem()` | Score single item |

## Search Flow

```
UCPSearchQuery
    ↓
ucpToBecknIntent()
    ↓
Beckn search request
    ↓
ONDC /search endpoint
    ↓
BecknOnSearchResponse (async callback)
    ↓
becknToUcpCatalog()
    ↓
UCPCatalog (items array)
    ↓
scoreAndSortItems()
    ↓
Sorted UCPItem[]
```
