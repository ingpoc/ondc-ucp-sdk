import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@ondc-website/shared/hooks';

export function SearchPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('grocery');
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/results?category=${category}&q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      <h2>Search Products</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            <option value="grocery">Grocery</option>
            <option value="restaurant">Restaurant</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
          </select>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="query">Search query:</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., organic mango"
            style={{ marginLeft: '10px', padding: '5px', width: '250px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>
          Search
        </button>
      </form>
    </div>
  );
}
