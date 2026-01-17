import { useState } from 'react';
import type { BecknItem } from '@ondc-website/shared';

export interface ProductFormData {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  categoryId: string;
}

export interface ProductFormProps {
  product?: BecknItem;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

// Extract static styles outside component
const INPUT_STYLE = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const BUTTON_STYLE = {
  padding: '10px 20px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer' as const,
};

const LABEL_STYLE = {
  display: 'block' as const,
  marginBottom: '5px',
  fontWeight: 'bold' as const,
};

const CONTAINER_STYLE = { marginBottom: '15px' };

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    id: product?.id || `item-${Date.now()}`,
    name: product?.descriptor?.name || '',
    description: product?.descriptor?.short_desc || '',
    price: product?.price?.value || '',
    currency: product?.price?.currency || 'INR',
    categoryId: product?.category_id || 'cat-1',
  });

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      <div style={CONTAINER_STYLE}>
        <label htmlFor="id" style={LABEL_STYLE}>
          Product ID:
        </label>
        <input
          id="id"
          type="text"
          value={formData.id}
          onChange={handleInputChange('id')}
          disabled={!!product}
          required
          style={INPUT_STYLE}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="name" style={LABEL_STYLE}>
          Product Name: *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          placeholder="e.g., Organic Mango"
          style={INPUT_STYLE}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="description" style={LABEL_STYLE}>
          Description:
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange('description')}
          rows={3}
          placeholder="Short product description"
          style={INPUT_STYLE}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="categoryId" style={LABEL_STYLE}>
          Category:
        </label>
        <select
          id="categoryId"
          value={formData.categoryId}
          onChange={handleInputChange('categoryId')}
          style={INPUT_STYLE}
        >
          <option value="cat-1">Grocery</option>
          <option value="cat-2">Restaurant</option>
          <option value="cat-3">Fashion</option>
          <option value="cat-4">Electronics</option>
        </select>
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="price" style={LABEL_STYLE}>
          Price: *
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            id="price"
            type="number"
            value={formData.price}
            onChange={handleInputChange('price')}
            required
            min="0"
            step="0.01"
            placeholder="100"
            style={{ flex: 1, ...INPUT_STYLE }}
          />
          <select
            value={formData.currency}
            onChange={handleInputChange('currency')}
            style={INPUT_STYLE}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...BUTTON_STYLE,
            backgroundColor: loading ? '#6c757d' : '#28a745',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            ...BUTTON_STYLE,
            backgroundColor: '#6c757d',
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
