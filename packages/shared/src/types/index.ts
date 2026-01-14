// ONDC protocol types

export interface ONDCMessage {
  context: ONDCContext;
  message: Record<string, unknown>;
}

export interface ONDCContext {
  domain: string;
  action: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  bpp_id: string;
  bap_id: string;
}
