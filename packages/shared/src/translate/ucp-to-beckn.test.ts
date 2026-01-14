/**
 * UCP to Beckn Translator Tests
 */

import { describe, it, expect } from 'vitest';
import { ucpToBecknIntent } from './ucp-to-beckn';
import type { UCPSearchQuery } from '../types/ucp';

describe('UCP to Beckn Translator', () => {
  describe('ucpToBecknIntent', () => {
    it('should translate basic search query', () => {
      const query: UCPSearchQuery = {
        query: 'smartphone',
      };

      const result = ucpToBecknIntent(query);

      expect(result).toEqual({
        item: {
          descriptor: {
            name: 'smartphone',
          },
        },
      });
    });

    it('should translate category filter', () => {
      const query: UCPSearchQuery = {
        query: 'phone',
        category: 'Electronics',
      };

      const result = ucpToBecknIntent(query);

      expect(result.category).toEqual({
        descriptor: {
          name: 'Electronics',
        },
      });
      expect(result.item?.descriptor?.name).toBe('phone');
    });

    it('should translate location with GPS', () => {
      const query: UCPSearchQuery = {
        query: 'restaurant',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.fulfillment?.start?.location?.gps).toBe('28.6139,77.209');
    });

    it('should translate location with address', () => {
      const query: UCPSearchQuery = {
        query: 'grocery',
        location: {
          city: 'New Delhi',
          state: 'Delhi',
          country: 'India',
          postalCode: '110001',
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.fulfillment?.start?.location?.address).toEqual({
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        area_code: '110001',
      });
    });

    it('should translate location with radius', () => {
      const query: UCPSearchQuery = {
        query: 'cafe',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          radius: 5, // 5km
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.fulfillment?.start?.location?.circle).toEqual({
        gps: '28.6139,77.209',
        radius: {
          value: '5000', // 5km = 5000m
          unit: 'm',
        },
      });
    });

    it('should translate price range', () => {
      const query: UCPSearchQuery = {
        query: 'laptop',
        priceRange: {
          min: 30000,
          max: 50000,
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.item?.price).toEqual({
        currency: 'INR',
        value: '50000',
        minimum_value: '30000',
        maximum_value: '50000',
      });
    });

    it('should translate min price only', () => {
      const query: UCPSearchQuery = {
        query: 'item',
        priceRange: {
          min: 1000,
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.item?.price?.minimum_value).toBe('1000');
    });

    it('should translate max price only', () => {
      const query: UCPSearchQuery = {
        query: 'item',
        priceRange: {
          max: 5000,
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.item?.price?.maximum_value).toBe('5000');
    });

    it('should translate minimum rating', () => {
      const query: UCPSearchQuery = {
        query: 'hotel',
        minRating: 4.0,
      };

      const result = ucpToBecknIntent(query);

      expect(result.item?.tags).toContainEqual({
        code: 'min_rating',
        name: 'Minimum Rating',
        display: true,
        list: [
          {
            code: 'value',
            name: 'Value',
            value: '4',
          },
        ],
      });
    });

    it('should translate custom filters', () => {
      const query: UCPSearchQuery = {
        query: 'clothing',
        filters: {
          color: 'blue',
          size: 'M',
          brand: 'Nike',
        },
      };

      const result = ucpToBecknIntent(query);

      const tags = result.item?.tags ?? [];
      expect(tags).toContainEqual({
        code: 'color',
        name: 'color',
        display: false,
        list: [{ code: 'value', name: 'Value', value: 'blue' }],
      });
      expect(tags).toContainEqual({
        code: 'size',
        name: 'size',
        display: false,
        list: [{ code: 'value', name: 'Value', value: 'M' }],
      });
      expect(tags).toContainEqual({
        code: 'brand',
        name: 'brand',
        display: false,
        list: [{ code: 'value', name: 'Value', value: 'Nike' }],
      });
    });

    it('should handle empty query', () => {
      const query: UCPSearchQuery = {};

      const result = ucpToBecknIntent(query);

      expect(result).toEqual({});
    });

    it('should combine all filters', () => {
      const query: UCPSearchQuery = {
        query: 'smartphone',
        category: 'Electronics',
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          city: 'New Delhi',
        },
        priceRange: { min: 10000, max: 20000 },
        minRating: 4.0,
        filters: { brand: 'Samsung' },
      };

      const result = ucpToBecknIntent(query);

      expect(result.item?.descriptor?.name).toBe('smartphone');
      expect(result.category?.descriptor?.name).toBe('Electronics');
      expect(result.fulfillment?.start?.location?.gps).toBe('28.6139,77.209');
      expect(result.fulfillment?.start?.location?.address?.city).toBe('New Delhi');
      expect(result.item?.price?.minimum_value).toBe('10000');
      expect(result.item?.price?.maximum_value).toBe('20000');
      expect(result.item?.tags?.length).toBeGreaterThan(0);
    });

    it('should handle location with only GPS, no radius', () => {
      const query: UCPSearchQuery = {
        query: 'store',
        location: {
          latitude: 19.076,
          longitude: 72.8777,
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.fulfillment?.start?.location?.gps).toBe('19.076,72.8777');
      expect(result.fulfillment?.start?.location?.circle).toBeUndefined();
    });

    it('should handle undefined GPS coordinates', () => {
      const query: UCPSearchQuery = {
        query: 'store',
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
        },
      };

      const result = ucpToBecknIntent(query);

      expect(result.fulfillment?.start?.location?.gps).toBeUndefined();
      expect(result.fulfillment?.start?.location?.address?.city).toBe('Mumbai');
    });
  });
});
