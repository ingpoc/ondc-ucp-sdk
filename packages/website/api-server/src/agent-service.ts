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
  }
};

// Allowed tools for buyer agent
const BUYER_ALLOWED_TOOLS = [
  'mcp__token-efficient__execute_code',
  'mcp__token-efficient__process_csv',
  'mcp__token-efficient__process_logs',
  'mcp__context-graph__context_query_traces',
  'mcp__context-graph__context_store_trace'
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

You are a buyer agent for ONDC (Open Network for Digital Commerce). Help users search, filter, compare, and select products.

Available workflows:
- search: Find products by category, query, location
- filter: Apply filters (price, rating, preferences)
- compare: Compare products across providers
- select: Select best product based on user preferences

Use the token-efficient MCP tools for data processing and context-graph for learning from past decisions.`,
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
 * Convert SDKMessage to SSE format
 */
export function messageToSSE(message: SDKMessage): string {
  const data = JSON.stringify(message);
  return `data: ${data}\n\n`;
}
