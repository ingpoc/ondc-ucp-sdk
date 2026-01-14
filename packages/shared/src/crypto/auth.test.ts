/**
 * ONDC Authorization Header Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initCrypto,
  generateKeyPair,
  buildAuthHeader,
  parseAuthHeader,
} from './index';

describe('ONDC Auth Header', () => {
  let testKeyPair: Awaited<ReturnType<typeof generateKeyPair>>;

  beforeEach(async () => {
    await initCrypto();
    testKeyPair = await generateKeyPair();
  });

  describe('buildAuthHeader', () => {
    it('should build valid ONDC auth header', async () => {
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{"context":{},"message":{}}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      expect(header).toBeDefined();
      expect(header).toMatch(/^Signature /);
      expect(header).toContain('keyId=');
      expect(header).toContain('signature=');
      expect(header).toContain('created=');
    });

    it('should include subscriber ID in keyId', async () => {
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      expect(header).toContain('ondc.example.com|key-1|ed25519');
    });

    it('should include created timestamp', async () => {
      const created = '2025-01-14T10:30:00.000Z';
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created,
        keyId: 'key-1',
      });

      expect(header).toContain(`created="${created}"`);
    });

    it('should generate base64 signature', async () => {
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      // Extract signature value
      const match = header.match(/signature="([^"]+)"/);
      expect(match).toBeTruthy();

      const signature = match![1];
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      expect(signature).toMatch(base64Regex);
    });

    it('should generate different signatures for different bodies', async () => {
      const header1 = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{"message":"first"}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      const header2 = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{"message":"second"}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      const sig1 = header1.match(/signature="([^"]+)"/)![1];
      const sig2 = header2.match(/signature="([^"]+)"/)![1];

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different timestamps', async () => {
      const header1 = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      const header2 = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created: '2025-01-14T10:31:00.000Z',
        keyId: 'key-1',
      });

      const sig1 = header1.match(/signature="([^"]+)"/)![1];
      const sig2 = header2.match(/signature="([^"]+)"/)![1];

      expect(sig1).not.toBe(sig2);
    });

    it('should handle empty request body', async () => {
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      expect(header).toBeDefined();
      expect(header).toMatch(/^Signature /);
    });

    it('should handle large JSON bodies', async () => {
      const largeBody = JSON.stringify({
        context: { domain: 'ondc', action: 'search' },
        message: {
          intent: {
            item: {
              descriptor: {
                name: 'Product Name',
                long_desc: 'A'.repeat(1000),
              },
            },
          },
        },
      });

      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: largeBody,
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      expect(header).toBeDefined();
    });

    it('should format header exactly as ONDC spec', async () => {
      const header = await buildAuthHeader('ondc.example.com', testKeyPair.privateKey, {
        body: '{}',
        created: '2025-01-14T10:30:00.000Z',
        keyId: 'key-1',
      });

      // Expected format: Signature keyId="{subscriberId}|{keyId}|ed25519",signature="{sig}",created="{timestamp}"
      const expectedFormat = /^Signature keyId="[^"]+\|[^"]+\|ed25519",signature="[^"]+",created="[^"]+"$/;

      expect(header).toMatch(expectedFormat);
    });
  });

  describe('parseAuthHeader', () => {
    it('should parse valid auth header', () => {
      const header = 'Signature keyId="ondc.example.com|key-1|ed25519",signature="abcd1234",created="2025-01-14T10:30:00.000Z"';

      const parsed = parseAuthHeader(header);

      expect(parsed).toEqual({
        subscriberId: 'ondc.example.com',
        keyId: 'key-1',
        algorithm: 'ed25519',
        signature: 'abcd1234',
        created: '2025-01-14T10:30:00.000Z',
      });
    });

    it('should return null for header without Signature prefix', () => {
      const header = 'Bearer token123';
      expect(parseAuthHeader(header)).toBeNull();
    });

    it('should return null for malformed keyId', () => {
      const header = 'Signature keyId="invalid",signature="abc",created="2025-01-14T10:30:00.000Z"';
      expect(parseAuthHeader(header)).toBeNull();
    });

    it('should return null for missing required fields', () => {
      const header = 'Signature keyId="a|b|ed25519"';
      expect(parseAuthHeader(header)).toBeNull();
    });

    it('should return null for non-ed25519 algorithm', () => {
      const header = 'Signature keyId="a|b|rsa",signature="abc",created="2025-01-14T10:30:00.000Z"';
      expect(parseAuthHeader(header)).toBeNull();
    });

    it('should handle whitespace in header', () => {
      const header = 'Signature keyId="ondc.example.com|key-1|ed25519", signature="abcd1234" , created="2025-01-14T10:30:00.000Z"';

      const parsed = parseAuthHeader(header);

      expect(parsed).not.toBeNull();
      expect(parsed?.signature).toBe('abcd1234');
    });
  });

  describe('build/parse round trip', () => {
    it('should build and parse auth header correctly', async () => {
      const subscriberId = 'ondc.example.com';
      const keyId = 'key-42';
      const created = '2025-01-14T10:30:00.000Z';
      const body = '{"test": true}';

      const header = await buildAuthHeader(subscriberId, testKeyPair.privateKey, {
        body,
        created,
        keyId,
      });

      const parsed = parseAuthHeader(header);

      expect(parsed).toEqual({
        subscriberId,
        keyId,
        algorithm: 'ed25519',
        signature: expect.any(String),
        created,
      });
    });
  });
});
