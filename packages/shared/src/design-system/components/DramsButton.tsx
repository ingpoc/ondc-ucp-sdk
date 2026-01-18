import { forwardRef, useState } from 'react';
import { PILL_BUTTON } from '../components';
import { DRAMS, COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../tokens';
import { disabled as disabledStyle } from '../tactile';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

export type DramsButtonVariant = 'primary' | 'secondary' | 'danger' | 'gray';

export interface DramsButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Button variant */
  variant?: DramsButtonVariant;
  /** Full width */
  fullWidth?: boolean;
  /** Loading state */
  loading?: boolean;
}

const BUTTON_UNIQUE_ID = 'drams-button-';

const BUTTON_STYLES = {
  primary: PILL_BUTTON.orange,
  secondary: PILL_BUTTON.gray,
  danger: {
    background: COLORS.error,
    color: 'white',
    border: 'none',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
  },
  gray: PILL_BUTTON.gray,
} as const;

export const DramsButton = forwardRef<HTMLButtonElement, DramsButtonProps>(
  ({
    id,
    variant = 'primary',
    disabled = false,
    fullWidth = false,
    loading = false,
    className,
    children,
    ...rest
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const uniqueId = id || `${BUTTON_UNIQUE_ID}${Math.random().toString(36).slice(2, 9)}`;

    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      ...BUTTON_STYLES[variant],
      ...(fullWidth ? { width: '100%' } : {}),
      ...(isDisabled ? (disabledStyle as React.CSSProperties) : {}),
      ...(isPressed && !isDisabled ? { transform: 'translateY(1px)' } : {}),
    };

    return (
      <>
        <button
          ref={ref}
          id={uniqueId}
          disabled={isDisabled}
          className={className}
          data-hovered={isHovered}
          data-variant={variant}
          style={baseStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          {...rest}
        >
          {loading ? '...' : children}
        </button>
        {(variant === 'secondary' || variant === 'gray') && (
          <style>{`
            button[data-hovered="true"]#${uniqueId} {
              background: ${DRAMS.grayHover} !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
            }
          `}</style>
        )}
      </>
    );
  }
);

DramsButton.displayName = 'DramsButton';
