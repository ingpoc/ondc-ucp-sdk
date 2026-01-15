import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { InventoryTable } from '../components';
import type { BecknCatalog, BecknItem } from '@ondc-website/shared';

export function CatalogPage() {
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<BecknCatalog>('/api/catalog');

  useEffect(() => {
    execute();
  }, [execute]);

  const handleEdit = (item: BecknItem) => {
    navigate(`/catalog/${item.id}`);
  };

  const handleDelete = async (itemId: string) => {
    try {
      await fetch(`/api/catalog/products/${itemId}`, {
        method: 'DELETE',
      });
      execute(); // Refresh catalog
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const items = data?.['bpp/providers']?.[0]?.items ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Product Catalog ({items.length})</h2>
        <button
          onClick={() => navigate('/catalog/new')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Add Product
        </button>
      </div>

      <InventoryTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
