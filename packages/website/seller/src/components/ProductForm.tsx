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

const FORM_STYLE = {
  maxWidth: '600px',
};

const CONTAINER_STYLE = {
  marginBottom: '16px',
};

const LABEL_STYLE = {
  display: 'block',
  marginBottom: '6px',
  fontWeight: '500',
  fontSize: '14px',
  color: '#475569',
};

const INPUT_STYLE = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: 'white',
};

const INPUT_DISABLED_STYLE = {
  backgroundColor: '#f1f5f9',
  cursor: 'not-allowed',
  color: '#94a3b8',
};

const INPUT_FOCUS_STYLE = {
  outline: 'none',
  borderColor: '#3b82f6',
  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
};

const TEXTAREA_STYLE = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: 'white',
  minHeight: '80px',
  resize: 'vertical' as const,
};

const BUTTON_CONTAINER_STYLE = {
  display: 'flex',
  gap: '12px',
  marginTop: '24px',
};

const BUTTON_STYLE = {
  padding: '10px 20px',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.2s, transform 0.1s',
};

const BUTTON_PRIMARY_STYLE = {
  backgroundColor: '#16a34a',
};

const BUTTON_PRIMARY_HOVER_STYLE = {
  backgroundColor: '#15803d',
};

const BUTTON_SECONDARY_STYLE = {
  backgroundColor: '#64748b',
};

const BUTTON_SECONDARY_HOVER_STYLE = {
  backgroundColor: '#475569',
};

const BUTTON_LOADING_STYLE = {
  backgroundColor: '#94a3b8',
  cursor: 'not-allowed',
};

const HELPER_TEXT_STYLE = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '4px',
  marginBottom: '0',
};

export function ProductForm({ product, onSubmit, onCancel, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    id: product?.id || `item-${Date.now()}`,
    name: product?.descriptor?.name || '',
    description: product?.descriptor?.short_desc || '',
    price: product?.price?.value || '',
    currency: product?.price?.currency || 'INR',
    categoryId: product?.category_id || 'cat-1',
  });

  const [isPrimaryHovered, setIsPrimaryHovered] = useState(false);
  const [isSecondaryHovered, setIsSecondaryHovered] = useState(false);

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!e.target.disabled) {
      Object.assign(e.target.style, INPUT_FOCUS_STYLE);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    Object.assign(e.target.style, { borderColor: '#cbd5e1', boxShadow: 'none' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={FORM_STYLE}>
      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-id" style={LABEL_STYLE}>
          Product ID
        </label>
        <input
          id="product-id"
          type="text"
          value={formData.id}
          onChange={handleInputChange('id')}
          disabled={!!product}
          required
          style={{
            ...INPUT_STYLE,
            ...(product ? INPUT_DISABLED_STYLE : {}),
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {product && (
          <p style={HELPER_TEXT_STYLE}>
            Product ID cannot be changed after creation
          </p>
        )}
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-name" style={LABEL_STYLE}>
          Product Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          id="product-name"
          type="text"
          value={formData.name}
          onChange={handleInputChange('name')}
          required
          placeholder="e.g., Organic Mango"
          style={INPUT_STYLE}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-description" style={LABEL_STYLE}>
          Description
        </label>
        <textarea
          id="product-description"
          value={formData.description}
          onChange={handleInputChange('description')}
          rows={3}
          placeholder="Short product description"
          style={TEXTAREA_STYLE}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-category" style={LABEL_STYLE}>
          Category
        </label>
        <select
          id="product-category"
          value={formData.categoryId}
          onChange={handleInputChange('categoryId')}
          style={INPUT_STYLE}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <option value="cat-1">Grocery</option>
          <option value="cat-2">Restaurant</option>
          <option value="cat-3">Fashion</option>
          <option value="cat-4">Electronics</option>
        </select>
      </div>

      <div style={CONTAINER_STYLE}>
        <label htmlFor="product-price" style={LABEL_STYLE}>
          Price <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <input
              id="product-price"
              type="number"
              value={formData.price}
              onChange={handleInputChange('price')}
              required
              min="0"
              step="0.01"
              placeholder="100"
              style={INPUT_STYLE}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <select
            value={formData.currency}
            onChange={handleInputChange('currency')}
            style={{ ...INPUT_STYLE, width: '100px' }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div style={BUTTON_CONTAINER_STYLE}>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...BUTTON_STYLE,
            ...(loading ? BUTTON_LOADING_STYLE : BUTTON_PRIMARY_STYLE),
            ...(isPrimaryHovered && !loading ? BUTTON_PRIMARY_HOVER_STYLE : {}),
          }}
          onMouseEnter={() => !loading && setIsPrimaryHovered(true)}
          onMouseLeave={() => !loading && setIsPrimaryHovered(false)}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            ...BUTTON_STYLE,
            ...BUTTON_SECONDARY_STYLE,
            ...(isSecondaryHovered && !loading ? BUTTON_SECONDARY_HOVER_STYLE : {}),
            ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
          }}
          onMouseEnter={() => !loading && setIsSecondaryHovered(true)}
          onMouseLeave={() => !loading && setIsSecondaryHovered(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
