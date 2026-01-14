/**
 * Beckn Protocol Order Types
 * Types for select, init, confirm and their callbacks
 */

import type { BecknContext } from './context';
import type {
  BecknBilling,
  BecknFulfillment,
  BecknPayment,
  BecknQuote,
} from './catalog';
import type { BecknError, BecknTagGroup } from './common';

/** Order item with quantity */
export interface BecknOrderItem {
  id: string;
  quantity?: {
    count?: number;
    selected?: {
      count?: number;
    };
  };
  fulfillment_id?: string;
  parent_item_id?: string;
  tags?: BecknTagGroup[];
}

/** Order object used in select/init/confirm */
export interface BecknOrder {
  id?: string;
  state?: string;
  provider?: BecknOrderProvider;
  items?: BecknOrderItem[];
  add_ons?: BecknOrderAddOn[];
  offers?: BecknOrderOffer[];
  billing?: BecknBilling;
  fulfillments?: BecknFulfillment[];
  quote?: BecknQuote;
  payment?: BecknPayment;
  payments?: BecknPayment[];
  created_at?: string;
  updated_at?: string;
  cancellation?: BecknCancellation;
  tags?: BecknTagGroup[];
  documents?: BecknDocument[];
}

/** Provider reference in order */
export interface BecknOrderProvider {
  id: string;
  locations?: Array<{ id: string }>;
}

/** Add-on in order */
export interface BecknOrderAddOn {
  id: string;
}

/** Offer in order */
export interface BecknOrderOffer {
  id: string;
}

/** Cancellation details */
export interface BecknCancellation {
  time?: string;
  cancelled_by?: string;
  reason?: BecknCancellationReason;
}

/** Cancellation reason */
export interface BecknCancellationReason {
  id?: string;
  descriptor?: {
    name?: string;
    code?: string;
    short_desc?: string;
  };
}

/** Document in order */
export interface BecknDocument {
  url?: string;
  label?: string;
}

// ============ SELECT ============

/** Select request message */
export interface BecknSelectMessage {
  order: BecknOrder;
}

/** Full select request */
export interface BecknSelectRequest {
  context: BecknContext;
  message: BecknSelectMessage;
}

/** on_select response message */
export interface BecknOnSelectMessage {
  order: BecknOrder;
}

/** Full on_select response */
export interface BecknOnSelectResponse {
  context: BecknContext;
  message: BecknOnSelectMessage;
  error?: BecknError;
}

// ============ INIT ============

/** Init request message */
export interface BecknInitMessage {
  order: BecknOrder;
}

/** Full init request */
export interface BecknInitRequest {
  context: BecknContext;
  message: BecknInitMessage;
}

/** on_init response message */
export interface BecknOnInitMessage {
  order: BecknOrder;
}

/** Full on_init response */
export interface BecknOnInitResponse {
  context: BecknContext;
  message: BecknOnInitMessage;
  error?: BecknError;
}

// ============ CONFIRM ============

/** Confirm request message */
export interface BecknConfirmMessage {
  order: BecknOrder;
}

/** Full confirm request */
export interface BecknConfirmRequest {
  context: BecknContext;
  message: BecknConfirmMessage;
}

/** on_confirm response message */
export interface BecknOnConfirmMessage {
  order: BecknOrder;
}

/** Full on_confirm response */
export interface BecknOnConfirmResponse {
  context: BecknContext;
  message: BecknOnConfirmMessage;
  error?: BecknError;
}

// ============ STATUS ============

/** Status request message */
export interface BecknStatusMessage {
  order_id: string;
}

/** Full status request */
export interface BecknStatusRequest {
  context: BecknContext;
  message: BecknStatusMessage;
}

/** on_status response message */
export interface BecknOnStatusMessage {
  order: BecknOrder;
}

/** Full on_status response */
export interface BecknOnStatusResponse {
  context: BecknContext;
  message: BecknOnStatusMessage;
  error?: BecknError;
}

// ============ CANCEL ============

/** Cancel request message */
export interface BecknCancelMessage {
  order_id: string;
  cancellation_reason_id?: string;
  descriptor?: {
    short_desc?: string;
  };
}

/** Full cancel request */
export interface BecknCancelRequest {
  context: BecknContext;
  message: BecknCancelMessage;
}

/** on_cancel response message */
export interface BecknOnCancelMessage {
  order: BecknOrder;
}

/** Full on_cancel response */
export interface BecknOnCancelResponse {
  context: BecknContext;
  message: BecknOnCancelMessage;
  error?: BecknError;
}

// ============ TRACK ============

/** Track request message */
export interface BecknTrackMessage {
  order_id: string;
  callback_url?: string;
}

/** Full track request */
export interface BecknTrackRequest {
  context: BecknContext;
  message: BecknTrackMessage;
}

/** on_track response message */
export interface BecknOnTrackMessage {
  tracking?: BecknTracking;
}

/** Tracking details */
export interface BecknTracking {
  id?: string;
  url?: string;
  location?: {
    gps?: string;
    time?: {
      timestamp?: string;
    };
  };
  status?: string;
}

/** Full on_track response */
export interface BecknOnTrackResponse {
  context: BecknContext;
  message: BecknOnTrackMessage;
  error?: BecknError;
}
