import {
  buildAuthHeader,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
  initCrypto,
  parseAuthHeader,
  signMessage,
  verifyAuthHeader,
  verifySignature
} from "./chunk-JND4W6FD.js";
import {
  ONDCError,
  SignatureError,
  ValidationError
} from "./chunk-ENZDRWLG.js";
import {
  allMCPTools,
  ondcCancelTool,
  ondcCheckoutTool,
  ondcSearchTool,
  ondcStatusTool
} from "./chunk-PO3HPXUR.js";

// src/config/schema.ts
import { z } from "zod";
var EnvironmentEnum = z.enum(["production", "staging", "development"]);
var GatewayConfigSchema = z.object({
  /** ONDC Gateway URL */
  gatewayUrl: z.string().url("Invalid gateway URL"),
  /** ONDC Registry URL */
  registryUrl: z.string().url("Invalid registry URL"),
  /** Subscriber ID (e.g., "ondc.example.com") */
  subscriberId: z.string().min(1, "Subscriber ID is required"),
  /** Base64 encoded Ed25519 private key */
  privateKey: z.string().min(1, "Private key is required"),
  /** Environment: production, staging, or development */
  environment: EnvironmentEnum.default("development"),
  /** Unique key identifier for this subscriber's key */
  keyId: z.string().default("default-key")
});

// src/config/loader.ts
var EnvVars = {
  GATEWAY_URL: "ONDC_GATEWAY_URL",
  REGISTRY_URL: "ONDC_REGISTRY_URL",
  SUBSCRIBER_ID: "ONDC_SUBSCRIBER_ID",
  PRIVATE_KEY: "ONDC_PRIVATE_KEY",
  ENVIRONMENT: "ONDC_ENVIRONMENT",
  KEY_ID: "ONDC_KEY_ID"
};
var ConfigValidationError = class extends Error {
  constructor(errors) {
    const errorMessages = errors.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    super(`Configuration validation failed: ${errorMessages}`);
    this.errors = errors;
    this.name = "ConfigValidationError";
  }
};
var MissingEnvVarError = class extends Error {
  constructor(varName) {
    super(`Missing required environment variable: ${varName}`);
    this.varName = varName;
    this.name = "MissingEnvVarError";
  }
};
function getRequiredEnv(varName) {
  const value = process.env[varName];
  if (!value) {
    throw new MissingEnvVarError(varName);
  }
  return value;
}
function getOptionalEnv(varName, defaultValue) {
  return process.env[varName] ?? defaultValue;
}
function loadConfig() {
  const rawConfig = {
    gatewayUrl: getRequiredEnv(EnvVars.GATEWAY_URL),
    registryUrl: getRequiredEnv(EnvVars.REGISTRY_URL),
    subscriberId: getRequiredEnv(EnvVars.SUBSCRIBER_ID),
    privateKey: getRequiredEnv(EnvVars.PRIVATE_KEY),
    environment: getOptionalEnv(EnvVars.ENVIRONMENT, "development"),
    keyId: getOptionalEnv(EnvVars.KEY_ID, "default-key")
  };
  const result = GatewayConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    throw new ConfigValidationError(result.error);
  }
  return result.data;
}
function loadConfigWithOverrides(overrides) {
  const baseConfig = {
    gatewayUrl: getRequiredEnv(EnvVars.GATEWAY_URL),
    registryUrl: getRequiredEnv(EnvVars.REGISTRY_URL),
    subscriberId: getRequiredEnv(EnvVars.SUBSCRIBER_ID),
    privateKey: getRequiredEnv(EnvVars.PRIVATE_KEY),
    environment: getOptionalEnv(EnvVars.ENVIRONMENT, "development"),
    keyId: getOptionalEnv(EnvVars.KEY_ID, "default-key")
  };
  const mergedConfig = { ...baseConfig, ...overrides };
  const result = GatewayConfigSchema.safeParse(mergedConfig);
  if (!result.success) {
    throw new ConfigValidationError(result.error);
  }
  return result.data;
}
function checkEnvVars() {
  const requiredVars = [
    EnvVars.GATEWAY_URL,
    EnvVars.REGISTRY_URL,
    EnvVars.SUBSCRIBER_ID,
    EnvVars.PRIVATE_KEY
  ];
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  return {
    isValid: missing.length === 0,
    missing
  };
}

