import { useState } from 'react';
import type { BecknItem } from '@ondc-website/shared';

export interface InventoryTableProps {
  items: BecknItem[];
  onEdit: (item: BecknItem) => void;
  onDelete: (itemId: string) => void;
}

const TABLE_CONTAINER_STYLE = {
  overflowX: 'auto' as const,
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: 'white',
};

const TABLE_STYLE = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  background: 'white',
};

const HEADER_ROW_STYLE = {
  borderBottom: '2px solid #e2e8f0',
  background: '#f8fafc',
};

const HEADER_STYLE = {
  padding: '14px 16px',
  textAlign: 'left' as const,
  fontWeight: '600',
  fontSize: '13px',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const ROW_STYLE = {
  borderBottom: '1px solid #e2e8f0',
  transition: 'background-color 0.15s',
};

const ROW_HOVER_STYLE = {
  backgroundColor: '#f8fafc',
};

const CELL_STYLE = {
  padding: '14px 16px',
  fontSize: '14px',
};

const CELL_ID_STYLE = {
  ...CELL_STYLE,
  fontSize: '12px',
  color: '#94a3b8',
  fontFamily: 'monospace',
};

const CELL_NAME_STYLE = {
  ...CELL_STYLE,
  fontWeight: '500',
  color: '#1e293b',
};

const CELL_DESC_STYLE = {
  ...CELL_STYLE,
  color: '#64748b',
  maxWidth: '250px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};

const PRICE_STYLE = {
  fontWeight: '600',
  color: '#16a34a',
  fontSize: '15px',
};

const CATEGORY_BADGE_STYLE = {
  display: 'inline-block',
  padding: '4px 10px',
  background: '#dbeafe',
  color: '#1e40af',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '500',
};

const ACTIONS_CELL_STYLE = {
  ...CELL_STYLE,
  textAlign: 'right' as const,
};

const BUTTON_STYLE = {
  padding: '6px 14px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '500',
  transition: 'background-color 0.2s, transform 0.1s',
};

const BUTTON_EDIT_STYLE = {
  backgroundColor: '#3b82f6',
  marginRight: '8px',
};

const BUTTON_EDIT_HOVER_STYLE = {
  backgroundColor: '#2563eb',
};

const BUTTON_DELETE_STYLE = {
  backgroundColor: '#ef4444',
};

const BUTTON_DELETE_HOVER_STYLE = {
  backgroundColor: '#dc2626',
};

const EMPTY_STATE_STYLE = {
  textAlign: 'center' as const,
  padding: '60px 20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const EMPTY_STATE_ICON_STYLE = {
  fontSize: '48px',
  marginBottom: '16px',
};

const EMPTY_STATE_TITLE_STYLE = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  margin: '0 0 8px 0',
};

const EMPTY_STATE_TEXT_STYLE = {
  fontSize: '14px',
  color: '#64748b',
  margin: '0',
};

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<{ rowId: string; type: 'edit' | 'delete' } | null>(null);

  if (items.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <div style={EMPTY_STATE_ICON_STYLE}>📦</div>
        <h3 style={EMPTY_STATE_TITLE_STYLE}>No products in catalog</h3>
        <p style={EMPTY_STATE_TEXT_STYLE}>
          Add your first product to get started
        </p>
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
    <div style={TABLE_CONTAINER_STYLE}>
      <table style={TABLE_STYLE}>
        <thead>
          <tr style={HEADER_ROW_STYLE}>
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
              style={{
                ...ROW_STYLE,
                ...(hoveredRowId === item.id ? ROW_HOVER_STYLE : {}),
              }}
              onMouseEnter={() => setHoveredRowId(item.id)}
              onMouseLeave={() => setHoveredRowId(null)}
            >
              <td style={CELL_ID_STYLE}>{item.id}</td>
              <td style={CELL_NAME_STYLE}>{item.descriptor?.name || item.id}</td>
              <td style={CELL_DESC_STYLE}>
                {item.descriptor?.short_desc || '-'}
              </td>
              <td style={CELL_STYLE}>
                <span style={PRICE_STYLE}>
                  {item.price?.currency} {item.price?.value}
                </span>
              </td>
              <td style={CELL_STYLE}>
                <span style={CATEGORY_BADGE_STYLE}>{item.category_id || 'cat-1'}</span>
              </td>
              <td style={ACTIONS_CELL_STYLE}>
                <button
                  onClick={() => onEdit(item)}
                  style={{
                    ...BUTTON_STYLE,
                    ...BUTTON_EDIT_STYLE,
                    ...(hoveredButton?.rowId === item.id && hoveredButton?.type === 'edit'
                      ? BUTTON_EDIT_HOVER_STYLE
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredButton({ rowId: item.id, type: 'edit' })}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  style={{
                    ...BUTTON_STYLE,
                    ...BUTTON_DELETE_STYLE,
                    ...(hoveredButton?.rowId === item.id && hoveredButton?.type === 'delete'
                      ? BUTTON_DELETE_HOVER_STYLE
                      : {}),
                  }}
                  onMouseEnter={() => setHoveredButton({ rowId: item.id, type: 'delete' })}
                  onMouseLeave={() => setHoveredButton(null)}
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
