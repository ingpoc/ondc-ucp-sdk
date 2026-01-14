/**
 * Beckn Protocol Context Types
 * Based on Beckn Protocol Core Specification
 */
/** Beckn protocol actions */
type BecknAction = 'search' | 'select' | 'init' | 'confirm' | 'status' | 'track' | 'cancel' | 'update' | 'rating' | 'support' | 'on_search' | 'on_select' | 'on_init' | 'on_confirm' | 'on_status' | 'on_track' | 'on_cancel' | 'on_update' | 'on_rating' | 'on_support';
/** ONDC/Beckn domain types */
type BecknDomain = 'ONDC:RET10' | 'ONDC:RET11' | 'ONDC:RET12' | 'ONDC:RET13' | 'ONDC:RET14' | 'ONDC:RET15' | 'ONDC:RET16' | 'ONDC:RET17' | 'ONDC:RET18' | 'ONDC:RET19' | 'ONDC:TRV10' | 'ONDC:TRV11' | 'ONDC:FIS10' | 'ONDC:FIS11' | string;
/** Beckn Context - header information for packet switching */
interface BecknContext {
    /** Domain identifier (e.g., ONDC:RET10 for grocery) */
    domain: BecknDomain;
    /** Action being performed */
    action: BecknAction;
    /** Country code (ISO 3166-1 alpha-3) */
    country: string;
    /** City code */
    city: string;
    /** Core API version */
    core_version?: string;
    /** Beckn API version */
    version?: string;
    /** Buyer App Provider ID */
    bap_id: string;
    /** Buyer App Provider URI */
    bap_uri: string;
    /** Buyer Platform Provider ID (seller side) */
    bpp_id?: string;
    /** Buyer Platform Provider URI (seller side) */
    bpp_uri?: string;
    /** Unique transaction ID across the lifecycle */
    transaction_id: string;
    /** Unique message ID for this request/response */
    message_id: string;
    /** ISO 8601 timestamp */
    timestamp: string;
    /** Time-to-live (ISO 8601 duration, e.g., PT30S) */
    ttl?: string;
    /** Key for encryption/signing */
    key?: string;
}

/**
 * Beckn Protocol Common Types
 * Shared types used across different message types
 */
