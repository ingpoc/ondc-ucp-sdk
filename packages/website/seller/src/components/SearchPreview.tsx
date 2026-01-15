import { useState } from 'react';
import { ProductCard } from '@ondc-website/shared/components';

export interface SearchPreviewProps {
  query: string;
  category: string;
  onSearch?: (query: string) => void;
}

export function SearchPreview({ query, category, onSearch }: SearchPreviewProps) {
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreviewSearch = async () => {
    setLoading(true);
    setShowPreview(true);

    try {
      const params = new URLSearchParams({
        category,
        query,
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();
      setPreviewResults(data.items || []);
    } catch (error) {
      console.error('Preview search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
      <h3 style={{ marginBottom: '10px' }}>Search Preview</h3>
      <p style={{ color: '#666', marginBottom: '10px' }}>
        See how your products appear in buyer search results
      </p>

      <button
        onClick={handlePreviewSearch}
        disabled={loading || !query}
        style={{
          padding: '8px 16px',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !query ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Loading...' : 'Preview Search Results'}
      </button>

      {showPreview && (
        <div style={{ marginTop: '15px' }}>
          <h4>Results for "{query}" ({previewResults.length} items)</h4>
          {previewResults.length === 0 ? (
            <p style={{ color: '#999', fontStyle: 'italic' }}>No results found</p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '15px',
              }}
            >
              {previewResults.slice(0, 3).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
