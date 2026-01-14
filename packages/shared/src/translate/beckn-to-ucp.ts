/**
 * Beckn to UCP Translator
 * Translates ONDC Beckn protocol responses to UCP format
 */

import type {
  BecknOnSearchResponse,
  BecknProvider,
  BecknItem,
  BecknPrice,
  BecknImage,
  BecknLocation,
} from '../types/beckn';
import type {
  UCPCatalog,
  UCPItem,
  UCPProvider,
  UCPPrice,
  UCPImage,
  UCPLocation,
  UCPRating,
} from '../types/ucp';

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
export function becknToUcpCatalog(response: BecknOnSearchResponse): UCPCatalog {
  const catalog = response.message?.catalog;
  if (!catalog) {
    return { items: [] };
  }

  const providers = catalog['bpp/providers'] ?? [];

  // Collect all items from all providers
  const items: UCPItem[] = [];

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
    totalCount: items.length,
  };
}

/**
 * Translate Beckn provider to UCP provider
 */
function translateProvider(provider: BecknProvider): UCPProvider {
  const descriptor = provider.descriptor;

  return {
    id: provider.id,
    name: descriptor?.name ?? 'Unknown Provider',
    logo: translateImage(descriptor?.images?.[0]),
    rating: translateRating(provider.rating),
    location: translateLocation(provider.locations?.[0]),
  };
}

/**
 * Translate Beckn item to UCP item
 */
function translateItem(
  item: BecknItem,
  provider: BecknProvider,
  ucpProvider: UCPProvider
): UCPItem {
  const descriptor = item.descriptor;

  return {
    id: item.id,
    name: descriptor?.name ?? 'Unknown Item',
    description: descriptor?.long_desc ?? descriptor?.short_desc,
    images: translateImages(descriptor?.images),
    price: translatePrice(item.price),
    originalPrice: translateOriginalPrice(item.price),
    provider: ucpProvider,
    category: findCategoryName(item.category_id, provider.categories),
    rating: translateRating(item.rating),
    availableQuantity: item.quantity?.count,
    returnable: item['@ondc/org/returnable'],
    cancellable: item['@ondc/org/cancellable'],
    codAvailable: item['@ondc/org/available_on_cod'],
  };
}

/**
 * Translate Beckn price to UCP price
 */
function translatePrice(price?: BecknPrice): UCPPrice {
  if (!price) {
    return { currency: 'INR', value: '0' };
  }

  // Use offered_value if available (discounted price), otherwise use value
  const value = price.offered_value ?? price.value ?? '0';

  return {
    currency: price.currency ?? 'INR',
    value,
  };
}

/**
 * Translate original price (before discount)
 */
function translateOriginalPrice(price?: BecknPrice): UCPPrice | undefined {
  // Only set originalPrice if there's a discount (offered_value < value)
  if (!price || !price.offered_value || !price.value || price.value === price.offered_value) {
    return undefined;
  }

  return {
    currency: price.currency ?? 'INR',
    value: price.value,
  };
}

/**
 * Translate Beckn image to UCP image
 */
function translateImage(image?: BecknImage): UCPImage | undefined {
  if (!image) {
    return undefined;
  }

  return {
    url: image.url,
    width: image.width ? parseInt(image.width, 10) : undefined,
    height: image.height ? parseInt(image.height, 10) : undefined,
  };
}

/**
 * Translate array of Beckn images to UCP images
 */
function translateImages(images?: BecknImage[]): UCPImage[] {
  if (!images || images.length === 0) {
    return [];
  }

  return images
    .map(translateImage)
    .filter((img): img is UCPImage => img !== undefined);
}

/**
 * Translate Beckn location to UCP location
 */
function translateLocation(location?: BecknLocation): UCPLocation | undefined {
  if (!location) {
    return undefined;
  }

  const gps = location.gps;
  const address = location.address;

  // Parse GPS coordinates (format: "lat,lng")
  let latitude: number | undefined;
  let longitude: number | undefined;
  if (gps) {
    const parts = gps.split(',').map((s) => parseFloat(s.trim()));
    const lat = parts[0];
    const lng = parts[1];
    if (lat !== undefined && !isNaN(lat)) latitude = lat;
    if (lng !== undefined && !isNaN(lng)) longitude = lng;
  }

  return {
    latitude,
    longitude,
    city: address?.city,
    state: address?.state,
    country: address?.country,
    postalCode: address?.area_code,
    address: formatAddress(address),
  };
}

/**
 * Translate rating to UCP rating
 */
function translateRating(rating?: number): UCPRating | undefined {
  if (rating === undefined || rating === 0) {
    return undefined;
  }

  // Beckn ratings are typically 0-5, same as UCP
  return {
    value: rating,
    count: undefined, // Beckn doesn't provide rating count
  };
}

/**
 * Find category name by ID from provider's categories
 */
function findCategoryName(
  categoryId?: string,
  categories?: { id?: string; descriptor?: { name?: string } }[]
): string | undefined {
  if (!categoryId || !categories) {
    return undefined;
  }

  const category = categories.find((c) => c.id === categoryId);
  return category?.descriptor?.name;
}

/**
 * Format address from Beckn address components
 */
function formatAddress(address?: {
  door?: string;
  building?: string;
  street?: string;
  locality?: string;
  ward?: string;
  city?: string;
  state?: string;
  country?: string;
  area_code?: string;
}): string | undefined {
  if (!address) {
    return undefined;
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
    address.area_code,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : undefined;
}
