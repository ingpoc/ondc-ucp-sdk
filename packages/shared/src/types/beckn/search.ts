/**
 * Beckn Protocol Search Types
 * Types for search request and on_search response
 */

import type { BecknContext } from './context';
import type { BecknCatalog, BecknPayment } from './catalog';
import type {
  BecknDescriptor,
  BecknLocation,
  BecknPrice,
  BecknTagGroup,
  BecknTime,
  BecknError,
} from './common';

/** Search intent */
export interface BecknIntent {
  descriptor?: BecknDescriptor;
  provider?: BecknIntentProvider;
  fulfillment?: BecknIntentFulfillment;
  payment?: BecknPayment;
  category?: BecknIntentCategory;
  offer?: BecknIntentOffer;
  item?: BecknIntentItem;
  tags?: BecknTagGroup[];
}

/** Intent provider filter */
export interface BecknIntentProvider {
  id?: string;
  descriptor?: BecknDescriptor;
  locations?: BecknLocation[];
  categories?: BecknIntentCategory[];
  items?: BecknIntentItem[];
  tags?: BecknTagGroup[];
}

/** Intent fulfillment filter */
export interface BecknIntentFulfillment {
  id?: string;
  type?: string;
  start?: BecknIntentFulfillmentEnd;
  end?: BecknIntentFulfillmentEnd;
  tags?: BecknTagGroup[];
}

/** Intent fulfillment endpoint */
export interface BecknIntentFulfillmentEnd {
  location?: BecknLocation;
  time?: BecknTime;
}

/** Intent category filter */
export interface BecknIntentCategory {
  id?: string;
  descriptor?: BecknDescriptor;
}

/** Intent offer filter */
export interface BecknIntentOffer {
  id?: string;
  descriptor?: BecknDescriptor;
}

/** Intent item filter */
export interface BecknIntentItem {
  id?: string;
  descriptor?: BecknDescriptor;
  price?: BecknPrice;
  tags?: BecknTagGroup[];
}

/** Search request message */
export interface BecknSearchMessage {
  intent: BecknIntent;
}

/** Full search request */
export interface BecknSearchRequest {
  context: BecknContext;
  message: BecknSearchMessage;
}

/** on_search response message */
export interface BecknOnSearchMessage {
  catalog: BecknCatalog;
}

/** Full on_search response */
export interface BecknOnSearchResponse {
  context: BecknContext;
  message: BecknOnSearchMessage;
  error?: BecknError;
}
