// @ts-nocheck - Temporarily disabled due to libsodium dependency issue
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SDKMessage, Options, SDKResultError } from '@anthropic-ai/claude-agent-sdk';
import { readFileSync } from 'fs';
import { join } from 'path';

interface AgentRequest {
  prompt: string;
  sessionId?: string;
  context?: Record<string, unknown>;
}

interface AgentRequestWithSession extends AgentRequest {
  sessionId: string;
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
 * Load buyer-skill SKILL.md content
 */
function loadBuyerSkillContent(): string {
  try {
    const skillPath = join(process.cwd(), '../../packages/buyer-skill/SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');

    // Remove YAML frontmatter (between ---)
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');

    return `
You are following the buyer-skill workflow instructions below:

${withoutFrontmatter}

## CRITICAL: Product Card JSON Format - DO NOT IGNORE
When the ondc_search tool returns data, you MUST copy the ENTIRE JSON response exactly as received. DO NOT summarize, DO NOT reformat, DO NOT modify.

Format your response like this:

[TOOL_RESULT]
{"type":"product_cards","cards":[{exact tool output here}],"message":"..."}
[/TOOL_RESULT]

After the tags, you may add a brief comment.

The frontend ONLY renders visual product cards when it finds this exact JSON format. Text descriptions will NOT render as cards.

Example - WRONG:
"I found 5 mangoes..."

Example - CORRECT:
[TOOL_RESULT]
{"type":"product_cards","cards":[{"id":"item-001",...}]}
[/TOOL_RESULT]
Great! Here are your options.

## Response Format
- If a tool returns JSON: Include it EXACTLY in [TOOL_RESULT] tags
- Then: Add brief conversational response
- Keep responses concise and helpful
`;
  } catch (error) {
    console.error('Failed to load buyer-skill SKILL.md:', error);
    // Fallback to basic prompt
    return `You are Maya, a friendly ONDC shopping assistant.`;
  }
}

// Cache the skill content
const BUYER_SKILL_PROMPT = loadBuyerSkillContent();

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
  const { prompt, sessionId, context } = request;

  try {
    const response = query({
      prompt: `${BUYER_SKILL_PROMPT}

## Current Session
sessionId: ${sessionId || 'auto-generate'}

## Current User Request
${prompt}

## CRITICAL: Tool Usage Instructions
1. **Product Discovery**: When user asks to search, find, or discover products → use ondc_search
2. **Add to Cart**: When user says "add to cart", "add [item]", "put in cart" → use ondc_cart_add with itemId and sessionId
3. **View Cart**: When user asks "show cart", "view cart", "what's in my cart" → use ondc_cart_view with sessionId
4. **Remove from Cart**: When user asks "remove", "delete from cart" → use ondc_cart_remove with itemId and sessionId
5. **Checkout**: When user asks "checkout", "place order", "buy now" → use ondc_checkout_quote with sessionId

**IMPORTANT**: Always include the sessionId parameter in cart operations. Use the sessionId provided above.

## Response Format
- Use tools to fulfill user requests
- Return search results in [TOOL_RESULT] tags with product_cards JSON format
- Keep responses conversational and helpful`,
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
 *   { type: "assistant", message: { content: [{ type: "text", text: "..." }, { type: "tool_use", ...}] } }
 *   OR
 *   { type: "user", message: { content: [{ "tool_use_id": "...", type: "tool_result", content: [...] }] } }
 *
 * We need to preserve tool_use blocks and include them in the output
 */
function transformMessageForFrontend(message: SDKMessage): SDKMessage {
  // Handle assistant messages with nested content
  if (message.type === 'assistant' && message.message) {
    const msg = message.message as { content?: Array<{ type: string; text: string; tool_name?: string; id?: string }> };
    if (msg.content && Array.isArray(msg.content)) {
      // Find all text blocks and tool_use blocks
      const textBlocks = msg.content.filter((block) => block.type === 'text');
      const toolUseBlocks = msg.content.filter((block) => block.type === 'tool_use');

      if (textBlocks.length > 0 || toolUseBlocks.length > 0) {
        // Create combined content with tool information
        let combinedContent = '';

        // Add text blocks
        textBlocks.forEach(block => {
          combinedContent += block.text;
        });

        // Add tool use information as formatted text
        toolUseBlocks.forEach(block => {
          if (block.type === 'tool_use' && block.tool_name) {
            combinedContent += `\n\n🔧 Calling: ${block.tool_name}`;
          }
        });

        return {
          type: 'assistant',
          content: combinedContent,
          session_id: message.session_id
        };
      }
    }
  }

  // Handle user messages with tool results
  if (message.type === 'user' && message.message) {
    const msg = message.message as { content?: Array<{ type: string; text: string; tool_name?: string; id?: string }> };
    if (msg.content && Array.isArray(msg.content)) {
      // Find text blocks and tool_use blocks
      const textBlocks = msg.content.filter((block) => block.type === 'text');
      const toolUseBlocks = msg.content.filter((block) => block.type === 'tool_use');

      if (textBlocks.length > 0) {
        let combinedContent = '';

        // Add text blocks
        textBlocks.forEach(block => {
          combinedContent += block.text;
        });

        // Add tool use information
        toolUseBlocks.forEach(block => {
          if (block.type === 'tool_use' && block.tool_name) {
            combinedContent += `\n\n🔧 Calling: ${block.tool_name}`;
          }
        });

        return {
          type: 'user',
          content: combinedContent,
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
      tool_name: msg.tool_name || '',
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
