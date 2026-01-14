/**
 * UCP Common Types
 * Shared types used across UCP interfaces
 */

/** Price with currency */
export interface UCPPrice {
  amount: number;
  currency: string;
}

/** Image reference */
export interface UCPImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/** Address information */
export interface UCPAddress {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  gps?: string;
}

/** Contact information */
export interface UCPContact {
  phone?: string;
  email?: string;
}

/** Location with coordinates */
export interface UCPLocation {
  address?: UCPAddress;
  gps?: string;
  city?: string;
  country?: string;
}

/** Time range */
export interface UCPTimeRange {
  start?: string;
  end?: string;
}

/** Rating information */
export interface UCPRating {
  value: number;
  count?: number;
  max?: number;
}

/** Generic metadata */
export type UCPMetadata = Record<string, unknown>;
