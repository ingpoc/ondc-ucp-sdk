/**
 * Preference Scoring Algorithm
 * Scores items based on user preferences with normalized weights
 */

import type { UCPItem, UCPSearchPreferences, UCPLocation } from '../types/ucp';

/**
 * Scoring context for normalization
 * Provides min/max values from the result set for fair comparison
 */
export interface ScoringContext {
  /** Minimum price in result set */
  minPrice?: number;
  /** Maximum price in result set */
  maxPrice?: number;
  /** User's location for distance calculation */
  userLocation?: UCPLocation;
  /** Maximum distance in result set (km) */
  maxDistance?: number;
  /** Minimum delivery time in result set (minutes) */
  minDeliveryTime?: number;
  /** Maximum delivery time in result set (minutes) */
  maxDeliveryTime?: number;
}

/**
 * Default preference weights when not specified
 */
const DEFAULT_WEIGHTS: Required<Omit<UCPSearchPreferences, 'verifiedBonus'>> & { verifiedBonus: number } = {
  priceWeight: 0.3,
  distanceWeight: 0.2,
  ratingWeight: 0.3,
  deliveryWeight: 0.2,
  verifiedBonus: 0.1,
};

/**
 * Parse price value from UCPPrice
 */
function parsePrice(item: UCPItem): number | undefined {
  const price = item.price;
  if (price.amount !== undefined) return price.amount;
  if (price.value !== undefined) return parseFloat(price.value);
  return undefined;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get item's location coordinates
 */
function getItemLocation(item: UCPItem): { lat: number; lon: number } | undefined {
  const location = item.location ?? item.provider.location;
  if (!location) return undefined;
  if (location.latitude !== undefined && location.longitude !== undefined) {
    return { lat: location.latitude, lon: location.longitude };
  }
  return undefined;
}

/**
 * Get estimated delivery time in minutes
 */
function getDeliveryTimeMinutes(item: UCPItem): number | undefined {
  const fulfillment = item.fulfillment?.[0];
  if (!fulfillment?.estimatedTime?.end) return undefined;

  // Parse ISO 8601 duration or timestamp
  const endTime = fulfillment.estimatedTime.end;

  // If it's an ISO duration like PT30M or PT1H
  const durationMatch = endTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (durationMatch) {
    const hours = parseInt(durationMatch[1] ?? '0', 10);
    const minutes = parseInt(durationMatch[2] ?? '0', 10);
    return hours * 60 + minutes;
  }

  // If it's a timestamp, calculate difference from now
  const endDate = new Date(endTime);
  if (!isNaN(endDate.getTime())) {
    return Math.max(0, (endDate.getTime() - Date.now()) / 60000);
  }

  return undefined;
}

/**
 * Normalize a value to 0-1 range
 * @param value - Value to normalize
 * @param min - Minimum value in range
 * @param max - Maximum value in range
 * @param invert - If true, lower values get higher scores
 */
function normalize(
  value: number,
  min: number,
  max: number,
  invert = false
): number {
  if (max === min) return invert ? 1 : 0.5;
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));
  return invert ? 1 - clamped : clamped;
}

/**
 * Calculate price score (lower price = higher score)
 */
function calculatePriceScore(
  item: UCPItem,
  context: ScoringContext
): number {
  const price = parsePrice(item);
  if (price === undefined) return 0.5; // Neutral score if no price

  const min = context.minPrice ?? price;
  const max = context.maxPrice ?? price;

  return normalize(price, min, max, true); // Invert: lower price = higher score
}

/**
 * Calculate distance score (closer = higher score)
 */
function calculateDistanceScore(
  item: UCPItem,
  context: ScoringContext
): number {
  if (!context.userLocation?.latitude || !context.userLocation?.longitude) {
    return 0.5; // Neutral score if no user location
  }

  const itemLoc = getItemLocation(item);
  if (!itemLoc) return 0.5; // Neutral score if no item location

  const distance = calculateDistance(
    context.userLocation.latitude,
    context.userLocation.longitude,
    itemLoc.lat,
    itemLoc.lon
  );

  const maxDist = context.maxDistance ?? 50; // Default 50km max
  return normalize(distance, 0, maxDist, true); // Invert: closer = higher score
}

/**
 * Calculate rating score (higher rating = higher score)
 */
function calculateRatingScore(item: UCPItem): number {
  const rating = item.rating?.value ?? item.provider.rating?.value;
  if (rating === undefined) return 0.5; // Neutral score if no rating

  const max = item.rating?.max ?? 5; // Default 5-star scale
  return normalize(rating, 0, max, false); // Higher rating = higher score
}

/**
 * Calculate delivery speed score (faster = higher score)
 */
