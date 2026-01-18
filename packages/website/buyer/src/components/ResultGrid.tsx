import { DramsProductCard } from '@ondc-agent/shared/design-system';
import type { UCPItem } from '@ondc-website/shared';
import { SPACING, DRAMS, TYPOGRAPHY, RADIUS } from '@ondc-agent/shared/design-system';

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
  gap: SPACING.xl,
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

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: SPACING['3xl'],
};

const EMPTY_ICON_STYLE = {
  ...TYPOGRAPHY.h1,
  marginBottom: SPACING.md,
};

const EMPTY_TITLE_STYLE = {
  ...TYPOGRAPHY.h3,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.md} 0`,
};

const EMPTY_MESSAGE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: 0,
};

export interface ResultGridProps {
  items: UCPItem[];
  onItemClick?: (item: UCPItem) => void;
  onAddToCart?: (item: UCPItem) => void;
  loading?: boolean;
}

export function ResultGrid({ items, onItemClick, onAddToCart, loading }: ResultGridProps): JSX.Element {
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
        <div style={EMPTY_ICON_STYLE}>🔍</div>
        <h3 style={EMPTY_TITLE_STYLE}>No results found</h3>
        <p style={EMPTY_MESSAGE_STYLE}>
          Try adjusting your search terms or filters to find what you're looking for
        </p>
      </div>
    );
  }

  return (
    <div style={GRID_STYLE}>
      {items.map((item) => (
        <DramsProductCard
          key={item.id}
          name={item.name ?? 'Product'}
          category={item.category}
          price={`${item.price?.currency || '₹'} ${item.price?.value ?? item.price?.amount ?? '0'}`}
          image={item.images?.[0]?.url ?? undefined}
          onClick={() => onItemClick?.(item)}
          onAdd={onAddToCart ? () => onAddToCart(item) : undefined}
        />
      ))}
    </div>
  );
}
