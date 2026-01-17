const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const CONTAINER_STYLE = {
  padding: '15px',
  background: '#f8f9fa',
  borderRadius: '8px',
  minWidth: '200px',
};

const LABEL_STYLE = {
  display: 'block',
  marginBottom: '5px',
};

const INPUT_STYLE = {
  width: '100%',
  padding: '5px',
};

const FILTER_SECTION_STYLE = {
  marginBottom: '15px',
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

  return (
    <div style={CONTAINER_STYLE}>
      <h3>Filters</h3>

      <div style={FILTER_SECTION_STYLE}>
        <label style={LABEL_STYLE}>Max Price:</label>
        <input
          type="number"
          value={formatValue(filters.maxPrice)}
          onChange={(e) =>
            handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Any"
          style={INPUT_STYLE}
        />
      </div>

      <div style={FILTER_SECTION_STYLE}>
        <label style={LABEL_STYLE}>Min Rating:</label>
        <input
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
        />
      </div>

      <div style={FILTER_SECTION_STYLE}>
        <label style={LABEL_STYLE}>Sort By:</label>
        <select
          value={filters.sortBy ?? 'relevance'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          style={INPUT_STYLE}
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
