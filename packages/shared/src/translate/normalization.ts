/**
 * Normalization Utilities
 * Normalize prices, ratings, and other values to standard formats
 */

import type { UCPPrice, UCPRating } from '../types/ucp';

/**
 * Normalize price value to UCP price format
 *
 * @param value - Price value as string or number
 * @param currency - Currency code (default: INR)
 * @returns Normalized UCP price
 *
 * @example
 * ```ts
 * normalizePrice('100.50', 'INR')
 * // Returns: { currency: 'INR', value: '100.50' }
 *
 * normalizePrice(99, 'USD')
 * // Returns: { currency: 'USD', value: '99' }
 *
 * normalizePrice(null)
 * // Returns: { currency: 'INR', value: '0' }
 * ```
 */
export function normalizePrice(
  value: string | number | null | undefined,
  currency: string = 'INR'
): UCPPrice {
  // Handle missing/null values
  if (value === null || value === undefined) {
    return { currency: 'INR', value: '0' };
  }

  // Convert to string and clean up
  const valueStr = String(value).trim();

  // Remove currency symbols and commas
  const cleaned = valueStr
    .replace(/[₹$€£¥,]/g, '')
    .trim();

  // Validate it's a number
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    return { currency: 'INR', value: '0' };
  }

  return {
    currency: currency.toUpperCase(),
    value: String(num),
  };
}

/**
 * Normalize rating to 0-5 scale
 *
 * @param value - Rating value
 * @param max - Maximum possible rating (e.g., 5, 10, 100)
 * @returns Normalized rating on 0-5 scale, or undefined if invalid
 *
 * @example
 * ```ts
 * normalizeRating(4.5, 5)
 * // Returns: { value: 4.5 }
 *
 * normalizeRating(8.5, 10)
 * // Returns: { value: 4.25 }
 *
 * normalizeRating(85, 100)
 * // Returns: { value: 4.25 }
 *
 * normalizeRating(null)
 * // Returns: undefined
 *
 * normalizeRating(-1)
 * // Returns: undefined
 * ```
 */
export function normalizeRating(
  value: number | null | undefined,
  max: number = 5
): UCPRating | undefined {
  // Handle missing/null values
  if (value === null || value === undefined) {
    return undefined;
  }

  // Validate value
  if (typeof value !== 'number' || isNaN(value) || value < 0) {
    return undefined;
  }

  // Validate max
  if (typeof max !== 'number' || isNaN(max) || max <= 0) {
    return undefined;
  }

  // If value exceeds max, cap it at max
  const clampedValue = Math.min(value, max);

  // Normalize to 0-5 scale
  const normalizedValue = max === 5 ? clampedValue : (clampedValue / max) * 5;

  // Round to 1 decimal place
  const rounded = Math.round(normalizedValue * 10) / 10;

  return { value: rounded };
}

/**
 * Normalize percentage value
 *
 * @param value - Percentage as string or number (e.g., "50%", 0.5, 50)
 * @param format - Input format: 'percent' (0-100) or 'decimal' (0-1)
 * @returns Normalized percentage as decimal (0-1)
 *
 * @example
 * ```ts
 * normalizePercentage('50%', 'percent')
 * // Returns: 0.5
 *
 * normalizePercentage(50, 'percent')
 * // Returns: 0.5
 *
 * normalizePercentage(0.5, 'decimal')
 * // Returns: 0.5
 *
 * normalizePercentage(null)
 * // Returns: 0
 * ```
 */
export function normalizePercentage(
  value: string | number | null | undefined,
  format: 'percent' | 'decimal' = 'percent'
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  let num: number;

  if (typeof value === 'string') {
    // Remove % sign and convert
    const cleaned = value.replace(/%/g, '').trim();
    num = parseFloat(cleaned);
  } else {
    num = value;
  }

  if (isNaN(num)) {
    return 0;
  }

  // Convert to decimal
  if (format === 'percent') {
    num = num / 100;
  }

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, num));
}

/**
 * Parse ISO 8601 duration to seconds
 *
 * @param duration - ISO 8601 duration string (e.g., "P1D", "PT2H", "P1DT2H")
 * @returns Duration in seconds, or 0 if invalid
 *
 * @example
 * ```ts
 * parseDuration('P1D')
 * // Returns: 86400 (1 day in seconds)
 *
 * parseDuration('PT2H')
 * // Returns: 7200 (2 hours in seconds)
 *
 * parseDuration('P1DT2H')
 * // Returns: 93600 (1 day + 2 hours in seconds)
 *
 * parseDuration('P7D')
 * // Returns: 604800 (7 days in seconds)
 * ```
 */
export function parseDuration(duration: string | null | undefined): number {
  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  // ISO 8601 duration format: P[n]Y[n]M[n]DT[n]H[n]M[n]S
  const regex = /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?/;
  const match = duration.match(regex);

  if (!match) {
    return 0;
  }

  const [
    ,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
  ] = match;

  let total = 0;

  // Approximate conversions (months vary, using 30 days)
  if (years) total += parseInt(years, 10) * 365 * 24 * 60 * 60;
  if (months) total += parseInt(months, 10) * 30 * 24 * 60 * 60;
  if (days) total += parseInt(days, 10) * 24 * 60 * 60;
  if (hours) total += parseInt(hours, 10) * 60 * 60;
  if (minutes) total += parseInt(minutes, 10) * 60;
  if (seconds) total += parseInt(seconds, 10);

  return total;
}

/**
 * Format seconds to human-readable duration
 *
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "7 days", "2 hours")
 *
 * @example
 * ```ts
 * formatDuration(86400)
 * // Returns: "1 day"
 *
 * formatDuration(7200)
 * // Returns: "2 hours"
 *
 * formatDuration(93600)
 * // Returns: "1 day 2 hours"
 * ```
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) {
    return '0 seconds';
  }

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? 's' : ''}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  if (secs > 0 && parts.length === 0) {
    parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}
