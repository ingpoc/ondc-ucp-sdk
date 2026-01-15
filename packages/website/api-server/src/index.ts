import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
// Direct SDK imports - no MCP (POC website, not part of SDK)
// Avoid importing from main @ondc-agent/shared to prevent libsodium dependency issues
import type { BecknOnSearchResponse, UCPSearchPreferences, UCPLocation, BecknItem, BecknCatalog } from '@ondc-agent/shared';

// Import MockGateway for realistic ONDC simulation
import { MockGateway, type MockGatewayConfig } from '@ondc-agent/gateway';

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

// Create MockGateway instance with realistic behavior
// Configure: 0-2000ms delay, 10-50 items for realistic testing
const mockGatewayConfig: MockGatewayConfig = {
  callbackDelay: Math.floor(Math.random() * 2000), // 0-2000ms delay
  autoCallback: true,
};

const mockGateway = new MockGateway(mockGatewayConfig);

// Start MockGateway when api-server starts
let mockGatewayPort: number | null = null;

// Get catalog from MockGateway (updated dynamically)
const getMockCatalog = (): BecknCatalog => {
  // The MockGateway has an internal catalog that's accessible via its config
  // For now, we'll return a default catalog that can be updated
  return mockGateway.getApp().get('catalog') || mockGateway['config']?.catalog || {
    'bpp/descriptor': {
      name: 'Mock ONDC Gateway',
      short_desc: 'Mock gateway for realistic testing',
    },
    'bpp/providers': [],
  };
};

// Get the first provider's items array from MockGateway catalog
const getItems = (): BecknItem[] => {
  const catalog = getMockCatalog();
  const provider = catalog['bpp/providers']?.[0];

  // If no providers exist, create a default one for CRUD operations
  if (!provider) {
    const defaultProvider = {
      id: 'provider-1',
      descriptor: {
        name: 'Default Provider',
        short_desc: 'Provider for CRUD operations',
      },
      items: [],
    };
    // Update the catalog with default provider
    if (!catalog['bpp/providers']) {
      catalog['bpp/providers'] = [];
    }
    catalog['bpp/providers'].push(defaultProvider);
    return defaultProvider.items;
  }

  return provider?.items ?? [];
};

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'api-server',
    mockGateway: {
      running: mockGateway.isRunning(),
      port: mockGatewayPort,
      url: mockGateway.getBaseUrl(),
    },
  });
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
    const { category, location, preferences } = req.query;
    // Accept both 'query' and 'q' parameters for flexibility
    const query = req.query.query || req.query.q;

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

    // Return products from MockGateway catalog with search filtering
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
        catalog: getMockCatalog(),
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

// Catalog CRUD endpoints (using MockGateway catalog)
app.get('/api/catalog', (_req: Request, res: Response) => {
  res.json(getMockCatalog());
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

// ============================================================================
// WEEK2-001: Progressive disclosure via SSE endpoint
// ============================================================================

// SSE streaming search endpoint
app.get('/api/search/stream', async (req: Request, res: Response) => {
  try {
    const { category, location, preferences } = req.query;
    const query = req.query.query || req.query.q;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send immediate status response
    const statusEvent = {
      type: 'status',
      data: {
        status: 'searching',
        message: 'Searching ONDC network...',
        timestamp: new Date().toISOString(),
      },
    };
    res.write(`data: ${JSON.stringify(statusEvent)}\n\n`);

    // Validate required parameter
    if (!category) {
      const errorEvent = {
        type: 'error',
        data: {
          error: 'Missing required parameter: category',
          timestamp: new Date().toISOString(),
        },
      };
      res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
      res.end();
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

    // Simulate progressive disclosure with delays
    // In real ONDC, results arrive as callbacks from multiple providers

    // Get catalog from MockGateway
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
        catalog: getMockCatalog(),
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

    // Stream results in batches of 5
    const batchSize = 5;
    const totalBatches = Math.ceil(sortedItems.length / batchSize);

    for (let i = 0; i < sortedItems.length; i += batchSize) {
      const batch = sortedItems.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;

      const resultEvent = {
        type: 'results',
        data: {
          items: batch,
          batch: batchNumber,
          totalBatches,
          totalItems: sortedItems.length,
          timestamp: new Date().toISOString(),
        },
      };

      res.write(`data: ${JSON.stringify(resultEvent)}\n\n`);

      // Simulate network delay between batches (100-500ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 100));
    }

    // Send completion signal
    const completionEvent = {
      type: 'complete',
      data: {
        status: 'completed',
        totalItems: sortedItems.length,
        message: 'Search complete',
        timestamp: new Date().toISOString(),
      },
    };
    res.write(`data: ${JSON.stringify(completionEvent)}\n\n`);

    // Timeout after 3 seconds with completion signal (already handled by completion event)
    res.end();
  } catch (error) {
    console.error('SSE search error:', error);

    // Send error event if headers haven't been sent
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    const errorEvent = {
      type: 'error',
      data: {
        error: String(error),
        timestamp: new Date().toISOString(),
      },
    };
    res.write(`data: ${JSON.stringify(errorEvent)}\n\n`);
    res.end();
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`API server running on http://localhost:${PORT}`);

  // Start MockGateway for realistic ONDC simulation
  try {
    mockGatewayPort = await mockGateway.start();
    console.log(`MockGateway running on port ${mockGatewayPort} for realistic testing`);

    // Log MockGateway configuration
    console.log(`MockGateway config: delay=${mockGatewayConfig.callbackDelay}ms, autoCallback=${mockGatewayConfig.autoCallback}`);
  } catch (error) {
    console.error('Failed to start MockGateway:', error);
  }
});

export { app };
