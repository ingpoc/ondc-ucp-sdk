import { useNavigate } from 'react-router-dom';
import { useCart, CartItem, CartSummary } from '@ondc-website/shared';

export function CartPage() {
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

  const handleCheckout = () => {
    // Navigate to checkout page (to be implemented in SDK-BUYER-CART-004)
    navigate('/checkout');
  };

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
        <button
          onClick={clearError}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
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
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#16a34a',
            color: 'white',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  // Get currency from first item (assume all items use same currency)
  const currency = session.items[0]?.item.price?.currency || 'INR';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Shopping Cart</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Cart Items */}
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

        {/* Cart Summary */}
        <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
          <CartSummary
            subtotal={subtotal}
            currency={currency}
            onCheckout={handleCheckout}
            checkoutDisabled={loading || itemCount === 0}
          />
        </div>
      </div>

      {/* Back to Shopping Link */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={() => navigate('/search')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '0.95em',
          }}
        >
          ← Continue Shopping
        </button>
      </div>
    </div>
  );
}
