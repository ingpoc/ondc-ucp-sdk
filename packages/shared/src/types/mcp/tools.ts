/**
 * MCP Tool Types
 * Defines schemas for MCP tools used in ONDC integration
 */

import type { UCPSearchQuery, UCPSession, UCPItem } from '../ucp';

// Re-export UCPMetadata from ucp to avoid conflict
export type { UCPMetadata } from '../ucp/common';

/**
 * Base MCP tool schema following MCP specification
 */
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: MCPToolInputSchema;
}

/**
 * JSON Schema for tool input validation
 */
export interface MCPToolInputSchema {
  type: 'object';
  properties: Record<string, MCPProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * JSON Schema property definition
 */
export interface MCPProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  properties?: Record<string, MCPProperty>;
  items?: MCPProperty;
  required?: string[];
  enum?: string[];
  format?: string;
  minimum?: number;
  maximum?: number;
  default?: unknown;
}

/**
 * Tool execution result
 */
export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

/**
 * Text or data content block
 */
export interface MCPContent {
  type: 'text' | 'resource' | 'image';
  text?: string;
  data?: string;
  uri?: string;
  mimeType?: string;
}

/**
 * ondc_search tool input
 */
export interface ONDCSearchInput extends UCPSearchQuery {
  /** Maximum number of results to return (default: 10) */
  maxResults?: number;
  /** Include providers outside search radius (default: false) */
  expandSearch?: boolean;
}

/**
 * ondc_search tool output
 */
export interface ONDCSearchOutput {
  /** Search results matching query */
  items: UCPItem[];
  /** Total count of available results */
  totalCount: number;
  /** Search metadata */
  metadata: MCPSearchMetadata;
}

/**
 * Search result metadata
 */
export interface MCPSearchMetadata {
  /** Query timestamp */
  timestamp: string;
  /** Search duration in milliseconds */
  duration: number;
  /** Search radius used (meters) */
  radius?: number;
  /** Whether results were expanded */
  expanded: boolean;
}

/**
 * ondc_checkout tool input
 */
export interface ONDCCheckoutInput {
  /** Selected items to checkout */
  items: Array<{
    /** Item ID */
    id: string;
    /** Provider ID */
    providerId: string;
    /** Quantity */
    quantity: number;
  }>;
  /** Buyer information */
  buyer: {
    /** Buyer name */
    name: string;
    /** Contact phone */
    phone: string;
    /** Contact email */
    email?: string;
    /** Delivery address */
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
    };
  };
  /** Fulfillment option ID */
  fulfillmentOptionId?: string;
  /** Special instructions */
  instructions?: string;
}

/**
 * ondc_checkout tool output
 */
export interface ONDCCheckoutOutput {
  /** Created session */
  session: UCPSession;
  /** Payment details */
  payment: {
    /** Total amount */
    amount: string;
    /** Currency code */
    currency: string;
    /** Payment URL/method */
    paymentUrl?: string;
    /** Payment status */
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  /** Estimated delivery time */
  estimatedDelivery?: string;
}

/**
 * ondc_status tool input
 */
export interface ONDCStatusInput {
  /** Session/Order ID to check status */
  sessionId: string;
}

/**
 * ondc_status tool output
 */
export interface ONDCStatusOutput {
  /** Session ID */
  sessionId: string;
  /** Current status */
  status: 'created' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled' | 'failed';
  /** Status updates */
  updates: Array<{
    /** Status change timestamp */
    timestamp: string;
    /** Status description */
    status: string;
    /** Additional details */
    details?: string;
  }>;
  /** Tracking information if available */
  tracking?: {
    /** Current location */
    location?: {
      latitude: number;
      longitude: number;
    };
    /** ETA */
    eta?: string;
    /** Delivery agent info */
    agent?: {
      name: string;
      phone: string;
    };
  };
}

/**
 * ondc_cancel tool input
 */
export interface ONDCCancelInput {
  /** Session/Order ID to cancel */
  sessionId: string;
  /** Cancellation reason */
  reason: string;
}

/**
 * ondc_cancel tool output
 */
export interface ONDCCancelOutput {
  /** Session ID */
  sessionId: string;
  /** Cancellation status */
  status: 'pending' | 'approved' | 'rejected';
  /** Refund amount if applicable */
  refund?: {
    amount: string;
    currency: string;
    /** Estimated refund date */
    estimatedDate?: string;
  };
  /** Cancellation details */
  details: string;
}
