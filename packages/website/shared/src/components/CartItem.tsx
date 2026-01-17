import type { UCPSessionItem } from '../types';

export interface CartItemProps {
  item: UCPSessionItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  disabled?: boolean;
}

// Extract static styles
const CONTAINER_STYLE = {
  display: 'flex',
  gap: '16px',
  padding: '16px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  marginBottom: '12px',
};

const QUANTITY_BUTTON_STYLE = {
  width: '32px',
  height: '32px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  backgroundColor: 'white',
  cursor: 'pointer',
  fontSize: '18px',
};

const REMOVE_BUTTON_STYLE = {
  padding: '6px 12px',
  border: '1px solid #dc2626',
  borderRadius: '4px',
  backgroundColor: 'white',
  color: '#dc2626',
  cursor: 'pointer',
  fontSize: '0.9em',
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
        backgroundColor: disabled ? '#f5f5f5' : 'white',
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
            borderRadius: '4px',
          }}
        />
      )}

      {/* Product Details */}
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>{name}</h3>
        {description && (
          <p style={{ margin: '0 0 8px 0', fontSize: '0.9em', color: '#666' }}>
            {description}
          </p>
        )}
        <p style={{ margin: '0', fontSize: '0.9em', color: '#666' }}>
          Seller: {providerName}
        </p>
        <p style={{ margin: '8px 0 0 0', fontWeight: 'bold' }}>
          {currency} {priceValue.toFixed(2)} per item
        </p>
      </div>

      {/* Quantity Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleDecrement}
            disabled={disabled || item.quantity <= 1}
            style={{
              ...QUANTITY_BUTTON_STYLE,
              cursor: disabled || item.quantity <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            −
          </button>
          <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={disabled}
            style={{
              ...QUANTITY_BUTTON_STYLE,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            +
          </button>
        </div>

        {/* Total Price */}
        <p style={{ margin: '0', fontWeight: 'bold', fontSize: '1.1em' }}>
          {currency} {totalPrice.toFixed(2)}
        </p>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.item.id)}
          disabled={disabled}
          style={{
            ...REMOVE_BUTTON_STYLE,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
