import type { BecknItem } from '@ondc-website/shared';

export interface InventoryTableProps {
  items: BecknItem[];
  onEdit: (item: BecknItem) => void;
  onDelete: (itemId: string) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px' }}>
        <p style={{ fontSize: '1.1em', color: '#666' }}>No products in catalog</p>
        <p style={{ color: '#999' }}>Add your first product to get started</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6', background: '#f8f9fa' }}>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>ID</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Description</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Price</th>
            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
            <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              style={{ borderBottom: '1px solid #dee2e6', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
            >
              <td style={{ padding: '12px', fontSize: '0.9em', color: '#666' }}>
                {item.id}
              </td>
              <td style={{ padding: '12px', fontWeight: '500' }}>
                {item.descriptor?.name || item.id}
              </td>
              <td style={{ padding: '12px', color: '#666', maxWidth: '250px' }}>
                {item.descriptor?.short_desc || '-'}
              </td>
              <td style={{ padding: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                  {item.price?.currency} {item.price?.value}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    background: '#e7f3ff',
                    color: '#0066cc',
                    borderRadius: '12px',
                    fontSize: '0.85em',
                  }}
                >
                  {item.category_id || 'cat-1'}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    padding: '6px 12px',
                    marginRight: '8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete product "${item.descriptor?.name || item.id}"?`)) {
                      onDelete(item.id);
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
