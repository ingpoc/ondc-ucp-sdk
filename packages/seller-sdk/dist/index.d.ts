declare class SellerClient {
    private config;
    constructor(config: {
        subscriberId: string;
        baseUrl: string;
    });
    sendRequest(_request: unknown): Promise<unknown>;
}

export { SellerClient };
