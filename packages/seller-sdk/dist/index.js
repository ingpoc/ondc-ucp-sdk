// src/client.ts
import { ONDCClient } from "@ondc-agent/shared";
import { ucpToBecknIntent } from "@ondc-agent/shared";
var DEFAULT_CONFIG = {
  domain: "ONDC:RET10",
  country: "IND",
  city: "std:080",
  coreVersion: "1.2.0",
  ttl: "PT30S"
};
function generateUniqueId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
function mapItemsToOrderItems(items) {
  return items.map((item) => ({
    id: item.id,
    quantity: item.quantity ? { count: item.quantity } : void 0,
    fulfillment_id: item.fulfillmentId
  }));
}
function mapBillingInfo(billing) {
  return {
    name: billing.name,
    phone: billing.phone,
    email: billing.email,
    tax_number: billing.taxId,
    address: billing.address
  };
}
var SellerClient = class {
  client;
  subscriberId;
  bapUri;
  domain;
  country;
  city;
  constructor(config) {
    this.subscriberId = config.subscriberId;
    this.bapUri = config.baseUrl;
    this.domain = config.domain ?? DEFAULT_CONFIG.domain;
    this.country = config.country ?? DEFAULT_CONFIG.country;
    this.city = config.city ?? DEFAULT_CONFIG.city;
    const ondcConfig = {
      baseURL: config.baseUrl,
      subscriberId: config.subscriberId,
      privateKey: config.privateKey,
      keyId: config.keyId,
      timeout: config.timeout
    };
    this.client = new ONDCClient(ondcConfig);
  }
  buildContext(action) {
    return {
      domain: this.domain,
      action,
      country: this.country,
      city: this.city,
      core_version: DEFAULT_CONFIG.coreVersion,
      bap_id: this.subscriberId,
      bap_uri: this.bapUri,
      transaction_id: generateUniqueId("txn"),
      message_id: generateUniqueId("msg"),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ttl: DEFAULT_CONFIG.ttl
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
  async search(query) {
    const context = this.buildContext("search");
    const intent = ucpToBecknIntent(query);
    const searchRequest = {
      context,
      message: { intent }
    };
    const response = await this.client.post("/search", searchRequest);
    return {
      context: response.context,
      catalog: response.message?.catalog
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
  async select(params) {
    const context = this.buildContext("select");
    const orderItems = mapItemsToOrderItems(params.items);
    const selectRequest = {
      context,
      message: {
        order: {
          provider: { id: params.providerId },
          items: orderItems,
          fulfillments: params.fulfillmentId ? [{ id: params.fulfillmentId }] : void 0
        }
      }
    };
    const response = await this.client.post("/select", selectRequest);
    return {
      context: response.context,
      order: response.message?.order
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
  async init(params) {
    const context = this.buildContext("init");
    const orderItems = mapItemsToOrderItems(params.items);
    const billing = mapBillingInfo(params.billing);
    const initRequest = {
      context,
      message: {
        order: {
          provider: { id: params.providerId },
          items: orderItems,
          billing,
          payment: params.payment ? {
            type: params.payment.type,
            status: params.payment.status
          } : void 0,
          fulfillments: params.fulfillmentId ? [{ id: params.fulfillmentId }] : void 0
        }
      }
    };
    const response = await this.client.post("/init", initRequest);
    return {
      context: response.context,
      order: response.message?.order
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
  async confirm(params) {
    const context = this.buildContext("confirm");
    const orderItems = mapItemsToOrderItems(params.items);
    const billing = mapBillingInfo(params.billing);
    const confirmRequest = {
      context,
      message: {
        order: {
          id: params.orderId,
          provider: { id: params.providerId },
          items: orderItems,
          billing,
          payment: params.payment ? {
            type: params.payment.type,
            status: params.payment.status
          } : void 0,
          fulfillments: params.fulfillmentId ? [{ id: params.fulfillmentId }] : void 0
        }
      }
    };
    const response = await this.client.post("/confirm", confirmRequest);
    return {
      context: response.context,
      order: response.message?.order
    };
  }
  /**
   * Send a generic request (legacy method - use search() instead)
   * @deprecated Use search() method instead
   */
  async sendRequest(request) {
    console.warn("sendRequest() is deprecated. Use search() instead.");
    return this.client.post("/request", request);
  }
};
export {
  SellerClient
};
