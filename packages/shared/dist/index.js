// src/types/mcp/schemas.ts
var ondcSearchTool = {
  name: "ondc_search",
  description: "Search for products and services on the ONDC network. Returns items matching category, location, and preferences.",
  inputSchema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        description: 'Product or service category to search (e.g., "grocery", "restaurant", "fashion")'
      },
      query: {
        type: "string",
        description: "Free-text search query for specific items or keywords"
      },
      location: {
        type: "object",
        description: "Search location for nearby providers",
        properties: {
          latitude: {
            type: "number",
            description: "Latitude coordinate",
            minimum: -90,
            maximum: 90
          },
          longitude: {
            type: "number",
            description: "Longitude coordinate",
            minimum: -180,
            maximum: 180
          },
          radius: {
            type: "number",
            description: "Search radius in meters (default: 5000)",
            minimum: 100,
            maximum: 5e4
          }
        },
        required: ["latitude", "longitude"]
      },
      preferences: {
        type: "object",
        description: "Search preferences for sorting and filtering",
        properties: {
          maxPrice: {
            type: "number",
            description: "Maximum price filter"
          },
          minRating: {
            type: "number",
            description: "Minimum rating filter (0-5)",
            minimum: 0,
            maximum: 5
          },
          sortBy: {
            type: "string",
            description: "Sort order for results",
            enum: ["price", "rating", "distance", "relevance"]
          }
        }
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 10)",
        minimum: 1,
        maximum: 100
      },
      expandSearch: {
        type: "boolean",
        description: "Include providers outside search radius (default: false)"
      }
    },
    required: ["category"]
  }
};
var ondcCheckoutTool = {
  name: "ondc_checkout",
  description: "Initiate checkout for selected items. Creates a session and returns payment details.",
  inputSchema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        description: "Items to checkout",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Item ID from search results"
            },
            providerId: {
              type: "string",
              description: "Provider/seller ID"
            },
            quantity: {
              type: "number",
              description: "Quantity to order",
              minimum: 1
            }
          },
          required: ["id", "providerId", "quantity"]
        }
      },
      buyer: {
        type: "object",
        description: "Buyer information for delivery",
        properties: {
          name: {
            type: "string",
            description: "Buyer full name"
          },
          phone: {
            type: "string",
            description: "Contact phone number"
          },
          email: {
            type: "string",
            description: "Contact email (optional)",
            format: "email"
          },
          address: {
            type: "object",
            description: "Delivery address",
            properties: {
              street: {
                type: "string",
                description: "Street address"
              },
              city: {
                type: "string",
                description: "City name"
              },
              state: {
                type: "string",
                description: "State name"
              },
              postalCode: {
                type: "string",
                description: "Postal or ZIP code"
              },
              country: {
                type: "string",
                description: "Country name (optional)"
              }
            },
            required: ["street", "city", "state", "postalCode"]
          }
        },
        required: ["name", "phone", "address"]
      },
      fulfillmentOptionId: {
        type: "string",
        description: "Fulfillment option ID (optional, uses default if not specified)"
      },
      instructions: {
        type: "string",
        description: "Special delivery instructions (optional)"
      }
    },
    required: ["items", "buyer"]
  }
};
var ondcStatusTool = {
  name: "ondc_status",
  description: "Check the status of an existing ONDC order or session. Returns current status, tracking, and updates.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session or order ID to check"
      }
    },
    required: ["sessionId"]
  }
};
var ondcCancelTool = {
  name: "ondc_cancel",
  description: "Cancel an existing ONDC order or session. Returns cancellation status and refund details.",
  inputSchema: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "Session or order ID to cancel"
      },
      reason: {
        type: "string",
        description: "Reason for cancellation"
      }
    },
    required: ["sessionId", "reason"]
  }
};
var allMCPTools = [
  ondcSearchTool,
  ondcCheckoutTool,
  ondcStatusTool,
  ondcCancelTool
];

// src/crypto/keys.ts
import _sodium from "libsodium-wrappers";
async function initCrypto() {
  await _sodium.ready;
}
async function getSodium() {
  await _sodium.ready;
  return _sodium;
}
async function generateKeyPair() {
  const sodium = await getSodium();
  const keyPair = sodium.crypto_sign_keypair();
  const publicKey = sodium.to_base64(
    keyPair.publicKey,
    sodium.base64_variants.ORIGINAL
  );
  const privateKey = sodium.to_base64(
    keyPair.privateKey,
    sodium.base64_variants.ORIGINAL
  );
  return {
    publicKey,
    privateKey
  };
}
async function generateKeyPairFromSeed(seed) {
  const sodium = await getSodium();
  const seedBytes = sodium.from_base64(
    seed,
    sodium.base64_variants.ORIGINAL
  );
  const keyPair = sodium.crypto_sign_seed_keypair(seedBytes);
  const publicKey = sodium.to_base64(
    keyPair.publicKey,
    sodium.base64_variants.ORIGINAL
  );
  const privateKey = sodium.to_base64(
    keyPair.privateKey,
    sodium.base64_variants.ORIGINAL
  );
  return {
    publicKey,
    privateKey
  };
}
async function getPublicKey(privateKey) {
  const sodium = await getSodium();
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );
  const publicKeyBytes = privateKeyBytes.subarray(32);
  return sodium.to_base64(
    publicKeyBytes,
    sodium.base64_variants.ORIGINAL
  );
}

// src/crypto/signing.ts
import _sodium2 from "libsodium-wrappers";
async function getSodium2() {
  await _sodium2.ready;
  return _sodium2;
}
async function signMessage(message, privateKey) {
  const sodium = await getSodium2();
  const messageBytes = sodium.from_string(message);
  const privateKeyBytes = sodium.from_base64(
    privateKey,
    sodium.base64_variants.ORIGINAL
  );
  const signatureBytes = sodium.crypto_sign_detached(
    messageBytes,
    privateKeyBytes
  );
  return sodium.to_base64(
    signatureBytes,
    sodium.base64_variants.ORIGINAL
  );
}
function verifySignature(message, signature, publicKey) {
  try {
    const sodium = _sodium2;
    const messageBytes = sodium.from_string(message);
    const signatureBytes = sodium.from_base64(
      signature,
      sodium.base64_variants.ORIGINAL
    );
    const publicKeyBytes = sodium.from_base64(
      publicKey,
      sodium.base64_variants.ORIGINAL
    );
    return sodium.crypto_sign_verify_detached(
      signatureBytes,
      messageBytes,
      publicKeyBytes
    );
  } catch {
    return false;
  }
}

// src/crypto/auth.ts
import { createHash } from "crypto";
function sha256Base64(input) {
  const hash = createHash("sha256");
  hash.update(input);
  return hash.digest("base64");
}
async function buildAuthHeader(subscriberId, privateKey, request) {
  const hashBase64 = sha256Base64(request.body);
  const signingString = `${hashBase64}.${request.created}`;
  const signature = await signMessage(signingString, privateKey);
  const keyIdPart = `${subscriberId}|${request.keyId}|ed25519`;
  return `Signature keyId="${keyIdPart}",signature="${signature}",created="${request.created}"`;
}
function parseAuthHeader(header) {
  if (!header.startsWith("Signature ")) {
    return null;
  }
  const pairsStr = header.slice("Signature ".length);
  const pairs = {};
  const regex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(pairsStr)) !== null) {
    const key = match[1];
    const value = match[2];
    if (key !== void 0 && value !== void 0) {
      pairs[key] = value;
    }
  }
  if (!pairs.keyId || !pairs.signature || !pairs.created) {
    return null;
  }
  const keyIdParts = pairs.keyId.split("|");
  if (keyIdParts.length !== 3) {
    return null;
  }
  const [subscriberId, keyId, algorithm] = keyIdParts;
  if (algorithm !== "ed25519") {
    return null;
  }
  return {
    subscriberId: subscriberId ?? "",
    keyId: keyId ?? "",
    algorithm,
    signature: pairs.signature,
    created: pairs.created
  };
}
async function verifyAuthHeader(header, body, publicKey) {
  const parsed = parseAuthHeader(header);
  if (!parsed) {
    return {
      subscriberId: "",
      keyId: "",
      valid: false
    };
  }
  const hashBase64 = sha256Base64(body);
  const signingString = `${hashBase64}.${parsed.created}`;
  const isValid = verifySignature(signingString, parsed.signature, publicKey);
  return {
    subscriberId: parsed.subscriberId,
    keyId: parsed.keyId,
    valid: isValid
  };
}

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
function isRetryableError(error) {
  if (!error.response) return false;
  const status = error.response.status;
  return status >= 500 && status < 600;
}
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
   * Make authenticated POST request with retry
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
   * Make authenticated GET request with retry
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

