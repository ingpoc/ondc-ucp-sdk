const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
] as const;

const CONTAINER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const LABEL_STYLE = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#475569',
};

const SELECT_STYLE = {
  padding: '8px 12px',
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
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={SELECT_STYLE}
        onFocus={(e) => Object.assign(e.target.style, SELECT_FOCUS_STYLE)}
        onBlur={(e) => Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' })}
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
