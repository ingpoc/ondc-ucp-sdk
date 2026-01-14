// Seller client for ONDC integration

export class SellerClient {
  constructor(private config: { subscriberId: string; baseUrl: string }) {
    this.config = config;
  }

  async sendRequest(_request: unknown): Promise<unknown> {
    console.log(`Sending request to ${this.config.baseUrl}...`);
    // TODO: Implement ONDC protocol client
    return {};
  }
}
