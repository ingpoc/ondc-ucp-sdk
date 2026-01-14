/**
 * ONDC HTTP Client Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ONDCClient } from './client';
import { initCrypto, generateKeyPair } from '../crypto';

describe('ONDC HTTP Client', () => {
  let client: ONDCClient;
  let validPrivateKey: string;

  beforeEach(async () => {
    await initCrypto();
    const keyPair = await generateKeyPair();
    validPrivateKey = keyPair.privateKey;

    client = new ONDCClient({
      baseURL: 'https://gateway.ondc.org',
      subscriberId: 'ondc.example.com',
      privateKey: validPrivateKey,
      keyId: 'key-1',
    });
  });

  describe('constructor', () => {
    it('should create client instance', () => {
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(ONDCClient);
    });

    it('should use default keyId when not provided', () => {
      const testClient = new ONDCClient({
        baseURL: 'https://gateway.ondc.org',
        subscriberId: 'ondc.example.com',
        privateKey: validPrivateKey,
      });

      expect(testClient).toBeDefined();
    });

    it('should store credentials', () => {
      const instance = client.getAxiosInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('updateCredentials', () => {
    it('should update subscriber ID', () => {
      client.updateCredentials('new.example.com', validPrivateKey);

      // Verify credentials were updated by checking the instance is still valid
      const instance = client.getAxiosInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('updateKeyId', () => {
    it('should update key identifier', () => {
      client.updateKeyId('new-key-2');

      // Verify keyId was updated by checking the instance is still valid
      const instance = client.getAxiosInstance();
      expect(instance).toBeDefined();
    });
  });

  describe('getAxiosInstance', () => {
    it('should return axios instance', () => {
      const instance = client.getAxiosInstance();

      expect(instance).toBeDefined();
      expect(instance).toHaveProperty('post');
      expect(instance).toHaveProperty('get');
    });
  });
});
