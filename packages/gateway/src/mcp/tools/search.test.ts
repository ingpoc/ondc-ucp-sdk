/**
 * Tests for ONDC Search MCP Tool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerSearchTool } from './search';
import type { SearchToolDependencies } from './search';
import type { StateStore } from '../../state/store';
import type { AsyncPoller } from '../../state/poller';
import type { ONDCClient } from '@ondc-agent/shared';

// Mock MCP Server
const mockRegisterTool = vi.fn();
const mockServer = {
  registerTool: mockRegisterTool,
} as unknown as Parameters<typeof registerSearchTool>[0];

// Mock ONDC Client
const mockClient = {
  post: vi.fn().mockResolvedValue({ message: { ack: { status: 'ACK' } } }),
} as unknown as ONDCClient;

// Mock State Store
const mockStateStore = {
  set: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  has: vi.fn(),
} as unknown as StateStore;

// Mock Async Poller
const mockPoller = {
  waitForCallback: vi.fn(),
} as unknown as AsyncPoller;

// Sample Beckn on_search response
const sampleBecknResponse = {
  context: {
    transaction_id: 'test-txn',
    message_id: 'test-msg',
    action: 'on_search',
    domain: 'nic2004:52110',
  },
  message: {
    catalog: {
      'bpp/providers': [
        {
          id: 'provider-1',
          descriptor: {
            name: 'Test Store',
          },
          items: [
            {
              id: 'item-1',
              descriptor: {
                name: 'Test Product',
                short_desc: 'A test product',
              },
              price: {
                currency: 'INR',
                value: '100',
              },
            },
          ],
        },
      ],
    },
  },
};

describe('registerSearchTool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register tool with correct name and schema', () => {
    const deps: SearchToolDependencies = {
      client: mockClient,
      stateStore: mockStateStore,
      poller: mockPoller,
    };

    registerSearchTool(mockServer, deps);

    expect(mockRegisterTool).toHaveBeenCalledTimes(1);
    expect(mockRegisterTool).toHaveBeenCalledWith(
      'ondc_search',
      expect.objectContaining({
        title: 'ONDC Search',
        description: expect.any(String),
        inputSchema: expect.any(Object),
        outputSchema: expect.any(Object),
      }),
      expect.any(Function)
    );
  });

  it('should have required category field in input schema', () => {
    const deps: SearchToolDependencies = {
      client: mockClient,
      stateStore: mockStateStore,
      poller: mockPoller,
    };

    registerSearchTool(mockServer, deps);

    const call = mockRegisterTool.mock.calls[0];
    expect(call).toBeDefined();
    const registeredSchema = call?.[1]?.inputSchema;
    expect(registeredSchema?.category).toBeDefined();
  });
});

describe('ondc_search handler', () => {
  let handler: (input: unknown) => Promise<unknown>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock poller to return sample response
    (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockResolvedValue(
      sampleBecknResponse
    );

    const deps: SearchToolDependencies = {
      client: mockClient,
      stateStore: mockStateStore,
      poller: mockPoller,
      callbackTimeout: 5000,
    };

    registerSearchTool(mockServer, deps);
    const registeredHandler = mockRegisterTool.mock.calls[0]?.[2];
    if (!registeredHandler) throw new Error('Handler not registered');
    handler = registeredHandler;
  });

  it('should call Beckn client with search request', async () => {
    await handler({ category: 'grocery' });

    expect(mockClient.post).toHaveBeenCalledTimes(1);
    expect(mockClient.post).toHaveBeenCalledWith(
      '/search',
      expect.objectContaining({
        context: expect.objectContaining({
          action: 'search',
        }),
        message: expect.objectContaining({
          intent: expect.any(Object),
        }),
      })
    );
  });

  it('should store transaction in state store', async () => {
    await handler({ category: 'grocery', query: 'rice' });

    expect(mockStateStore.set).toHaveBeenCalledTimes(1);
    expect(mockStateStore.set).toHaveBeenCalledWith(
      expect.stringContaining('txn-'),
      expect.objectContaining({
        type: 'search',
        data: expect.objectContaining({
          query: expect.objectContaining({
            category: 'grocery',
            query: 'rice',
          }),
        }),
      })
    );
  });

  it('should wait for callback with timeout', async () => {
    await handler({ category: 'grocery' });

    expect(mockPoller.waitForCallback).toHaveBeenCalledTimes(1);
    expect(mockPoller.waitForCallback).toHaveBeenCalledWith(
      expect.stringContaining('txn-'),
      5000
    );
  });

  it('should return UCP-formatted results', async () => {
    const result = (await handler({ category: 'grocery' })) as {
      content: Array<{ type: string; text: string }>;
      structuredContent: { items: unknown[]; totalCount: number; transactionId: string };
    };

    expect(result.structuredContent).toBeDefined();
    expect(result.structuredContent.items).toHaveLength(1);
    expect(result.structuredContent.items[0]).toEqual(
      expect.objectContaining({
        id: 'item-1',
        name: 'Test Product',
        price: expect.objectContaining({
          currency: 'INR',
          value: '100',
        }),
        provider: expect.objectContaining({
          id: 'provider-1',
          name: 'Test Store',
        }),
      })
    );
    expect(result.structuredContent.transactionId).toMatch(/^txn-/);
  });

  it('should include text content in response', async () => {
    const result = (await handler({ category: 'grocery' })) as {
      content: Array<{ type: string; text: string }>;
    };

    expect(result.content).toHaveLength(1);
    const firstContent = result.content[0];
    expect(firstContent).toBeDefined();
    expect(firstContent?.type).toBe('text');
    expect(firstContent?.text).toContain('item-1');
  });

  it('should handle location in search query', async () => {
    await handler({
      category: 'restaurant',
      location: {
        latitude: 12.9716,
        longitude: 77.5946,
        radius: 5000,
      },
    });

    const postCalls = (mockClient.post as ReturnType<typeof vi.fn>).mock.calls;
    const searchRequest = postCalls[0]?.[1] as { message: { intent: { fulfillment?: unknown } } };
    expect(searchRequest?.message?.intent?.fulfillment).toBeDefined();
  });

  it('should handle preferences in search query', async () => {
    await handler({
      category: 'grocery',
      preferences: {
        maxPrice: 500,
        minRating: 4,
      },
    });

    const setCalls = (mockStateStore.set as ReturnType<typeof vi.fn>).mock.calls;
    const storeCall = setCalls[0]?.[1] as { data: { query: { priceRange?: { max: number }; minRating?: number } } };
    expect(storeCall?.data?.query?.priceRange).toEqual({ max: 500 });
    expect(storeCall?.data?.query?.minRating).toBe(4);
  });

  it('should respect maxResults limit', async () => {
    // Mock response with multiple items
    const multiItemResponse = {
      ...sampleBecknResponse,
      message: {
        catalog: {
          'bpp/providers': [
            {
              id: 'provider-1',
              descriptor: { name: 'Store' },
              items: Array(20)
                .fill(null)
                .map((_, i) => ({
                  id: `item-${i}`,
                  descriptor: { name: `Product ${i}` },
                  price: { currency: 'INR', value: '100' },
                })),
            },
          ],
        },
      },
    };

    (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockResolvedValue(
      multiItemResponse
    );

    const result = (await handler({
      category: 'grocery',
      maxResults: 5,
    })) as {
      structuredContent: { items: unknown[] };
    };

    expect(result.structuredContent.items).toHaveLength(5);
  });

  it('should clean up state on error', async () => {
    const error = new Error('Timeout');
    (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    await expect(handler({ category: 'grocery' })).rejects.toThrow('Timeout');
    expect(mockStateStore.delete).toHaveBeenCalledTimes(1);
  });

  // WEEK2-002: Streaming support tests
  describe('streaming mode (WEEK2-002)', () => {
    it('should support stream parameter in input schema', () => {
      const call = mockRegisterTool.mock.calls[0];
      const registeredSchema = call?.[1]?.inputSchema;
      expect(registeredSchema?.stream).toBeDefined();
      // Zod optional() returns a ZodOptional schema, not a boolean
      expect(registeredSchema?.stream).toHaveProperty('optional');
    });

    it('should return batches when stream=true', async () => {
      // Mock response with 12 items to test batching
      const multiItemResponse = {
        ...sampleBecknResponse,
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: { name: 'Store' },
                items: Array(12)
                  .fill(null)
                  .map((_, i) => ({
                    id: `item-${i}`,
                    descriptor: { name: `Product ${i}` },
                    price: { currency: 'INR', value: '100' },
                  })),
              },
            ],
          },
        },
      };

      (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockResolvedValue(
        multiItemResponse
      );

      const result = (await handler({
        category: 'grocery',
        stream: true,
        maxResults: 12, // Ensure we get all 12 items
      })) as {
        structuredContent: {
          mode: string;
          batches: Array<{
            type: string;
            batch: unknown[];
            batchNumber: number;
            totalBatches: number;
          }>;
        };
      };

      expect(result.structuredContent.mode).toBe('stream');
      expect(result.structuredContent.batches).toHaveLength(3); // 12 items / 5 per batch = 3 batches
      expect(result.structuredContent.batches[0].batchNumber).toBe(1);
      expect(result.structuredContent.batches[0].batch).toHaveLength(5);
      expect(result.structuredContent.batches[1].batch).toHaveLength(5);
      expect(result.structuredContent.batches[2].batch).toHaveLength(2);
    });

    it('should maintain backward compatibility when stream not specified', async () => {
      const result = (await handler({ category: 'grocery' })) as {
        structuredContent: { mode: string; items: unknown[] };
      };

      // Default behavior should be standard mode (non-streaming)
      expect(result.structuredContent.mode).toBe('standard');
      expect(result.structuredContent.items).toBeDefined();
      expect(result.structuredContent.items).toBeInstanceOf(Array);
    });

    it('should maintain backward compatibility when stream=false', async () => {
      const result = (await handler({
        category: 'grocery',
        stream: false,
      })) as {
        structuredContent: { mode: string; items: unknown[] };
      };

      expect(result.structuredContent.mode).toBe('standard');
      expect(result.structuredContent.items).toBeDefined();
    });

    it('should include batch metadata in streaming mode', async () => {
      const multiItemResponse = {
        ...sampleBecknResponse,
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: { name: 'Store' },
                items: Array(7)
                  .fill(null)
                  .map((_, i) => ({
                    id: `item-${i}`,
                    descriptor: { name: `Product ${i}` },
                    price: { currency: 'INR', value: '100' },
                  })),
              },
            ],
          },
        },
      };

      (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockResolvedValue(
        multiItemResponse
      );

      const result = (await handler({
        category: 'grocery',
        stream: true,
      })) as {
        structuredContent: {
          batches: Array<{
            batchNumber: number;
            totalBatches: number;
            totalItems: number;
            isComplete: boolean;
          }>;
        };
      };

      const firstBatch = result.structuredContent.batches[0];
      expect(firstBatch.batchNumber).toBe(1);
      expect(firstBatch.totalBatches).toBe(2); // 7 items / 5 per batch = 2 batches
      expect(firstBatch.totalItems).toBe(7);
      expect(firstBatch.isComplete).toBe(false);

      const lastBatch = result.structuredContent.batches[1];
      expect(lastBatch.isComplete).toBe(true);
    });

    it('should handle empty results in streaming mode', async () => {
      const emptyResponse = {
        ...sampleBecknResponse,
        message: {
          catalog: {
            'bpp/providers': [
              {
                id: 'provider-1',
                descriptor: { name: 'Store' },
                items: [],
              },
            ],
          },
        },
      };

      (mockPoller.waitForCallback as ReturnType<typeof vi.fn>).mockResolvedValue(
        emptyResponse
      );

      const result = (await handler({
        category: 'grocery',
        stream: true,
      })) as {
        structuredContent: { mode: string; batches: unknown[] };
      };

      expect(result.structuredContent.mode).toBe('stream');
      expect(result.structuredContent.batches).toHaveLength(0);
    });

    it('should update tool description with streaming info', () => {
      const call = mockRegisterTool.mock.calls[0];
      const description = call?.[1]?.description;

      expect(description).toContain('stream=true');
      expect(description).toContain('progressive disclosure');
    });
  });
});
