import type { BecknItem } from '@ondc-website/shared';

export interface InventoryTableProps {
  items: BecknItem[];
  onEdit: (item: BecknItem) => void;
  onDelete: (itemId: string) => void;
}

// Extract static styles
const HEADER_STYLE = {
  padding: '12px',
  textAlign: 'left' as const,
  fontWeight: '600' as const,
};

const CELL_STYLE = {
  padding: '12px',
};

const BUTTON_STYLE = {
  padding: '6px 12px',
  color: 'white',
  border: 'none' as const,
  borderRadius: '4px',
  cursor: 'pointer' as const,
  fontSize: '0.9em',
};

const CATEGORY_BADGE_STYLE = {
  padding: '4px 8px',
  background: '#e7f3ff',
  color: '#0066cc',
  borderRadius: '12px',
  fontSize: '0.85em',
};

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: '40px',
  background: '#f8f9fa',
  borderRadius: '8px',
};

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <p style={{ fontSize: '1.1em', color: '#666' }}>No products in catalog</p>
        <p style={{ color: '#999' }}>Add your first product to get started</p>
      </div>
    );
  }

  const handleDelete = (item: BecknItem) => {
    const productName = item.descriptor?.name || item.id;
    if (confirm(`Delete product "${productName}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', background: '#f8f9fa' }}>
            <th style={HEADER_STYLE}>ID</th>
            <th style={HEADER_STYLE}>Name</th>
            <th style={HEADER_STYLE}>Description</th>
            <th style={HEADER_STYLE}>Price</th>
            <th style={HEADER_STYLE}>Category</th>
            <th style={{ ...HEADER_STYLE, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{ borderBottom: '1px solid #dee2e6' }}
              className="hover-row"
            >
              <td style={{ ...CELL_STYLE, fontSize: '0.9em', color: '#666' }}>{item.id}</td>
              <td style={{ ...CELL_STYLE, fontWeight: '500' }}>{item.descriptor?.name || item.id}</td>
              <td style={{ ...CELL_STYLE, color: '#666', maxWidth: '250px' }}>
                {item.descriptor?.short_desc || '-'}
              </td>
              <td style={CELL_STYLE}>
                <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                  {item.price?.currency} {item.price?.value}
                </span>
              </td>
              <td style={CELL_STYLE}>
                <span style={CATEGORY_BADGE_STYLE}>{item.category_id || 'cat-1'}</span>
              </td>
              <td style={{ ...CELL_STYLE, textAlign: 'right' }}>
                <button
                  onClick={() => onEdit(item)}
                  style={{ ...BUTTON_STYLE, marginRight: '8px', backgroundColor: '#007bff' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  style={{ ...BUTTON_STYLE, backgroundColor: '#dc3545' }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .hover-row:hover {
          background: #f8f9fa;
        }
      `}</style>
    </div>
  );
}
