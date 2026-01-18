import { forwardRef, useState } from 'react';
import { TEXT_BOX } from '../components';
import { DRAMS } from '../tokens';
import { disabled as disabledStyle } from '../tactile';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

export interface DramsInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'data-focused' | 'data-error'> {
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

const INPUT_UNIQUE_ID = 'drams-input-';

export const DramsInput = forwardRef<HTMLInputElement, DramsInputProps>(
  ({ id, error = false, disabled = false, fullWidth = false, className, style, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const uniqueId = id || `${INPUT_UNIQUE_ID}${Math.random().toString(36).slice(2, 9)}`;

    const baseStyle: React.CSSProperties = {
      ...TEXT_BOX.track,
      ...(fullWidth ? { width: '100%' } : {}),
      ...(disabled ? (disabledStyle as React.CSSProperties) : {}),
      ...(error ? TEXT_BOX.error : {}),
      ...(style || {}),
    };

    return (
      <>
        <input
          ref={ref}
          id={uniqueId}
          disabled={disabled}
          className={className}
          {...rest}
          data-focused={isFocused}
          data-error={error}
          style={baseStyle}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
        />
        <style>{`
          input[data-focused="true"]#${uniqueId} {
            background: ${DRAMS.grayHover} !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            outline: none;
          }
        `}</style>
      </>
    );
  }
);

DramsInput.displayName = 'DramsInput';
