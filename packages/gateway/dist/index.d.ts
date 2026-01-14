declare class Gateway {
    private config;
    constructor(config: {
        port: number;
    });
    start(): Promise<void>;
    stop(): Promise<void>;
}

export { Gateway };
