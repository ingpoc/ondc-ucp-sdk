import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';

const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 24px',
  width: '100vw',
  marginLeft: 'calc(-50vw + 50%)',
};

const HERO_STYLE = {
  maxWidth: '1000px',
  width: '100%',
  textAlign: 'center' as const,
};

const HEADING_STYLE = {
  fontSize: '72px',
  fontWeight: 800,
  letterSpacing: '-3px',
  color: '#ffffff',
  marginBottom: '24px',
  lineHeight: 1.1,
  textShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

const SUBHEADING_STYLE = {
  fontSize: '22px',
  fontWeight: 400,
  color: 'rgba(255,255,255,0.95)',
  marginBottom: '56px',
  lineHeight: 1.6,
  textShadow: '0 2px 10px rgba(0,0,0,0.1)',
};

const SEARCH_WRAPPER_STYLE = {
  maxWidth: '700px',
  margin: '0 auto',
};

export function SearchPage(): JSX.Element {
  const navigate = useNavigate();

  function handleSearch(category: string, query: string): void {
    navigate(`/results?category=${category}&q=${encodeURIComponent(query)}`);
  }

  return (
    <div style={PAGE_CONTAINER_STYLE}>
      <div style={HERO_STYLE}>
        <h1 style={HEADING_STYLE}>
          Find What You Need
        </h1>
        <p style={SUBHEADING_STYLE}>
          Search across thousands of products from verified sellers. Get the best prices and fastest delivery.
        </p>
        <div style={SEARCH_WRAPPER_STYLE}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
}
