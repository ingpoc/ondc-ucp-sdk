import { useNavigate } from 'react-router-dom';
import { useCart, CartItem, CartSummary } from '@ondc-website/shared';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '0',
  width: '100%',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: '0 80px',
};

const HEADER_STYLE = {
  marginBottom: '40px',
  padding: '64px 80px 40px 80px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  borderBottom: '2px solid #e2e8f0',
};

const PAGE_TITLE_STYLE = {
  fontSize: '42px',
  fontWeight: 800,
  letterSpacing: '-1.5px',
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const SUBTITLE_STYLE = {
  fontSize: '14px',
  color: '#475569',
  margin: 0,
};

const GRID_LAYOUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '24px',
  marginBottom: '24px',
};

const ITEMS_SECTION_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '16px',
};

const SUMMARY_SECTION_STYLE = {
  position: 'sticky' as const,
  top: '24px',
  alignSelf: 'start' as const,
};

const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: '#475569',
  fontSize: '14px',
};

const ERROR_STYLE = {
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  fontSize: '14px',
  textAlign: 'center' as const,
  maxWidth: '600px',
  margin: '0 auto',
};

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: '48px 24px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

const EMPTY_TITLE_STYLE = {
  fontSize: '24px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const EMPTY_MESSAGE_STYLE = {
  fontSize: '14px',
  color: '#475569',
  margin: '0 0 24px 0',
};

const BUTTON_PRIMARY_STYLE = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

const BUTTON_SECONDARY_STYLE = {
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const BUTTON_ERROR_STYLE = {
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
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
          <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
          <p style={{ margin: '4px 0 0 0' }}>{error}</p>
          <button
            onClick={clearError}
            style={{
              ...BUTTON_ERROR_STYLE,
              marginTop: '16px',
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
            <h2 style={EMPTY_TITLE_STYLE}>Your Cart is Empty</h2>
            <p style={EMPTY_MESSAGE_STYLE}>
              Add some items to get started!
            </p>
            <button
              onClick={() => navigate('/search')}
              style={BUTTON_PRIMARY_STYLE}
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
            style={BUTTON_SECONDARY_STYLE}
          >
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
