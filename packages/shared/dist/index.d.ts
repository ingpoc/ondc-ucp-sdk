import { BecknOnSearchResponse, UCPCatalog, UCPSearchQuery, BecknIntent, UCPPrice, UCPRating, UCPItem, UCPSearchPreferences, UCPLocation } from './types/index.js';
export { BecknAck, BecknAckMessage, BecknAction, BecknAddOn, BecknAddress, BecknAgent, BecknAuthorization, BecknBilling, BecknCancelMessage, BecknCancelRequest, BecknCancellation, BecknCancellationReason, BecknCatalog, BecknCategory, BecknCircle, BecknCity, BecknConfirmMessage, BecknConfirmRequest, BecknContact, BecknContext, BecknCountry, BecknCredential, BecknCustomer, BecknDescriptor, BecknDocument, BecknDomain, BecknError, BecknFulfillment, BecknFulfillmentEnd, BecknImage, BecknInitMessage, BecknInitRequest, BecknIntentCategory, BecknIntentFulfillment, BecknIntentFulfillmentEnd, BecknIntentItem, BecknIntentOffer, BecknIntentProvider, BecknItem, BecknLocation, BecknMeasure, BecknMessage, BecknOffer, BecknOnCancelMessage, BecknOnCancelResponse, BecknOnConfirmMessage, BecknOnConfirmResponse, BecknOnInitMessage, BecknOnInitResponse, BecknOnSearchMessage, BecknOnSelectMessage, BecknOnSelectResponse, BecknOnStatusMessage, BecknOnStatusResponse, BecknOnTrackMessage, BecknOnTrackResponse, BecknOrder, BecknOrderAddOn, BecknOrderItem, BecknOrderOffer, BecknOrderProvider, BecknPayment, BecknPaymentParams, BecknPerson, BecknPrice, BecknProvider, BecknQuantity, BecknQuote, BecknQuoteBreakup, BecknRating, BecknSchedule, BecknSearchMessage, BecknSearchRequest, BecknSelectMessage, BecknSelectRequest, BecknSettlementDetails, BecknState, BecknStatusMessage, BecknStatusRequest, BecknTag, BecknTagGroup, BecknTime, BecknTimeRange, BecknTrackMessage, BecknTrackRequest, BecknTracking, BecknVehicle, MCPContent, MCPProperty, MCPSearchMetadata, MCPTool, MCPToolInputSchema, MCPToolResult, ONDCCancelInput, ONDCCancelOutput, ONDCCheckoutInput, ONDCCheckoutOutput, ONDCSearchInput, ONDCSearchOutput, ONDCStatusInput, ONDCStatusOutput, UCPAddOn, UCPAddress, UCPBuyer, UCPCancellation, UCPContact, UCPDeliveryAgent, UCPDocument, UCPFulfillmentOption, UCPFulfillmentStatus, UCPImage, UCPMetadata, UCPOrder, UCPOrderFulfillment, UCPOrderItem, UCPOrderStatus, UCPPayment, UCPPaymentStatus, UCPProvider, UCPQuote, UCPQuoteBreakup, UCPRefund, UCPSession, UCPSessionItem, UCPSessionStatus, UCPTimeRange, UCPTracking, allMCPTools, ondcCancelTool, ondcCheckoutTool, ondcSearchTool, ondcStatusTool } from './types/index.js';
export { AuthHeaderRequest, KeyPair, VerifiedAuth, buildAuthHeader, generateKeyPair, generateKeyPairFromSeed, getPublicKey, initCrypto, parseAuthHeader, signMessage, verifyAuthHeader, verifySignature } from './crypto/index.js';
import { z } from 'zod';
import { AxiosInstance } from 'axios';
export { ONDCError, SignatureError, ValidationError } from './errors/index.js';
export { APP, AgentChat, AgentChatMessage, AgentChatProps, BADGE, BUTTON, CARD, COLORS, DRAMS, DRAMS_CARD, DRAMS_EMPTY_STATE, DramsAddButton, DramsAddButtonProps, DramsButton, DramsButtonProps, DramsButtonVariant, DramsColorKey, DramsDropdown, DramsDropdownOption, DramsDropdownProps, DramsFlipCard, DramsFlipCardBackProps, DramsFlipCardFrontProps, DramsFlipCardProps, DramsFlipCardSpec, DramsInput, DramsInputProps, DramsProductCard, DramsProductCardProps, DramsToggle, DramsToggleProps, EMPTY_STATE, ERROR, FlipCardBack, FlipCardFront, GRID, INPUT, LAYOUT, LOADING, NAV, PILL_BUTTON, PageHeader, PageHeaderProps, PageLayout, PageLayoutProps, PageVariant, QUANTITY_CONTROL, RADIUS, RadiusKey, RollingSearch, RollingSearchProps, SELECT_BOX, SHADOWS, SLIDER, SPACING, ShadowKey, SpacingValue, TEXT_BOX, TOGGLE_SWITCH, TRANSITIONS, TYPOGRAPHY, TransitionKey, TypographyKey, active, animations, cardLift, concave, convex, disabled, focusRing, grayTrack, hover, innerGlow, mediumShadow, orangeBall, pressed, shimmer, softShadow } from './design-system/index.js';
import 'react/jsx-runtime';
import 'react';

