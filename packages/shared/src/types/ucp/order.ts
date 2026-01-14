/**
 * UCP Order Types
 * Types for order lifecycle management
 */

import type {
  UCPAddress,
  UCPMetadata,
  UCPPrice,
  UCPTimeRange,
} from './common';
import type { UCPProvider } from './catalog';
import type {
  UCPBuyer,
  UCPPayment,
  UCPQuote,
} from './session';

/** Order object */
export interface UCPOrder {
  /** Unique order identifier */
  id: string;
  /** Order status */
  status: UCPOrderStatus;
  /** Provider/seller */
  provider: UCPProvider;
  /** Ordered items */
  items: UCPOrderItem[];
  /** Buyer information */
  buyer: UCPBuyer;
  /** Delivery address */
  deliveryAddress: UCPAddress;
  /** Fulfillment details */
  fulfillment: UCPOrderFulfillment;
  /** Quote/pricing */
  quote: UCPQuote;
  /** Payment information */
  payment: UCPPayment;
  /** Cancellation details if cancelled */
  cancellation?: UCPCancellation;
  /** Documents (invoice, etc.) */
  documents?: UCPDocument[];
  /** Order creation time */
  createdAt: string;
  /** Order update time */
  updatedAt: string;
  /** Custom metadata */
  metadata?: UCPMetadata;
}

/** Order status values */
export type UCPOrderStatus =
  | 'created'
  | 'accepted'
  | 'in_progress'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

/** Item in order */
export interface UCPOrderItem {
  /** Item ID */
  id: string;
  /** Item name */
  name: string;
  /** Quantity ordered */
  quantity: number;
  /** Price per unit */
  price: UCPPrice;
  /** Customizations selected */
  customizations?: Record<string, string>;
  /** Item-level status if different from order */
  status?: UCPOrderStatus;
}

/** Order fulfillment details */
export interface UCPOrderFulfillment {
  /** Fulfillment type */
  type: 'delivery' | 'pickup' | 'digital';
  /** Fulfillment status */
  status: UCPFulfillmentStatus;
  /** Fulfillment provider (courier, etc.) */
  providerName?: string;
  /** Pickup location */
  pickupLocation?: UCPAddress;
  /** Delivery location */
  deliveryLocation?: UCPAddress;
  /** Estimated delivery time */
  estimatedTime?: UCPTimeRange;
  /** Actual pickup time */
  pickedUpAt?: string;
  /** Actual delivery time */
  deliveredAt?: string;
  /** Tracking information */
  tracking?: UCPTracking;
  /** Delivery agent details */
  agent?: UCPDeliveryAgent;
}

/** Fulfillment status values */
export type UCPFulfillmentStatus =
  | 'pending'
  | 'searching_agent'
  | 'agent_assigned'
  | 'picking_up'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

/** Tracking information */
export interface UCPTracking {
  /** Tracking ID */
  id?: string;
  /** Tracking URL */
  url?: string;
  /** Current GPS location */
  currentLocation?: {
    gps: string;
    timestamp: string;
  };
  /** Status message */
  statusMessage?: string;
}

/** Delivery agent details */
export interface UCPDeliveryAgent {
  name?: string;
  phone?: string;
  image?: string;
}

/** Cancellation details */
export interface UCPCancellation {
  /** Who cancelled (buyer, seller, system) */
  cancelledBy: 'buyer' | 'seller' | 'system';
  /** Cancellation reason code */
  reasonCode?: string;
  /** Cancellation reason description */
  reason?: string;
  /** Cancellation time */
  cancelledAt: string;
  /** Refund details if applicable */
  refund?: UCPRefund;
}

/** Refund details */
export interface UCPRefund {
  /** Refund status */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** Refund amount */
  amount: UCPPrice;
  /** Refund transaction ID */
  transactionId?: string;
  /** Refund completion time */
  completedAt?: string;
}

/** Document attached to order */
export interface UCPDocument {
  /** Document type */
  type: 'invoice' | 'receipt' | 'shipping_label' | 'other';
  /** Document label */
  label?: string;
  /** Document URL */
  url: string;
}
