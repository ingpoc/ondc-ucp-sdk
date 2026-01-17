import { ProductCard } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '20px',
};

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: '40px',
};

export interface ResultGridProps {
  items: UCPItem[];
  onItemClick?: (item: UCPItem) => void;
  loading?: boolean;
}

export function ResultGrid({ items, onItemClick, loading }: ResultGridProps): JSX.Element {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (items.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <p>No results found</p>
        <p style={{ color: '#666' }}>Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div style={GRID_STYLE}>
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
