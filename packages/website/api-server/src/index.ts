import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
// Direct SDK imports - no MCP (POC website, not part of SDK)
import { SellerClient } from '@ondc-agent/seller-sdk';
import { becknToUcpCatalog, scoreAndSortItems } from '@ondc-agent/shared';
import type { BecknOnSearchResponse, UCPSearchPreferences, UCPLocation } from '@ondc-agent/shared';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Store pending callbacks for async ONDC responses
const pendingCallbacks = new Map<string, (data: BecknOnSearchResponse) => void>();

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
let sellerClient: SellerClient | null = null;

app.post('/api/seller/init', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    sellerClient = new SellerClient(config);
    console.log('Seller client initialized');
    res.json({ success: true, message: 'Seller client initialized' });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

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

    // TODO: Implement ONDC search via SellerClient
    // For now, return empty catalog with structure
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
        catalog: {
          'bpp/providers': [],
        },
      },
    });

    // Apply scoring and sorting if items exist
    const sortedItems = catalog.items.length > 0
      ? scoreAndSortItems(catalog.items, ucpPreferences, ucpLocation)
      : catalog.items;

    res.json({
      items: sortedItems,
      totalCount: catalog.totalCount ?? sortedItems.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

export { app };