/**
 * Configuration Schema
 * Zod schemas for validating gateway configuration
 */

/**
 * Supported environment types
 */
declare const EnvironmentEnum: z.ZodEnum<["production", "staging", "development"]>;
/**
 * Gateway configuration schema
 */
declare const GatewayConfigSchema: z.ZodObject<{
    /** ONDC Gateway URL */
    gatewayUrl: z.ZodString;
    /** ONDC Registry URL */
    registryUrl: z.ZodString;
    /** Subscriber ID (e.g., "ondc.example.com") */
    subscriberId: z.ZodString;
    /** Base64 encoded Ed25519 private key */
    privateKey: z.ZodString;
    /** Environment: production, staging, or development */
    environment: z.ZodDefault<z.ZodEnum<["production", "staging", "development"]>>;
    /** Unique key identifier for this subscriber's key */
    keyId: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    privateKey: string;
    keyId: string;
    subscriberId: string;
    gatewayUrl: string;
    registryUrl: string;
    environment: "production" | "staging" | "development";
}, {
    privateKey: string;
    subscriberId: string;
    gatewayUrl: string;
    registryUrl: string;
    keyId?: string | undefined;
    environment?: "production" | "staging" | "development" | undefined;
}>;
/**
 * Inferred type from GatewayConfigSchema
 */
type GatewayConfig = z.infer<typeof GatewayConfigSchema>;
/**
 * Partial gateway config for optional overrides
 */
type PartialGatewayConfig = Partial<GatewayConfig>;

/**
 * Config Loader
 * Load and validate configuration from environment variables
 */

/**
 * Environment variable names for configuration
 */
declare const EnvVars: {
    readonly GATEWAY_URL: "ONDC_GATEWAY_URL";
    readonly REGISTRY_URL: "ONDC_REGISTRY_URL";
    readonly SUBSCRIBER_ID: "ONDC_SUBSCRIBER_ID";
    readonly PRIVATE_KEY: "ONDC_PRIVATE_KEY";
    readonly ENVIRONMENT: "ONDC_ENVIRONMENT";
    readonly KEY_ID: "ONDC_KEY_ID";
};
/**
 * Error thrown when configuration validation fails
 */
declare class ConfigValidationError extends Error {
    readonly errors: z.ZodError;
    constructor(errors: z.ZodError);
}
/**
 * Missing required environment variable error
 */
