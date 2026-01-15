export interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>Sort by:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
      >
        <option value="relevance">Relevance</option>
        <option value="price">Price</option>
        <option value="rating">Rating</option>
        <option value="distance">Distance</option>
      </select>
    </div>
  );
}
