import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@ondc-website/shared';
import type { UCPQuote, UCPAddress } from '@ondc-website/shared';
import { BillingForm } from '../components/BillingForm';
import { PaymentSelector } from '../components/PaymentSelector';
import { QuoteDisplay } from '../components/QuoteDisplay';

const API_BASE = 'http://localhost:3001';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '24px',
};

const CONTENT_STYLE = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const HEADER_STYLE = {
  marginBottom: '24px',
};

const PAGE_TITLE_STYLE = {
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: '#0f172a',
  margin: '0 0 8px 0',
};

const ERROR_ALERT_STYLE = {
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  fontSize: '14px',
  marginBottom: '24px',
  position: 'relative' as const,
};

const ERROR_CLOSE_STYLE = {
  position: 'absolute' as const,
  top: '12px',
  right: '12px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '20px',
  color: '#dc2626',
  padding: '0',
  width: '24px',
  height: '24px',
};

const FORM_LAYOUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: '2fr 1fr',
  gap: '24px',
};

const FORMS_SECTION_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '24px',
};

const SIDEBAR_STYLE = {
  position: 'sticky' as const,
  top: '24px',
  alignSelf: 'start' as const,
};

const BUTTON_PRIMARY_STYLE = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  marginTop: '16px',
};

const BUTTON_DISABLED_STYLE = {
  ...BUTTON_PRIMARY_STYLE,
  backgroundColor: '#94a3b8',
  cursor: 'not-allowed',
};

const VALIDATION_MESSAGE_STYLE = {
  color: '#dc2626',
  fontSize: '12px',
  marginTop: '8px',
};

const BUTTON_SECONDARY_STYLE = {
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  color: '#475569',
  fontSize: '14px',
};

const ERROR_STYLE = {
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  fontSize: '14px',
  textAlign: 'center' as const,
};

const FOOTER_STYLE = {
  marginTop: '24px',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { session, loading, error, itemCount, clearError } = useCart();
  const [quote, setQuote] = useState<UCPQuote | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<UCPAddress>({
    name: session?.buyer?.name || '',
    phone: session?.buyer?.phone || '',
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
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={LOADING_STYLE}>
          Loading checkout...
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={ERROR_STYLE}>
          <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
          <p style={{ margin: '4px 0 0 0' }}>{error}</p>
          <button
            onClick={() => navigate('/cart')}
            style={{
              ...BUTTON_SECONDARY_STYLE,
              marginTop: '16px',
            }}
          >
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  const currency = session?.items[0]?.item.price?.currency || 'INR';

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Checkout</h1>
        </div>

        {submitError && (
          <div style={ERROR_ALERT_STYLE}>
            {submitError}
            <button
              onClick={() => setSubmitError(null)}
              style={ERROR_CLOSE_STYLE}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={FORM_LAYOUT_STYLE}>
            <div style={FORMS_SECTION_STYLE}>
              <BillingForm session={session} />
              <DeliveryAddressForm
                address={deliveryAddress}
                onChange={setDeliveryAddress}
              />
              <PaymentSelector />
            </div>

            <div style={SIDEBAR_STYLE}>
              {quote ? (
                <QuoteDisplay quote={quote} currency={currency} />
              ) : (
                <CartSummary currency={currency} />
              )}

              <button
                type="submit"
                disabled={submitting || !session?.buyer?.name || !session?.buyer?.email}
                style={submitting ? BUTTON_DISABLED_STYLE : BUTTON_PRIMARY_STYLE}
              >
                {submitting ? 'Processing...' : quote ? 'Place Order' : 'Get Quote'}
              </button>

              {!session?.buyer?.name && (
                <p style={VALIDATION_MESSAGE_STYLE}>
                  Please complete billing information to continue
                </p>
              )}
            </div>
          </div>
        </form>

        <div style={FOOTER_STYLE}>
          <button
            type="button"
            onClick={() => navigate('/cart')}
            style={BUTTON_SECONDARY_STYLE}
          >
            ← Back to Cart
          </button>
        </div>
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

  const SECTION_STYLE = {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
  };

  const SECTION_TITLE_STYLE = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 16px 0',
  };

  const LABEL_STYLE = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: 500,
    color: '#0f172a',
  };

  const INPUT_STYLE = {
    width: '100%',
    padding: '10px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  };

  const INPUT_GRID_STYLE = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  };

  const FORM_GROUP_STYLE = {
    marginBottom: '16px',
  };

  return (
    <div style={SECTION_STYLE}>
      <h2 style={SECTION_TITLE_STYLE}>Delivery Address</h2>

      <div>
        <div style={FORM_GROUP_STYLE}>
          <label style={LABEL_STYLE}>
            Street Address *
          </label>
          <input
            type="text"
            required
            value={address.line1}
            onChange={(e) => handleChange('line1', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            style={INPUT_STYLE}
          />
        </div>

        <div style={INPUT_GRID_STYLE}>
          <div style={FORM_GROUP_STYLE}>
            <label style={LABEL_STYLE}>
              City *
            </label>
            <input
              type="text"
              required
              value={address.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Bangalore"
              style={INPUT_STYLE}
            />
          </div>

          <div style={FORM_GROUP_STYLE}>
            <label style={LABEL_STYLE}>
              State *
            </label>
            <input
              type="text"
              required
              value={address.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Karnataka"
              style={INPUT_STYLE}
            />
          </div>
        </div>

        <div style={FORM_GROUP_STYLE}>
          <label style={LABEL_STYLE}>
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={address.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            placeholder="560001"
            pattern="[0-9]{6}"
            style={INPUT_STYLE}
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

  const CARD_STYLE = {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  };

  const TITLE_STYLE = {
    fontSize: '18px',
    fontWeight: 600,
    color: '#0f172a',
    margin: '0 0 16px 0',
  };

  const ITEM_ROW_STYLE = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9',
  };

  const SUMMARY_SECTION_STYLE = {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '16px',
  };

  const TOTAL_ROW_STYLE = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px',
  };

  const NOTE_STYLE = {
    fontSize: '12px',
    color: '#475569',
    marginTop: '12px',
    lineHeight: 1.5,
  };

  return (
    <div style={CARD_STYLE}>
      <h2 style={TITLE_STYLE}>Order Summary</h2>

      <div style={{ marginBottom: '16px' }}>
        {session.items.map((item: any) => (
          <div
            key={item.item.id}
            style={ITEM_ROW_STYLE}
          >
            <span style={{ fontSize: '14px', color: '#0f172a' }}>
              {item.item.descriptor?.name || item.item.id} × {item.quantity}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>
              {currency}{' '}
              {((parseFloat(item.item.price?.value || '0') * item.quantity).toFixed(2))}
            </span>
          </div>
        ))}
      </div>

      <div style={SUMMARY_SECTION_STYLE}>
        <div style={TOTAL_ROW_STYLE}>
          <span style={{ color: '#475569' }}>Subtotal</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>
        <p style={NOTE_STYLE}>
          Complete the form to get final pricing with delivery and tax
        </p>
      </div>
    </div>
  );
}
