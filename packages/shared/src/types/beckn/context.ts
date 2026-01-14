/**
 * Beckn Protocol Context Types
 * Based on Beckn Protocol Core Specification
 */

/** Beckn protocol actions */
export type BecknAction =
  | 'search'
  | 'select'
  | 'init'
  | 'confirm'
  | 'status'
  | 'track'
  | 'cancel'
  | 'update'
  | 'rating'
  | 'support'
  | 'on_search'
  | 'on_select'
  | 'on_init'
  | 'on_confirm'
  | 'on_status'
  | 'on_track'
  | 'on_cancel'
  | 'on_update'
  | 'on_rating'
  | 'on_support';

/** ONDC/Beckn domain types */
export type BecknDomain =
  | 'ONDC:RET10' // Grocery
  | 'ONDC:RET11' // F&B
  | 'ONDC:RET12' // Fashion
  | 'ONDC:RET13' // BPC (Beauty & Personal Care)
  | 'ONDC:RET14' // Electronics
  | 'ONDC:RET15' // Appliances
  | 'ONDC:RET16' // Home & Kitchen
  | 'ONDC:RET17' // Pharma
  | 'ONDC:RET18' // Health & Wellness
  | 'ONDC:RET19' // Toys & Games
  | 'ONDC:TRV10' // Mobility
  | 'ONDC:TRV11' // Metro
  | 'ONDC:FIS10' // Loans
  | 'ONDC:FIS11' // Insurance
  | string; // Allow other domains

/** Beckn Context - header information for packet switching */
export interface BecknContext {
  /** Domain identifier (e.g., ONDC:RET10 for grocery) */
  domain: BecknDomain;

  /** Action being performed */
  action: BecknAction;

  /** Country code (ISO 3166-1 alpha-3) */
  country: string;

  /** City code */
  city: string;

  /** Core API version */
  core_version?: string;

  /** Beckn API version */
  version?: string;

  /** Buyer App Provider ID */
  bap_id: string;

  /** Buyer App Provider URI */
  bap_uri: string;

  /** Buyer Platform Provider ID (seller side) */
  bpp_id?: string;

  /** Buyer Platform Provider URI (seller side) */
  bpp_uri?: string;

  /** Unique transaction ID across the lifecycle */
  transaction_id: string;

  /** Unique message ID for this request/response */
  message_id: string;

  /** ISO 8601 timestamp */
  timestamp: string;

  /** Time-to-live (ISO 8601 duration, e.g., PT30S) */
  ttl?: string;

  /** Key for encryption/signing */
  key?: string;
}
