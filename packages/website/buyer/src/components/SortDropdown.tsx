const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const STYLE = { padding: '5px', borderRadius: '4px', border: '1px solid #ccc' } as const;

export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={STYLE}
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
