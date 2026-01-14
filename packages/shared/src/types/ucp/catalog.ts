/**
 * UCP Catalog Types
 * Types for catalog, items, providers
 */

import type {
  UCPImage,
  UCPLocation,
  UCPMetadata,
  UCPPrice,
  UCPRating,
  UCPTimeRange,
} from './common';

/** Catalog response from search */
export interface UCPCatalog {
  /** List of items matching search */
  items: UCPItem[];
  /** Total count (for pagination) */
  totalCount?: number;
  /** Offset used in query */
  offset?: number;
  /** Whether more results exist */
  hasMore?: boolean;
  /** Search metadata */
  metadata?: UCPMetadata;
}

/** Item (product/service) in catalog */
export interface UCPItem {
  /** Unique item identifier */
  id: string;
  /** Item name */
  name: string;
  /** Item description */
  description?: string;
  /** Item images */
  images?: UCPImage[];
  /** Item price */
  price: UCPPrice;
  /** Original price if discounted */
  originalPrice?: UCPPrice;
  /** Provider/seller info */
  provider: UCPProvider;
  /** Category */
  category?: string;
  /** Subcategory */
  subcategory?: string;
  /** Brand name */
  brand?: string;
  /** Item rating */
  rating?: UCPRating;
  /** Available quantity */
  availableQuantity?: number;
  /** Item attributes (color, size, etc.) */
  attributes?: Record<string, string | number>;
  /** Fulfillment options */
  fulfillment?: UCPFulfillmentOption[];
  /** Location where item is available */
  location?: UCPLocation;
  /** Whether item can be returned */
  returnable?: boolean;
  /** Return window (ISO 8601 duration) */
  returnWindow?: string;
  /** Whether item can be cancelled */
  cancellable?: boolean;
  /** Whether COD is available */
  codAvailable?: boolean;
  /** Item tags for filtering */
  tags?: string[];
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Provider (seller) information */
export interface UCPProvider {
  /** Provider unique identifier */
  id: string;
  /** Provider name */
  name: string;
  /** Provider logo */
  logo?: UCPImage;
  /** Provider rating */
  rating?: UCPRating;
  /** Whether provider is verified */
  verified?: boolean;
  /** Provider location */
  location?: UCPLocation;
  /** Supported payment methods */
  paymentMethods?: string[];
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Fulfillment option for an item */
export interface UCPFulfillmentOption {
  /** Fulfillment type (delivery, pickup, etc.) */
  type: 'delivery' | 'pickup' | 'digital';
  /** Provider name (courier, etc.) */
  providerName?: string;
  /** Estimated delivery time range */
  estimatedTime?: UCPTimeRange;
  /** Fulfillment cost */
  cost?: UCPPrice;
  /** Tracking available */
  trackingAvailable?: boolean;
}
