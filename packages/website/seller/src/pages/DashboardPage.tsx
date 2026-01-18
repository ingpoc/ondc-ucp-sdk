import { useEffect, useState } from 'react';
import { useApi } from '@ondc-website/shared/hooks';
import { CARD, SPACING, TYPOGRAPHY, PILL_BUTTON, DRAMS } from '@ondc-agent/shared/design-system';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
}

export function DashboardPage() {
  const { data } = useApi<DashboardStats>('/api/catalog');

  return (
    <div style={{ padding: SPACING.xl, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <h2 style={{ ...TYPOGRAPHY.h2, marginBottom: SPACING.xl, color: DRAMS.textDark }}>Seller Dashboard</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: SPACING.xl,
          marginBottom: SPACING['2xl'],
        }}
      >
        <div
          style={{
            ...CARD.base,
            textAlign: 'center',
          }}
        >
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Total Products</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.textDark }}>
            {(data as any)?.['bpp/providers']?.[0]?.items?.length ?? 0}
          </p>
        </div>
        <div
          style={{
            ...CARD.base,
            textAlign: 'center',
          }}
        >
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Active Listings</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.orange }}>
            {(data as any)?.['bpp/providers']?.[0]?.items?.length ?? 0}
          </p>
        </div>
        <div
          style={{
            ...CARD.base,
            textAlign: 'center',
          }}
        >
          <h3 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark }}>Pending Orders</h3>
          <p style={{ fontSize: TYPOGRAPHY.h1.fontSize, margin: `${SPACING.md} 0`, color: DRAMS.textDark }}>0</p>
        </div>
      </div>

      <div style={{ marginTop: SPACING['2xl'] }}>
        <h3 style={{ ...TYPOGRAPHY.h3, marginBottom: SPACING.md, color: DRAMS.textDark }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: SPACING.md }}>
          <button
            onClick={() => (window.location.href = '/catalog/new')}
            style={{
              ...PILL_BUTTON.orange,
            }}
          >
            Add New Product
          </button>
          <button
            onClick={() => (window.location.href = '/catalog')}
            style={{
              ...PILL_BUTTON.gray,
            }}
          >
            Manage Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
