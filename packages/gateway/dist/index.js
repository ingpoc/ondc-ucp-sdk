// src/gateway.ts
var Gateway = class {
  constructor(config) {
    this.config = config;
    this.config = config;
  }
  async start() {
    console.log(`Gateway starting on port ${this.config.port}...`);
  }
  async stop() {
    console.log("Gateway stopping...");
  }
};
export {
  Gateway
};
