// src/gateway.ts
var Gateway = class {
  constructor(config) {
    this.config = config;
    this.config = config;
  }
  async start() {
    console.log(`Gateway starting on port ${this.config.port}...`);
  }
  async stop() {
    console.log("Gateway stopping...");
  }
};

// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
var ONDCMcpServer = class {
  server;
  transport = null;
  isConnected = false;
  shutdownHandlers = [];
  constructor(config) {
    this.server = new McpServer({
      name: config.name,
      version: config.version
    });
  }
  /**
   * Start the MCP server with stdio transport
   */
  async start() {
    if (this.isConnected) {
      throw new Error("Server is already connected");
    }
    this.transport = new StdioServerTransport();
    const sigintHandler = async () => {
      await this.stop();
      process.exit(0);
    };
    process.on("SIGINT", sigintHandler);
    this.shutdownHandlers.push(() => {
      process.removeListener("SIGINT", sigintHandler);
    });
    await this.server.connect(this.transport);
    this.isConnected = true;
  }
  /**
   * Stop the MCP server gracefully
   */
  async stop() {
    if (!this.isConnected) {
      return;
    }
    for (const handler of this.shutdownHandlers) {
      handler();
    }
    this.shutdownHandlers = [];
    await this.server.close();
    this.transport = null;
    this.isConnected = false;
  }
  /**
   * Get the underlying McpServer instance for tool registration
   */
  getServer() {
    return this.server;
  }
  /**
   * Check if server is currently connected
   */
  isRunning() {
    return this.isConnected;
  }
};