declare class MissingEnvVarError extends Error {
    readonly varName: string;
    constructor(varName: string);
}
/**
 * Load configuration from environment variables
 *
 * Environment variables:
 * - ONDC_GATEWAY_URL (required): ONDC Gateway URL
 * - ONDC_REGISTRY_URL (required): ONDC Registry URL
 * - ONDC_SUBSCRIBER_ID (required): Subscriber ID
 * - ONDC_PRIVATE_KEY (required): Base64 encoded Ed25519 private key
 * - ONDC_ENVIRONMENT (optional): Environment (production|staging|development)
 * - ONDC_KEY_ID (optional): Key identifier
 *
 * @returns Validated configuration object
 * @throws {MissingEnvVarError} If required environment variable is missing
 * @throws {ConfigValidationError} If configuration validation fails
 *
 * @example
 * ```ts
 * process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
 * process.env.ONDC_REGISTRY_URL = 'https://registry.ondc.org';
 * process.env.ONDC_SUBSCRIBER_ID = 'ondc.example.com';
 * process.env.ONDC_PRIVATE_KEY = 'base64key==';
 *
 * const config = loadConfig();
 * console.log(config.gatewayUrl); // 'https://gateway.ondc.org'
 * ```
 */
declare function loadConfig(): GatewayConfig;
/**
 * Load configuration with partial overrides
 *
 * @param overrides - Partial configuration to override environment values
 * @returns Validated configuration object
 *
 * @example
 * ```ts
 * // Set env vars for most config
 * process.env.ONDC_GATEWAY_URL = 'https://gateway.ondc.org';
 * // ...
 *
 * // Override specific value
 * const config = loadConfigWithOverrides({
 *   environment: 'production'
 * });
 * ```
 */
declare function loadConfigWithOverrides(overrides: PartialGatewayConfig): GatewayConfig;
/**
 * Check if all required environment variables are set
 *
 * @returns Object with isValid flag and missing vars array
 *
 * @example
 * ```ts
 * const check = checkEnvVars();
 * if (!check.isValid) {
 *   console.error('Missing vars:', check.missing);
 * }
 * ```
 */
declare function checkEnvVars(): {
    isValid: boolean;
    missing: string[];
};

/**
 * Beckn to UCP Translator
 * Translates ONDC Beckn protocol responses to UCP format
 */

/**
 * Translate Beckn on_search response to UCP catalog
 *
 * @param response - Beckn on_search response
 * @returns UCP catalog with items
 *
 * @example
 * ```ts
 * const becknResponse: BecknOnSearchResponse = {
 *   context: { ... },
 *   message: { catalog: { ... } }
 * };
 * const ucpCatalog = becknToUcpCatalog(becknResponse);
 * console.log(ucpCatalog.items); // Array of UCPItem[]
 * ```
 */
declare function becknToUcpCatalog(response: BecknOnSearchResponse): UCPCatalog;

/**
 * UCP to Beckn Translator
 * Translates UCP search queries to Beckn intent format
 */

/**
 * Translate UCP search query to Beckn intent
 *
 * @param query - UCP search query
 * @returns Beckn intent for search
 *
 * @example
 * ```ts
 * const ucpQuery: UCPSearchQuery = {
 *   query: 'smartphone',
 *   category: 'Electronics',
 *   location: { latitude: 28.6139, longitude: 77.2090 },
 *   priceRange: { min: 10000, max: 20000 }
 * };
 * const becknIntent = ucpToBecknIntent(ucpQuery);
 * ```
 */
declare function ucpToBecknIntent(query: UCPSearchQuery): BecknIntent;

/**
 * Normalization Utilities
 * Normalize prices, ratings, and other values to standard formats
 */

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
declare function normalizePrice(value: string | number | null | undefined, currency?: string): UCPPrice;
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
declare function normalizeRating(value: number | null | undefined, max?: number): UCPRating | undefined;
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
declare function normalizePercentage(value: string | number | null | undefined, format?: 'percent' | 'decimal'): number;
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
declare function parseDuration(duration: string | null | undefined): number;
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
declare function formatDuration(seconds: number): string;

/**
 * ONDC HTTP Client
 * HTTP client for making authenticated requests to ONDC network
 */

/**
 * Configuration for ONDC client
 */
