/**
 * DRAMS Component Patterns
 * Pre-built component styles following Dieter Rams' principles
 * "Less but better" - tactile, pill-shaped, 3D depth
 */

import { DRAMS, RADIUS, SPACING, TYPOGRAPHY, TRANSITIONS } from './tokens';

// Pill Button - Orange gradient ball (Innovative, Useful, Aesthetic)
export const PILL_BUTTON = {
  orange: {
    background: 'radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    transition: TRANSITIONS.standard,
    boxShadow: 'rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)',
  },
  gray: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    color: DRAMS.textDark,
    border: 'none',
    cursor: 'pointer',
    transition: TRANSITIONS.hover,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
} as const;

// Text Box - Pill-shaped input (Understandable, Unobtrusive)
export const TEXT_BOX = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.lg}`,
    transition: TRANSITIONS.standard,
    border: 'none',
    fontSize: TYPOGRAPHY.body.fontSize,
    color: DRAMS.textDark,
  },
  focus: {
    background: DRAMS.grayHover,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    outline: 'none',
  },
  error: {
    background: '#fef2f2',
  },
} as const;

// Card - Soft lift on hover (Aesthetic, Unobtrusive)
export const DRAMS_CARD = {
  base: {
    background: 'white',
    borderRadius: RADIUS.card,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
  },
} as const;

// Toggle Switch - Pill with LED indicator (Innovative, Useful)
export const TOGGLE_SWITCH = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    width: '48px',
    height: '28px',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: TRANSITIONS.standard,
  },
  trackActive: {
    background: DRAMS.orange,
  },
  thumb: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '24px',
    height: '24px',
    borderRadius: RADIUS.circle,
    background: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: TRANSITIONS.standard,
  },
  thumbActive: {
    transform: 'translateX(20px)',
  },
  ledIndicator: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: DRAMS.orange,
    boxShadow: '0 0 6px rgba(255, 97, 26, 0.6)',
  },
} as const;

// Slider - Rolling dot (Innovative, Understandable)
export const SLIDER = {
  track: {
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    height: '8px',
    position: 'relative' as const,
  },
  fill: {
    background: DRAMS.orange,
    height: '100%',
    borderRadius: RADIUS.pill,
  },
  thumb: {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '24px',
    height: '24px',
    borderRadius: RADIUS.circle,
    background: 'radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)',
    boxShadow: '0 2px 8px rgba(255, 97, 26, 0.4)',
    cursor: 'grab',
    transition: TRANSITIONS.hover,
  },
  thumbHover: {
    transform: 'translate(-50%, -50%) scale(1.1)',
    boxShadow: '0 4px 12px rgba(255, 97, 26, 0.5)',
  },
} as const;

// Select Box - Pill selector (Useful, Understandable)
export const SELECT_BOX = {
  base: {
    ...TEXT_BOX.track,
    appearance: 'none',
    paddingRight: SPACING.xl,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `right ${SPACING.md} center`,
    cursor: 'pointer',
  },
  focus: TEXT_BOX.focus,
} as const;

// Quantity Control - Plus/minus in pill (Useful, Honest)
export const QUANTITY_CONTROL = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    background: DRAMS.grayTrack,
    borderRadius: RADIUS.pill,
    padding: `${SPACING.xs} ${SPACING.md}`,
  },
  button: {
    width: '28px',
    height: '28px',
    borderRadius: RADIUS.circle,
    border: 'none',
    background: 'white',
    color: DRAMS.textDark,
    fontSize: '18px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: TRANSITIONS.hover,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  buttonActive: {
    background: DRAMS.orange,
    color: 'white',
  },
  value: {
    ...TYPOGRAPHY.label,
    minWidth: '24px',
    textAlign: 'center',
  },
} as const;

// Badge - Status indicator (Thorough, Understandable)
export const BADGE = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.pill,
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    textTransform: 'capitalize',
  },
  success: {
    background: '#f0fdf4',
    color: '#10b981',
  },
  warning: {
    background: '#fef3c7',
    color: '#f59e0b',
  },
  error: {
    background: '#fef2f2',
    color: '#ef4444',
  },
  info: {
    background: '#eff6ff',
    color: '#3b82f6',
  },
} as const;

// Empty State - Friendly nothingness (Thorough, Understandable)
export const DRAMS_EMPTY_STATE = {
  container: {
    textAlign: 'center' as const,
    padding: `${SPACING['3xl']} ${SPACING.xl}`,
    background: 'white',
    borderRadius: RADIUS.card,
  },
  icon: {
    width: '64px',
    height: '64px',
    margin: `0 auto ${SPACING.lg}`,
    opacity: 0.3,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: DRAMS.textDark,
    marginBottom: SPACING.sm,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: DRAMS.textLight,
    marginBottom: SPACING.xl,
  },
  cta: {
    ...PILL_BUTTON.orange,
    marginTop: SPACING.lg,
  },
} as const;
