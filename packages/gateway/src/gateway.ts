export interface GatewayConfig {
  port: number;
}

export class Gateway {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    console.log(`Gateway starting on port ${this.config.port}...`);
  }

  async stop(): Promise<void> {
    console.log('Gateway stopping...');
  }
}