// src/mcp/tools/search.ts
import { z } from "zod";
import { ucpToBecknIntent, becknToUcpCatalog } from "@ondc-agent/shared";
var searchInputSchema = {
  category: z.string().describe('Product or service category (e.g., "grocery", "restaurant")'),
  query: z.string().optional().describe("Free-text search query"),
  location: z.object({
    latitude: z.number().min(-90).max(90).describe("Latitude coordinate"),
    longitude: z.number().min(-180).max(180).describe("Longitude coordinate"),
    radius: z.number().min(100).max(5e4).optional().describe("Search radius in meters")
  }).optional().describe("Search location for nearby providers"),
  preferences: z.object({
    maxPrice: z.number().optional().describe("Maximum price filter"),
    minRating: z.number().min(0).max(5).optional().describe("Minimum rating (0-5)"),
    sortBy: z.enum(["price", "rating", "distance", "relevance"]).optional().describe("Sort order")
  }).optional().describe("Search preferences"),
  maxResults: z.number().min(1).max(100).optional().describe("Maximum results (default: 10)")
};
var searchOutputSchema = {
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.object({
      currency: z.string(),
      value: z.string()
    }),
    provider: z.object({
      id: z.string(),
      name: z.string()
    }),
    category: z.string().optional()
  })),
  totalCount: z.number(),
  transactionId: z.string()
};
function generateTransactionId() {
  return `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
function inputToUcpQuery(input) {
  const query = {
    category: input.category,
    query: input.query,
    limit: input.maxResults ?? 10
  };
  if (input.location) {
    query.location = {
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      radius: input.location.radius ? input.location.radius / 1e3 : void 0
      // Convert m to km
    };
  }
  if (input.preferences) {
    if (input.preferences.maxPrice !== void 0) {
      query.priceRange = { max: input.preferences.maxPrice };
    }
    if (input.preferences.minRating !== void 0) {
      query.minRating = input.preferences.minRating;
    }
  }
  return query;
}
function registerSearchTool(server, deps) {
  const { client, stateStore, poller, callbackTimeout = 3e4 } = deps;
  server.registerTool(
    "ondc_search",
    {
      title: "ONDC Search",
      description: "Search for products and services on the ONDC network",
      inputSchema: searchInputSchema,
      outputSchema: searchOutputSchema
    },
    async (input) => {
      const transactionId = generateTransactionId();
      const ucpQuery = inputToUcpQuery(input);
      const becknIntent = ucpToBecknIntent(ucpQuery);
      stateStore.set(transactionId, {
        type: "search",
        data: { query: ucpQuery }
      });
      const searchRequest = {
        context: {
          domain: "nic2004:52110",
          // Retail domain
          action: "search",
          transaction_id: transactionId,
          message_id: `msg-${Date.now()}`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          country: "IND",
          city: "std:080",
          // Default to Bangalore
          core_version: "1.2.0"
        },
        message: {
          intent: becknIntent
        }
      };
      await client.post("/search", searchRequest);
      let catalog;
      try {
        const callbackData = await poller.waitForCallback(
          transactionId,
          callbackTimeout
        );
        catalog = becknToUcpCatalog(callbackData);
      } catch (error) {
        stateStore.delete(transactionId);
        throw error;
      }
      const limitedItems = catalog.items.slice(0, input.maxResults ?? 10);
      const output = {
        items: limitedItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          provider: {
            id: item.provider.id,
            name: item.provider.name
          },
          category: item.category
        })),
        totalCount: catalog.totalCount ?? limitedItems.length,
        transactionId
      };
      return {
        content: [{ type: "text", text: JSON.stringify(output, null, 2) }],
        structuredContent: output
      };
    }
  );
}

// src/webhook/server.ts
import express from "express";
import { verifyAuthHeader } from "@ondc-agent/shared";
var WebhookServer = class {
  app;
  server = null;
  handlers;
  listeningPort = null;
  publicKeys;
  // subscriberId -> publicKey
  requireSignature;
  constructor(config = {}) {
    this.app = express();
    this.handlers = /* @__PURE__ */ new Map();
    this.publicKeys = /* @__PURE__ */ new Map();
    this.requireSignature = config.requireSignature ?? true;
    this.app.use("/on_search", express.raw({ type: "application/json" }));
    this.app.use("/on_select", express.raw({ type: "application/json" }));
    this.app.use("/on_confirm", express.raw({ type: "application/json" }));
    this.app.use("/on_init", express.raw({ type: "application/json" }));
    this.app.use("/on_status", express.raw({ type: "application/json" }));
    this.app.use(express.json());
    this.registerEndpoints();
  }
  /**
   * Register webhook handler for specific action
   * @param action - Beckn action (e.g., 'on_search', 'on_select')
   * @param handler - Handler function
   */
  on(action, handler) {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, []);
    }
    this.handlers.get(action).push(handler);
  }
  /**
   * Register a public key for a subscriber
   * @param subscriberId - Subscriber ID (e.g., "ondc.example.com")
   * @param publicKey - Base64 encoded Ed25519 public key
   */
  registerPublicKey(subscriberId, publicKey) {
    this.publicKeys.set(subscriberId, publicKey);
  }
  /**
   * Remove a public key for a subscriber
   * @param subscriberId - Subscriber ID
   */
  removePublicKey(subscriberId) {
    this.publicKeys.delete(subscriberId);
  }
  /**
   * Get the registered public key for a subscriber
   * @param subscriberId - Subscriber ID
   * @returns Public key or undefined if not registered
   */
  getPublicKey(subscriberId) {
    return this.publicKeys.get(subscriberId);
  }
  /**
   * Register webhook endpoints
   */
  registerEndpoints() {
    this.app.post("/on_search", (req, res) => {
      this.handleCallback("on_search", req, res);
    });
    this.app.post("/on_select", (req, res) => {
      this.handleCallback("on_select", req, res);
    });
    this.app.post("/on_init", (req, res) => {
      this.handleCallback("on_init", req, res);
    });
    this.app.post("/on_confirm", (req, res) => {
      this.handleCallback("on_confirm", req, res);
    });
    this.app.post("/on_status", (req, res) => {
      this.handleCallback("on_status", req, res);
    });
    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    });
  }
  /**
   * Handle incoming webhook callback
   */
  async handleCallback(action, req, res) {
    try {
      const body = req.body;
      let message;
      let rawBody;
      if (Buffer.isBuffer(body)) {
        rawBody = body.toString("utf-8");
        message = JSON.parse(rawBody);
      } else if (typeof body === "string") {
        rawBody = body;
        message = JSON.parse(rawBody);
      } else {
        rawBody = JSON.stringify(body);
        message = body;
      }
      if (this.requireSignature) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          console.warn(`Missing Authorization header for ${action}`);
          res.status(401).json({
            message: {
              ack: {
                status: "NACK"
              }
            },
            error: "Missing Authorization header"
          });
          return;
        }
        const subscriberId = message.context?.bpp_id;
        if (!subscriberId) {
          console.warn(`Missing bpp_id in message context for ${action}`);
          res.status(400).json({
            message: {
              ack: {
                status: "NACK"
              }
            },
            error: "Missing bpp_id in message context"
          });
          return;
        }
        const publicKey = this.publicKeys.get(subscriberId);
        if (!publicKey) {
          console.warn(`No public key registered for subscriber: ${subscriberId}`);
          res.status(401).json({
            message: {
              ack: {
                status: "NACK"
              }
            },
            error: "Unknown subscriber"
          });
          return;
        }
        const verification = await verifyAuthHeader(authHeader, rawBody, publicKey);
        if (!verification.valid) {
          console.warn(`Invalid signature from subscriber: ${subscriberId}`);
          res.status(401).json({
            message: {
              ack: {
                status: "NACK"
              }
            },
            error: "Invalid signature"
          });
          return;
        }
      }
      const handlers = this.handlers.get(action) || [];
      if (handlers.length === 0) {
        console.warn(`No handlers registered for action: ${action}`);
        res.status(202).json({ acknowledged: true, message: "No handlers registered" });
        return;
      }
      for (const handler of handlers) {
        await handler(message);
      }
      res.status(200).json({
        message: {
          ack: {
            status: "ACK"
          }
        }
      });
    } catch (error) {
      console.error(`Error handling ${action}:`, error);
      res.status(500).json({
        message: {
          ack: {
            status: "NACK"
          }
        },
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
  /**
   * Start the webhook server
   * @param port - Port to listen on (overrides config)
   * @param host - Host to bind to (overrides config)
   */
  async start(port, host) {
    return new Promise((resolve, reject) => {
      try {
        const listenPort = port ?? 3e3;
        const listenHost = host ?? "0.0.0.0";
        this.server = this.app.listen(listenPort, listenHost);
        this.server.on("error", (error) => {
          if (error.code === "EADDRINUSE") {
            reject(new Error(`Port ${listenPort} is already in use`));
          } else {
            reject(error);
          }
        });
        this.server.on("listening", () => {
          const address = this.server?.address();
          if (address && typeof address !== "string") {
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
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          console.log("Webhook server stopped");
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
  getPort() {
    return this.listeningPort;
  }
  /**
   * Get the Express app instance
   * Useful for testing or adding custom middleware
   */
  getApp() {
    return this.app;
  }
  /**
   * Get registered handler count for an action
   * @param action - Beckn action
   */
  handlerCount(action) {
    return this.handlers.get(action)?.length ?? 0;
  }
};

// src/state/store.ts
var StateStore = class {
  store;
  ttl;
  cleanupTimer;
  constructor(config = {}) {
    this.store = /* @__PURE__ */ new Map();
    this.ttl = config.ttl ?? 5 * 60 * 1e3;
    this.cleanupTimer = null;
    this.startCleanup();
  }
  /**
   * Store state for a transaction
   * @param transactionId - Transaction ID
   * @param state - State to store
   */
  set(transactionId, state) {
    const pendingRequest = {
      transactionId,
      createdAt: /* @__PURE__ */ new Date(),
      ...state
    };
    this.store.set(transactionId, pendingRequest);
  }
  /**
   * Get state for a transaction
   * @param transactionId - Transaction ID
   * @returns Pending request or undefined if not found
   */
  get(transactionId) {
    return this.store.get(transactionId);
  }
  /**
   * Remove state for a transaction
   * @param transactionId - Transaction ID
   * @returns true if found and removed, false otherwise
   */
  delete(transactionId) {
    return this.store.delete(transactionId);
  }
  /**
   * Check if transaction exists
   * @param transactionId - Transaction ID
   * @returns true if exists, false otherwise
   */
  has(transactionId) {
    return this.store.has(transactionId);
  }
  /**
   * Get all transaction IDs
   * @returns Array of transaction IDs
   */
  keys() {
    return Array.from(this.store.keys());
  }
  /**
   * Get count of pending requests
   * @returns Number of pending requests
   */
  size() {
    return this.store.size;
  }
  /**
   * Clear all pending requests
   */
  clear() {
    this.store.clear();
  }
  /**
   * Start periodic cleanup of expired entries
   */
  startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 60 * 1e3);
  }
  /**
   * Stop periodic cleanup
   */
  stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    const expiredKeys = [];
    for (const [key, value] of this.store.entries()) {
      const age = now - value.createdAt.getTime();
      if (age > this.ttl) {
        expiredKeys.push(key);
      }
    }
    for (const key of expiredKeys) {
      this.store.delete(key);
    }
    if (expiredKeys.length > 0) {
      console.log(`State store: cleaned up ${expiredKeys.length} expired entries`);
    }
  }
  /**
   * Get statistics about the state store
   * @returns Statistics object
   */
  getStats() {
    return {
      size: this.store.size,
      ttl: this.ttl,
      keys: this.keys()
    };
  }
};

// src/state/poller.ts
var AsyncPoller = class {
  stateStore;
  pollInterval;
  defaultTimeout;
  constructor(config) {
    this.stateStore = config.stateStore;
    this.pollInterval = config.pollInterval ?? 100;
    this.defaultTimeout = config.defaultTimeout ?? 5e3;
  }
  /**
   * Wait for callback result
   * @param transactionId - Transaction ID to wait for
   * @param timeout - Timeout in milliseconds (uses default if not provided)
   * @returns Promise resolving to result or rejecting on timeout
   */
  async waitForCallback(transactionId, timeout) {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const poll = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= actualTimeout) {
          reject(new Error(`Timeout waiting for callback: ${transactionId}`));
          return;
        }
        const state = this.stateStore.get(transactionId);
        if (state && state.data && typeof state.data === "object") {
          const result = state.data;
          if (result.error) {
            reject(new Error(result.error));
            return;
          }
          if (result.result !== void 0) {
            resolve(result.result);
            return;
          }
        }
        setTimeout(poll, this.pollInterval);
      };
      poll();
    });
  }
  /**
   * Wait with custom check function
   * @param check - Function to check if condition is met
   * @param timeout - Timeout in milliseconds
   * @returns Promise resolving when condition is met or rejecting on timeout
   */
  async waitUntil(check, timeout) {
    const actualTimeout = timeout ?? this.defaultTimeout;
    const startTime = Date.now();
    return new Promise((resolve, reject) => {
      const poll = () => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= actualTimeout) {
          reject(new Error("Timeout waiting for condition"));
          return;
        }
        const result = check();
        if (result !== null && result !== void 0) {
          resolve(result);
          return;
        }
        setTimeout(poll, this.pollInterval);
      };
      poll();
    });
  }
  /**
   * Get the poll interval
   */
  getPollInterval() {
    return this.pollInterval;
  }
  /**
   * Get the default timeout
   */
  getDefaultTimeout() {
    return this.defaultTimeout;
  }
};
function createCallbackResult(result) {
  return { result };
}
function createCallbackError(error) {
  return { error };
}

// src/callback/manager.ts
var CallbackManager = class {
  stateStore;
  poller;
  pendingCallbacks;
  constructor(config) {
    this.stateStore = config.stateStore;
    this.poller = config.poller;
    this.pendingCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * Register a pending request
   * @param transactionId - Transaction ID
   * @param type - Request type (e.g., 'search', 'select')
   * @param data - Additional request data
   */
  registerRequest(transactionId, type, data) {
    this.stateStore.set(transactionId, { type, data });
  }
  /**
   * Wait for callback result
   * @param transactionId - Transaction ID to wait for
   * @param timeout - Timeout in milliseconds (optional)
   * @returns Promise resolving to callback message
   */
  async waitForCallback(transactionId, timeout) {
    return this.poller.waitForCallback(transactionId, timeout);
  }
  /**
   * Handle incoming callback and route to waiting promise
   * @param message - Beckn callback message
   */
  handleCallback(message) {
    const transactionId = message.context?.transaction_id;
    if (!transactionId) {
      console.warn("Callback missing transaction_id");
      return;
    }
    const pendingRequest = this.stateStore.get(transactionId);
    if (!pendingRequest) {
      console.warn(`No pending request for transaction: ${transactionId}`);
      return;
    }
    this.stateStore.set(transactionId, {
      type: pendingRequest.type,
      data: createCallbackResult(message)
    });
    const handlers = this.pendingCallbacks.get(transactionId) || [];
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in callback handler for ${transactionId}:`, error);
      }
    }
    this.pendingCallbacks.delete(transactionId);
  }
  /**
   * Register a one-time handler for a specific transaction
   * @param transactionId - Transaction ID
   * @param handler - Handler function
   */
  onTransaction(transactionId, handler) {
    if (!this.pendingCallbacks.has(transactionId)) {
      this.pendingCallbacks.set(transactionId, []);
    }
    this.pendingCallbacks.get(transactionId).push(handler);
  }
  /**
   * Complete a request with an error
   * @param transactionId - Transaction ID
   * @param error - Error message
   */
  completeWithError(transactionId, error) {
    const pendingRequest = this.stateStore.get(transactionId);
    if (pendingRequest) {
      this.stateStore.set(transactionId, {
        type: pendingRequest.type,
        data: createCallbackError(error)
      });
    }
  }
  /**
   * Complete a request with a result
   * @param transactionId - Transaction ID
   * @param result - Result data
   */
  completeWithResult(transactionId, result) {
    const pendingRequest = this.stateStore.get(transactionId);
    if (pendingRequest) {
      this.stateStore.set(transactionId, {
        type: pendingRequest.type,
        data: createCallbackResult(result)
      });
    }
  }
  /**
   * Remove a pending request
   * @param transactionId - Transaction ID
   */
  removeRequest(transactionId) {
    this.stateStore.delete(transactionId);
    this.pendingCallbacks.delete(transactionId);
  }
  /**
   * Get statistics about pending requests
   * @returns Statistics object
   */
  getStats() {
    return {
      pendingRequests: this.stateStore.size(),
      waitingHandlers: this.pendingCallbacks.size,
      stateStoreSize: this.stateStore.size()
    };
  }
};

