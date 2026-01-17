import { useState, FormEvent } from 'react';
import { PILL_BUTTON, SELECT_BOX, TEXT_BOX, SPACING } from '@ondc-agent/shared/design-system';

const CATEGORY_OPTIONS = [
  { value: 'grocery', label: 'Grocery' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'electronics', label: 'Electronics' },
] as const;

const FORM_STYLE = {
  display: 'flex',
  gap: SPACING.md,
  alignItems: 'center',
  flexWrap: 'wrap' as const,
};

const SELECT_BASE = {
  ...SELECT_BOX.base,
  minWidth: '120px',
};

const INPUT_BASE = {
  ...TEXT_BOX.track,
  flex: '1',
  minWidth: '200px',
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

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => {
    Object.assign(e.target.style, SELECT_BOX.focus);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement | HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.track);
  };

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLE}>
      <label htmlFor="category-select" className="visually-hidden">
        Category
      </label>
      <select
        id="category-select"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={SELECT_BASE}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
        style={INPUT_BASE}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <button type="submit" style={PILL_BUTTON.orange}>
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
