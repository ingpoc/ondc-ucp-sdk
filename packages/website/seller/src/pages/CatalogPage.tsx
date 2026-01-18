import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@ondc-website/shared/hooks';
import { InventoryTable } from '../components';
import { DRAMS_CARD, PILL_BUTTON, CARD, SPACING, TYPOGRAPHY, DRAMS } from '@ondc-agent/shared/design-system';
import type { BecknItem } from '@ondc-website/shared';

// DRAMS: Clean white background
const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  padding: '0',
  width: '100%',
};

const CONTENT_STYLE = {
  maxWidth: '100%',
  padding: `0 ${SPACING['3xl']}`,
};

const HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: SPACING.xl,
};

const PAGE_TITLE_STYLE = {
  ...TYPOGRAPHY.h2,
  color: DRAMS.textDark,
  margin: '0',
};

const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING['3xl'],
  color: DRAMS.textLight,
  fontSize: TYPOGRAPHY.body.fontSize,
};

const ERROR_STYLE = {
  ...DRAMS_CARD.base,
  padding: SPACING.lg,
  backgroundColor: '#fef2f2',
  border: `1px solid #fecaca`,
  color: '#dc2626',
  fontSize: TYPOGRAPHY.body.fontSize,
};

const CARD_STYLE = {
  ...DRAMS_CARD.base,
  padding: SPACING.xl,
  transition: 'transform 0.2s, box-shadow 0.2s',
};

export function CatalogPage() {
  const navigate = useNavigate();
  const { data, loading, error, execute } = useApi<BecknItem[]>('/api/catalog');

  useEffect(() => {
    execute();
  }, [execute]);

  const handleEdit = useCallback((item: BecknItem) => {
    navigate(`/catalog/${item.id}`);
  }, [navigate]);

  const handleAdd = useCallback(() => {
    navigate('/catalog/edit/new');
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
        <div style={ERROR_STYLE}>
          Error loading catalog: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={CONTENT_STYLE}>
        <div style={HEADER_STYLE}>
          <h1 style={PAGE_TITLE_STYLE}>Product Catalog</h1>
          <button onClick={handleAdd} style={{ ...PILL_BUTTON.orange }}>
            Add New Product
          </button>
        </div>

        {data && (
          <>
            {data.length === 0 ? (
              <div style={{ ...CARD_STYLE, textAlign: 'center', marginTop: SPACING.lg }}>
                <p style={{ color: DRAMS.textLight, fontSize: TYPOGRAPHY.body.fontSize }}>
                  No products found
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: SPACING.lg,
              }}>
                {data.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    style={{
                      ...CARD_STYLE,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = '';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0].url}
                        alt={item.descriptor?.name ?? item.name}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          marginBottom: SPACING.md,
                          backgroundColor: DRAMS.grayTrack,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          marginBottom: SPACING.md,
                          backgroundColor: DRAMS.grayTrack,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        📦
                      </div>
                    )}
                    <h3 style={{ ...TYPOGRAPHY.label, color: DRAMS.textDark, margin: `0 0 ${SPACING.sm} 0` }}>
                      {item.descriptor?.name || 'Unnamed Product'}
                    </h3>
                    {item.price && (
                      <p style={{ ...TYPOGRAPHY.label, color: DRAMS.orange, margin: `0 0 ${SPACING.md} 0` }}>
                        {item.price.currency} {item.price.value}
                      </p>
                    )}
                    {item.descriptor?.short_desc && (
                      <p style={{ ...TYPOGRAPHY.body, color: DRAMS.textLight, margin: `0 0 ${SPACING.md} 0`, lineHeight: 1.4 }}>
                        {item.descriptor.short_desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {data && data.length > 0 && (
          <div style={{ marginTop: SPACING.xl }}>
            <InventoryTable items={data} onEdit={handleEdit} onDelete={(id) => console.log('Delete', id)} />
          </div>
        )}
      </div>
    </div>
  );
}
