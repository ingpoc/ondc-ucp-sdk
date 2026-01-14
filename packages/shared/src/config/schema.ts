/**
 * Configuration Schema
 * Zod schemas for validating gateway configuration
 */

import { z } from 'zod';

/**
 * Supported environment types
 */
export const EnvironmentEnum = z.enum(['production', 'staging', 'development']);

/**
 * Gateway configuration schema
 */
export const GatewayConfigSchema = z.object({
  /** ONDC Gateway URL */
  gatewayUrl: z.string().url('Invalid gateway URL'),

  /** ONDC Registry URL */
  registryUrl: z.string().url('Invalid registry URL'),

  /** Subscriber ID (e.g., "ondc.example.com") */
  subscriberId: z.string().min(1, 'Subscriber ID is required'),

  /** Base64 encoded Ed25519 private key */
  privateKey: z.string().min(1, 'Private key is required'),

  /** Environment: production, staging, or development */
  environment: EnvironmentEnum.default('development'),

  /** Unique key identifier for this subscriber's key */
  keyId: z.string().default('default-key'),
});

/**
 * Inferred type from GatewayConfigSchema
 */
export type GatewayConfig = z.infer<typeof GatewayConfigSchema>;

/**
 * Partial gateway config for optional overrides
 */
export type PartialGatewayConfig = Partial<GatewayConfig>;
