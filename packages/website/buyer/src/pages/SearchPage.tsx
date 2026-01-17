import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';

export function SearchPage(): JSX.Element {
  const navigate = useNavigate();

  function handleSearch(category: string, query: string): void {
    navigate(`/results?category=${category}&q=${encodeURIComponent(query)}`);
  }

  return (
    <div>
      <h2>Search Products</h2>
      <SearchBar onSearch={handleSearch} />
    </div>
  );
}
