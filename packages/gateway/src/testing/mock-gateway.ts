/**
 * Mock ONDC Gateway Server
 * Simulates ONDC network for integration testing
 */

import express, { type Express, type Request, type Response } from 'express';
import type { Server } from 'http';
import type {
  BecknContext,
  BecknOnSearchResponse,
  BecknCatalog,
  BecknProvider,
  BecknItem,
} from '@ondc-agent/shared';

/**
 * Mock gateway configuration
 */
export interface MockGatewayConfig {
  /** Callback delay in ms (default: 100) */
  callbackDelay?: number;
  /** Whether to automatically send callbacks (default: true) */
  autoCallback?: boolean;
  /** Custom catalog data */
  catalog?: BecknCatalog;
}

/**
 * Mock gateway response types
 */
export interface MockGatewayResponse {
  message: {
    ack: {
      status: 'ACK' | 'NACK';
    };
  };
}

/**
 * Sample provider data for testing
 */
function createSampleProvider(index: number): BecknProvider {
  return {
    id: `provider-${index}`,
    descriptor: {
      name: `Test Provider ${index}`,
      short_desc: `Quality products from Provider ${index}`,
      long_desc: `A trusted provider serving customers with high-quality products.`,
      images: [
        { url: `https://example.com/provider-${index}.png` },
      ],
    },
    locations: [
      {
        id: `loc-${index}`,
        gps: `${12.97 + index * 0.01},${77.59 + index * 0.01}`,
        address: {
          locality: 'HSR Layout',
          city: 'Bengaluru',
          area_code: '560102',
          state: 'Karnataka',
        },
      },
    ],
    items: [
      createSampleItem(`${index}-1`, `Product ${index}A`, 100 + index * 50),
      createSampleItem(`${index}-2`, `Product ${index}B`, 200 + index * 50),
    ],
    rating: 4 + (index % 10) / 10,
  };
}

/**
 * Sample item data for testing
 */
function createSampleItem(id: string, name: string, price: number): BecknItem {
  return {
    id: `item-${id}`,
    descriptor: {
      name,
      short_desc: `High quality ${name.toLowerCase()}`,
      images: [{ url: `https://example.com/item-${id}.png` }],
    },
    price: {
      currency: 'INR',
      value: price.toString(),
      maximum_value: (price * 1.2).toString(),
    },
    quantity: {
      count: 100,
      available: { value: '100', unit: 'unit' },
      maximum: { value: '10', unit: 'unit' },
    },
    category_id: 'cat-1',
    fulfillment_id: 'ful-1',
    rating: 4 + Math.random(),
    tags: [
      {
        code: 'origin',
        list: [{ code: 'country', value: 'India' }],
      },
    ],
  };
}

/**
 * Create default sample catalog
 */
function createDefaultCatalog(): BecknCatalog {
  return {
    'bpp/descriptor': {
      name: 'Mock ONDC Gateway',
      short_desc: 'Mock gateway for testing',
    },
    'bpp/providers': [
      createSampleProvider(1),
      createSampleProvider(2),
      createSampleProvider(3),
    ],
  };
}

/**
 * Mock ONDC Gateway Server
 * Simulates ONDC network behavior for integration testing
 */
export class MockGateway {
  private app: Express;
  private server: Server | null = null;
  private port: number = 0;
  private config: Required<MockGatewayConfig>;
  private callbackUrls: Map<string, string> = new Map();

