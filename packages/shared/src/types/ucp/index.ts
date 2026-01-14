/**
 * UCP Protocol Types
 * Re-exports all UCP protocol types for easy consumption
 */

// Common types
export type {
  UCPAddress,
  UCPContact,
  UCPImage,
  UCPLocation,
  UCPMetadata,
  UCPPrice,
  UCPRating,
  UCPTimeRange,
} from './common';

// Search types
export type {
  UCPSearchPreferences,
  UCPSearchQuery,
} from './search';

// Catalog types
export type {
  UCPCatalog,
  UCPFulfillmentOption,
  UCPItem,
  UCPProvider,
} from './catalog';

// Session types
export type {
  UCPAddOn,
  UCPBuyer,
  UCPPayment,
  UCPPaymentStatus,
  UCPQuote,
  UCPQuoteBreakup,
  UCPSession,
  UCPSessionItem,
  UCPSessionStatus,
} from './session';

// Order types
export type {
  UCPCancellation,
  UCPDeliveryAgent,
  UCPDocument,
  UCPFulfillmentStatus,
  UCPOrder,
  UCPOrderFulfillment,
  UCPOrderItem,
  UCPOrderStatus,
  UCPRefund,
  UCPTracking,
} from './order';
