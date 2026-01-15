import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { PriceDisplay, RatingStars } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<UCPItem>(`/api/catalog/products/${id}`);

  useEffect(() => {
    execute();
  }, [execute]);

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

  return (
    <div style={{ maxWidth: '600px' }}>
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
        <p>{data.provider.name}</p>
        {data.provider.verified && <p>✓ Verified Seller</p>}
        {data.provider.rating && <RatingStars rating={data.provider.rating.value} />}
      </div>
      {data.category && (
        <div style={{ marginTop: '15px' }}>
          <strong>Category:</strong> {data.category}
        </div>
      )}
    </div>
  );
}
