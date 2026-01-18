/**
 * Design System Tokens - Dieter Rams Principles
 * "Less but better" - DRAMS color palette with tactile, minimal aesthetics
 */

// Color Palette - DRAMS (Aesthetic, Little Design, Honest)
export const COLORS = {
  // Backgrounds - Clean, unobtrusive
  bgPage: '#ffffff',       // Pure white page
  bgCard: '#ffffff',       // White cards
  bgSubtle: 'rgb(238, 238, 238)', // Gray track (DRAMS)
  bgHover: 'rgb(232, 232, 232)',  // Gray hover (DRAMS)

  // Text - Clear hierarchy
  textPrimary: '#333',     // DRAMS primary text
  textSecondary: '#666',   // DRAMS secondary text
  textMuted: '#999',       // DRAMS muted text
  textDisabled: '#ccc',    // Disabled state

  // Borders - Minimal, unobtrusive
  border: 'rgba(0,0,0,0.08)',     // Subtle border
  borderSubtle: 'rgba(0,0,0,0.04)', // Very subtle

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
  // Font family
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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

// Typography Scale (DRAMS: Light, clean, minimal)
export const TYPOGRAPHY = {
  // Display - DRAMS uses light weight (300), not bold
  h1: { fontSize: '32px', fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1.2 },
  h2: { fontSize: '28px', fontWeight: 300, letterSpacing: '-0.5px', lineHeight: 1.3 },
  h3: { fontSize: '20px', fontWeight: 400, letterSpacing: '-0.25px', lineHeight: 1.4 },
  h4: { fontSize: '18px', fontWeight: 500, letterSpacing: '0', lineHeight: 1.4 },

  // Body
  body: { fontSize: '15px', fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontSize: '13px', fontWeight: 400, lineHeight: 1.4 },

  // Label - DRAMS uppercase style
  label: { fontSize: '13px', fontWeight: 500, lineHeight: 1.5, textTransform: 'uppercase' as const, letterSpacing: '1px' },

  // Navigation
  nav: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
  navActive: { fontSize: '14px', fontWeight: 500, lineHeight: 1.5 },
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

// Button Styles - DRAMS Pill Buttons (Useful, Understandable, Honest)
export const BUTTON = {
  primary: {
    background: 'radial-gradient(circle at 30% 30%, rgb(255, 150, 102) 0%, rgb(255, 97, 26) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: TRANSITIONS.standard,
    boxShadow: 'rgba(232, 61, 23, 0.4) 0px 0px 2px -1px inset, 0 2px 8px rgba(255, 97, 26, 0.3)',
  },
  secondary: {
    background: DRAMS.grayTrack,
    color: DRAMS.textDark,
    border: 'none',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: TRANSITIONS.hover,
  },
  danger: {
    background: COLORS.error,
    color: 'white',
    border: 'none',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.label.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    cursor: 'pointer',
    transition: TRANSITIONS.hover,
  },
} as const;

// Form Input Styles - DRAMS Pill Inputs (Understandable, Honest)
export const INPUT = {
  base: {
    border: 'none',
    borderRadius: RADIUS.pill,
    padding: `${SPACING.md} ${SPACING.xl}`,
    fontSize: TYPOGRAPHY.body.fontSize,
    color: DRAMS.textDark,
    background: DRAMS.grayTrack,
    transition: TRANSITIONS.standard,
  },
  focus: {
    outline: 'none',
    background: DRAMS.grayHover,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  error: {
    background: '#fef2f2',
  },
} as const;

// Navigation Styles - DRAMS Pill Navigation (Understandable, Honest)
export const NAV = {
  link: {
    color: DRAMS.textDark,
    textDecoration: 'none',
    padding: `${SPACING.md} ${SPACING.xl}`,
    borderRadius: RADIUS.pill,
    fontSize: TYPOGRAPHY.nav.fontSize,
    fontWeight: TYPOGRAPHY.nav.fontWeight,
    transition: TRANSITIONS.hover,
    background: 'transparent',
  },
  linkActive: {
    background: DRAMS.orange,
    color: 'white',
    fontWeight: TYPOGRAPHY.navActive.fontWeight,
  },
  linkHover: {
    background: DRAMS.grayTrack,
    color: DRAMS.textDark,
  },
} as const;

// Card Styles - DRAMS (Aesthetic, Unobtrusive)
export const CARD = {
  base: {
    backgroundColor: 'white',
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    border: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  hover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
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

// ========== LAYOUT TOKENS ==========
// Application dimensions (Thorough, Consistent)
export const APP = {
  headerHeight: '64px',
  maxWidth: '1400px',
  contentMaxWidth: '1200px',
} as const;

// ========== GRID SYSTEM ==========
// 12-column grid system for consistent layouts (Thorough, Aesthetic)
export const GRID = {
  // Container with max-width and horizontal centering
  container: {
    width: '100%',
    maxWidth: APP.maxWidth,
    margin: '0 auto',
    paddingLeft: SPACING.xl,
    paddingRight: SPACING.xl,
  },

  // Container with wider padding for desktop
  containerWide: {
    width: '100%',
    maxWidth: APP.maxWidth,
    margin: '0 auto',
    paddingLeft: '80px',
    paddingRight: '80px',
  },

  // Grid gaps using SPACING scale
  gap: {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
    '2xl': SPACING['2xl'],
    '3xl': SPACING['3xl'],
  } as const,

  // Common grid patterns
  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: SPACING.xl,
  },

  twoColumnsWide: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: SPACING.xl,
  },

  threeColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: SPACING.xl,
  },

  fourColumns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: SPACING.xl,
  },

  // Auto-fill grid for responsive cards
  autoFill: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: SPACING.xl,
  },
} as const;

// Page Layout Patterns (Aesthetic, Consistent)
export const LAYOUT = {
  // Full page container
  page: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ffffff',
  },
  // Page with gray background
  pageGray: {
    height: '100%',
    width: '100%',
    backgroundColor: DRAMS.grayTrack,
  },
  // Content container with horizontal padding
  content: {
    padding: `0 ${SPACING.xl}`,
    maxWidth: '100%',
  },
  // Content with wide padding
  contentWide: {
    padding: `0 80px`,
    maxWidth: '100%',
  },
  // Centered content container
  centered: {
    maxWidth: APP.contentMaxWidth,
    margin: '0 auto',
  },
  // Page header section
  pageHeader: {
    padding: `${SPACING.xl} 0`,
    marginBottom: SPACING.xl,
    background: DRAMS.grayTrack,
  },
  // Grid layouts
  gridTwoColumns: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: SPACING.xl,
  },
  gridFilters: {
    display: 'flex',
    gap: SPACING['2xl'],
    alignItems: 'flex-start',
  },
} as const;