import { useState } from 'react';
import { SPACING, TYPOGRAPHY, RADIUS, DRAMS } from '../tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

/**
 * DRAMS Add Button
 * "Less, but better" — Signature orange gradient pill button
 *
 * Purpose: Primary action button with distinctive DRAMS styling
 * States: default, hover, active, disabled, loading
 */

export interface DramsAddButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const SIZE_STYLES = {
  sm: { padding: '8px 16px', fontSize: TYPOGRAPHY.bodySmall.fontSize },
  md: { padding: '12px 20px', fontSize: TYPOGRAPHY.label.fontSize },
  lg: { padding: '16px 24px', fontSize: TYPOGRAPHY.body.fontSize },
};

const BASE_STYLE = {
  border: 'none',
  borderRadius: RADIUS.pill,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: SPACING.sm,
  transition: 'all 0.2s ease',
  fontFamily: DRAMS.fontFamily,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  textDecoration: 'none',
};

const PRIMARY_STYLE = {
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  color: 'white',
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px ${DRAMS.orange}4d`,
};

const SECONDARY_STYLE = {
  background: DRAMS.grayTrack,
  color: DRAMS.textDark,
};

const DANGER_STYLE = {
  background: '#ef4444',
  color: 'white',
};

const HOVER_SCALE = 1.05;
const ACTIVE_SCALE = 0.95;

export function DramsAddButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
}: DramsAddButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const variantStyle = variant === 'primary' ? PRIMARY_STYLE : variant === 'danger' ? DANGER_STYLE : SECONDARY_STYLE;
  const sizeStyle = SIZE_STYLES[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      style={{
        ...BASE_STYLE,
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: (isHovered && !disabled) ? `scale(${HOVER_SCALE})` : (isActive ? `scale(${ACTIVE_SCALE})` : 'none'),
        pointerEvents: disabled || loading ? 'none' : 'auto',
      }}
    >
      {loading ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4m-2.83 6.17l-2.83 2.83m8.48-8.48l-2.83-2.83"
            style={{ stroke: 'currentColor' }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          </svg>
        </>
      ) : (
        children
      )}
    </button>
  );
}
