import type { UCPSessionItem } from '../types';
import { QUANTITY_CONTROL, DRAMS_CARD, PILL_BUTTON, SPACING, TYPOGRAPHY, DRAMS, disabled as disabledStyle, RADIUS } from '@ondc-agent/shared/design-system';

export interface CartItemProps {
  item: UCPSessionItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

const CONTAINER_STYLE = {
  ...DRAMS_CARD.base,
  display: 'flex',
  gap: SPACING.lg,
  padding: SPACING.lg,
  marginBottom: SPACING.md,
};

export function CartItem({ item, onUpdateQuantity, onRemove, disabled = false }: CartItemProps) {
  const descriptor = (item.item as any).descriptor;
  const name = descriptor?.name || (item.item as any).name || 'Unknown Product';
  const description = descriptor?.short_desc || (item.item as any).description || '';
  const providerName = (item.item as any)._provider || (item.item as any).provider?.name || 'Unknown Provider';

  const priceValue = typeof item.item.price?.value === 'string'
    ? parseFloat(item.item.price.value)
    : (item.item.price?.value ?? 0);
  const currency = item.item.price?.currency || 'INR';
  const totalPrice = priceValue * item.quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      onUpdateQuantity(item.item.id, newQuantity);
    }
  };

  const handleDecrement = () => handleQuantityChange(item.quantity - 1);
  const handleIncrement = () => handleQuantityChange(item.quantity + 1);

  return (
    <div
      style={{
        ...CONTAINER_STYLE,
        ...(disabled ? disabledStyle : {}),
      }}
    >
      {/* Product Image */}
      {item.item.images?.[0] && (
        <img
          src={item.item.images[0].url}
          alt={name}
          style={{
            width: '100px',
            height: '100px',
            objectFit: 'cover',
            borderRadius: RADIUS.card,
          }}
        />
      )}

      {/* Product Details */}
      <div style={{ flex: 1 }}>
        <h3 style={{ ...TYPOGRAPHY.label, margin: `0 0 ${SPACING.sm} 0`, color: DRAMS.textDark }}>{name}</h3>
        {description && (
          <p style={{ ...TYPOGRAPHY.body, margin: `0 0 ${SPACING.sm} 0`, color: DRAMS.textLight }}>
            {description}
          </p>
        )}
        <p style={{ ...TYPOGRAPHY.body, margin: '0', color: DRAMS.textLight }}>
          Seller: {providerName}
        </p>
        <p style={{ ...TYPOGRAPHY.label, margin: `${SPACING.sm} 0 0 0`, fontWeight: 600 }}>
          {currency} {priceValue.toFixed(2)} per item
        </p>
      </div>

      {/* Quantity Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: SPACING.md }}>
        <div style={QUANTITY_CONTROL.container}>
          <button
            onClick={handleDecrement}
            disabled={disabled || item.quantity <= 1}
            style={{
              ...QUANTITY_CONTROL.button,
              ...(disabled || item.quantity <= 1 ? disabledStyle : {}),
            }}
          >
            −
          </button>
          <span style={QUANTITY_CONTROL.value}>
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={disabled}
            style={{
              ...QUANTITY_CONTROL.button,
              ...(disabled ? disabledStyle : {}),
            }}
          >
            +
          </button>
        </div>

        {/* Total Price */}
        <p style={{ ...TYPOGRAPHY.label, margin: '0', fontWeight: 600, fontSize: '1.1em' }}>
          {currency} {totalPrice.toFixed(2)}
        </p>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.item.id)}
          disabled={disabled}
          style={{
            ...PILL_BUTTON.gray,
            padding: `${SPACING.xs} ${SPACING.md}`,
            ...(disabled ? disabledStyle : {}),
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
