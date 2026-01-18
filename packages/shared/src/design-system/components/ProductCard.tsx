import { useState } from 'react';
import { DRAMS, SPACING, TYPOGRAPHY, RADIUS } from '../tokens';

/**
 * DRAMS Product Card
 * "Less, but better" — Minimal product display with signature orange add button
 *
 * Purpose: Display product with image, details, and add to cart action
 * States: default, hover, adding
 */

export interface DramsProductCardProps {
  name: string;
  category?: string;
  price: string;
  image?: string;
  badge?: string;
  rating?: number;
  onAdd?: () => void;
  onClick?: () => void;
  isAdding?: boolean;
}

const CARD_STYLE = {
  background: 'white',
  borderRadius: RADIUS.card,
  overflow: 'hidden' as const,
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
};

const CARD_HOVER_STYLE = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
};

const IMAGE_STYLE = {
  width: '100%',
  height: '180px',
  background: 'linear-gradient(135deg, #f5f5f5 0%, #ebebeb 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative' as const,
};

const BADGE_STYLE = {
  position: 'absolute' as const,
  top: '12px',
  left: '12px',
  padding: '6px 12px',
  background: DRAMS.orange,
  color: 'white',
  fontSize: TYPOGRAPHY.bodySmall.fontSize,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  borderRadius: '20px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const PLACEHOLDER_STYLE = {
  width: '80px',
  height: '80px',
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  borderRadius: RADIUS.circle,
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 4px 12px ${DRAMS.orange}33`,
};

const DETAILS_STYLE = {
  padding: SPACING.xl,
};

const NAME_STYLE = {
  ...TYPOGRAPHY.h4,
  color: DRAMS.textDark,
  marginBottom: SPACING.sm,
};

const CATEGORY_STYLE = {
  ...TYPOGRAPHY.bodySmall,
  color: DRAMS.textLight,
  marginBottom: SPACING.lg,
};

const FOOTER_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const PRICE_STYLE = {
  ...TYPOGRAPHY.h3,
  color: DRAMS.textDark,
};

const ADD_BUTTON_STYLE = {
  width: '44px',
  height: '44px',
  borderRadius: RADIUS.circle,
  border: 'none',
  background: `radial-gradient(
    50% 50% at 30% 30%,
    ${DRAMS.orangeHighlight} 0%,
    ${DRAMS.orange} 100%
  )`,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
  boxShadow: `rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px ${DRAMS.orange}4d`,
};

const ADD_BUTTON_HOVER_STYLE = {
  transform: 'scale(1.05)',
};

const ADD_BUTTON_ACTIVE_STYLE = {
  transform: 'scale(0.95)',
};

const ADD_BUTTON_DISABLED_STYLE = {
  opacity: 0.5,
  cursor: 'not-allowed',
};

export function DramsProductCard({
  name,
  category,
  price,
  image,
  badge,
  rating: _rating,
  onAdd,
  onClick,
  isAdding = false,
}: DramsProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);

  const handleCardClick = () => {
    if (!isAdding) onClick?.();
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdding) onAdd?.();
  };

  return (
    <div
      style={{
        ...CARD_STYLE,
        ...(isHovered ? CARD_HOVER_STYLE : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div style={IMAGE_STYLE}>
        {badge && <span style={BADGE_STYLE}>{badge}</span>}
        {image ? (
          <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={PLACEHOLDER_STYLE} />
        )}
      </div>

      <div style={DETAILS_STYLE}>
        <h3 style={NAME_STYLE}>{name}</h3>
        {category && <div style={CATEGORY_STYLE}>{category}</div>}

        <div style={FOOTER_STYLE}>
          <span style={PRICE_STYLE}>{price}</span>
          {onAdd && (
            <button
              onClick={handleAdd}
              disabled={isAdding}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              onMouseDown={() => setIsButtonActive(true)}
              onMouseUp={() => setIsButtonActive(false)}
              style={{
                ...ADD_BUTTON_STYLE,
                ...(isButtonHovered ? ADD_BUTTON_HOVER_STYLE : {}),
                ...(isButtonActive ? ADD_BUTTON_ACTIVE_STYLE : {}),
                ...(isAdding ? ADD_BUTTON_DISABLED_STYLE : {}),
              }}
              aria-label="Add to cart"
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="white" style={{ pointerEvents: 'none' }}>
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
