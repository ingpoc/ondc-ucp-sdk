import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ONDCClient, BecknMessage, BecknCatalog, BecknContext } from '@ondc-agent/shared';
import { Express } from 'express';

interface GatewayConfig {
    port: number;
}
declare class Gateway {
    private config;
    constructor(config: GatewayConfig);
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

interface PendingRequest {
    transactionId: string;
    createdAt: Date;
    type: string;
    data?: unknown;
}
interface StateStoreConfig {
    ttl?: number;
}
declare class StateStore {
    private store;
    private ttl;
    private cleanupTimer;
    constructor(config?: StateStoreConfig);
    set(transactionId: string, state: Omit<PendingRequest, 'transactionId' | 'createdAt'>): void;
    get(transactionId: string): PendingRequest | undefined;
    delete(transactionId: string): boolean;
    has(transactionId: string): boolean;
    keys(): string[];
    size(): number;
    clear(): void;
    stopCleanup(): void;
    private startCleanup;
    private cleanup;
    getStats(): {
        size: number;
        ttl: number;
        keys: string[];
    };
}

interface PollerConfig {
    stateStore: StateStore;
    pollInterval?: number;
    defaultTimeout?: number;
}
interface PollResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}
declare class AsyncPoller {
    private stateStore;
    private pollInterval;
    private defaultTimeout;
    constructor(config: PollerConfig);
    waitForCallback<T = unknown>(transactionId: string, timeout?: number): Promise<T>;
    waitUntil<T = unknown>(check: () => T | null | undefined, timeout?: number): Promise<T>;
    private poll;
    getPollInterval(): number;
    getDefaultTimeout(): number;
}
declare function createCallbackResult<T>(result: T): {
    result: T;
};
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
 * WEEK2-002: Enhanced with streaming support
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
     * Register webhook handler for action
     */
    on(action: string, handler: WebhookHandler): void;
    /**
     * Register public key for subscriber
     */
    registerPublicKey(subscriberId: string, publicKey: string): void;
    /**
     * Remove public key for subscriber
     */
    removePublicKey(subscriberId: string): void;
    /**
     * Get registered public key for subscriber
     */
    getPublicKey(subscriberId: string): string | undefined;
    /** Register webhook endpoints */
    private registerEndpoints;
    /** Handle incoming webhook callback */
    private handleCallback;
    /**
     * Start webhook server
     */
    start(port?: number, host?: string): Promise<void>;
    /** Stop webhook server */
    stop(): Promise<void>;
    /**
     * Get actual listening port
     */
    getPort(): number | null;
    /** Get Express app instance */
    getApp(): Express;
    /** Get registered handler count for action */
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
     * Register pending request
     */
    registerRequest(transactionId: string, type: string, data?: unknown): void;
    /**
     * Wait for callback result
     */
    waitForCallback<T = BecknMessage>(transactionId: string, timeout?: number): Promise<T>;
    /**
     * Handle incoming callback and route to waiting promise
     */
    handleCallback(message: BecknMessage): void;
    /**
     * Register one-time handler for transaction
     */
    onTransaction(transactionId: string, handler: (message: BecknMessage) => void): void;
    /**
     * Complete request with error
     */
    completeWithError(transactionId: string, error: string): void;
    /**
     * Complete request with result
     */
    completeWithResult<T>(transactionId: string, result: T): void;
    /**
     * Remove pending request
     */
    removeRequest(transactionId: string): void;
    /**
     * Get statistics about pending requests
     */
    getStats(): {
        pendingRequests: number;
        waitingHandlers: number;
        stateStoreSize: number;
    };
}

/**
 * Mock ONDC Gateway Server
 * Simulates ONDC network for integration testing
 */

/**
 * Mock gateway configuration
 */
interface MockGatewayConfig {
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
interface MockGatewayResponse {
    message: {
        ack: {
            status: 'ACK' | 'NACK';
        };
    };
}
/**
 * Mock ONDC Gateway Server
 * Simulates ONDC network behavior for integration testing
 */
declare class MockGateway {
    private app;
    private server;
    private port;
    private config;
    private callbackUrls;
    constructor(config?: MockGatewayConfig);
    /**
     * Setup Express routes
     */
    private setupRoutes;
    /**
     * Send on_search callback
     */
    private sendOnSearchCallback;
    /**
     * Start the mock gateway server
     * @returns Promise resolving to the assigned port
     */
    start(): Promise<number>;
    /**
     * Stop the mock gateway server
     */
    stop(): Promise<void>;
    /**
     * Get the base URL of the mock gateway
     */
    getBaseUrl(): string;
    /**
     * Get the current port
     */
    getPort(): number;
    /**
     * Check if server is running
     */
    isRunning(): boolean;
    /**
     * Update catalog data
     */
    setCatalog(catalog: BecknCatalog): void;
    /**
     * Update callback delay
     */
    setCallbackDelay(delay: number): void;
    /**
     * Manually trigger a callback for a transaction
     */
    triggerCallback(transactionId: string, context: BecknContext): Promise<void>;
    /**
     * Get Express app for custom middleware
     */
    getApp(): Express;
}
/**
 * Create and start a mock gateway
 * Convenience function for quick setup in tests
 */
declare function createMockGateway(config?: MockGatewayConfig): Promise<MockGateway>;

export { AsyncPoller, CallbackManager, type CallbackManagerConfig, Gateway, type MCPServerConfig, MockGateway, type MockGatewayConfig, type MockGatewayResponse, ONDCMcpServer, type PendingRequest, type PollResult, type PollerConfig, type SearchToolDependencies, StateStore, type StateStoreConfig, type WebhookHandler, WebhookServer, type WebhookServerConfig, createCallbackError, createCallbackResult, createMockGateway, registerSearchTool };
