import { useEffect, useState } from 'react';
import { useApi } from '@ondc-website/shared/hooks';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}

export function DashboardPage() {
  const { data } = useApi<DashboardStats>('/api/catalog');

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Total Products</h3>
          <p style={{ fontSize: '2em', margin: '10px 0' }}>
            {(data as any)?.['bpp/providers']?.[0]?.items?.length ?? 0}
          </p>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#e7f3ff',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Active Listings</h3>
          <p style={{ fontSize: '2em', margin: '10px 0' }}>
            {(data as any)?.['bpp/providers']?.[0]?.items?.length ?? 0}
          </p>
        </div>
        <div
          style={{
            padding: '20px',
            background: '#fff3cd',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h3>Pending Orders</h3>
          <p style={{ fontSize: '2em', margin: '10px 0' }}>0</p>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => (window.location.href = '/catalog/new')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Add New Product
          </button>
          <button
            onClick={() => (window.location.href = '/catalog')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Manage Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
