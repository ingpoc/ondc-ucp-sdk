import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { DRAMS, TYPOGRAPHY, SPACING } from '@ondc-agent/shared/design-system';

// DRAMS: Clean, minimal search page
const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: DRAMS.grayTrack,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '80px 24px',
  width: '100%',
};

const HERO_STYLE = {
  maxWidth: '800px',
  width: '100%',
  textAlign: 'center' as const,
};

// DRAMS: Bold, clean typography
const HEADING_STYLE = {
  ...TYPOGRAPHY.h1,
  color: DRAMS.textDark,
  marginBottom: SPACING.lg,
};

const SUBHEADING_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  marginBottom: SPACING['2xl'],
  lineHeight: 1.6,
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
