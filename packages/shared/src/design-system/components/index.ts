/**
 * DRAMS React Components
 * Dieter Rams-inspired UI components following "less, but better" philosophy
 */

// ========== Display Components ==========
export { DramsProductCard } from './ProductCard';
export type { DramsProductCardProps } from './ProductCard';

export { DramsFlipCard, FlipCardFront, FlipCardBack } from './FlipCard';
export type { DramsFlipCardProps, DramsFlipCardSpec, DramsFlipCardFrontProps, DramsFlipCardBackProps } from './FlipCard';

export { DramsAddButton } from './AddButton';
export type { DramsAddButtonProps } from './AddButton';

// ========== Navigation Components ==========
export { RollingSearch } from './RollingSearch';
export type { RollingSearchProps } from './RollingSearch';

// ========== Layout Components ==========
export { PageLayout, PageHeader } from './PageLayout';
export type { PageLayoutProps, PageHeaderProps, PageVariant } from './PageLayout';

// ========== Form Components ==========
export { DramsInput } from './DramsInput';
export type { DramsInputProps } from './DramsInput';

export { DramsSelect } from './DramsSelect';
export type { DramsSelectProps } from './DramsSelect';

export { DramsButton } from './DramsButton';
export type { DramsButtonProps, DramsButtonVariant } from './DramsButton';
