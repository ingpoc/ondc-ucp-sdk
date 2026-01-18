import { useNavigate } from 'react-router-dom';
import { useCart, CartItem, CartSummary } from '@ondc-website/shared';
import { DRAMS, SPACING, TYPOGRAPHY, BUTTON, CARD, BADGE, PILL_BUTTON } from '@ondc-agent/shared/design-system';

// DRAMS: Clean white background
const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  padding: '0',
  width: '100%',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: '0 80px',
};

// DRAMS: Minimal header - white with subtle gray track background
const HEADER_STYLE = {
  marginBottom: SPACING.xl,
  padding: `64px 80px ${SPACING.xl} 80px`,
  background: DRAMS.grayTrack,
};

const PAGE_TITLE_STYLE = {
  ...TYPOGRAPHY.h1,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.md} 0`,
};

const SUBTITLE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: 0,
};

const GRID_LAYOUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: SPACING.xl,
  marginBottom: SPACING.xl,
};

const ITEMS_SECTION_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: SPACING.lg,
};

const SUMMARY_SECTION_STYLE = {
  position: 'sticky' as const,
  top: SPACING.xl,
  alignSelf: 'start' as const,
};

const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING['3xl'],
  color: DRAMS.textLight,
  ...TYPOGRAPHY.body,
};

const ERROR_STYLE = {
  ...BADGE.error,
  padding: SPACING.lg,
  textAlign: 'center' as const,
  maxWidth: '600px',
  margin: '0 auto',
};

const EMPTY_STATE_STYLE = {
  ...CARD.base,
  textAlign: 'center' as const,
  padding: `${SPACING['3xl']} ${SPACING.xl}`,
};

const FOOTER_STYLE = {
  textAlign: 'center' as const,
};

export function CartPage(): JSX.Element {
  const navigate = useNavigate();
  const {
    session,
    loading,
    error,
    removeFromCart,
    updateQuantity,
    clearError,
    itemCount,
    subtotal,
  } = useCart();

  function handleCheckout(): void {
    navigate('/checkout');
  }

  if (loading && !session) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={LOADING_STYLE}>
          Loading cart...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={ERROR_STYLE}>
          <p style={{ margin: 0, ...TYPOGRAPHY.label }}>Error</p>
          <p style={{ margin: `${SPACING.xs} 0 0 0` }}>{error}</p>
          <button
            onClick={clearError}
            style={{
              ...BUTTON.secondary,
              marginTop: SPACING.lg,
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!session || itemCount === 0) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={CONTENT_STYLE}>
          <div style={EMPTY_STATE_STYLE}>
            <h2 style={{ ...TYPOGRAPHY.h2, color: DRAMS.textDark, margin: `0 0 ${SPACING.md} 0` }}>Your Cart is Empty</h2>
            <p style={{ ...TYPOGRAPHY.body, color: DRAMS.textLight, margin: `0 0 ${SPACING.xl} 0` }}>
              Add some items to get started!
            </p>
            <button
              onClick={() => navigate('/search')}
              style={PILL_BUTTON.orange}
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currency = session.items[0]?.item.price?.currency || 'INR';
  const itemLabel = itemCount === 1 ? 'item' : 'items';

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Shopping Cart</h1>
          <p style={SUBTITLE_STYLE}>
            {itemCount} {itemLabel} in your cart
          </p>
        </div>

        <div style={GRID_LAYOUT_STYLE}>
          <div style={ITEMS_SECTION_STYLE}>
            {session.items.map((item: any) => (
              <CartItem
                key={item.item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                disabled={loading}
              />
            ))}
          </div>

          <div style={SUMMARY_SECTION_STYLE}>
            <CartSummary
              subtotal={subtotal}
              currency={currency}
              onCheckout={handleCheckout}
              checkoutDisabled={loading || itemCount === 0}
            />
          </div>
        </div>

        <div style={FOOTER_STYLE}>
          <button
            onClick={() => navigate('/search')}
            style={BUTTON.secondary}
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
