import { useState } from 'react';
import type { UCPPayment } from '@ondc-website/shared';

export type PaymentMethod = UCPPayment['type'];

export interface PaymentSelectorProps {
  selected?: PaymentMethod;
  onSelect?: (method: PaymentMethod) => void;
}

const PAYMENT_METHODS: Array<{
  type: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    type: 'upi',
    label: 'UPI',
    description: 'Pay using any UPI app (GPay, PhonePe, Paytm)',
    icon: '📱',
  },
  {
    type: 'card',
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: '💳',
  },
  {
    type: 'netbanking',
    label: 'Net Banking',
    description: 'Pay from your bank account',
    icon: '🏦',
  },
  {
    type: 'wallet',
    label: 'Wallet',
    description: 'Paytm, Amazon Pay, Mobikwik',
    icon: '👛',
  },
  {
    type: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when you receive the order',
    icon: '💵',
  },
];

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) {
  const [internalSelected, setInternalSelected] = useState<PaymentMethod>('upi');

  const currentSelected = selected ?? internalSelected;
  const handleSelect = onSelect ?? setInternalSelected;

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Payment Method</h2>

      <div style={{ display: 'grid', gap: '12px' }}>
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              border: `2px solid ${currentSelected === method.type ? '#16a34a' : '#e5e7eb'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              backgroundColor: currentSelected === method.type ? '#f0fdf4' : 'white',
            }}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.type}
              checked={currentSelected === method.type}
              onChange={() => handleSelect(method.type)}
              style={{ marginRight: '12px', transform: 'scale(1.2)' }}
            />
            <span style={{ fontSize: '1.5em', marginRight: '12px' }}>
              {method.icon}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                {method.label}
              </div>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {method.description}
              </div>
            </div>
            {currentSelected === method.type && (
              <span style={{ color: '#16a34a', fontSize: '1.2em' }}>✓</span>
            )}
          </label>
        ))}
      </div>

      {currentSelected === 'upi' && (
        <UPIInputForm style={{ marginTop: '16px' }} />
      )}

      {currentSelected === 'card' && (
        <CardInputForm style={{ marginTop: '16px' }} />
      )}
    </div>
  );
}

interface FormWrapperProps {
  style?: React.CSSProperties;
}

function UPIInputForm({ style }: FormWrapperProps) {
  const [upiId, setUpiId] = useState('');

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        ...style,
      }}
    >
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
        UPI ID
      </label>
      <input
        type="text"
        value={upiId}
        onChange={(e) => setUpiId(e.target.value)}
        placeholder="yourname@upi"
        pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+"
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '1em',
          marginBottom: '8px',
        }}
      />
      <p style={{ fontSize: '0.85em', color: '#666' }}>
        Enter your UPI ID (e.g., mobile@upi, username@oksbi)
      </p>
    </div>
  );
}

function CardInputForm({ style }: FormWrapperProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    if (value.length >= 2) {
      return value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    return value;
  };

  return (
    <div
      style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        ...style,
      }}
    >
      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1em',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Cardholder Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="JOHN DOE"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1em',
              textTransform: 'uppercase',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Expiry
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value.replace(/\D/g, '')))}
              placeholder="MM/YY"
              maxLength={5}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1em',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              CVV
            </label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="•••"
              maxLength={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1em',
              }}
            />
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.85em', color: '#666', marginTop: '8px' }}>
        🔒 Your card details are secure and encrypted
      </p>
    </div>
  );
}