/** Descriptor for human-readable info */
interface BecknDescriptor {
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
interface BecknImage {
    url: string;
    size_type?: 'xs' | 'sm' | 'md' | 'lg';
    width?: string;
    height?: string;
}
/** Price information */
interface BecknPrice {
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
interface BecknQuantity {
    count?: number;
    measure?: BecknMeasure;
    available?: BecknMeasure;
    allocated?: BecknMeasure;
    maximum?: BecknMeasure;
    minimum?: BecknMeasure;
    selected?: BecknMeasure;
}
/** Measurement unit */
interface BecknMeasure {
    type?: string;
    value: string;
    unit: string;
}
/** Location information */
interface BecknLocation {
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
interface BecknAddress {
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
interface BecknCity {
    name?: string;
    code?: string;
}
/** Country information */
interface BecknCountry {
    name?: string;
    code?: string;
}
/** Circular area */
interface BecknCircle {
    gps: string;
    radius: BecknMeasure;
}
/** Time information */
interface BecknTime {
    label?: string;
    timestamp?: string;
    duration?: string;
    range?: BecknTimeRange;
    days?: string;
    schedule?: BecknSchedule;
}
/** Time range */
interface BecknTimeRange {
    start?: string;
    end?: string;
}
/** Schedule */
interface BecknSchedule {
    frequency?: string;
    holidays?: string[];
    times?: string[];
}
/** Contact information */
interface BecknContact {
    phone?: string;
    email?: string;
    tags?: BecknTagGroup[];
}
/** Person information */
interface BecknPerson {
    id?: string;
    name?: string;
    image?: BecknImage;
    dob?: string;
    gender?: string;
    creds?: BecknCredential[];
    tags?: BecknTagGroup[];
}
/** Credential */
interface BecknCredential {
    id?: string;
    type?: string;
    desc?: string;
    url?: string;
}
/** Tag group for extended metadata */
interface BecknTagGroup {
    code?: string;
    name?: string;
    display?: boolean;
    list?: BecknTag[];
}
/** Individual tag */
interface BecknTag {
    code?: string;
    name?: string;
    value?: string;
}
/** Rating information */
interface BecknRating {
    rating_category?: 'Order' | 'Fulfillment' | 'Item' | 'Provider' | string;
    id?: string;
    value?: number;
}
/** State information */
interface BecknState {
    descriptor?: BecknDescriptor;
    updated_at?: string;
    updated_by?: string;
}
/** Error information */
interface BecknError {
    code: string;
    path?: string;
    message?: string;
}

/**
 * Beckn Protocol Catalog Types
 * Types for catalog, providers, items, fulfillments
 */

/** Catalog containing providers and items */
interface BecknCatalog {
    'bpp/descriptor'?: BecknDescriptor;
    'bpp/providers'?: BecknProvider[];
    'bpp/fulfillments'?: BecknFulfillment[];
    'bpp/payments'?: BecknPayment[];
    'bpp/offers'?: BecknOffer[];
    exp?: string;
}
/** Provider (seller) information */
interface BecknProvider {
    id: string;
    descriptor?: BecknDescriptor;
    category_id?: string;
    rating?: number;
    time?: BecknTime;
    categories?: BecknCategory[];
    fulfillments?: BecknFulfillment[];
    payments?: BecknPayment[];
    locations?: BecknLocation[];
    offers?: BecknOffer[];
    items?: BecknItem[];
    exp?: string;
    rateable?: boolean;
    tags?: BecknTagGroup[];
    '@ondc/org/fssai_license_no'?: string;
}
/** Category information */
interface BecknCategory {
    id: string;
    parent_category_id?: string;
    descriptor?: BecknDescriptor;
    time?: BecknTime;
    tags?: BecknTagGroup[];
}
/** Item (product/service) information */
interface BecknItem {
    id: string;
    parent_item_id?: string;
    descriptor?: BecknDescriptor;
    price?: BecknPrice;
    category_id?: string;
    category_ids?: string[];
    fulfillment_id?: string;
    fulfillment_ids?: string[];
    location_id?: string;
    location_ids?: string[];
    payment_ids?: string[];
    add_ons?: BecknAddOn[];
    offers?: BecknOffer[];
    quantity?: BecknQuantity;
    time?: BecknTime;
    rateable?: boolean;
    rating?: number;
    matched?: boolean;
    related?: boolean;
    recommended?: boolean;
    tags?: BecknTagGroup[];
    '@ondc/org/returnable'?: boolean;
    '@ondc/org/cancellable'?: boolean;
    '@ondc/org/return_window'?: string;
    '@ondc/org/seller_pickup_return'?: boolean;
    '@ondc/org/time_to_ship'?: string;
    '@ondc/org/available_on_cod'?: boolean;
    '@ondc/org/statutory_reqs_packaged_commodities'?: Record<string, string>;
    '@ondc/org/statutory_reqs_prepackaged_food'?: Record<string, string>;
}
/** Add-on items */
interface BecknAddOn {
    id: string;
    descriptor?: BecknDescriptor;
    price?: BecknPrice;
}
/** Offer/discount information */
interface BecknOffer {
    id: string;
    descriptor?: BecknDescriptor;
    location_ids?: string[];
    category_ids?: string[];
    item_ids?: string[];
    time?: BecknTime;
    tags?: BecknTagGroup[];
}
/** Fulfillment information */
interface BecknFulfillment {
    id?: string;
    type?: string;
    '@ondc/org/provider_name'?: string;
    '@ondc/org/category'?: string;
    '@ondc/org/TAT'?: string;
    provider_id?: string;
    rating?: number;
    state?: BecknState;
    tracking?: boolean;
    customer?: BecknCustomer;
    agent?: BecknAgent;
    vehicle?: BecknVehicle;
    start?: BecknFulfillmentEnd;
    end?: BecknFulfillmentEnd;
    rateable?: boolean;
    tags?: BecknTagGroup[];
}
/** Customer information */
interface BecknCustomer {
    person?: BecknPerson;
    contact?: BecknContact;
}
/** Agent (delivery person) */
interface BecknAgent {
    name?: string;
    image?: BecknImage;
    dob?: string;
    gender?: string;
    phone?: string;
    email?: string;
    tags?: BecknTagGroup[];
    rateable?: boolean;
}
/** Vehicle information */
interface BecknVehicle {
    category?: string;
    capacity?: number;
    make?: string;
    model?: string;
    color?: string;
    energy_type?: string;
    registration?: string;
}
/** Fulfillment start/end details */
interface BecknFulfillmentEnd {
    location?: BecknLocation;
    time?: BecknTime;
    instructions?: BecknDescriptor;
    contact?: BecknContact;
    person?: BecknPerson;
    authorization?: BecknAuthorization;
}
/** Authorization details */
interface BecknAuthorization {
    type?: string;
    token?: string;
    valid_from?: string;
    valid_to?: string;
}
/** Payment information */
interface BecknPayment {
    id?: string;
    type?: 'PRE-FULFILLMENT' | 'ON-FULFILLMENT' | 'POST-FULFILLMENT';
    collected_by?: 'BAP' | 'BPP';
    uri?: string;
    params?: BecknPaymentParams;
    status?: 'PAID' | 'NOT-PAID';
    time?: BecknTime;
    tags?: BecknTagGroup[];
    '@ondc/org/buyer_app_finder_fee_type'?: string;
    '@ondc/org/buyer_app_finder_fee_amount'?: string;
    '@ondc/org/settlement_basis'?: string;
    '@ondc/org/settlement_window'?: string;
    '@ondc/org/withholding_amount'?: string;
    '@ondc/org/settlement_details'?: BecknSettlementDetails[];
}
/** Payment parameters */
interface BecknPaymentParams {
    transaction_id?: string;
    transaction_status?: string;
    amount?: string;
    currency?: string;
    bank_code?: string;
    bank_account_number?: string;
    virtual_payment_address?: string;
}
/** Settlement details */
interface BecknSettlementDetails {
    settlement_counterparty?: string;
    settlement_phase?: string;
    settlement_type?: string;
    settlement_bank_account_no?: string;
    settlement_ifsc_code?: string;
    upi_address?: string;
    bank_name?: string;
    branch_name?: string;
}
/** Quote/pricing breakdown */
interface BecknQuote {
    price?: BecknPrice;
    breakup?: BecknQuoteBreakup[];
    ttl?: string;
}
/** Quote breakup item */
interface BecknQuoteBreakup {
    '@ondc/org/item_id'?: string;
    '@ondc/org/item_quantity'?: BecknQuantity;
    '@ondc/org/title_type'?: string;
    title?: string;
    price?: BecknPrice;
    item?: BecknItem;
}
/** Billing information */
interface BecknBilling {
    name: string;
    address?: string;
    state?: BecknState;
    city?: BecknState;
    email?: string;
    phone: string;
    tax_number?: string;
    created_at?: string;
    updated_at?: string;
}

/**
 * Beckn Protocol Message Types
 * Main message wrapper and action-specific message types
 */

/** Generic Beckn message wrapper */
interface BecknMessage<T = unknown> {
    context: BecknContext;
    message: T;
    error?: BecknError;
}
/** Acknowledgement response */
interface BecknAck {
    status: 'ACK' | 'NACK';
}
/** Acknowledgement message wrapper */
interface BecknAckMessage {
    context: BecknContext;
    message: {
        ack: BecknAck;
    };
    error?: BecknError;
}

/**
 * Beckn Protocol Search Types
 * Types for search request and on_search response
 */

/** Search intent */
interface BecknIntent {
    descriptor?: BecknDescriptor;
    provider?: BecknIntentProvider;
    fulfillment?: BecknIntentFulfillment;
    payment?: BecknPayment;
    category?: BecknIntentCategory;
    offer?: BecknIntentOffer;
    item?: BecknIntentItem;
    tags?: BecknTagGroup[];
}
/** Intent provider filter */
interface BecknIntentProvider {
    id?: string;
    descriptor?: BecknDescriptor;
    locations?: BecknLocation[];
    categories?: BecknIntentCategory[];
    items?: BecknIntentItem[];
    tags?: BecknTagGroup[];
}
/** Intent fulfillment filter */
interface BecknIntentFulfillment {
    id?: string;
    type?: string;
    start?: BecknIntentFulfillmentEnd;
    end?: BecknIntentFulfillmentEnd;
    tags?: BecknTagGroup[];
}
/** Intent fulfillment endpoint */
interface BecknIntentFulfillmentEnd {
    location?: BecknLocation;
    time?: BecknTime;
}
/** Intent category filter */
interface BecknIntentCategory {
    id?: string;
    descriptor?: BecknDescriptor;
}
/** Intent offer filter */
interface BecknIntentOffer {
    id?: string;
    descriptor?: BecknDescriptor;
}
/** Intent item filter */
interface BecknIntentItem {
    id?: string;
    descriptor?: BecknDescriptor;
    price?: BecknPrice;
    tags?: BecknTagGroup[];
}
/** Search request message */
interface BecknSearchMessage {
    intent: BecknIntent;
}
/** Full search request */
interface BecknSearchRequest {
    context: BecknContext;
    message: BecknSearchMessage;
}
/** on_search response message */
interface BecknOnSearchMessage {
    catalog: BecknCatalog;
}
/** Full on_search response */
interface BecknOnSearchResponse {
    context: BecknContext;
    message: BecknOnSearchMessage;
    error?: BecknError;
}

/**
 * Beckn Protocol Order Types
 * Types for select, init, confirm and their callbacks
 */

/** Order item with quantity */
interface BecknOrderItem {
    id: string;
    quantity?: {
        count?: number;
        selected?: {
            count?: number;
        };
    };
    fulfillment_id?: string;
    parent_item_id?: string;
    tags?: BecknTagGroup[];
}
/** Order object used in select/init/confirm */
interface BecknOrder {
    id?: string;
    state?: string;
    provider?: BecknOrderProvider;
    items?: BecknOrderItem[];
    add_ons?: BecknOrderAddOn[];
    offers?: BecknOrderOffer[];
    billing?: BecknBilling;
    fulfillments?: BecknFulfillment[];
    quote?: BecknQuote;
    payment?: BecknPayment;
    payments?: BecknPayment[];
    created_at?: string;
    updated_at?: string;
    cancellation?: BecknCancellation;
    tags?: BecknTagGroup[];
    documents?: BecknDocument[];
}
/** Provider reference in order */
interface BecknOrderProvider {
    id: string;
    locations?: Array<{
        id: string;
    }>;
}
/** Add-on in order */
interface BecknOrderAddOn {
    id: string;
}
/** Offer in order */
interface BecknOrderOffer {
    id: string;
}
/** Cancellation details */
interface BecknCancellation {
    time?: string;
    cancelled_by?: string;
    reason?: BecknCancellationReason;
}
/** Cancellation reason */
interface BecknCancellationReason {
    id?: string;
    descriptor?: {
        name?: string;
        code?: string;
        short_desc?: string;
    };
}
/** Document in order */
interface BecknDocument {
    url?: string;
    label?: string;
}
/** Select request message */
interface BecknSelectMessage {
    order: BecknOrder;
}
/** Full select request */
interface BecknSelectRequest {
    context: BecknContext;
    message: BecknSelectMessage;
}
/** on_select response message */
interface BecknOnSelectMessage {
    order: BecknOrder;
}
/** Full on_select response */
interface BecknOnSelectResponse {
    context: BecknContext;
    message: BecknOnSelectMessage;
    error?: BecknError;
}
/** Init request message */
interface BecknInitMessage {
    order: BecknOrder;
}
/** Full init request */
interface BecknInitRequest {
    context: BecknContext;
    message: BecknInitMessage;
}
/** on_init response message */
interface BecknOnInitMessage {
    order: BecknOrder;
}
/** Full on_init response */
interface BecknOnInitResponse {
    context: BecknContext;
    message: BecknOnInitMessage;
    error?: BecknError;
}
/** Confirm request message */
interface BecknConfirmMessage {
    order: BecknOrder;
}
/** Full confirm request */
interface BecknConfirmRequest {
    context: BecknContext;
    message: BecknConfirmMessage;
}
/** on_confirm response message */
interface BecknOnConfirmMessage {
    order: BecknOrder;
}
/** Full on_confirm response */
interface BecknOnConfirmResponse {
    context: BecknContext;
    message: BecknOnConfirmMessage;
    error?: BecknError;
}
/** Status request message */
interface BecknStatusMessage {
    order_id: string;
}
/** Full status request */
interface BecknStatusRequest {
    context: BecknContext;
    message: BecknStatusMessage;
}
/** on_status response message */
interface BecknOnStatusMessage {
    order: BecknOrder;
}
/** Full on_status response */
interface BecknOnStatusResponse {
    context: BecknContext;
    message: BecknOnStatusMessage;
    error?: BecknError;
}
/** Cancel request message */
interface BecknCancelMessage {
    order_id: string;
    cancellation_reason_id?: string;
    descriptor?: {
        short_desc?: string;
    };
}
/** Full cancel request */
interface BecknCancelRequest {
    context: BecknContext;
    message: BecknCancelMessage;
}
/** on_cancel response message */
interface BecknOnCancelMessage {
    order: BecknOrder;
}
/** Full on_cancel response */
interface BecknOnCancelResponse {
    context: BecknContext;
    message: BecknOnCancelMessage;
    error?: BecknError;
}
/** Track request message */
interface BecknTrackMessage {
    order_id: string;
    callback_url?: string;
}
/** Full track request */
interface BecknTrackRequest {
    context: BecknContext;
    message: BecknTrackMessage;
}
/** on_track response message */
interface BecknOnTrackMessage {
    tracking?: BecknTracking;
}
/** Tracking details */
interface BecknTracking {
    id?: string;
    url?: string;
    location?: {
        gps?: string;
        time?: {
            timestamp?: string;
        };
    };
    status?: string;
}
/** Full on_track response */
interface BecknOnTrackResponse {
    context: BecknContext;
    message: BecknOnTrackMessage;
    error?: BecknError;
}

/**
 * UCP Common Types
 * Shared types used across UCP interfaces
 */
/** Price with currency */
interface UCPPrice {
    amount?: number;
    currency: string;
    /** String value (used in Beckn translations) */
    value?: string;
}
/** Image reference */
interface UCPImage {
    url: string;
    alt?: string;
    width?: number;
    height?: number;
}
/** Address information */
interface UCPAddress {
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
interface UCPContact {
    phone?: string;
    email?: string;
}
/** Location with coordinates */
interface UCPLocation {
    address?: UCPAddress | string;
    gps?: string;
    city?: string;
    country?: string;
    /** Latitude coordinate */
    latitude?: number;
    /** Longitude coordinate */
    longitude?: number;
    /** State/province */
    state?: string;
    /** Postal/ZIP code */
    postalCode?: string;
    /** Search radius in kilometers */
    radius?: number;
}
/** Time range */
interface UCPTimeRange {
    start?: string;
    end?: string;
}
/** Rating information */
interface UCPRating {
    value: number;
    count?: number;
    max?: number;
}
/** Generic metadata */
type UCPMetadata = Record<string, unknown>;

/**
 * UCP Search Types
 * Types for search queries and catalog responses
 */

/** Search query from agent to gateway */
interface UCPSearchQuery {
    /** Free text search term (alias for text) */
    query?: string;
    /** Free text search term */
    text?: string;
    /** Category filter */
    category?: string;
    /** Location filter for nearby results */
    location?: UCPLocation;
    /** Maximum results to return */
    limit?: number;
    /** Pagination offset */
    offset?: number;
    /** Price range filter */
    priceRange?: {
        min?: number;
        max?: number;
    };
    /** Brand filter */
    brand?: string;
    /** Rating minimum filter */
    minRating?: number;
    /** Delivery speed preference */
    deliverySpeed?: 'express' | 'standard' | 'any';
    /** Additional filters as key-value */
    filters?: Record<string, string | number | boolean>;
    /** Preference weights for ranking */
    preferences?: UCPSearchPreferences;
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Search preference weights for ranking */
interface UCPSearchPreferences {
    /** Weight for price (0-1, lower price = higher score) */
    priceWeight?: number;
    /** Weight for distance (0-1, closer = higher score) */
    distanceWeight?: number;
    /** Weight for rating (0-1, higher rating = higher score) */
    ratingWeight?: number;
    /** Weight for delivery speed (0-1, faster = higher score) */
    deliveryWeight?: number;
    /** Bonus for verified sellers */
    verifiedBonus?: number;
}

/**
 * UCP Catalog Types
 * Types for catalog, items, providers
 */

/** Catalog response from search */
interface UCPCatalog {
    /** List of items matching search */
    items: UCPItem[];
    /** Total count (for pagination) */
    totalCount?: number;
    /** Offset used in query */
    offset?: number;
    /** Whether more results exist */
    hasMore?: boolean;
    /** Search metadata */
    metadata?: UCPMetadata;
}
/** Item (product/service) in catalog */
interface UCPItem {
    /** Unique item identifier */
    id: string;
    /** Item name */
    name: string;
    /** Item description */
    description?: string;
    /** Item images */
    images?: UCPImage[];
    /** Item price */
    price: UCPPrice;
    /** Original price if discounted */
    originalPrice?: UCPPrice;
    /** Provider/seller info */
    provider: UCPProvider;
    /** Category */
    category?: string;
    /** Subcategory */
    subcategory?: string;
    /** Brand name */
    brand?: string;
    /** Item rating */
    rating?: UCPRating;
    /** Available quantity */
    availableQuantity?: number;
    /** Item attributes (color, size, etc.) */
    attributes?: Record<string, string | number>;
    /** Fulfillment options */
    fulfillment?: UCPFulfillmentOption[];
    /** Location where item is available */
    location?: UCPLocation;
    /** Whether item can be returned */
    returnable?: boolean;
    /** Return window (ISO 8601 duration) */
    returnWindow?: string;
    /** Whether item can be cancelled */
    cancellable?: boolean;
    /** Whether COD is available */
    codAvailable?: boolean;
    /** Item tags for filtering */
    tags?: string[];
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Provider (seller) information */
interface UCPProvider {
    /** Provider unique identifier */
    id: string;
    /** Provider name */
    name: string;
    /** Provider logo */
    logo?: UCPImage;
    /** Provider rating */
    rating?: UCPRating;
    /** Whether provider is verified */
    verified?: boolean;
    /** Provider location */
    location?: UCPLocation;
    /** Supported payment methods */
    paymentMethods?: string[];
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Fulfillment option for an item */
interface UCPFulfillmentOption {
    /** Fulfillment type (delivery, pickup, etc.) */
    type: 'delivery' | 'pickup' | 'digital';
    /** Provider name (courier, etc.) */
    providerName?: string;
    /** Estimated delivery time range */
    estimatedTime?: UCPTimeRange;
    /** Fulfillment cost */
    cost?: UCPPrice;
    /** Tracking available */
    trackingAvailable?: boolean;
}

/**
 * UCP Session Types
 * Types for checkout session management
 */

/** Checkout session */
interface UCPSession {
    /** Unique session identifier */
    id: string;
    /** Session status */
    status: UCPSessionStatus;
    /** Items in session with quantities */
    items: UCPSessionItem[];
    /** Buyer information */
    buyer: UCPBuyer;
    /** Delivery address */
    deliveryAddress?: UCPAddress;
    /** Selected fulfillment */
    fulfillment?: UCPFulfillmentOption;
    /** Quote/pricing breakdown */
    quote?: UCPQuote;
    /** Payment information */
    payment?: UCPPayment;
    /** Session creation time */
    createdAt: string;
    /** Session update time */
    updatedAt: string;
    /** Session expiry time */
    expiresAt?: string;
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Session status values */
type UCPSessionStatus = 'created' | 'items_selected' | 'address_confirmed' | 'quote_received' | 'payment_pending' | 'payment_completed' | 'confirmed' | 'expired' | 'cancelled';
/** Item in session with quantity */
interface UCPSessionItem {
    /** Reference to catalog item */
    item: UCPItem;
    /** Selected quantity */
    quantity: number;
    /** Customizations/variants selected */
    customizations?: Record<string, string>;
    /** Add-ons selected */
    addOns?: UCPAddOn[];
}
/** Add-on item */
interface UCPAddOn {
    id: string;
    name: string;
    price: UCPPrice;
}
/** Buyer information */
interface UCPBuyer {
    /** Buyer name */
    name: string;
    /** Contact information */
    contact: UCPContact;
    /** Billing address */
    billingAddress?: UCPAddress;
    /** Tax ID (GST, etc.) */
    taxId?: string;
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Quote/pricing breakdown */
interface UCPQuote {
    /** Total price */
    total: UCPPrice;
    /** Item subtotal */
    subtotal: UCPPrice;
    /** Delivery/shipping cost */
    deliveryCost?: UCPPrice;
    /** Tax amount */
    tax?: UCPPrice;
    /** Discount amount */
    discount?: UCPPrice;
    /** Detailed breakup */
    breakup?: UCPQuoteBreakup[];
    /** Quote validity (ISO 8601 duration) */
    ttl?: string;
}
/** Quote breakup line item */
interface UCPQuoteBreakup {
    /** Title of charge */
    title: string;
    /** Type: item, delivery, tax, discount, etc. */
    type: 'item' | 'delivery' | 'tax' | 'discount' | 'fee' | 'other';
    /** Amount */
    price: UCPPrice;
    /** Item ID if type is item */
    itemId?: string;
    /** Quantity if type is item */
    quantity?: number;
}
/** Payment information */
interface UCPPayment {
    /** Payment method type */
    type: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod' | 'other';
    /** Payment status */
    status: UCPPaymentStatus;
    /** Transaction ID */
    transactionId?: string;
    /** Payment amount */
    amount: UCPPrice;
    /** Payment URI (for UPI, etc.) */
    uri?: string;
    /** Payment gateway/handler */
    handler?: string;
    /** UPI VPA if applicable */
    vpa?: string;
    /** Payment timestamp */
    completedAt?: string;
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Payment status values */
type UCPPaymentStatus = 'pending' | 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded';

/**
 * UCP Order Types
 * Types for order lifecycle management
 */

/** Order object */
interface UCPOrder {
    /** Unique order identifier */
    id: string;
    /** Order status */
    status: UCPOrderStatus;
    /** Provider/seller */
    provider: UCPProvider;
    /** Ordered items */
    items: UCPOrderItem[];
    /** Buyer information */
    buyer: UCPBuyer;
    /** Delivery address */
    deliveryAddress: UCPAddress;
    /** Fulfillment details */
    fulfillment: UCPOrderFulfillment;
    /** Quote/pricing */
    quote: UCPQuote;
    /** Payment information */
    payment: UCPPayment;
    /** Cancellation details if cancelled */
    cancellation?: UCPCancellation;
    /** Documents (invoice, etc.) */
    documents?: UCPDocument[];
    /** Order creation time */
    createdAt: string;
    /** Order update time */
    updatedAt: string;
    /** Custom metadata */
    metadata?: UCPMetadata;
}
/** Order status values */
type UCPOrderStatus = 'created' | 'accepted' | 'in_progress' | 'packed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
/** Item in order */
interface UCPOrderItem {
    /** Item ID */
    id: string;
    /** Item name */
    name: string;
    /** Quantity ordered */
    quantity: number;
    /** Price per unit */
    price: UCPPrice;
    /** Customizations selected */
    customizations?: Record<string, string>;
    /** Item-level status if different from order */
    status?: UCPOrderStatus;
}
/** Order fulfillment details */
interface UCPOrderFulfillment {
    /** Fulfillment type */
    type: 'delivery' | 'pickup' | 'digital';
    /** Fulfillment status */
    status: UCPFulfillmentStatus;
    /** Fulfillment provider (courier, etc.) */
    providerName?: string;
    /** Pickup location */
    pickupLocation?: UCPAddress;
    /** Delivery location */
    deliveryLocation?: UCPAddress;
    /** Estimated delivery time */
    estimatedTime?: UCPTimeRange;
    /** Actual pickup time */
    pickedUpAt?: string;
    /** Actual delivery time */
    deliveredAt?: string;
    /** Tracking information */
    tracking?: UCPTracking;
    /** Delivery agent details */
    agent?: UCPDeliveryAgent;
}
/** Fulfillment status values */
type UCPFulfillmentStatus = 'pending' | 'searching_agent' | 'agent_assigned' | 'picking_up' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled';
/** Tracking information */
interface UCPTracking {
    /** Tracking ID */
    id?: string;
    /** Tracking URL */
    url?: string;
    /** Current GPS location */
    currentLocation?: {
        gps: string;
        timestamp: string;
    };
    /** Status message */
    statusMessage?: string;
}
/** Delivery agent details */
interface UCPDeliveryAgent {
    name?: string;
    phone?: string;
    image?: string;
}
/** Cancellation details */
interface UCPCancellation {
    /** Who cancelled (buyer, seller, system) */
    cancelledBy: 'buyer' | 'seller' | 'system';
    /** Cancellation reason code */
    reasonCode?: string;
    /** Cancellation reason description */
    reason?: string;
    /** Cancellation time */
    cancelledAt: string;
    /** Refund details if applicable */
    refund?: UCPRefund;
}
/** Refund details */
interface UCPRefund {
    /** Refund status */
    status: 'pending' | 'processing' | 'completed' | 'failed';
    /** Refund amount */
    amount: UCPPrice;
    /** Refund transaction ID */
    transactionId?: string;
    /** Refund completion time */
    completedAt?: string;
}
/** Document attached to order */
interface UCPDocument {
    /** Document type */
    type: 'invoice' | 'receipt' | 'shipping_label' | 'other';
    /** Document label */
    label?: string;
    /** Document URL */
    url: string;
}

/**
 * MCP Tool Types
 * Defines schemas for MCP tools used in ONDC integration
 */

/**
 * Base MCP tool schema following MCP specification
 */
interface MCPTool {
    name: string;
    description: string;
    inputSchema: MCPToolInputSchema;
}
/**
 * JSON Schema for tool input validation
 */
interface MCPToolInputSchema {
    type: 'object';
    properties: Record<string, MCPProperty>;
    required?: string[];
    additionalProperties?: boolean;
}
/**
 * JSON Schema property definition
 */
interface MCPProperty {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description?: string;
    properties?: Record<string, MCPProperty>;
    items?: MCPProperty;
    required?: string[];
    enum?: string[];
    format?: string;
    minimum?: number;
    maximum?: number;
    default?: unknown;
}
/**
 * Tool execution result
 */
interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
}
/**
 * Text or data content block
 */
interface MCPContent {
    type: 'text' | 'resource' | 'image';
    text?: string;
    data?: string;
    uri?: string;
    mimeType?: string;
}
/**
 * ondc_search tool input
 */
interface ONDCSearchInput extends UCPSearchQuery {
    /** Maximum number of results to return (default: 10) */
    maxResults?: number;
    /** Include providers outside search radius (default: false) */
    expandSearch?: boolean;
}
/**
 * ondc_search tool output
 */
interface ONDCSearchOutput {
    /** Search results matching query */
    items: UCPItem[];
    /** Total count of available results */
    totalCount: number;
    /** Search metadata */
    metadata: MCPSearchMetadata;
}
/**
 * Search result metadata
 */
interface MCPSearchMetadata {
    /** Query timestamp */
    timestamp: string;
    /** Search duration in milliseconds */
    duration: number;
    /** Search radius used (meters) */
    radius?: number;
    /** Whether results were expanded */
    expanded: boolean;
}
/**
 * ondc_checkout tool input
 */
interface ONDCCheckoutInput {
    /** Selected items to checkout */
    items: Array<{
        /** Item ID */
        id: string;
        /** Provider ID */
        providerId: string;
        /** Quantity */
        quantity: number;
    }>;
    /** Buyer information */
    buyer: {
        /** Buyer name */
        name: string;
        /** Contact phone */
        phone: string;
        /** Contact email */
        email?: string;
        /** Delivery address */
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country?: string;
        };
    };
    /** Fulfillment option ID */
    fulfillmentOptionId?: string;
    /** Special instructions */
    instructions?: string;
}
/**
 * ondc_checkout tool output
 */
interface ONDCCheckoutOutput {
    /** Created session */
    session: UCPSession;
    /** Payment details */
    payment: {
        /** Total amount */
        amount: string;
        /** Currency code */
        currency: string;
        /** Payment URL/method */
        paymentUrl?: string;
        /** Payment status */
        status: 'pending' | 'processing' | 'completed' | 'failed';
    };
    /** Estimated delivery time */
    estimatedDelivery?: string;
}
/**
 * ondc_status tool input
 */
interface ONDCStatusInput {
    /** Session/Order ID to check status */
    sessionId: string;
}
/**
 * ondc_status tool output
 */
interface ONDCStatusOutput {
    /** Session ID */
    sessionId: string;
    /** Current status */
    status: 'created' | 'confirmed' | 'in_progress' | 'delivered' | 'cancelled' | 'failed';
    /** Status updates */
    updates: Array<{
        /** Status change timestamp */
        timestamp: string;
        /** Status description */
        status: string;
        /** Additional details */
        details?: string;
    }>;
    /** Tracking information if available */
    tracking?: {
        /** Current location */
        location?: {
            latitude: number;
            longitude: number;
        };
        /** ETA */
        eta?: string;
        /** Delivery agent info */
        agent?: {
            name: string;
            phone: string;
        };
    };
}
/**
 * ondc_cancel tool input
 */
interface ONDCCancelInput {
    /** Session/Order ID to cancel */
    sessionId: string;
    /** Cancellation reason */
    reason: string;
}
/**
 * ondc_cancel tool output
 */
interface ONDCCancelOutput {
    /** Session ID */
    sessionId: string;
    /** Cancellation status */
    status: 'pending' | 'approved' | 'rejected';
    /** Refund amount if applicable */
    refund?: {
        amount: string;
        currency: string;
        /** Estimated refund date */
        estimatedDate?: string;
    };
    /** Cancellation details */
    details: string;
}

/**
 * MCP Tool JSON Schema Definitions
 * Exports JSON Schema objects for MCP tool registration
 */

/**
 * ondc_search tool definition
 * Searches for items and providers on ONDC network
 */
declare const ondcSearchTool: MCPTool;
/**
 * ondc_checkout tool definition
 * Initiates checkout for selected items on ONDC
 */
declare const ondcCheckoutTool: MCPTool;
/**
 * ondc_status tool definition
 * Check status of an existing order/session
 */
declare const ondcStatusTool: MCPTool;
/**
 * ondc_cancel tool definition
 * Cancel an existing order/session
 */
declare const ondcCancelTool: MCPTool;
/**
 * All MCP tools exported as array
 * Useful for bulk registration
 */
declare const allMCPTools: MCPTool[];

export { type BecknAck, type BecknAckMessage, type BecknAction, type BecknAddOn, type BecknAddress, type BecknAgent, type BecknAuthorization, type BecknBilling, type BecknCancelMessage, type BecknCancelRequest, type BecknCancellation, type BecknCancellationReason, type BecknCatalog, type BecknCategory, type BecknCircle, type BecknCity, type BecknConfirmMessage, type BecknConfirmRequest, type BecknContact, type BecknContext, type BecknCountry, type BecknCredential, type BecknCustomer, type BecknDescriptor, type BecknDocument, type BecknDomain, type BecknError, type BecknFulfillment, type BecknFulfillmentEnd, type BecknImage, type BecknInitMessage, type BecknInitRequest, type BecknIntent, type BecknIntentCategory, type BecknIntentFulfillment, type BecknIntentFulfillmentEnd, type BecknIntentItem, type BecknIntentOffer, type BecknIntentProvider, type BecknItem, type BecknLocation, type BecknMeasure, type BecknMessage, type BecknOffer, type BecknOnCancelMessage, type BecknOnCancelResponse, type BecknOnConfirmMessage, type BecknOnConfirmResponse, type BecknOnInitMessage, type BecknOnInitResponse, type BecknOnSearchMessage, type BecknOnSearchResponse, type BecknOnSelectMessage, type BecknOnSelectResponse, type BecknOnStatusMessage, type BecknOnStatusResponse, type BecknOnTrackMessage, type BecknOnTrackResponse, type BecknOrder, type BecknOrderAddOn, type BecknOrderItem, type BecknOrderOffer, type BecknOrderProvider, type BecknPayment, type BecknPaymentParams, type BecknPerson, type BecknPrice, type BecknProvider, type BecknQuantity, type BecknQuote, type BecknQuoteBreakup, type BecknRating, type BecknSchedule, type BecknSearchMessage, type BecknSearchRequest, type BecknSelectMessage, type BecknSelectRequest, type BecknSettlementDetails, type BecknState, type BecknStatusMessage, type BecknStatusRequest, type BecknTag, type BecknTagGroup, type BecknTime, type BecknTimeRange, type BecknTrackMessage, type BecknTrackRequest, type BecknTracking, type BecknVehicle, type MCPContent, type MCPProperty, type MCPSearchMetadata, type MCPTool, type MCPToolInputSchema, type MCPToolResult, type ONDCCancelInput, type ONDCCancelOutput, type ONDCCheckoutInput, type ONDCCheckoutOutput, type ONDCSearchInput, type ONDCSearchOutput, type ONDCStatusInput, type ONDCStatusOutput, type UCPAddOn, type UCPAddress, type UCPBuyer, type UCPCancellation, type UCPCatalog, type UCPContact, type UCPDeliveryAgent, type UCPDocument, type UCPFulfillmentOption, type UCPFulfillmentStatus, type UCPImage, type UCPItem, type UCPLocation, type UCPMetadata, type UCPOrder, type UCPOrderFulfillment, type UCPOrderItem, type UCPOrderStatus, type UCPPayment, type UCPPaymentStatus, type UCPPrice, type UCPProvider, type UCPQuote, type UCPQuoteBreakup, type UCPRating, type UCPRefund, type UCPSearchPreferences, type UCPSearchQuery, type UCPSession, type UCPSessionItem, type UCPSessionStatus, type UCPTimeRange, type UCPTracking, allMCPTools, ondcCancelTool, ondcCheckoutTool, ondcSearchTool, ondcStatusTool };
