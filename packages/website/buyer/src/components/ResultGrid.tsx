import { ProductCard } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: '20px',
};

const LOADING_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  gap: '16px',
};

const SPINNER_STYLE = {
  width: '40px',
  height: '40px',
  border: '4px solid #e2e8f0',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const LOADING_TEXT_STYLE = {
  fontSize: '16px',
  color: '#64748b',
  fontWeight: '500',
};

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: '60px 20px',
};

const EMPTY_STATE_ICON_STYLE = {
  fontSize: '48px',
  marginBottom: '16px',
};

const EMPTY_STATE_TITLE_STYLE = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 8px 0',
};

const EMPTY_STATE_TEXT_STYLE = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

export interface ResultGridProps {
  items: UCPItem[];
  onItemClick?: (item: UCPItem) => void;
  loading?: boolean;
}

export function ResultGrid({ items, onItemClick, loading }: ResultGridProps): JSX.Element {
  if (loading) {
    return (
      <div style={LOADING_CONTAINER_STYLE}>
        <div style={SPINNER_STYLE} />
        <p style={LOADING_TEXT_STYLE}>Searching for products...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <div style={EMPTY_STATE_ICON_STYLE}>🔍</div>
        <h3 style={EMPTY_STATE_TITLE_STYLE}>No results found</h3>
        <p style={EMPTY_STATE_TEXT_STYLE}>
          Try adjusting your search terms or filters to find what you're looking for
        </p>
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