// src/errors/index.ts
var ONDCError = class extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "ONDCError";
  }
};
var SignatureError = class extends ONDCError {
  constructor(message, details) {
    super(message, "SIGNATURE_ERROR", details);
    this.name = "SignatureError";
  }
};
var ValidationError = class extends ONDCError {
  constructor(message, details) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
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

// src/design-system/tokens.ts
var COLORS = {
  // Backgrounds - Clean, unobtrusive
  bgPage: "#ffffff",
  // Pure white page
  bgCard: "#ffffff",
  // White cards
  bgSubtle: "rgb(238, 238, 238)",
  // Gray track (DRAMS)
  bgHover: "rgb(232, 232, 232)",
  // Gray hover (DRAMS)
  // Text - Clear hierarchy
  textPrimary: "#333",
  // DRAMS primary text
  textSecondary: "#666",
  // DRAMS secondary text
  textMuted: "#999",
  // DRAMS muted text
  textDisabled: "#ccc",
  // Disabled state
  // Borders - Minimal, unobtrusive
  border: "rgba(0,0,0,0.08)",
  // Subtle border
  borderSubtle: "rgba(0,0,0,0.04)",
  // Very subtle
  // Semantic (Honest, Thorough)
  success: "#10b981",
  // emerald-500
  warning: "#f59e0b",
  // amber-500
  error: "#ef4444",
  // red-500
  info: "#3b82f6"
  // blue-500
};
var DRAMS = {
  // Signature orange - primary action color
  orange: "rgb(255, 97, 26)",
  orangeHighlight: "rgb(255, 150, 102)",
  // Gray tones for tracks and backgrounds
  grayTrack: "rgb(238, 238, 238)",
  grayHover: "rgb(232, 232, 232)",
  // Text colors
  textDark: "#333",
  textLight: "#999",
  // Font family
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
};
var TRANSITIONS = {
  standard: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  hover: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
  bounce: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
};
var SPACING = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
  "4xl": "64px"
};
var TYPOGRAPHY = {
  // Display - DRAMS uses light weight (300), not bold
  h1: { fontSize: "32px", fontWeight: 300, letterSpacing: "-0.5px", lineHeight: 1.2 },
  h2: { fontSize: "28px", fontWeight: 300, letterSpacing: "-0.5px", lineHeight: 1.3 },
  h3: { fontSize: "20px", fontWeight: 400, letterSpacing: "-0.25px", lineHeight: 1.4 },
  h4: { fontSize: "18px", fontWeight: 500, letterSpacing: "0", lineHeight: 1.4 },
  // Body
  body: { fontSize: "15px", fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontSize: "13px", fontWeight: 400, lineHeight: 1.4 },
  // Label - DRAMS uppercase style
  label: { fontSize: "13px", fontWeight: 500, lineHeight: 1.5, textTransform: "uppercase", letterSpacing: "1px" },
  // Navigation
  nav: { fontSize: "14px", fontWeight: 400, lineHeight: 1.5 },
  navActive: { fontSize: "14px", fontWeight: 500, lineHeight: 1.5 }
};
var SHADOWS = {
  sm: "0 1px 2px rgba(0,0,0,0.05)",
  md: "0 4px 6px -1px rgba(0,0,0,0.1)",
  lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
  xl: "0 20px 25px -5px rgba(0,0,0,0.1)"
};
var RADIUS = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  // DRAMS pill and circle shapes
  pill: "48px",
  circle: "50%",
  card: "20px"
};
var BUTTON = {
  primary: {
    background: "radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)",
    color: "white",
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: "pointer",
    transition: TRANSITIONS.standard,
    boxShadow: "rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)"
  },
  secondary: {
    background: DRAMS.grayTrack,
    color: DRAMS.textDark,
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: "pointer",
    transition: TRANSITIONS.hover
  },
  danger: {
    background: COLORS.error,
    color: "white",
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: "pointer",
    transition: TRANSITIONS.hover
  }
};
var INPUT = {
  base: {
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: DRAMS.textDark,
    background: DRAMS.grayTrack,
    transition: TRANSITIONS.standard
  },
  focus: {
    outline: "none",
    background: DRAMS.grayHover,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  error: {
    background: "#fef2f2"
  }
};
var NAV = {
  link: {
    color: DRAMS.textDark,
    textDecoration: "none",
    padding: `${SPACING.md} ${SPACING.xl}`,
    borderRadius: RADIUS.pill,
    fontSize: TYPOGRAPHY.nav.fontSize,
    fontWeight: TYPOGRAPHY.nav.fontWeight,
    transition: TRANSITIONS.hover,
    background: "transparent"
  },
  linkActive: {
    background: DRAMS.orange,
    color: "white",
    fontWeight: TYPOGRAPHY.navActive.fontWeight
  },
  linkHover: {
    background: DRAMS.grayTrack,
    color: DRAMS.textDark
  }
};
var CARD = {
  base: {
    backgroundColor: "white",
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    border: "none",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  hover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
  }
};
var EMPTY_STATE = {
  container: {
    textAlign: "center",
    padding: SPACING["3xl"],
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    margin: `0 0 ${SPACING.md} 0`
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    margin: `0 0 ${SPACING.xl} 0`
  },
  cta: {
    ...BUTTON.primary,
    marginTop: SPACING.xl
  }
};
var LOADING = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING["3xl"],
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body.fontSize
  },
  spinner: {
    border: "3px solid #e2e8f0",
    borderTop: "3px solid COLORS.info"
  }
};
var ERROR = {
  container: {
    padding: `${SPACING.md} ${SPACING.lg}`
  },
  alert: {
    backgroundColor: "#fef2f2",
    border: `1px solid #fecaca`,
    color: COLORS.error
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.error,
    fontWeight: 600,
    marginBottom: SPACING.xs
  },
  message: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md
  },
  actions: {
    marginTop: SPACING.lg
  }
};
var APP = {
  headerHeight: "64px",
  maxWidth: "1400px",
  contentMaxWidth: "1200px"
};
var GRID = {
  // Container with max-width and horizontal centering
  container: {
    width: "100%",
    maxWidth: APP.maxWidth,
    margin: "0 auto",
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.xl
  },
  // Container with wider padding for desktop
  containerWide: {
    width: "100%",
    maxWidth: APP.maxWidth,
    margin: "0 auto",
    paddingLeft: "80px",
    paddingRight: "80px"
  },
  // Grid gaps using SPACING scale
  gap: {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
    "2xl": SPACING["2xl"],
    "3xl": SPACING["3xl"]
  },
  // Common grid patterns
  twoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: SPACING.xl
  },
  twoColumnsWide: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: SPACING.xl
  },
  threeColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: SPACING.xl
  },
  fourColumns: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: SPACING.xl
  },
  // Auto-fill grid for responsive cards
  autoFill: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: SPACING.xl
  }
};
var LAYOUT = {
  // Full page container
  page: {
    height: "100%",
    width: "100%",
    backgroundColor: "#ffffff"
  },
  // Page with gray background
  pageGray: {
    height: "100%",
    width: "100%",
    backgroundColor: DRAMS.grayTrack
  },
  // Content container with horizontal padding
  content: {
    padding: `0 ${SPACING.xl}`,
    maxWidth: "100%"
  },
  // Content with wide padding
  contentWide: {
    padding: `0 80px`,
    maxWidth: "100%"
  },
  // Centered content container
  centered: {
    maxWidth: APP.contentMaxWidth,
    margin: "0 auto"
  },
  // Page header section
  pageHeader: {
    padding: `${SPACING.xl} 0`,
    marginBottom: SPACING.xl,
    background: DRAMS.grayTrack
  },
  // Grid layouts
  gridTwoColumns: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: SPACING.xl
  },
  gridFilters: {
    display: "flex",
    gap: SPACING["2xl"],
    alignItems: "flex-start",
    padding: `${SPACING.xl} 0`
  }
};

