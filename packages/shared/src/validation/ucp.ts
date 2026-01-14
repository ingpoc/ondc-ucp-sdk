/**
 * UCP Protocol Zod Schemas
 * Runtime validation for UCP protocol types
 */

import { z } from 'zod';

/**
 * UCP Price schema
 */
export const UCPPriceSchema = z.object({
  amount: z.number().nonnegative(),
  currency: z.string().length(3),
});

/**
 * UCP Image schema
 */
export const UCPImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

/**
 * UCP Address schema
 */
export const UCPAddressSchema = z.object({
  name: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postalCode: z.string().min(1),
  country: z.string().min(2),
  gps: z.string().optional(),
});

/**
 * UCP Contact schema
 */
export const UCPContactSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
}).refine(
  (data) => data.phone || data.email,
  'At least one of phone or email is required'
);

/**
 * UCP Location schema
 */
export const UCPLocationSchema = z.object({
  address: UCPAddressSchema.optional(),
  gps: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
}).refine(
  (data) => data.address || data.gps || data.city,
  'At least one location field is required'
);

/**
 * UCP Rating schema
 */
export const UCPRatingSchema = z.object({
  value: z.number().min(0).max(5),
  count: z.number().nonnegative().optional(),
  max: z.number().positive().optional(),
});

/**
 * UCP Search Preferences schema
 */
export const UCPSearchPreferencesSchema = z.object({
  priceWeight: z.number().min(0).max(1).optional(),
  distanceWeight: z.number().min(0).max(1).optional(),
  ratingWeight: z.number().min(0).max(1).optional(),
  deliveryWeight: z.number().min(0).max(1).optional(),
  verifiedBonus: z.number().optional(),
});

/**
 * UCP Search Query schema
 */
export const UCPSearchQuerySchema = z.object({
  text: z.string().optional(),
  category: z.string().optional(),
  location: UCPLocationSchema.optional(),
  limit: z.number().positive().max(100).optional(),
  offset: z.number().nonnegative().optional(),
  priceRange: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().positive().optional(),
  }).optional(),
  brand: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  deliverySpeed: z.enum(['express', 'standard', 'any']).optional(),
  filters: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  preferences: UCPSearchPreferencesSchema.optional(),
  metadata: z.record(z.any()).optional(),
}).refine(
  (data) => data.text || data.category || data.brand,
  'At least one of text, category, or brand is required'
);

/**
 * Validate UCP search query
 */
export function validateUCPSearchQuery(data: unknown) {
  return UCPSearchQuerySchema.safeParse(data);
}

/**
 * Validate UCP location
 */
export function validateUCPLocation(data: unknown) {
  return UCPLocationSchema.safeParse(data);
}

/**
 * Validate UCP price
 */
export function validateUCPPrice(data: unknown) {
  return UCPPriceSchema.safeParse(data);
}