interface ONDCClientConfig {
    /** Base URL for ONDC gateway */
    baseURL: string;
    /** Subscriber ID */
    subscriberId: string;
    /** Base64 encoded Ed25519 private key */
    privateKey: string;
    /** Unique key identifier */
    keyId?: string;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Maximum number of retry attempts (default: 3) */
    maxRetries?: number;
    /** Base delay for exponential backoff in ms (default: 100) */
    retryDelay?: number;
}
/**
 * ONDC HTTP client for authenticated requests with retry support
 */
declare class ONDCClient {
    private axios;
    private subscriberId;
    private privateKey;
    private keyId;
    private maxRetries;
    private retryDelay;
    constructor(config: ONDCClientConfig);
    /**
     * Execute request with retry logic
     */
    private withRetry;
    /**
     * Make authenticated POST request with retry
     */
    post<T = unknown>(path: string, body: unknown): Promise<T>;
    /**
     * Make authenticated GET request with retry
     */
    get<T = unknown>(path: string): Promise<T>;
    /**
     * Update subscriber credentials
     *
     * @param subscriberId - New subscriber ID
     * @param privateKey - New private key
     */
    updateCredentials(subscriberId: string, privateKey: string): void;
    /**
     * Update key identifier
     *
     * @param keyId - New key identifier
     */
    updateKeyId(keyId: string): void;
    /**
     * Get the underlying Axios instance
     *
     * Useful for custom configurations or interceptors
     */
    getAxiosInstance(): AxiosInstance;
}

/**
 * Preference Scoring Algorithm
 * Scores items based on user preferences with normalized weights
 */

/**
 * Scoring context for normalization
 * Provides min/max values from the result set for fair comparison
 */
interface ScoringContext {
    /** Minimum price in result set */
    minPrice?: number;
    /** Maximum price in result set */
    maxPrice?: number;
    /** User's location for distance calculation */
    userLocation?: UCPLocation;
    /** Maximum distance in result set (km) */
    maxDistance?: number;
    /** Minimum delivery time in result set (minutes) */
    minDeliveryTime?: number;
    /** Maximum delivery time in result set (minutes) */
    maxDeliveryTime?: number;
}
/**
 * Score an item based on user preferences
 *
 * @param item - Item to score
 * @param preferences - User preference weights (0-1 for each dimension)
 * @param context - Scoring context with normalization bounds
 * @returns Score between 0 and 1 (higher is better match)
 *
 * @example
 * ```ts
 * const score = scoreItem(item, {
 *   priceWeight: 0.4,
 *   ratingWeight: 0.3,
 *   distanceWeight: 0.2,
 *   deliveryWeight: 0.1,
 * }, {
 *   minPrice: 100,
 *   maxPrice: 1000,
 *   userLocation: { latitude: 12.97, longitude: 77.59 },
 * });
 * ```
 */
declare function scoreItem(item: UCPItem, preferences?: UCPSearchPreferences, context?: ScoringContext): number;
/**
 * Build scoring context from a list of items
 * Calculates min/max values for normalization
 */
declare function buildScoringContext(items: UCPItem[], userLocation?: UCPLocation): ScoringContext;
/**
 * Score and sort items by preference
 *
 * @param items - Items to score and sort
 * @param preferences - User preference weights
 * @param userLocation - User's location for distance calculation
 * @returns Items sorted by score (highest first) with scores attached
 */
declare function scoreAndSortItems(items: UCPItem[], preferences?: UCPSearchPreferences, userLocation?: UCPLocation): Array<UCPItem & {
    _score: number;
}>;

export { BecknIntent, BecknOnSearchResponse, ConfigValidationError, EnvVars, EnvironmentEnum, type GatewayConfig, GatewayConfigSchema, MissingEnvVarError, ONDCClient, type ONDCClientConfig, type PartialGatewayConfig, type ScoringContext, UCPCatalog, UCPItem, UCPLocation, UCPPrice, UCPRating, UCPSearchPreferences, UCPSearchQuery, becknToUcpCatalog, buildScoringContext, checkEnvVars, formatDuration, loadConfig, loadConfigWithOverrides, normalizePercentage, normalizePrice, normalizeRating, parseDuration, scoreAndSortItems, scoreItem, ucpToBecknIntent };
