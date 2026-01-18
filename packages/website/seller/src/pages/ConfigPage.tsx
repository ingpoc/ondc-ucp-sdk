import { useState, useEffect } from 'react';
import { CARD, COLORS, SPACING, TYPOGRAPHY, TEXT_BOX, BUTTON, PILL_BUTTON, BADGE, DRAMS } from '@ondc-agent/shared/design-system';

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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: SPACING.xl }}>
        <h1>Seller Configuration</h1>
        <p>Loading configuration...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: SPACING.xl, backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ ...TYPOGRAPHY.h1, color: DRAMS.textDark, margin: `0 0 ${SPACING.md} 0` }}>Seller Configuration</h1>
      <p style={{ ...TYPOGRAPHY.body, color: DRAMS.textLight, marginBottom: SPACING.xl }}>
        Configure your ONDC seller credentials and connection settings
      </p>

      {/* Result Message */}
      {testResult && (
        <div
          style={{
            ...BADGE.base,
            ...(testResult.success ? BADGE.success : BADGE.error),
            marginBottom: SPACING.xl,
          }}
        >
          {testResult.message}
        </div>
      )}

      {/* Configuration Form */}
      <div
        style={{
          ...CARD.base,
          marginBottom: SPACING.xl,
        }}
      >
        <h2 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark, marginBottom: SPACING.xl }}>ONDC Credentials</h2>

        {/* Gateway URL */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
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
              ...TEXT_BOX.track,
              ...(getFieldError('baseUrl') ? TEXT_BOX.error : {}),
            }}
          />
          {getFieldError('baseUrl') && (
            <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.error, ...TYPOGRAPHY.bodySmall }}>
              {getFieldError('baseUrl')}
            </p>
          )}
        </div>

        {/* Subscriber ID */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
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
              ...TEXT_BOX.track,
              ...(getFieldError('subscriberId') ? TEXT_BOX.error : {}),
            }}
          />
          {getFieldError('subscriberId') && (
            <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.error, ...TYPOGRAPHY.bodySmall }}>
              {getFieldError('subscriberId')}
            </p>
          )}
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            Your unique ONDC subscriber identifier (e.g., ondc.example.com)
          </p>
        </div>

        {/* Private Key */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
            }}
          >
            Private Key *
          </label>
          <div style={{ display: 'flex', gap: SPACING.sm }}>
            <input
              type={showPrivateKey ? 'text' : 'password'}
              value={config.privateKey}
              onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
              placeholder="Base64 encoded Ed25519 private key"
              style={{
                flex: 1,
                ...TEXT_BOX.track,
                fontFamily: 'monospace',
                ...(getFieldError('privateKey') ? TEXT_BOX.error : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPrivateKey(!showPrivateKey)}
              style={{
                ...BUTTON.secondary,
                fontSize: TYPOGRAPHY.body.fontSize,
              }}
            >
              {showPrivateKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {getFieldError('privateKey') && (
            <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.error, ...TYPOGRAPHY.bodySmall }}>
              {getFieldError('privateKey')}
            </p>
          )}
          <div style={{ marginTop: SPACING.sm, display: 'flex', gap: SPACING.sm }}>
            <button
              type="button"
              onClick={handleGenerateKeyPair}
              style={{
                ...BUTTON.primary,
                fontSize: TYPOGRAPHY.body.fontSize,
              }}
            >
              Generate New Key Pair
            </button>
          </div>
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            Ed25519 private key for signing ONDC requests
          </p>
        </div>

        {/* Key ID */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
            }}
          >
            Key ID
          </label>
          <input
            type="text"
            value={config.keyId}
            onChange={(e) => setConfig({ ...config, keyId: e.target.value })}
            placeholder="ondc.example.com-1234567890"
            style={{ ...TEXT_BOX.track }}
          />
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            Unique identifier for this key (auto-generated when using Generate Key Pair)
          </p>
        </div>
      </div>

      {/* Location Settings */}
      <div
        style={{
          ...CARD.base,
          marginBottom: SPACING.xl,
        }}
      >
        <h2 style={{ ...TYPOGRAPHY.h3, color: DRAMS.textDark, marginBottom: SPACING.xl }}>Location Settings</h2>

        {/* Domain */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
            }}
          >
            Domain
          </label>
          <input
            type="text"
            value={config.domain}
            onChange={(e) => setConfig({ ...config, domain: e.target.value })}
            placeholder="nic2004:52110"
            style={{ ...TEXT_BOX.track }}
          />
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            ONDC domain code (default: nic2004:52110 for Retail)
          </p>
        </div>

        {/* City */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
            }}
          >
            City
          </label>
          <input
            type="text"
            value={config.city}
            onChange={(e) => setConfig({ ...config, city: e.target.value })}
            placeholder="std:080"
            style={{ ...TEXT_BOX.track }}
          />
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            City code (e.g., std:080 for Bangalore)
          </p>
        </div>

        {/* Country */}
        <div style={{ marginBottom: SPACING.xl }}>
          <label
            style={{
              display: 'block',
              marginBottom: SPACING.sm,
              ...TYPOGRAPHY.label,
              color: COLORS.textPrimary,
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
            style={{ ...TEXT_BOX.track }}
          />
          <p style={{ margin: `${SPACING.xs} 0 0 0`, color: COLORS.textSecondary, ...TYPOGRAPHY.bodySmall }}>
            ISO 3166-1 alpha-2 country code (default: IND for India)
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            ...BUTTON.primary,
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
            ...PILL_BUTTON.gray,
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
              ...BUTTON.secondary,
            }}
          >
            Clear Messages
          </button>
        )}
      </div>

      {/* Info Section */}
      <div
        style={{
          marginTop: SPACING.xl,
          ...BADGE.info,
        }}
      >
        <p style={{ margin: `0 0 ${SPACING.sm} 0`, ...TYPOGRAPHY.label, color: COLORS.info }}>
          Configuration Help
        </p>
        <ul style={{ margin: 0, paddingLeft: SPACING.xl, ...TYPOGRAPHY.body }}>
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
