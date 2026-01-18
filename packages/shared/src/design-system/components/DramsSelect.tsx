import { forwardRef, useState } from 'react';
import { SELECT_BOX } from '../components';
import { DRAMS } from '../tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

export interface DramsSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'data-focused' | 'data-error'> {
  /** Options for the select */
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
}

const SELECT_UNIQUE_ID = 'drams-select-';

export const DramsSelect = forwardRef<HTMLSelectElement, DramsSelectProps>(
  ({ id, error = false, disabled = false, fullWidth = false, options, className, style, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const uniqueId = id || `${SELECT_UNIQUE_ID}${Math.random().toString(36).slice(2, 9)}`;

    const baseStyle: React.CSSProperties = {
      ...SELECT_BOX.base,
      ...(fullWidth ? { width: '100%' } : {}),
      ...(style || {}),
    };

    return (
      <>
        <select
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
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <style>{`
          select[data-focused="true"]#${uniqueId} {
            background: ${DRAMS.grayHover} !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            outline: none;
          }
        `}</style>
      </>
    );
  }
);

DramsSelect.displayName = 'DramsSelect';
