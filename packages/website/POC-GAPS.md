# Website POC Testing & SDK Gap Analysis

## Testing Results

### Buyer Webapp (port 3000)

- **SearchPage**: Category dropdown + query input ✓
- **ResultsPage**: Displays products from /api/search ✓
- **ProductDetailPage**: Shows product details ✓
- **Components**: SearchBar, FilterSidebar, SortDropdown, ResultGrid ✓

### Seller Webapp (port 3002)

- **DashboardPage**: Stats display + quick actions ✓
- **CatalogPage**: Product list with edit/delete ✓
- **ProductEditPage**: Add/edit form ✓
- **Components**: ProductForm, InventoryTable, SearchPreview ✓

## SDK Gaps Identified

### 1. SellerClient (packages/seller-sdk/src/client.ts)

```typescript
async sendRequest(_request: unknown): Promise<unknown> {
  // TODO: Implement ONDC protocol client
  return {};  // ← Returns empty object
}
```

**Missing:**

- ONDC protocol implementation (signing, headers, context building)
- search() method for ONDC /search endpoint
- select(), init(), confirm() methods for order flow

### 2. API Server (packages/website/api-server/src/index.ts)

```typescript
// TODO: Implement ONDC search via SellerClient
const catalog = becknToUcpCatalog({
  // ... empty mock response
});
```

**Missing:**

- Integration with MockGateway for testing
- Async callback handling for ONDC protocol
- Connection to SellerClient for network calls

### 3. Search API (packages/website/api-server/src/index.ts:57)

```typescript
app.get('/api/search', async (req, res) => {
  // Returns empty catalog - no actual search
  const catalog = becknToUcpCatalog({ ...mockEmptyResponse });
  return res.json({ items: [], totalCount: 0 });
});
```

## SDK vs App Layer Boundaries

### Belongs in SDK (@ondc-agent/*)

- ✓ becknToUcpCatalog() - translation layer
- ✓ scoreAndSortItems() - preference scoring
- ✓ ONDCClient (gateway/src/http/client.ts) - HTTP calls
- ✓ MockGateway - testing infrastructure

### Belongs in App (website/*)

- ✓ React components and pages
- ✓ Form validation
- ✓ UI state management
- ✓ Error handling for user display

### Needs Implementation

- **SellerProtocolClient**: Wrapper around ONDCClient with Beckn protocol details
- **useSearch integration**: Connect to SellerClient.search() instead of mock
- **Callback management**: Handle async ONDC on_search callbacks

## POC Limitations

1. No actual ONDC network calls
2. MockGateway available but not wired to api-server
3. SellerClient is a stub
4. /api/search returns empty catalog (needs mock gateway or real ONDC)

## Next Steps for Real Integration

1. Implement SellerClient.search() using MockGateway for testing
2. Add callback URL handling in api-server
3. Wire up useSearch hook to trigger ONDC /search via SellerClient
4. Add authentication headers (subscriber_id, signature)
