import { useState, useCallback } from 'react';
import { ProductCard } from '@ondc-website/shared/components';

export interface SearchPreviewProps {
  query: string;
  category: string;
  onSearch?: (query: string) => void;
}

const CONTAINER_STYLE = {
  marginTop: '20px',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const HEADER_STYLE = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 6px 0',
};

const DESCRIPTION_STYLE = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0 0 16px 0',
};

const BUTTON_STYLE = {
  padding: '10px 20px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

const BUTTON_PRIMARY_STYLE = {
  backgroundColor: '#3b82f6',
};

const BUTTON_PRIMARY_HOVER_STYLE = {
  backgroundColor: '#2563eb',
};

const BUTTON_LOADING_STYLE = {
  backgroundColor: '#94a3b8',
  cursor: 'not-allowed',
};

const BUTTON_DISABLED_STYLE = {
  backgroundColor: '#cbd5e1',
  cursor: 'not-allowed',
};

const RESULTS_CONTAINER_STYLE = {
  marginTop: '20px',
};

const RESULTS_HEADER_STYLE = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#475569',
  margin: '0 0 12px 0',
};

const GRID_STYLE = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '16px',
};

const LOADING_CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '20px 0',
};

const SPINNER_STYLE = {
  width: '20px',
  height: '20px',
  border: '3px solid #e2e8f0',
  borderTopColor: '#3b82f6',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const LOADING_TEXT_STYLE = {
  fontSize: '14px',
  color: '#64748b',
};

const EMPTY_STATE_STYLE = {
  padding: '40px 20px',
  textAlign: 'center' as const,
};

const EMPTY_STATE_ICON_STYLE = {
  fontSize: '40px',
  marginBottom: '12px',
};

const EMPTY_STATE_TEXT_STYLE = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

export function SearchPreview({ query, category, onSearch }: SearchPreviewProps) {
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handlePreviewSearch = useCallback(async () => {
    if (!query) return;

    setLoading(true);
    setShowPreview(true);

    try {
      const params = new URLSearchParams({ category, query });
      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setPreviewResults(data.items || []);
    } catch (error) {
      console.error('Preview search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [category, query]);

  const canSearch = query.trim().length > 0 && !loading;

  return (
    <div style={CONTAINER_STYLE}>
      <h3 style={HEADER_STYLE}>Search Preview</h3>
      <p style={DESCRIPTION_STYLE}>
        See how your products appear in buyer search results
      </p>

      <button
        onClick={handlePreviewSearch}
        disabled={!canSearch}
        style={{
          ...BUTTON_STYLE,
          ...(loading ? BUTTON_LOADING_STYLE : {}),
          ...(canSearch ? BUTTON_PRIMARY_STYLE : BUTTON_DISABLED_STYLE),
          ...(isButtonHovered && canSearch ? BUTTON_PRIMARY_HOVER_STYLE : {}),
        }}
        onMouseEnter={() => canSearch && setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
      >
        {loading ? 'Loading...' : 'Preview Search Results'}
      </button>

      {showPreview && (
        <div style={RESULTS_CONTAINER_STYLE}>
          {loading ? (
            <div style={LOADING_CONTAINER_STYLE}>
              <div style={SPINNER_STYLE} />
              <span style={LOADING_TEXT_STYLE}>Searching...</span>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <>
              <h4 style={RESULTS_HEADER_STYLE}>
                Results for "{query}" ({previewResults.length} {previewResults.length === 1 ? 'item' : 'items'})
              </h4>
              {previewResults.length === 0 ? (
                <div style={EMPTY_STATE_STYLE}>
                  <div style={EMPTY_STATE_ICON_STYLE}>🔍</div>
                  <p style={EMPTY_STATE_TEXT_STYLE}>No results found</p>
                </div>
              ) : (
                <div style={GRID_STYLE}>
                  {previewResults.slice(0, 3).map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
