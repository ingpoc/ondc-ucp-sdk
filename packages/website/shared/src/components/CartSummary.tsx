export interface CartSummaryProps {
  subtotal: number;
  currency?: string;
  deliveryCost?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
}

export function CartSummary({
  subtotal,
  currency = 'INR',
  deliveryCost,
  tax,
  discount,
  onCheckout,
  checkoutDisabled = false,
}: CartSummaryProps) {
  // Calculate total
  const total = subtotal + (deliveryCost ?? 0) + (tax ?? 0) - (discount ?? 0);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f9fafb',
      }}
    >
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3em' }}>Order Summary</h2>

      {/* Line Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Subtotal:</span>
          <span style={{ fontWeight: 'bold' }}>
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>

        {deliveryCost !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery:</span>
            <span style={{ fontWeight: 'bold' }}>
              {currency} {deliveryCost.toFixed(2)}
            </span>
          </div>
        )}

        {tax !== undefined && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax:</span>
            <span style={{ fontWeight: 'bold' }}>
              {currency} {tax.toFixed(2)}
            </span>
          </div>
        )}

        {discount !== undefined && discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span>Discount:</span>
            <span style={{ fontWeight: 'bold' }}>
              -{currency} {discount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Total */}
      <div
        style={{
          borderTop: '2px solid #ddd',
          paddingTop: '16px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '1.2em',
        }}
      >
        <span style={{ fontWeight: 'bold' }}>Total:</span>
        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>
          {currency} {total.toFixed(2)}
        </span>
      </div>

      {/* Checkout Button */}
      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={checkoutDisabled}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: checkoutDisabled ? '#d1d5db' : '#16a34a',
            color: 'white',
            fontSize: '1em',
            fontWeight: 'bold',
            cursor: checkoutDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
