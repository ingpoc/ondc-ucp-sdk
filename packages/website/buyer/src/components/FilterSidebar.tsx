export interface SearchFilters {
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
}

export interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  const handleChange = (key: keyof SearchFilters, value: unknown) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div
      style={{
        padding: '15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        minWidth: '200px',
      }}
    >
      <h3>Filters</h3>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Max Price:
        </label>
        <input
          type="number"
          value={filters.maxPrice ?? ''}
          onChange={(e) =>
            handleChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Any"
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Min Rating:
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={filters.minRating ?? ''}
          onChange={(e) =>
            handleChange('minRating', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Any"
          style={{ width: '100%', padding: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          Sort By:
        </label>
        <select
          value={filters.sortBy ?? 'relevance'}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="relevance">Relevance</option>
          <option value="price">Price</option>
          <option value="rating">Rating</option>
          <option value="distance">Distance</option>
        </select>
      </div>
    </div>
  );
}
