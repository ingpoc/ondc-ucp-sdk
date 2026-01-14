/**
 * Key Generation Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initCrypto,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
} from './keys';

describe('Key Generation', () => {
  beforeEach(async () => {
    await initCrypto();
  });

  describe('generateKeyPair', () => {
    it('should generate a valid Ed25519 key pair', async () => {
      const keyPair = await generateKeyPair();

      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
      expect(typeof keyPair.publicKey).toBe('string');
      expect(typeof keyPair.privateKey).toBe('string');
    });

    it('should generate base64 encoded keys', async () => {
      const keyPair = await generateKeyPair();

      // Base64 should contain only valid characters
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      expect(keyPair.publicKey).toMatch(base64Regex);
      expect(keyPair.privateKey).toMatch(base64Regex);
    });

    it('should generate different keys each time', async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });

    it('should generate public key of correct length', async () => {
      const keyPair = await generateKeyPair();

      // Ed25519 public key is 32 bytes, base64 encoded ~44 chars
      expect(keyPair.publicKey.length).toBeGreaterThan(40);
      expect(keyPair.publicKey.length).toBeLessThan(50);
    });

    it('should generate private key of correct length', async () => {
      const keyPair = await generateKeyPair();

      // Ed25519 private key is 64 bytes (32 seed + 32 public), base64 encoded ~88 chars
      expect(keyPair.privateKey.length).toBeGreaterThan(80);
      expect(keyPair.privateKey.length).toBeLessThan(100);
    });
  });

  describe('generateKeyPairFromSeed', () => {
    it('should generate deterministic key pair from seed', async () => {
      // Create a seed (exactly 32 bytes, base64 encoded)
      const seed = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32 bytes of 0x00

      const keyPair1 = await generateKeyPairFromSeed(seed);
      const keyPair2 = await generateKeyPairFromSeed(seed);

      expect(keyPair1.publicKey).toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).toBe(keyPair2.privateKey);
    });

    it('should generate different keys from different seeds', async () => {
      // Two different 32-byte seeds
      const seed1 = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32 bytes of 0x00
      const seed2 = 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // first byte is 0x01

      const keyPair1 = await generateKeyPairFromSeed(seed1);
      const keyPair2 = await generateKeyPairFromSeed(seed2);

      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
    });

    it('should generate valid base64 keys from seed', async () => {
      const seed = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA='; // 32 bytes of 0x00
      const keyPair = await generateKeyPairFromSeed(seed);

      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      expect(keyPair.publicKey).toMatch(base64Regex);
      expect(keyPair.privateKey).toMatch(base64Regex);
    });
  });

  describe('getPublicKey', () => {
    it('should extract public key from private key', async () => {
      const keyPair = await generateKeyPair();
      const extractedPublicKey = await getPublicKey(keyPair.privateKey);

      expect(extractedPublicKey).toBe(keyPair.publicKey);
    });

    it('should return consistent public key for same private key', async () => {
      const keyPair = await generateKeyPair();
      const publicKey1 = await getPublicKey(keyPair.privateKey);
      const publicKey2 = await getPublicKey(keyPair.privateKey);

      expect(publicKey1).toBe(publicKey2);
    });

    it('should return different public keys for different private keys', async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();

      const publicKey1 = await getPublicKey(keyPair1.privateKey);
      const publicKey2 = await getPublicKey(keyPair2.privateKey);

      expect(publicKey1).not.toBe(publicKey2);
    });
  });
});
