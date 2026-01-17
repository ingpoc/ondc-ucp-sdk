import { useState } from 'react';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '@ondc-agent/shared/design-system';

export type PaymentMethod = UCPPayment['type'];

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
  backgroundColor: 'white',
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS.lg,
  padding: SPACING.xl,
  marginBottom: SPACING.xl,
};

const HEADER_STYLE = {
  fontSize: TYPOGRAPHY.h4.fontSize,
  fontWeight: TYPOGRAPHY.h4.fontWeight,
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

const OPTION_SELECTED_STYLE = {
  border: `2px solid ${COLORS.success}`,
  backgroundColor: COLORS.bgSubtle,
};

const RADIO_STYLE = {
  marginRight: '12px',
  width: '20px',
  height: '20px',
  cursor: 'pointer',
};

const ICON_STYLE = {
  fontSize: '24px',
  marginRight: SPACING.md,
};

const LABEL_STYLE = {
  flex: 1,
};

const LABEL_TITLE_STYLE = {
  fontWeight: TYPOGRAPHY.label.fontWeight,
  fontSize: TYPOGRAPHY.bodySmall.fontSize,
  color: COLORS.textPrimary,
  marginBottom: SPACING.xs,
};

const LABEL_DESC_STYLE = {
  fontSize: TYPOGRAPHY.bodySmall.fontSize,
  color: COLORS.textSecondary,
};

const CHECKMARK_STYLE = {
  color: COLORS.success,
  fontSize: '20px',
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

      <div style={{ display: 'grid', gap: '12px' }}>
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
        <UPIInputForm style={{ marginTop: '20px' }} />
      )}

      {currentSelected === 'card' && (
        <CardInputForm style={{ marginTop: '20px' }} />
      )}
    </div>
  );
}

interface FormWrapperProps {
  style?: React.CSSProperties;
}

const FORM_CONTAINER_STYLE = {
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const FORM_LABEL_STYLE = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  fontSize: '14px',
  color: '#475569',
};

const FORM_INPUT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '6px',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const FORM_INPUT_FOCUS_STYLE = {
  outline: 'none',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

const FORM_HELP_TEXT_STYLE = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '6px',
  marginBottom: '0',
};

function UPIInputForm({ style }: FormWrapperProps): JSX.Element {
  const [upiId, setUpiId] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, FORM_INPUT_FOCUS_STYLE);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' });
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
        style={FORM_INPUT_STYLE}
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
  gap: '12px',
};

const HALF_GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr' as const,
  gap: '12px',
};

const SECURITY_TEXT_STYLE = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '8px',
  marginBottom: '0',
};

function CardInputForm({ style }: FormWrapperProps): JSX.Element {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, FORM_INPUT_FOCUS_STYLE);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' });
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
            style={FORM_INPUT_STYLE}
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
            style={FORM_INPUT_STYLE}
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
              style={FORM_INPUT_STYLE}
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
              style={FORM_INPUT_STYLE}
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
