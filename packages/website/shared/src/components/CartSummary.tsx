import { SPACING, TYPOGRAPHY, RADIUS, BUTTON, DRAMS } from '@ondc-agent/shared/design-system';

export interface CartSummaryProps {
  subtotal: number;
  currency?: string;
  deliveryCost?: number;
  tax?: number;
  discount?: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
}

const CONTAINER_STYLE = {
  border: `1px solid ${DRAMS.grayHover}`,
  borderRadius: RADIUS.lg,
  padding: SPACING.xl,
  backgroundColor: DRAMS.grayTrack,
};

const LINE_ITEM_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: SPACING.sm,
  ...TYPOGRAPHY.body,
};

const TOTAL_STYLE = {
  borderTop: `2px solid ${DRAMS.grayHover}`,
  paddingTop: SPACING.lg,
  marginBottom: SPACING.lg,
  display: 'flex',
  justifyContent: 'space-between',
  ...TYPOGRAPHY.h4,
};

const CHECKOUT_BUTTON_STYLE = {
  ...BUTTON.primary,
  width: '100%',
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
      <span style={{ fontWeight: TYPOGRAPHY.label.fontWeight }}>
        {showNegative && value > 0 ? '-' : ''}{currency} {value.toFixed(2)}
      </span>
    </div>
  );

  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={{ ...TYPOGRAPHY.h3, margin: `0 0 ${SPACING.md} 0` }}>Order Summary</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm, marginBottom: SPACING.lg }}>
        {renderLineItem('Subtotal', subtotal)}
        {deliveryCost !== undefined && renderLineItem('Delivery', deliveryCost)}
        {tax !== undefined && renderLineItem('Tax', tax)}
        {discount !== undefined && discount > 0 && renderLineItem('Discount', discount, DRAMS.orange, true)}
      </div>

      <div style={TOTAL_STYLE}>
        <span style={{ fontWeight: TYPOGRAPHY.label.fontWeight }}>Total:</span>
        <span style={{ fontWeight: TYPOGRAPHY.label.fontWeight, color: DRAMS.orange }}>
          {currency} {total.toFixed(2)}
        </span>
      </div>

      {onCheckout && (
        <button
          onClick={onCheckout}
          disabled={checkoutDisabled}
          style={{
            ...CHECKOUT_BUTTON_STYLE,
            opacity: checkoutDisabled ? 0.5 : 1,
            cursor: checkoutDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          Proceed to Checkout
        </button>
      )}
    </div>
  );
}
