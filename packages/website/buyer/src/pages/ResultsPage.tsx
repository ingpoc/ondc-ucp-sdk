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

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#f8fafc',
  padding: '0',
  width: '100%',
};

const SEARCH_SECTION_STYLE = {
  backgroundColor: 'white',
  borderRadius: '0',
  padding: '40px 80px',
  marginBottom: '0',
  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
  borderBottom: '2px solid #e2e8f0',
};

const CONTENT_LAYOUT_STYLE = {
  display: 'flex',
  gap: '32px',
  alignItems: 'flex-start',
  padding: '48px 80px',
};

const FILTERS_STYLE = {
  width: '320px',
  flexShrink: 0,
};

const RESULTS_STYLE = {
  flex: 1,
  minWidth: 0,
};

const HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const TITLE_STYLE = {
  fontSize: '32px',
  fontWeight: 800,
  letterSpacing: '-1px',
  color: '#0f172a',
  margin: 0,
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

const BUTTON_SECONDARY_STYLE = {
  padding: '10px 20px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#0f172a',
  fontSize: '14px',
  fontWeight: 500,
  cursor: 'pointer',
};

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
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={LOADING_STYLE}>
          Loading results...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={PAGE_CONTAINER_STYLE}>
        <div style={ERROR_STYLE}>
          <p style={{ margin: 0, fontWeight: 600 }}>Error</p>
          <p style={{ margin: '4px 0 0 0' }}>{error}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              ...BUTTON_SECONDARY_STYLE,
              marginTop: '16px',
            }}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const items = (data as SearchResponse | null)?.items ?? [];

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={SEARCH_SECTION_STYLE}>
        <SearchBar
          onSearch={handleSearch}
          defaultCategory={category}
          defaultQuery={query ?? ''}
        />
      </div>

      <div style={CONTENT_LAYOUT_STYLE}>
        <div style={FILTERS_STYLE}>
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        <div style={RESULTS_STYLE}>
          <div style={HEADER_STYLE}>
            <h2 style={TITLE_STYLE}>
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
