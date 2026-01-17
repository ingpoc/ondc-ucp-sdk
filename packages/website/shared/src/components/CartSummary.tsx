export interface CartSummaryProps {
  subtotal: number;
  currency?: string;
  deliveryCost?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
}

// Extract static styles
const CONTAINER_STYLE = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '20px',
  backgroundColor: '#f9fafb',
};

const LINE_ITEM_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const TOTAL_STYLE = {
  borderTop: '2px solid #ddd',
  paddingTop: '16px',
  marginBottom: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '1.2em',
};

const CHECKOUT_BUTTON_STYLE = {
  width: '100%',
  padding: '12px',
  border: 'none',
  borderRadius: '6px',
  color: 'white',
  fontSize: '1em',
  fontWeight: 'bold',
  cursor: 'pointer',
};

export function CartSummary({
  subtotal,
  currency = 'INR',
  deliveryCost,
  tax,
  discount,
  onCheckout,
  checkoutDisabled = false,
}: CartSummaryProps) {
  const total = subtotal + (deliveryCost ?? 0) + (tax ?? 0) - (discount ?? 0);

  const renderLineItem = (label: string, value: number, color?: string, showNegative = false) => (
    <div key={label} style={{ ...LINE_ITEM_STYLE, color: color || 'inherit' }}>
      <span>{label}:</span>
      <span style={{ fontWeight: 'bold' }}>
        {showNegative && value > 0 ? '-' : ''}{currency} {value.toFixed(2)}
      </span>
    </div>
  );

  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3em' }}>Order Summary</h2>

      {/* Line Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {renderLineItem('Subtotal', subtotal)}
        {deliveryCost !== undefined && renderLineItem('Delivery', deliveryCost)}
        {tax !== undefined && renderLineItem('Tax', tax)}
        {discount !== undefined && discount > 0 && renderLineItem('Discount', discount, '#16a34a', true)}
      </div>

      {/* Total */}
      <div style={TOTAL_STYLE}>
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
            ...CHECKOUT_BUTTON_STYLE,
            backgroundColor: checkoutDisabled ? '#d1d5db' : '#16a34a',
            cursor: checkoutDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