// src/design-system/components.ts
var PILL_BUTTON = {
  orange: {
    background: "radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: TRANSITIONS.standard,
    boxShadow: "rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)"
  },
  gray: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    color: DRAMS.textDark,
    border: "none",
    cursor: "pointer",
    transition: TRANSITIONS.hover
  }
};
var TEXT_BOX = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.lg}`,
    transition: TRANSITIONS.standard,
    border: "none",
    fontSize: TYPOGRAPHY.body.fontSize,
    color: DRAMS.textDark
  },
  focus: {
    background: DRAMS.grayHover,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    outline: "none"
  },
  error: {
    background: "#fef2f2"
  }
};
var DRAMS_CARD = {
  base: {
    background: "white",
    borderRadius: RADIUS.card,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    transition: "transform 0.2s, box-shadow 0.2s"
  },
  hover: {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
  }
};
var TOGGLE_SWITCH = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    width: "48px",
    height: "28px",
    position: "relative",
    cursor: "pointer",
    transition: TRANSITIONS.standard
  },
  trackActive: {
    background: DRAMS.orange
  },
  thumb: {
    position: "absolute",
    top: "2px",
    left: "2px",
    width: "24px",
    height: "24px",
    borderRadius: RADIUS.circle,
    background: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: TRANSITIONS.standard
  },
  thumbActive: {
    transform: "translateX(20px)"
  },
  ledIndicator: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: DRAMS.orange,
    boxShadow: "0 0 6px rgba(255, 97, 26, 0.6)"
  }
};
var SLIDER = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    height: "8px",
    position: "relative"
  },
  fill: {
    background: DRAMS.orange,
    height: "100%",
    borderRadius: RADIUS.pill
  },
  thumb: {
    position: "absolute",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "24px",
    height: "24px",
    borderRadius: RADIUS.circle,
    background: "radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)",
    boxShadow: "0 2px 8px rgba(255, 97, 26, 0.4)",
    cursor: "grab",
    transition: TRANSITIONS.hover
  },
  thumbHover: {
    transform: "translate(-50%, -50%) scale(1.1)",
    boxShadow: "0 4px 12px rgba(255, 97, 26, 0.5)"
  }
};
var SELECT_BOX = {
  base: {
    ...TEXT_BOX.track,
    appearance: "none",
    paddingRight: SPACING.xl,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `right ${SPACING.md} center`,
    cursor: "pointer"
  },
  focus: TEXT_BOX.focus
};
var QUANTITY_CONTROL = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: SPACING.sm,
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.xs} ${SPACING.md}`
  },
  button: {
    width: "28px",
    height: "28px",
    borderRadius: RADIUS.circle,
    border: "none",
    background: "white",
    color: DRAMS.textDark,
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: TRANSITIONS.hover,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },
  buttonActive: {
    background: DRAMS.orange,
    color: "white"
  },
  value: {
    ...TYPOGRAPHY.label,
    minWidth: "24px",
    textAlign: "center"
  }
};
var BADGE = {
  base: {
    display: "inline-flex",
    alignItems: "center",
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.pill,
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    textTransform: "capitalize"
  },
  success: {
    background: "#f0fdf4",
    color: "#10b981"
  },
  warning: {
    background: "#fef3c7",
    color: "#f59e0b"
  },
  error: {
    background: "#fef2f2",
    color: "#ef4444"
  },
  info: {
    background: "#eff6ff",
    color: "#3b82f6"
  }
};
var DRAMS_EMPTY_STATE = {
  container: {
    textAlign: "center",
    padding: `${SPACING["3xl"]} ${SPACING.xl}`,
    background: "white",
    borderRadius: RADIUS.card
  },
  icon: {
    width: "64px",
    height: "64px",
    margin: `0 auto ${SPACING.lg}`,
    opacity: 0.3
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: DRAMS.textDark,
    marginBottom: SPACING.sm
  },
  message: {
    ...TYPOGRAPHY.body,
    color: DRAMS.textLight,
    marginBottom: SPACING.xl
  },
  cta: {
    ...PILL_BUTTON.orange,
    marginTop: SPACING.lg
  }
};

// src/design-system/components/ProductCard.tsx
import { useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
var CARD_STYLE = {
  background: "white",
  borderRadius: RADIUS.card,
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer"
};
var CARD_HOVER_STYLE = {
  transform: "translateY(-4px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
};
var IMAGE_STYLE = {
  width: "100%",
  height: "180px",
  background: "linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative"
};
var BADGE_STYLE = {
  position: "absolute",
  top: "12px",
  left: "12px",
  padding: "6px 12px",
  background: DRAMS.orange,
  color: "white",
  fontSize: TYPOGRAPHY.bodySmall.fontSize,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  borderRadius: "20px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};
var PLACEHOLDER_STYLE = {
  width: "80px",
  height: "80px",
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  borderRadius: RADIUS.circle,
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 4px 12px ${DRAMS.orange}33`
};
var DETAILS_STYLE = {
  padding: SPACING.xl
};
var NAME_STYLE = {
  ...TYPOGRAPHY.h4,
  color: DRAMS.textDark,
  marginBottom: SPACING.sm
};
var CATEGORY_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  marginBottom: SPACING.lg
};
var FOOTER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};
var PRICE_STYLE = {
  ...TYPOGRAPHY.h3,
  color: DRAMS.textDark
};
var ADD_BUTTON_STYLE = {
  width: "44px",
  height: "44px",
  borderRadius: RADIUS.circle,
  border: "none",
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.2s ease",
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px ${DRAMS.orange}4d`
};
var ADD_BUTTON_HOVER_STYLE = {
  transform: "scale(1.05)"
};
var ADD_BUTTON_ACTIVE_STYLE = {
  transform: "scale(0.95)"
};
var ADD_BUTTON_DISABLED_STYLE = {
  opacity: 0.5,
  cursor: "not-allowed"
};
function DramsProductCard({
  name,
  category,
  price,
  image,
  badge,
  rating: _rating,
  onAdd,
  onClick,
  isAdding = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const handleCardClick = () => {
    if (!isAdding) onClick?.();
  };
  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isAdding) onAdd?.();
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        ...CARD_STYLE,
        ...isHovered ? CARD_HOVER_STYLE : {}
      },
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: handleCardClick,
      children: [
        /* @__PURE__ */ jsxs("div", { style: IMAGE_STYLE, children: [
          badge && /* @__PURE__ */ jsx("span", { style: BADGE_STYLE, children: badge }),
          image ? /* @__PURE__ */ jsx("img", { src: image, alt: name, style: { width: "100%", height: "100%", objectFit: "cover" } }) : /* @__PURE__ */ jsx("div", { style: PLACEHOLDER_STYLE })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: DETAILS_STYLE, children: [
          /* @__PURE__ */ jsx("h3", { style: NAME_STYLE, children: name }),
          category && /* @__PURE__ */ jsx("div", { style: CATEGORY_STYLE, children: category }),
          /* @__PURE__ */ jsxs("div", { style: FOOTER_STYLE, children: [
            /* @__PURE__ */ jsx("span", { style: PRICE_STYLE, children: price }),
            onAdd && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleAdd,
                disabled: isAdding,
                onMouseEnter: () => setIsButtonHovered(true),
                onMouseLeave: () => setIsButtonHovered(false),
                onMouseDown: () => setIsButtonActive(true),
                onMouseUp: () => setIsButtonActive(false),
                style: {
                  ...ADD_BUTTON_STYLE,
                  ...isButtonHovered ? ADD_BUTTON_HOVER_STYLE : {},
                  ...isButtonActive ? ADD_BUTTON_ACTIVE_STYLE : {},
                  ...isAdding ? ADD_BUTTON_DISABLED_STYLE : {}
                },
                "aria-label": "Add to cart",
                children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 256 256", fill: "white", style: { pointerEvents: "none" }, children: /* @__PURE__ */ jsx("path", { d: "M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" }) })
              }
            )
          ] })
        ] })
      ]
    }
  );
}

