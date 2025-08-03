// Sprint 2 Frontend Integration Types
// Real-time collaboration and search types for TypeScript integration

export interface UserPresence {
  userId: string;
  userName?: string;
  email?: string;
  status?: 'active' | 'idle' | 'away' | 'typing';
  cursorPosition?: number;
  lastSeen?: Date | string;
  color?: string;
}

export interface DocumentLockInfo {
  documentId: string;
  lockedBy: string;
  lockedByName: string;
  lockedAt: string;
  expiresAt: string;
  isActive: boolean;
}

export interface ContentChange {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  operation: 'insert' | 'delete' | 'replace';
  startPosition: number;
  endPosition: number;
  content: string;
  timestamp: string;
  version: number;
}

export interface DocumentComment {
  id?: string;
  documentId: string;
  userId: string;
  userName: string;
  content: string;
  position: number;
  line?: number;
  createdAt: Date | string;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

// Operational Transformation Types
export interface DocumentOperationRequest {
  id: string;
  operationType: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length: number;
  version: number;
  userId: string;
  timestamp: Date;
}

export interface CursorPosition {
  position: number;
  selectionStart?: number;
  selectionEnd?: number;
  line?: number;
  column?: number;
}

// Search Types
export interface AdvancedSearchRequest {
  query: string;
  tags?: string[];
  documentTypes?: string[];
  industries?: string[];
  fromDate?: string;
  toDate?: string;
  createdBy?: string;
  status?: DocumentStatus;
  page: number;
  pageSize: number;
  sortBy: 'relevance' | 'date' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface SearchResponse {
  documents: DocumentSearchResult[];
  totalResults: number;
  page: number;
  pageSize: number;
  searchTime: number;
  aggregations: Record<string, number>;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  summary: string;
  score: number;
  highlights: string[];
  documentType: string;
  industry: string;
  createdAt: string;
  createdByName: string;
  tags: string[];
}

export enum DocumentStatus {
  Draft = 'Draft',
  InReview = 'InReview',
  Approved = 'Approved',
  Published = 'Published',
  Archived = 'Archived',
  Deleted = 'Deleted'
}

// SignalR Connection State
export interface SignalRConnectionState {
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  connectionId?: string;
  lastConnected?: string;
  error?: string;
}

// Real-time State Management
export interface RealTimeCollaborationState {
  connectedUsers: Map<string, UserPresence>;
  documentLocks: Map<string, DocumentLockInfo>;
  pendingChanges: ContentChange[];
  comments: DocumentComment[];
  connectionState: SignalRConnectionState;
  currentDocumentId?: string;
}

// Component Props Interfaces
export interface GlobalSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
  showFilters?: boolean;
  className?: string;
}

export interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchRequest: AdvancedSearchRequest) => void;
  initialFilters?: Partial<AdvancedSearchRequest>;
  className?: string;
}

export interface SearchResultsProps {
  results: SearchResponse;
  loading: boolean;
  onDocumentSelect: (documentId: string) => void;
  onLoadMore: () => void;
  className?: string;
}

export interface RealTimeEditorProps {
  documentId: string;
  initialContent: string;
  readonly?: boolean;
  onContentChange: (content: string) => void;
  onSave: (content: string) => void;
  className?: string;
}

export interface UserPresenceProps {
  documentId: string;
  currentUserId: string;
  maxVisible?: number;
  showTooltips?: boolean;
  className?: string;
}

export interface DocumentLockProps {
  documentId: string;
  currentUserId: string;
  onLockRequest: () => void;
  onLockRelease: () => void;
  className?: string;
}

export interface CollaborationToolbarProps {
  documentId: string;
  currentUserId: string;
  isLocked: boolean;
  activeUsers: UserPresence[];
  onLockToggle: () => void;
  onCommentAdd: (comment: Omit<DocumentComment, 'id' | 'createdAt'>) => void;
  className?: string;
}

// API Response Wrappers
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Service Interfaces
export interface SearchService {
  advancedSearch(request: AdvancedSearchRequest): Promise<SearchResponse>;
  getSuggestions(query: string, limit?: number): Promise<string[]>;
  fullTextSearch(query: string, page?: number, pageSize?: number): Promise<SearchResponse>;
}

export interface CollaborationService {
  getActiveUsers(documentId: string): Promise<UserPresence[]>;
  getLockStatus(documentId: string): Promise<DocumentLockInfo | null>;
  requestLock(documentId: string): Promise<DocumentLockInfo>;
  releaseLock(documentId: string): Promise<void>;
  getContentChangesSince(documentId: string, since: string): Promise<ContentChange[]>;
  storeContentChange(documentId: string, change: ContentChange): Promise<void>;
  getDocumentComments(documentId: string): Promise<DocumentComment[]>;
  addComment(documentId: string, comment: DocumentComment): Promise<void>;
}

export interface SignalRService {
  connect(): Promise<void>;
  disconnect(): void;
  joinDocument(documentId: string): Promise<void>;
  leaveDocument(documentId: string): Promise<void>;
  requestLock(documentId: string): Promise<void>;
  releaseLock(documentId: string): Promise<void>;
  updatePresence(documentId: string, presence: UserPresence): Promise<void>;
  sendContentChange(documentId: string, change: ContentChange): Promise<void>;
  sendComment(documentId: string, comment: DocumentComment): Promise<void>;
  
  // Event handlers
  onUserJoined(callback: (user: UserPresence) => void): void;
  onUserLeft(callback: (userId: string) => void): void;
  onPresenceUpdate(callback: (presence: UserPresence) => void): void;
  onContentChange(callback: (change: ContentChange) => void): void;
  onNewComment(callback: (comment: DocumentComment) => void): void;
  onDocumentLocked(callback: (lockInfo: DocumentLockInfo) => void): void;
  onDocumentUnlocked(callback: (documentId: string) => void): void;
  onError(callback: (error: string) => void): void;
}

// Hook Return Types
export interface UseSearchReturn {
  searchResults: SearchResponse | null;
  isSearching: boolean;
  searchError: string | null;
  suggestions: string[];
  search: (request: AdvancedSearchRequest) => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
}

export interface UseCollaborationReturn {
  collaborationState: RealTimeCollaborationState;
  isConnected: boolean;
  joinDocument: (documentId: string) => Promise<void>;
  leaveDocument: () => Promise<void>;
  requestLock: () => Promise<void>;
  releaseLock: () => Promise<void>;
  sendContentChange: (change: Omit<ContentChange, 'id' | 'timestamp' | 'userId' | 'userName'>) => Promise<void>;
  addComment: (comment: Omit<DocumentComment, 'id' | 'createdAt' | 'userId' | 'userName'>) => Promise<void>;
  updatePresence: (presence: Partial<UserPresence>) => Promise<void>;
}

// Event Types for SignalR
export interface SignalREvents {
  'UserJoined': (user: UserPresence) => void;
  'UserLeft': (userId: string) => void;
  'PresenceUpdate': (presence: UserPresence) => void;
  'ContentChange': (change: ContentChange) => void;
  'NewComment': (comment: DocumentComment) => void;
  'DocumentLocked': (lockInfo: DocumentLockInfo) => void;
  'DocumentUnlocked': (documentId: string) => void;
  'ActiveUsers': (users: UserPresence[]) => void;
  'LockStatus': (lockInfo: DocumentLockInfo | null) => void;
  'Error': (error: string) => void;
  'LockRequestFailed': (error: { Error: string; CurrentLock: DocumentLockInfo }) => void;
}