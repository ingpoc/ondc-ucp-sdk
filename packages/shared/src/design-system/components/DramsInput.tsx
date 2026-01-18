import { forwardRef, useRef, useEffect, useState, type CSSProperties } from 'react';

export interface DramsInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'data-focused'> {
  /** Error state */
  error?: boolean;
}

// Reference: /Users/gurusharan/Documents/remote-claude/Research/drams-design/rolling-search.html
// Lines 219-265: Text Box pattern

const TEXT_BOX_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
};

const TEXT_BOX_TRACK_STYLE: CSSProperties = {
  height: '48px',
  background: 'rgb(238, 238, 238)',
  borderRadius: '48px',
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  transition: 'all 0.3s ease',
};

const TEXT_BOX_TRACK_FOCUSED: CSSProperties = {
  background: 'rgb(230, 230, 230)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const INPUT_BASE_STYLE: CSSProperties = {
  flex: 1,
  border: 'none',
  background: 'transparent',
  fontSize: '15px',
  color: '#333',
  outline: 'none',
  caretColor: 'rgb(255, 97, 26)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const INDICATOR_STYLE: CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: 'rgb(255, 97, 26)',
  opacity: '0',
  transition: 'opacity 0.3s ease',
};

const ERROR_STYLE: CSSProperties = {
  background: '#fef2f2',
  boxShadow: 'none',
};

const ERROR_BORDER_STYLE: CSSProperties = {
  boxShadow: 'inset 0 0 0 1px #fecaca',
};

export const DramsInput = forwardRef<HTMLInputElement, DramsInputProps>(
  ({ id, error = false, disabled = false, className, style, placeholder, ...rest }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Handle ref forwarding
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    const trackStyle: CSSProperties = {
      ...TEXT_BOX_TRACK_STYLE,
      ...(isFocused ? TEXT_BOX_TRACK_FOCUSED : {}),
      ...(error ? ERROR_STYLE : {}),
      ...(error && isFocused ? ERROR_BORDER_STYLE : {}),
      ...(disabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {}),
      ...(style || {}),
    };

    return (
      <div style={TEXT_BOX_STYLE} className={className}>
        <div style={trackStyle}>
          <input
            ref={inputRef}
            id={id}
            disabled={disabled}
            placeholder={placeholder}
            style={INPUT_BASE_STYLE}
            onFocus={(e) => {
              setIsFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              rest.onBlur?.(e);
            }}
            {...rest}
          />
          <div style={{ ...INDICATOR_STYLE, opacity: isFocused ? 1 : 0 }} />
        </div>
      </div>
    );
  }
);

DramsInput.displayName = 'DramsInput';