// src/design-system/components/FlipCard.tsx
import { useState as useState2 } from "react";
import React from "react";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var CONTAINER_STYLE = {
  perspective: "1000px",
  width: "100%"
};
var CARD_STYLE2 = {
  position: "relative",
  width: "100%",
  transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  transformStyle: "preserve-3d",
  cursor: "pointer"
};
var FACE_STYLE = {
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  borderRadius: RADIUS.card,
  overflow: "hidden",
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
};
var FRONT_STYLE = {
  ...FACE_STYLE,
  background: "white"
};
var BACK_STYLE = {
  ...FACE_STYLE,
  background: DRAMS.grayTrack,
  transform: "rotateY(180deg)",
  padding: SPACING.xl,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};
var HINT_STYLE = {
  textAlign: "center",
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  padding: SPACING.lg,
  background: DRAMS.grayTrack
};
var SPEC_STYLE = {
  display: "flex",
  alignItems: "center",
  gap: SPACING.md,
  padding: `${SPACING.sm} 0`
};
var SPEC_DOT_STYLE = {
  width: "8px",
  height: "8px",
  borderRadius: RADIUS.circle,
  background: DRAMS.orange,
  flexShrink: 0
};
var SPEC_TEXT_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textDark
};
function FlipCardFront({ title, subtitle, stats, hint = "Click to see specs" }) {
  return /* @__PURE__ */ jsxs2(React.Fragment, { children: [
    title || subtitle || stats ? /* @__PURE__ */ jsxs2("div", { style: { padding: SPACING.lg }, children: [
      title && /* @__PURE__ */ jsx2("h3", { style: { ...TYPOGRAPHY.h4, color: DRAMS.textDark, marginBottom: SPACING.xs }, children: title }),
      subtitle && /* @__PURE__ */ jsx2("div", { style: { ...TYPOGRAPHY.bodySmall, color: DRAMS.textLight, marginBottom: SPACING.sm }, children: subtitle })
    ] }) : null,
    stats && /* @__PURE__ */ jsx2("div", { style: { padding: `0 ${SPACING.lg} ${SPACING.lg}` }, children: stats.map((stat, index) => /* @__PURE__ */ jsxs2(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          padding: `${SPACING.md} 0`,
          borderBottom: index < stats.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none"
        },
        children: [
          /* @__PURE__ */ jsx2("span", { style: { ...TYPOGRAPHY.body, color: DRAMS.textLight }, children: stat.label }),
          /* @__PURE__ */ jsx2("span", { style: { ...TYPOGRAPHY.body, fontWeight: 500, color: DRAMS.textDark }, children: stat.value })
        ]
      },
      index
    )) }),
    /* @__PURE__ */ jsx2("div", { style: HINT_STYLE, children: hint })
  ] });
}
function FlipCardBack({ title = "Specifications", specs }) {
  return /* @__PURE__ */ jsxs2(React.Fragment, { children: [
    title && /* @__PURE__ */ jsx2("h3", { style: { ...TYPOGRAPHY.h4, color: DRAMS.textDark, marginBottom: SPACING.lg, textAlign: "center" }, children: title }),
    specs && /* @__PURE__ */ jsx2("div", { children: specs.map((spec, index) => /* @__PURE__ */ jsxs2("div", { style: SPEC_STYLE, children: [
      /* @__PURE__ */ jsx2("div", { style: SPEC_DOT_STYLE }),
      /* @__PURE__ */ jsxs2("span", { style: SPEC_TEXT_STYLE, children: [
        spec.label,
        ": ",
        spec.value
      ] })
    ] }, index)) })
  ] });
}
function DramsFlipCard({ front, back, height = 240, onFlipChange }) {
  const [isFlipped, setIsFlipped] = useState2(false);
  const [isFlipping, setIsFlipping] = useState2(false);
  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    const newFlippedState = !isFlipped;
    setIsFlipped(newFlippedState);
    onFlipChange?.(newFlippedState);
    setTimeout(() => setIsFlipping(false), 600);
  };
  return /* @__PURE__ */ jsx2("div", { style: { ...CONTAINER_STYLE, height: `${height}px` }, children: /* @__PURE__ */ jsxs2(
    "div",
    {
      style: {
        ...CARD_STYLE2,
        transform: isFlipped ? "rotateY(180deg)" : "none",
        pointerEvents: isFlipping ? "none" : "auto"
      },
      onClick: handleFlip,
      children: [
        /* @__PURE__ */ jsx2("div", { style: { ...FRONT_STYLE, height: `${height}px` }, children: front }),
        /* @__PURE__ */ jsx2("div", { style: { ...BACK_STYLE, height: `${height}px` }, children: back })
      ]
    }
  ) });
}

// src/design-system/components/AddButton.tsx
import { useState as useState3 } from "react";
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var SIZE_STYLES = {
  sm: { padding: "8px 16px", fontSize: TYPOGRAPHY.bodySmall.fontSize },
  md: { padding: "12px 20px", fontSize: TYPOGRAPHY.label.fontSize },
  lg: { padding: "16px 24px", fontSize: TYPOGRAPHY.body.fontSize }
};
var BASE_STYLE = {
  border: "none",
  borderRadius: RADIUS.pill,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: SPACING.sm,
  transition: "all 0.2s ease",
  fontFamily: DRAMS.fontFamily,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  textDecoration: "none"
};
var PRIMARY_STYLE = {
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  color: "white",
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px ${DRAMS.orange}4d`
};
var SECONDARY_STYLE = {
  background: DRAMS.grayTrack,
  color: DRAMS.textDark
};
var DANGER_STYLE = {
  background: "#ef4444",
  color: "white"
};
var HOVER_SCALE = 1.05;
var ACTIVE_SCALE = 0.95;
function DramsAddButton({
  children,
  onClick,
  disabled: disabled2 = false,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false
}) {
  const [isHovered, setIsHovered] = useState3(false);
  const [isActive, setIsActive] = useState3(false);
  const variantStyle = variant === "primary" ? PRIMARY_STYLE : variant === "danger" ? DANGER_STYLE : SECONDARY_STYLE;
  const sizeStyle = SIZE_STYLES[size];
  return /* @__PURE__ */ jsx3(
    "button",
    {
      onClick,
      disabled: disabled2 || loading,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onMouseDown: () => setIsActive(true),
      onMouseUp: () => setIsActive(false),
      style: {
        ...BASE_STYLE,
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? "100%" : "auto",
        opacity: disabled2 ? 0.5 : 1,
        cursor: disabled2 ? "not-allowed" : "pointer",
        transform: isHovered && !disabled2 ? `scale(${HOVER_SCALE})` : isActive ? `scale(${ACTIVE_SCALE})` : "none",
        pointerEvents: disabled2 || loading ? "none" : "auto"
      },
      children: loading ? /* @__PURE__ */ jsx3(Fragment, { children: /* @__PURE__ */ jsxs3(
        "svg",
        {
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          style: { animation: "spin 1s linear infinite" },
          children: [
            /* @__PURE__ */ jsx3(
              "path",
              {
                d: "M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4m-2.83 6.17l-2.83 2.83m8.48-8.48l-2.83-2.83",
                style: { stroke: "currentColor" }
              }
            ),
            /* @__PURE__ */ jsx3("style", { children: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          ` })
          ]
        }
      ) }) : children
    }
  );
}

