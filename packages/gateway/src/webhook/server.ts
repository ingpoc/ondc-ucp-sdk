/**
 * ONDC Webhook Server
 * Express server for receiving ONDC protocol callbacks
 */

import express, { type Request, type Response, type Express } from 'express';
import { type BecknMessage, verifyAuthHeader } from '@ondc-agent/shared';

/**
 * Handler function type for ONDC callbacks
 */
export type WebhookHandler = (message: BecknMessage) => void | Promise<void>;

/**
 * Webhook server configuration
 */
export interface WebhookServerConfig {
  /** Port to listen on (default: 3000) */
  port?: number;
  /** Host to bind to (default: 0.0.0.0) */
  host?: string;
  /** Whether to require signature verification (default: true) */
  requireSignature?: boolean;
}

/**
 * ONDC Webhook Server
 * Receives callbacks from ONDC network with optional signature verification
 */
export class WebhookServer {
  private app: Express;
  private server: ReturnType<Express['listen']> | null = null;
  private handlers: Map<string, WebhookHandler[]>;
  private listeningPort: number | null = null;
  private publicKeys: Map<string, string>; // subscriberId -> publicKey
  private requireSignature: boolean;

  constructor(config: WebhookServerConfig = {}) {
    this.app = express();
    this.handlers = new Map();
    this.publicKeys = new Map();
    this.requireSignature = config.requireSignature ?? true;

    // Raw body parser for signature verification
    this.app.use('/on_search', express.raw({ type: 'application/json' }));
    this.app.use('/on_select', express.raw({ type: 'application/json' }));
    this.app.use('/on_confirm', express.raw({ type: 'application/json' }));
    this.app.use('/on_init', express.raw({ type: 'application/json' }));
    this.app.use('/on_status', express.raw({ type: 'application/json' }));

    // Default JSON parser for other routes
    this.app.use(express.json());

    // Register webhook endpoints
    this.registerEndpoints();
  }

