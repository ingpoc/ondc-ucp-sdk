import { TEXT_BOX, SELECT_BOX, SPACING, TYPOGRAPHY, DRAMS_CARD, DRAMS } from '@ondc-agent/shared/design-system';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const CONTAINER_STYLE = {
  ...DRAMS_CARD.base,
  padding: SPACING.lg,
  minWidth: '200px',
};

const HEADER_STYLE = {
  ...TYPOGRAPHY.h3,
  color: DRAMS.textDark,
  marginBottom: SPACING.md,
};

const FILTER_SECTION_STYLE = {
  marginBottom: SPACING.md,
};

const LABEL_STYLE = {
  ...TYPOGRAPHY.label,
  display: 'block',
  marginBottom: SPACING.xs,
  color: DRAMS.textDark,
};

const INPUT_BASE = {
  ...TEXT_BOX.track,
  width: '100%',
};

const SELECT_BASE = {
  ...SELECT_BOX.base,
  width: '100%',
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
    Object.assign(e.target.style, TEXT_BOX.focus);
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, TEXT_BOX.track);
  };

  const handleSelectFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, SELECT_BOX.focus);
  };

  const handleSelectBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, SELECT_BOX.base);
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
          style={INPUT_BASE}
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
          style={INPUT_BASE}
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
          style={SELECT_BASE}
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
