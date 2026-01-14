/**
 * Config Loader
 * Load and validate configuration from environment variables
 */

import { z } from 'zod';
import {
  GatewayConfigSchema,
  type GatewayConfig,
  type PartialGatewayConfig,
} from './schema';

/**
 * Environment variable names for configuration
 */
export const EnvVars = {
  GATEWAY_URL: 'ONDC_GATEWAY_URL',
  REGISTRY_URL: 'ONDC_REGISTRY_URL',
  SUBSCRIBER_ID: 'ONDC_SUBSCRIBER_ID',
  PRIVATE_KEY: 'ONDC_PRIVATE_KEY',
  ENVIRONMENT: 'ONDC_ENVIRONMENT',
  KEY_ID: 'ONDC_KEY_ID',
} as const;

/**
 * Error thrown when configuration validation fails
 */
export class ConfigValidationError extends Error {
  constructor(public readonly errors: z.ZodError) {
    const errorMessages = errors.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    super(`Configuration validation failed: ${errorMessages}`);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Missing required environment variable error
 */
export class MissingEnvVarError extends Error {
  constructor(public readonly varName: string) {
    super(`Missing required environment variable: ${varName}`);
    this.name = 'MissingEnvVarError';
  }
}

/**
 * Get environment variable or throw if missing
 */
function getRequiredEnv(varName: string): string {
  const value = process.env[varName];
  if (!value) {
    throw new MissingEnvVarError(varName);
  }
  return value;
}

/**
 * Get environment variable with optional default
 */
function getOptionalEnv(varName: string, defaultValue: string): string {
  return process.env[varName] ?? defaultValue;
}

/**
 * Load configuration from environment variables
 *
 * Environment variables:
 * - ONDC_GATEWAY_URL (required): ONDC Gateway URL
 * - ONDC_REGISTRY_URL (required): ONDC Registry URL
 * - ONDC_SUBSCRIBER_ID (required): Subscriber ID
 * - ONDC_PRIVATE_KEY (required): Base64 encoded Ed25519 private key
 * - ONDC_ENVIRONMENT (optional): Environment (production|staging|development)
 * - ONDC_KEY_ID (optional): Key identifier
 *
 * @returns Validated configuration object
 * @throws {MissingEnvVarError} If required environment variable is missing
 * @throws {ConfigValidationError} If configuration validation fails
 *
 * @example
 * ```ts
 * process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
 * process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
 * process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
 * process.env.ONDC_PRIVATE_KEY = 'base64key==';
 *
 * const config = loadConfig();
 * console.log(config.gatewayUrl); // 'https://gateway.ondc.org'
 * ```
 */
export function loadConfig(): GatewayConfig {
  const rawConfig: Record<string, string | undefined> = {
    gatewayUrl: getRequiredEnv(EnvVars.GATEWAY_URL),
    registryUrl: getRequiredEnv(EnvVars.REGISTRY_URL),
    subscriberId: getRequiredEnv(EnvVars.SUBSCRIBER_ID),
    privateKey: getRequiredEnv(EnvVars.PRIVATE_KEY),
    environment: getOptionalEnv(EnvVars.ENVIRONMENT, 'development'),
    keyId: getOptionalEnv(EnvVars.KEY_ID, 'default-key'),
  };

  const result = GatewayConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    throw new ConfigValidationError(result.error);
  }

  return result.data;
}

/**
 * Load configuration with partial overrides
 *
 * @param overrides - Partial configuration to override environment values
 * @returns Validated configuration object
 *
 * @example
 * ```ts
 * // Set env vars for most config
 * process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
 * // ...
 *
 * // Override specific value
 * const config = loadConfigWithOverrides({
 *   environment: 'production'
 * });
 * ```
 */
export function loadConfigWithOverrides(
  overrides: PartialGatewayConfig
): GatewayConfig {
  const baseConfig: Record<string, string | undefined> = {
    gatewayUrl: getRequiredEnv(EnvVars.GATEWAY_URL),
    registryUrl: getRequiredEnv(EnvVars.REGISTRY_URL),
    subscriberId: getRequiredEnv(EnvVars.SUBSCRIBER_ID),
    privateKey: getRequiredEnv(EnvVars.PRIVATE_KEY),
    environment: getOptionalEnv(EnvVars.ENVIRONMENT, 'development'),
    keyId: getOptionalEnv(EnvVars.KEY_ID, 'default-key'),
  };

  const mergedConfig = { ...baseConfig, ...overrides };

  const result = GatewayConfigSchema.safeParse(mergedConfig);

  if (!result.success) {
    throw new ConfigValidationError(result.error);
  }

  return result.data;
}

/**
 * Check if all required environment variables are set
 *
 * @returns Object with isValid flag and missing vars array
 *
 * @example
 * ```ts
 * const check = checkEnvVars();
 * if (!check.isValid) {
 *   console.error('Missing vars:', check.missing);
 * }
 * ```
 */
export function checkEnvVars(): {
  isValid: boolean;
  missing: string[];
} {
  const requiredVars = [
    EnvVars.GATEWAY_URL,
    EnvVars.REGISTRY_URL,
    EnvVars.SUBSCRIBER_ID,
    EnvVars.PRIVATE_KEY,
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  return {
    isValid: missing.length === 0,
    missing,
  };
}
