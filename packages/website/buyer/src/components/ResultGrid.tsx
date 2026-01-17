import { ProductCard } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';
import { DRAMS_EMPTY_STATE, SPACING, DRAMS, DRAMS_CARD, TYPOGRAPHY } from '@ondc-agent/shared/design-system';

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: SPACING.lg,
};

const LOADING_CONTAINER_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: `${SPACING['3xl']} ${SPACING.lg}`,
  gap: SPACING.md,
};

const SPINNER_STYLE = {
  width: '40px',
  height: '40px',
  border: `4px solid ${DRAMS.grayTrack}`,
  borderTopColor: DRAMS.orange,
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const LOADING_TEXT_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
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
      <div style={DRAMS_EMPTY_STATE.container}>
        <div style={DRAMS_EMPTY_STATE.icon}>🔍</div>
        <h3 style={DRAMS_EMPTY_STATE.title}>No results found</h3>
        <p style={DRAMS_EMPTY_STATE.message}>
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
