import { useNavigate } from 'react-router-dom';
import { useCart, CartItem, CartSummary } from '@ondc-website/shared';

const CONTAINER_STYLE = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '20px',
};

const BUTTON_STYLE = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
};

const PRIMARY_BUTTON_STYLE = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#16a34a',
  color: 'white',
  fontSize: '1em',
  fontWeight: 'bold',
  cursor: 'pointer',
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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>Error: {error}</p>
        <button onClick={clearError} style={BUTTON_STYLE}>
          Dismiss
        </button>
      </div>
    );
  }

  if (!session || itemCount === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Add some items to get started!
        </p>
        <button
          onClick={() => navigate('/search')}
          style={PRIMARY_BUTTON_STYLE}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const currency = session.items[0]?.item.price?.currency || 'INR';
  const itemLabel = itemCount === 1 ? 'item' : 'items';

  return (
    <div style={CONTAINER_STYLE}>
      <h1>Shopping Cart</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        {itemCount} {itemLabel} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div>
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

        <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
          <CartSummary
            subtotal={subtotal}
            currency={currency}
            onCheckout={handleCheckout}
            checkoutDisabled={loading || itemCount === 0}
          />
        </div>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/search')}
          style={BUTTON_STYLE}
        >
          ← Continue Shopping
        </button>
      </div>
    </div>
  );
}
