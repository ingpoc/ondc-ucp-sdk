/**
 * UCP Session Types
 * Types for checkout session management
 */

import type {
  UCPAddress,
  UCPContact,
  UCPMetadata,
  UCPPrice,
} from './common';
import type { UCPItem, UCPFulfillmentOption } from './catalog';

/** Checkout session */
export interface UCPSession {
  /** Unique session identifier */
  id: string;
  /** Session status */
  status: UCPSessionStatus;
  /** Items in session with quantities */
  items: UCPSessionItem[];
  /** Buyer information */
  buyer: UCPBuyer;
  /** Delivery address */
  deliveryAddress?: UCPAddress;
  /** Selected fulfillment */
  fulfillment?: UCPFulfillmentOption;
  /** Quote/pricing breakdown */
  quote?: UCPQuote;
  /** Payment information */
  payment?: UCPPayment;
  /** Session creation time */
  createdAt: string;
  /** Session update time */
  updatedAt: string;
  /** Session expiry time */
  expiresAt?: string;
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Session status values */
export type UCPSessionStatus =
  | 'created'
  | 'items_selected'
  | 'address_confirmed'
  | 'quote_received'
  | 'payment_pending'
  | 'payment_completed'
  | 'confirmed'
  | 'expired'
  | 'cancelled';

/** Item in session with quantity */
export interface UCPSessionItem {
  /** Reference to catalog item */
  item: UCPItem;
  /** Selected quantity */
  quantity: number;
  /** Customizations/variants selected */
  customizations?: Record<string, string>;
  /** Add-ons selected */
  addOns?: UCPAddOn[];
}

/** Add-on item */
export interface UCPAddOn {
  id: string;
  name: string;
  price: UCPPrice;
}

/** Buyer information */
export interface UCPBuyer {
  /** Buyer name */
  name: string;
  /** Contact information */
  contact: UCPContact;
  /** Billing address */
  billingAddress?: UCPAddress;
  /** Tax ID (GST, etc.) */
  taxId?: string;
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Quote/pricing breakdown */
export interface UCPQuote {
  /** Total price */
  total: UCPPrice;
  /** Item subtotal */
  subtotal: UCPPrice;
  /** Delivery/shipping cost */
  deliveryCost?: UCPPrice;
  /** Tax amount */
  tax?: UCPPrice;
  /** Discount amount */
  discount?: UCPPrice;
  /** Detailed breakup */
  breakup?: UCPQuoteBreakup[];
  /** Quote validity (ISO 8601 duration) */
  ttl?: string;
}

/** Quote breakup line item */
export interface UCPQuoteBreakup {
  /** Title of charge */
  title: string;
  /** Type: item, delivery, tax, discount, etc. */
  type: 'item' | 'delivery' | 'tax' | 'discount' | 'fee' | 'other';
  /** Amount */
  price: UCPPrice;
  /** Item ID if type is item */
  itemId?: string;
  /** Quantity if type is item */
  quantity?: number;
}

/** Payment information */
export interface UCPPayment {
  /** Payment method type */
  type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'other';
  /** Payment status */
  status: UCPPaymentStatus;
  /** Transaction ID */
  transactionId?: string;
  /** Payment amount */
  amount: UCPPrice;
  /** Payment URI (for UPI, etc.) */
  uri?: string;
  /** Payment gateway/handler */
  handler?: string;
  /** UPI VPA if applicable */
  vpa?: string;
  /** Payment timestamp */
  completedAt?: string;
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Payment status values */
export type UCPPaymentStatus =
  | 'pending'
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';
