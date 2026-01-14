interface ONDCMessage {
    context: ONDCContext;
    message: Record<string, unknown>;
}
interface ONDCContext {
    domain: string;
    action: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
    bpp_id: string;
    bap_id: string;
}

export type { ONDCContext, ONDCMessage };
