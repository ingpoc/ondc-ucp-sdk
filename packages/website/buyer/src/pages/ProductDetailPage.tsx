import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useCart } from '@ondc-website/shared/hooks';
import { PriceDisplay, RatingStars } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

const CONTAINER_STYLE = { maxWidth: '600px' };

const BUTTON_STYLE = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#16a34a',
  color: 'white',
  fontSize: '1em',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const BUTTON_DISABLED_STYLE = {
  ...BUTTON_STYLE,
  backgroundColor: '#9ca3af',
  cursor: 'not-allowed',
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
    return <div>Loading...</div>;
  }

  if (error || !data) {
    return (
      <div>
        <p>{error || 'Product not found'}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const messageColor = cartMessage.includes('Failed') ? '#dc2626' : '#16a34a';

  return (
    <div style={CONTAINER_STYLE}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
        ← Back
      </button>
      {data.images?.[0] && (
        <img
          src={data.images[0].url}
          alt={data.name}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
        />
      )}
      <h1>{data.name}</h1>
      {data.description && <p style={{ fontSize: '1.1em' }}>{data.description}</p>}
      <PriceDisplay price={data.price} />
      {data.rating && <RatingStars rating={data.rating.value} />}
      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5' }}>
        <h3>Seller</h3>
        <p>{data.provider?.name}</p>
        {data.provider?.verified && <p>✓ Verified Seller</p>}
        {data.provider?.rating && <RatingStars rating={data.provider?.rating?.value} />}
      </div>
      {data.category && (
        <div style={{ marginTop: '15px' }}>
          <strong>Category:</strong> {data.category}
        </div>
      )}
      <div style={{ marginTop: '24px' }}>
        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          style={addingToCart ? BUTTON_DISABLED_STYLE : BUTTON_STYLE}
        >
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
        {cartMessage && (
          <span style={{ marginLeft: '12px', color: messageColor }}>
            {cartMessage}
          </span>
        )}
      </div>
    </div>
  );
}
