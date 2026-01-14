/**
 * Tests for State Store
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StateStore } from './store';

describe('StateStore', () => {
  let store: StateStore;

  beforeEach(() => {
    store = new StateStore({ ttl: 1000 }); // 1 second TTL for tests
  });

  afterEach(() => {
    store.stopCleanup();
  });

  describe('constructor', () => {
    it('should create store with default config', () => {
      const defaultStore = new StateStore();
      expect(defaultStore.size()).toBe(0);
      defaultStore.stopCleanup();
    });

    it('should create store with custom TTL', () => {
      const customStore = new StateStore({ ttl: 10000 });
      expect(customStore.size()).toBe(0);
      customStore.stopCleanup();
    });
  });

  describe('set and get', () => {
    it('should store and retrieve state', () => {
      store.set('tx123', { type: 'search', data: { query: 'test' } });

      const result = store.get('tx123');
      expect(result).toBeDefined();
      expect(result?.transactionId).toBe('tx123');
      expect(result?.type).toBe('search');
      expect(result?.data).toEqual({ query: 'test' });
    });

    it('should return undefined for non-existent key', () => {
      const result = store.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('should set createdAt timestamp', () => {
      const before = new Date();
      store.set('tx123', { type: 'search' });
      const after = new Date();

      const result = store.get('tx123');
      expect(result?.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(result?.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('delete', () => {
    it('should remove existing entry', () => {
      store.set('tx123', { type: 'search' });
      expect(store.has('tx123')).toBe(true);

      const deleted = store.delete('tx123');
      expect(deleted).toBe(true);
      expect(store.has('tx123')).toBe(false);
    });

    it('should return false for non-existent entry', () => {
      const deleted = store.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for existing entry', () => {
      store.set('tx123', { type: 'search' });
      expect(store.has('tx123')).toBe(true);
    });

    it('should return false for non-existent entry', () => {
      expect(store.has('nonexistent')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return empty array for empty store', () => {
      expect(store.keys()).toEqual([]);
    });

    it('should return all keys', () => {
      store.set('tx1', { type: 'search' });
      store.set('tx2', { type: 'select' });
      store.set('tx3', { type: 'init' });

      const keys = store.keys();
      expect(keys).toHaveLength(3);
      expect(keys).toContain('tx1');
      expect(keys).toContain('tx2');
      expect(keys).toContain('tx3');
    });
  });

  describe('size', () => {
    it('should return 0 for empty store', () => {
      expect(store.size()).toBe(0);
    });

    it('should return count of entries', () => {
      store.set('tx1', { type: 'search' });
      expect(store.size()).toBe(1);

      store.set('tx2', { type: 'select' });
      expect(store.size()).toBe(2);

      store.delete('tx1');
      expect(store.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      store.set('tx1', { type: 'search' });
      store.set('tx2', { type: 'select' });
      expect(store.size()).toBe(2);

      store.clear();
      expect(store.size()).toBe(0);
      expect(store.keys()).toEqual([]);
    });
  });

  describe('cleanup', () => {
    it('should remove expired entries', async () => {
      store.set('tx1', { type: 'search' });

      // Wait for entry to expire (TTL is 1 second)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Trigger cleanup manually
      store['cleanup']();

      expect(store.has('tx1')).toBe(false);
      expect(store.size()).toBe(0);
    });

    it('should keep non-expired entries', () => {
      store.set('tx1', { type: 'search' });

      // Trigger cleanup immediately
      store['cleanup']();

      expect(store.has('tx1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should return store statistics', () => {
      store.set('tx1', { type: 'search' });
      store.set('tx2', { type: 'select' });

      const stats = store.getStats();

      expect(stats.size).toBe(2);
      expect(stats.ttl).toBe(1000);
      expect(stats.keys).toContain('tx1');
      expect(stats.keys).toContain('tx2');
    });
  });
});
