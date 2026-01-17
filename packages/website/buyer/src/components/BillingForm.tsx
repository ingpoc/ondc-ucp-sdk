import { useState, useEffect, useCallback, useMemo } from 'react';
import type { UCPSession } from '@ondc-website/shared';

const API_BASE = 'http://localhost:3001';
const STORAGE_KEY = 'ondc-session-id';

const FORM_CONTAINER_STYLE = {
  backgroundColor: 'white',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
} as const;

const INPUT_STYLE = {
  width: '100%',
  padding: '10px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '1em',
} as const;

const LABEL_STYLE = {
  display: 'block' as const,
  marginBottom: '4px',
  fontWeight: 'bold' as const,
};

const BUTTON_STYLE = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  fontSize: '0.9em',
  cursor: 'pointer' as const,
} as const;

const SAVED_BADGE_STYLE = {
  padding: '8px 12px',
  backgroundColor: '#d1fae5',
  border: '1px solid #a7f3d0',
  borderRadius: '4px',
  color: '#065f46',
  marginBottom: '16px',
  fontSize: '0.9em',
} as const;

export interface BillingFormProps {
  session: UCPSession | null;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  onBlur?: () => void;
  style?: React.CSSProperties;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  pattern,
  maxLength,
  onBlur,
  style,
}: FormFieldProps): React.ReactElement {
  return (
    <div style={style}>
      <label style={LABEL_STYLE}>
        {label} {required && '*'}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        pattern={pattern}
        maxLength={maxLength}
        style={INPUT_STYLE}
      />
    </div>
  );
}

export function BillingForm({ session }: BillingFormProps): React.ReactElement {
  const [name, setName] = useState(session?.buyer?.name || '');
  const [email, setEmail] = useState(session?.buyer?.email || '');
  const [phone, setPhone] = useState(session?.buyer?.phone || '');
  const [taxId, setTaxId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session?.buyer) {
      setName(session.buyer.name || '');
      setEmail(session.buyer.email || '');
      setPhone(session.buyer.phone || '');
    }
  }, [session]);

  const handleSave = useCallback(async () => {
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    setSaving(true);
    setSaved(false);

    try {
      const sessionId = localStorage.getItem(STORAGE_KEY);
      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await fetch(`${API_BASE}/api/cart/buyer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, name, email, phone, taxId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save: ${response.status}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save buyer info:', err);
    } finally {
      setSaving(false);
    }
  }, [name, email, phone, taxId]);

  const isDirty = useMemo(
    () =>
      name !== (session?.buyer?.name || '') ||
      email !== (session?.buyer?.email || '') ||
      phone !== (session?.buyer?.phone || '') ||
      taxId !== '',
    [name, email, phone, taxId, session]
  );

  const isValid = useMemo(
    () => name.trim() !== '' && email.trim() !== '' && phone.trim() !== '',
    [name, email, phone]
  );

  return (
    <div style={FORM_CONTAINER_STYLE}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Billing Information</h2>
        {isDirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValid}
            style={{
              ...BUTTON_STYLE,
              backgroundColor: saving ? '#9ca3af' : '#007bff',
              color: 'white',
              cursor: saving || !isValid ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {saved && (
        <div style={SAVED_BADGE_STYLE}>
          ✓ Information saved
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        <FormField
          label="Full Name"
          value={name}
          onChange={setName}
          onBlur={handleSave}
          placeholder="John Doe"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FormField
            label="Email"
            value={email}
            onChange={setEmail}
            onBlur={handleSave}
            placeholder="john@example.com"
            type="email"
            required
          />
          <FormField
            label="Phone"
            value={phone}
            onChange={setPhone}
            onBlur={handleSave}
            placeholder="+919876543210"
            type="tel"
            required
          />
        </div>

        <FormField
          label="GSTIN (Optional)"
          value={taxId}
          onChange={(value) => setTaxId(value.toUpperCase())}
          onBlur={handleSave}
          placeholder="29ABCDE1234F1Z5"
          maxLength={15}
        />
        <p style={{ fontSize: '0.85em', color: '#666', marginTop: '-12px' }}>
          For business purchases and GST invoices
        </p>
      </div>
    </div>
  );
}