  constructor(config: MockGatewayConfig = {}) {
    this.config = {
      callbackDelay: config.callbackDelay ?? 100,
      autoCallback: config.autoCallback ?? true,
      catalog: config.catalog ?? createDefaultCatalog(),
    };

    this.app = express();
    this.setupRoutes();
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    this.app.use(express.json());

    // Search endpoint
    this.app.post('/search', async (req: Request, res: Response) => {
      const context: BecknContext = req.body?.context;

      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: 'NACK' } },
          error: { message: 'Missing transaction_id' },
        });
        return;
      }

      // Store callback URL for this transaction
      if (context.bap_uri) {
        this.callbackUrls.set(context.transaction_id, context.bap_uri);
      }

      // Send ACK immediately
      const ackResponse: MockGatewayResponse = {
        message: { ack: { status: 'ACK' } },
      };
      res.json(ackResponse);

      // Schedule async callback if enabled
      if (this.config.autoCallback) {
        setTimeout(() => {
          this.sendOnSearchCallback(context);
        }, this.config.callbackDelay);
      }
    });

    // Select endpoint
    this.app.post('/select', async (req: Request, res: Response) => {
      const context: BecknContext = req.body?.context;

      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: 'NACK' } },
          error: { message: 'Missing transaction_id' },
        });
        return;
      }

      res.json({ message: { ack: { status: 'ACK' } } });
    });

    // Init endpoint
    this.app.post('/init', async (req: Request, res: Response) => {
      const context: BecknContext = req.body?.context;

      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: 'NACK' } },
          error: { message: 'Missing transaction_id' },
        });
        return;
      }

      res.json({ message: { ack: { status: 'ACK' } } });
    });

    // Confirm endpoint
    this.app.post('/confirm', async (req: Request, res: Response) => {
      const context: BecknContext = req.body?.context;

      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: 'NACK' } },
          error: { message: 'Missing transaction_id' },
        });
        return;
      }

      res.json({ message: { ack: { status: 'ACK' } } });
    });

    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'healthy', port: this.port });
    });
  }

  /**
   * Send on_search callback
   */
  private async sendOnSearchCallback(context: BecknContext): Promise<void> {
    const callbackUrl = this.callbackUrls.get(context.transaction_id);
    if (!callbackUrl) {
      console.warn(`No callback URL for transaction: ${context.transaction_id}`);
      return;
    }

    const response: BecknOnSearchResponse = {
      context: {
        ...context,
        action: 'on_search',
        bpp_id: 'mock-gateway.example.com',
        bpp_uri: this.getBaseUrl(),
        timestamp: new Date().toISOString(),
      },
      message: {
        catalog: this.config.catalog,
      },
    };

    try {
      await fetch(`${callbackUrl}/on_search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(response),
      });
    } catch (error) {
      // Silently ignore callback errors in test mode
      console.warn(`Failed to send callback to ${callbackUrl}:`, error);
    }
  }

  /**
   * Start the mock gateway server
   * @returns Promise resolving to the assigned port
   */
  async start(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        // Use port 0 to get a random available port
        this.server = this.app.listen(0, () => {
          const addr = this.server?.address();
          if (addr && typeof addr === 'object') {
            this.port = addr.port;
            console.log(`Mock gateway listening on port ${this.port}`);
            resolve(this.port);
          } else {
            reject(new Error('Failed to get server address'));
          }
        });

        this.server.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the mock gateway server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.server = null;
          this.port = 0;
          resolve();
        }
      });
    });
  }

  /**
   * Get the base URL of the mock gateway
   */
  getBaseUrl(): string {
    return `http://localhost:${this.port}`;
  }

  /**
   * Get the current port
   */
  getPort(): number {
    return this.port;
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  /**
   * Update catalog data
   */
  setCatalog(catalog: BecknCatalog): void {
    this.config.catalog = catalog;
  }

  /**
   * Update callback delay
   */
  setCallbackDelay(delay: number): void {
    this.config.callbackDelay = delay;
  }

  /**
   * Manually trigger a callback for a transaction
   */
  triggerCallback(transactionId: string, context: BecknContext): Promise<void> {
    return this.sendOnSearchCallback({ ...context, transaction_id: transactionId });
  }

  /**
   * Get Express app for custom middleware
   */
  getApp(): Express {
    return this.app;
  }
}

/**
 * Create and start a mock gateway
 * Convenience function for quick setup in tests
 */
export async function createMockGateway(
  config?: MockGatewayConfig
): Promise<MockGateway> {
  const gateway = new MockGateway(config);
  await gateway.start();
  return gateway;
}
