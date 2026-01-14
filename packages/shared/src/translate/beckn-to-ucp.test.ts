/**
 * Beckn to UCP Translator Tests
 */

import { describe, it, expect } from 'vitest';
import { becknToUcpCatalog } from './beckn-to-ucp';
import type { BecknOnSearchResponse } from '../types/beckn';

describe('Beckn to UCP Translator', () => {
  describe('becknToUcpCatalog', () => {
    it('should translate empty catalog', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should translate catalog with provider and items', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: {
                  name: 'Test Store',
                  images: [{ url: 'https://example.com/logo.png' }],
                },
                rating: 4.5,
                locations: [
                  {
                    id: 'loc-1',
                    gps: '28.6139,77.2090',
                    address: {
                      city: 'New Delhi',
                      state: 'Delhi',
                      country: 'India',
                    },
                  },
                ],
                categories: [
                  {
                    id: 'cat-1',
                    descriptor: { name: 'Electronics' },
                  },
                ],
                items: [
                  {
                    id: 'item-1',
                    descriptor: {
                      name: 'Smartphone',
                      short_desc: 'A great smartphone',
                      images: [
                        { url: 'https://example.com/phone1.jpg' },
                        { url: 'https://example.com/phone2.jpg' },
                      ],
                    },
                    price: {
                      currency: 'INR',
                      value: '15000',
                      offered_value: '12000',
                    },
                    category_id: 'cat-1',
                    rating: 4.2,
                    quantity: { count: 10 },
                    '@ondc/org/returnable': true,
                    '@ondc/org/cancellable': true,
                    '@ondc/org/available_on_cod': true,
                  },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);

      const item = result.items[0];
      expect(item.id).toBe('item-1');
      expect(item.name).toBe('Smartphone');
      expect(item.description).toBe('A great smartphone');
      expect(item.images).toHaveLength(2);
      expect(item.price).toEqual({ currency: 'INR', value: '12000' });
      expect(item.originalPrice).toEqual({ currency: 'INR', value: '15000' });
      expect(item.provider.id).toBe('provider-1');
      expect(item.provider.name).toBe('Test Store');
      expect(item.provider.rating?.value).toBe(4.5);
      expect(item.category).toBe('Electronics');
      expect(item.rating?.value).toBe(4.2);
      expect(item.availableQuantity).toBe(10);
      expect(item.returnable).toBe(true);
      expect(item.cancellable).toBe(true);
      expect(item.codAvailable).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                items: [
                  {
                    id: 'item-1',
                    descriptor: {
                      name: 'Basic Item',
                    },
                    price: {
                      currency: 'INR',
                      value: '100',
                    },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items).toHaveLength(1);

      const item = result.items[0];
      expect(item.name).toBe('Basic Item');
      expect(item.description).toBeUndefined();
      expect(item.images).toEqual([]);
      expect(item.price).toEqual({ currency: 'INR', value: '100' });
      expect(item.originalPrice).toBeUndefined();
      expect(item.provider.name).toBe('Unknown Provider');
      expect(item.category).toBeUndefined();
      expect(item.rating).toBeUndefined();
      expect(item.availableQuantity).toBeUndefined();
      expect(item.returnable).toBeUndefined();
    });

    it('should handle multiple providers with items', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: { name: 'Store A' },
                items: [
                  { id: 'item-1', descriptor: { name: 'Product A' }, price: { currency: 'INR', value: '100' } },
                  { id: 'item-2', descriptor: { name: 'Product B' }, price: { currency: 'INR', value: '200' } },
                ],
              },
              {
                id: 'provider-2',
                descriptor: { name: 'Store B' },
                items: [
                  { id: 'item-3', descriptor: { name: 'Product C' }, price: { currency: 'INR', value: '300' } },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.items[0].provider.id).toBe('provider-1');
      expect(result.items[2].provider.id).toBe('provider-2');
    });

    it('should translate GPS coordinates correctly', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: { name: 'Test Store' },
                locations: [
                  {
                    gps: '28.6139,77.2090',
                    address: { city: 'Delhi', state: 'DL', country: 'India', area_code: '110001' },
                  },
                ],
                items: [
                  {
                    id: 'item-1',
                    descriptor: { name: 'Item' },
                    price: { currency: 'INR', value: '100' },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      const provider = result.items[0].provider;
      expect(provider.location?.latitude).toBe(28.6139);
      expect(provider.location?.longitude).toBe(77.209);
      expect(provider.location?.city).toBe('Delhi');
      expect(provider.location?.state).toBe('DL');
      expect(provider.location?.country).toBe('India');
      expect(provider.location?.postalCode).toBe('110001');
    });

    it('should use long_desc if short_desc is missing', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                items: [
                  {
                    id: 'item-1',
                    descriptor: {
                      name: 'Item',
                      long_desc: 'This is a long description',
                    },
                    price: { currency: 'INR', value: '100' },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items[0].description).toBe('This is a long description');
    });

    it('should handle item without price', () => {
      const response: BecknOnSearchResponse = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00.000Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                items: [
                  {
                    id: 'item-1',
                    descriptor: { name: 'Free Item' },
                  },
                ],
              },
            ],
          },
        },
      };

      const result = becknToUcpCatalog(response);

      expect(result.items[0].price).toEqual({ currency: 'INR', value: '0' });
    });
  });
});
