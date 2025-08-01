/**
 * The Pantry Component Library - Type Definitions
 * Professional enterprise components for the Spaghetti Platform
 */

export interface Noodle {
  id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  fileSize?: string;
  status: 'draft' | 'published' | 'archived';
  lastModifiedBy?: string;
  version?: number;
  permissions?: NoodlePermissions;
}

export interface NoodlePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canShare: boolean;
  canComment: boolean;
}

export interface Plate {
  id: string;
  name: string;
  description?: string;
  noodleIds: string[];
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  color?: string;
  icon?: string;
  isPublic: boolean;
  permissions?: PlatePermissions;
}

export interface PlatePermissions {
  canEdit: boolean;
  canDelete: boolean;
  canAddNoodles: boolean;
  canRemoveNoodles: boolean;
  canShare: boolean;
}

export interface PantryUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'chef' | 'sous-chef' | 'steward' | 'diner';
  isOnline?: boolean;
}

export interface AlDenteEditorContent {
  type: 'doc';
  content: Array<{
    type: string;
    attrs?: Record<string, any>;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{
        type: string;
        attrs?: Record<string, any>;
      }>;
    }>;
  }>;
}

export interface EditorToolbarAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

export type ViewMode = 'grid' | 'list' | 'table';
export type SortBy = 'title' | 'date' | 'author' | 'status';
export type FilterBy = 'all' | 'draft' | 'published' | 'archived';

export interface PantrySearchFilters {
  searchTerm: string;
  selectedTags: string[];
  sortBy: SortBy;
  filterBy: FilterBy;
  viewMode: ViewMode;
}

export interface NoodleCardActions {
  onView: (noodleId: string) => void;
  onEdit: (noodleId: string) => void;
  onDownload: (noodleId: string) => void;
  onDelete: (noodleId: string) => void;
  onShare?: (noodleId: string) => void;
  onComment?: (noodleId: string) => void;
}

// Icon component type that matches Lucide React
export type IconComponent = React.ComponentType<any>;

export interface PlateCardActions {
  onView: (plateId: string) => void;
  onEdit: (plateId: string) => void;
  onDelete: (plateId: string) => void;
  onAddNoodle: (plateId: string) => void;
  onShare?: (plateId: string) => void;
}