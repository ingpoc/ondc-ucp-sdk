import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useCart } from '@ondc-website/shared/hooks';
import { PriceDisplay, RatingStars } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '24px',
};

const CONTENT_STYLE = {
  maxWidth: '900px',
  margin: '0 auto',
};

const BACK_BUTTON_STYLE = {
  padding: '8px 16px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
  marginBottom: '24px',
  transition: 'all 0.2s ease',
};

const CARD_STYLE = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '32px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

const IMAGE_STYLE = {
  width: '100%',
  maxHeight: '400px',
  objectFit: 'contain' as const,
  borderRadius: '8px',
  backgroundColor: '#f8fafc',
  marginBottom: '24px',
};

const TITLE_STYLE = {
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const DESCRIPTION_STYLE = {
  fontSize: '16px',
  lineHeight: 1.6,
  color: '#475569',
  margin: '0 0 24px 0',
};

const SECTION_STYLE = {
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: '#f8fafc',
  marginBottom: '16px',
  border: '1px solid #e2e8f0',
};

const SECTION_TITLE_STYLE = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 12px 0',
};

const SELLER_NAME_STYLE = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#0f172a',
  margin: '0 0 4px 0',
};

const VERIFIED_BADGE_STYLE = {
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: '12px',
  fontWeight: 500,
  color: '#10b981',
  margin: '0',
};

const CATEGORY_STYLE = {
  fontSize: '14px',
  color: '#475569',
  marginTop: '16px',
};

const BUTTON_STYLE = {
  padding: '14px 28px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  marginTop: '24px',
};

const BUTTON_DISABLED_STYLE = {
  ...BUTTON_STYLE,
  backgroundColor: '#94a3b8',
  cursor: 'not-allowed',
};

const MESSAGE_STYLE = {
  marginLeft: '12px',
  fontSize: '14px',
  fontWeight: 500,
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
};

export function ProductDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<UCPItem>(`/api/catalog/products/${id}`);
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    execute();
  }, [execute]);

  async function handleAddToCart(): Promise<void> {
    if (!data) return;

    setAddingToCart(true);
    setCartMessage('');

    try {
      await addToCart(data as any);
      setCartMessage('Added to cart!');
      setTimeout(() => setCartMessage(''), 2000);
    } catch {
      setCartMessage('Failed to add to cart');
      setTimeout(() => setCartMessage(''), 2000);
    } finally {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={LOADING_STYLE}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={CONTENT_STYLE}>
          <div style={ERROR_STYLE}>
            <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
            <p style={{ margin: '4px 0 0 0' }}>{error || 'Product not found'}</p>
            <button
              onClick={() => navigate(-1)}
              style={{
                ...BACK_BUTTON_STYLE,
                marginBottom: 0,
                marginTop: '16px',
              }}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const messageColor = cartMessage.includes('Failed') ? '#dc2626' : '#10b981';

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <button onClick={() => navigate(-1)} style={BACK_BUTTON_STYLE}>
          ← Back
        </button>

        <div style={CARD_STYLE}>
          {data.images?.[0] && (
            <img
              src={data.images[0].url}
              alt={data.name}
              style={IMAGE_STYLE}
            />
          )}

          <h1 style={TITLE_STYLE}>{data.name}</h1>

          {data.description && (
            <p style={DESCRIPTION_STYLE}>{data.description}</p>
          )}

          <PriceDisplay price={data.price} />

          {data.rating && (
            <div style={{ marginBottom: '24px' }}>
              <RatingStars rating={data.rating.value} />
            </div>
          )}

          <div style={SECTION_STYLE}>
            <h3 style={SECTION_TITLE_STYLE}>Seller</h3>
            <p style={SELLER_NAME_STYLE}>{data.provider?.name}</p>
            {data.provider?.verified && (
              <p style={VERIFIED_BADGE_STYLE}>✓ Verified Seller</p>
            )}
            {data.provider?.rating && <RatingStars rating={data.provider?.rating?.value} />}
          </div>

          {data.category && (
            <div style={CATEGORY_STYLE}>
              <strong>Category:</strong> {data.category}
            </div>
          )}

          <div>
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              style={addingToCart ? BUTTON_DISABLED_STYLE : BUTTON_STYLE}
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            {cartMessage && (
              <span style={{ ...MESSAGE_STYLE, color: messageColor }}>
                {cartMessage}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
