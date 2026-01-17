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

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

const PROJECT_ROOT = '/Users/gurusharan/Documents/remote-claude/Research/ondc-ucp-sdk';

const ONDC_MCP_SERVERS: Record<string, MCPServerConfig> = {
  'token-efficient': {
    command: 'srt',
    args: ['node', `${PROJECT_ROOT}/mcp/token-efficient-mcp/dist/index.js`]
  },
  'context-graph': {
    command: 'uv',
    args: ['--directory', `${PROJECT_ROOT}/mcp/context-graph-mcp`, 'run', 'python', 'server.py'],
    env: { VOYAGE_API_KEY: process.env.VOYAGE_API_KEY || '' }
  },
  'ondc-shopping': {
    command: 'node',
    args: [`${PROJECT_ROOT}/mcp/ondc-shopping-mcp/dist/index.js`],
    env: { API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3001' }
  }
};

const BUYER_ALLOWED_TOOLS = [
  'mcp__token-efficient__execute_code',
  'mcp__token-efficient__process_csv',
  'mcp__token-efficient__process_logs',
  'mcp__context-graph__context_query_traces',
  'mcp__context-graph__context_store_trace',
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

const SELLER_ALLOWED_TOOLS = [
  'mcp__token-efficient__execute_code',
  'mcp__token-efficient__process_csv',
  'mcp__token-efficient__process_logs',
  'mcp__context-graph__context_query_traces',
  'mcp__context-graph__context_store_trace',
  'mcp__context-graph__context_update_outcome'
];

function loadBuyerSkillContent(): string {
  const skillPath = join(process.cwd(), '../../packages/buyer-skill/SKILL.md');

  try {
    const content = readFileSync(skillPath, 'utf-8');
    const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, '');

    return `You are following the buyer-skill workflow instructions below:

${withoutFrontmatter}

## Response Format
- Respond naturally and conversationally to users
- Keep responses concise and helpful
- Use tools to fulfill user requests
- Let the backend handle structured data formatting`;
  } catch {
    console.error('Failed to load buyer-skill SKILL.md');
    return 'You are Maya, a friendly ONDC shopping assistant.';
  }
}

const BUYER_SKILL_PROMPT = loadBuyerSkillContent();

function createErrorMessage(error: unknown): SDKResultError {
  const errorMessage = error instanceof Error ? error.message : String(error);

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
    errors: [errorMessage],
    uuid: crypto.randomUUID(),
    session_id: ''
  };
}

function buildBuyerPrompt(prompt: string, sessionId?: string): string {
  const sessionInfo = sessionId ? `sessionId: ${sessionId}` : 'sessionId: auto-generate';

  return `${BUYER_SKILL_PROMPT}

## Current Session
${sessionInfo}

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
- Keep responses conversational and helpful
- Let the backend handle structured data formatting`;
}

export async function* executeBuyerAgent(
  request: AgentRequest
): AsyncGenerator<SDKMessage> {
  const { prompt, sessionId, context } = request;

  try {
    const options: Options = {
      mcpServers: ONDC_MCP_SERVERS,
      allowedTools: BUYER_ALLOWED_TOOLS,
      model: 'claude-sonnet-4-5',
      cwd: process.cwd(),
      ...(context && { extraArgs: context as Record<string, string | null> })
    };

    const response = query({ prompt: buildBuyerPrompt(prompt, sessionId), options });

    for await (const message of response) {
      yield message;
    }
  } catch (error) {
    yield createErrorMessage(error);
  }
}

export async function* executeSellerAgent(
  request: AgentRequest
): AsyncGenerator<SDKMessage> {
  const { prompt, context } = request;

  try {
    const sellerPrompt = `${prompt}

You are a seller agent for ONDC (Open Network for Digital Commerce). Help sellers manage their catalog, optimize listings, and analyze pricing.

Available workflows:
- add-product: Add new product to catalog with SEO optimization
- edit-product: Update existing product details
- preview: Check product ranking in buyer search
- optimize: Generate suggestions to improve search visibility

Use the token-efficient MCP tools for data processing and context-graph for learning from past decisions.`;

    const options: Options = {
      mcpServers: ONDC_MCP_SERVERS,
      allowedTools: SELLER_ALLOWED_TOOLS,
      model: 'claude-sonnet-4-5',
      cwd: process.cwd(),
      ...(context && { extraArgs: context as Record<string, string | null> })
    };

    const response = query({ prompt: sellerPrompt, options });

    for await (const message of response) {
      yield message;
    }
  } catch (error) {
    yield createErrorMessage(error);
  }
}

function extractTextContent(message: SDKMessage): string {
  const msg = message.message as { content?: Array<{ type: string; text: string }> | undefined };

  if (!msg.content || !Array.isArray(msg.content)) {
    return '';
  }

  const textBlocks = msg.content.filter((block) => block.type === 'text');
  const combinedContent = textBlocks.map((block) => block.text).join('');

  return sanitizeContent(combinedContent);
}

function extractProductCards(message: SDKMessage): SDKMessage | null {
  const msg = message.message as {
    content?: Array<{
      type: string;
      content?: { type?: string; cards?: unknown[]; message?: string };
    }> | undefined
  };

  if (!msg.content || !Array.isArray(msg.content)) {
    return null;
  }

  const toolResultBlocks = msg.content.filter((block) => block.type === 'tool_result');

  for (const block of toolResultBlocks) {
    if (block.content && typeof block.content === 'object') {
      const content = block.content as { type?: string; cards?: unknown[]; message?: string };

      if (content.type === 'product_cards' && Array.isArray(content.cards)) {
        return {
          type: 'assistant',
          content: content.message || '',
          structured_data: content,
          session_id: message.session_id
        };
      }
    }
  }

  return null;
}

function transformMessageForFrontend(message: SDKMessage): SDKMessage {
  if (message.type === 'assistant' && message.message) {
    return {
      type: 'assistant',
      content: extractTextContent(message),
      session_id: message.session_id
    };
  }

  if (message.type === 'user' && message.message) {
    const productCards = extractProductCards(message);
    if (productCards) {
      return productCards;
    }
  }

  if (message.type === 'tool_progress') {
    return {
      type: 'tool_progress',
      tool_name: '',
      session_id: message.session_id
    };
  }

  return message;
}

function sanitizeContent(content: string): string {
  if (!content) return '';

  return content
    .replace(/\[TOOL_RESULT\][\s\S]*?\[\/TOOL_RESULT\]/g, '')
    .replace(/\{[\s\S]*?type[\s\S]*?product_cards[\s\S]*?\}/g, '')
    .replace(/🔧 Calling: [^\n]+/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function messageToSSE(message: SDKMessage): string {
  const transformed = transformMessageForFrontend(message);
  const data = JSON.stringify(transformed);
  return `data: ${data}\n\n`;
}
