// src/client.ts
var SellerClient = class {
  constructor(config) {
    this.config = config;
    this.config = config;
  }
  async sendRequest(_request) {
    console.log(`Sending request to ${this.config.baseUrl}...`);
    return {};
  }
};
export {
  SellerClient
};
