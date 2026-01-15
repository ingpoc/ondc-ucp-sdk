/**
 * ONDC Search MCP Tool
 * Searches for products and services on ONDC network
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ucpToBecknIntent, becknToUcpCatalog } from '@ondc-agent/shared';
import type { UCPSearchQuery, UCPCatalog, BecknOnSearchResponse } from '@ondc-agent/shared';
import type { ONDCClient } from '@ondc-agent/shared';
import type { StateStore } from '../../state/store';
import type { AsyncPoller } from '../../state/poller';

/**
 * Input schema for ondc_search tool (Zod version for MCP SDK)
 * WEEK2-002: Added stream parameter for progressive disclosure
 */
const searchInputSchema = {
  category: z.string().describe('Product or service category (e.g., "grocery", "restaurant")'),
  query: z.string().optional().describe('Free-text search query'),
  location: z.object({
    latitude: z.number().min(-90).max(90).describe('Latitude coordinate'),
    longitude: z.number().min(-180).max(180).describe('Longitude coordinate'),
    radius: z.number().min(100).max(50000).optional().describe('Search radius in meters'),
  }).optional().describe('Search location for nearby providers'),
  preferences: z.object({
    maxPrice: z.number().optional().describe('Maximum price filter'),
    minRating: z.number().min(0).max(5).optional().describe('Minimum rating (0-5)'),
    sortBy: z.enum(['price', 'rating', 'distance', 'relevance']).optional().describe('Sort order'),
  }).optional().describe('Search preferences'),
  maxResults: z.number().min(1).max(100).optional().describe('Maximum results (default: 10)'),
  stream: z.boolean().optional().describe('Enable progressive disclosure (returns batches)'),
};

/**
 * Output schema for ondc_search tool
 */
const searchOutputSchema = {
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.object({
      currency: z.string(),
      value: z.string(),
    }),
    provider: z.object({
      id: z.string(),
      name: z.string(),
    }),
    category: z.string().optional(),
  })),
  totalCount: z.number(),
  transactionId: z.string(),
};

/**
 * Search tool input type
 * WEEK2-002: Added optional stream parameter
 */
type SearchInput = {
  category: string;
  query?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
  preferences?: {
    maxPrice?: number;
    minRating?: number;
    sortBy?: 'price' | 'rating' | 'distance' | 'relevance';
  };
  maxResults?: number;
  stream?: boolean; // WEEK2-002: Enable progressive disclosure
};

/**
 * Dependencies for search tool
 */
export interface SearchToolDependencies {
  /** ONDC HTTP client for Beckn API calls */
  client: ONDCClient;
  /** State store for pending transactions */
  stateStore: StateStore;
  /** Async poller for callbacks */
  poller: AsyncPoller;
  /** Callback timeout in milliseconds */
  callbackTimeout?: number;
}

/**
 * Generate a unique transaction ID
 */
function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convert tool input to UCP search query
 */
function inputToUcpQuery(input: SearchInput): UCPSearchQuery {
  const query: UCPSearchQuery = {
    category: input.category,
    query: input.query,
    limit: input.maxResults ?? 10,
  };

  if (input.location) {
    query.location = {
      latitude: input.location.latitude,
      longitude: input.location.longitude,
      radius: input.location.radius ? input.location.radius / 1000 : undefined, // Convert m to km
    };
  }

  if (input.preferences) {
    if (input.preferences.maxPrice !== undefined) {
      query.priceRange = { max: input.preferences.maxPrice };
    }
    if (input.preferences.minRating !== undefined) {
      query.minRating = input.preferences.minRating;
    }
  }

  return query;
}

/**
 * Register ondc_search tool with MCP server
 * WEEK2-002: Enhanced with streaming support
 *
 * @param server - MCP server instance
 * @param deps - Tool dependencies (client, state store, poller)
 */
export function registerSearchTool(
  server: McpServer,
  deps: SearchToolDependencies
): void {
  const { client, stateStore, poller, callbackTimeout = 30000 } = deps;

  server.registerTool(
    'ondc_search',
    {
      title: 'ONDC Search',
      description: 'Search for products and services on the ONDC network. Set stream=true for progressive disclosure with batched results.',
      inputSchema: searchInputSchema,
      outputSchema: searchOutputSchema,
    },
    async (input: SearchInput) => {
      const { stream = false } = input; // WEEK2-002: Extract stream parameter
      // Generate transaction ID
      const transactionId = generateTransactionId();

      // Convert input to UCP query
      const ucpQuery = inputToUcpQuery(input);

      // Translate to Beckn intent
      const becknIntent = ucpToBecknIntent(ucpQuery);

      // Store pending transaction
      stateStore.set(transactionId, {
        type: 'search',
        data: { query: ucpQuery },
      });

      // Build Beckn search request
      const searchRequest = {
        context: {
          domain: 'nic2004:52110', // Retail domain
          action: 'search',
          transaction_id: transactionId,
          message_id: `msg-${Date.now()}`,
          timestamp: new Date().toISOString(),
          country: 'IND',
          city: 'std:080', // Default to Bangalore
          core_version: '1.2.0',
        },
        message: {
          intent: becknIntent,
        },
      };

      // Call Beckn search API
      await client.post('/search', searchRequest);

      // Wait for on_search callback
      let catalog: UCPCatalog;
      try {
        const callbackData = await poller.waitForCallback<BecknOnSearchResponse>(
          transactionId,
          callbackTimeout
        );
        catalog = becknToUcpCatalog(callbackData);
      } catch (error) {
        // Clean up state on error
        stateStore.delete(transactionId);
        throw error;
      }

      // Apply maxResults limit
      const limitedItems = catalog.items.slice(0, input.maxResults ?? 10);

      // WEEK2-002: Handle streaming mode with progressive disclosure
      if (stream) {
        const batchSize = 5; // Match api-server SSE batch size
        const batches = [];

        for (let i = 0; i < limitedItems.length; i += batchSize) {
          const batch = limitedItems.slice(i, i + batchSize);
          const batchNumber = Math.floor(i / batchSize) + 1;
          const totalBatches = Math.ceil(limitedItems.length / batchSize);

          batches.push({
            type: 'results',
            batch,
            batchNumber,
            totalBatches,
            totalItems: limitedItems.length,
            isComplete: i + batchSize >= limitedItems.length,
          });
        }

        // Return all batches as structured output
        const output = {
          mode: 'stream',
          transactionId,
          totalCount: catalog.totalCount ?? limitedItems.length,
          batches,
        };

        return {
          content: [{ type: 'text' as const, text: JSON.stringify(output, null, 2) }],
          structuredContent: output,
        };
      }

      // Non-streaming mode (backward compatible)
      const output = {
        mode: 'standard',
        items: limitedItems.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          provider: {
            id: item.provider.id,
            name: item.provider.name,
          },
          category: item.category,
        })),
        totalCount: catalog.totalCount ?? limitedItems.length,
        transactionId,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(output, null, 2) }],
        structuredContent: output,
      };
    }
  );
}
