import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch, useCart } from '@ondc-website/shared/hooks';
import { SearchBar, FilterSidebar, SortDropdown, ResultGrid } from '../components';
import type { UCPItem } from '@ondc-website/shared';
import type { SearchFilters } from '../components/FilterSidebar';
import { DRAMS, SPACING, TYPOGRAPHY, RADIUS, BUTTON } from '@ondc-agent/shared/design-system';

interface SearchResponse {
  items: UCPItem[];
  totalCount: number;
}

// DRAMS: Clean white page
const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: '#ffffff',
  padding: '0',
  width: '100%',
};

// DRAMS: Clean search header
const SEARCH_SECTION_STYLE = {
  backgroundColor: DRAMS.grayTrack,
  borderRadius: '0',
  padding: '40px 80px',
  marginBottom: '0',
  boxShadow: 'none',
  borderBottom: 'none',
};

const CONTENT_LAYOUT_STYLE = {
  display: 'flex',
  gap: SPACING['2xl'],
  alignItems: 'flex-start',
  padding: `${SPACING['3xl']} 80px`,
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
  marginBottom: SPACING.xl,
};

const TITLE_STYLE = {
  ...TYPOGRAPHY.h2,
  color: DRAMS.textDark,
  margin: 0,
};

const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING['3xl'],
  color: DRAMS.textLight,
  ...TYPOGRAPHY.body,
};

const ERROR_STYLE = {
  padding: SPACING.lg,
  borderRadius: RADIUS.lg,
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#dc2626',
  ...TYPOGRAPHY.body,
};

// DRAMS: Pill-style secondary button
const BUTTON_SECONDARY_STYLE = {
  ...BUTTON.secondary,
};

export function ResultsPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') ?? 'grocery';
  const query = searchParams.get('q') ?? undefined;
  const { addToCart } = useCart();

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

  async function handleAddToCart(item: UCPItem): Promise<void> {
    try {
      await addToCart(item as any);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
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
          <p style={{ margin: 0, fontWeight: TYPOGRAPHY.label.fontWeight }}>Error</p>
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
            onAddToCart={handleAddToCart}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