// src/testing/mock-gateway.ts
import express2 from "express";
function createSampleProvider(index) {
  return {
    id: `provider-${index}`,
    descriptor: {
      name: `Test Provider ${index}`,
      short_desc: `Quality products from Provider ${index}`,
      long_desc: `A trusted provider serving customers with high-quality products.`,
      images: [
        { url: `https://example.com/provider-${index}.png` }
      ]
    },
    locations: [
      {
        id: `loc-${index}`,
        gps: `${12.97 + index * 0.01},${77.59 + index * 0.01}`,
        address: {
          locality: "HSR Layout",
          city: "Bengaluru",
          area_code: "560102",
          state: "Karnataka"
        }
      }
    ],
    items: [
      createSampleItem(`${index}-1`, `Product ${index}A`, 100 + index * 50),
      createSampleItem(`${index}-2`, `Product ${index}B`, 200 + index * 50)
    ],
    rating: 4 + index % 10 / 10
  };
}
function createSampleItem(id, name, price) {
  return {
    id: `item-${id}`,
    descriptor: {
      name,
      short_desc: `High quality ${name.toLowerCase()}`,
      images: [{ url: `https://example.com/item-${id}.png` }]
    },
    price: {
      currency: "INR",
      value: price.toString(),
      maximum_value: (price * 1.2).toString()
    },
    quantity: {
      count: 100,
      available: { value: "100", unit: "unit" },
      maximum: { value: "10", unit: "unit" }
    },
    category_id: "cat-1",
    fulfillment_id: "ful-1",
    rating: 4 + Math.random(),
    tags: [
      {
        code: "origin",
        list: [{ code: "country", value: "India" }]
      }
    ]
  };
}
function createDefaultCatalog() {
  return {
    "bpp/descriptor": {
      name: "Mock ONDC Gateway",
      short_desc: "Mock gateway for testing"
    },
    "bpp/providers": [
      createSampleProvider(1),
      createSampleProvider(2),
      createSampleProvider(3)
    ]
  };
}
var MockGateway = class {
  app;
  server = null;
  port = 0;
  config;
  callbackUrls = /* @__PURE__ */ new Map();
  constructor(config = {}) {
    this.config = {
      callbackDelay: config.callbackDelay ?? 100,
      autoCallback: config.autoCallback ?? true,
      catalog: config.catalog ?? createDefaultCatalog()
    };
    this.app = express2();
    this.setupRoutes();
  }
  /**
   * Setup Express routes
   */
  setupRoutes() {
    this.app.use(express2.json());
    this.app.post("/search", async (req, res) => {
      const context = req.body?.context;
      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: "NACK" } },
          error: { message: "Missing transaction_id" }
        });
        return;
      }
      if (context.bap_uri) {
        this.callbackUrls.set(context.transaction_id, context.bap_uri);
      }
      const ackResponse = {
        message: { ack: { status: "ACK" } }
      };
      res.json(ackResponse);
      if (this.config.autoCallback) {
        setTimeout(() => {
          this.sendOnSearchCallback(context);
        }, this.config.callbackDelay);
      }
    });
    this.app.post("/select", async (req, res) => {
      const context = req.body?.context;
      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: "NACK" } },
          error: { message: "Missing transaction_id" }
        });
        return;
      }
      res.json({ message: { ack: { status: "ACK" } } });
    });
    this.app.post("/init", async (req, res) => {
      const context = req.body?.context;
      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: "NACK" } },
          error: { message: "Missing transaction_id" }
        });
        return;
      }
      res.json({ message: { ack: { status: "ACK" } } });
    });
    this.app.post("/confirm", async (req, res) => {
      const context = req.body?.context;
      if (!context?.transaction_id) {
        res.status(400).json({
          message: { ack: { status: "NACK" } },
          error: { message: "Missing transaction_id" }
        });
        return;
      }
      res.json({ message: { ack: { status: "ACK" } } });
    });
    this.app.get("/health", (_req, res) => {
      res.json({ status: "healthy", port: this.port });
    });
  }
  /**
   * Send on_search callback
   */
  async sendOnSearchCallback(context) {
    const callbackUrl = this.callbackUrls.get(context.transaction_id);
    if (!callbackUrl) {
      console.warn(`No callback URL for transaction: ${context.transaction_id}`);
      return;
    }
    const response = {
      context: {
        ...context,
        action: "on_search",
        bpp_id: "mock-gateway.example.com",
        bpp_uri: this.getBaseUrl(),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      message: {
        catalog: this.config.catalog
      }
    };
    try {
      await fetch(`${callbackUrl}/on_search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response)
      });
    } catch (error) {
      console.warn(`Failed to send callback to ${callbackUrl}:`, error);
    }
  }
  /**
   * Start the mock gateway server
   * @returns Promise resolving to the assigned port
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(0, () => {
          const addr = this.server?.address();
          if (addr && typeof addr === "object") {
            this.port = addr.port;
            console.log(`Mock gateway listening on port ${this.port}`);
            resolve(this.port);
          } else {
            reject(new Error("Failed to get server address"));
          }
        });
        this.server.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  /**
   * Stop the mock gateway server
   */
  async stop() {
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
  getBaseUrl() {
    return `http://localhost:${this.port}`;
  }
  /**
   * Get the current port
   */
  getPort() {
    return this.port;
  }
  /**
   * Check if server is running
   */
  isRunning() {
    return this.server !== null && this.server.listening;
  }
  /**
   * Update catalog data
   */
  setCatalog(catalog) {
    this.config.catalog = catalog;
  }
  /**
   * Update callback delay
   */
  setCallbackDelay(delay) {
    this.config.callbackDelay = delay;
  }
  /**
   * Manually trigger a callback for a transaction
   */
  triggerCallback(transactionId, context) {
    return this.sendOnSearchCallback({ ...context, transaction_id: transactionId });
  }
  /**
   * Get Express app for custom middleware
   */
  getApp() {
    return this.app;
  }
};
async function createMockGateway(config) {
  const gateway = new MockGateway(config);
  await gateway.start();
  return gateway;
}
export {
  AsyncPoller,
  CallbackManager,
  Gateway,
  MockGateway,
  ONDCMcpServer,
  StateStore,
  WebhookServer,
  createCallbackError,
  createCallbackResult,
  createMockGateway,
  registerSearchTool
};
