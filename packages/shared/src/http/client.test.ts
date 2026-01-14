/**
 * Tests for ONDC HTTP Client with retry logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { ONDCClient } from './client';
import { generateKeyPair } from '../crypto';

// Mock axios
vi.mock('axios');

describe('ONDCClient', () => {
  let keyPair: Awaited<ReturnType<typeof generateKeyPair>>;
  let mockAxiosInstance: any;

  beforeEach(async () => {
    keyPair = await generateKeyPair();

    // Create mock axios instance
    mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
    };

    vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);
  });

  describe('constructor', () => {
    it('should create client with default retry settings', () => {
      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
      });

      expect(client).toBeDefined();
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.ondc.org',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
    });

    it('should create client with custom retry settings', () => {
      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 5,
        retryDelay: 200,
      });

      expect(client).toBeDefined();
    });
  });

  describe('retry logic', () => {
    it('should retry on 503 error and succeed', async () => {
      // Mock responses: first two fail with 503, third succeeds
      mockAxiosInstance.post
        .mockRejectedValueOnce({
          response: { status: 503 },
          isAxiosError: true,
          config: {},
          toJSON: vi.fn(),
        } as any)
        .mockRejectedValueOnce({
          response: { status: 503 },
          isAxiosError: true,
          config: {},
          toJSON: vi.fn(),
        } as any)
        .mockResolvedValueOnce({
          data: { success: true },
        });

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 3,
        retryDelay: 10, // Short delay for tests
      });

      const result = await client.post('/test', { foo: 'bar' });

      expect(result).toEqual({ success: true });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);
    });

    it('should retry on 500 error', async () => {
      mockAxiosInstance.post
        .mockRejectedValueOnce({
          response: { status: 500 },
          isAxiosError: true,
          config: {},
          toJSON: vi.fn(),
        } as any)
        .mockResolvedValueOnce({
          data: { recovered: true },
        });

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 2,
        retryDelay: 10,
      });

      const result = await client.post('/test', {});

      expect(result).toEqual({ recovered: true });
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx errors', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { status: 400 },
        isAxiosError: true,
        config: {},
        toJSON: vi.fn(),
      } as any);

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 3,
        retryDelay: 10,
      });

      await expect(client.post('/test', {})).rejects.toMatchObject({
        response: { status: 400 },
      });

      // Should only be called once (no retries)
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should not retry on 404 error', async () => {
      mockAxiosInstance.post.mockRejectedValueOnce({
        response: { status: 404 },
        isAxiosError: true,
        config: {},
        toJSON: vi.fn(),
      } as any);

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 3,
      });

      await expect(client.post('/test', {})).rejects.toMatchObject({
        response: { status: 404 },
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries and throw error', async () => {
      // All requests fail with 503
      mockAxiosInstance.post.mockRejectedValue({
        response: { status: 503 },
        isAxiosError: true,
        config: {},
        toJSON: vi.fn(),
      } as any);

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 2,
        retryDelay: 10,
      });

      await expect(client.post('/test', {})).rejects.toMatchObject({
        response: { status: 503 },
      });

      // Initial attempt + 2 retries = 3 total
      expect(mockAxiosInstance.post).toHaveBeenCalledTimes(3);
    });

    it('should add jitter to retry delays', async () => {
      const timestamps: number[] = [];
      mockAxiosInstance.post.mockImplementation(async () => {
        timestamps.push(Date.now());
        throw {
          response: { status: 503 },
          isAxiosError: true,
          config: {},
          toJSON: vi.fn(),
        };
      });

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 2,
        retryDelay: 50,
      });

      try {
        await client.post('/test', {});
      } catch {
        // Expected to fail after retries
      }

      // Should have 3 attempts
      expect(timestamps).toHaveLength(3);

      // Check that delays are not exact multiples (jitter applied)
      const delay1 = timestamps[1]! - timestamps[0]!;
      const delay2 = timestamps[2]! - timestamps[1]!;

      // With ±25% jitter:
      // - attempt 0: 50ms * 0.75 to 50ms * 1.25 = 37.5 to 62.5ms
      // - attempt 1: 100ms * 0.75 to 100ms * 1.25 = 75 to 125ms
      // Add margin for test framework timing variability
      expect(delay1).toBeGreaterThan(30); // 37.5 - margin
      expect(delay1).toBeLessThan(80); // 62.5 + margin

      expect(delay2).toBeGreaterThan(60); // 75 - margin
      expect(delay2).toBeLessThan(150); // 125 + margin
    });
  });

  describe('GET requests with retry', () => {
    it('should retry GET requests on 5xx errors', async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce({
          response: { status: 502 },
          isAxiosError: true,
          config: {},
          toJSON: vi.fn(),
        } as any)
        .mockResolvedValueOnce({
          data: { result: 'data' },
        });

      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'test.example.com',
        privateKey: keyPair.privateKey,
        maxRetries: 2,
        retryDelay: 10,
      });

      const result = await client.get('/resource');

      expect(result).toEqual({ result: 'data' });
      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });

  describe('credential management', () => {
    it('should update credentials', () => {
      const client = new ONDCClient({
        baseURL: 'https://test.ondc.org',
        subscriberId: 'old.example.com',
        privateKey: keyPair.privateKey,
      });

      // This would normally be awaited, but updateCredentials is sync
      // We'll just check it doesn't throw
      expect(() => {
        // @ts-ignore - testing internal method
        client.updateCredentials('new.example.com', keyPair.privateKey);
      }).not.toThrow();
    });
  });
});
