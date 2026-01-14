/**
 * Translation Module
 * Protocol translation between Beckn and UCP formats
 */

export { becknToUcpCatalog } from './beckn-to-ucp';
export { ucpToBecknIntent } from './ucp-to-beckn';
export {
  normalizePrice,
  normalizeRating,
  normalizePercentage,
  parseDuration,
  formatDuration,
} from './normalization';