// src/design-system/components/AgentChat.tsx
import { useState as useState4, useRef, useEffect, useCallback } from "react";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var STORAGE_KEY = "ondc-session-id";
var CHAT_CONTAINER_STYLE = (height) => ({
  ...CARD.base,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  height: height || "600px",
  overflow: "hidden"
});
var HEADER_STYLE = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: `${SPACING.md} ${SPACING.xl}`,
  borderBottom: `1px solid ${DRAMS.grayTrack}`,
  backgroundColor: "#ffffff"
};
var HEADER_TITLE_STYLE = {
  ...TYPOGRAPHY.label,
  color: DRAMS.textDark,
  margin: 0
};
var SESSION_ID_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight
};
var MESSAGES_CONTAINER_STYLE = {
  flex: 1,
  overflowY: "auto",
  padding: SPACING.xl,
  display: "flex",
  flexDirection: "column",
  gap: SPACING.md
};
var USER_MESSAGE_STYLE = {
  alignSelf: "flex-end",
  maxWidth: "70%"
};
var USER_BUBBLE_STYLE = {
  backgroundColor: DRAMS.orange,
  color: "white",
  padding: `${SPACING.sm} ${SPACING.lg}`,
  borderRadius: RADIUS.lg,
  ...TYPOGRAPHY.body
};
var ASSISTANT_MESSAGE_STYLE = {
  alignSelf: "flex-start",
  maxWidth: "70%"
};
var ASSISTANT_BUBBLE_STYLE = {
  backgroundColor: DRAMS.grayTrack,
  color: DRAMS.textDark,
  padding: `${SPACING.sm} ${SPACING.lg}`,
  borderRadius: RADIUS.lg,
  ...TYPOGRAPHY.body
};
var TYPING_INDICATOR_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  padding: `${SPACING.sm} ${SPACING.md}`,
  backgroundColor: DRAMS.grayTrack,
  borderRadius: RADIUS.pill,
  alignSelf: "flex-start"
};
var INPUT_CONTAINER_STYLE = {
  padding: SPACING.lg,
  borderTop: `1px solid ${DRAMS.grayTrack}`,
  display: "flex",
  gap: SPACING.md,
  alignItems: "center"
};
var INPUT_STYLE = {
  flex: 1,
  border: "none",
  borderRadius: RADIUS.pill,
  padding: `${SPACING.md} ${SPACING.xl}`,
  fontSize: TYPOGRAPHY.body.fontSize,
  color: DRAMS.textDark,
  backgroundColor: DRAMS.grayTrack,
  fontFamily: DRAMS.fontFamily,
  transition: TRANSITIONS.standard
};
var SEND_BUTTON_STYLE = (disabled2) => ({
  ...BUTTON.primary,
  padding: `${SPACING.md} ${SPACING.xl}`,
  opacity: disabled2 ? 0.5 : 1,
  cursor: disabled2 ? "not-allowed" : "pointer"
});
var EMPTY_STATE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  textAlign: "center",
  padding: SPACING["3xl"]
};
var ERROR_MESSAGE_STYLE = {
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#dc2626",
  padding: `${SPACING.sm} ${SPACING.md}`,
  borderRadius: RADIUS.md,
  ...TYPOGRAPHY.bodySmall,
  alignSelf: "flex-start"
};
function getSharedSessionId() {
  let sessionId = localStorage.getItem(STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, sessionId);
  }
  return sessionId;
}
function MessageBubble({ message }) {
  if (message.type === "user") {
    return /* @__PURE__ */ jsx4("div", { style: USER_MESSAGE_STYLE, children: /* @__PURE__ */ jsx4("div", { style: USER_BUBBLE_STYLE, children: message.content }) });
  }
  if (message.type === "result" && message.subtype === "error_during_execution") {
    return /* @__PURE__ */ jsx4("div", { style: ERROR_MESSAGE_STYLE, children: message.errors?.join(", ") || message.error || "An error occurred" });
  }
  return /* @__PURE__ */ jsx4("div", { style: ASSISTANT_MESSAGE_STYLE, children: /* @__PURE__ */ jsx4("div", { style: ASSISTANT_BUBBLE_STYLE, children: message.content || message.data?.text || JSON.stringify(message.data) }) });
}
async function processStream(reader, onMessage, onComplete, onError) {
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === "result" && data.subtype === "success") {
          onComplete();
        } else if (data.type === "result" && data.subtype === "error_during_execution") {
          onError(data);
          break;
        } else {
          onMessage(data);
        }
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    }
  }
}
var API_BASE = "http://localhost:3001";
function AgentChat({
  endpoint,
  placeholder = "Type your message...",
  title = "Agent Chat",
  sessionId: initialSessionId = "",
  onMessage,
  height,
  showEmptyState = true,
  emptyStateMessage = "Start a conversation with the AI agent"
}) {
  const [messages, setMessages] = useState4([]);
  const [input, setInput] = useState4("");
  const [isLoading, setIsLoading] = useState4(false);
  const [sessionId] = useState4(initialSessionId || getSharedSessionId());
  const messagesEndRef = useRef(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  const sendMessageWithPrompt = useCallback(
    async (prompt) => {
      if (!prompt.trim() || isLoading) return;
      const userMessage = {
        type: "user",
        content: prompt,
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, sessionId, context: {} })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");
        await processStream(
          reader,
          (data) => {
            setMessages((prev) => [...prev, data]);
            onMessage?.(data);
          },
          () => {
            setIsLoading(false);
          },
          (error) => {
            setMessages((prev) => [...prev, error]);
            setIsLoading(false);
          }
        );
      } catch (error) {
        const errorMessage = {
          type: "result",
          subtype: "error_during_execution",
          errors: [error instanceof Error ? error.message : "Unknown error"]
        };
        setMessages((prev) => [...prev, errorMessage]);
        onMessage?.(errorMessage);
        setIsLoading(false);
      }
    },
    [endpoint, isLoading, sessionId, onMessage]
  );
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    await sendMessageWithPrompt(input);
  }, [input, isLoading, sendMessageWithPrompt]);
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const isInputDisabled = isLoading || !input.trim();
  return /* @__PURE__ */ jsxs4("div", { className: "agent-chat", style: CHAT_CONTAINER_STYLE(height), children: [
    /* @__PURE__ */ jsxs4("div", { className: "chat-header", style: HEADER_STYLE, children: [
      /* @__PURE__ */ jsx4("span", { style: HEADER_TITLE_STYLE, children: title }),
      sessionId && /* @__PURE__ */ jsxs4("span", { style: SESSION_ID_STYLE, children: [
        "Session: ",
        sessionId.slice(0, 8)
      ] })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "chat-messages", style: MESSAGES_CONTAINER_STYLE, children: [
      showEmptyState && messages.length === 0 && /* @__PURE__ */ jsx4("div", { style: EMPTY_STATE_STYLE, children: emptyStateMessage }),
      messages.map((message, index) => /* @__PURE__ */ jsx4(
        MessageBubble,
        {
          message
        },
        `${message.type}-${index}-${message.timestamp || Date.now()}`
      )),
      isLoading && /* @__PURE__ */ jsx4("div", { className: "typing-indicator", style: TYPING_INDICATOR_STYLE, children: "Agent is thinking..." }),
      /* @__PURE__ */ jsx4("div", { ref: messagesEndRef })
    ] }),
    /* @__PURE__ */ jsxs4("div", { className: "chat-input", style: INPUT_CONTAINER_STYLE, children: [
      /* @__PURE__ */ jsx4(
        "input",
        {
          type: "text",
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyPress: handleKeyPress,
          placeholder,
          disabled: isLoading,
          style: INPUT_STYLE
        }
      ),
      /* @__PURE__ */ jsx4(
        "button",
        {
          onClick: sendMessage,
          disabled: isInputDisabled,
          style: SEND_BUTTON_STYLE(isInputDisabled),
          children: "Send"
        }
      )
    ] })
  ] });
}

