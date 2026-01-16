import { useState, useEffect } from 'react';

// Seller client configuration interface
interface SellerClientConfig {
  /** ONDC gateway base URL */
  baseUrl: string;
  /** Subscriber ID (e.g., "ondc.example.com") */
  subscriberId: string;
  /** Base64 encoded Ed25519 private key */
  privateKey: string;
  /** Unique key identifier */
  keyId?: string;
  /** Default domain for requests */
  domain?: string;
  /** Default country code */
  country?: string;
  /** Default city code */
  city?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

const API_BASE = 'http://localhost:3001';

interface ConfigError {
  field: string;
  message: string;
}

const isValidPrivateKey = (key: string): boolean => {
  if (!key) return false;
  try {
    const trimmed = key.trim();
    if (trimmed.length < 10) return false;
    return true;
  } catch {
    return false;
  }
};

const validateSubscriberId = (id: string): boolean => {
  if (!id) return false;
  const trimmed = id.trim();
  if (trimmed.length < 3) return false;
  return /^[a-zA-Z0-9.-]+$/.test(trimmed);
};

export function ConfigPage() {
  const [config, setConfig] = useState<SellerClientConfig>({
    baseUrl: 'https://gateway.ondc.org',
    subscriberId: '',
    privateKey: '',
    keyId: '',
    domain: 'nic2004:52110',
    country: 'IND',
    city: 'std:080',
    timeout: 30000,
  });

  const [errors, setErrors] = useState<ConfigError[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  // Load existing config on mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/seller/config`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig((prev: SellerClientConfig) => ({ ...prev, ...data.config }));
        }
      }
    } catch {
      // Ignore error if no config exists yet
    } finally {
      setLoading(false);
    }
  };

  const validate = (): ConfigError[] => {
    const validationErrors: ConfigError[] = [];

    if (!validateSubscriberId(config.subscriberId)) {
      validationErrors.push({
        field: 'subscriberId',
        message: 'Subscriber ID must be at least 3 characters and contain only letters, numbers, dots, and hyphens',
      });
    }

    if (!isValidPrivateKey(config.privateKey)) {
      validationErrors.push({
        field: 'privateKey',
        message: 'Private key is required and must be at least 10 characters',
      });
    }

    if (!config.baseUrl) {
      validationErrors.push({ field: 'baseUrl', message: 'Gateway URL is required' });
    }

    return validationErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTestResult(null);

    if (validationErrors.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/seller/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setTestResult({ success: true, message: 'Configuration saved successfully' });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to save configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKeyPair = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/seller/config/generate-keys`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate key pair');
      }
      const data = await response.json();
      setConfig((prev: SellerClientConfig) => ({
        ...prev,
        privateKey: data.privateKey,
        keyId: `${config.subscriberId || 'seller'}-${Date.now()}`,
      }));
      setTestResult({
        success: true,
        message: 'New key pair generated. Remember to save your configuration.',
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to generate key pair',
      });
    }
  };

  const handleTestConnection = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setTestResult(null);

    if (validationErrors.length > 0) {
      return;
    }

    setTesting(true);
    try {
      // Test connection via server API
      const response = await fetch(`${API_BASE}/api/seller/config/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        throw new Error('Connection test failed');
      }

      const result = await response.json();
      setTestResult({
        success: true,
        message: result.message || 'Connection test successful',
      });
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const getFieldError = (field: keyof SellerClientConfig): string | undefined => {
    return errors.find((e) => e.field === field)?.message;
  };

  if (loading && !config.subscriberId) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <h1>Seller Configuration</h1>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Seller Configuration</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Configure your ONDC seller credentials and connection settings
      </p>

      {/* Result Message */}
      {testResult && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            backgroundColor: testResult.success ? '#dcfce7' : '#fee2e2',
            border: `1px solid ${testResult.success ? '#86efac' : '#fca5a5'}`,
            color: testResult.success ? '#166534' : '#991b1b',
          }}
        >
          {testResult.message}
        </div>
      )}

      {/* Configuration Form */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.2em', marginBottom: '20px' }}>ONDC Credentials</h2>

        {/* Gateway URL */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Gateway URL *
          </label>
          <input
            type="text"
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="https://gateway.ondc.org"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
              ...(getFieldError('baseUrl')
                ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' }
                : {}),
            }}
          />
          {getFieldError('baseUrl') && (
            <p style={{ margin: '4px 0 0 0', color: '#dc2626', fontSize: '0.85em' }}>
              {getFieldError('baseUrl')}
            </p>
          )}
        </div>

        {/* Subscriber ID */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Subscriber ID *
          </label>
          <input
            type="text"
            value={config.subscriberId}
            onChange={(e) => setConfig({ ...config, subscriberId: e.target.value })}
            placeholder="ondc.example.com"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
              ...(getFieldError('subscriberId')
                ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' }
                : {}),
            }}
          />
          {getFieldError('subscriberId') && (
            <p style={{ margin: '4px 0 0 0', color: '#dc2626', fontSize: '0.85em' }}>
              {getFieldError('subscriberId')}
            </p>
          )}
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            Your unique ONDC subscriber identifier (e.g., ondc.example.com)
          </p>
        </div>

        {/* Private Key */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Private Key *
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={config.privateKey}
              onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
              placeholder="Base64 encoded Ed25519 private key"
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.9em',
                fontFamily: 'monospace',
                ...(getFieldError('privateKey')
                  ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' }
                  : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              style={{
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
                fontSize: '0.9em',
              }}
            >
              {showPrivateKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {getFieldError('privateKey') && (
            <p style={{ margin: '4px 0 0 0', color: '#dc2626', fontSize: '0.85em' }}>
              {getFieldError('privateKey')}
            </p>
          )}
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleGenerateKeyPair}
              style={{
                padding: '8px 16px',
                border: '1px solid #16a34a',
                borderRadius: '6px',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '0.9em',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Generate New Key Pair
            </button>
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            Ed25519 private key for signing ONDC requests
          </p>
        </div>

        {/* Key ID */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Key ID
          </label>
          <input
            type="text"
            value={config.keyId}
            onChange={(e) => setConfig({ ...config, keyId: e.target.value })}
            placeholder="ondc.example.com-1234567890"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
            }}
          />
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            Unique identifier for this key (auto-generated when using Generate Key Pair)
          </p>
        </div>
      </div>

      {/* Location Settings */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.2em', marginBottom: '20px' }}>Location Settings</h2>

        {/* Domain */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Domain
          </label>
          <input
            type="text"
            value={config.domain}
            onChange={(e) => setConfig({ ...config, domain: e.target.value })}
            placeholder="nic2004:52110"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
            }}
          />
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            ONDC domain code (default: nic2004:52110 for Retail)
          </p>
        </div>

        {/* City */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            City
          </label>
          <input
            type="text"
            value={config.city}
            onChange={(e) => setConfig({ ...config, city: e.target.value })}
            placeholder="std:080"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
            }}
          />
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            City code (e.g., std:080 for Bangalore)
          </p>
        </div>

        {/* Country */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '600',
              fontSize: '0.9em',
              color: '#374151',
            }}
          >
            Country
          </label>
          <input
            type="text"
            value={config.country}
            onChange={(e) => setConfig({ ...config, country: e.target.value })}
            placeholder="IND"
            maxLength={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.95em',
            }}
          />
          <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '0.85em' }}>
            ISO 3166-1 alpha-2 country code (default: IND for India)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '12px 24px',
            border: '1px solid #16a34a',
            borderRadius: '6px',
            backgroundColor: '#16a34a',
            color: 'white',
            fontSize: '1em',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Saving...' : 'Save Configuration'}
        </button>

        <button
          onClick={handleTestConnection}
          disabled={testing}
          style={{
            padding: '12px 24px',
            border: '1px solid #2563eb',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: 'white',
            fontSize: '1em',
            fontWeight: '600',
            cursor: testing ? 'not-allowed' : 'pointer',
            opacity: testing ? 0.6 : 1,
          }}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        {testResult && (
          <button
            onClick={() => {
              setTestResult(null);
              setErrors([]);
            }}
            style={{
              padding: '12px 24px',
              border: '1px solid #6b7280',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '1em',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Clear Messages
          </button>
        )}
      </div>

      {/* Info Section */}
      <div
        style={{
          marginTop: '24px',
          padding: '16px',
          borderRadius: '6px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1e40af' }}>
          Configuration Help
        </p>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e3a8a', fontSize: '0.9em' }}>
          <li>
            <strong>Generate New Key Pair:</strong> Creates a new Ed25519 key pair for signing
            ONDC requests
          </li>
          <li>
            <strong>Save Configuration:</strong> Stores your configuration securely on the server
          </li>
          <li>
            <strong>Test Connection:</strong> Verifies your credentials and tests connectivity to
            the ONDC gateway
          </li>
        </ul>
      </div>
    </div>
  );
}
