/**
 * Config Schema Tests
 */

import { describe, it, expect } from 'vitest';
import {
  GatewayConfigSchema,
  EnvironmentEnum,
  type GatewayConfig,
} from './schema';

describe('Config Schema', () => {
  const validConfig = {
    gatewayUrl: 'https://gateway.ondc.org',
    registryUrl: 'https://registry.ondc.org',
    subscriberId: 'ondc.example.com',
    privateKey: 'dGVzdC1wcml2YXRlLWtleQ==',
  };

  describe('GatewayConfigSchema', () => {
    it('should accept valid config', () => {
      const result = GatewayConfigSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          ...validConfig,
          environment: 'development',
          keyId: 'default-key',
        });
      }
    });

    it('should accept config with all fields', () => {
      const fullConfig = {
        ...validConfig,
        environment: 'production' as const,
        keyId: 'key-42',
      };

      const result = GatewayConfigSchema.safeParse(fullConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.environment).toBe('production');
        expect(result.data.keyId).toBe('key-42');
      }
    });

    it('should reject invalid gateway URL', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        gatewayUrl: 'not-a-url',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid registry URL', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        registryUrl: 'not-a-url',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty subscriber ID', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        subscriberId: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty private key', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        privateKey: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid environment', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        environment: 'invalid',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('EnvironmentEnum', () => {
    it('should accept production', () => {
      const result = EnvironmentEnum.safeParse('production');
      expect(result.success).toBe(true);
    });

    it('should accept staging', () => {
      const result = EnvironmentEnum.safeParse('staging');
      expect(result.success).toBe(true);
    });

    it('should accept development', () => {
      const result = EnvironmentEnum.safeParse('development');
      expect(result.success).toBe(true);
    });

    it('should reject invalid environment', () => {
      const result = EnvironmentEnum.safeParse('invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('Type inference', () => {
    it('should infer correct TypeScript types', () => {
      const config: GatewayConfig = {
        gatewayUrl: 'https://gateway.ondc.org',
        registryUrl: 'https://registry.ondc.org',
        subscriberId: 'ondc.example.com',
        privateKey: 'key',
        environment: 'production',
        keyId: 'key-1',
      };

      expect(config.environment).toBe('production');
      expect(config.keyId).toBe('key-1');
    });
  });

  describe('Default values', () => {
    it('should default environment to development', () => {
      const result = GatewayConfigSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.environment).toBe('development');
      }
    });

    it('should default keyId to default-key', () => {
      const result = GatewayConfigSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.keyId).toBe('default-key');
      }
    });
  });

  describe('URL validation', () => {
    it('should accept http URLs', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        gatewayUrl: 'http://localhost:3000',
      });

      expect(result.success).toBe(true);
    });

    it('should accept https URLs', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        gatewayUrl: 'https://gateway.ondc.org',
      });

      expect(result.success).toBe(true);
    });

    it('should reject URLs without protocol', () => {
      const result = GatewayConfigSchema.safeParse({
        ...validConfig,
        gatewayUrl: 'gateway.ondc.org',
      });

      expect(result.success).toBe(false);
    });
  });
});
