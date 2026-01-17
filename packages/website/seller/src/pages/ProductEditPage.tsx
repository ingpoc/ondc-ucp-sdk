import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { ProductForm } from '../components';
import type { BecknItem } from '@ondc-website/shared';
import type { ProductFormData } from '../components/ProductForm';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '24px',
};

const CONTENT_STYLE = {
  maxWidth: '700px',
  margin: '0 auto',
};

const HEADER_STYLE = {
  marginBottom: '32px',
};

const PAGE_TITLE_STYLE = {
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: '#0f172a',
  margin: '0 0 8px 0',
};

const SUBTITLE_STYLE = {
  fontSize: '14px',
  color: '#475569',
  margin: 0,
};

const ERROR_STYLE = {
  padding: '16px',
  borderRadius: '8px',
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  fontSize: '14px',
  marginBottom: '24px',
};

const CARD_STYLE = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '32px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

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
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>
            {isNew ? 'Add New Product' : 'Edit Product'}
          </h1>
          <p style={SUBTITLE_STYLE}>
            {isNew
              ? 'Fill in the details to add a new product to your catalog'
              : 'Update the product information below'}
          </p>
        </div>

        {error && (
          <div style={ERROR_STYLE}>
            <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
            <p style={{ margin: '4px 0 0 0' }}>{error}</p>
          </div>
        )}

        <div style={CARD_STYLE}>
          <ProductForm
            product={existingProduct ?? undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
