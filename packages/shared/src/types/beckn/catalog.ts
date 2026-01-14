/**
 * Beckn Protocol Catalog Types
 * Types for catalog, providers, items, fulfillments
 */

import type {
  BecknDescriptor,
  BecknImage,
  BecknLocation,
  BecknPrice,
  BecknQuantity,
  BecknTagGroup,
  BecknTime,
  BecknContact,
  BecknPerson,
  BecknState,
} from './common';

/** Catalog containing providers and items */
export interface BecknCatalog {
  'bpp/descriptor'?: BecknDescriptor;
  'bpp/providers'?: BecknProvider[];
  'bpp/fulfillments'?: BecknFulfillment[];
  'bpp/payments'?: BecknPayment[];
  'bpp/offers'?: BecknOffer[];
  exp?: string;
}

/** Provider (seller) information */
export interface BecknProvider {
  id: string;
  descriptor?: BecknDescriptor;
  category_id?: string;
  rating?: number;
  time?: BecknTime;
  categories?: BecknCategory[];
  fulfillments?: BecknFulfillment[];
  payments?: BecknPayment[];
  locations?: BecknLocation[];
  offers?: BecknOffer[];
  items?: BecknItem[];
  exp?: string;
  rateable?: boolean;
  tags?: BecknTagGroup[];
  '@ondc/org/fssai_license_no'?: string;
}

/** Category information */
export interface BecknCategory {
  id: string;
  parent_category_id?: string;
  descriptor?: BecknDescriptor;
  time?: BecknTime;
  tags?: BecknTagGroup[];
}

/** Item (product/service) information */
export interface BecknItem {
  id: string;
  parent_item_id?: string;
  descriptor?: BecknDescriptor;
  price?: BecknPrice;
  category_id?: string;
  category_ids?: string[];
  fulfillment_id?: string;
  fulfillment_ids?: string[];
  location_id?: string;
  location_ids?: string[];
  payment_ids?: string[];
  add_ons?: BecknAddOn[];
  offers?: BecknOffer[];
  quantity?: BecknQuantity;
  time?: BecknTime;
  rateable?: boolean;
  rating?: number;
  matched?: boolean;
  related?: boolean;
  recommended?: boolean;
  tags?: BecknTagGroup[];
  '@ondc/org/returnable'?: boolean;
  '@ondc/org/cancellable'?: boolean;
  '@ondc/org/return_window'?: string;
  '@ondc/org/seller_pickup_return'?: boolean;
  '@ondc/org/time_to_ship'?: string;
  '@ondc/org/available_on_cod'?: boolean;
  '@ondc/org/statutory_reqs_packaged_commodities'?: Record<string, string>;
  '@ondc/org/statutory_reqs_prepackaged_food'?: Record<string, string>;
}

/** Add-on items */
export interface BecknAddOn {
  id: string;
  descriptor?: BecknDescriptor;
  price?: BecknPrice;
}

/** Offer/discount information */
export interface BecknOffer {
  id: string;
  descriptor?: BecknDescriptor;
  location_ids?: string[];
  category_ids?: string[];
  item_ids?: string[];
  time?: BecknTime;
  tags?: BecknTagGroup[];
}

/** Fulfillment information */
export interface BecknFulfillment {
  id?: string;
  type?: string;
  '@ondc/org/provider_name'?: string;
  '@ondc/org/category'?: string;
  '@ondc/org/TAT'?: string;
  provider_id?: string;
  rating?: number;
  state?: BecknState;
  tracking?: boolean;
  customer?: BecknCustomer;
  agent?: BecknAgent;
  vehicle?: BecknVehicle;
  start?: BecknFulfillmentEnd;
  end?: BecknFulfillmentEnd;
  rateable?: boolean;
  tags?: BecknTagGroup[];
}

/** Customer information */
export interface BecknCustomer {
  person?: BecknPerson;
  contact?: BecknContact;
}

/** Agent (delivery person) */
export interface BecknAgent {
  name?: string;
  image?: BecknImage;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  tags?: BecknTagGroup[];
  rateable?: boolean;
}

/** Vehicle information */
export interface BecknVehicle {
  category?: string;
  capacity?: number;
  make?: string;
  model?: string;
  color?: string;
  energy_type?: string;
  registration?: string;
}

/** Fulfillment start/end details */
export interface BecknFulfillmentEnd {
  location?: BecknLocation;
  time?: BecknTime;
  instructions?: BecknDescriptor;
  contact?: BecknContact;
  person?: BecknPerson;
  authorization?: BecknAuthorization;
}

/** Authorization details */
export interface BecknAuthorization {
  type?: string;
  token?: string;
  valid_from?: string;
  valid_to?: string;
}

/** Payment information */
export interface BecknPayment {
  id?: string;
  type?: 'PRE-FULFILLMENT' | 'ON-FULFILLMENT' | 'POST-FULFILLMENT';
  collected_by?: 'BAP' | 'BPP';
  uri?: string;
  params?: BecknPaymentParams;
  status?: 'PAID' | 'NOT-PAID';
  time?: BecknTime;
  tags?: BecknTagGroup[];
  '@ondc/org/buyer_app_finder_fee_type'?: string;
  '@ondc/org/buyer_app_finder_fee_amount'?: string;
  '@ondc/org/settlement_basis'?: string;
  '@ondc/org/settlement_window'?: string;
  '@ondc/org/withholding_amount'?: string;
  '@ondc/org/settlement_details'?: BecknSettlementDetails[];
}

/** Payment parameters */
export interface BecknPaymentParams {
  transaction_id?: string;
  transaction_status?: string;
  amount?: string;
  currency?: string;
  bank_code?: string;
  bank_account_number?: string;
  virtual_payment_address?: string;
}

/** Settlement details */
export interface BecknSettlementDetails {
  settlement_counterparty?: string;
  settlement_phase?: string;
  settlement_type?: string;
  settlement_bank_account_no?: string;
  settlement_ifsc_code?: string;
  upi_address?: string;
  bank_name?: string;
  branch_name?: string;
}

/** Quote/pricing breakdown */
export interface BecknQuote {
  price?: BecknPrice;
  breakup?: BecknQuoteBreakup[];
  ttl?: string;
}

/** Quote breakup item */
export interface BecknQuoteBreakup {
  '@ondc/org/item_id'?: string;
  '@ondc/org/item_quantity'?: BecknQuantity;
  '@ondc/org/title_type'?: string;
  title?: string;
  price?: BecknPrice;
  item?: BecknItem;
}

/** Billing information */
export interface BecknBilling {
  name: string;
  address?: string;
  state?: BecknState;
  city?: BecknState;
  email?: string;
  phone: string;
  tax_number?: string;
  created_at?: string;
  updated_at?: string;
}