function calculateDeliveryScore(
  item: UCPItem,
  context: ScoringContext
): number {
  const deliveryTime = getDeliveryTimeMinutes(item);
  if (deliveryTime === undefined) return 0.5; // Neutral score if no delivery info

  const min = context.minDeliveryTime ?? 0;
  const max = context.maxDeliveryTime ?? 120; // Default 2 hours max

  return normalize(deliveryTime, min, max, true); // Invert: faster = higher score
}

/**
 * Score an item based on user preferences
 *
 * @param item - Item to score
 * @param preferences - User preference weights (0-1 for each dimension)
 * @param context - Scoring context with normalization bounds
 * @returns Score between 0 and 1 (higher is better match)
 *
 * @example
 * ```ts
 * const score = scoreItem(item, {
 *   priceWeight: 0.4,
 *   ratingWeight: 0.3,
 *   distanceWeight: 0.2,
 *   deliveryWeight: 0.1,
 * }, {
 *   minPrice: 100,
 *   maxPrice: 1000,
 *   userLocation: { latitude: 12.97, longitude: 77.59 },
 * });
 * ```
 */
export function scoreItem(
  item: UCPItem,
  preferences: UCPSearchPreferences = {},
  context: ScoringContext = {}
): number {
  // Get weights with defaults
  const weights = {
    price: preferences.priceWeight ?? DEFAULT_WEIGHTS.priceWeight,
    distance: preferences.distanceWeight ?? DEFAULT_WEIGHTS.distanceWeight,
    rating: preferences.ratingWeight ?? DEFAULT_WEIGHTS.ratingWeight,
    delivery: preferences.deliveryWeight ?? DEFAULT_WEIGHTS.deliveryWeight,
    verifiedBonus: preferences.verifiedBonus ?? DEFAULT_WEIGHTS.verifiedBonus,
  };

  // Calculate individual scores
  const priceScore = calculatePriceScore(item, context);
  const distanceScore = calculateDistanceScore(item, context);
  const ratingScore = calculateRatingScore(item);
  const deliveryScore = calculateDeliveryScore(item, context);

  // Calculate weighted sum
  const totalWeight = weights.price + weights.distance + weights.rating + weights.delivery;

  let score = 0;
  if (totalWeight > 0) {
    score = (
      weights.price * priceScore +
      weights.distance * distanceScore +
      weights.rating * ratingScore +
      weights.delivery * deliveryScore
    ) / totalWeight;
  }

  // Add verified bonus
  if (item.provider.verified && weights.verifiedBonus > 0) {
    score = Math.min(1, score + weights.verifiedBonus);
  }

  return score;
}

/**
 * Build scoring context from a list of items
 * Calculates min/max values for normalization
 */
export function buildScoringContext(
  items: UCPItem[],
  userLocation?: UCPLocation
): ScoringContext {
  const context: ScoringContext = { userLocation };

  const prices: number[] = [];
  const distances: number[] = [];
  const deliveryTimes: number[] = [];

  for (const item of items) {
    // Collect prices
    const price = parsePrice(item);
    if (price !== undefined) prices.push(price);

    // Collect distances
    if (userLocation?.latitude !== undefined && userLocation?.longitude !== undefined) {
      const itemLoc = getItemLocation(item);
      if (itemLoc) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          itemLoc.lat,
          itemLoc.lon
        );
        distances.push(distance);
      }
    }

    // Collect delivery times
    const deliveryTime = getDeliveryTimeMinutes(item);
    if (deliveryTime !== undefined) deliveryTimes.push(deliveryTime);
  }

  // Set bounds
  if (prices.length > 0) {
    context.minPrice = Math.min(...prices);
    context.maxPrice = Math.max(...prices);
  }

  if (distances.length > 0) {
    context.maxDistance = Math.max(...distances);
  }

  if (deliveryTimes.length > 0) {
    context.minDeliveryTime = Math.min(...deliveryTimes);
    context.maxDeliveryTime = Math.max(...deliveryTimes);
  }

  return context;
}

/**
 * Score and sort items by preference
 *
 * @param items - Items to score and sort
 * @param preferences - User preference weights
 * @param userLocation - User's location for distance calculation
 * @returns Items sorted by score (highest first) with scores attached
 */
export function scoreAndSortItems(
  items: UCPItem[],
  preferences: UCPSearchPreferences = {},
  userLocation?: UCPLocation
): Array<UCPItem & { _score: number }> {
  const context = buildScoringContext(items, userLocation);

  const scored = items.map((item) => ({
    ...item,
    _score: scoreItem(item, preferences, context),
  }));

  return scored.sort((a, b) => b._score - a._score);
}
