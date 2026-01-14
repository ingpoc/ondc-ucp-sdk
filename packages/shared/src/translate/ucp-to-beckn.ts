/**
 * UCP to Beckn Translator
 * Translates UCP search queries to Beckn intent format
 */

import type { UCPSearchQuery } from '../types/ucp';
import type { BecknIntent } from '../types/beckn';

/**
 * Translate UCP search query to Beckn intent
 *
 * @param query - UCP search query
 * @returns Beckn intent for search
 *
 * @example
 * ```ts
 * const ucpQuery: UCPSearchQuery = {
 *   query: 'smartphone',
 *   category: 'Electronics',
 *   location: { latitude: 28.6139, longitude: 77.2090 },
 *   priceRange: { min: 10000, max: 20000 }
 * };
 * const becknIntent = ucpToBecknIntent(ucpQuery);
 * ```
 */
export function ucpToBecknIntent(query: UCPSearchQuery): BecknIntent {
  const intent: BecknIntent = {};

  // Item descriptor (search query)
  if (query.query || query.category) {
    intent.item = {
      descriptor: {
        name: query.query ?? undefined,
      },
    };
  }

  // Category filter
  if (query.category) {
    intent.category = {
      descriptor: {
        name: query.category,
      },
    };
  }

  // Location filter
  if (query.location) {
    const location = query.location;

    // Build GPS string for Beckn format (lat,lng)
    let gps: string | undefined;
    if (
      location.latitude !== undefined &&
      location.longitude !== undefined
    ) {
      gps = `${location.latitude},${location.longitude}`;
    }

    // Build location object
    intent.fulfillment = {
      start: {
        location: {
          gps,
          address: {
            city: location.city,
            state: location.state,
            country: location.country,
            area_code: location.postalCode,
          },
        },
      },
    };

    // Add radius if provided (as 5km circle)
    if (location.radius !== undefined && gps) {
      // Beckn uses circle with radius in specified units
      // Converting radius to meters (Beckn standard)
      const radiusMeters = location.radius * 1000;
      intent.fulfillment.start.location!.circle = {
        gps,
        radius: {
          value: String(radiusMeters),
          unit: 'm',
        },
      };
    }
  }

  // Price range filter
  if (query.priceRange) {
    if (!intent.item) {
      intent.item = {};
    }

    const { min, max } = query.priceRange;
    const minPrice = min !== undefined ? String(min) : undefined;
    const maxPrice = max !== undefined ? String(max) : undefined;

    intent.item.price = {
      currency: 'INR',
      value: maxPrice ?? '0',
      minimum_value: minPrice,
      maximum_value: maxPrice,
    };
  }

  // Rating filter
  if (query.minRating !== undefined) {
    if (!intent.item) {
      intent.item = {};
    }
    // Store rating in tags for Beckn
    intent.item.tags = [
      {
        code: 'min_rating',
        name: 'Minimum Rating',
        display: true,
        list: [
          {
            code: 'value',
            name: 'Value',
            value: String(query.minRating),
          },
        ],
      },
    ];
  }

  // Additional filters
  if (query.filters) {
    if (!intent.item) {
      intent.item = {};
    }

    const existingTags = intent.item.tags ?? [];
    const filterTags = Object.entries(query.filters).map(([key, value]) => ({
      code: key,
      name: key,
      display: false,
      list: [
        {
          code: 'value',
          name: 'Value',
          value: String(value),
        },
      ],
    }));

    intent.item.tags = [...existingTags, ...filterTags];
  }

  return intent;
}
