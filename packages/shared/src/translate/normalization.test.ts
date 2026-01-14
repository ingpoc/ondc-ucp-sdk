/**
 * Normalization Tests
 */

import { describe, it, expect } from 'vitest';
import {
  normalizePrice,
  normalizeRating,
  normalizePercentage,
  parseDuration,
  formatDuration,
} from './normalization';

describe('Normalization', () => {
  describe('normalizePrice', () => {
    it('should normalize string price with default currency', () => {
      const result = normalizePrice('100.50');
      expect(result).toEqual({ currency: 'INR', value: '100.5' });
    });

    it('should normalize string price with custom currency', () => {
      const result = normalizePrice('50', 'USD');
      expect(result).toEqual({ currency: 'USD', value: '50' });
    });

    it('should normalize number price', () => {
      const result = normalizePrice(99.99);
      expect(result).toEqual({ currency: 'INR', value: '99.99' });
    });

    it('should handle null value', () => {
      const result = normalizePrice(null);
      expect(result).toEqual({ currency: 'INR', value: '0' });
    });

    it('should handle undefined value', () => {
      const result = normalizePrice(undefined);
      expect(result).toEqual({ currency: 'INR', value: '0' });
    });

    it('should remove currency symbols', () => {
      expect(normalizePrice('₹100')).toEqual({ currency: 'INR', value: '100' });
      expect(normalizePrice('$50')).toEqual({ currency: 'INR', value: '50' });
      expect(normalizePrice('€25.50')).toEqual({ currency: 'INR', value: '25.5' });
    });

    it('should remove commas', () => {
      const result = normalizePrice('1,234.56');
      expect(result).toEqual({ currency: 'INR', value: '1234.56' });
    });

    it('should handle invalid strings', () => {
      const result = normalizePrice('invalid');
      expect(result).toEqual({ currency: 'INR', value: '0' });
    });

    it('should uppercase currency code', () => {
      const result = normalizePrice('100', 'inr');
      expect(result).toEqual({ currency: 'INR', value: '100' });
    });

    it('should trim whitespace', () => {
      const result = normalizePrice('  100  ');
      expect(result).toEqual({ currency: 'INR', value: '100' });
    });
  });

  describe('normalizeRating', () => {
    it('should pass through 0-5 scale rating', () => {
      const result = normalizeRating(4.5, 5);
      expect(result).toEqual({ value: 4.5 });
    });

    it('should normalize from 10 scale to 5 scale', () => {
      const result = normalizeRating(8.5, 10);
      expect(result).toEqual({ value: 4.3 }); // 8.5/10 * 5 = 4.25 -> rounded = 4.3
    });

    it('should normalize from 100 scale to 5 scale', () => {
      const result = normalizeRating(85, 100);
      expect(result).toEqual({ value: 4.3 }); // 85/100 * 5 = 4.25 -> rounded = 4.3
    });

    it('should cap rating at max value', () => {
      const result = normalizeRating(12, 10);
      expect(result).toEqual({ value: 5 }); // 10/10 * 5 = 5
    });

    it('should handle null value', () => {
      const result = normalizeRating(null);
      expect(result).toBeUndefined();
    });

    it('should handle undefined value', () => {
      const result = normalizeRating(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle negative values', () => {
      const result = normalizeRating(-1);
      expect(result).toBeUndefined();
    });

    it('should handle NaN', () => {
      const result = normalizeRating(NaN);
      expect(result).toBeUndefined();
    });

    it('should round to 1 decimal place', () => {
      const result = normalizeRating(4.666, 10);
      expect(result).toEqual({ value: 2.3 }); // 4.666/10 * 5 = 2.333 -> rounded = 2.3
    });

    it('should handle zero rating', () => {
      const result = normalizeRating(0, 5);
      expect(result).toEqual({ value: 0 });
    });

    it('should use default max of 5', () => {
      const result = normalizeRating(3.5);
      expect(result).toEqual({ value: 3.5 });
    });
  });

  describe('normalizePercentage', () => {
    it('should handle percent format with % symbol', () => {
      const result = normalizePercentage('50%', 'percent');
      expect(result).toBe(0.5);
    });

    it('should handle percent format with number', () => {
      const result = normalizePercentage(75, 'percent');
      expect(result).toBe(0.75);
    });

    it('should handle decimal format', () => {
      const result = normalizePercentage(0.5, 'decimal');
      expect(result).toBe(0.5);
    });

    it('should handle null value', () => {
      const result = normalizePercentage(null);
      expect(result).toBe(0);
    });

    it('should handle undefined value', () => {
      const result = normalizePercentage(undefined);
      expect(result).toBe(0);
    });

    it('should clamp values greater than 100%', () => {
      const result = normalizePercentage('150%', 'percent');
      expect(result).toBe(1);
    });

    it('should clamp negative values', () => {
      const result = normalizePercentage(-10, 'percent');
      expect(result).toBe(0);
    });

    it('should use percent format by default', () => {
      const result = normalizePercentage('25%');
      expect(result).toBe(0.25);
    });

    it('should handle invalid strings', () => {
      const result = normalizePercentage('invalid', 'percent');
      expect(result).toBe(0);
    });

    it('should handle NaN', () => {
      const result = normalizePercentage(NaN, 'percent');
      expect(result).toBe(0);
    });
  });

  describe('parseDuration', () => {
    it('should parse days', () => {
      const result = parseDuration('P1D');
      expect(result).toBe(86400); // 1 day in seconds
    });

    it('should parse hours', () => {
      const result = parseDuration('PT2H');
      expect(result).toBe(7200); // 2 hours in seconds
    });

    it('should parse minutes', () => {
      const result = parseDuration('PT30M');
      expect(result).toBe(1800); // 30 minutes in seconds
    });

    it('should parse seconds', () => {
      const result = parseDuration('PT45S');
      expect(result).toBe(45);
    });

    it('should parse combined duration', () => {
      const result = parseDuration('P1DT2H30M');
      expect(result).toBe(95400); // 1 day (86400) + 2 hours (7200) + 30 minutes (1800) = 95400
    });

    it('should parse 7 days (common return window)', () => {
      const result = parseDuration('P7D');
      expect(result).toBe(604800); // 7 days in seconds
    });

    it('should handle null value', () => {
      const result = parseDuration(null);
      expect(result).toBe(0);
    });

    it('should handle undefined value', () => {
      const result = parseDuration(undefined);
      expect(result).toBe(0);
    });

    it('should handle invalid format', () => {
      const result = parseDuration('invalid');
      expect(result).toBe(0);
    });

    it('should handle empty string', () => {
      const result = parseDuration('');
      expect(result).toBe(0);
    });

    it('should parse years', () => {
      const result = parseDuration('P1Y');
      expect(result).toBe(31536000); // 365 days in seconds
    });

    it('should parse months', () => {
      const result = parseDuration('P1M');
      expect(result).toBe(2592000); // 30 days in seconds
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      const result = formatDuration(45);
      expect(result).toBe('45 seconds');
    });

    it('should format minutes', () => {
      const result = formatDuration(180);
      expect(result).toBe('3 minutes');
    });

    it('should format hours', () => {
      const result = formatDuration(7200);
      expect(result).toBe('2 hours');
    });

    it('should format days', () => {
      const result = formatDuration(86400);
      expect(result).toBe('1 day');
    });

    it('should format combined duration', () => {
      const result = formatDuration(93600); // 1 day + 2 hours
      expect(result).toBe('1 day 2 hours');
    });

    it('should handle zero seconds', () => {
      const result = formatDuration(0);
      expect(result).toBe('0 seconds');
    });

    it('should handle negative seconds', () => {
      const result = formatDuration(-10);
      expect(result).toBe('0 seconds');
    });

    it('should use singular form for 1', () => {
      expect(formatDuration(86400)).toBe('1 day');
      expect(formatDuration(3600)).toBe('1 hour');
      expect(formatDuration(60)).toBe('1 minute');
      expect(formatDuration(1)).toBe('1 second');
    });

    it('should use plural form for > 1', () => {
      expect(formatDuration(172800)).toBe('2 days');
      expect(formatDuration(7200)).toBe('2 hours');
      expect(formatDuration(120)).toBe('2 minutes');
      expect(formatDuration(2)).toBe('2 seconds');
    });
  });
});
