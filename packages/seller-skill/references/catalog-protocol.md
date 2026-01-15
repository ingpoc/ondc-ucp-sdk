# Seller Catalog Protocol

Product catalog structure for ONDC seller operations.

## BecknItem Structure

```typescript
{
  id: string;                    // Unique product ID
  descriptor?: {
    name: string;               // Product name
    short_desc: string;         // Short description
    long_desc?: string;         // Detailed description
    images?: BecknImage[];      // Product images
  };
  price?: {
    currency: string;           // INR, USD, etc.
    value: string;              // Price as string
    maximum_value?: string;     // MRP for discounts
  };
  category_id?: string;          // Category reference
  fulfillment_id?: string;      // Delivery option
  quantity?: {
    available: { value: string };
    maximum: { value: string };
  };
  tags?: BecknTagGroup[];       // Origin, dietary info, etc.
}
```

## Required Fields

| Field | Required | Notes |
|-------|----------|-------|
| id | Yes | Unique across catalog |
| descriptor.name | Yes | Display name |
| descriptor.short_desc | Yes | Searchable description |
| price.currency | Yes | ISO 4217 code |
| price.value | Yes | As string (Beckn spec) |
| category_id | Yes | Maps to taxonomy |

## Tag Examples

```json
{
  "code": "origin",
  "list": [{"code": "country", "value": "India"}]
},
{
  "code": "dietary",
  "list": [{"code": "veg", "value": "yes"}, {"code": "organic", "value": "yes"}]
}
```

## Product ID Format

Recommended: `<category>-<variant>-<hash>`

- Example: `grocery-mango-abc123`
- Example: `fashion-shirt-xyz789`
