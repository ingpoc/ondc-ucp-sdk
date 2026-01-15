/**
 * ONDC Seller Client
 * Client for seller-side ONDC protocol operations
 */

import { ONDCClient, type ONDCClientConfig } from '@ondc-agent/shared';
import type {
  BecknContext,
  BecknSearchRequest,
  BecknOnSearchResponse,
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
   * Send a generic request (legacy method - use search() instead)
   * @deprecated Use search() method instead
   */
  async sendRequest(request: unknown): Promise<unknown> {
    console.warn('sendRequest() is deprecated. Use search() instead.');
    return this.client.post('/request', request);
  }
}