// src/design-system/components/RollingSearch.tsx
import { useState as useState5, useRef as useRef2, useEffect as useEffect2 } from "react";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var CONTAINER_STYLE2 = {
  position: "relative",
  width: "234px",
  height: "44px"
};
var GRAY_TRACK_STYLE = {
  position: "absolute",
  width: "42px",
  height: "42px",
  top: "1px",
  left: "96px",
  borderRadius: "48px",
  background: DRAMS.grayTrack,
  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
};
var GRAY_TRACK_EXPANDED = {
  width: "234px",
  height: "44px",
  top: "0",
  left: "0"
};
var INPUT_STYLE2 = {
  position: "absolute",
  left: "52px",
  top: "50%",
  transform: "translateY(-50%)",
  width: "calc(100% - 100px)",
  border: "none",
  background: "transparent",
  fontSize: "15px",
  color: DRAMS.textDark,
  outline: "none",
  opacity: 0,
  pointerEvents: "none",
  transition: "opacity 0.3s ease",
  caretColor: DRAMS.orange,
  fontFamily: DRAMS.fontFamily
};
var INPUT_VISIBLE = {
  opacity: 1,
  pointerEvents: "auto"
};
var SHADOW_LAYER_1 = {
  position: "absolute",
  width: "32px",
  height: "32px",
  borderRadius: "56px",
  top: "6px",
  left: "102px",
  pointerEvents: "none",
  transition: "left 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  boxShadow: "rgba(0, 0, 0, 0.247) 0.84px 0.84px 1.19px -0.625px, rgba(0, 0, 0, 0.24) 1.99px 1.99px 2.81px -1.25px, rgba(0, 0, 0, 0.23) 3.63px 3.63px 5.13px -1.875px, rgba(0, 0, 0, 0.22) 6.04px 6.04px 8.54px -2.5px, rgba(0, 0, 0, 0.2) 9.75px 9.75px 13.79px -3.125px, rgba(0, 0, 0, 0.17) 15.96px 15.96px 22.57px -3.75px, rgba(0, 0, 0, 0.114) 27.48px 27.48px 38.86px -4.375px, rgba(0, 0, 0, 0) 50px 50px 70.71px -5px"
};
var SHADOW_LAYER_1_EXPANDED = {
  left: "198px"
};
var SHADOW_LAYER_2 = {
  position: "absolute",
  width: "20px",
  height: "19px",
  borderRadius: "56px",
  top: "13px",
  left: "103px",
  pointerEvents: "none",
  transition: "left 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  boxShadow: "rgba(0, 0, 0, 0.208) 1.51px 0.2px 0.61px -0.53px, rgba(0, 0, 0, 0.204) 3.58px 0.48px 1.45px -1.06px, rgba(0, 0, 0, 0.2) 6.54px 0.87px 2.64px -1.59px, rgba(0, 0, 0, 0.192) 10.87px 1.45px 4.38px -2.125px, rgba(0, 0, 0, 0.176) 17.55px 2.34px 7.08px -2.66px, rgba(0, 0, 0, 0.157) 28.72px 3.83px 11.59px -3.19px, rgba(0, 0, 0, 0.118) 49.46px 6.59px 19.96px -3.72px, rgba(0, 0, 0, 0.04) 90px 12px 36.32px -4.25px, rgba(0, 0, 0, 0.25) 10px 10px 24px 0px"
};
var SHADOW_LAYER_2_EXPANDED = {
  left: "199px"
};
var ORANGE_BALL = {
  position: "absolute",
  width: "42px",
  height: "42px",
  top: "0",
  left: "96px",
  borderRadius: "50%",
  overflow: "hidden",
  cursor: "pointer",
  transition: "left 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  background: `radial-gradient(50% 50% at 29.1% 29.7%, ${DRAMS.orangeHighlight} 0%, ${DRAMS.orange} 100%)`,
  boxShadow: "rgba(232, 61, 23, 0.35) 0px 0px 0px -0.75px inset, rgba(232, 61, 23, 0.7) 0px 0px 0px -1.5px inset, rgba(0, 0, 0, 0.25) -2px -1px 4px 0px inset, rgba(204, 44, 16, 0.455) -0.66px -0.06px 0.53px -0.75px inset, rgba(204, 44, 16, 0.475) -2.52px -0.23px 2.02px -1.5px inset, rgba(204, 44, 16, 0.55) -11px -1px 8.84px -2.25px inset"
};
var ORANGE_BALL_EXPANDED = {
  left: "192px"
};
var ICON_STYLE = {
  width: "20px",
  height: "20px",
  fill: "rgb(252, 252, 250)",
  transition: "opacity 0.2s ease",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pointerEvents: "none"
};
function RollingSearch({ onSearch, placeholder = "Search products..." }) {
  const [isExpanded, setIsExpanded] = useState5(false);
  const [query, setQuery] = useState5("");
  const inputRef = useRef2(null);
  useEffect2(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);
  const handleToggle = () => {
    if (isExpanded && query.trim()) {
      onSearch?.(query.trim());
      setQuery("");
      setIsExpanded(false);
    } else if (isExpanded) {
      setQuery("");
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };
  const handleBlur = () => {
    setTimeout(() => {
      if (!query.trim()) {
        setIsExpanded(false);
      }
    }, 150);
  };
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setQuery("");
      setIsExpanded(false);
    } else if (e.key === "Enter" && query.trim()) {
      onSearch?.(query.trim());
      setQuery("");
      setIsExpanded(false);
    }
  };
  const handleInputChange = (e) => {
    setQuery(e.currentTarget.value);
  };
  return /* @__PURE__ */ jsxs5("div", { style: { ...CONTAINER_STYLE2 }, children: [
    /* @__PURE__ */ jsx5(
      "div",
      {
        style: {
          ...GRAY_TRACK_STYLE,
          ...isExpanded ? GRAY_TRACK_EXPANDED : {}
        }
      }
    ),
    /* @__PURE__ */ jsx5(
      "div",
      {
        style: {
          ...SHADOW_LAYER_1,
          ...isExpanded ? SHADOW_LAYER_1_EXPANDED : {}
        }
      }
    ),
    /* @__PURE__ */ jsx5(
      "div",
      {
        style: {
          ...SHADOW_LAYER_2,
          ...isExpanded ? SHADOW_LAYER_2_EXPANDED : {}
        }
      }
    ),
    /* @__PURE__ */ jsx5(
      "input",
      {
        ref: inputRef,
        type: "text",
        value: query,
        onChange: handleInputChange,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        placeholder,
        style: {
          ...INPUT_STYLE2,
          ...isExpanded ? INPUT_VISIBLE : {}
        }
      }
    ),
    /* @__PURE__ */ jsxs5(
      "div",
      {
        onClick: handleToggle,
        style: {
          ...ORANGE_BALL,
          ...isExpanded ? ORANGE_BALL_EXPANDED : {},
          zIndex: 1
        },
        children: [
          /* @__PURE__ */ jsx5(
            "svg",
            {
              style: { ...ICON_STYLE, opacity: isExpanded ? 0 : 1 },
              viewBox: "0 0 256 256",
              children: /* @__PURE__ */ jsx5("path", { d: "M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z" })
            }
          ),
          /* @__PURE__ */ jsx5(
            "svg",
            {
              style: { ...ICON_STYLE, opacity: isExpanded ? 1 : 0 },
              viewBox: "0 0 256 256",
              children: /* @__PURE__ */ jsx5("path", { d: "M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" })
            }
          )
        ]
      }
    )
  ] });
}

