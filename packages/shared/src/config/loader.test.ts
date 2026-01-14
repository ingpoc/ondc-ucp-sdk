/**
 * Config Loader Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  loadConfig,
  loadConfigWithOverrides,
  checkEnvVars,
  EnvVars,
  ConfigValidationError,
  MissingEnvVarError,
} from './loader';

describe('Config Loader', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear relevant env vars before each test
    delete process.env.ONDC_GATEWAY_URL;
    delete process.env.ONDC_REGISTRY_URL;
    delete process.env.ONDC_SUBSCRIBER_ID;
    delete process.env.ONDC_PRIVATE_KEY;
    delete process.env.ONDC_ENVIRONMENT;
    delete process.env.ONDC_KEY_ID;
  });

  afterEach(() => {
    // Restore original env after each test
    process.env = { ...originalEnv };
  });

  describe('loadConfig', () => {
    it('should load valid configuration from env vars', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      const config = loadConfig();

      expect(config.gatewayUrl).toBe('https://gateway.ondc.org');
      expect(config.registryUrl).toBe('https://registry.ondc.org');
      expect(config.subscriberId).toBe('ondc.example.com');
      expect(config.privateKey).toBe('dGVzdC1wcml2YXRlLWtleQ==');
      expect(config.environment).toBe('development');
      expect(config.keyId).toBe('default-key');
    });

    it('should use custom environment when provided', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';
      process.env.ONDC_ENVIRONMENT = 'production';

      const config = loadConfig();

      expect(config.environment).toBe('production');
    });

    it('should use custom keyId when provided', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';
      process.env.ONDC_KEY_ID = 'key-42';

      const config = loadConfig();

      expect(config.keyId).toBe('key-42');
    });

    it('should throw MissingEnvVarError when gateway URL is missing', () => {
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      expect(() => loadConfig()).toThrow(MissingEnvVarError);
    });

    it('should throw MissingEnvVarError when registry URL is missing', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      expect(() => loadConfig()).toThrow(MissingEnvVarError);
    });

    it('should throw MissingEnvVarError when subscriber ID is missing', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      expect(() => loadConfig()).toThrow(MissingEnvVarError);
    });

    it('should throw MissingEnvVarError when private key is missing', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';

      expect(() => loadConfig()).toThrow(MissingEnvVarError);
    });

    it('should throw ConfigValidationError for invalid URL', () => {
      process.env.ONDC_GATEWAY_URL = 'not-a-url';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      expect(() => loadConfig()).toThrow(ConfigValidationError);
    });

    it('should throw ConfigValidationError for invalid environment', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';
      process.env.ONDC_ENVIRONMENT = 'invalid';

      expect(() => loadConfig()).toThrow(ConfigValidationError);
    });
  });

  describe('loadConfigWithOverrides', () => {
    it('should override environment value', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';
      process.env.ONDC_ENVIRONMENT = 'development';

      const config = loadConfigWithOverrides({ environment: 'production' });

      expect(config.environment).toBe('production');
    });

    it('should override keyId value', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      const config = loadConfigWithOverrides({ keyId: 'override-key' });

      expect(config.keyId).toBe('override-key');
    });

    it('should merge env vars with overrides', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      const config = loadConfigWithOverrides({
        environment: 'staging',
        keyId: 'test-key',
      });

      expect(config.gatewayUrl).toBe('https://gateway.ondc.org');
      expect(config.environment).toBe('staging');
      expect(config.keyId).toBe('test-key');
    });

    it('should throw MissingEnvVarError if required env var is missing', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      expect(() =>
        loadConfigWithOverrides({ environment: 'production' })
      ).toThrow(MissingEnvVarError);
    });
  });

  describe('checkEnvVars', () => {
    it('should return true when all env vars are set', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      const check = checkEnvVars();

      expect(check.isValid).toBe(true);
      expect(check.missing).toEqual([]);
    });

    it('should return false when env vars are missing', () => {
      const check = checkEnvVars();

      expect(check.isValid).toBe(false);
      expect(check.missing).toContain(EnvVars.GATEWAY_URL);
      expect(check.missing).toContain(EnvVars.REGISTRY_URL);
      expect(check.missing).toContain(EnvVars.SUBSCRIBER_ID);
      expect(check.missing).toContain(EnvVars.PRIVATE_KEY);
    });

    it('should report only missing env vars', () => {
      process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      const check = checkEnvVars();

      expect(check.isValid).toBe(false);
      expect(check.missing).not.toContain(EnvVars.GATEWAY_URL);
      expect(check.missing).not.toContain(EnvVars.PRIVATE_KEY);
      expect(check.missing).toContain(EnvVars.REGISTRY_URL);
      expect(check.missing).toContain(EnvVars.SUBSCRIBER_ID);
    });
  });

  describe('EnvVars', () => {
    it('should have correct environment variable names', () => {
      expect(EnvVars.GATEWAY_URL).toBe('ONDC_GATEWAY_URL');
      expect(EnvVars.REGISTRY_URL).toBe('ONDC_REGISTRY_URL');
      expect(EnvVars.SUBSCRIBER_ID).toBe('ONDC_SUBSCRIBER_ID');
      expect(EnvVars.PRIVATE_KEY).toBe('ONDC_PRIVATE_KEY');
      expect(EnvVars.ENVIRONMENT).toBe('ONDC_ENVIRONMENT');
      expect(EnvVars.KEY_ID).toBe('ONDC_KEY_ID');
    });
  });

  describe('Error messages', () => {
    it('should provide clear error message for missing env var', () => {
      try {
        loadConfig();
      } catch (e) {
        expect(e).toBeInstanceOf(MissingEnvVarError);
        if (e instanceof MissingEnvVarError) {
          expect(e.message).toContain('Missing required environment variable');
          expect(e.message).toContain('ONDC_GATEWAY_URL');
        }
      }
    });

    it('should provide clear error message for validation failure', () => {
      process.env.ONDC_GATEWAY_URL = 'invalid-url';
      process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
      process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
      process.env.ONDC_PRIVATE_KEY = 'dGVzdC1wcml2YXRlLWtleQ==';

      try {
        loadConfig();
      } catch (e) {
        expect(e).toBeInstanceOf(ConfigValidationError);
        if (e instanceof ConfigValidationError) {
          expect(e.message).toContain('Configuration validation failed');
          expect(e.errors).toBeDefined();
        }
      }
    });
  });
});
