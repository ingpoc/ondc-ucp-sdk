/**
 * Signing Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  initCrypto,
  generateKeyPair,
  signMessage,
  verifySignature,
} from './index';

describe('Signing', () => {
  beforeEach(async () => {
    await initCrypto();
  });

  describe('signMessage', () => {
    it('should sign a message with private key', async () => {
      const keyPair = await generateKeyPair();
      const message = 'hello world';
      const signature = await signMessage(message, keyPair.privateKey);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');

      // Signature should be base64
      const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;
      expect(signature).toMatch(base64Regex);

      // Ed25519 signature is 64 bytes, base64 encoded ~88 chars
      expect(signature.length).toBeGreaterThan(80);
      expect(signature.length).toBeLessThan(100);
    });

    it('should generate different signatures for different messages', async () => {
      const keyPair = await generateKeyPair();

      const sig1 = await signMessage('message1', keyPair.privateKey);
      const sig2 = await signMessage('message2', keyPair.privateKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for same message with different keys', async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();

      const message = 'same message';
      const sig1 = await signMessage(message, keyPair1.privateKey);
      const sig2 = await signMessage(message, keyPair2.privateKey);

      expect(sig1).not.toBe(sig2);
    });

    it('should generate same signature for same message and key', async () => {
      const keyPair = await generateKeyPair();
      const message = 'deterministic message';

      const sig1 = await signMessage(message, keyPair.privateKey);
      const sig2 = await signMessage(message, keyPair.privateKey);

      expect(sig1).toBe(sig2);
    });

    it('should handle empty string message', async () => {
      const keyPair = await generateKeyPair();
      const signature = await signMessage('', keyPair.privateKey);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
    });

    it('should handle unicode messages', async () => {
      const keyPair = await generateKeyPair();
      const message = 'Hello 世界 🌍';
      const signature = await signMessage(message, keyPair.privateKey);

      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
    });
  });

  describe('verifySignature', () => {
    it('should verify a valid signature', async () => {
      const keyPair = await generateKeyPair();
      const message = 'hello world';
      const signature = await signMessage(message, keyPair.privateKey);

      const isValid = verifySignature(message, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', async () => {
      const keyPair = await generateKeyPair();
      const message = 'hello world';
      const fakeSignature = 'invalid_signature_base64';

      const isValid = verifySignature(
        message,
        fakeSignature,
        keyPair.publicKey
      );

      expect(isValid).toBe(false);
    });

    it('should reject signature for different message', async () => {
      const keyPair = await generateKeyPair();

      const signature = await signMessage(
        'original message',
        keyPair.privateKey
      );

      const isValid = verifySignature(
        'different message',
        signature,
        keyPair.publicKey
      );

      expect(isValid).toBe(false);
    });

    it('should reject signature with different public key', async () => {
      const keyPair1 = await generateKeyPair();
      const keyPair2 = await generateKeyPair();

      const signature = await signMessage('message', keyPair1.privateKey);

      const isValid = verifySignature(
        'message',
        signature,
        keyPair2.publicKey
      );

      expect(isValid).toBe(false);
    });

    it('should handle empty string message', async () => {
      const keyPair = await generateKeyPair();
      const signature = await signMessage('', keyPair.privateKey);

      const isValid = verifySignature('', signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should handle unicode messages', async () => {
      const keyPair = await generateKeyPair();
      const message = 'Hello 世界 🌍';
      const signature = await signMessage(message, keyPair.privateKey);

      const isValid = verifySignature(message, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });
  });

  describe('sign/verify round trip', () => {
    it('should complete sign and verify cycle', async () => {
      const keyPair = await generateKeyPair();
      const message = 'The quick brown fox jumps over the lazy dog';

      const signature = await signMessage(message, keyPair.privateKey);
      const isValid = verifySignature(message, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });

    it('should work with JSON messages', async () => {
      const keyPair = await generateKeyPair();
      const message = JSON.stringify({
        context: {
          domain: 'ondc',
          action: 'search',
          transaction_id: '12345',
        },
        message: { intent: { item: { descriptor: { name: 'apple' } } } },
      });

      const signature = await signMessage(message, keyPair.privateKey);
      const isValid = verifySignature(message, signature, keyPair.publicKey);

      expect(isValid).toBe(true);
    });
  });
});
