import { useState, useRef, useEffect, type CSSProperties } from 'react';

export interface DramsDropdownOption {
  value: string;
  label: string;
}

export interface DramsDropdownProps {
  options: ReadonlyArray<DramsDropdownOption>;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

// Reference: /Users/gurusharan/Documents/remote-claude/Research/drams-design/rolling-search.html
// Lines 267-362: Dropdown pattern

const DROPDOWN_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
};

const DROPDOWN_TRACK_STYLE: CSSProperties = {
  height: '48px',
  background: 'rgb(238, 238, 238)',
  borderRadius: '48px',
  padding: '0 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

const DROPDOWN_TRACK_HOVER: CSSProperties = {
  background: 'rgb(232, 232, 232)',
};

const LABEL_STYLE: CSSProperties = {
  fontSize: '15px',
  color: '#333',
};

const PLACEHOLDER_STYLE: CSSProperties = {
  color: '#999',
};

const BALL_STYLE: CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'radial-gradient(50% 50% at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)',
  boxShadow:
    'rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, rgba(0, 0, 0, 0.2) -2px -1px 3px 0px inset',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.3s ease',
};

const MENU_STYLE: CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: '0',
  right: '0',
  background: 'white',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  opacity: '0',
  visibility: 'hidden',
  transform: 'translateY(-10px)',
  transition: 'all 0.3s ease',
  zIndex: 10,
};

const MENU_OPEN_STYLE: CSSProperties = {
  opacity: '1',
  visibility: 'visible',
  transform: 'translateY(0)',
};

const ITEM_STYLE: CSSProperties = {
  padding: '14px 20px',
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  fontSize: '15px',
  color: '#333',
};

const ITEM_HOVER_STYLE: CSSProperties = {
  background: 'rgb(238, 238, 238)',
};

const ITEM_SELECTED_STYLE: CSSProperties = {
  color: 'rgb(255, 97, 26)',
};

const ARROW_SVG = (
  <svg
    width="14"
    height="14"
    viewBox="0 0 256 256"
    style={{ fill: 'rgb(252, 252, 250)' }}
  >
    <path d="M128,168l-72-72a12,12,0,0,1,17-17l55,55,55-55a12,12,0,0,1,17,17Z" />
  </svg>
);

export function DramsDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  className,
  style,
}: DramsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;
  const isPlaceholder = !selectedOption;

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(null);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setHighlightedIndex(null);
    }
  };

  const handleSelect = (option: DramsDropdownOption) => {
    onChange?.(option.value);
    setIsOpen(false);
    setHighlightedIndex(null);
  };

  const handleMouseEnter = (index: number) => {
    setHighlightedIndex(index);
  };

  const trackStyle: CSSProperties = {
    ...DROPDOWN_TRACK_STYLE,
    ...(isOpen || highlightedIndex !== null ? DROPDOWN_TRACK_HOVER : {}),
    ...(disabled ? { opacity: 0.5, pointerEvents: 'none' as const } : {}),
  };

  const ballStyle: CSSProperties = {
    ...BALL_STYLE,
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
  };

  const labelStyle: CSSProperties = {
    ...LABEL_STYLE,
    ...(isPlaceholder ? PLACEHOLDER_STYLE : {}),
  };

  return (
    <div ref={containerRef} style={{ ...DROPDOWN_STYLE, ...(style || {}) }} className={className}>
      <div style={trackStyle} onClick={handleToggle} onMouseDown={(e) => e.preventDefault()}>
        <span style={labelStyle}>{displayLabel}</span>
        <div style={ballStyle}>{ARROW_SVG}</div>
      </div>

      <div
        style={{
          ...MENU_STYLE,
          ...(isOpen ? MENU_OPEN_STYLE : {}),
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isHighlighted = highlightedIndex === index;

          return (
            <div
              key={option.value}
              style={{
                ...ITEM_STYLE,
                ...(isHighlighted ? ITEM_HOVER_STYLE : {}),
                ...(isSelected ? ITEM_SELECTED_STYLE : {}),
              }}
              onMouseEnter={() => handleMouseEnter(index)}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
