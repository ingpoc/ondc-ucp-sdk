import { useState } from 'react';
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

const CARD_STYLE = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'box-shadow 0.2s, transform 0.2s',
};

const CARD_HOVER_STYLE = {
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transform: 'translateY(-2px)',
};

const IMAGE_STYLE = {
  width: '100%',
  height: '200px',
  objectFit: 'cover' as const,
  borderRadius: '6px',
  marginBottom: '12px',
  backgroundColor: '#f1f5f9',
};

const TITLE_STYLE = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
};

const DESCRIPTION_STYLE = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 12px 0',
  lineHeight: '1.5',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden' as const,
};

const PROVIDER_STYLE = {
  fontSize: '12px',
  color: '#94a3b8',
  marginTop: '8px',
  marginBottom: '0',
};

export interface ProductCardProps {
  product: ProductLike;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const name = getProductName(product);
  const description = getProductDescription(product);
  const price = getProductPrice(product);
  const rating = getProductRating(product);
  const providerName = getProviderName(product);
  const images = getProductImages(product);

  const cardStyle = onClick
    ? { ...CARD_STYLE, ...(isHovered ? CARD_HOVER_STYLE : {}) }
    : { ...CARD_STYLE, cursor: 'default' };

  return (
    <div
      className="product-card"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
    >
      {images?.[0] ? (
        <img
          src={images[0].url}
          alt={name}
          style={IMAGE_STYLE}
        />
      ) : (
        <div
          style={{
            ...IMAGE_STYLE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            color: '#cbd5e1',
          }}
        >
          📦
        </div>
      )}

      <h3 style={TITLE_STYLE}>{name}</h3>

      {description && (
        <p style={DESCRIPTION_STYLE}>
          {description}
        </p>
      )}

      {price && <PriceDisplay price={price} />}

      {rating && <RatingStars rating={rating} />}

      <p style={PROVIDER_STYLE}>
        Seller: {providerName}
      </p>
    </div>
  );
}

export interface PriceDisplayProps {
  price: UCPPrice;
}

const PRICE_STYLE = {
  fontWeight: '700',
  fontSize: '18px',
  color: '#16a34a',
  margin: '8px 0',
};

export function PriceDisplay({ price }: PriceDisplayProps) {
  const value = price.value ?? price.amount?.toString() ?? '0';
  return (
    <div className="price-display" style={PRICE_STYLE}>
      {price.currency} {value}
    </div>
  );
}

export interface RatingStarsProps {
  rating: number;
  max?: number;
}

const RATING_CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  margin: '8px 0',
};

const STAR_STYLE = {
  fontSize: '16px',
};

const RATING_TEXT_STYLE = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
  marginLeft: '4px',
};

export function RatingStars({ rating, max = 5 }: RatingStarsProps) {
  if (rating === undefined || rating === null) {
    return null;
  }

  const stars = Array.from({ length: max }, (_, i) => (
    <span
      key={i}
      style={{
        ...STAR_STYLE,
        color: i < rating ? '#f59e0b' : '#e2e8f0',
      }}
    >
      ★
    </span>
  ));

  return (
    <div className="rating-stars" style={RATING_CONTAINER_STYLE}>
      {stars}
      <span style={RATING_TEXT_STYLE}>{rating.toFixed(1)}</span>
    </div>
  );
}
