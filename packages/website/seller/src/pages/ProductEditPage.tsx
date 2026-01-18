import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { ProductForm } from '../components';
import type { BecknItem } from '@ondc-website/shared';
import type { ProductFormData } from '../components/ProductForm';
import { DRAMS, SPACING, TYPOGRAPHY, RADIUS, BUTTON } from '@ondc-agent/shared/design-system';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: DRAMS.grayTrack,
  padding: SPACING.xl,
};

const CONTENT_STYLE = {
  maxWidth: '700px',
  margin: '0 auto',
};

const HEADER_STYLE = {
  marginBottom: SPACING['3xl'],
};

const PAGE_TITLE_STYLE = {
  ...TYPOGRAPHY.h2,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.sm} 0`,
};

const SUBTITLE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: 0,
};

const ERROR_STYLE = {
  padding: `${SPACING.md} ${SPACING.lg}`,
  borderRadius: RADIUS.lg,
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  ...TYPOGRAPHY.bodySmall,
  marginBottom: SPACING.xl,
};

const CARD_STYLE = {
  backgroundColor: 'white',
  borderRadius: RADIUS.card,
  padding: SPACING['3xl'],
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
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
            <p style={{ margin: 0, fontWeight: TYPOGRAPHY.label.fontWeight }}>Error</p>
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
