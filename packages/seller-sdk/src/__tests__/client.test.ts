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
      post: vi.fn().mockResolvedValue({
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
