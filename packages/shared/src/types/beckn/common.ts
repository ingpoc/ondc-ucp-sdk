/**
 * Beckn Protocol Common Types
 * Shared types used across different message types
 */

/** Descriptor for human-readable info */
export interface BecknDescriptor {
  name: string;
  code?: string;
  short_desc?: string;
  long_desc?: string;
  images?: BecknImage[];
  audio?: string;
  video?: string;
  '3d_render'?: string;
}

/** Image object */
export interface BecknImage {
  url: string;
  size_type?: 'xs' | 'sm' | 'md' | 'lg';
  width?: string;
  height?: string;
}

/** Price information */
export interface BecknPrice {
  currency: string;
  value: string;
  estimated_value?: string;
  computed_value?: string;
  listed_value?: string;
  offered_value?: string;
  minimum_value?: string;
  maximum_value?: string;
}

/** Quantity information */
export interface BecknQuantity {
  count?: number;
  measure?: BecknMeasure;
  available?: BecknMeasure;
  allocated?: BecknMeasure;
  maximum?: BecknMeasure;
  minimum?: BecknMeasure;
  selected?: BecknMeasure;
}

/** Measurement unit */
export interface BecknMeasure {
  type?: string;
  value: string;
  unit: string;
}

/** Location information */
export interface BecknLocation {
  id?: string;
  descriptor?: BecknDescriptor;
  gps?: string;
  address?: BecknAddress;
  station_code?: string;
  city?: BecknCity;
  country?: BecknCountry;
  circle?: BecknCircle;
  polygon?: string;
  '3dspace'?: string;
  time?: BecknTime;
}

/** Address details */
export interface BecknAddress {
  door?: string;
  name?: string;
  building?: string;
  street?: string;
  locality?: string;
  ward?: string;
  city?: string;
  state?: string;
  country?: string;
  area_code?: string;
}

/** City information */
export interface BecknCity {
  name?: string;
  code?: string;
}

/** Country information */
export interface BecknCountry {
  name?: string;
  code?: string;
}

/** Circular area */
export interface BecknCircle {
  gps: string;
  radius: BecknMeasure;
}

/** Time information */
export interface BecknTime {
  label?: string;
  timestamp?: string;
  duration?: string;
  range?: BecknTimeRange;
  days?: string;
  schedule?: BecknSchedule;
}

/** Time range */
export interface BecknTimeRange {
  start?: string;
  end?: string;
}

/** Schedule */
export interface BecknSchedule {
  frequency?: string;
  holidays?: string[];
  times?: string[];
}

/** Contact information */
export interface BecknContact {
  phone?: string;
  email?: string;
  tags?: BecknTagGroup[];
}

/** Person information */
export interface BecknPerson {
  id?: string;
  name?: string;
  image?: BecknImage;
  dob?: string;
  gender?: string;
  creds?: BecknCredential[];
  tags?: BecknTagGroup[];
}

/** Credential */
export interface BecknCredential {
  id?: string;
  type?: string;
  desc?: string;
  url?: string;
}

/** Tag group for extended metadata */
export interface BecknTagGroup {
  code?: string;
  name?: string;
  display?: boolean;
  list?: BecknTag[];
}

/** Individual tag */
export interface BecknTag {
  code?: string;
  name?: string;
  value?: string;
}

/** Rating information */
export interface BecknRating {
  rating_category?: 'Order' | 'Fulfillment' | 'Item' | 'Provider' | string;
  id?: string;
  value?: number;
}

/** State information */
export interface BecknState {
  descriptor?: BecknDescriptor;
  updated_at?: string;
  updated_by?: string;
}

/** Error information */
export interface BecknError {
  code: string;
  path?: string;
  message?: string;
}