// src/design-system/components/PageLayout.tsx
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
var PAGE_STYLES = {
  default: {
    ...LAYOUT.page
  },
  gray: {
    ...LAYOUT.pageGray,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  centered: {
    ...LAYOUT.page,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  }
};
var CONTENT_STYLES = {
  default: {
    ...GRID.containerWide,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl
  },
  gray: {
    padding: SPACING.xl
  },
  centered: {
    ...LAYOUT.centered,
    textAlign: "center"
  }
};
var HEADER_STYLES = {
  ...GRID.containerWide,
  paddingTop: SPACING.xl,
  paddingBottom: 0
};
var TITLE_STYLE = {
  ...TYPOGRAPHY.h1,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.md} 0`
};
var SUBTITLE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: 0
};
function PageLayout({
  children,
  variant = "default",
  title,
  subtitle,
  showHeader = false
}) {
  const pageStyle = PAGE_STYLES[variant];
  const contentStyle = CONTENT_STYLES[variant];
  return /* @__PURE__ */ jsxs6("div", { style: pageStyle, children: [
    (showHeader || title || subtitle) && /* @__PURE__ */ jsxs6("div", { style: HEADER_STYLES, children: [
      title && /* @__PURE__ */ jsx6("h1", { style: TITLE_STYLE, children: title }),
      subtitle && /* @__PURE__ */ jsx6("p", { style: SUBTITLE_STYLE, children: subtitle })
    ] }),
    /* @__PURE__ */ jsx6("div", { style: contentStyle, children })
  ] });
}
function PageHeader({ title, subtitle, actions }) {
  return /* @__PURE__ */ jsxs6("div", { style: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xl
  }, children: [
    /* @__PURE__ */ jsxs6("div", { children: [
      /* @__PURE__ */ jsx6("h1", { style: TITLE_STYLE, children: title }),
      subtitle && /* @__PURE__ */ jsx6("p", { style: SUBTITLE_STYLE, children: subtitle })
    ] }),
    actions && /* @__PURE__ */ jsx6("div", { children: actions })
  ] });
}

// src/design-system/components/DramsInput.tsx
import { forwardRef, useRef as useRef3, useEffect as useEffect3, useState as useState6 } from "react";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
var TEXT_BOX_STYLE = {
  position: "relative",
  width: "100%",
  display: "flex",
  alignItems: "center"
};
var TEXT_BOX_TRACK_STYLE = {
  width: "100%",
  height: "48px",
  background: "rgb(238, 238, 238)",
  borderRadius: "48px",
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  transition: "all 0.3s ease"
};
var TEXT_BOX_TRACK_FOCUSED = {
  background: "rgb(230, 230, 230)",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
};
var INPUT_BASE_STYLE = {
  flex: 1,
  border: "none",
  background: "transparent",
  fontSize: "15px",
  color: "#333",
  outline: "none",
  caretColor: "rgb(255, 97, 26)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
};
var INDICATOR_STYLE = {
  width: "12px",
  height: "12px",
  borderRadius: "50%",
  background: "rgb(255, 97, 26)",
  opacity: "0",
  transition: "opacity 0.3s ease"
};
var ERROR_STYLE = {
  background: "#fef2f2",
  boxShadow: "none"
};
var ERROR_BORDER_STYLE = {
  boxShadow: "inset 0 0 0 1px #fecaca"
};
var DramsInput = forwardRef(
  ({ id, error = false, disabled: disabled2 = false, className, style, placeholder, ...rest }, ref) => {
    const inputRef = useRef3(null);
    const [isFocused, setIsFocused] = useState6(false);
    useEffect3(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);
    const {
      flex,
      minWidth,
      maxWidth,
      width,
      height,
      ...visualStyles
    } = style || {};
    const wrapperStyle = {
      ...TEXT_BOX_STYLE,
      ...flex !== void 0 && { flex },
      ...minWidth !== void 0 && { minWidth },
      ...maxWidth !== void 0 && { maxWidth },
      ...width !== void 0 && { width },
      ...height !== void 0 && { height }
    };
    const trackStyle = {
      ...TEXT_BOX_TRACK_STYLE,
      ...isFocused ? TEXT_BOX_TRACK_FOCUSED : {},
      ...error ? ERROR_STYLE : {},
      ...error && isFocused ? ERROR_BORDER_STYLE : {},
      ...disabled2 ? { opacity: 0.5, pointerEvents: "none" } : {},
      ...visualStyles
    };
    return /* @__PURE__ */ jsx7("div", { style: wrapperStyle, className, children: /* @__PURE__ */ jsxs7("div", { style: trackStyle, children: [
      /* @__PURE__ */ jsx7(
        "input",
        {
          ref: inputRef,
          id,
          disabled: disabled2,
          placeholder,
          style: INPUT_BASE_STYLE,
          onFocus: (e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          },
          onBlur: (e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          },
          ...rest
        }
      ),
      /* @__PURE__ */ jsx7("div", { style: { ...INDICATOR_STYLE, opacity: isFocused ? 1 : 0 } })
    ] }) });
  }
);
DramsInput.displayName = "DramsInput";

// src/design-system/components/DramsDropdown.tsx
import { useState as useState7, useRef as useRef4, useEffect as useEffect4 } from "react";
import { jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
var DROPDOWN_STYLE = {
  position: "relative",
  width: "100%"
};
var DROPDOWN_TRACK_STYLE = {
  height: "48px",
  background: "rgb(238, 238, 238)",
  borderRadius: "48px",
  padding: "0 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "all 0.3s ease"
};
var DROPDOWN_TRACK_HOVER = {
  background: "rgb(232, 232, 232)"
};
var LABEL_STYLE = {
  fontSize: "15px",
  color: "#333"
};
var PLACEHOLDER_STYLE2 = {
  color: "#999"
};
var BALL_STYLE = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "radial-gradient(50% 50% at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)",
  boxShadow: "rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, rgba(0, 0, 0, 0.2) -2px -1px 3px 0px inset",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "transform 0.3s ease"
};
var MENU_STYLE = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: "0",
  right: "0",
  background: "white",
  borderRadius: "16px",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  overflow: "hidden",
  opacity: "0",
  visibility: "hidden",
  transform: "translateY(-10px)",
  transition: "all 0.3s ease",
  zIndex: 10
};
var MENU_OPEN_STYLE = {
  opacity: "1",
  visibility: "visible",
  transform: "translateY(0)"
};
var ITEM_STYLE = {
  padding: "14px 20px",
  cursor: "pointer",
  transition: "background 0.2s ease",
  fontSize: "15px",
  color: "#333"
};
var ITEM_HOVER_STYLE = {
  background: "rgb(238, 238, 238)"
};
var ITEM_SELECTED_STYLE = {
  color: "rgb(255, 97, 26)"
};
var ARROW_SVG = /* @__PURE__ */ jsx8(
  "svg",
  {
    width: "14",
    height: "14",
    viewBox: "0 0 256 256",
    style: { fill: "rgb(252, 252, 250)" },
    children: /* @__PURE__ */ jsx8("path", { d: "M128,168l-72-72a12,12,0,0,1,17-17l55,55,55-55a12,12,0,0,1,17,17Z" })
  }
);
function DramsDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled: disabled2 = false,
  className,
  style
}) {
  const [isOpen, setIsOpen] = useState7(false);
  const [highlightedIndex, setHighlightedIndex] = useState7(null);
  const containerRef = useRef4(null);
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;
  const isPlaceholder = !selectedOption;
  useEffect4(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);
  useEffect4(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setHighlightedIndex(null);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);
  const handleToggle = () => {
    if (!disabled2) {
      setIsOpen(!isOpen);
      setHighlightedIndex(null);
    }
  };
  const handleSelect = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
    setHighlightedIndex(null);
  };
  const handleMouseEnter = (index) => {
    setHighlightedIndex(index);
  };
  const trackStyle = {
    ...DROPDOWN_TRACK_STYLE,
    ...isOpen || highlightedIndex !== null ? DROPDOWN_TRACK_HOVER : {},
    ...disabled2 ? { opacity: 0.5, pointerEvents: "none" } : {}
  };
  const ballStyle = {
    ...BALL_STYLE,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
  };
  const labelStyle = {
    ...LABEL_STYLE,
    ...isPlaceholder ? PLACEHOLDER_STYLE2 : {}
  };
  return /* @__PURE__ */ jsxs8("div", { ref: containerRef, style: { ...DROPDOWN_STYLE, ...style || {} }, className, children: [
    /* @__PURE__ */ jsxs8("div", { style: trackStyle, onClick: handleToggle, onMouseDown: (e) => e.preventDefault(), children: [
      /* @__PURE__ */ jsx8("span", { style: labelStyle, children: displayLabel }),
      /* @__PURE__ */ jsx8("div", { style: ballStyle, children: ARROW_SVG })
    ] }),
    /* @__PURE__ */ jsx8(
      "div",
      {
        style: {
          ...MENU_STYLE,
          ...isOpen ? MENU_OPEN_STYLE : {}
        },
        children: options.map((option, index) => {
          const isSelected = option.value === value;
          const isHighlighted = highlightedIndex === index;
          return /* @__PURE__ */ jsx8(
            "div",
            {
              style: {
                ...ITEM_STYLE,
                ...isHighlighted ? ITEM_HOVER_STYLE : {},
                ...isSelected ? ITEM_SELECTED_STYLE : {}
              },
              onMouseEnter: () => handleMouseEnter(index),
              onClick: () => handleSelect(option),
              children: option.label
            },
            option.value
          );
        })
      }
    )
  ] });
}

// src/design-system/components/DramsToggle.tsx
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
var CONTAINER_STYLE3 = {
  display: "flex",
  alignItems: "center",
  gap: "16px"
};
var LABEL_STYLE2 = {
  fontSize: "15px",
  color: "#333"
};
var SWITCH_STYLE = {
  width: "56px",
  height: "32px",
  background: "rgb(238, 238, 238)",
  borderRadius: "48px",
  position: "relative",
  cursor: "pointer",
  transition: "background 0.3s ease"
};
var SWITCH_ACTIVE = {
  background: "rgb(255, 97, 26)"
};
var BALL_STYLE2 = {
  position: "absolute",
  width: "26px",
  height: "26px",
  background: "white",
  borderRadius: "50%",
  top: "3px",
  left: "3px",
  transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
};
var BALL_ACTIVE = {
  left: "27px"
};
var DISABLED_STYLE = {
  opacity: 0.5,
  pointerEvents: "none"
};
function DramsToggle({
  checked = false,
  onChange,
  disabled: disabled2 = false,
  label,
  className,
  style,
  id
}) {
  const handleClick = () => {
    if (!disabled2 && onChange) {
      onChange(!checked);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };
  const switchStyle = {
    ...SWITCH_STYLE,
    ...checked ? SWITCH_ACTIVE : {},
    ...disabled2 ? DISABLED_STYLE : {}
  };
  const ballStyle = {
    ...BALL_STYLE2,
    ...checked ? BALL_ACTIVE : {}
  };
  return /* @__PURE__ */ jsxs9("div", { style: { ...CONTAINER_STYLE3, ...style || {} }, className, children: [
    label && /* @__PURE__ */ jsx9("label", { style: LABEL_STYLE2, children: label }),
    /* @__PURE__ */ jsx9(
      "div",
      {
        id,
        role: "switch",
        "aria-checked": checked,
        tabIndex: disabled2 ? -1 : 0,
        style: switchStyle,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        children: /* @__PURE__ */ jsx9("div", { style: ballStyle })
      }
    )
  ] });
}

// src/design-system/components/DramsButton.tsx
import { forwardRef as forwardRef2, useState as useState8 } from "react";

// src/design-system/tactile.ts
var orangeBall = {
  background: "radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)",
  boxShadow: "rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)"
};
var grayTrack = {
  background: DRAMS.grayTrack,
  borderRadius: "48px"
};
var cardLift = {
  transition: "transform 0.2s, box-shadow 0.2s",
  transform: "translateY(-4px)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
};
var concave = {
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)"
};
var convex = {
  boxShadow: "0 2px 4px rgba(0,0,0,0.08), 0 -1px 2px rgba(0,0,0,0.04)"
};
var innerGlow = {
  boxShadow: `inset 0 0 8px ${DRAMS.orange}40, 0 0 12px ${DRAMS.orange}30`
};
var softShadow = {
  boxShadow: "0 4px 16px rgba(0,0,0,0.06)"
};
var mediumShadow = {
  boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
};
var focusRing = {
  outline: "none",
  boxShadow: `0 0 0 3px ${DRAMS.orange}30`
};
var pressed = {
  transform: "translateY(1px)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
};
var disabled = {
  opacity: 0.5,
  cursor: "not-allowed",
  filter: "grayscale(0.3)"
};
var shimmer = {
  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite"
};
var animations = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `
};
var hover = {
  lift: "translateY(-2px)",
  brighten: "brightness(1.05)"
};
var active = {
  scale: "scale(0.98)",
  press: "translateY(1px)"
};

