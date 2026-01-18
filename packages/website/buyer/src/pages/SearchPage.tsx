import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { PageLayout } from '@ondc-agent/shared/design-system';

const HERO_STYLE = {
  maxWidth: '800px',
  width: '100%',
  textAlign: 'center' as const,
};

const SEARCH_WRAPPER_STYLE = {
  maxWidth: '600px',
  width: '100%',
};

export function SearchPage(): JSX.Element {
  const navigate = useNavigate();

  function handleSearch(category: string, query: string): void {
    navigate(`/results?category=${category}&q=${encodeURIComponent(query)}`);
  }

  return (
    <PageLayout variant="gray">
      <div style={HERO_STYLE}>
        <h1 style={{ fontSize: '32px', fontWeight: 300, color: '#333', margin: '0 0 16px 0' }}>
          Find What You Need
        </h1>
        <p style={{ fontSize: '15px', color: '#999', margin: '0 0 32px 0', lineHeight: 1.6 }}>
          Search across thousands of products from verified sellers. Get the best prices and fastest delivery.
        </p>
        <div style={SEARCH_WRAPPER_STYLE}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </PageLayout>
  );
}
