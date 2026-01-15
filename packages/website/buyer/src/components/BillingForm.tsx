import { useState, useEffect } from 'react';
import type { UCPSession } from '@ondc-website/shared';

const API_BASE = 'http://localhost:3001';

export interface BillingFormProps {
  session: UCPSession | null;
}

export function BillingForm({ session }: BillingFormProps) {
  const [name, setName] = useState(session?.buyer?.name || '');
  const [email, setEmail] = useState(session?.buyer?.contact?.email || '');
  const [phone, setPhone] = useState(session?.buyer?.contact?.phone || '');
  const [taxId, setTaxId] = useState(session?.buyer?.taxId || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync form with session data
  useEffect(() => {
    if (session?.buyer) {
      setName(session.buyer.name || '');
      setEmail(session.buyer.contact?.email || '');
      setPhone(session.buyer.contact?.phone || '');
      setTaxId(session.buyer.taxId || '');
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const sessionId = localStorage.getItem('ondc-session-id');
      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await fetch(`${API_BASE}/api/cart/buyer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          name,
          email,
          phone,
          taxId,
        }),
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
  };

  const isDirty =
    name !== session?.buyer?.name ||
    email !== session?.buyer?.contact?.email ||
    phone !== session?.buyer?.contact?.phone ||
    taxId !== session?.buyer?.taxId;

  const isValid = name.trim() !== '' && email.trim() !== '' && phone.trim() !== '';

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Billing Information</h2>
        {isDirty && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isValid}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: saving ? '#9ca3af' : '#007bff',
              color: 'white',
              fontSize: '0.9em',
              cursor: saving || !isValid ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {saved && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            borderRadius: '4px',
            color: '#065f46',
            marginBottom: '16px',
            fontSize: '0.9em',
          }}
        >
          ✓ Information saved
        </div>
      )}

      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Full Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSave}
            placeholder="John Doe"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1em',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleSave}
              placeholder="john@example.com"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1em',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Phone *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={handleSave}
              placeholder="+919876543210"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '1em',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            GSTIN (Optional)
          </label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value.toUpperCase())}
            onBlur={handleSave}
            placeholder="29ABCDE1234F1Z5"
            maxLength={15}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '1em',
              textTransform: 'uppercase',
            }}
          />
          <p style={{ fontSize: '0.85em', color: '#666', marginTop: '4px' }}>
            For business purchases and GST invoices
          </p>
        </div>
      </div>
    </div>
  );
}
