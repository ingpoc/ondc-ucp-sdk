import { useState, useRef, useEffect } from 'react';
import { DRAMS } from '../tokens';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';

export interface RollingSearchProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

// Container: 234px width, 44px height
// Gray track starts at 42px wide, centered (left: 96px)
// Orange ball: 42px, starts centered (left: 96px)
const CONTAINER_STYLE = {
  position: 'relative' as const,
  width: '234px',
  height: '44px',
};

const GRAY_TRACK_STYLE = {
  position: 'absolute' as const,
  width: '42px',
  height: '42px',
  top: '1px',
  left: '96px',
  borderRadius: '48px',
  background: DRAMS.grayTrack,
  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
};

const GRAY_TRACK_EXPANDED = {
  width: '234px',
  height: '44px',
  top: '0',
  left: '0',
};

const INPUT_STYLE = {
  position: 'absolute' as const,
  left: '52px',
  top: '50%',
  transform: 'translateY(-50%)',
  width: 'calc(100% - 100px)',
  border: 'none',
  background: 'transparent',
  fontSize: '15px',
  color: DRAMS.textDark,
  outline: 'none',
  opacity: 0,
  pointerEvents: 'none' as const,
  transition: 'opacity 0.3s ease',
  caretColor: DRAMS.orange,
  fontFamily: DRAMS.fontFamily,
};

const INPUT_VISIBLE = {
  opacity: 1,
  pointerEvents: 'auto' as const,
};

const SHADOW_LAYER_1 = {
  position: 'absolute' as const,
  width: '32px',
  height: '32px',
  borderRadius: '56px',
  top: '6px',
  left: '102px',
  pointerEvents: 'none' as const,
  transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow:
    'rgba(0, 0, 0, 0.247) 0.84px 0.84px 1.19px -0.625px, '
    + 'rgba(0, 0, 0, 0.24) 1.99px 1.99px 2.81px -1.25px, '
    + 'rgba(0, 0, 0, 0.23) 3.63px 3.63px 5.13px -1.875px, '
    + 'rgba(0, 0, 0, 0.22) 6.04px 6.04px 8.54px -2.5px, '
    + 'rgba(0, 0, 0, 0.2) 9.75px 9.75px 13.79px -3.125px, '
    + 'rgba(0, 0, 0, 0.17) 15.96px 15.96px 22.57px -3.75px, '
    + 'rgba(0, 0, 0, 0.114) 27.48px 27.48px 38.86px -4.375px, '
    + 'rgba(0, 0, 0, 0) 50px 50px 70.71px -5px',
};

const SHADOW_LAYER_1_EXPANDED = {
  left: '198px',
};

const SHADOW_LAYER_2 = {
  position: 'absolute' as const,
  width: '20px',
  height: '19px',
  borderRadius: '56px',
  top: '13px',
  left: '103px',
  pointerEvents: 'none' as const,
  transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow:
    'rgba(0, 0, 0, 0.208) 1.51px 0.2px 0.61px -0.53px, '
    + 'rgba(0, 0, 0, 0.204) 3.58px 0.48px 1.45px -1.06px, '
    + 'rgba(0, 0, 0, 0.2) 6.54px 0.87px 2.64px -1.59px, '
    + 'rgba(0, 0, 0, 0.192) 10.87px 1.45px 4.38px -2.125px, '
    + 'rgba(0, 0, 0, 0.176) 17.55px 2.34px 7.08px -2.66px, '
    + 'rgba(0, 0, 0, 0.157) 28.72px 3.83px 11.59px -3.19px, '
    + 'rgba(0, 0, 0, 0.118) 49.46px 6.59px 19.96px -3.72px, '
    + 'rgba(0, 0, 0, 0.04) 90px 12px 36.32px -4.25px, '
    + 'rgba(0, 0, 0, 0.25) 10px 10px 24px 0px',
};

const SHADOW_LAYER_2_EXPANDED = {
  left: '199px',
};

const ORANGE_BALL = {
  position: 'absolute' as const,
  width: '42px',
  height: '42px',
  top: '0',
  left: '96px',
  borderRadius: '50%',
  overflow: 'hidden' as const,
  cursor: 'pointer',
  transition: 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  background: `radial-gradient(50% 50% at 29.1% 29.7%, ${DRAMS.orangeHighlight} 0%, ${DRAMS.orange} 100%)`,
  boxShadow:
    'rgba(232, 61, 23, 0.35) 0px 0px 0px -0.75px inset, '
    + 'rgba(232, 61, 23, 0.7) 0px 0px 0px -1.5px inset, '
    + 'rgba(0, 0, 0, 0.25) -2px -1px 4px 0px inset, '
    + 'rgba(204, 44, 16, 0.455) -0.66px -0.06px 0.53px -0.75px inset, '
    + 'rgba(204, 44, 16, 0.475) -2.52px -0.23px 2.02px -1.5px inset, '
    + 'rgba(204, 44, 16, 0.55) -11px -1px 8.84px -2.25px inset',
};

const ORANGE_BALL_EXPANDED = {
  left: '192px',
};

const ICON_STYLE = {
  width: '20px',
  height: '20px',
  fill: 'rgb(252, 252, 250)',
  transition: 'opacity 0.2s ease',
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  pointerEvents: 'none' as const,
};

export function RollingSearch({ onSearch, placeholder = 'Search products...' }: RollingSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleToggle = () => {
    if (isExpanded && query.trim()) {
      onSearch?.(query.trim());
      setQuery('');
      setIsExpanded(false);
    } else if (isExpanded) {
      setQuery('');
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (!query.trim()) {
        setIsExpanded(false);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsExpanded(false);
    } else if (e.key === 'Enter' && query.trim()) {
      onSearch?.(query.trim());
      setQuery('');
      setIsExpanded(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery((e.currentTarget as HTMLInputElement).value);
  };

  return (
    <div style={{ ...CONTAINER_STYLE } as React.CSSProperties}>
      <div
        style={{
          ...GRAY_TRACK_STYLE,
          ...(isExpanded ? GRAY_TRACK_EXPANDED : {}),
        } as React.CSSProperties}
      />

      <div
        style={{
          ...SHADOW_LAYER_1,
          ...(isExpanded ? SHADOW_LAYER_1_EXPANDED : {}),
        } as React.CSSProperties}
      />

      <div
        style={{
          ...SHADOW_LAYER_2,
          ...(isExpanded ? SHADOW_LAYER_2_EXPANDED : {}),
        } as React.CSSProperties}
      />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          ...INPUT_STYLE,
          ...(isExpanded ? INPUT_VISIBLE : {}),
        } as React.CSSProperties}
      />

      <div
        onClick={handleToggle}
        style={{
          ...ORANGE_BALL,
          ...(isExpanded ? ORANGE_BALL_EXPANDED : {}),
          zIndex: 1,
        } as React.CSSProperties}
      >
        {/* Search Icon */}
        <svg
          style={{ ...ICON_STYLE, opacity: isExpanded ? 0 : 1 } as React.CSSProperties}
          viewBox="0 0 256 256"
        >
          <path d="M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z" />
        </svg>

        {/* Arrow Icon (shown when expanded) */}
        <svg
          style={{ ...ICON_STYLE, opacity: isExpanded ? 1 : 0 } as React.CSSProperties}
          viewBox="0 0 256 256"
        >
          <path d="M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z" />
        </svg>
      </div>
    </div>
  );
}