// src/translate/beckn-to-ucp.ts
function becknToUcpCatalog(response) {
  const catalog = response.message?.catalog;
  if (!catalog) {
    return { items: [] };
  }
  const providers = catalog["bpp/providers"] ?? [];
  const items = [];
  for (const provider of providers) {
    const providerItems = provider.items ?? [];
    const ucpProvider = translateProvider(provider);
    for (const item of providerItems) {
      const ucpItem = translateItem(item, provider, ucpProvider);
      items.push(ucpItem);
    }
  }
  return {
    items,
    totalCount: items.length
  };
}
function translateProvider(provider) {
  const descriptor = provider.descriptor;
  return {
    id: provider.id,
    name: descriptor?.name ?? "Unknown Provider",
    logo: translateImage(descriptor?.images?.[0]),
    rating: translateRating(provider.rating),
    location: translateLocation(provider.locations?.[0])
  };
}
function translateItem(item, provider, ucpProvider) {
  const descriptor = item.descriptor;
  return {
    id: item.id,
    name: descriptor?.name ?? "Unknown Item",
    description: descriptor?.long_desc ?? descriptor?.short_desc,
    images: translateImages(descriptor?.images),
    price: translatePrice(item.price),
    originalPrice: translateOriginalPrice(item.price),
    provider: ucpProvider,
    category: findCategoryName(item.category_id, provider.categories),
    rating: translateRating(item.rating),
    availableQuantity: item.quantity?.count,
    returnable: item["@ondc/org/returnable"],
    cancellable: item["@ondc/org/cancellable"],
    codAvailable: item["@ondc/org/available_on_cod"]
  };
}
function translatePrice(price) {
  if (!price) {
    return { currency: "INR", value: "0" };
  }
  const value = price.offered_value ?? price.value ?? "0";
  return {
    currency: price.currency ?? "INR",
    value
  };
}
function translateOriginalPrice(price) {
  if (!price || !price.offered_value || !price.value || price.value === price.offered_value) {
    return void 0;
  }
  return {
    currency: price.currency ?? "INR",
    value: price.value
  };
}
function translateImage(image) {
  if (!image) {
    return void 0;
  }
  return {
    url: image.url,
    width: image.width ? parseInt(image.width, 10) : void 0,
    height: image.height ? parseInt(image.height, 10) : void 0
  };
}
function translateImages(images) {
  if (!images || images.length === 0) {
    return [];
  }
  return images.map(translateImage).filter((img) => img !== void 0);
}
function translateLocation(location) {
  if (!location) {
    return void 0;
  }
  const gps = location.gps;
  const address = location.address;
  let latitude;
  let longitude;
  if (gps) {
    const parts = gps.split(",").map((s) => parseFloat(s.trim()));
    const lat = parts[0];
    const lng = parts[1];
    if (lat !== void 0 && !isNaN(lat)) latitude = lat;
    if (lng !== void 0 && !isNaN(lng)) longitude = lng;
  }
  return {
    latitude,
    longitude,
    city: address?.city,
    state: address?.state,
    country: address?.country,
    postalCode: address?.area_code,
    address: formatAddress(address)
  };
}
function translateRating(rating) {
  if (rating === void 0 || rating === 0) {
    return void 0;
  }
  return {
    value: rating,
    count: void 0
    // Beckn doesn't provide rating count
  };
}
function findCategoryName(categoryId, categories) {
  if (!categoryId || !categories) {
    return void 0;
  }
  const category = categories.find((c) => c.id === categoryId);
  return category?.descriptor?.name;
}
function formatAddress(address) {
  if (!address) {
    return void 0;
  }
  const parts = [
    address.door,
    address.building,
    address.street,
    address.locality,
    address.ward,
    address.city,
    address.state,
    address.country,
    address.area_code
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : void 0;
}

// src/translate/ucp-to-beckn.ts
function ucpToBecknIntent(query) {
  const intent = {};
  if (query.query || query.category) {
    intent.item = {
      descriptor: {
        name: query.query ?? ""
      }
    };
  }
  if (query.category) {
    intent.category = {
      descriptor: {
        name: query.category
      }
    };
  }
  if (query.location) {
    const location = query.location;
    let gps;
    if (location.latitude !== void 0 && location.longitude !== void 0) {
      gps = `${location.latitude},${location.longitude}`;
    }
    intent.fulfillment = {
      start: {
        location: {
          gps,
          address: {
            city: location.city,
            state: location.state,
            country: location.country,
            area_code: location.postalCode
          }
        }
      }
    };
    if (location.radius !== void 0 && gps && intent.fulfillment?.start?.location) {
      const radiusMeters = location.radius * 1e3;
      intent.fulfillment.start.location.circle = {
        gps,
        radius: {
          value: String(radiusMeters),
          unit: "m"
        }
      };
    }
  }
  if (query.priceRange) {
    if (!intent.item) {
      intent.item = {};
    }
    const { min, max } = query.priceRange;
    const minPrice = min !== void 0 ? String(min) : void 0;
    const maxPrice = max !== void 0 ? String(max) : void 0;
    intent.item.price = {
      currency: "INR",
      value: maxPrice ?? "0",
      minimum_value: minPrice,
      maximum_value: maxPrice
    };
  }
  if (query.minRating !== void 0) {
    if (!intent.item) {
      intent.item = {};
    }
    intent.item.tags = [
      {
        code: "min_rating",
        name: "Minimum Rating",
        display: true,
        list: [
          {
            code: "value",
            name: "Value",
            value: String(query.minRating)
          }
        ]
      }
    ];
  }
  if (query.filters) {
    if (!intent.item) {
      intent.item = {};
    }
    const existingTags = intent.item.tags ?? [];
    const filterTags = Object.entries(query.filters).map(([key, value]) => ({
      code: key,
      name: key,
      display: false,
      list: [
        {
          code: "value",
          name: "Value",
          value: String(value)
        }
      ]
    }));
    intent.item.tags = [...existingTags, ...filterTags];
  }
  return intent;
}

// src/translate/normalization.ts
function normalizePrice(value, currency = "INR") {
  if (value === null || value === void 0) {
    return { currency: "INR", value: "0" };
  }
  const valueStr = String(value).trim();
  const cleaned = valueStr.replace(/[₹$€£¥,]/g, "").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) {
    return { currency: "INR", value: "0" };
  }
  return {
    currency: currency.toUpperCase(),
    value: String(num)
  };
}
function normalizeRating(value, max = 5) {
  if (value === null || value === void 0) {
    return void 0;
  }
  if (typeof value !== "number" || isNaN(value) || value < 0) {
    return void 0;
  }
  if (typeof max !== "number" || isNaN(max) || max <= 0) {
    return void 0;
  }
  const clampedValue = Math.min(value, max);
  const normalizedValue = max === 5 ? clampedValue : clampedValue / max * 5;
  const rounded = Math.round(normalizedValue * 10) / 10;
  return { value: rounded };
}
function normalizePercentage(value, format = "percent") {
  if (value === null || value === void 0) {
    return 0;
  }
  let num;
  if (typeof value === "string") {
    const cleaned = value.replace(/%/g, "").trim();
    num = parseFloat(cleaned);
  } else {
    num = value;
  }
  if (isNaN(num)) {
    return 0;
  }
  if (format === "percent") {
    num = num / 100;
  }
  return Math.max(0, Math.min(1, num));
}
function parseDuration(duration) {
  if (!duration || typeof duration !== "string") {
    return 0;
  }
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
    seconds
  ] = match;
  let total = 0;
  if (years) total += parseInt(years, 10) * 365 * 24 * 60 * 60;
  if (months) total += parseInt(months, 10) * 30 * 24 * 60 * 60;
  if (days) total += parseInt(days, 10) * 24 * 60 * 60;
  if (hours) total += parseInt(hours, 10) * 60 * 60;
  if (minutes) total += parseInt(minutes, 10) * 60;
  if (seconds) total += parseInt(seconds, 10);
  return total;
}
function formatDuration(seconds) {
  if (seconds <= 0) {
    return "0 seconds";
  }
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor(seconds % (24 * 60 * 60) / (60 * 60));
  const minutes = Math.floor(seconds % (60 * 60) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  }
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  }
  if (secs > 0 && parts.length === 0) {
    parts.push(`${secs} second${secs !== 1 ? "s" : ""}`);
  }
  return parts.join(" ");
}

