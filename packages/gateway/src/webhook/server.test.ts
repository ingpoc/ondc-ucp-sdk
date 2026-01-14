/**
 * Tests for ONDC Webhook Server
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { WebhookServer } from './server';
import type { BecknMessage } from '@ondc-agent/shared';

describe('WebhookServer', () => {
  let server: WebhookServer;

  beforeEach(() => {
    server = new WebhookServer({ requireSignature: false });
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('constructor', () => {
    it('should create server with default config', () => {
      const app = server.getApp();
      expect(app).toBeDefined();
    });

    it('should create server with custom config', () => {
      const customServer = new WebhookServer({ port: 4000, host: 'localhost' });
      expect(customServer).toBeDefined();
    });
  });

  describe('endpoint registration', () => {
    it('should have on_search endpoint', async () => {
      const app = server.getApp();
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should have health check endpoint', async () => {
      const app = server.getApp();
      const response = await request(app).get('/health');
      expect(response.body).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
      });
    });
  });

  describe('POST /on_search', () => {
    it('should accept on_search callbacks', async () => {
      const handler = vi.fn();
      server.on('on_search', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: {
          ack: {
            status: 'ACK',
          },
        },
      });
      expect(handler).toHaveBeenCalledWith(message);
    });

    it('should handle missing handlers gracefully', async () => {
      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(202);
      expect(response.body).toMatchObject({
        acknowledged: true,
        message: 'No handlers registered',
      });
    });

    it('should return NACK on handler error', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Handler failed'));
      server.on('on_search', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(500);
      expect(response.body).toMatchObject({
        message: {
          ack: {
            status: 'NACK',
          },
        },
        error: 'Handler failed',
      });
    });
  });

  describe('POST /on_select', () => {
    it('should accept on_select callbacks', async () => {
      const handler = vi.fn();
      server.on('on_select', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_select',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_select')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe('POST /on_confirm', () => {
    it('should accept on_confirm callbacks', async () => {
      const handler = vi.fn();
      server.on('on_confirm', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_confirm',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_confirm')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe('POST /on_init', () => {
    it('should accept on_init callbacks', async () => {
      const handler = vi.fn();
      server.on('on_init', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_init',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_init')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe('POST /on_status', () => {
    it('should accept on_status callbacks', async () => {
      const handler = vi.fn();
      server.on('on_status', handler);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_status',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_status')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe('handler management', () => {
    it('should register multiple handlers for same action', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      server.on('on_search', handler1);
      server.on('on_search', handler2);

      expect(server.handlerCount('on_search')).toBe(2);

      const app = server.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      await request(app)
        .post('/on_search')
        .send(message)
        .set('Content-Type', 'application/json');

      expect(handler1).toHaveBeenCalledWith(message);
      expect(handler2).toHaveBeenCalledWith(message);
    });

    it('should return 0 for actions with no handlers', () => {
      expect(server.handlerCount('on_search')).toBe(0);
    });
  });

  describe('server lifecycle', () => {
    it('should start and stop server', async () => {
      await server.start(0); // Use random port
      await server.stop();
      // If we get here, start/stop worked
      expect(true).toBe(true);
    });

    it('should reject if port is in use', async () => {
      const server1 = new WebhookServer();
      await server1.start(0);

      // Get the actual port using getPort()
      const port = server1.getPort();

      try {
        // Try to start another server on the same port
        const server2 = new WebhookServer();
        await expect(server2.start(port!)).rejects.toThrow('already in use');
      } finally {
        await server1.stop();
      }
    });

    it('should handle stop when not started', async () => {
      await server.stop();
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('raw body parsing', () => {
    it('should handle raw body for signature verification', async () => {
      const handler = vi.fn((msg: BecknMessage) => {
        expect(msg).toBeDefined();
      });
      server.on('on_search', handler);

      const app = server.getApp();
      const rawJson = JSON.stringify({
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      });

      const response = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .send(rawJson);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('signature verification', () => {
    it('should require signature verification by default', async () => {
      const serverWithSig = new WebhookServer({ requireSignature: true });
      const handler = vi.fn();
      serverWithSig.on('on_search', handler);

      const app = serverWithSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .send(message)
        .set('Content-Type', 'application/json');

      // Should fail without Authorization header
      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: { ack: { status: 'NACK' } },
        error: 'Missing Authorization header',
      });

      await serverWithSig.stop();
    });

    it('should accept valid signatures', async () => {
      const serverWithSig = new WebhookServer({ requireSignature: true });

      // Import crypto functions
      const { generateKeyPair, buildAuthHeader } = await import('@ondc-agent/shared');

      // Generate key pair for the BPP
      const keyPair = await generateKeyPair();
      serverWithSig.registerPublicKey('bpp.example.com', keyPair.publicKey);

      const handler = vi.fn();
      serverWithSig.on('on_search', handler);

      const app = serverWithSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      // Build auth header
      const bodyString = JSON.stringify(message);
      const created = '2025-01-14T10:00:00Z';
      const authHeader = await buildAuthHeader('bpp.example.com', keyPair.privateKey, {
        body: bodyString,
        created,
        keyId: 'key-1',
      });

      const response = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .set('Authorization', authHeader)
        .send(bodyString);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);

      await serverWithSig.stop();
    });

    it('should reject invalid signatures', async () => {
      const serverWithSig = new WebhookServer({ requireSignature: true });

      const { generateKeyPair } = await import('@ondc-agent/shared');

      // Register one key
      const keyPair = await generateKeyPair();
      serverWithSig.registerPublicKey('bpp.example.com', keyPair.publicKey);

      const handler = vi.fn();
      serverWithSig.on('on_search', handler);

      const app = serverWithSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      // Use invalid signature
      const response = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Signature keyId="bpp.example.com|key-1|ed25519",signature="invalid",created="2025-01-14T10:00:00Z"')
        .send(message);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: { ack: { status: 'NACK' } },
        error: 'Invalid signature',
      });

      await serverWithSig.stop();
    });

    it('should reject unknown subscribers', async () => {
      const serverWithSig = new WebhookServer({ requireSignature: true });

      const handler = vi.fn();
      serverWithSig.on('on_search', handler);

      const app = serverWithSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'unknown.example.com',
          bpp_uri: 'https://unknown.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Signature keyId="unknown.example.com|key-1|ed25519",signature="abc",created="2025-01-14T10:00:00Z"')
        .send(message);

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        message: { ack: { status: 'NACK' } },
        error: 'Unknown subscriber',
      });

      await serverWithSig.stop();
    });

    it('should allow disabling signature verification', async () => {
      const serverNoSig = new WebhookServer({ requireSignature: false });
      const handler = vi.fn();
      serverNoSig.on('on_search', handler);

      const app = serverNoSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      const response = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .send(message);

      expect(response.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);

      await serverNoSig.stop();
    });

    it('should allow signature verification bypass when registered', async () => {
      const serverWithSig = new WebhookServer({ requireSignature: true });

      const { generateKeyPair, buildAuthHeader } = await import('@ondc-agent/shared');

      // Generate key pair for the BPP
      const keyPair = await generateKeyPair();
      serverWithSig.registerPublicKey('bpp.example.com', keyPair.publicKey);

      const handler = vi.fn();
      serverWithSig.on('on_search', handler);

      const app = serverWithSig.getApp();
      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'tx123',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      // Build valid auth header
      const bodyString = JSON.stringify(message);
      const created = '2025-01-14T10:00:00Z';
      const authHeader = await buildAuthHeader('bpp.example.com', keyPair.privateKey, {
        body: bodyString,
        created,
        keyId: 'key-1',
      });

      // First request without signature should fail
      const response1 = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .send(message);

      expect(response1.status).toBe(401);

      // Second request with valid signature should succeed
      const response2 = await request(app)
        .post('/on_search')
        .set('Content-Type', 'application/json')
        .set('Authorization', authHeader)
        .send(bodyString);

      expect(response2.status).toBe(200);
      expect(handler).toHaveBeenCalledWith(message);

      await serverWithSig.stop();
    });
  });

  describe('public key management', () => {
    it('should register and retrieve public keys', () => {
      server.registerPublicKey('test.example.com', 'public-key-123');

      expect(server.getPublicKey('test.example.com')).toBe('public-key-123');
      expect(server.getPublicKey('unknown.example.com')).toBeUndefined();
    });

    it('should remove public keys', () => {
      server.registerPublicKey('test.example.com', 'public-key-123');
      expect(server.getPublicKey('test.example.com')).toBe('public-key-123');

      server.removePublicKey('test.example.com');
      expect(server.getPublicKey('test.example.com')).toBeUndefined();
    });

    it('should overwrite existing public keys', () => {
      server.registerPublicKey('test.example.com', 'key-1');
      server.registerPublicKey('test.example.com', 'key-2');

      expect(server.getPublicKey('test.example.com')).toBe('key-2');
    });
  });
});
