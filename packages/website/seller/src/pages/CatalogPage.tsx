import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { InventoryTable } from '../components';
import type { BecknCatalog, BecknItem } from '@ondc-website/shared';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '0',
  width: '100%',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: '0 80px',
};

const HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '32px',
};

const PAGE_TITLE_STYLE = {
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '-0.5px',
  color: '#0f172a',
  margin: 0,
};

const BUTTON_PRIMARY_STYLE = {
  padding: '12px 24px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#10b981',
  color: 'white',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
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

const CARD_STYLE = {
  backgroundColor: 'white',
  borderRadius: '8px',
  padding: '24px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

export function CatalogPage() {
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<BecknCatalog>('/api/catalog');

  useEffect(() => {
    execute();
  }, [execute]);

  const handleEdit = useCallback((item: BecknItem) => {
    navigate(`/catalog/${item.id}`);
  }, [navigate]);

  const handleDelete = useCallback(async (itemId: string) => {
    try {
      const response = await fetch(`/api/catalog/products/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      execute();
    } catch (err) {
      alert('Failed to delete product');
    }
  }, [execute]);

  const handleAddProduct = useCallback(() => {
    navigate('/catalog/new');
  }, [navigate]);

  if (loading) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={LOADING_STYLE}>
          Loading catalog...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={CONTENT_STYLE}>
          <div style={ERROR_STYLE}>
            <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
            <p style={{ margin: '4px 0 0 0' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const items = data?.['bpp/providers']?.[0]?.items ?? [];

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Product Catalog ({items.length})</h1>
          <button
            onClick={handleAddProduct}
            style={BUTTON_PRIMARY_STYLE}
          >
            Add Product
          </button>
        </div>

        <div style={CARD_STYLE}>
          <InventoryTable
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}
