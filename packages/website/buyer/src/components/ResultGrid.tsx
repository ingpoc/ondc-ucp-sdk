import { ProductCard } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

export interface ResultGridProps {
  items: UCPItem[];
  onItemClick?: (item: UCPItem) => void;
  loading?: boolean;
}

export function ResultGrid({ items, onItemClick, loading }: ResultGridProps) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>No results found</p>
        <p style={{ color: '#666' }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
      }}
    >
      {items.map((item) => (
        <ProductCard
          key={item.id}
          product={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  );
}
