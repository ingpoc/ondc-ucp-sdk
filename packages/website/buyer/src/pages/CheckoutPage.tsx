import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@ondc-website/shared';
import type { UCPQuote, UCPAddress } from '@ondc-website/shared';
import { BillingForm } from '../components/BillingForm';
import { PaymentSelector } from '../components/PaymentSelector';
import { QuoteDisplay } from '../components/QuoteDisplay';

const API_BASE = 'http://localhost:3001';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { session, loading, error, itemCount, clearError } = useCart();
  const [quote, setQuote] = useState<UCPQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<UCPAddress>({
    line1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'IND',
  });

  // Redirect to cart if empty (only after we've loaded the session)
  useEffect(() => {
    // Check session is not null to ensure we've actually loaded the cart
    if (!loading && session && itemCount === 0) {
      navigate('/cart');
    }
  }, [loading, itemCount, navigate, session]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const sessionId = localStorage.getItem('ondc-session-id');
      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await fetch(`${API_BASE}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          deliveryAddress,
          preferences: {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Checkout failed: ${response.status}`);
      }

      const data = await response.json();
      setQuote(data.quote);

      // TODO: Navigate to order confirmation page when confirm endpoint is available
      // For now, show success message with quote
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !session) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>Error: {error}</p>
        <button
          onClick={() => navigate('/cart')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          Back to Cart
        </button>
      </div>
    );
  }

  const currency = session?.items[0]?.item.price?.currency || 'INR';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Checkout</h1>

      {submitError && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#dc2626',
            marginBottom: '20px',
          }}
        >
          {submitError}
          <button
            onClick={() => setSubmitError(null)}
            style={{
              float: 'right',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '1.2em',
            }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Left Column: Forms */}
          <div>
            <BillingForm session={session} />
            <DeliveryAddressForm
              address={deliveryAddress}
              onChange={setDeliveryAddress}
            />
            <PaymentSelector />
          </div>

          {/* Right Column: Quote/Summary */}
          <div style={{ position: 'sticky', top: '20px', alignSelf: 'start' }}>
            {quote ? (
              <QuoteDisplay quote={quote} currency={currency} />
            ) : (
              <CartSummary currency={currency} />
            )}

            <button
              type="submit"
              disabled={submitting || !session?.buyer?.name || !session?.buyer?.contact?.email}
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: submitting ? '#9ca3af' : '#16a34a',
                color: 'white',
                fontSize: '1.1em',
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: '16px',
              }}
            >
              {submitting ? 'Processing...' : quote ? 'Place Order' : 'Get Quote'}
            </button>

            {!session?.buyer?.name && (
              <p style={{ color: '#dc2626', fontSize: '0.9em', marginTop: '8px' }}>
                Please complete billing information to continue
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Back to Cart */}
      <div style={{ marginTop: '24px' }}>
        <button
          type="button"
          onClick={() => navigate('/cart')}
          style={{
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: 'white',
            cursor: 'pointer',
          }}
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}

interface DeliveryAddressFormProps {
  address: UCPAddress;
  onChange: (address: UCPAddress) => void;
}

function DeliveryAddressForm({ address, onChange }: DeliveryAddressFormProps) {
  const handleChange = (field: keyof UCPAddress, value: string) => {
    onChange({ ...address, [field]: value });
  };

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
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Delivery Address</h2>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Street Address *
          </label>
          <input
            type="text"
            required
            value={address.line1}
            onChange={(e) => handleChange('line1', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1em',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              City *
            </label>
            <input
              type="text"
              required
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Bangalore"
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
              State *
            </label>
            <input
              type="text"
              required
              value={address.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Karnataka"
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

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={address.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder="560001"
            pattern="[0-9]{6}"
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
  );
}

interface CartSummaryProps {
  currency: string;
}

function CartSummary({ currency }: CartSummaryProps) {
  const { session, subtotal } = useCart();

  if (!session) return null;

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Order Summary</h2>

      <div style={{ marginBottom: '16px' }}>
        {session.items.map((item: any) => (
          <div
            key={item.item.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: '1px solid #f3f4f6',
            }}
          >
            <span>
              {item.item.descriptor?.name || item.item.id} × {item.quantity}
            </span>
            <span>
              {currency}{' '}
              {((parseFloat(item.item.price?.value || '0') * item.quantity).toFixed(2))}
            </span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Subtotal</span>
          <span>
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>
        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '12px' }}>
          Complete the form to get final pricing with delivery and tax
        </p>
      </div>
    </div>
  );
}
