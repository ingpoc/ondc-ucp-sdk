import { type CSSProperties } from 'react';

export interface DramsToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

// Reference: /Users/gurusharan/Documents/remote-claude/Research/drams-design/rolling-search.html
// Lines 732-772: Toggle Switch pattern

const CONTAINER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

const LABEL_STYLE: CSSProperties = {
  fontSize: '15px',
  color: '#333',
};

const SWITCH_STYLE: CSSProperties = {
  width: '56px',
  height: '32px',
  background: 'rgb(238, 238, 238)',
  borderRadius: '48px',
  position: 'relative',
  cursor: 'pointer',
  transition: 'background 0.3s ease',
};

const SWITCH_ACTIVE: CSSProperties = {
  background: 'rgb(255, 97, 26)',
};

const BALL_STYLE: CSSProperties = {
  position: 'absolute',
  width: '26px',
  height: '26px',
  background: 'white',
  borderRadius: '50%',
  top: '3px',
  left: '3px',
  transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
};

const BALL_ACTIVE: CSSProperties = {
  left: '27px',
};

const DISABLED_STYLE: CSSProperties = {
  opacity: 0.5,
  pointerEvents: 'none',
};

export function DramsToggle({
  checked = false,
  onChange,
  disabled = false,
  label,
  className,
  style,
  id,
}: DramsToggleProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const switchStyle: CSSProperties = {
    ...SWITCH_STYLE,
    ...(checked ? SWITCH_ACTIVE : {}),
    ...(disabled ? DISABLED_STYLE : {}),
  };

  const ballStyle: CSSProperties = {
    ...BALL_STYLE,
    ...(checked ? BALL_ACTIVE : {}),
  };

  return (
    <div style={{ ...CONTAINER_STYLE, ...(style || {}) }} className={className}>
      {label && <label style={LABEL_STYLE}>{label}</label>}
      <div
        id={id}
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        style={switchStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div style={ballStyle} />
      </div>
    </div>
  );
}