// src/design-system/components/DramsButton.tsx
import { Fragment as Fragment2, jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
var BUTTON_UNIQUE_ID = "drams-button-";
var BUTTON_STYLES = {
  primary: PILL_BUTTON.orange,
  secondary: {
    background: DRAMS.grayTrack,
    color: DRAMS.textDark,
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: "pointer"
  },
  danger: {
    background: COLORS.error,
    color: "white",
    border: "none",
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: "pointer"
  },
  gray: PILL_BUTTON.gray
};
var DramsButton = forwardRef2(
  ({
    id,
    variant = "primary",
    disabled: disabled2 = false,
    fullWidth = false,
    loading = false,
    className,
    children,
    ...rest
  }, ref) => {
    const [isHovered, setIsHovered] = useState8(false);
    const [isPressed, setIsPressed] = useState8(false);
    const uniqueId = id || `${BUTTON_UNIQUE_ID}${Math.random().toString(36).slice(2, 9)}`;
    const isDisabled = disabled2 || loading;
    const baseStyle = {
      ...BUTTON_STYLES[variant],
      ...fullWidth ? { width: "100%" } : {},
      ...isDisabled ? disabled : {},
      ...isPressed && !isDisabled ? { transform: "translateY(1px)" } : {}
    };
    return /* @__PURE__ */ jsxs10(Fragment2, { children: [
      /* @__PURE__ */ jsx10(
        "button",
        {
          ref,
          id: uniqueId,
          disabled: isDisabled,
          className,
          "data-hovered": isHovered,
          "data-variant": variant,
          style: baseStyle,
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => {
            setIsHovered(false);
            setIsPressed(false);
          },
          onMouseDown: () => setIsPressed(true),
          onMouseUp: () => setIsPressed(false),
          ...rest,
          children: loading ? "..." : children
        }
      ),
      (variant === "secondary" || variant === "gray") && /* @__PURE__ */ jsx10("style", { children: `
            button[data-hovered="true"]#${uniqueId} {
              background: ${DRAMS.grayHover} !important;
            }
          ` })
    ] });
  }
);
DramsButton.displayName = "DramsButton";
export {
  APP,
  AgentChat,
  BADGE,
  BUTTON,
  CARD,
  COLORS,
  ConfigValidationError,
  DRAMS,
  DRAMS_CARD,
  DRAMS_EMPTY_STATE,
  DramsAddButton,
  DramsButton,
  DramsDropdown,
  DramsFlipCard,
  DramsInput,
  DramsProductCard,
  DramsToggle,
  EMPTY_STATE,
  ERROR,
  EnvVars,
  EnvironmentEnum,
  FlipCardBack,
  FlipCardFront,
  GRID,
  GatewayConfigSchema,
  INPUT,
  LAYOUT,
  LOADING,
  MissingEnvVarError,
  NAV,
  ONDCClient,
  ONDCError,
  PILL_BUTTON,
  PageHeader,
  PageLayout,
  QUANTITY_CONTROL,
  RADIUS,
  RollingSearch,
  SELECT_BOX,
  SHADOWS,
  SLIDER,
  SPACING,
  SignatureError,
  TEXT_BOX,
  TOGGLE_SWITCH,
  TRANSITIONS,
  TYPOGRAPHY,
  ValidationError,
  active,
  allMCPTools,
  animations,
  becknToUcpCatalog,
  buildAuthHeader,
  buildScoringContext,
  cardLift,
  checkEnvVars,
  concave,
  convex,
  disabled,
  focusRing,
  formatDuration,
  generateKeyPair,
  generateKeyPairFromSeed,
  getPublicKey,
  grayTrack,
  hover,
  initCrypto,
  innerGlow,
  loadConfig,
  loadConfigWithOverrides,
  mediumShadow,
  normalizePercentage,
  normalizePrice,
  normalizeRating,
  ondcCancelTool,
  ondcCheckoutTool,
  ondcSearchTool,
  ondcStatusTool,
  orangeBall,
  parseAuthHeader,
  parseDuration,
  pressed,
  scoreAndSortItems,
  scoreItem,
  shimmer,
  signMessage,
  softShadow,
  ucpToBecknIntent,
  verifyAuthHeader,
  verifySignature
};
//# sourceMappingURL=index.js.map