// src/http/client.ts
import axios from "axios";
var isRetryableError = (error) => {
  if (!error.response) return false;
  const status = error.response.status;
  return status >= 500 && status < 600;
};
function calculateBackoff(attempt, baseDelay) {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return exponentialDelay + jitter;
}
var ONDCClient = class {
  axios;
  subscriberId;
  privateKey;
  keyId;
  maxRetries;
  retryDelay;
  constructor(config) {
    this.subscriberId = config.subscriberId;
    this.privateKey = config.privateKey;
    this.keyId = config.keyId ?? "default-key";
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 100;
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 3e4,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
    });
  }
  /**
   * Execute request with retry logic
   * @param fn - Function that returns a Promise with the request
   * @returns Promise resolving to response data
   */
  async withRetry(fn) {
    let lastError;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        const axiosError = error;
        if (!isRetryableError(axiosError) || attempt === this.maxRetries) {
          throw error;
        }
        const delay = calculateBackoff(attempt, this.retryDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }
  /**
   * Make an authenticated POST request with retry support
   *
   * @param path - Request path (e.g., "/search")
   * @param body - Request body (will be JSON stringified)
   * @returns Promise resolving to response data
   *
   * @example
   * ```ts
   * const client = new ONDCClient({
   *   baseURL: 'https://gateway.ondc.org',
   *   subscriberId: 'ondc.example.com',
   *   privateKey: privateKey
   * });
   * const response = await client.post('/search', { intent: {...} });
   * ```
   */
  async post(path, body) {
    return this.withRetry(async () => {
      const bodyString = JSON.stringify(body);
      const created = (/* @__PURE__ */ new Date()).toISOString();
      const authRequest = {
        body: bodyString,
        created,
        keyId: this.keyId
      };
      const authHeader = await buildAuthHeader(
        this.subscriberId,
        this.privateKey,
        authRequest
      );
      const config = {
        headers: {
          Authorization: authHeader
        }
      };
      const response = await this.axios.post(path, body, config);
      return response.data;
    });
  }
  /**
   * Make an authenticated GET request with retry support
   *
   * @param path - Request path
   * @returns Promise resolving to response data
   */
  async get(path) {
    return this.withRetry(async () => {
      const created = (/* @__PURE__ */ new Date()).toISOString();
      const authRequest = {
        body: "",
        created,
        keyId: this.keyId
      };
      const authHeader = await buildAuthHeader(
        this.subscriberId,
        this.privateKey,
        authRequest
      );
      const config = {
        headers: {
          Authorization: authHeader
        }
      };
      const response = await this.axios.get(path, config);
      return response.data;
    });
  }
  /**
   * Update subscriber credentials
   *
   * @param subscriberId - New subscriber ID
   * @param privateKey - New private key
   */
  updateCredentials(subscriberId, privateKey) {
    this.subscriberId = subscriberId;
    this.privateKey = privateKey;
  }
  /**
   * Update key identifier
   *
   * @param keyId - New key identifier
   */
  updateKeyId(keyId) {
    this.keyId = keyId;
  }
  /**
   * Get the underlying Axios instance
   *
   * Useful for custom configurations or interceptors
   */
  getAxiosInstance() {
    return this.axios;
  }
};

