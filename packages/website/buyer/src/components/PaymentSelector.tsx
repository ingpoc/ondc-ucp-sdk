import { useState } from 'react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, CARD, TEXT_BOX, DRAMS } from '@ondc-agent/shared/design-system';

export type PaymentMethod = any;

const PAYMENT_METHODS = [
  {
    type: 'upi' as const,
    label: 'UPI',
    description: 'Pay using any UPI app (GPay, PhonePe, Paytm)',
    icon: '📱',
  },
  {
    type: 'card' as const,
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: '💳',
  },
  {
    type: 'netbanking' as const,
    label: 'Net Banking',
    description: 'Pay from your bank account',
    icon: '🏦',
  },
  {
    type: 'wallet' as const,
    label: 'Wallet',
    description: 'Paytm, Amazon Pay, Mobikwik',
    icon: '👛',
  },
  {
    type: 'cod' as const,
    label: 'Cash on Delivery',
    description: 'Pay when you receive the order',
    icon: '💵',
  },
] as const;

const CONTAINER_STYLE = {
  ...CARD.base,
  marginBottom: SPACING.xl,
};

const HEADER_STYLE = {
  ...TYPOGRAPHY.h4,
  color: COLORS.textPrimary,
  margin: `0 0 ${SPACING.lg} 0`,
};

const OPTION_STYLE = {
  display: 'flex',
  alignItems: 'center',
  padding: `${SPACING.md} ${SPACING.lg}`,
  border: `2px solid ${COLORS.border}`,
  borderRadius: RADIUS.lg,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: 'white',
};

const OPTION_HOVER_STYLE = {
  borderColor: COLORS.border,
  backgroundColor: COLORS.bgHover,
};

// DRAMS: Orange border for selected state
const OPTION_SELECTED_STYLE = {
  border: `2px solid ${DRAMS.orange}`,
  backgroundColor: DRAMS.grayTrack,
};

const RADIO_STYLE = {
  marginRight: SPACING.md,
  width: '20px',
  height: '20px',
  cursor: 'pointer',
};

const ICON_STYLE = {
  ...TYPOGRAPHY.h2,
  marginRight: SPACING.md,
};

const LABEL_STYLE = {
  flex: 1,
};

const LABEL_TITLE_STYLE = {
  ...TYPOGRAPHY.label,
  color: COLORS.textPrimary,
  marginBottom: SPACING.xs,
};

const LABEL_DESC_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: COLORS.textSecondary,
};

// DRAMS: Orange checkmark
const CHECKMARK_STYLE = {
  color: DRAMS.orange,
  ...TYPOGRAPHY.h3,
};

export interface PaymentSelectorProps {
  selected?: PaymentMethod;
  onSelect?: (method: PaymentMethod) => void;
}

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps): JSX.Element {
  const [internalSelected, setInternalSelected] = useState<PaymentMethod>('upi');
  const [hoveredMethod, setHoveredMethod] = useState<PaymentMethod | null>(null);

  const currentSelected = selected ?? internalSelected;
  const handleSelect = onSelect ?? setInternalSelected;

  function getOptionStyle(methodType: PaymentMethod, isHovered: boolean) {
    const base = OPTION_STYLE;
    if (currentSelected === methodType) {
      return { ...base, ...OPTION_SELECTED_STYLE };
    }
    if (isHovered && currentSelected !== methodType) {
      return { ...base, ...OPTION_HOVER_STYLE };
    }
    return base;
  }

  return (
    <div style={CONTAINER_STYLE}>
      <h2 style={HEADER_STYLE}>Payment Method</h2>

      <div style={{ display: 'grid', gap: SPACING.md }}>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.type}
            style={getOptionStyle(method.type, hoveredMethod === method.type)}
            onMouseEnter={() => setHoveredMethod(method.type)}
            onMouseLeave={() => setHoveredMethod(null)}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.type}
              checked={currentSelected === method.type}
              onChange={() => handleSelect(method.type)}
              style={RADIO_STYLE}
            />
            <span style={ICON_STYLE}>
              {method.icon}
            </span>
            <div style={LABEL_STYLE}>
              <div style={LABEL_TITLE_STYLE}>
                {method.label}
              </div>
              <div style={LABEL_DESC_STYLE}>
                {method.description}
              </div>
            </div>
            {currentSelected === method.type && (
              <span style={CHECKMARK_STYLE}>✓</span>
            )}
          </label>
        ))}
      </div>

      {currentSelected === 'upi' && (
        <UPIInputForm style={{ marginTop: SPACING.xl }} />
      )}

      {currentSelected === 'card' && (
        <CardInputForm style={{ marginTop: SPACING.xl }} />
      )}
    </div>
  );
}

