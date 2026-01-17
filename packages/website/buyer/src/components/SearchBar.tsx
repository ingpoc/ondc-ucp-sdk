import { useState, FormEvent } from 'react';

const CATEGORY_OPTIONS = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'electronics', label: 'Electronics' },
] as const;

const FORM_STYLE = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const SELECT_STYLE = {
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: 'white',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const SELECT_FOCUS_STYLE = {
  outline: 'none',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

const INPUT_STYLE = {
  flex: '1',
  minWidth: '200px',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const INPUT_FOCUS_STYLE = {
  outline: 'none',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

const BUTTON_STYLE = {
  padding: '10px 20px',
  backgroundColor: '#1e293b',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.1s',
};

const BUTTON_HOVER_STYLE = {
  backgroundColor: '#334155',
};

const BUTTON_ACTIVE_STYLE = {
  transform: 'scale(0.98)',
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
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);

  function handleSubmit(e: FormEvent): void {
    e.preventDefault();
    onSearch(category, query);
  }

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLE}>
      <label htmlFor="category-select" className="visually-hidden">
        Category
      </label>
      <select
        id="category-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={SELECT_STYLE}
        onFocus={(e) => Object.assign(e.target.style, SELECT_FOCUS_STYLE)}
        onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
      >
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="search-input" className="visually-hidden">
        Search products
      </label>
      <input
        id="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        style={INPUT_STYLE}
        onFocus={(e) => Object.assign(e.target.style, INPUT_FOCUS_STYLE)}
        onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
      />

      <button
        type="submit"
        style={{
          ...BUTTON_STYLE,
          ...(isButtonHovered ? BUTTON_HOVER_STYLE : {}),
          ...(isButtonActive ? BUTTON_ACTIVE_STYLE : {}),
        }}
        onMouseEnter={() => setIsButtonHovered(true)}
        onMouseLeave={() => setIsButtonHovered(false)}
        onMouseDown={() => setIsButtonActive(true)}
        onMouseUp={() => setIsButtonActive(false)}
      >
        Search
      </button>

      <style>{`
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `}</style>
    </form>
  );
}
