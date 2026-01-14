// Core Gateway class

export class Gateway {
  constructor(private config: { port: number }) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log(`Gateway starting on port ${this.config.port}...`);
    // TODO: Implement MCP server setup
  }

  async stop(): Promise<void> {
    console.log('Gateway stopping...');
  }
}
