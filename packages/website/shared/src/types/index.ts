// Browser-safe types - copied from @ondc-agent/shared to avoid pulling in Node.js dependencies
// These are minimal type definitions needed for frontend apps

// UCP types
export interface UCPSession {
  id: string;
  items: UCPSessionItem[];
  status: UCPSessionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UCPSessionItem {
  id: string;
  item: BecknItem;
  quantity: number;
  addedAt: string;
}

export type UCPSessionStatus = 'active' | 'checkout' | 'ordered' | 'expired';

export interface UCPItem {
  id: string;
  name?: string;
  descriptor?: {
    name: string;
    short_desc?: string;
  };
  description?: string;
  price: UCPPrice;
  images: BecknImage[];
  category?: string;
  _provider?: string;
  provider?: BecknProvider;
  rating?: BecknRating;
}

export interface UCPCatalog {
  items: UCPItem[];
}

export interface UCPPrice {
  value?: string;
  amount?: number;
  currency: string;
}

export interface UCPAddress {
  name: string;
  phone: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface UCPContact {
  name: string;
  phone: string;
  email?: string;
}

export interface UCPLocation {
  address?: UCPAddress;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface UCPQuote {
  price: UCPPrice;
  breakup: UCPQuoteBreakup[];
  taxes: number;
  total: number;
}

export interface UCPQuoteBreakup {
  title: string;
  price: number;
}

export interface UCPFulfillment {
  id: string;
  type: string;
  state: string;
}

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

export type UCPFulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface UCPPayment {
  type: 'PRE-FULFILLMENT' | 'ON-FULFILLMENT' | 'POST-FULFILLMENT';
  status: 'PAID' | 'NOT-PAID';
}

export interface UCPSearchPreferences {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: UCPLocation;
}

export interface UCPSearchQuery {
  query: string;
  category?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Beckn types (minimal subset for frontend)
export interface BecknItem {
  id: string;
  name: string;
  description?: string;
  price: BecknPrice;
  images: BecknImage[];
  category: BecknCategory;
}

export interface BecknCatalog {
  items: BecknItem[];
}

export interface BecknProvider {
  id: string;
  name: string;
  location: BecknLocation;
}

export interface BecknOffer {
  id: string;
  price: BecknPrice;
}

export interface BecknPrice {
  value?: string;
  amount?: number;
  currency: string;
}

export interface BecknFulfillment {
  id: string;
  type: string;
}

export interface BecknLocation {
  address?: BecknAddress;
  gps?: {
    latitude: number;
    longitude: number;
  };
}

export interface BecknAddress {
  name: string;
  phone: string;
  email?: string;
  street?: string;
  city?: BecknCity;
  state?: BecknState;
  country?: BecknCountry;
  pincode?: string;
}

export interface BecknContact {
  name: string;
  phone: string;
  email?: string;
}

export interface BecknImage {
  url: string;
}

export interface BecknDescriptor {
  name: string;
}

export interface BecknRating {
  value: number;
}

export interface BecknContext {
  domain: BecknDomain;
  action: BecknAction;
  timestamp: string;
}

export type BecknDomain =
  | 'nic2004:52110'
  | 'nic2004:52211'
  | 'nic2004:52311';

export type BecknAction =
  | 'search'
  | 'select'
  | 'init'
  | 'confirm'
  | 'status'
  | 'track'
  | 'cancel'
  | 'on_search'
  | 'on_select'
  | 'on_init'
  | 'on_confirm'
  | 'on_status'
  | 'on_track'
  | 'on_cancel';

export interface BecknCity {
  name: string;
}

export interface BecknState {
  name: string;
}

export interface BecknCountry {
  name: string;
}

export interface BecknCategory {
  name: string;
}

