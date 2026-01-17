import type { UCPItem, UCPPrice, BecknItem } from '../types';

type ProductLike = UCPItem | BecknItem;

function getProductName(product: ProductLike): string {
  if ('descriptor' in product && product.descriptor?.name) {
    return product.descriptor.name;
  }
  if ('name' in product && product.name) {
    return product.name;
  }
  return 'Unknown';
}

function getProductDescription(product: ProductLike): string {
  if ('descriptor' in product && product.descriptor?.short_desc) {
    return product.descriptor.short_desc;
  }
  if ('description' in product && product.description) {
    return product.description;
  }
  return '';
}

function getProductPrice(product: ProductLike): UCPPrice | null {
  if ('price' in product && product.price) {
    return product.price;
  }
  return null;
}

function getProductRating(product: ProductLike): number | null {
  if ('rating' in product && typeof product.rating === 'number') {
    return product.rating;
  }
  if ('rating' in product && product.rating?.value) {
    return product.rating.value;
  }
  return null;
}

function getProviderName(product: ProductLike): string {
  if ('_provider' in product && product._provider) {
    return product._provider;
  }
  if ('provider' in product && product.provider?.name) {
    return product.provider.name;
  }
  return 'Unknown Provider';
}

function getProductImages(product: ProductLike): Array<{ url: string }> | undefined {
  if ('images' in product && product.images) {
    return product.images;
  }
  return undefined;
}

export interface ProductCardProps {
  product: ProductLike;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const name = getProductName(product);
  const description = getProductDescription(product);
  const price = getProductPrice(product);
  const rating = getProductRating(product);
  const providerName = getProviderName(product);
  const images = getProductImages(product);

  return (
    <div
      className="product-card"
      onClick={onClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {images?.[0] && (
        <img
          src={images[0].url}
          alt={name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      )}
      <h3>{name}</h3>
      {description && <p>{description}</p>}
      {price && <PriceDisplay price={price} />}
      {rating && <RatingStars rating={rating} />}
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        Seller: {providerName}
      </p>
    </div>
  );
}

export interface PriceDisplayProps {
  price: UCPPrice;
}

export function PriceDisplay({ price }: PriceDisplayProps) {
  const value = price.value ?? price.amount?.toString() ?? '0';
  return (
    <div className="price-display">
      <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
        {price.currency} {value}
      </span>
    </div>
  );
}

export interface RatingStarsProps {
  rating: number;
  max?: number;
}

export function RatingStars({ rating, max = 5 }: RatingStarsProps) {
  if (rating === undefined || rating === null) {
    return null;
  }

  const stars = Array.from({ length: max }, (_, i) => (
    <span key={i} style={{ color: i < rating ? '#f59e0b' : '#d1d5db' }}>
      ★
    </span>
  ));

  return (
    <div className="rating-stars">
      {stars} <span style={{ marginLeft: '8px' }}>{rating.toFixed(1)}</span>
    </div>
  );
}
