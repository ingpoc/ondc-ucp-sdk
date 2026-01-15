/**
 * ONDC Seller Client
 * Client for seller-side ONDC protocol operations
 */

import { ONDCClient, type ONDCClientConfig } from '@ondc-agent/shared';
import type {
  BecknContext,
  BecknSearchRequest,
  BecknOnSearchResponse,
  BecknSelectRequest,
  BecknOnSelectResponse,
  BecknInitRequest,
  BecknOnInitResponse,
  BecknConfirmRequest,
  BecknOnConfirmResponse,
} from '@ondc-agent/shared';
import { ucpToBecknIntent } from '@ondc-agent/shared';
import type { UCPSearchQuery } from '@ondc-agent/shared';

/**
 * Seller client configuration
 */
export interface SellerClientConfig {
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
export interface SearchResult {
  /** Beckn context from response */
  context: BecknContext;
  /** ONDC catalog data */
  catalog: unknown;
}

/**
 * Parameters for select operation
 */
export interface SelectParams {
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
export interface SelectResult {
  /** Beckn context from response */
  context: BecknContext;
  /** Order with quote details */
  order: unknown;
}

/**
 * Billing information
 */
export interface BillingInfo {
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
export interface PaymentInfo {
  /** Payment type (PRE-FULFILLMENT, ON-FULFILLMENT, POST-FULFILLMENT) */
  type?: 'PRE-FULFILLMENT' | 'ON-FULFILLMENT' | 'POST-FULFILLMENT';
  /** Payment status */
  status?: 'PAID' | 'NOT-PAID';
}

/**
 * Parameters for init operation
 */
export interface InitParams {
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
export interface InitResult {
  /** Beckn context from response */
  context: BecknContext;
  /** Initialized order details */
  order: unknown;
}

/**
 * Parameters for confirm operation
 */
export interface ConfirmParams {
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
export interface ConfirmResult {
  /** Beckn context from response */
  context: BecknContext;
  /** Confirmed order details with order ID */
  order: unknown;
}

/**
 * Seller client for ONDC protocol operations
 */
export class SellerClient {
  private client: ONDCClient;
  private subscriberId: string;
  private bapUri: string;
  private domain: string;
  private country: string;
  private city: string;

  constructor(config: SellerClientConfig) {
    this.subscriberId = config.subscriberId;
    this.bapUri = config.baseUrl;
    this.domain = config.domain ?? 'ONDC:RET10';
    this.country = config.country ?? 'IND';
    this.city = config.city ?? 'std:080';

    const ondcConfig: ONDCClientConfig = {
      baseURL: config.baseUrl,
      subscriberId: config.subscriberId,
      privateKey: config.privateKey,
      keyId: config.keyId,
      timeout: config.timeout,
    };

    this.client = new ONDCClient(ondcConfig);
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Build Beckn context for search request
   */
  private buildContext(action: 'search' | 'select' | 'init' | 'confirm'): BecknContext {
    return {
      domain: this.domain,
      action,
      country: this.country,
      city: this.city,
      core_version: '1.2.0',
      bap_id: this.subscriberId,
      bap_uri: this.bapUri,
      transaction_id: this.generateTransactionId(),
      message_id: this.generateMessageId(),
      timestamp: new Date().toISOString(),
      ttl: 'PT30S',
    };
  }

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
  async search(query: UCPSearchQuery): Promise<SearchResult> {
    // Build Beckn context
    const context = this.buildContext('search');

    // Translate UCP query to Beckn intent
    const intent = ucpToBecknIntent(query);

    // Build search request
    const searchRequest: BecknSearchRequest = {
      context,
      message: {
        intent,
      },
    };

    // Send request to ONDC gateway
    const response = await this.client.post<BecknOnSearchResponse>('/search', searchRequest);

    return {
      context: response.context,
      catalog: response.message?.catalog,
    };
  }

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
  async select(params: SelectParams): Promise<SelectResult> {
    // Build Beckn context for select
    const context = this.buildContext('select');

    // Build order items
    const orderItems = params.items.map((item) => ({
      id: item.id,
      quantity: item.quantity ? { count: item.quantity } : undefined,
      fulfillment_id: item.fulfillmentId,
    }));

    // Build select request
    const selectRequest: BecknSelectRequest = {
      context,
      message: {
        order: {
          provider: {
            id: params.providerId,
          },
          items: orderItems,
          fulfillments: params.fulfillmentId
            ? [{ id: params.fulfillmentId }]
            : undefined,
        },
      },
    };

    // Send request to ONDC gateway
    const response = await this.client.post<BecknOnSelectResponse>('/select', selectRequest);

    return {
      context: response.context,
      order: response.message?.order,
    };
  }

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
  async init(params: InitParams): Promise<InitResult> {
    // Build Beckn context for init
    const context = this.buildContext('init');

    // Build order items
    const orderItems = params.items.map((item) => ({
      id: item.id,
      quantity: item.quantity ? { count: item.quantity } : undefined,
      fulfillment_id: item.fulfillmentId,
    }));

    // Build billing object
    const billing = {
      name: params.billing.name,
      phone: params.billing.phone,
      email: params.billing.email,
      tax_number: params.billing.taxId,
      address: params.billing.address,
    };

    // Build init request
    const initRequest: BecknInitRequest = {
      context,
      message: {
        order: {
          provider: {
            id: params.providerId,
          },
          items: orderItems,
          billing,
          payment: params.payment
            ? {
                type: params.payment.type,
                status: params.payment.status,
              }
            : undefined,
          fulfillments: params.fulfillmentId
            ? [{ id: params.fulfillmentId }]
            : undefined,
        },
      },
    };

    // Send request to ONDC gateway
    const response = await this.client.post<BecknOnInitResponse>('/init', initRequest);

    return {
      context: response.context,
      order: response.message?.order,
    };
  }

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
  async confirm(params: ConfirmParams): Promise<ConfirmResult> {
    // Build Beckn context for confirm
    const context = this.buildContext('confirm');

    // Build order items
    const orderItems = params.items.map((item) => ({
      id: item.id,
      quantity: item.quantity ? { count: item.quantity } : undefined,
      fulfillment_id: item.fulfillmentId,
    }));

    // Build billing object
    const billing = {
      name: params.billing.name,
      phone: params.billing.phone,
      email: params.billing.email,
      tax_number: params.billing.taxId,
      address: params.billing.address,
    };

    // Build confirm request
    const confirmRequest: BecknConfirmRequest = {
      context,
      message: {
        order: {
          id: params.orderId,
          provider: {
            id: params.providerId,
          },
          items: orderItems,
          billing,
          payment: params.payment
            ? {
                type: params.payment.type,
                status: params.payment.status,
              }
            : undefined,
          fulfillments: params.fulfillmentId
            ? [{ id: params.fulfillmentId }]
            : undefined,
        },
      },
    };

    // Send request to ONDC gateway
    const response = await this.client.post<BecknOnConfirmResponse>('/confirm', confirmRequest);

    return {
      context: response.context,
      order: response.message?.order,
    };
  }

  /**
   * Send a generic request (legacy method - use search() instead)
   * @deprecated Use search() method instead
   */
  async sendRequest(request: unknown): Promise<unknown> {
    console.warn('sendRequest() is deprecated. Use search() instead.');
    return this.client.post('/request', request);
  }
}
