import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import type { BecknCatalog } from '@ondc-website/shared';

export function CatalogPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useApi<BecknCatalog>('/api/catalog');

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

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No products yet</p>
          <button
            onClick={() => navigate('/catalog/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Price</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{item.id}</td>
                <td style={{ padding: '10px' }}>{item.descriptor?.name || item.name}</td>
                <td style={{ padding: '10px' }}>
                  {item.price?.currency} {item.price?.value}
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => navigate(`/catalog/${item.id}`)}
                    style={{
                      padding: '5px 10px',
                      marginRight: '5px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Delete this product?')) {
                        await fetch(`/api/catalog/products/${item.id}`, {
                          method: 'DELETE',
                        });
                        window.location.reload();
                      }
                    }}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
