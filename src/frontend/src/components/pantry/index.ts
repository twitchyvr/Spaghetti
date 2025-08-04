/**
 * The Pantry Design System - Component Library Index
 * Centralized exports for all Pantry components
 */

// Design Tokens
export { designTokens } from './DesignTokens';
export type {
  ColorToken,
  SpacingToken,
  BorderRadiusToken,
  ShadowToken,
  FontSizeToken,
  FontWeightToken,
} from './DesignTokens';

// Button Components
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

// Card Components
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card';

// Data Components
export { StatsCard } from './data/StatsCard';
export type { StatsCardProps } from './data/StatsCard';

// Form Components
export { Button as FormsButton } from './forms/Button';

// Feedback Components
export { LoadingSpinner } from './feedback/LoadingSpinner';
export { Tooltip } from './feedback/Tooltip';

// Navigation Components
export { Tabs, TabsList, TabsTrigger, TabsContent } from './navigation/Tabs';
export { NavigationItems } from './navigation/NavigationItems';

// Input Components
export { Input, Textarea, Select } from './Input';
export type {
  InputProps,
  InputSize,
  InputState,
  TextareaProps,
  SelectProps,
  SelectOption,
} from './Input';

// Badge Components
export { Badge, StatusBadge, NotificationBadge } from './Badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  StatusBadgeProps,
  NotificationBadgeProps,
} from './Badge';

// Alert Components
export { Alert, ToastAlert, InlineAlert, AlertTitle, AlertDescription } from './Alert';

// Modal Components
export { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmationModal } from './Modal';
export type {
  ModalProps,
  ModalSize,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ConfirmationModalProps,
} from './Modal';

// Navigation Components (Legacy)
export { Breadcrumbs, Pagination } from './Navigation';

// Table Components
export { Table, TablePagination } from './Table';
export type {
  TableProps,
  TableColumn,
  TablePaginationProps,
} from './Table';

// Legacy Core Components (deprecated - use new Pantry components above)
export { NoodleCard } from './NoodleCard';
export { PlateCard } from './PlateCard';
export { AlDenteEditor } from './AlDenteEditor';

// Legacy Type Definitions (deprecated)
export type {
  Noodle,
  NoodlePermissions,
  Plate,
  PlatePermissions,
  PantryUser,
  AlDenteEditorContent,
  EditorToolbarAction,
  ViewMode,
  SortBy,
  FilterBy,
  PantrySearchFilters,
  NoodleCardActions,
  PlateCardActions
} from './types';

// Legacy Utility Components (deprecated)
export { PantrySearchBar } from './PantrySearchBar';
export { PantryViewToggle } from './PantryViewToggle';
export { PantrySortDropdown } from './PantrySortDropdown';
export { PantryTagFilter } from './PantryTagFilter';
export { PantryStatusBadge } from './PantryStatusBadge';
export { PantryUserAvatar } from './PantryUserAvatar';
export { PantryLoadingState } from './PantryLoadingState';
export { PantryEmptyState } from './PantryEmptyState';

// Performance-Optimized Components
export { LazyImage, LazyImageGallery, LazyAvatar } from './LazyImage';
export type { LazyImageProps, LazyImageGalleryProps, LazyAvatarProps } from './LazyImage';

export { VirtualList, VirtualGrid } from './VirtualList';
export type { VirtualListProps, VirtualGridProps } from './VirtualList';

// Re-export default components for convenience
export { Button as PantryButton } from './Button';
export { Card as PantryCard } from './Card';
export { Input as PantryInput } from './Input';
export { Badge as PantryBadge } from './Badge';
export { Alert as PantryAlert } from './Alert';
export { Modal as PantryModal } from './Modal';
export { Table as PantryTable } from './Table';