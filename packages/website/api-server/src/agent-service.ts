// @ts-nocheck - Temporarily disabled due to libsodium dependency issue
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SDKMessage, Options, SDKResultError } from '@anthropic-ai/claude-agent-sdk';

interface AgentRequest {
  prompt: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

// MCP server configurations for ONDC operations
const ONDC_MCP_SERVERS: Record<string, MCPServerConfig> = {
  'token-efficient': {
    command: 'srt',
    args: [
      'node',
      '/Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/mcp/token-efficient-mcp/dist/index.js'
    ]
  },
  'context-graph': {
    command: 'uv',
    args: [
      '--directory',
      '/Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/mcp/context-graph-mcp',
      'run',
      'python',
      'server.py'
    ],
    env: {
      VOYAGE_API_KEY: process.env.VOYAGE_API_KEY || ''
    }
  },
  'ondc-shopping': {
    command: 'node',
    args: [
      '/Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk/mcp/ondc-shopping-mcp/dist/index.js'
    ],
    env: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001'
    }
  }
};

// Allowed tools for buyer agent
const BUYER_ALLOWED_TOOLS = [
  // Token-efficient tools
  'mcp__token-efficient__execute_code',
  'mcp__token-efficient__process_csv',
  'mcp__token-efficient__process_logs',
  // Context-graph tools
  'mcp__context-graph__context_query_traces',
  'mcp__context-graph__context_store_trace',
  // ONDC Shopping tools
  'mcp__ondc-shopping__ondc_search',
  'mcp__ondc-shopping__ondc_compare',
  'mcp__ondc-shopping__ondc_cart_add',
  'mcp__ondc-shopping__ondc_cart_remove',
  'mcp__ondc-shopping__ondc_cart_view',
  'mcp__ondc-shopping__ondc_checkout_quote',
  'mcp__ondc-shopping__ondc_order_create',
  'mcp__ondc-shopping__ondc_order_track',
  'mcp__ondc-shopping__ondc_order_cancel'
];

// Allowed tools for seller agent
const SELLER_ALLOWED_TOOLS = [
  'mcp__token-efficient__execute_code',
  'mcp__token-efficient__process_csv',
  'mcp__token-efficient__process_logs',
  'mcp__context-graph__context_query_traces',
  'mcp__context-graph__context_store_trace',
  'mcp__context-graph__context_update_outcome'
];

/**
 * Create an error result message
 */
function createErrorMessage(error: unknown): SDKResultError {
  return {
    type: 'result',
    subtype: 'error_during_execution',
    duration_ms: 0,
    duration_api_ms: 0,
    is_error: true,
    num_turns: 0,
    total_cost_usd: 0,
    usage: { input_tokens: 0, output_tokens: 0 },
    modelUsage: {},
    permission_denials: [],
    errors: [error instanceof Error ? error.message : String(error)],
    uuid: crypto.randomUUID(),
    session_id: ''
  };
}

/**
 * Execute buyer agent workflow with streaming support
 */
export async function* executeBuyerAgent(
  request: AgentRequest
): AsyncGenerator<SDKMessage> {
  const { prompt, context } = request;

  try {
    const response = query({
      prompt: `${prompt}

You are Maya, a friendly ONDC shopping assistant. Help users find products, compare options, manage their cart, and complete purchases.

## Persona
- Conversational Indian English
- Currency in ₹ (INR)
- Minimal emojis (✓, ★, 🛒 only)
- One question at a time
- Prioritize user needs, anticipate next steps

## Card Format
When showing products, return JSON with type "product_cards":
{
  "type": "product_cards",
  "cards": [
    {
      "id": "item-123",
      "name": "Product Name",
      "price": 250,
      "currency": "INR",
      "rating": 4.5,
      "image": "https://example.com/image.jpg",
      "provider": "Store Name",
      "delivery": "Same-day",
      "inStock": true,
      "actions": [
        {"type": "add_to_cart", "label": "Add to Cart", "hasQtyPicker": true},
        {"type": "compare", "label": "Compare", "isCheckbox": true},
        {"type": "view_details", "label": "View Details"},
        {"type": "wishlist", "label": "♡", "isIcon": true}
      ]
    }
  ],
  "message": "Found X products..."
}

## Shopping Phases
1. Discovery: Use ondc_search, return product cards
2. Comparison: Use ondc_compare, return comparison table
3. Cart: Use ondc_cart_add/remove/view, confirm actions
4. Checkout: Use ondc_checkout_quote, collect address/payment
5. Tracking: Use ondc_order_track, show timeline

## Rules
- Always show cards with Add to Cart button for products
- Confirm before checkout and order actions
- Remember session context for cart operations`,
      options: {
        mcpServers: ONDC_MCP_SERVERS,
        allowedTools: BUYER_ALLOWED_TOOLS,
        model: 'claude-sonnet-4-5',
        cwd: process.cwd(),
        ...(context && { extraArgs: context as Record<string, string | null> })
      } as Options
    });

    for await (const message of response) {
      yield message;
    }
  } catch (error) {
    yield createErrorMessage(error);
  }
}

/**
 * Execute seller agent workflow with streaming support
 */
export async function* executeSellerAgent(
  request: AgentRequest
): AsyncGenerator<SDKMessage> {
  const { prompt, context } = request;

  try {
    const response = query({
      prompt: `${prompt}

You are a seller agent for ONDC (Open Network for Digital Commerce). Help sellers manage their catalog, optimize listings, and analyze pricing.

Available workflows:
- add-product: Add new product to catalog with SEO optimization
- edit-product: Update existing product details
- preview: Check product ranking in buyer search
- optimize: Generate suggestions to improve search visibility

Use the token-efficient MCP tools for data processing and context-graph for learning from past decisions.`,
      options: {
        mcpServers: ONDC_MCP_SERVERS,
        allowedTools: SELLER_ALLOWED_TOOLS,
        model: 'claude-sonnet-4-5',
        cwd: process.cwd(),
        ...(context && { extraArgs: context as Record<string, string | null> })
      } as Options
    });

    for await (const message of response) {
      yield message;
    }
  } catch (error) {
    yield createErrorMessage(error);
  }
}

/**
 * Transform SDK message to frontend-compatible format
 *
 * The SDK sends nested structures like:
 *   { type: "assistant", message: { content: [{ type: "text", text: "..." }] } }
 *
 * But frontend expects:
 *   { type: "assistant", content: "..." }
 */
function transformMessageForFrontend(message: SDKMessage): SDKMessage {
  // Handle assistant messages with nested content
  if (message.type === 'assistant' && message.message) {
    const msg = message.message as { content?: Array<{ type: string; text: string }> };
    if (msg.content && Array.isArray(msg.content)) {
      // Extract text content from the first text block
      const textBlock = msg.content.find((block) => block.type === 'text');
      if (textBlock) {
        return {
          type: 'assistant',
          content: textBlock.text,
          session_id: message.session_id
        };
      }
    }
  }

  // Handle tool_progress messages
  if (message.type === 'tool_progress' && message.message) {
    const msg = message.message as { tool_name?: string };
    return {
      type: 'tool_progress',
      tool_name: msg.tool_name,
      session_id: message.session_id
    };
  }

  // Pass through other message types as-is
  return message;
}

/**
 * Convert SDKMessage to SSE format
 */
export function messageToSSE(message: SDKMessage): string {
  const transformed = transformMessageForFrontend(message);
  const data = JSON.stringify(transformed);
  return `data: ${data}\n\n`;
}
