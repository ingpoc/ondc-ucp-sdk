/**
 * SellerClient Tests
 * Unit tests for SellerClient search method
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SellerClient, type SellerClientConfig } from '../client';

// Mock ONDCClient
vi.mock('@ondc-agent/shared', async () => {
  const actual = await vi.importActual<typeof import('@ondc-agent/shared')>('@ondc-agent/shared');
  return {
    ...actual,
    ONDCClient: vi.fn().mockImplementation(() => ({
      post: vi.fn().mockImplementation((path: string) => {
        if (path === '/search') {
          return Promise.resolve({
            context: {
              domain: 'ONDC:RET10',
              action: 'on_search',
              country: 'IND',
              city: 'std:080',
              bap_id: 'test-seller.com',
              bap_uri: 'https://test-seller.com',
              transaction_id: 'txn-123',
              message_id: 'msg-456',
              timestamp: '2025-01-15T10:00:00.000Z',
            },
            message: {
              catalog: {
                'bpp/descriptor': { name: 'Test Store' },
                'bpp/providers': [
                  {
                    id: 'provider-1',
                    descriptor: { name: 'Provider One' },
                    items: [
                      {
                        id: 'item-1',
                        descriptor: { name: 'Test Item' },
                        price: { currency: 'INR', value: '999.00' },
                      },
                    ],
                  },
                ],
              },
            },
          });
        }
        if (path === '/select') {
          return Promise.resolve({
            context: {
              domain: 'ONDC:RET10',
              action: 'on_select',
              country: 'IND',
              city: 'std:080',
              bap_id: 'test-seller.com',
              bap_uri: 'https://test-seller.com',
              transaction_id: 'txn-124',
              message_id: 'msg-457',
              timestamp: '2025-01-15T10:01:00.000Z',
            },
            message: {
              order: {
                provider: { id: 'provider-1' },
                items: [
                  { id: 'item-1', quantity: { count: 2 } },
                ],
                quote: {
                  price: { currency: 'INR', value: '1998.00' },
                  breakup: [
                    {
                      item: { id: 'item-1' },
                      price: { currency: 'INR', value: '999.00' },
                    },
                  ],
                },
              },
            },
          });
        }
        if (path === '/request') {
          return Promise.resolve({});
        }
        if (path === '/init') {
          return Promise.resolve({
            context: {
              domain: 'ONDC:RET10',
              action: 'on_init',
              country: 'IND',
              city: 'std:080',
              bap_id: 'test-seller.com',
              bap_uri: 'https://test-seller.com',
              transaction_id: 'txn-125',
              message_id: 'msg-458',
              timestamp: '2025-01-15T10:02:00.000Z',
            },
            message: {
              order: {
                provider: { id: 'provider-1' },
                items: [
                  { id: 'item-1', quantity: { count: 2 } },
                ],
                billing: {
                  name: 'John Doe',
                  phone: '+919876543210',
                  email: 'john@example.com',
                },
                payment: {
                  type: 'ON-FULFILLMENT',
                  status: 'NOT-PAID',
                },
              },
            },
          });
        }
        if (path === '/confirm') {
          return Promise.resolve({
            context: {
              domain: 'ONDC:RET10',
              action: 'on_confirm',
              country: 'IND',
              city: 'std:080',
              bap_id: 'test-seller.com',
              bap_uri: 'https://test-seller.com',
              transaction_id: 'txn-126',
              message_id: 'msg-459',
              timestamp: '2025-01-15T10:03:00.000Z',
            },
            message: {
              order: {
                id: 'order-abc-123',
                state: 'Created',
                provider: { id: 'provider-1' },
                items: [
                  { id: 'item-1', quantity: { count: 2 } },
                ],
                billing: {
                  name: 'John Doe',
                  phone: '+919876543210',
                  email: 'john@example.com',
                },
                payment: {
                  type: 'ON-FULFILLMENT',
                  status: 'NOT-PAID',
                },
              },
            },
          });
        }
        return Promise.reject(new Error('Unknown path'));
      }),
    })),
  };
});

describe('SellerClient', () => {
  let client: SellerClient;
  let config: SellerClientConfig;

  beforeEach(() => {
    config = {
      baseUrl: 'https://gateway.ondc.org',
      subscriberId: 'test-seller.com',
      privateKey: 'dGVzdC1wcml2YXRlLWtleS1iYXNlNjQ=', // base64 encoded test key
      keyId: 'test-key-1',
      domain: 'ONDC:RET10',
      country: 'IND',
      city: 'std:080',
    };
    client = new SellerClient(config);
  });

  describe('constructor', () => {
    it('should create client with config', () => {
      expect(client).toBeDefined();
    });

    it('should use defaults for optional config', () => {
      const minimalClient = new SellerClient({
        baseUrl: 'https://gateway.ondc.org',
        subscriberId: 'test-seller.com',
        privateKey: 'dGVzdC1wcml2YXRlLWtleS1iYXNlNjQ=',
      });
      expect(minimalClient).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search with basic query', async () => {
      const result = await client.search({
        query: 'smartphone',
      });

      expect(result.context).toBeDefined();
      expect(result.context.action).toBe('on_search');
      expect(result.catalog).toBeDefined();
    });

    it('should search with category', async () => {
      const result = await client.search({
        query: 'groceries',
        category: 'Food & Beverages',
      });

      expect(result.catalog).toBeDefined();
    });

    it('should search with location filter', async () => {
      const result = await client.search({
        query: 'restaurant',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          city: 'Delhi',
          state: 'DL',
        },
      });

      expect(result.catalog).toBeDefined();
    });

    it('should search with price range', async () => {
      const result = await client.search({
        query: 'laptop',
        priceRange: {
          min: 30000,
          max: 50000,
        },
      });

      expect(result.catalog).toBeDefined();
    });

    it('should search with minimum rating', async () => {
      const result = await client.search({
        query: 'electronics',
        minRating: 4.0,
      });

      expect(result.catalog).toBeDefined();
    });

    it('should search with custom filters', async () => {
      const result = await client.search({
        query: 'clothing',
        filters: {
          brand: 'Nike',
          size: 'M',
        },
      });

      expect(result.catalog).toBeDefined();
    });

    it('should search with combined filters', async () => {
      const result = await client.search({
        query: 'headphones',
        category: 'Electronics',
        priceRange: {
          min: 1000,
          max: 5000,
        },
        minRating: 3.5,
        location: {
          latitude: 19.076,
          longitude: 72.8777,
          city: 'Mumbai',
        },
      });

      expect(result.catalog).toBeDefined();
    });
  });

  describe('select', () => {
    it('should select single item', async () => {
      const result = await client.select({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 1 }],
      });

      expect(result.context).toBeDefined();
      expect(result.context.action).toBe('on_select');
      expect(result.order).toBeDefined();
    });

    it('should select multiple items with quantities', async () => {
      const result = await client.select({
        providerId: 'provider-1',
        items: [
          { id: 'item-1', quantity: 2 },
          { id: 'item-2', quantity: 1 },
        ],
      });

      expect(result.order).toBeDefined();
    });

    it('should select with fulfillment ID', async () => {
      const result = await client.select({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 1 }],
        fulfillmentId: 'fulfillment-1',
      });

      expect(result.order).toBeDefined();
    });

    it('should select item without quantity', async () => {
      const result = await client.select({
        providerId: 'provider-1',
        items: [{ id: 'item-1' }],
      });

      expect(result.order).toBeDefined();
    });

    it('should select with item-level fulfillment ID', async () => {
      const result = await client.select({
        providerId: 'provider-1',
        items: [
          { id: 'item-1', quantity: 1, fulfillmentId: 'fulfillment-1' },
        ],
      });

      expect(result.order).toBeDefined();
    });
  });

  describe('init', () => {
    it('should init order with billing info', async () => {
      const result = await client.init({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 2 }],
        billing: {
          name: 'John Doe',
          phone: '+919876543210',
          email: 'john@example.com',
        },
      });

      expect(result.context).toBeDefined();
      expect(result.context.action).toBe('on_init');
      expect(result.order).toBeDefined();
    });

    it('should init order with payment details', async () => {
      const result = await client.init({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 1 }],
        billing: {
          name: 'Jane Doe',
          phone: '+919876543211',
          email: 'jane@example.com',
        },
        payment: {
          type: 'ON-FULFILLMENT',
          status: 'NOT-PAID',
        },
      });

      expect(result.order).toBeDefined();
    });

    it('should init order with billing address', async () => {
      const result = await client.init({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 1 }],
        billing: {
          name: 'Test User',
          phone: '+919876543212',
          email: 'test@example.com',
          address: {
            street: '123 Main St',
            city: 'Bangalore',
            state: 'KA',
            postalCode: '560001',
            country: 'IND',
          },
        },
      });

      expect(result.order).toBeDefined();
    });

    it('should init order with tax ID', async () => {
      const result = await client.init({
        providerId: 'provider-1',
        items: [{ id: 'item-1', quantity: 1 }],
        billing: {
          name: 'Business User',
          phone: '+919876543213',
          email: 'business@example.com',
          taxId: '29ABCDE1234F1Z5',
        },
      });

      expect(result.order).toBeDefined();
    });

    it('should init order with multiple items', async () => {
      const result = await client.init({
        providerId: 'provider-1',
        items: [
          { id: 'item-1', quantity: 2 },
          { id: 'item-2', quantity: 1 },
        ],
        billing: {
          name: 'Multi Item User',
          phone: '+919876543214',
          email: 'multi@example.com',
        },
      });

      expect(result.order).toBeDefined();
    });
  });

  describe('confirm', () => {
    it('should confirm order with order ID', async () => {
      const result = await client.confirm({
        providerId: 'provider-1',
        orderId: 'order-abc-123',
        items: [{ id: 'item-1', quantity: 2 }],
        billing: {
          name: 'John Doe',
          phone: '+919876543210',
          email: 'john@example.com',
        },
      });

      expect(result.context).toBeDefined();
      expect(result.context.action).toBe('on_confirm');
      expect(result.order).toBeDefined();
    });

    it('should confirm order with payment details', async () => {
      const result = await client.confirm({
        providerId: 'provider-1',
        orderId: 'order-xyz-789',
        items: [{ id: 'item-1', quantity: 1 }],
        billing: {
          name: 'Jane Doe',
          phone: '+919876543211',
          email: 'jane@example.com',
        },
        payment: {
          type: 'ON-FULFILLMENT',
          status: 'NOT-PAID',
        },
      });

      expect(result.order).toBeDefined();
    });

    it('should confirm order with billing address', async () => {
      const result = await client.confirm({
        providerId: 'provider-1',
        orderId: 'order-def-456',
        items: [{ id: 'item-1', quantity: 1 }],
        billing: {
          name: 'Test User',
          phone: '+919876543212',
          email: 'test@example.com',
          address: {
            street: '456 Oak Ave',
            city: 'Mumbai',
            state: 'MH',
            postalCode: '400001',
            country: 'IND',
          },
        },
      });

      expect(result.order).toBeDefined();
    });

    it('should confirm order with multiple items', async () => {
      const result = await client.confirm({
        providerId: 'provider-1',
        orderId: 'order-multi-123',
        items: [
          { id: 'item-1', quantity: 3 },
          { id: 'item-2', quantity: 1 },
        ],
        billing: {
          name: 'Multi Item Buyer',
          phone: '+919876543215',
          email: 'buyer@example.com',
        },
      });

      expect(result.order).toBeDefined();
    });
  });

  describe('sendRequest (deprecated)', () => {
    it('should warn and call ONDCClient', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await client.sendRequest({ test: 'request' });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
