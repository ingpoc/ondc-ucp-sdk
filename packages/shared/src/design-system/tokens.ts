/**
 * Design System Tokens - Dieter Rams Principles
 * Minimal, timeless slate palette with consistent spacing, typography, and styles
 */

// Color Palette - Slate-based (Aesthetic, Little Design)
export const COLORS = {
  // Backgrounds
  bgPage: '#f8fafc',      // slate-50
  bgCard: '#ffffff',      // white
  bgSubtle: '#f1f5f9',     // slate-100
  bgHover: '#f8fafc',     // slate-50

  // Text
  textPrimary: '#0f172a',  // slate-900
  textSecondary: '#475569', // slate-600
  textMuted: '#94a3b8',    // slate-400
  textDisabled: '#cbd5e1',  // slate-300

  // Borders
  border: '#e2e8f0',       // slate-200
  borderSubtle: '#f1f5f9', // slate-100

  // Semantic (Honest, Thorough)
  success: '#10b981',      // emerald-500
  warning: '#f59e0b',      // amber-500
  error: '#ef4444',        // red-500
  info: '#3b82f6',         // blue-500
} as const;

// DRAMS Signature Colors (Dieter Rams: Innovative, Aesthetic, Honest)
export const DRAMS = {
  // Signature orange - primary action color
  orange: 'rgb(255, 97, 26)',
  orangeHighlight: 'rgb(255, 150, 102)',
  // Gray tones for tracks and backgrounds
  grayTrack: 'rgb(238, 238, 238)',
  grayHover: 'rgb(232, 232, 232)',
  // Text colors
  textDark: '#333',
  textLight: '#999',
} as const;

// DRAMS Transitions - tactile, satisfying (Innovative, Thorough)
export const TRANSITIONS = {
  standard: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  hover: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  bounce: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

// Spacing Scale - Consistent scale (Aesthetic)
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const;

// Typography Scale (Aesthetic)
export const TYPOGRAPHY = {
  // Display
  h1: { fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1 },
  h2: { fontSize: '36px', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.2 },
  h3: { fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1.3 },
  h4: { fontSize: '20px', fontWeight: 600, letterSpacing: '-0.25px', lineHeight: 1.4 },

  // Body
  body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4 },
  label: { fontSize: '14px', fontWeight: 500, lineHeight: 1.5 },

  // Navigation
  nav: { fontSize: '14px', fontWeight: 500, lineHeight: 1.5 },
  navActive: { fontSize: '14px', fontWeight: 600, lineHeight: 1.5 },
} as const;

// Shadows - Subtle depth (Unobtrusive)
export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
} as const;

// Border Radius - Consistent rounding (Aesthetic, DRAMS)
export const RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  // DRAMS pill and circle shapes
  pill: '48px',
  circle: '50%',
  card: '20px',
} as const;

// Button Styles (Useful, Understandable, Honest)
export const BUTTON = {
  primary: {
    backgroundColor: COLORS.success,
    color: 'white',
    border: 'none',
    borderRadius: RADIUS.md,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondary: {
    backgroundColor: COLORS.bgSubtle,
    color: COLORS.textPrimary,
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADIUS.md,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  danger: {
    backgroundColor: COLORS.error,
    color: 'white',
    border: 'none',
    borderRadius: RADIUS.md,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
} as const;

// Form Input Styles (Understandable, Honest)
export const INPUT = {
  base: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADIUS.md,
    padding: `${SPACING.md} ${SPACING.lg}`,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: COLORS.textPrimary,
    backgroundColor: 'white',
    transition: 'all 0.2s ease',
  },
  focus: {
    outline: 'none',
    borderColor: COLORS.info,
    boxShadow: `0 0 0 3px rgba(59, 130, 246, 0.1)`,
  },
  error: {
    borderColor: COLORS.error,
  },
} as const;

// Navigation Styles (Understandable, Honest)
export const NAV = {
  link: {
    color: COLORS.textSecondary,
    textDecoration: 'none',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.nav.fontSize,
    fontWeight: TYPOGRAPHY.nav.fontWeight,
    transition: 'all 0.2s ease',
  },
  linkActive: {
    backgroundColor: COLORS.bgSubtle,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.navActive.fontWeight,
  },
  linkHover: {
    backgroundColor: COLORS.bgHover,
    color: COLORS.textPrimary,
  },
} as const;

// Card Styles (Aesthetic, Unobtrusive)
export const CARD = {
  base: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    boxShadow: SHADOWS.md,
    border: `1px solid ${COLORS.border}`,
  },
  hover: {
    boxShadow: SHADOWS.lg,
  },
} as const;

// Empty State Styles (Thorough, Understandable)
export const EMPTY_STATE = {
  container: {
    textAlign: 'center' as const,
    padding: SPACING['3xl'],
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
  },
  title: {
  ...TYPOGRAPHY.h3,
  color: COLORS.textPrimary,
  margin: `0 0 ${SPACING.md} 0`,
  },
  message: {
  ...TYPOGRAPHY.body,
  color: COLORS.textSecondary,
  margin: `0 0 ${SPACING.xl} 0`,
  },
  cta: {
    ...BUTTON.primary,
    marginTop: SPACING.xl,
  },
} as const;

// Loading States (Honest, Thorough)
export const LOADING = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['3xl'],
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.body.fontSize,
  },
  spinner: {
    border: '3px solid #e2e8f0',
    borderTop: '3px solid COLORS.info',
  },
} as const;

// Error State Styles (Honest, Thorough)
export const ERROR = {
  container: {
    padding: `${SPACING.md} ${SPACING.lg}`,
  },
  alert: {
    backgroundColor: '#fef2f2',
    border: `1px solid #fecaca`,
    color: COLORS.error,
  },
  title: {
    ...TYPOGRAPHY.label,
    color: COLORS.error,
    fontWeight: 600,
    marginBottom: SPACING.xs,
  },
  message: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  actions: {
    marginTop: SPACING.lg,
  },
} as const;

// Utility Types
export type SpacingValue = keyof typeof SPACING;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type ShadowKey = keyof typeof SHADOWS;
export type RadiusKey = keyof typeof RADIUS;
export type DramsColorKey = keyof typeof DRAMS;
export type TransitionKey = keyof typeof TRANSITIONS;