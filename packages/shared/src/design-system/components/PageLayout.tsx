import type { ReactNode } from 'react';
import { LAYOUT, SPACING, DRAMS, TYPOGRAPHY, GRID } from '../tokens';

export type PageVariant = 'default' | 'gray' | 'centered';

export interface PageLayoutProps {
  children: ReactNode;
  /** Page variant */
  variant?: PageVariant;
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Custom content padding */
  padding?: string;
  /** Custom max width */
  maxWidth?: string;
  /** Show page header section */
  showHeader?: boolean;
}

const PAGE_STYLES = {
  default: {
    ...LAYOUT.page,
  },
  gray: {
    ...LAYOUT.pageGray,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    ...LAYOUT.page,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
} as const;

const CONTENT_STYLES = {
  default: {
    ...GRID.containerWide,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  gray: {
    padding: SPACING.xl,
  },
  centered: {
    ...LAYOUT.centered,
    textAlign: 'center' as const,
  },
} as const;

const HEADER_STYLES = {
  ...GRID.containerWide,
  paddingTop: SPACING.xl,
  paddingBottom: 0,
};

const TITLE_STYLE = {
  ...TYPOGRAPHY.h1,
  color: DRAMS.textDark,
  margin: `0 0 ${SPACING.md} 0`,
};

const SUBTITLE_STYLE = {
  ...TYPOGRAPHY.body,
  color: DRAMS.textLight,
  margin: 0,
};

/**
 * PageLayout - Consistent page layout wrapper
 * Uses GRID system for all spacing (Thorough, Configurable)
 *
 * Variants:
 * - 'default': White background, uses GRID.containerWide
 * - 'gray': Gray background, centered content
 * - 'centered': White background, vertically centered
 */
export function PageLayout({
  children,
  variant = 'default',
  title,
  subtitle,
  showHeader = false,
}: PageLayoutProps): JSX.Element {
  const pageStyle = PAGE_STYLES[variant];
  const contentStyle = CONTENT_STYLES[variant];

  return (
    <div style={pageStyle}>
      {(showHeader || title || subtitle) && (
        <div style={HEADER_STYLES}>
          {title && <h1 style={TITLE_STYLE}>{title}</h1>}
          {subtitle && <p style={SUBTITLE_STYLE}>{subtitle}</p>}
        </div>
      )}
      <div style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

/**
 * PageHeader - Reusable page header component
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps): JSX.Element {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: SPACING.xl,
    }}>
      <div>
        <h1 style={TITLE_STYLE}>{title}</h1>
        {subtitle && <p style={SUBTITLE_STYLE}>{subtitle}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
