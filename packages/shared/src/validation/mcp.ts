/**
 * MCP Tool Zod Schemas
 * Runtime validation for MCP tool inputs and outputs
 */

import { z } from 'zod';
import { UCPSearchQuerySchema } from './ucp';

/**
 * MCP JSON Schema Property type
 */
const MCPPropertyTypeSchema = z.enum(['string', 'number', 'boolean', 'array', 'object']);

/**
 * Recursive MCP Property schema (simplified for runtime use)
 */
export const MCPPropertySchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: MCPPropertyTypeSchema,
    description: z.string().optional(),
    properties: z.record(z.lazy(() => MCPPropertySchema)).optional(),
    items: MCPPropertySchema.optional(),
    required: z.array(z.string()).optional(),
    enum: z.array(z.string()).optional(),
    format: z.string().optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    default: z.any().optional(),
  })
);

/**
 * MCP Tool Input Schema (JSON Schema format)
 */
export const MCPToolInputSchemaSchema = z.object({
  type: z.literal('object'),
  properties: z.record(MCPPropertySchema),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
});

/**
 * MCP Tool schema
 */
export const MCPToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: MCPToolInputSchemaSchema,
});

/**
 * MCP Content schema
 */
export const MCPContentSchema = z.object({
  type: z.enum(['text', 'resource', 'image']),
  text: z.string().optional(),
  data: z.string().optional(),
  uri: z.string().optional(),
  mimeType: z.string().optional(),
});

/**
 * MCP Tool Result schema
 */
export const MCPToolResultSchema = z.object({
  content: z.array(MCPContentSchema),
  isError: z.boolean().optional(),
});

/**
 * ondc_search input schema
 */
export const ONDCSearchInputSchema = UCPSearchQuerySchema.and(
  z.object({
    maxResults: z.number().positive().max(100).optional(),
    expandSearch: z.boolean().optional(),
  })
);

/**
 * Buyer address schema
 */
const BuyerAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().optional(),
});

/**
 * Buyer info schema
 */
const BuyerInfoSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional(),
  address: BuyerAddressSchema,
});

/**
 * Checkout item schema
 */
const CheckoutItemSchema = z.object({
  id: z.string().min(1),
  providerId: z.string().min(1),
  quantity: z.number().positive(),
});

/**
 * ondc_checkout input schema
 */
export const ONDCCheckoutInputSchema = z.object({
  items: z.array(CheckoutItemSchema).min(1),
  buyer: BuyerInfoSchema,
  fulfillmentOptionId: z.string().optional(),
  instructions: z.string().optional(),
});

/**
 * Payment status schema
 */
const PaymentStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

/**
 * ondc_checkout output schema
 */
export const ONDCCheckoutOutputSchema = z.object({
  session: z.any(), // UCPSession - full validation would be complex
  payment: z.object({
    amount: z.string(),
    currency: z.string().length(3),
    paymentUrl: z.string().url().optional(),
    status: PaymentStatusSchema,
  }),
  estimatedDelivery: z.string().optional(),
});

/**
 * Order status schema
 */
const OrderStatusSchema = z.enum([
  'created',
  'confirmed',
  'in_progress',
  'delivered',
  'cancelled',
  'failed',
]);

/**
 * Status update schema
 */
const StatusUpdateSchema = z.object({
  timestamp: z.string().datetime(),
  status: z.string(),
  details: z.string().optional(),
});

/**
 * Tracking location schema
 */
const TrackingLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Delivery agent schema
 */
const DeliveryAgentSchema = z.object({
  name: z.string(),
  phone: z.string().min(10),
});

/**
 * Tracking info schema
 */
const TrackingInfoSchema = z.object({
  location: TrackingLocationSchema.optional(),
  eta: z.string().optional(),
  agent: DeliveryAgentSchema.optional(),
});

/**
 * ondc_status input schema
 */
export const ONDCStatusInputSchema = z.object({
  sessionId: z.string().min(1),
});

/**
 * ondc_status output schema
 */
export const ONDCStatusOutputSchema = z.object({
  sessionId: z.string().min(1),
  status: OrderStatusSchema,
  updates: z.array(StatusUpdateSchema),
  tracking: TrackingInfoSchema.optional(),
});

/**
 * Cancellation status schema
 */
const CancellationStatusSchema = z.enum(['pending', 'approved', 'rejected']);

/**
 * Refund info schema
 */
const RefundInfoSchema = z.object({
  amount: z.string(),
  currency: z.string().length(3),
  estimatedDate: z.string().optional(),
});

/**
 * ondc_cancel input schema
 */
export const ONDCCancelInputSchema = z.object({
  sessionId: z.string().min(1),
  reason: z.string().min(1),
});

/**
 * ondc_cancel output schema
 */
export const ONDCCancelOutputSchema = z.object({
  sessionId: z.string().min(1),
  status: CancellationStatusSchema,
  refund: RefundInfoSchema.optional(),
  details: z.string(),
});

/**
 * Validate MCP tool definition
 */
export function validateMCPTool(data: unknown) {
  return MCPToolSchema.safeParse(data);
}

/**
 * Validate ondc_search input
 */
export function validateONDCSearchInput(data: unknown) {
  return ONDCSearchInputSchema.safeParse(data);
}

/**
 * Validate ondc_checkout input
 */
export function validateONDCCheckoutInput(data: unknown) {
  return ONDCCheckoutInputSchema.safeParse(data);
}

/**
 * Validate ondc_status input
 */
export function validateONDCStatusInput(data: unknown) {
  return ONDCStatusInputSchema.safeParse(data);
}

/**
 * Validate ondc_cancel input
 */
export function validateONDCCancelInput(data: unknown) {
  return ONDCCancelInputSchema.safeParse(data);
}
