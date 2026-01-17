import { UCPSearchQuery, BecknContext } from '@ondc-agent/shared';

/**
 * ONDC Seller Client
 * Client for seller-side ONDC protocol operations
 */

/**
 * Seller client configuration
 */
interface SellerClientConfig {
    /** ONDC gateway base URL */
    baseUrl: string;
    /** Subscriber ID (e.g., "ondc.example.com") */
    subscriberId: string;
    /** Base64 encoded Ed25519 private key */
    privateKey: string;
    /** Unique key identifier */
    keyId?: string;
    /** Default domain for requests */
    domain?: string;
    /** Default country code */
    country?: string;
    /** Default city code */
    city?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
}
/**
 * Search result with catalog
 */
interface SearchResult {
    /** Beckn context from response */
    context: BecknContext;
    /** ONDC catalog data */
    catalog: unknown;
}
/**
 * Parameters for select operation
 */
interface SelectParams {
    /** Provider ID from search results */
    providerId: string;
    /** Items to select with quantities */
    items: Array<{
        id: string;
        quantity?: number;
        fulfillmentId?: string;
    }>;
    /** Fulfillment ID for delivery location */
    fulfillmentId?: string;
}
/**
 * Select result with order quote
 */
interface SelectResult {
    /** Beckn context from response */
    context: BecknContext;
    /** Order with quote details */
    order: unknown;
}
/**
 * Billing information
 */
interface BillingInfo {
    /** Customer name */
    name: string;
    /** Phone number with country code */
    phone: string;
    /** Email address */
    email: string;
    /** Tax ID (GSTIN) */
    taxId?: string;
    /** Address as string */
    address?: string;
}
/**
 * Payment information
 */
interface PaymentInfo {
    /** Payment type (PRE-FULFILLMENT, ON-FULFILLMENT, POST-FULFILLMENT) */
    type?: 'PRE-FULFILLMENT' | 'ON-FULFILLMENT' | 'POST-FULFILLMENT';
    /** Payment status */
    status?: 'PAID' | 'NOT-PAID';
}
/**
 * Parameters for init operation
 */
interface InitParams {
    /** Provider ID from select response */
    providerId: string;
    /** Items to initialize with quantities */
    items: Array<{
        id: string;
        quantity?: number;
        fulfillmentId?: string;
    }>;
    /** Billing information */
    billing: BillingInfo;
    /** Payment information */
    payment?: PaymentInfo;
    /** Fulfillment ID */
    fulfillmentId?: string;
}
/**
 * Init result with initialized order
 */
interface InitResult {
    /** Beckn context from response */
    context: BecknContext;
    /** Initialized order details */
    order: unknown;
}
/**
 * Parameters for confirm operation
 */
interface ConfirmParams {
    /** Provider ID from init response */
    providerId: string;
    /** Order ID from init response */
    orderId: string;
    /** Items to confirm with quantities */
    items: Array<{
        id: string;
        quantity?: number;
        fulfillmentId?: string;
    }>;
    /** Billing information */
    billing: BillingInfo;
    /** Payment information */
    payment?: PaymentInfo;
    /** Fulfillment ID */
    fulfillmentId?: string;
}
/**
 * Confirm result with confirmed order
 */
interface ConfirmResult {
    /** Beckn context from response */
    context: BecknContext;
    /** Confirmed order details with order ID */
    order: unknown;
}
/**
 * Seller client for ONDC protocol operations
 */
declare class SellerClient {
    private client;
    private subscriberId;
    private bapUri;
    private domain;
    private country;
    private city;
    constructor(config: SellerClientConfig);
    private buildContext;
    /**
     * Search ONDC network for products
     *
     * @param query - UCP search query parameters
     * @returns Promise resolving to search result with catalog
     *
     * @example
     * ```ts
     * const client = new SellerClient({
     *   baseUrl: 'https://gateway.ondc.org',
     *   subscriberId: 'ondc.example.com',
     *   privateKey: privateKeyBase64
     * });
     *
     * const result = await client.search({
     *   query: 'smartphone',
     *   category: 'Electronics',
     *   location: { latitude: 28.6139, longitude: 77.2090 }
     * });
     * ```
     */
    search(query: UCPSearchQuery): Promise<SearchResult>;
    /**
     * Select items from search results for order initialization
     *
     * @param params - Select parameters with provider and items
     * @returns Promise resolving to select result with order quote
     *
     * @example
     * ```ts
     * const result = await client.select({
     *   providerId: 'provider-123',
     *   items: [
     *     { id: 'item-1', quantity: 2 },
     *     { id: 'item-2', quantity: 1 }
     *   ]
     * });
     * ```
     */
    select(params: SelectParams): Promise<SelectResult>;
    /**
     * Initialize order with billing and payment details
     *
     * @param params - Init parameters with billing and payment
     * @returns Promise resolving to init result with order details
     *
     * @example
     * ```ts
     * const result = await client.init({
     *   providerId: 'provider-123',
     *   items: [
     *     { id: 'item-1', quantity: 2 }
     *   ],
     *   billing: {
     *     name: 'John Doe',
     *     phone: '+919876543210',
     *     email: 'john@example.com'
     *   },
     *   payment: {
     *     type: 'ON-FULFILLMENT',
     *     status: 'NOT-PAID'
     *   }
     * });
     * ```
     */
    init(params: InitParams): Promise<InitResult>;
    /**
     * Confirm order to complete transaction
     *
     * @param params - Confirm parameters with order ID
     * @returns Promise resolving to confirm result with confirmed order
     *
     * @example
     * ```ts
     * const result = await client.confirm({
     *   providerId: 'provider-123',
     *   orderId: 'order-abc-123',
     *   items: [
     *     { id: 'item-1', quantity: 2 }
     *   ],
     *   billing: {
     *     name: 'John Doe',
     *     phone: '+919876543210',
     *     email: 'john@example.com'
     *   },
     *   payment: {
     *     type: 'ON-FULFILLMENT',
     *     status: 'NOT-PAID'
     *   }
     * });
     * ```
     */
    confirm(params: ConfirmParams): Promise<ConfirmResult>;
    /**
     * Send a generic request (legacy method - use search() instead)
     * @deprecated Use search() method instead
     */
    sendRequest(request: unknown): Promise<unknown>;
}

export { type BillingInfo, type ConfirmParams, type ConfirmResult, type InitParams, type InitResult, type PaymentInfo, type SearchResult, type SelectParams, type SelectResult, SellerClient, type SellerClientConfig };
