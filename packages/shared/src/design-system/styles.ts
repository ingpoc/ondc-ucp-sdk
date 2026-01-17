/**
 * Design System - Dieter Rams Principles
 * Minimal, timeless, clean slate palette with modern typography
 */

// Color Palette - Slate-based
export const COLORS = {
  // Backgrounds
  bgPage: '#f8fafc',
  bgCard: '#ffffff',
  bgSection: '#f1f5f9',

  // Text
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',

  // Borders
  borderDefault: '#e2e8f0',
  borderSubtle: '#f1f5f9',

  // Accents
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  success: '#10b981',
  successHover: '#059669',
  warning: '#f59e0b',
  error: '#ef4444',
  errorHover: '#dc2626',
} as const;

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: '24px',
    fontWeight: 600,
    letterSpacing: '-0.25px',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: '18px',
    fontWeight: 600,
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    color: COLORS.textSecondary,
  },
  small: {
    fontSize: '12px',
    fontWeight: 400,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: COLORS.textPrimary,
  },
} as const;

// Spacing Scale
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px -1px rgba(0,0,0,0.1)',
  lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
} as const;

// Border Radius
export const RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
} as const;

// Pre-built Style Objects
export const PAGE_CONTAINER_STYLE = {
  minHeight: '100vh',
  backgroundColor: COLORS.bgPage,
  padding: SPACING.lg,
};

export const CARD_STYLE = {
  backgroundColor: COLORS.bgCard,
  borderRadius: RADIUS.lg,
  padding: SPACING.lg,
  boxShadow: SHADOWS.md,
  border: `1px solid ${COLORS.borderDefault}`,
};

export const SECTION_STYLE = {
  backgroundColor: COLORS.bgCard,
  borderRadius: RADIUS.lg,
  padding: SPACING.lg,
  boxShadow: SHADOWS.sm,
  border: `1px solid ${COLORS.borderDefault}`,
  marginBottom: SPACING.lg,
};

export const HEADING_STYLE = {
  ...TYPOGRAPHY.h2,
  marginBottom: SPACING.md,
};

export const SUBHEADING_STYLE = {
  ...TYPOGRAPHY.h3,
  marginBottom: SPACING.sm,
};

export const BUTTON_PRIMARY_STYLE = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: RADIUS.md,
  backgroundColor: COLORS.primary,
  color: 'white',
  fontSize: TYPOGRAPHY.body.fontSize,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
};

export const BUTTON_SUCCESS_STYLE = {
  ...BUTTON_PRIMARY_STYLE,
  backgroundColor: COLORS.success,
};

export const BUTTON_SECONDARY_STYLE = {
  padding: '10px 20px',
  border: `1px solid ${COLORS.borderDefault}`,
  borderRadius: RADIUS.md,
  backgroundColor: 'white',
  color: COLORS.textPrimary,
  fontSize: TYPOGRAPHY.body.fontSize,
  fontWeight: TYPOGRAPHY.label.fontWeight,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export const BUTTON_DANGER_STYLE = {
  ...BUTTON_PRIMARY_STYLE,
  backgroundColor: COLORS.error,
};

export const INPUT_STYLE = {
  width: '100%',
  padding: '10px',
  border: `1px solid ${COLORS.borderDefault}`,
  borderRadius: RADIUS.md,
  fontSize: TYPOGRAPHY.body.fontSize,
  backgroundColor: 'white',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
};

export const INPUT_FOCUS_STYLE = {
  borderColor: COLORS.primary,
  boxShadow: `0 0 0 3px ${COLORS.primary}20`,
  outline: 'none',
};

export const LABEL_STYLE = {
  ...TYPOGRAPHY.label,
  display: 'block',
  marginBottom: SPACING.sm,
};

export const ERROR_STYLE = {
  padding: SPACING.md,
  borderRadius: RADIUS.md,
  backgroundColor: '#fef2f2',
  border: `1px solid ${COLORS.error}30`,
  color: COLORS.error,
  fontSize: TYPOGRAPHY.body.fontSize,
};

export const SUCCESS_STYLE = {
  padding: SPACING.md,
  borderRadius: RADIUS.md,
  backgroundColor: '#f0fdf4',
  border: `1px solid ${COLORS.success}30`,
  color: COLORS.success,
  fontSize: TYPOGRAPHY.body.fontSize,
};

export const LOADING_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: SPACING['2xl'],
  color: COLORS.textSecondary,
  fontSize: TYPOGRAPHY.body.fontSize,
};

export const EMPTY_STATE_STYLE = {
  textAlign: 'center',
  padding: `${SPACING['2xl']} ${SPACING.lg}`,
  backgroundColor: COLORS.bgSection,
  borderRadius: RADIUS.lg,
  color: COLORS.textSecondary,
};

// Status colors for orders
export const STATUS_COLORS = {
  pending: COLORS.primary,
  active: COLORS.warning,
  complete: COLORS.success,
  error: COLORS.error,
} as const;

export const getStatusBadgeStyle = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: COLORS.primary,
    active: COLORS.warning,
    complete: COLORS.success,
    error: COLORS.error,
  };

  return {
    padding: '6px 12px',
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.small.fontSize,
    fontWeight: TYPOGRAPHY.label.fontWeight,
    textTransform: 'capitalize',
    display: 'inline-block',
    backgroundColor: colorMap[status] || COLORS.textSecondary,
    color: 'white',
  };
};
