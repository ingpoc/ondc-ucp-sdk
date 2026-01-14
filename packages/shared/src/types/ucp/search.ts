/**
 * UCP Search Types
 * Types for search queries and catalog responses
 */

import type { UCPLocation, UCPMetadata } from './common';

/** Search query from agent to gateway */
export interface UCPSearchQuery {
  /** Free text search term */
  text?: string;
  /** Category filter */
  category?: string;
  /** Location filter for nearby results */
  location?: UCPLocation;
  /** Maximum results to return */
  limit?: number;
  /** Pagination offset */
  offset?: number;
  /** Price range filter */
  priceRange?: {
    min?: number;
    max?: number;
  };
  /** Brand filter */
  brand?: string;
  /** Rating minimum filter */
  minRating?: number;
  /** Delivery speed preference */
  deliverySpeed?: 'express' | 'standard' | 'any';
  /** Additional filters as key-value */
  filters?: Record<string, string | number | boolean>;
  /** Preference weights for ranking */
  preferences?: UCPSearchPreferences;
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Search preference weights for ranking */
export interface UCPSearchPreferences {
  /** Weight for price (0-1, lower price = higher score) */
  priceWeight?: number;
  /** Weight for distance (0-1, closer = higher score) */
  distanceWeight?: number;
  /** Weight for rating (0-1, higher rating = higher score) */
  ratingWeight?: number;
  /** Weight for delivery speed (0-1, faster = higher score) */
  deliveryWeight?: number;
  /** Bonus for verified sellers */
  verifiedBonus?: number;
}
