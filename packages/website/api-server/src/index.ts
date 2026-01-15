import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
// Direct SDK imports - no MCP (POC website, not part of SDK)
// Avoid importing from main @ondc-agent/shared to prevent libsodium dependency issues
import type { BecknOnSearchResponse, UCPSearchPreferences, UCPLocation, BecknItem, BecknCatalog } from '@ondc-agent/shared';

// Temporarily disabled agent service due to libsodium dependency issue
// import { executeBuyerAgent, executeSellerAgent, messageToSSE } from './agent-service.js';

// Local implementations of SDK functions to avoid libsodium dependency
interface UCPCatalog {
  items: Array<BecknItem & { _provider?: string }>;
  totalCount?: number;
}

function becknToUcpCatalog(response: BecknOnSearchResponse): UCPCatalog {
  const catalog = response.message?.catalog;
  if (!catalog) {
    return { items: [] };
  }

  const providers = catalog['bpp/providers'] ?? [];
  const items: Array<BecknItem & { _provider?: string }> = [];

  for (const provider of providers) {
    const providerItems = provider.items ?? [];
    for (const item of providerItems) {
      items.push({
        ...item,
        _provider: provider.descriptor?.name,
      });
    }
  }

  return { items, totalCount: items.length };
}

function scoreAndSortItems(items: BecknItem[]) {
  // Simple scoring: just return items sorted by price (low to high)
  return [...items].sort((a, b) => {
    const priceA = typeof a.price?.value === 'string' ? parseFloat(a.price.value) : 0;
    const priceB = typeof b.price?.value === 'string' ? parseFloat(b.price.value) : 0;
    return priceA - priceB;
  });
}

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Store pending callbacks for async ONDC responses
const pendingCallbacks = new Map<string, (data: BecknOnSearchResponse) => void>();

// In-memory product catalog for CRUD operations (POC only)
const mockCatalog: BecknCatalog = {
  'bpp/descriptor': {
    name: 'POC Seller Catalog',
    short_desc: 'Mock catalog for POC testing',
  },
  'bpp/providers': [
    {
      id: 'provider-1',
      descriptor: {
        name: 'Test Provider',
        short_desc: 'Provider for POC',
      },
      locations: [
        {
          id: 'loc-1',
          gps: '12.97,77.59',
          address: {
            locality: 'HSR Layout',
            city: 'Bengaluru',
            area_code: '560102',
            state: 'Karnataka',
          },
        },
      ],
      items: [
        {
          id: 'prod-001',
          descriptor: {
            name: 'Fresh Organic Mango',
            short_desc: 'Sweet and juicy organic mangoes from local farms',
          },
          price: {
            currency: 'INR',
            value: '150',
          },
          category_id: 'cat-1',
          fulfillment_id: 'ful-1',
        },
        {
          id: 'prod-002',
          descriptor: {
            name: 'Organic Apple',
            short_desc: 'Crisp and sweet organic apples',
          },
          price: {
            currency: 'INR',
            value: '120',
          },
          category_id: 'cat-1',
          fulfillment_id: 'ful-1',
        },
        {
          id: 'prod-003',
          descriptor: {
            name: 'Test Banana',
            short_desc: 'Yellow ripe bananas for testing',
          },
          price: {
            currency: 'INR',
            value: '50',
          },
          category_id: 'cat-1',
          fulfillment_id: 'ful-1',
        },
      ],
    },
  ],
};

// Get the first provider's items array
const getItems = (): BecknItem[] => {
  const provider = mockCatalog['bpp/providers']?.[0];
  return provider?.items ?? [];
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'api-server' });
});

// ONDC callback endpoint
app.post('/on_search', (req: Request, res: Response) => {
  const callback: BecknOnSearchResponse = req.body;
  const transactionId = callback.context?.transaction_id;

  if (!transactionId) {
    res.status(400).json({ error: 'Missing transaction_id' });
    return;
  }

  const resolver = pendingCallbacks.get(transactionId);
  if (resolver) {
    resolver(callback);
    pendingCallbacks.delete(transactionId);
  }

  res.json({ message: { ack: { status: 'ACK' } } });
});

// Initialize seller client
// Disabled due to libsodium dependency issue
// let sellerClient: SellerClient | null = null;

// app.post('/api/seller/init', async (req: Request, res: Response) => {
//   try {
//     const config = req.body;
//     sellerClient = new SellerClient(config);
//     console.log('Seller client initialized');
//     res.json({ success: true, message: 'Seller client initialized' });
//   } catch (error) {
//     res.status(500).json({ error: String(error) });
//   }
// });

// Search endpoint
app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const { category, query, location, preferences } = req.query;

    if (!category) {
      res.status(400).json({ error: 'Missing required parameter: category' });
      return;
    }

    // Build UCP preferences
    const ucpPreferences: UCPSearchPreferences = preferences
      ? (typeof preferences === 'string' ? JSON.parse(preferences) : preferences)
      : {};

    // Build UCP location
    const ucpLocation: UCPLocation | undefined = location
      ? (typeof location === 'string' ? JSON.parse(location) : location)
      : undefined;

    // Return products from mock catalog with search filtering
    const catalog = becknToUcpCatalog({
      context: {
        domain: 'nic2004:52110',
        action: 'on_search',
        transaction_id: 'mock-txn',
        timestamp: new Date().toISOString(),
        country: 'IND',
        city: 'std:080',
        bap_id: 'poc-website',
        bap_uri: 'http://localhost:3001',
        message_id: 'msg-' + Date.now(),
        core_version: '1.2.0',
      },
      message: {
        catalog: mockCatalog,
      },
    });

    // Filter items by query if provided
    let filteredItems = catalog.items;
    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      filteredItems = catalog.items.filter(
        item =>
          item.descriptor?.name?.toLowerCase().includes(q) ||
          item.descriptor?.short_desc?.toLowerCase().includes(q)
      );
    }

    // Apply scoring and sorting
    const sortedItems = scoreAndSortItems(filteredItems);

    res.json({
      items: sortedItems,
      totalCount: sortedItems.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Catalog CRUD endpoints (POC - in-memory)
app.get('/api/catalog', (_req: Request, res: Response) => {
  res.json(mockCatalog);
});

app.post('/api/catalog/products', (req: Request, res: Response) => {
  try {
    const newItem: BecknItem = req.body;
    if (!newItem.id) {
      res.status(400).json({ error: 'Missing required field: id' });
      return;
    }

    const items = getItems();
    items.push(newItem);
    res.json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.put('/api/catalog/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const items = getItems();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    items[index] = { ...items[index], ...updates };
    res.json({ success: true, item: items[index] });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.delete('/api/catalog/products/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const items = getItems();
    const index = items.findIndex((item) => item.id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    items.splice(index, 1);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

// Agent endpoints temporarily disabled due to libsodium dependency issue
// TODO: Fix @anthropic-ai/claude-agent-sdk dependency issue

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export { app };