// src/scoring/preferences.ts
var DEFAULT_WEIGHTS = {
  priceWeight: 0.3,
  distanceWeight: 0.2,
  ratingWeight: 0.25,
  deliveryWeight: 0.25,
  verifiedBonus: 0.1
};
var WEIGHT_KEYS = ["priceWeight", "distanceWeight", "ratingWeight", "deliveryWeight"];
function normalizeWeights(userWeights = {}) {
  const providedWeights = {};
  let providedSum = 0;
  let providedCount = 0;
  for (const key of WEIGHT_KEYS) {
    const value = userWeights[key];
    if (value !== void 0 && value >= 0) {
      providedWeights[key] = value;
      providedSum += value;
      providedCount++;
    }
  }
  const verifiedBonus = userWeights.verifiedBonus ?? DEFAULT_WEIGHTS.verifiedBonus;
  if (providedCount === 0) {
    return { ...DEFAULT_WEIGHTS, verifiedBonus };
  }
  const remainingCount = WEIGHT_KEYS.length - providedCount;
  const remainingWeight = Math.max(0, 1 - providedSum);
  const evenShare = remainingCount > 0 ? remainingWeight / remainingCount : 0;
  const result = {
    priceWeight: 0,
    distanceWeight: 0,
    ratingWeight: 0,
    deliveryWeight: 0,
    verifiedBonus
  };
  for (const key of WEIGHT_KEYS) {
    if (providedWeights[key] !== void 0) {
      result[key] = providedWeights[key];
    } else {
      result[key] = evenShare;
    }
  }
  if (providedCount === WEIGHT_KEYS.length && providedSum > 0 && Math.abs(providedSum - 1) > 1e-3) {
    for (const key of WEIGHT_KEYS) {
      result[key] = (providedWeights[key] ?? 0) / providedSum;
    }
  }
  return result;
}
function parsePrice(item) {
  const price = item.price;
  if (price.amount !== void 0) return price.amount;
  if (price.value !== void 0) return parseFloat(price.value);
  return void 0;
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRad(deg) {
  return deg * (Math.PI / 180);
}
function getItemLocation(item) {
  const location = item.location ?? item.provider.location;
  if (!location) return void 0;
  if (location.latitude !== void 0 && location.longitude !== void 0) {
    return { lat: location.latitude, lon: location.longitude };
  }
  return void 0;
}
function getDeliveryTimeMinutes(item) {
  const fulfillment = item.fulfillment?.[0];
  if (!fulfillment?.estimatedTime?.end) return void 0;
  const endTime = fulfillment.estimatedTime.end;
  const durationMatch = endTime.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (durationMatch) {
    const hours = parseInt(durationMatch[1] ?? "0", 10);
    const minutes = parseInt(durationMatch[2] ?? "0", 10);
    return hours * 60 + minutes;
  }
  const endDate = new Date(endTime);
  if (!isNaN(endDate.getTime())) {
    return Math.max(0, (endDate.getTime() - Date.now()) / 6e4);
  }
  return void 0;
}
function normalize(value, min, max, invert = false) {
  if (max === min) return invert ? 1 : 0.5;
  const normalized = (value - min) / (max - min);
  const clamped = Math.max(0, Math.min(1, normalized));
  return invert ? 1 - clamped : clamped;
}
function calculatePriceScore(item, context) {
  const price = parsePrice(item);
  if (price === void 0) return 0.5;
  const min = context.minPrice ?? price;
  const max = context.maxPrice ?? price;
  return normalize(price, min, max, true);
}
function calculateDistanceScore(item, context) {
  if (!context.userLocation?.latitude || !context.userLocation?.longitude) {
    return 0.5;
  }
  const itemLoc = getItemLocation(item);
  if (!itemLoc) return 0.5;
  const distance = calculateDistance(
    context.userLocation.latitude,
    context.userLocation.longitude,
    itemLoc.lat,
    itemLoc.lon
  );
  const maxDist = context.maxDistance ?? 50;
  return normalize(distance, 0, maxDist, true);
}
function calculateRatingScore(item) {
  const rating = item.rating?.value ?? item.provider.rating?.value;
  if (rating === void 0) return 0.5;
  const max = item.rating?.max ?? 5;
  return normalize(rating, 0, max, false);
}
function calculateDeliveryScore(item, context) {
  const deliveryTime = getDeliveryTimeMinutes(item);
  if (deliveryTime === void 0) return 0.5;
  const min = context.minDeliveryTime ?? 0;
  const max = context.maxDeliveryTime ?? 120;
  return normalize(deliveryTime, min, max, true);
}
function scoreItem(item, preferences = {}, context = {}) {
  const weights = normalizeWeights(preferences);
  const priceScore = calculatePriceScore(item, context);
  const distanceScore = calculateDistanceScore(item, context);
  const ratingScore = calculateRatingScore(item);
  const deliveryScore = calculateDeliveryScore(item, context);
  const score = weights.priceWeight * priceScore + weights.distanceWeight * distanceScore + weights.ratingWeight * ratingScore + weights.deliveryWeight * deliveryScore;
  if (item.provider.verified && weights.verifiedBonus > 0) {
    return Math.min(1, score + weights.verifiedBonus);
  }
  return score;
}
function buildScoringContext(items, userLocation) {
  const context = { userLocation };
  const prices = [];
  const distances = [];
  const deliveryTimes = [];
  for (const item of items) {
    const price = parsePrice(item);
    if (price !== void 0) prices.push(price);
    if (userLocation?.latitude !== void 0 && userLocation?.longitude !== void 0) {
      const itemLoc = getItemLocation(item);
      if (itemLoc) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          itemLoc.lat,
          itemLoc.lon
        );
        distances.push(distance);
      }
    }
    const deliveryTime = getDeliveryTimeMinutes(item);
    if (deliveryTime !== void 0) deliveryTimes.push(deliveryTime);
  }
  if (prices.length > 0) {
    context.minPrice = Math.min(...prices);
    context.maxPrice = Math.max(...prices);
  }
  if (distances.length > 0) {
    context.maxDistance = Math.max(...distances);
  }
  if (deliveryTimes.length > 0) {
    context.minDeliveryTime = Math.min(...deliveryTimes);
    context.maxDeliveryTime = Math.max(...deliveryTimes);
  }
  return context;
}
function scoreAndSortItems(items, preferences = {}, userLocation) {
  const context = buildScoringContext(items, userLocation);
  const scored = items.map((item) => ({
    ...item,
    _score: scoreItem(item, preferences, context)
  }));
  return scored.sort((a, b) => b._score - a._score);
}
export {
  ConfigValidationError,
  EnvVars,
  EnvironmentEnum,
  GatewayConfigSchema,
  MissingEnvVarError,
  ONDCClient,
  ONDCError,
  SignatureError,
  ValidationError,
  allMCPTools,
  becknToUcpCatalog,
  buildAuthHeader,
  buildScoringContext,
  checkEnvVars,
  formatDuration,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
  initCrypto,
  loadConfig,
  loadConfigWithOverrides,
  normalizePercentage,
  normalizePrice,
  normalizeRating,
  ondcCancelTool,
  ondcCheckoutTool,
  ondcSearchTool,
  ondcStatusTool,
  parseAuthHeader,
  parseDuration,
  scoreAndSortItems,
  scoreItem,
  signMessage,
  ucpToBecknIntent,
  verifyAuthHeader,
  verifySignature
};
//# sourceMappingURL=index.js.map