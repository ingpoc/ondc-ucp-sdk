/**
 * MCP Server for ONDC Agent Gateway
 * Provides MCP tools for AI agents to interact with ONDC network
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export interface MCPServerConfig {
  /** Server name shown to MCP clients */
  name: string;
  /** Server version */
  version: string;
}

/**
 * MCP Server wrapper with stdio transport
 * Handles lifecycle management and graceful shutdown
 */
export class ONDCMcpServer {
  private server: McpServer;
  private transport: StdioServerTransport | null = null;
  private isConnected = false;
  private shutdownHandlers: Array<() => void> = [];

  constructor(config: MCPServerConfig) {
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start(): Promise<void> {
    if (this.isConnected) {
      throw new Error('Server is already connected');
    }

    this.transport = new StdioServerTransport();

    // Set up SIGINT handler for graceful shutdown
    const sigintHandler = async () => {
      await this.stop();
      process.exit(0);
    };

    process.on('SIGINT', sigintHandler);
    this.shutdownHandlers.push(() => {
      process.removeListener('SIGINT', sigintHandler);
    });

    await this.server.connect(this.transport);
    this.isConnected = true;
  }

  /**
   * Stop the MCP server gracefully
   */
  async stop(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    // Clean up shutdown handlers
    for (const handler of this.shutdownHandlers) {
      handler();
    }
    this.shutdownHandlers = [];

    await this.server.close();
    this.transport = null;
    this.isConnected = false;
  }

  /**
   * Get the underlying McpServer instance for tool registration
   */
  getServer(): McpServer {
    return this.server;
  }

  /**
   * Check if server is currently connected
   */
  isRunning(): boolean {
    return this.isConnected;
  }
}
