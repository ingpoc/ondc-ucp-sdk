import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '@ondc-website/shared/hooks';
import { SearchBar, FilterSidebar, SortDropdown, ResultGrid } from '../components';
import type { UCPItem } from '@ondc-website/shared';
import type { SearchFilters } from '../components/FilterSidebar';

interface SearchResponse {
  items: UCPItem[];
  totalCount: number;
}

export function ResultsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') ?? 'grocery';
  const query = searchParams.get('q') ?? undefined;

  const [filters, setFilters] = useState<SearchFilters>({});

  const { data, loading, error, execute } = useSearch(category, {
    query,
    preferences: {
      priceRange: filters.maxPrice ? { max: filters.maxPrice } : undefined,
      minRating: filters.minRating,
      sortBy: filters.sortBy as any,
    },
  });

  useEffect(() => {
    execute();
  }, [execute, filters, query, category]);

  function handleSearch(cat: string, q: string): void {
    navigate(`/results?category=${cat}&q=${encodeURIComponent(q)}`);
  }

  function handleSortChange(value: string): void {
    setFilters({ ...filters, sortBy: value });
  }

  function handleItemClick(item: UCPItem): void {
    navigate(`/product/${item.id}`);
  }

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
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          onSearch={handleSearch}
          defaultCategory={category}
          defaultQuery={query ?? ''}
        />
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <FilterSidebar filters={filters} onChange={setFilters} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2>
              Results for "{query || category}" ({items.length} items)
            </h2>
            <SortDropdown
              value={filters.sortBy ?? 'relevance'}
              onChange={handleSortChange}
            />
          </div>
          <ResultGrid
            items={items}
            onItemClick={handleItemClick}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
