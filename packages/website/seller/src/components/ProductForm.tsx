import { useState } from 'react';
import type { BecknItem } from '@ondc-website/shared';
import { TEXT_BOX, PILL_BUTTON, SELECT_BOX, SPACING, TYPOGRAPHY, DRAMS, DRAMS_CARD, disabled } from '@ondc-agent/shared/design-system';

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
  marginBottom: SPACING.md,
};

const LABEL_STYLE = {
  ...TYPOGRAPHY.label,
  display: 'block',
  marginBottom: SPACING.xs,
  color: DRAMS.textDark,
};

const INPUT_BASE = {
  ...TEXT_BOX.track,
  width: '100%',
};

const TEXTAREA_BASE = {
  ...TEXT_BOX.track,
  width: '100%',
  minHeight: '80px',
  resize: 'vertical' as const,
};

const BUTTON_CONTAINER_STYLE = {
  display: 'flex',
  gap: SPACING.md,
  marginTop: SPACING.xl,
};

const HELPER_TEXT_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  marginTop: SPACING.xs,
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

  const handleInputChange = (field: keyof ProductFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!e.target.disabled) {
      Object.assign(e.target.style, TEXT_BOX.focus);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    Object.assign(e.target.style, TEXT_BOX.track);
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
            ...INPUT_BASE,
            ...(product ? disabled : {}),
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
          style={INPUT_BASE}
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
          style={TEXTAREA_BASE}
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
          style={INPUT_BASE}
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
        <div style={{ display: 'flex', gap: SPACING.md }}>
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
              style={INPUT_BASE}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          </div>
          <select
            value={formData.currency}
            onChange={handleInputChange('currency')}
            style={{ ...INPUT_BASE, width: '100px' }}
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
            ...PILL_BUTTON.orange,
            ...(loading ? disabled : {}),
          }}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            ...PILL_BUTTON.gray,
            ...(loading ? disabled : {}),
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
