/**
 * Beckn Protocol Zod Schemas
 * Runtime validation for Beckn protocol messages
 */

import { z } from 'zod';

/**
 * Beckn Action schema
 */
export const BecknActionSchema = z.enum([
  'search',
  'select',
  'init',
  'confirm',
  'status',
  'track',
  'cancel',
  'update',
  'rating',
  'support',
  'on_search',
  'on_select',
  'on_init',
  'on_confirm',
  'on_status',
  'on_track',
  'on_cancel',
  'on_update',
  'on_rating',
  'on_support',
]);

/**
 * Beckn Domain schema
 */
export const BecknDomainSchema = z.union([
  z.literal('ONDC:RET10'),
  z.literal('ONDC:RET11'),
  z.literal('ONDC:RET12'),
  z.literal('ONDC:RET13'),
  z.literal('ONDC:RET14'),
  z.literal('ONDC:RET15'),
  z.literal('ONDC:RET16'),
  z.literal('ONDC:RET17'),
  z.literal('ONDC:RET18'),
  z.literal('ONDC:RET19'),
  z.literal('ONDC:TRV10'),
  z.literal('ONDC:TRV11'),
  z.literal('ONDC:FIS10'),
  z.literal('ONDC:FIS11'),
  z.string(),
]);

/**
 * Beckn Error schema
 */
export const BecknErrorSchema = z.object({
  type: z.string(),
  code: z.string(),
  path: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Beckn Context schema
 */
export const BecknContextSchema = z.object({
  domain: BecknDomainSchema,
  action: BecknActionSchema,
  country: z.string().min(2),
  city: z.string().min(1),
  core_version: z.string().optional(),
  version: z.string().optional(),
  bap_id: z.string().min(1),
  bap_uri: z.string().url(),
  bpp_id: z.string().optional(),
  bpp_uri: z.string().optional(),
  transaction_id: z.string().uuid(),
  message_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  ttl: z.string().optional(),
  key: z.string().optional(),
});

/**
 * Generic Beckn Ack schema
 */
export const BecknAckSchema = z.object({
  status: z.enum(['ACK', 'NACK']),
});

/**
 * Generic Beckn Message wrapper schema
 */
export const BecknMessageSchema = z.object({
  context: BecknContextSchema,
  message: z.any(), // Message content varies by action
  error: BecknErrorSchema.optional(),
});

/**
 * Beckn Ack Message schema
 */
export const BecknAckMessageSchema = z.object({
  context: BecknContextSchema,
  message: z.object({
    ack: BecknAckSchema,
  }),
  error: BecknErrorSchema.optional(),
});

/**
 * Create a typed Beckn message schema
 */
export function createBecknMessageSchema<T extends z.ZodType>(messageSchema: T) {
  return z.object({
    context: BecknContextSchema,
    message: messageSchema,
    error: BecknErrorSchema.optional(),
  });
}

/**
 * Validate Beckn context
 */
export function validateBecknContext(data: unknown) {
  return BecknContextSchema.safeParse(data);
}

/**
 * Validate Beckn message
 */
export function validateBecknMessage(data: unknown) {
  return BecknMessageSchema.safeParse(data);
}

/**
 * Validate Beckn ack message
 */
export function validateBecknAckMessage(data: unknown) {
  return BecknAckMessageSchema.safeParse(data);
}