  /**
   * Register webhook handler for specific action
   * @param action - Beckn action (e.g., 'on_search', 'on_select')
   * @param handler - Handler function
   */
  on(action: string, handler: WebhookHandler): void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action)!.push(handler);
  }

  /**
   * Register a public key for a subscriber
   * @param subscriberId - Subscriber ID (e.g., "ondc.example.com")
   * @param publicKey - Base64 encoded Ed25519 public key
   */
  registerPublicKey(subscriberId: string, publicKey: string): void {
    this.publicKeys.set(subscriberId, publicKey);
  }

  /**
   * Remove a public key for a subscriber
   * @param subscriberId - Subscriber ID
   */
  removePublicKey(subscriberId: string): void {
    this.publicKeys.delete(subscriberId);
  }

  /**
   * Get the registered public key for a subscriber
   * @param subscriberId - Subscriber ID
   * @returns Public key or undefined if not registered
   */
  getPublicKey(subscriberId: string): string | undefined {
    return this.publicKeys.get(subscriberId);
  }

  /**
   * Register webhook endpoints
   */
  private registerEndpoints(): void {
    // POST /on_search - Search results callback
    this.app.post('/on_search', (req: Request, res: Response) => {
      this.handleCallback('on_search', req, res);
    });

    // POST /on_select - Provider selection callback
    this.app.post('/on_select', (req: Request, res: Response) => {
      this.handleCallback('on_select', req, res);
    });

    // POST /on_init - Order initialization callback
    this.app.post('/on_init', (req: Request, res: Response) => {
      this.handleCallback('on_init', req, res);
    });

    // POST /on_confirm - Order confirmation callback
    this.app.post('/on_confirm', (req: Request, res: Response) => {
      this.handleCallback('on_confirm', req, res);
    });

    // POST /on_status - Order status callback
    this.app.post('/on_status', (req: Request, res: Response) => {
      this.handleCallback('on_status', req, res);
    });

    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  /**
   * Handle incoming webhook callback
   */
  private async handleCallback(action: string, req: Request, res: Response): Promise<void> {
    try {
      // Parse request body
      const body = req.body;

      // Handle different body types:
      // - Buffer: raw body parser was used (for signature verification)
      // - Object: JSON parser was used
      // - String: already parsed as string
      let message: BecknMessage;
      let rawBody: string;

      if (Buffer.isBuffer(body)) {
        // Raw body parser was used - parse Buffer to JSON
        rawBody = body.toString('utf-8');
        message = JSON.parse(rawBody);
      } else if (typeof body === 'string') {
        // String body - parse to JSON
        rawBody = body;
        message = JSON.parse(rawBody);
      } else {
        // Already parsed object - need to stringify for signature verification
        rawBody = JSON.stringify(body);
        message = body as BecknMessage;
      }

      // Verify signature if required
      if (this.requireSignature) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          console.warn(`Missing Authorization header for ${action}`);
          res.status(401).json({
            message: {
              ack: {
                status: 'NACK',
              },
            },
            error: 'Missing Authorization header',
          });
          return;
        }

        // Extract subscriber ID from message context for key lookup
        const subscriberId = message.context?.bpp_id;
        if (!subscriberId) {
          console.warn(`Missing bpp_id in message context for ${action}`);
          res.status(400).json({
            message: {
              ack: {
                status: 'NACK',
              },
            },
            error: 'Missing bpp_id in message context',
          });
          return;
        }

        // Get registered public key for this subscriber
        const publicKey = this.publicKeys.get(subscriberId);
        if (!publicKey) {
          console.warn(`No public key registered for subscriber: ${subscriberId}`);
          res.status(401).json({
            message: {
              ack: {
                status: 'NACK',
              },
            },
            error: 'Unknown subscriber',
          });
          return;
        }

        // Verify the signature
        const verification = await verifyAuthHeader(authHeader, rawBody, publicKey);
        if (!verification.valid) {
          console.warn(`Invalid signature from subscriber: ${subscriberId}`);
          res.status(401).json({
            message: {
              ack: {
                status: 'NACK',
              },
            },
            error: 'Invalid signature',
          });
          return;
        }
      }

      // Get handlers for this action
      const handlers = this.handlers.get(action) || [];

      if (handlers.length === 0) {
        console.warn(`No handlers registered for action: ${action}`);
        res.status(202).json({ acknowledged: true, message: 'No handlers registered' });
        return;
      }

      // Execute all handlers
      for (const handler of handlers) {
        await handler(message);
      }

      res.status(200).json({
        message: {
          ack: {
            status: 'ACK',
          },
        },
      });
    } catch (error) {
      console.error(`Error handling ${action}:`, error);
      res.status(500).json({
        message: {
          ack: {
            status: 'NACK',
          },
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Start the webhook server
   * @param port - Port to listen on (overrides config)
   * @param host - Host to bind to (overrides config)
   */
  async start(port?: number, host?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const listenPort = port ?? 3000;
        const listenHost = host ?? '0.0.0.0';

        // Create server first
        this.server = this.app.listen(listenPort, listenHost);

        // Attach error handler BEFORE the server might emit errors
        this.server.on('error', (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE') {
            reject(new Error(`Port ${listenPort} is already in use`));
          } else {
            reject(error);
          }
        });

        // Attach listening callback
        this.server.on('listening', () => {
          // Get the actual port (useful when port is 0 for random port)
          const address = this.server?.address();
          if (address && typeof address !== 'string') {
            this.listeningPort = address.port;
          } else {
            this.listeningPort = listenPort;
          }
          console.log(`Webhook server listening on http://${listenHost}:${this.listeningPort}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the webhook server
   */
  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log('Webhook server stopped');
          this.server = null;
          this.listeningPort = null;
          resolve();
        }
      });
    });
  }

  /**
   * Get the actual port the server is listening on
   * Useful when port 0 is used for random port assignment
   */
  getPort(): number | null {
    return this.listeningPort;
  }

  /**
   * Get the Express app instance
   * Useful for testing or adding custom middleware
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Get registered handler count for an action
   * @param action - Beckn action
   */
  handlerCount(action: string): number {
    return this.handlers.get(action)?.length ?? 0;
  }
}
