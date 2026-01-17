import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { ProductForm } from '../components';
import type { BecknItem } from '@ondc-website/shared';
import type { ProductFormData } from '../components/ProductForm';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const { data: existingProduct, execute } = useApi<BecknItem>(
    isNew ? '/api/catalog' : `/api/catalog/products/${id}`
  );

  useEffect(() => {
    if (!isNew) {
      execute();
    }
  }, [execute, isNew]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (data: ProductFormData) => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        id: data.id,
        descriptor: {
          name: data.name,
          short_desc: data.description,
        },
        price: {
          currency: data.currency,
          value: data.price,
        },
        category_id: data.categoryId,
        fulfillment_id: 'ful-1',
      };

      const url = isNew ? '/api/catalog/products' : `/api/catalog/products/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      navigate('/catalog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isNew, id, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/catalog');
  }, [navigate]);

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>{isNew ? 'Add New Product' : 'Edit Product'}</h2>

      {error && (
        <div
          style={{
            padding: '10px',
            marginBottom: '15px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
          }}
        >
          {error}
        </div>
      )}

      <ProductForm
        product={existingProduct ?? undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </div>
  );
}
