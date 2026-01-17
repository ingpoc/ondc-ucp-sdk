/**
 * DRAMS Tactile Patterns
 * 3D depth effects, shadows, and tactile sensations
 * Following Dieter Rams' principles: Innovative, Aesthetic, Thorough
 */

import { DRAMS } from './tokens';

// Orange Gradient Ball - Signature DRAMS element
export const orangeBall = {
  background: 'radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)',
  boxShadow: 'rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)',
};

// Gray Track - Soft pill background
export const grayTrack = {
  background: DRAMS.grayTrack,
  borderRadius: '48px',
};

// Card Lift - Subtle elevation on hover
export const cardLift = {
  transition: 'transform 0.2s, box-shadow 0.2s',
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
};

// Concave Surface - Pressed-in appearance (like button wells)
export const concave = {
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)',
};

// Convex Surface - Raised appearance (like physical controls)
export const convex = {
  boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 -1px 2px rgba(0,0,0,0.04)',
};

// Inner Glow - LED indicator effect
export const innerGlow = {
  boxShadow: `inset 0 0 8px ${DRAMS.orange}40, 0 0 12px ${DRAMS.orange}30`,
};

// Soft Shadow - Subtle depth (Unobtrusive)
export const softShadow = {
  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
};

// Medium Shadow - Clear elevation
export const mediumShadow = {
  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
};

// Focus Ring - Accessible, visible focus state (Thorough, Understandable)
export const focusRing = {
  outline: 'none',
  boxShadow: `0 0 0 3px ${DRAMS.orange}30`,
};

// Pressed State - Button click feedback
export const pressed = {
  transform: 'translateY(1px)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
};

// Disabled State - Clearly inactive (Honest, Understandable)
export const disabled = {
  opacity: 0.5,
  cursor: 'not-allowed',
  filter: 'grayscale(0.3)',
};

// Loading Shimmer - Subtle activity indicator
export const shimmer = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
};

// Keyframe animations
export const animations = {
  shimmer: `
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
};

// Hover States - Consistent interactive feedback
export const hover = {
  lift: 'translateY(-2px)',
  brighten: 'brightness(1.05)',
};

// Active States - Click feedback
export const active = {
  scale: 'scale(0.98)',
  press: 'translateY(1px)',
};