interface FormWrapperProps {
  style?: React.CSSProperties;
}

const FORM_CONTAINER_STYLE = {
  padding: SPACING.lg,
  backgroundColor: COLORS.bgPage,
  borderRadius: RADIUS.lg,
};

const FORM_LABEL_STYLE = {
  display: 'block',
  marginBottom: SPACING.sm,
  ...TYPOGRAPHY.label,
  color: COLORS.textSecondary,
};

const FORM_HELP_TEXT_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: COLORS.textMuted,
  marginTop: SPACING.sm,
  marginBottom: '0',
};

function UPIInputForm({ style }: FormWrapperProps): JSX.Element {
  const [upiId, setUpiId] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.focus);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.track);
  };

  return (
    <div style={{ ...FORM_CONTAINER_STYLE, ...style }}>
      <label htmlFor="upi-id" style={FORM_LABEL_STYLE}>
        UPI ID
      </label>
      <input
        id="upi-id"
        type="text"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="yourname@upi"
        pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+"
        style={{ ...TEXT_BOX.track, width: '100%' }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      <p style={FORM_HELP_TEXT_STYLE}>
        Enter your UPI ID (e.g., mobile@upi, username@oksbi)
      </p>
    </div>
  );
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\s/g, '')
    .replace(/(\d{4})/g, '$1 ')
    .trim()
    .substring(0, 19);
}

function formatExpiry(value: string): string {
  if (value.length >= 2) {
    return value.substring(0, 2) + '/' + value.substring(2, 4);
  }
  return value;
}

const GRID_STYLE = {
  display: 'grid',
  gap: SPACING.md,
};

const HALF_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr' as const,
  gap: SPACING.md,
};

const SECURITY_TEXT_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: COLORS.textMuted,
  marginTop: SPACING.sm,
  marginBottom: '0',
};

function CardInputForm({ style }: FormWrapperProps): JSX.Element {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.focus);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.track);
  };

  return (
    <div style={{ ...FORM_CONTAINER_STYLE, ...style }}>
      <div style={GRID_STYLE}>
        <div>
          <label htmlFor="card-number" style={FORM_LABEL_STYLE}>
            Card Number
          </label>
          <input
            id="card-number"
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={{ ...TEXT_BOX.track, width: '100%' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div>
          <label htmlFor="cardholder-name" style={FORM_LABEL_STYLE}>
            Cardholder Name
          </label>
          <input
            id="cardholder-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            style={{ ...TEXT_BOX.track, width: '100%' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>

        <div style={HALF_GRID_STYLE}>
          <div>
            <label htmlFor="card-expiry" style={FORM_LABEL_STYLE}>
              Expiry
            </label>
            <input
              id="card-expiry"
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value.replace(/\D/g, '')))}
              placeholder="MM/YY"
              maxLength={5}
              style={{ ...TEXT_BOX.track, width: '100%' }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>

          <div>
            <label htmlFor="card-cvv" style={FORM_LABEL_STYLE}>
              CVV
            </label>
            <input
              id="card-cvv"
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="•••"
              maxLength={4}
              style={{ ...TEXT_BOX.track, width: '100%' }}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
        </div>
      </div>

      <p style={SECURITY_TEXT_STYLE}>
        🔒 Your card details are secure and encrypted
      </p>
    </div>
  );
}
