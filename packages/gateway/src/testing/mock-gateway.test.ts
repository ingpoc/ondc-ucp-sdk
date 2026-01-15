/**
 * Tests for Mock ONDC Gateway Server
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockGateway, createMockGateway, type MockGatewayResponse } from './mock-gateway';
import type { BecknCatalog } from '@ondc-agent/shared';

/**
 * Type for health check response
 */
interface HealthResponse {
  status: string;
  port: number;
}

/**
 * Type for custom route response
 */
interface CustomResponse {
  custom: boolean;
}

describe('MockGateway', () => {
  let gateway: MockGateway;

  afterEach(async () => {
    if (gateway?.isRunning()) {
      await gateway.stop();
    }
  });

  describe('server lifecycle', () => {
    it('should start on random port', async () => {
      gateway = new MockGateway();
      const port = await gateway.start();

      expect(port).toBeGreaterThan(0);
      expect(gateway.isRunning()).toBe(true);
      expect(gateway.getPort()).toBe(port);
    });

    it('should stop gracefully', async () => {
      gateway = new MockGateway();
      await gateway.start();

      expect(gateway.isRunning()).toBe(true);

      await gateway.stop();

      expect(gateway.isRunning()).toBe(false);
      expect(gateway.getPort()).toBe(0);
    });

    it('should provide base URL', async () => {
      gateway = new MockGateway();
      const port = await gateway.start();

      expect(gateway.getBaseUrl()).toBe(`http://localhost:${port}`);
    });
  });

  describe('createMockGateway helper', () => {
    it('should create and start gateway', async () => {
      gateway = await createMockGateway();

      expect(gateway.isRunning()).toBe(true);
      expect(gateway.getPort()).toBeGreaterThan(0);
    });

    it('should accept config options', async () => {
      gateway = await createMockGateway({ callbackDelay: 500 });

      expect(gateway.isRunning()).toBe(true);
    });
  });

  describe('POST /search', () => {
    beforeEach(async () => {
      gateway = new MockGateway({ autoCallback: false });
      await gateway.start();
    });

    it('should return ACK for valid request', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'search',
            transaction_id: 'txn-123',
            message_id: 'msg-123',
            bap_id: 'bap.example.com',
            bap_uri: 'http://localhost:3000',
            timestamp: new Date().toISOString(),
          },
          message: {
            intent: {
              item: { descriptor: { name: 'test' } },
            },
          },
        }),
      });

      const data = await response.json() as MockGatewayResponse;

      expect(response.status).toBe(200);
      expect(data.message.ack.status).toBe('ACK');
    });

    it('should return NACK for missing transaction_id', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'search',
          },
          message: {},
        }),
      });

      const data = await response.json() as MockGatewayResponse;

      expect(response.status).toBe(400);
      expect(data.message.ack.status).toBe('NACK');
    });

    it('should return NACK for missing context', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {},
        }),
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /select', () => {
    beforeEach(async () => {
      gateway = new MockGateway();
      await gateway.start();
    });

    it('should return ACK for valid request', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'select',
            transaction_id: 'txn-123',
            message_id: 'msg-123',
          },
          message: {
            order: { provider: { id: 'p1' } },
          },
        }),
      });

      const data = await response.json() as MockGatewayResponse;

      expect(response.status).toBe(200);
      expect(data.message.ack.status).toBe('ACK');
    });
  });

  describe('POST /init', () => {
    beforeEach(async () => {
      gateway = new MockGateway();
      await gateway.start();
    });

    it('should return ACK for valid request', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'init',
            transaction_id: 'txn-123',
            message_id: 'msg-123',
          },
          message: {
            order: { provider: { id: 'p1' } },
          },
        }),
      });

      const data = await response.json() as MockGatewayResponse;

      expect(response.status).toBe(200);
      expect(data.message.ack.status).toBe('ACK');
    });
  });

  describe('POST /confirm', () => {
    beforeEach(async () => {
      gateway = new MockGateway();
      await gateway.start();
    });

    it('should return ACK for valid request', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'confirm',
            transaction_id: 'txn-123',
            message_id: 'msg-123',
          },
          message: {
            order: { provider: { id: 'p1' } },
          },
        }),
      });

      const data = await response.json() as MockGatewayResponse;

      expect(response.status).toBe(200);
      expect(data.message.ack.status).toBe('ACK');
    });
  });

  describe('GET /health', () => {
    beforeEach(async () => {
      gateway = new MockGateway();
      await gateway.start();
    });

    it('should return healthy status', async () => {
      const response = await fetch(`${gateway.getBaseUrl()}/health`);
      const data = await response.json() as HealthResponse;

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.port).toBe(gateway.getPort());
    });
  });

  describe('configuration', () => {
    it('should allow custom catalog', async () => {
      const customCatalog: BecknCatalog = {
        'bpp/descriptor': { name: 'Custom Gateway' },
        'bpp/providers': [{
          id: 'custom-provider',
          descriptor: { name: 'Custom Provider' },
          items: [],
        }],
      };

      gateway = new MockGateway({ catalog: customCatalog });
      await gateway.start();

      // Catalog is used internally for callbacks
      expect(gateway.isRunning()).toBe(true);
    });

    it('should allow updating catalog at runtime', async () => {
      gateway = new MockGateway();
      await gateway.start();

      const newCatalog: BecknCatalog = {
        'bpp/descriptor': { name: 'Updated Gateway' },
        'bpp/providers': [],
      };

      gateway.setCatalog(newCatalog);

      // Just verify no errors
      expect(gateway.isRunning()).toBe(true);
    });

    it('should allow custom callback delay', async () => {
      gateway = new MockGateway({ callbackDelay: 500 });
      await gateway.start();

      expect(gateway.isRunning()).toBe(true);
    });

    it('should allow updating callback delay at runtime', async () => {
      gateway = new MockGateway();
      await gateway.start();

      gateway.setCallbackDelay(200);

      // Just verify no errors
      expect(gateway.isRunning()).toBe(true);
    });

    it('should disable auto callback when configured', async () => {
      gateway = new MockGateway({ autoCallback: false });
      await gateway.start();

      // Send search request
      const response = await fetch(`${gateway.getBaseUrl()}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: {
            domain: 'ONDC:RET10',
            action: 'search',
            transaction_id: 'txn-no-callback',
            message_id: 'msg-123',
            bap_uri: 'http://localhost:9999', // Non-existent callback URL
          },
          message: { intent: {} },
        }),
      });

      expect(response.status).toBe(200);
      // With autoCallback: false, no callback is attempted
    });
  });

  describe('Express app access', () => {
    it('should provide access to Express app', async () => {
      gateway = new MockGateway();
      const app = gateway.getApp();

      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
      expect(typeof app.post).toBe('function');
    });

    it('should allow adding custom routes', async () => {
      gateway = new MockGateway();
      const app = gateway.getApp();

      app.get('/custom', (_req, res) => {
        res.json({ custom: true });
      });

      await gateway.start();

      const response = await fetch(`${gateway.getBaseUrl()}/custom`);
      const data = await response.json() as CustomResponse;

      expect(data.custom).toBe(true);
    });
  });
});
