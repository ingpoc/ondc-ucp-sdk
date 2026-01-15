import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ONDCClient, BecknMessage } from '@ondc-agent/shared';
import { Express } from 'express';

declare class Gateway {
    private config;
    constructor(config: {
        port: number;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
}

/**
 * MCP Server for ONDC Agent Gateway
 * Provides MCP tools for AI agents to interact with ONDC network
 */

interface MCPServerConfig {
    /** Server name shown to MCP clients */
    name: string;
    /** Server version */
    version: string;
}
/**
 * MCP Server wrapper with stdio transport
 * Handles lifecycle management and graceful shutdown
 */
declare class ONDCMcpServer {
    private server;
    private transport;
    private isConnected;
    private shutdownHandlers;
    constructor(config: MCPServerConfig);
    /**
     * Start the MCP server with stdio transport
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server gracefully
     */
    stop(): Promise<void>;
    /**
     * Get the underlying McpServer instance for tool registration
     */
    getServer(): McpServer;
    /**
     * Check if server is currently connected
     */
    isRunning(): boolean;
}

/**
 * State Store
 * In-memory storage for pending request state
 */
/**
 * Pending request state
 */
interface PendingRequest {
    /** Transaction ID */
    transactionId: string;
    /** Request timestamp */
    createdAt: Date;
    /** Request type (e.g., 'search', 'select') */
    type: string;
    /** Additional request data */
    data?: unknown;
}
/**
 * State Store Configuration
 */
interface StateStoreConfig {
    /** TTL in milliseconds (default: 5 minutes) */
    ttl?: number;
}
/**
 * In-memory state store for pending requests
 */
declare class StateStore {
    private store;
    private ttl;
    private cleanupTimer;
    constructor(config?: StateStoreConfig);
    /**
     * Store state for a transaction
     * @param transactionId - Transaction ID
     * @param state - State to store
     */
    set(transactionId: string, state: Omit<PendingRequest, 'transactionId' | 'createdAt'>): void;
    /**
     * Get state for a transaction
     * @param transactionId - Transaction ID
     * @returns Pending request or undefined if not found
     */
    get(transactionId: string): PendingRequest | undefined;
    /**
     * Remove state for a transaction
     * @param transactionId - Transaction ID
     * @returns true if found and removed, false otherwise
     */
    delete(transactionId: string): boolean;
    /**
     * Check if transaction exists
     * @param transactionId - Transaction ID
     * @returns true if exists, false otherwise
     */
    has(transactionId: string): boolean;
    /**
     * Get all transaction IDs
     * @returns Array of transaction IDs
     */
    keys(): string[];
    /**
     * Get count of pending requests
     * @returns Number of pending requests
     */
    size(): number;
    /**
     * Clear all pending requests
     */
    clear(): void;
    /**
     * Start periodic cleanup of expired entries
     */
    private startCleanup;
    /**
     * Stop periodic cleanup
     */
    stopCleanup(): void;
    /**
     * Remove expired entries
     */
    private cleanup;
    /**
     * Get statistics about the state store
     * @returns Statistics object
     */
    getStats(): {
        size: number;
        ttl: number;
        keys: string[];
    };
}

/**
 * Async Poller
 * Waits for callbacks via state store polling
 */

/**
 * Poller configuration
 */
interface PollerConfig {
    /** State store to poll */
    stateStore: StateStore;
    /** Poll interval in milliseconds (default: 100) */
    pollInterval?: number;
    /** Default timeout in milliseconds (default: 5000) */
    defaultTimeout?: number;
}
/**
 * Poll result
 */
interface PollResult<T = unknown> {
    /** Whether the poll was successful */
    success: boolean;
    /** The result data if successful */
    data?: T;
    /** Error message if failed */
    error?: string;
}
/**
 * Async Poller for callbacks
 * Polls state store for updates
 */
declare class AsyncPoller {
    private stateStore;
    private pollInterval;
    private defaultTimeout;
    constructor(config: PollerConfig);
    /**
     * Wait for callback result
     * @param transactionId - Transaction ID to wait for
     * @param timeout - Timeout in milliseconds (uses default if not provided)
     * @returns Promise resolving to result or rejecting on timeout
     */
    waitForCallback<T = unknown>(transactionId: string, timeout?: number): Promise<T>;
    /**
     * Wait with custom check function
     * @param check - Function to check if condition is met
     * @param timeout - Timeout in milliseconds
     * @returns Promise resolving when condition is met or rejecting on timeout
     */
    waitUntil<T = unknown>(check: () => T | null | undefined, timeout?: number): Promise<T>;
    /**
     * Get the poll interval
     */
    getPollInterval(): number;
    /**
     * Get the default timeout
     */
    getDefaultTimeout(): number;
}
/**
 * Create a callback result for state store
 * @param result - Result data
 * @returns Callback result object
 */
declare function createCallbackResult<T>(result: T): {
    result: T;
};
/**
 * Create a callback error for state store
 * @param error - Error message
 * @returns Callback error object
 */
declare function createCallbackError(error: string): {
    error: string;
};

/**
 * ONDC Search MCP Tool
 * Searches for products and services on ONDC network
 */

/**
 * Dependencies for search tool
 */
interface SearchToolDependencies {
    /** ONDC HTTP client for Beckn API calls */
    client: ONDCClient;
    /** State store for pending transactions */
    stateStore: StateStore;
    /** Async poller for callbacks */
    poller: AsyncPoller;
    /** Callback timeout in milliseconds */
    callbackTimeout?: number;
}
/**
 * Register ondc_search tool with MCP server
 *
 * @param server - MCP server instance
 * @param deps - Tool dependencies (client, state store, poller)
 */
declare function registerSearchTool(server: McpServer, deps: SearchToolDependencies): void;

/**
 * ONDC Webhook Server
 * Express server for receiving ONDC protocol callbacks
 */

/**
 * Handler function type for ONDC callbacks
 */
type WebhookHandler = (message: BecknMessage) => void | Promise<void>;
/**
 * Webhook server configuration
 */
interface WebhookServerConfig {
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
declare class WebhookServer {
    private app;
    private server;
    private handlers;
    private listeningPort;
    private publicKeys;
    private requireSignature;
    constructor(config?: WebhookServerConfig);
    /**
     * Register webhook handler for specific action
     * @param action - Beckn action (e.g., 'on_search', 'on_select')
     * @param handler - Handler function
     */
    on(action: string, handler: WebhookHandler): void;
    /**
     * Register a public key for a subscriber
     * @param subscriberId - Subscriber ID (e.g., "ondc.example.com")
     * @param publicKey - Base64 encoded Ed25519 public key
     */
    registerPublicKey(subscriberId: string, publicKey: string): void;
    /**
     * Remove a public key for a subscriber
     * @param subscriberId - Subscriber ID
     */
    removePublicKey(subscriberId: string): void;
    /**
     * Get the registered public key for a subscriber
     * @param subscriberId - Subscriber ID
     * @returns Public key or undefined if not registered
     */
    getPublicKey(subscriberId: string): string | undefined;
    /**
     * Register webhook endpoints
     */
    private registerEndpoints;
    /**
     * Handle incoming webhook callback
     */
    private handleCallback;
    /**
     * Start the webhook server
     * @param port - Port to listen on (overrides config)
     * @param host - Host to bind to (overrides config)
     */
    start(port?: number, host?: string): Promise<void>;
    /**
     * Stop the webhook server
     */
    stop(): Promise<void>;
    /**
     * Get the actual port the server is listening on
     * Useful when port 0 is used for random port assignment
     */
    getPort(): number | null;
    /**
     * Get the Express app instance
     * Useful for testing or adding custom middleware
     */
    getApp(): Express;
    /**
     * Get registered handler count for an action
     * @param action - Beckn action
     */
    handlerCount(action: string): number;
}

/**
 * Callback Manager
 * Integrates webhook server with state store for transaction correlation
 */

/**
 * Callback manager configuration
 */
interface CallbackManagerConfig {
    /** State store for pending requests */
    stateStore: StateStore;
    /** Async poller for waiting */
    poller: AsyncPoller;
}
/**
 * Callback Manager
 * Manages transaction ID correlation between requests and callbacks
 */
declare class CallbackManager {
    private stateStore;
    private poller;
    private pendingCallbacks;
    constructor(config: CallbackManagerConfig);
    /**
     * Register a pending request
     * @param transactionId - Transaction ID
     * @param type - Request type (e.g., 'search', 'select')
     * @param data - Additional request data
     */
    registerRequest(transactionId: string, type: string, data?: unknown): void;
    /**
     * Wait for callback result
     * @param transactionId - Transaction ID to wait for
     * @param timeout - Timeout in milliseconds (optional)
     * @returns Promise resolving to callback message
     */
    waitForCallback<T = BecknMessage>(transactionId: string, timeout?: number): Promise<T>;
    /**
     * Handle incoming callback and route to waiting promise
     * @param message - Beckn callback message
     */
    handleCallback(message: BecknMessage): void;
    /**
     * Register a one-time handler for a specific transaction
     * @param transactionId - Transaction ID
     * @param handler - Handler function
     */
    onTransaction(transactionId: string, handler: (message: BecknMessage) => void): void;
    /**
     * Complete a request with an error
     * @param transactionId - Transaction ID
     * @param error - Error message
     */
    completeWithError(transactionId: string, error: string): void;
    /**
     * Complete a request with a result
     * @param transactionId - Transaction ID
     * @param result - Result data
     */
    completeWithResult<T>(transactionId: string, result: T): void;
    /**
     * Remove a pending request
     * @param transactionId - Transaction ID
     */
    removeRequest(transactionId: string): void;
    /**
     * Get statistics about pending requests
     * @returns Statistics object
     */
    getStats(): {
        pendingRequests: number;
        waitingHandlers: number;
        stateStoreSize: number;
    };
}

export { AsyncPoller, CallbackManager, type CallbackManagerConfig, Gateway, type MCPServerConfig, ONDCMcpServer, type PendingRequest, type PollResult, type PollerConfig, type SearchToolDependencies, StateStore, type StateStoreConfig, type WebhookHandler, WebhookServer, type WebhookServerConfig, createCallbackError, createCallbackResult, registerSearchTool };
