import { SELECT_BOX, SPACING, TYPOGRAPHY, COLORS } from '@ondc-agent/shared/design-system';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: SPACING.md,
};

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps): JSX.Element {
  return (
    <div style={CONTAINER_STYLE}>
      <label htmlFor="sort-select" style={{ ...TYPOGRAPHY.label, color: COLORS.textSecondary }}>
        Sort by:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={SELECT_BOX.base}
        onFocus={(e) => Object.assign(e.target.style, SELECT_BOX.focus)}
        onBlur={(e) => Object.assign(e.target.style, SELECT_BOX.base)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
