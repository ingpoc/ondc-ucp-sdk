import { useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';

export function SearchPage() {
  const navigate = useNavigate();

  const handleSearch = (category: string, query: string) => {
    navigate(`/results?category=${category}&q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <h2>Search Products</h2>
      <SearchBar onSearch={handleSearch} />
    </div>
  );
}
