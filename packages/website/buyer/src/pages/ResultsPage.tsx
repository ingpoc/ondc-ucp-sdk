import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '@ondc-website/shared/hooks';
import { ProductCard } from '@ondc-website/shared/components';
import type { UCPItem } from '@ondc-website/shared';

interface SearchResponse {
  items: UCPItem[];
  totalCount: number;
}

export function ResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') ?? 'grocery';
  const query = searchParams.get('q') ?? undefined;

  const { data, loading, error, execute } = useSearch(category, {
    query,
  });

  useEffect(() => {
    execute();
  }, [execute]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => navigate('/')}>Back to Search</button>
      </div>
    );
  }

  const items = (data as SearchResponse | null)?.items ?? [];

  return (
    <div>
      <h2>
        Results for "{query || category}" ({items.length} items)
      </h2>
      {items.length === 0 ? (
        <p>No results found</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {items.map((item: UCPItem) => (
            <ProductCard
              key={item.id}
              product={item}
              onClick={() => navigate(`/product/${item.id}`)}
            />
          ))}
        </div>
      )}
      <button onClick={() => navigate('/')} style={{ marginTop: '20px' }}>
        Back to Search
      </button>
    </div>
  );
}
