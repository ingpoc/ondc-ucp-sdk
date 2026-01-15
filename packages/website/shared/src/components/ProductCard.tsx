import type { UCPItem, UCPPrice } from '../types';

export interface ProductCardProps {
  product: UCPItem;
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  // Handle both UCPItem (name) and BecknItem (descriptor.name) structures
  const name = (product as any).descriptor?.name || product.name || 'Unknown';
  const description = (product as any).descriptor?.short_desc || product.description || '';
  const providerName = (product as any)._provider || product.provider?.name || 'Unknown Provider';

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
      {product.images?.[0] && (
        <img
          src={product.images[0].url}
          alt={name}
          style={{ width: '100%', height: '200px', objectFit: 'cover' }}
        />
      )}
      <h3>{name}</h3>
      {description && <p>{description}</p>}
      <PriceDisplay price={product.price} />
      {product.rating && <RatingStars rating={product.rating.value} />}
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
