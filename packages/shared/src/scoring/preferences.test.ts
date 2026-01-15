/**
 * Tests for Preference Scoring Algorithm
 */

import { describe, it, expect } from 'vitest';
import { scoreItem, buildScoringContext, scoreAndSortItems, normalizeWeights } from './preferences';
import type { ScoringContext, NormalizedWeights } from './preferences';
import type { UCPItem, UCPSearchPreferences } from '../types/ucp';

// Helper to create test items
function createItem(overrides: Partial<UCPItem> = {}): UCPItem {
  return {
    id: 'item-1',
    name: 'Test Item',
    price: { currency: 'INR', value: '100' },
    provider: { id: 'provider-1', name: 'Test Provider' },
    ...overrides,
  };
}

describe('scoreItem', () => {
  describe('basic scoring', () => {
    it('should return score between 0 and 1', () => {
      const item = createItem();
      const score = scoreItem(item);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should return neutral score (0.5) for item with no data', () => {
      const item = createItem({
        price: { currency: 'INR' }, // No value
        rating: undefined,
        location: undefined,
        fulfillment: undefined,
      });

      const score = scoreItem(item);
      expect(score).toBeCloseTo(0.5, 1);
    });

    it('should use default weights when not specified', () => {
      const item = createItem({ rating: { value: 5 } });
      const score = scoreItem(item);

      expect(score).toBeGreaterThan(0);
    });
  });

  describe('price scoring', () => {
    it('should give higher score to lower price', () => {
      const cheapItem = createItem({ price: { currency: 'INR', value: '100' } });
      const expensiveItem = createItem({ price: { currency: 'INR', value: '500' } });

      const context: ScoringContext = { minPrice: 100, maxPrice: 500 };
      const preferences: UCPSearchPreferences = { priceWeight: 1, distanceWeight: 0, ratingWeight: 0, deliveryWeight: 0 };

      const cheapScore = scoreItem(cheapItem, preferences, context);
      const expensiveScore = scoreItem(expensiveItem, preferences, context);

      expect(cheapScore).toBeGreaterThan(expensiveScore);
    });

    it('should handle price.amount format', () => {
      const item = createItem({ price: { currency: 'INR', amount: 200 } });
      const context: ScoringContext = { minPrice: 100, maxPrice: 300 };
      const preferences: UCPSearchPreferences = { priceWeight: 1, distanceWeight: 0, ratingWeight: 0, deliveryWeight: 0 };

      const score = scoreItem(item, preferences, context);
      expect(score).toBeCloseTo(0.5, 1); // Middle of range
    });
  });

  describe('rating scoring', () => {
    it('should give higher score to higher rating', () => {
      const highRated = createItem({ rating: { value: 4.5 } });
      const lowRated = createItem({ rating: { value: 2.0 } });

      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 1, deliveryWeight: 0 };

      const highScore = scoreItem(highRated, preferences);
      const lowScore = scoreItem(lowRated, preferences);

      expect(highScore).toBeGreaterThan(lowScore);
    });

    it('should use provider rating if item rating not available', () => {
      const item = createItem({
        rating: undefined,
        provider: { id: 'p1', name: 'Provider', rating: { value: 4.0 } },
      });

      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 1, deliveryWeight: 0 };
      const score = scoreItem(item, preferences);

      expect(score).toBeCloseTo(0.8, 1); // 4/5 = 0.8
    });

    it('should handle custom rating scale', () => {
      const item = createItem({ rating: { value: 8, max: 10 } });
      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 1, deliveryWeight: 0 };

      const score = scoreItem(item, preferences);
      expect(score).toBeCloseTo(0.8, 1); // 8/10 = 0.8
    });
  });

  describe('distance scoring', () => {
    it('should give higher score to closer items', () => {
      const closeItem = createItem({
        location: { latitude: 12.9716, longitude: 77.5946 },
      });
      const farItem = createItem({
        location: { latitude: 13.0827, longitude: 80.2707 }, // Chennai
      });

      const context: ScoringContext = {
        userLocation: { latitude: 12.9716, longitude: 77.5946 }, // Bangalore
        maxDistance: 400,
      };
      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 1, ratingWeight: 0, deliveryWeight: 0 };

      const closeScore = scoreItem(closeItem, preferences, context);
      const farScore = scoreItem(farItem, preferences, context);

      expect(closeScore).toBeGreaterThan(farScore);
    });

    it('should use provider location if item location not available', () => {
      const item = createItem({
        location: undefined,
        provider: {
          id: 'p1',
          name: 'Provider',
          location: { latitude: 12.9716, longitude: 77.5946 },
        },
      });

      const context: ScoringContext = {
        userLocation: { latitude: 12.9716, longitude: 77.5946 },
        maxDistance: 50,
      };
      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 1, ratingWeight: 0, deliveryWeight: 0 };

      const score = scoreItem(item, preferences, context);
      expect(score).toBeCloseTo(1, 1); // Same location = max score
    });

    it('should return neutral score if user location not provided', () => {
      const item = createItem({
        location: { latitude: 12.9716, longitude: 77.5946 },
      });

      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 1, ratingWeight: 0, deliveryWeight: 0 };
      const score = scoreItem(item, preferences);

      expect(score).toBeCloseTo(0.5, 1);
    });
  });

  describe('delivery scoring', () => {
    it('should give higher score to faster delivery', () => {
      const fastItem = createItem({
        fulfillment: [{ type: 'delivery', estimatedTime: { end: 'PT30M' } }],
      });
      const slowItem = createItem({
        fulfillment: [{ type: 'delivery', estimatedTime: { end: 'PT2H' } }],
      });

      const context: ScoringContext = { minDeliveryTime: 30, maxDeliveryTime: 120 };
      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 0, deliveryWeight: 1 };

      const fastScore = scoreItem(fastItem, preferences, context);
      const slowScore = scoreItem(slowItem, preferences, context);

      expect(fastScore).toBeGreaterThan(slowScore);
    });

    it('should parse PT1H30M duration format', () => {
      const item = createItem({
        fulfillment: [{ type: 'delivery', estimatedTime: { end: 'PT1H30M' } }],
      });

      const context: ScoringContext = { minDeliveryTime: 0, maxDeliveryTime: 180 };
      const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 0, deliveryWeight: 1 };

      const score = scoreItem(item, preferences, context);
      expect(score).toBeCloseTo(0.5, 1); // 90min out of 180 = middle
    });
  });

  describe('verified bonus', () => {
    it('should add bonus for verified providers', () => {
      const verifiedItem = createItem({
        provider: { id: 'p1', name: 'Provider', verified: true },
      });
      const unverifiedItem = createItem({
        provider: { id: 'p1', name: 'Provider', verified: false },
      });

      const preferences: UCPSearchPreferences = { verifiedBonus: 0.1 };

      const verifiedScore = scoreItem(verifiedItem, preferences);
      const unverifiedScore = scoreItem(unverifiedItem, preferences);

      expect(verifiedScore).toBeGreaterThan(unverifiedScore);
    });

    it('should cap score at 1.0 after bonus', () => {
      const item = createItem({
        rating: { value: 5 },
        provider: { id: 'p1', name: 'Provider', verified: true },
      });

      const preferences: UCPSearchPreferences = {
        priceWeight: 0,
        distanceWeight: 0,
        ratingWeight: 1,
        deliveryWeight: 0,
        verifiedBonus: 0.5,
      };

      const score = scoreItem(item, preferences);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('weighted scoring', () => {
    it('should weight scores according to preferences', () => {
      const item = createItem({
        price: { currency: 'INR', value: '100' },
        rating: { value: 5 },
      });

      const context: ScoringContext = { minPrice: 100, maxPrice: 100 };

      // Price-focused preferences
      const pricePrefs: UCPSearchPreferences = { priceWeight: 0.8, ratingWeight: 0.2, distanceWeight: 0, deliveryWeight: 0 };
      const priceScore = scoreItem(item, pricePrefs, context);

      // Rating-focused preferences
      const ratingPrefs: UCPSearchPreferences = { priceWeight: 0.2, ratingWeight: 0.8, distanceWeight: 0, deliveryWeight: 0 };
      const ratingScore = scoreItem(item, ratingPrefs, context);

      // Both should be valid scores
      expect(priceScore).toBeGreaterThanOrEqual(0);
      expect(ratingScore).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('buildScoringContext', () => {
  it('should calculate min/max prices from items', () => {
    const items = [
      createItem({ price: { currency: 'INR', value: '100' } }),
      createItem({ price: { currency: 'INR', value: '500' } }),
      createItem({ price: { currency: 'INR', value: '300' } }),
    ];

    const context = buildScoringContext(items);

    expect(context.minPrice).toBe(100);
    expect(context.maxPrice).toBe(500);
  });

  it('should calculate max distance from user location', () => {
    const items = [
      createItem({ location: { latitude: 12.9716, longitude: 77.5946 } }), // Bangalore
      createItem({ location: { latitude: 13.0827, longitude: 80.2707 } }), // Chennai
    ];

    const userLocation = { latitude: 12.9716, longitude: 77.5946 };
    const context = buildScoringContext(items, userLocation);

    expect(context.maxDistance).toBeGreaterThan(0);
    expect(context.userLocation).toBe(userLocation);
  });

  it('should calculate delivery time bounds', () => {
    const items = [
      createItem({ fulfillment: [{ type: 'delivery', estimatedTime: { end: 'PT30M' } }] }),
      createItem({ fulfillment: [{ type: 'delivery', estimatedTime: { end: 'PT2H' } }] }),
    ];

    const context = buildScoringContext(items);

    expect(context.minDeliveryTime).toBe(30);
    expect(context.maxDeliveryTime).toBe(120);
  });

  it('should handle empty items array', () => {
    const context = buildScoringContext([]);

    expect(context.minPrice).toBeUndefined();
    expect(context.maxPrice).toBeUndefined();
  });
});

describe('scoreAndSortItems', () => {
  it('should sort items by score descending', () => {
    const items = [
      createItem({ id: 'low', rating: { value: 2 } }),
      createItem({ id: 'high', rating: { value: 5 } }),
      createItem({ id: 'mid', rating: { value: 3.5 } }),
    ];

    const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 0, ratingWeight: 1, deliveryWeight: 0 };
    const sorted = scoreAndSortItems(items, preferences);

    expect(sorted[0]?.id).toBe('high');
    expect(sorted[1]?.id).toBe('mid');
    expect(sorted[2]?.id).toBe('low');
  });

  it('should attach _score to each item', () => {
    const items = [createItem({ rating: { value: 4 } })];

    const sorted = scoreAndSortItems(items);

    expect(sorted[0]?._score).toBeDefined();
    expect(sorted[0]?._score).toBeGreaterThanOrEqual(0);
    expect(sorted[0]?._score).toBeLessThanOrEqual(1);
  });

  it('should use provided user location for distance calculation', () => {
    const items = [
      createItem({
        id: 'close',
        location: { latitude: 12.9716, longitude: 77.5946 },
      }),
      createItem({
        id: 'far',
        location: { latitude: 19.0760, longitude: 72.8777 }, // Mumbai
      }),
    ];

    const userLocation = { latitude: 12.9716, longitude: 77.5946 }; // Bangalore
    const preferences: UCPSearchPreferences = { priceWeight: 0, distanceWeight: 1, ratingWeight: 0, deliveryWeight: 0 };

    const sorted = scoreAndSortItems(items, preferences, userLocation);

    expect(sorted[0]?.id).toBe('close');
    expect(sorted[1]?.id).toBe('far');
  });
});

describe('normalizeWeights', () => {
  /**
   * Helper to calculate sum of core weights (excluding verifiedBonus)
   */
  function sumCoreWeights(weights: NormalizedWeights): number {
    return weights.priceWeight + weights.distanceWeight + weights.ratingWeight + weights.deliveryWeight;
  }

  describe('default weights', () => {
    it('should return default weights when no input provided', () => {
      const weights = normalizeWeights();

      expect(weights.priceWeight).toBe(0.3);
      expect(weights.distanceWeight).toBe(0.2);
      expect(weights.ratingWeight).toBe(0.25);
      expect(weights.deliveryWeight).toBe(0.25);
      expect(weights.verifiedBonus).toBe(0.1);
    });

    it('should return default weights for empty object', () => {
      const weights = normalizeWeights({});

      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });
  });

  describe('partial weights', () => {
    it('should fill remaining weights evenly when one weight provided', () => {
      const weights = normalizeWeights({ priceWeight: 0.6 });

      expect(weights.priceWeight).toBe(0.6);
      // Remaining 0.4 split evenly among 3 weights = 0.133...
      expect(weights.distanceWeight).toBeCloseTo(0.133, 2);
      expect(weights.ratingWeight).toBeCloseTo(0.133, 2);
      expect(weights.deliveryWeight).toBeCloseTo(0.133, 2);
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });

    it('should fill remaining weights evenly when two weights provided', () => {
      const weights = normalizeWeights({ priceWeight: 0.4, ratingWeight: 0.4 });

      expect(weights.priceWeight).toBe(0.4);
      expect(weights.ratingWeight).toBe(0.4);
      // Remaining 0.2 split evenly among 2 weights = 0.1
      expect(weights.distanceWeight).toBeCloseTo(0.1, 5);
      expect(weights.deliveryWeight).toBeCloseTo(0.1, 5);
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });

    it('should fill remaining weights evenly when three weights provided', () => {
      const weights = normalizeWeights({
        priceWeight: 0.3,
        distanceWeight: 0.3,
        ratingWeight: 0.3,
      });

      expect(weights.priceWeight).toBe(0.3);
      expect(weights.distanceWeight).toBe(0.3);
      expect(weights.ratingWeight).toBe(0.3);
      expect(weights.deliveryWeight).toBeCloseTo(0.1, 5); // Remaining 0.1
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });

    it('should handle weights that exceed 1.0 by giving zero to remaining', () => {
      const weights = normalizeWeights({ priceWeight: 0.8, ratingWeight: 0.5 });

      // Sum of provided is 1.3, remaining is 0 (clamped)
      expect(weights.priceWeight).toBe(0.8);
      expect(weights.ratingWeight).toBe(0.5);
      expect(weights.distanceWeight).toBe(0);
      expect(weights.deliveryWeight).toBe(0);
    });
  });

  describe('all weights provided', () => {
    it('should scale weights to sum to 1.0 when all provided but not normalized', () => {
      const weights = normalizeWeights({
        priceWeight: 2,
        distanceWeight: 1,
        ratingWeight: 1,
        deliveryWeight: 2,
      });

      // Total is 6, each scaled by 1/6
      expect(weights.priceWeight).toBeCloseTo(2 / 6, 5);
      expect(weights.distanceWeight).toBeCloseTo(1 / 6, 5);
      expect(weights.ratingWeight).toBeCloseTo(1 / 6, 5);
      expect(weights.deliveryWeight).toBeCloseTo(2 / 6, 5);
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });

    it('should keep weights when they already sum to 1.0', () => {
      const weights = normalizeWeights({
        priceWeight: 0.25,
        distanceWeight: 0.25,
        ratingWeight: 0.25,
        deliveryWeight: 0.25,
      });

      expect(weights.priceWeight).toBe(0.25);
      expect(weights.distanceWeight).toBe(0.25);
      expect(weights.ratingWeight).toBe(0.25);
      expect(weights.deliveryWeight).toBe(0.25);
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
    });

    it('should normalize weights that sum to more than 1.0', () => {
      const weights = normalizeWeights({
        priceWeight: 0.4,
        distanceWeight: 0.3,
        ratingWeight: 0.3,
        deliveryWeight: 0.4,
      });

      // Total is 1.4, should normalize
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
      expect(weights.priceWeight).toBeCloseTo(0.4 / 1.4, 5);
    });
  });

  describe('verifiedBonus handling', () => {
    it('should preserve custom verifiedBonus', () => {
      const weights = normalizeWeights({ verifiedBonus: 0.2 });

      expect(weights.verifiedBonus).toBe(0.2);
    });

    it('should use default verifiedBonus when not provided', () => {
      const weights = normalizeWeights({ priceWeight: 0.5 });

      expect(weights.verifiedBonus).toBe(0.1);
    });

    it('should not include verifiedBonus in weight normalization', () => {
      const weights = normalizeWeights({
        priceWeight: 0.25,
        distanceWeight: 0.25,
        ratingWeight: 0.25,
        deliveryWeight: 0.25,
        verifiedBonus: 0.5,
      });

      // Core weights should still sum to 1.0
      expect(sumCoreWeights(weights)).toBeCloseTo(1.0, 5);
      // Verified bonus is separate
      expect(weights.verifiedBonus).toBe(0.5);
    });
  });

  describe('edge cases', () => {
    it('should handle zero weights', () => {
      const weights = normalizeWeights({
        priceWeight: 0,
        distanceWeight: 0,
        ratingWeight: 0,
        deliveryWeight: 0,
      });

      // All zeros provided - can't normalize, returns as-is
      expect(weights.priceWeight).toBe(0);
      expect(weights.distanceWeight).toBe(0);
      expect(weights.ratingWeight).toBe(0);
      expect(weights.deliveryWeight).toBe(0);
    });

    it('should handle single non-zero weight among zeros', () => {
      const weights = normalizeWeights({
        priceWeight: 1,
        distanceWeight: 0,
        ratingWeight: 0,
        deliveryWeight: 0,
      });

      // All weights provided, normalize to sum to 1
      expect(weights.priceWeight).toBe(1);
      expect(weights.distanceWeight).toBe(0);
      expect(weights.ratingWeight).toBe(0);
      expect(weights.deliveryWeight).toBe(0);
      expect(sumCoreWeights(weights)).toBe(1);
    });

    it('should handle negative weights by ignoring them', () => {
      const weights = normalizeWeights({
        priceWeight: -0.5,
        distanceWeight: 0.6,
      });

      // Negative weight is ignored, only distanceWeight is provided
      expect(weights.distanceWeight).toBe(0.6);
      // Remaining 0.4 split among 3 remaining weights
      expect(weights.priceWeight).toBeCloseTo(0.133, 2);
      expect(weights.ratingWeight).toBeCloseTo(0.133, 2);
      expect(weights.deliveryWeight).toBeCloseTo(0.133, 2);
    });
  });
});
