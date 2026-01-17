const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const CONTAINER_STYLE = {
  padding: '16px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  minWidth: '200px',
};

const HEADER_STYLE = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 16px 0',
};

const FILTER_SECTION_STYLE = {
  marginBottom: '16px',
};

const LABEL_STYLE = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
  marginBottom: '6px',
};

const INPUT_STYLE = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  backgroundColor: 'white',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const INPUT_FOCUS_STYLE = {
  outline: 'none',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

const SELECT_STYLE = {
  width: '100%',
  padding: '8px 10px',
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

export interface SearchFilters {
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
}

export interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps): JSX.Element {
  function handleChange(key: keyof SearchFilters, value: unknown): void {
    onChange({ ...filters, [key]: value });
  }

  function formatValue(value: number | undefined): string {
    return value?.toString() ?? '';
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, INPUT_FOCUS_STYLE);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' });
  };

  const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, SELECT_FOCUS_STYLE);
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' });
  };

  return (
    <div style={CONTAINER_STYLE}>
      <h3 style={HEADER_STYLE}>Filters</h3>

      <div style={FILTER_SECTION_STYLE}>
        <label htmlFor="max-price" style={LABEL_STYLE}>
          Max Price
        </label>
        <input
          id="max-price"
          type="number"
          min="0"
          step="0.01"
          value={formatValue(filters.maxPrice)}
          onChange={(e) =>
            handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Any"
          style={INPUT_STYLE}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      <div style={FILTER_SECTION_STYLE}>
        <label htmlFor="min-rating" style={LABEL_STYLE}>
          Min Rating
        </label>
        <input
          id="min-rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formatValue(filters.minRating)}
          onChange={(e) =>
            handleChange('minRating', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Any"
          style={INPUT_STYLE}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </div>

      <div style={FILTER_SECTION_STYLE}>
        <label htmlFor="sort-by" style={LABEL_STYLE}>
          Sort By
        </label>
        <select
          id="sort-by"
          value={filters.sortBy ?? 'relevance'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          style={SELECT_STYLE}
          onFocus={handleSelectFocus}
          onBlur={handleSelectBlur}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
