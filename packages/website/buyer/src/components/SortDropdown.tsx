import { SPACING, TYPOGRAPHY, DRAMS } from '@ondc-agent/shared/design-system';
import { DramsSelect } from '@ondc-agent/shared/design-system';

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

const LABEL_STYLE = {
  ...TYPOGRAPHY.label,
  color: DRAMS.textLight,
};

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps): JSX.Element {
  return (
    <div style={CONTAINER_STYLE}>
      <label htmlFor="sort-select" style={LABEL_STYLE}>
        Sort by:
      </label>
      <DramsSelect
        id="sort-select"
        options={SORT_OPTIONS}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
