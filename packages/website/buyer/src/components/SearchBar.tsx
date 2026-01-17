import { useState, FormEvent } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'electronics', label: 'Electronics' },
] as const;

const DEFAULT_FORM_STYLE = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const SELECT_STYLE = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const INPUT_STYLE = {
  flex: '1',
  minWidth: '200px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const BUTTON_STYLE = {
  padding: '8px 16px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export interface SearchBarProps {
  onSearch: (category: string, query: string) => void;
  defaultCategory?: string;
  defaultQuery?: string;
}

export function SearchBar({
  onSearch,
  defaultCategory = 'grocery',
  defaultQuery = '',
}: SearchBarProps): JSX.Element {
  const [category, setCategory] = useState(defaultCategory);
  const [query, setQuery] = useState(defaultQuery);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    onSearch(category, query);
  }

  return (
    <form onSubmit={handleSubmit} style={DEFAULT_FORM_STYLE}>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={SELECT_STYLE}
      >
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        style={INPUT_STYLE}
      />
      <button type="submit" style={BUTTON_STYLE}>
        Search
      </button>
    </form>
  );
}
