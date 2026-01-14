/**
 * Tests for Callback Manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CallbackManager } from './manager';
import { StateStore } from '../state/store';
import { AsyncPoller } from '../state/poller';
import type { BecknMessage } from '@ondc-agent/shared';

describe('CallbackManager', () => {
  let store: StateStore;
  let poller: AsyncPoller;
  let manager: CallbackManager;

  beforeEach(() => {
    store = new StateStore();
    poller = new AsyncPoller({
      stateStore: store,
      pollInterval: 50,
      defaultTimeout: 500,
    });
    manager = new CallbackManager({
      stateStore: store,
      poller,
    });
  });

  afterEach(() => {
    store.stopCleanup();
  });

  describe('registerRequest', () => {
    it('should register a pending request', () => {
      manager.registerRequest('tx123', 'search', { query: 'test' });

      const pending = store.get('tx123');
      expect(pending).toBeDefined();
      expect(pending?.type).toBe('search');
      expect(pending?.data).toEqual({ query: 'test' });
    });
  });

  describe('waitForCallback', () => {
    it('should resolve when callback arrives', async () => {
      manager.registerRequest('tx123', 'search');

      // Simulate callback after 100ms
      setTimeout(() => {
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
          message: { catalog: { items: [] } },
        };
        manager.handleCallback(message);
      }, 100);

      const result = await manager.waitForCallback('tx123');
      expect(result).toBeDefined();
      expect(result).toEqual({
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
        message: { catalog: { items: [] } },
      });
    });

    it('should timeout if callback never arrives', async () => {
      manager.registerRequest('tx123', 'search');

      await expect(manager.waitForCallback('tx123', 100)).rejects.toThrow();
    });

    it('should resolve immediately if callback already arrived', async () => {
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

      manager.registerRequest('tx123', 'search');
      manager.handleCallback(message);

      const result = await manager.waitForCallback('tx123');
      expect(result).toEqual(message);
    });
  });

  describe('handleCallback', () => {
    it('should ignore callbacks without transaction_id', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: '',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      manager.handleCallback(message);
      expect(consoleSpy).toHaveBeenCalledWith('Callback missing transaction_id');

      consoleSpy.mockRestore();
    });

    it('should warn about callbacks for unknown transactions', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const message: BecknMessage = {
        context: {
          domain: 'ondc',
          action: 'on_search',
          country: 'IND',
          city: 'std:011',
          bap_id: 'bap.example.com',
          bap_uri: 'https://bap.example.com',
          transaction_id: 'unknown_tx',
          message_id: 'msg123',
          timestamp: '2025-01-14T10:00:00Z',
          bpp_id: 'bpp.example.com',
          bpp_uri: 'https://bpp.example.com',
        },
        message: {},
      };

      manager.handleCallback(message);
      expect(consoleSpy).toHaveBeenCalledWith('No pending request for transaction: unknown_tx');

      consoleSpy.mockRestore();
    });

    it('should notify registered handlers', () => {
      const handler = vi.fn();
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

      manager.registerRequest('tx123', 'search');
      manager.onTransaction('tx123', handler);
      manager.handleCallback(message);

      expect(handler).toHaveBeenCalledWith(message);
    });
  });

  describe('completeWithError', () => {
    it('should complete request with error', async () => {
      manager.registerRequest('tx123', 'search');
      manager.completeWithError('tx123', 'Test error');

      await expect(manager.waitForCallback('tx123')).rejects.toThrow('Test error');
    });
  });

  describe('completeWithResult', () => {
    it('should complete request with custom result', async () => {
      manager.registerRequest('tx123', 'search');
      manager.completeWithResult('tx123', { custom: 'result' });

      const result = await manager.waitForCallback('tx123');
      expect(result).toEqual({ custom: 'result' });
    });
  });

  describe('removeRequest', () => {
    it('should remove pending request', () => {
      manager.registerRequest('tx123', 'search');
      expect(store.has('tx123')).toBe(true);

      manager.removeRequest('tx123');
      expect(store.has('tx123')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      manager.registerRequest('tx1', 'search');
      manager.registerRequest('tx2', 'select');

      const stats = manager.getStats();

      expect(stats.pendingRequests).toBe(2);
      expect(stats.waitingHandlers).toBe(0);
      expect(stats.stateStoreSize).toBe(2);
    });
  });
});
