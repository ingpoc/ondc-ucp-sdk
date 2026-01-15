/**
 * Search Cache Tests (WEEK2-003)
 * Unit tests for request deduplication cache
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchCache, createSearchCache } from './searchCache';

describe('SearchCache', () => {
  let cache: SearchCache;
  let mockSearchFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cache = new SearchCache({ ttl: 5000, debug: false });
    mockSearchFn = vi.fn();
  });

  afterEach(() => {
    cache.destroy();
  });

  describe('constructor', () => {
    it('should create cache with default config', () => {
      const defaultCache = new SearchCache();
      expect(defaultCache).toBeDefined();
      expect(defaultCache.size()).toBe(0);
      defaultCache.destroy();
    });

    it('should create cache with custom config', () => {
      const customCache = new SearchCache({
        ttl: 10000,
        maxEntries: 500,
        enableMerging: false,
        debug: true,
      });
      expect(customCache).toBeDefined();
      customCache.destroy();
    });
  });

  describe('createSearchCache', () => {
    it('should create cache instance', () => {
      const cache = createSearchCache({ ttl: 5000 });
      expect(cache).toBeInstanceOf(SearchCache);
      cache.destroy();
    });
  });

  describe('cache hits and misses', () => {
    it('should return cache hit for identical params', async () => {
      mockSearchFn.mockResolvedValue({ results: ['item1', 'item2'] });

      const params = { category: 'grocery', query: 'rice' };

      // First call - cache miss
      const result1 = await cache.getOrSet(params, mockSearchFn);
      expect(result1).toEqual({ results: ['item1', 'item2'] });
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      // Second call - cache hit
      const result2 = await cache.getOrSet(params, mockSearchFn);
      expect(result2).toEqual({ results: ['item1', 'item2'] });
      expect(mockSearchFn).toHaveBeenCalledTimes(1); // Not called again
    });

    it('should return cache miss for different params', async () => {
      mockSearchFn.mockResolvedValue({ results: ['item1'] });

      const result1 = await cache.getOrSet(
        { category: 'grocery', query: 'rice' },
        mockSearchFn
      );
      expect(result1).toEqual({ results: ['item1'] });

      mockSearchFn.mockResolvedValue({ results: ['item2'] });

      const result2 = await cache.getOrSet(
        { category: 'grocery', query: 'wheat' },
        mockSearchFn
      );
      expect(result2).toEqual({ results: ['item2'] });
      expect(mockSearchFn).toHaveBeenCalledTimes(2);
    });

    it('should generate consistent cache keys regardless of param order', async () => {
      mockSearchFn.mockResolvedValue({ results: [] });

      await cache.getOrSet(
        { category: 'grocery', query: 'rice', maxResults: 10 },
        mockSearchFn
      );

      mockSearchFn.mockClear();

      // Different order should hit cache
      await cache.getOrSet(
        { maxResults: 10, query: 'rice', category: 'grocery' },
        mockSearchFn
      );

      expect(mockSearchFn).not.toHaveBeenCalled();
    });
  });

  describe('TTL (Time To Live)', () => {
    it('should expire entries after TTL', async () => {
      const shortTtlCache = new SearchCache({ ttl: 100, debug: false });
      mockSearchFn.mockResolvedValue({ results: [] });

      const params = { category: 'grocery' };

      await shortTtlCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be cache miss now
      await shortTtlCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(2);

      shortTtlCache.destroy();
    });

    it('should not expire entries before TTL', async () => {
      const shortTtlCache = new SearchCache({ ttl: 200, debug: false });
      mockSearchFn.mockResolvedValue({ results: [] });

      const params = { category: 'grocery' };

      await shortTtlCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      // Wait less than TTL
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still be cache hit
      await shortTtlCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      shortTtlCache.destroy();
    });
  });

  describe('request merging (WEEK2-003)', () => {
    it('should merge requests for identical params', async () => {
      const mergingCache = new SearchCache({
        ttl: 5000,
        enableMerging: true,
        debug: false,
      });

      let resolveSearch: (value: unknown) => void;
      const pendingSearch = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      mockSearchFn.mockReturnValue(pendingSearch);

      const params = { category: 'grocery', query: 'rice' };

      // Start first search (in progress)
      const promise1 = mergingCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      // Start second identical search (should merge)
      const promise2 = mergingCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1); // Still only once

      // Resolve the search
      resolveSearch!({ results: ['item1', 'item2'] });

      // Both promises should resolve with same results
      const result1 = await promise1;
      const result2 = await promise2;

      expect(result1).toEqual({ results: ['item1', 'item2'] });
      expect(result2).toEqual({ results: ['item1', 'item2'] });

      mergingCache.destroy();
    });

    it('should not merge when disabled', async () => {
      const noMergeCache = new SearchCache({
        ttl: 5000,
        enableMerging: false,
        debug: false,
      });

      let resolveSearch: (value: unknown) => void;
      const pendingSearch = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      mockSearchFn.mockReturnValue(pendingSearch);

      const params = { category: 'grocery' };

      // Start first search
      const promise1 = noMergeCache.getOrSet(params, mockSearchFn);

      // Start second search (should NOT merge, call search again)
      const promise2 = noMergeCache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(2);

      // Resolve both searches
      resolveSearch!({ results: ['item1'] });
      await promise1;
      await promise2;

      noMergeCache.destroy();
    });
  });

  describe('cache statistics', () => {
    it('should track cache hits and misses', async () => {
      mockSearchFn.mockResolvedValue({ results: [] });

      const params = { category: 'grocery' };

      // First call - miss
      await cache.getOrSet(params, mockSearchFn);

      // Second call - hit
      await cache.getOrSet(params, mockSearchFn);

      // Third call - hit
      await cache.getOrSet(params, mockSearchFn);

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it('should track request merges', async () => {
      const mergingCache = new SearchCache({
        enableMerging: true,
        debug: false,
      });

      let resolveSearch: (value: unknown) => void;
      mockSearchFn.mockReturnValue(
        new Promise((resolve) => {
          resolveSearch = resolve;
        })
      );

      const params = { category: 'grocery' };

      const promise1 = mergingCache.getOrSet(params, mockSearchFn);
      const promise2 = mergingCache.getOrSet(params, mockSearchFn);
      const promise3 = mergingCache.getOrSet(params, mockSearchFn);

      resolveSearch!({ results: [] });

      await Promise.all([promise1, promise2, promise3]);

      const stats = mergingCache.getStats();
      expect(stats.merges).toBe(2); // 2 merged into 1

      mergingCache.destroy();
    });

    it('should track evictions', async () => {
      const tinyCache = new SearchCache({ maxEntries: 2, debug: false });
      mockSearchFn.mockResolvedValue({ results: [] });

      // Fill cache beyond max
      await tinyCache.getOrSet({ id: 1 }, mockSearchFn);
      await tinyCache.getOrSet({ id: 2 }, mockSearchFn);
      await tinyCache.getOrSet({ id: 3 }, mockSearchFn); // Should evict oldest

      const stats = tinyCache.getStats();
      expect(stats.evictions).toBeGreaterThan(0);
      expect(tinyCache.size()).toBeLessThanOrEqual(2);

      tinyCache.destroy();
    });
  });

  describe('cache invalidation', () => {
    it('should invalidate specific entry', async () => {
      mockSearchFn.mockResolvedValue({ results: [] });

      const params = { category: 'grocery' };

      await cache.getOrSet(params, mockSearchFn);
      expect(cache.size()).toBe(1);

      cache.invalidate(params);
      expect(cache.size()).toBe(0);

      // Should call search again after invalidation
      await cache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(2);
    });

    it('should clear all entries', async () => {
      mockSearchFn.mockResolvedValue({ results: [] });

      await cache.getOrSet({ id: 1 }, mockSearchFn);
      await cache.getOrSet({ id: 2 }, mockSearchFn);
      expect(cache.size()).toBe(2);

      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle search function errors', async () => {
      const error = new Error('Search failed');
      mockSearchFn.mockRejectedValue(error);

      const params = { category: 'grocery' };

      await expect(cache.getOrSet(params, mockSearchFn)).rejects.toThrow('Search failed');

      // Cache should not contain failed entry
      expect(cache.size()).toBe(0);

      // Retry should work
      mockSearchFn.mockResolvedValue({ results: [] });
      await cache.getOrSet(params, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(2);
    });

    it('should reject all merged requests on error', async () => {
      const mergingCache = new SearchCache({
        enableMerging: true,
        debug: false,
      });

      let rejectSearch: (error: unknown) => void;
      mockSearchFn.mockReturnValue(
        new Promise((_, reject) => {
          rejectSearch = reject;
        })
      );

      const params = { category: 'grocery' };

      const promise1 = mergingCache.getOrSet(params, mockSearchFn);
      const promise2 = mergingCache.getOrSet(params, mockSearchFn);

      const error = new Error('Search failed');
      rejectSearch!(error);

      await expect(promise1).rejects.toThrow('Search failed');
      await expect(promise2).rejects.toThrow('Search failed');

      mergingCache.destroy();
    });
  });

  describe('max entries enforcement', () => {
    it('should evict oldest entry when max reached', async () => {
      const tinyCache = new SearchCache({ maxEntries: 3, debug: false });
      mockSearchFn.mockResolvedValue({ results: [] });

      await tinyCache.getOrSet({ id: 1 }, mockSearchFn);
      await tinyCache.getOrSet({ id: 2 }, mockSearchFn);
      await tinyCache.getOrSet({ id: 3 }, mockSearchFn);

      expect(tinyCache.size()).toBe(3);

      // Adding 4th should evict oldest (id: 1)
      await tinyCache.getOrSet({ id: 4 }, mockSearchFn);

      expect(tinyCache.size()).toBe(3);

      // id: 1 should be evicted (cache miss)
      mockSearchFn.mockClear();
      await tinyCache.getOrSet({ id: 1 }, mockSearchFn);
      expect(mockSearchFn).toHaveBeenCalledTimes(1);

      tinyCache.destroy();
    });
  });

  describe('cleanup', () => {
    it('should periodically clean up expired entries', async () => {
      const shortTtlCache = new SearchCache({ ttl: 50, debug: false });
      mockSearchFn.mockResolvedValue({ results: [] });

      // Add some entries
      await shortTtlCache.getOrSet({ id: 1 }, mockSearchFn);
      await shortTtlCache.getOrSet({ id: 2 }, mockSearchFn);

      expect(shortTtlCache.size()).toBe(2);

      // Wait for entries to expire and cleanup to run
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Cleanup should have removed expired entries
      expect(shortTtlCache.size()).toBe(0);

      shortTtlCache.destroy();
    });
  });

  describe('destroy', () => {
    it('should cleanup timer and clear cache', async () => {
      mockSearchFn.mockResolvedValue({ results: [] });

      await cache.getOrSet({ id: 1 }, mockSearchFn);
      expect(cache.size()).toBe(1);

      cache.destroy();

      // Cache should be cleared
      expect(cache.size()).toBe(0);

      // Further operations should work (no errors)
      const newCache = new SearchCache({ debug: false });
      await newCache.getOrSet({ id: 2 }, mockSearchFn);
      expect(newCache.size()).toBe(1);
      newCache.destroy();
    });
  });
});
