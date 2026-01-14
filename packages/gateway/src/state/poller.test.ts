/**
 * Tests for Async Poller
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AsyncPoller, createCallbackResult, createCallbackError } from './poller';
import { StateStore } from './store';

describe('AsyncPoller', () => {
  let store: StateStore;
  let poller: AsyncPoller;

  beforeEach(() => {
    store = new StateStore();
    poller = new AsyncPoller({
      stateStore: store,
      pollInterval: 50, // Fast polling for tests
      defaultTimeout: 500,
    });
  });

  afterEach(() => {
    store.stopCleanup();
  });

  describe('constructor', () => {
    it('should create poller with default config', () => {
      const defaultStore = new StateStore();
      const defaultPoller = new AsyncPoller({ stateStore: defaultStore });
      expect(defaultPoller.getPollInterval()).toBe(100);
      expect(defaultPoller.getDefaultTimeout()).toBe(5000);
      defaultStore.stopCleanup();
    });

    it('should create poller with custom config', () => {
      expect(poller.getPollInterval()).toBe(50);
      expect(poller.getDefaultTimeout()).toBe(500);
    });
  });

  describe('waitForCallback', () => {
    it('should resolve when callback result is available', async () => {
      const transactionId = 'tx123';
      const testData = { result: 'success' };

      // Simulate callback arriving after 100ms
      setTimeout(() => {
        store.set(transactionId, {
          type: 'search',
          data: createCallbackResult(testData),
        });
      }, 100);

      const result = await poller.waitForCallback(transactionId);
      expect(result).toEqual(testData);
    });

    it('should reject on timeout', async () => {
      const transactionId = 'tx123';

      await expect(poller.waitForCallback(transactionId, 100)).rejects.toThrow(
        'Timeout waiting for callback'
      );
    });

    it('should reject when callback contains error', async () => {
      const transactionId = 'tx123';
      const errorMessage = 'Processing failed';

      // Set error result immediately
      store.set(transactionId, {
        type: 'search',
        data: createCallbackError(errorMessage),
      });

      await expect(poller.waitForCallback(transactionId)).rejects.toThrow(errorMessage);
    });

    it('should use custom timeout', async () => {
      const transactionId = 'tx123';

      await expect(poller.waitForCallback(transactionId, 200)).rejects.toThrow();
    });

    it('should resolve immediately if result already exists', async () => {
      const transactionId = 'tx123';
      const testData = { result: 'already there' };

      store.set(transactionId, {
        type: 'search',
        data: createCallbackResult(testData),
      });

      const result = await poller.waitForCallback(transactionId);
      expect(result).toEqual(testData);
    });
  });

  describe('waitUntil', () => {
    it('should resolve when condition is met', async () => {
      let counter = 0;

      // Increment counter every 50ms
      const interval = setInterval(() => {
        counter++;
      }, 50);

      const result = await poller.waitUntil(() => {
        if (counter >= 3) return 'done';
        return null;
      });

      clearInterval(interval);
      expect(result).toBe('done');
    });

    it('should reject on timeout', async () => {
      await expect(
        poller.waitUntil(() => null, 100)
      ).rejects.toThrow('Timeout waiting for condition');
    });

    it('should resolve immediately if condition is already met', async () => {
      const result = await poller.waitUntil(() => 'immediate');
      expect(result).toBe('immediate');
    });

    it('should check falsey values correctly', async () => {
      let value: number | null = null;

      setTimeout(() => {
        value = 0; // falsey but valid result
      }, 100);

      const result = await poller.waitUntil(() => value);
      expect(result).toBe(0);
    });
  });
});

describe('createCallbackResult', () => {
  it('should create result object', () => {
    const result = createCallbackResult({ data: 'test' });
    expect(result).toEqual({ result: { data: 'test' } });
  });
});

describe('createCallbackError', () => {
  it('should create error object', () => {
    const error = createCallbackError('Test error');
    expect(error).toEqual({ error: 'Test error' });
  });
});
