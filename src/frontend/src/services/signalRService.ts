import * as signalR from '@microsoft/signalr';

// Types for collaboration data
export interface UserPresence {
  userId: string;
  userName: string;
  email: string;
  status: 'active' | 'idle' | 'away' | 'typing';
  cursorPosition: number;
  lastSeen: Date;
  color: string;
}

export interface ContentChange {
  operation: 'insert' | 'delete' | 'replace';
  startPosition: number;
  endPosition: number;
  content: string;
  timestamp: Date;
  userId: string;
  userName: string;
  version: number;
}

export interface CursorUpdate {
  userId: string;
  userName: string;
  position: number;
  timestamp: Date;
  isTyping?: boolean;
}

export interface DocumentLockInfo {
  documentId: string;
  lockedBy: string;
  lockedByName: string;
  lockedAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  position: number;
  line?: number;
  isResolved: boolean;
  replies?: DocumentComment[];
}

// SignalR connection management
let connection: signalR.HubConnection | null = null;
let joinedDocuments: Set<string> = new Set();

// Connection establishment
export async function connectToHub(): Promise<void> {
  if (connection?.state === signalR.HubConnectionState.Connected) {
    return;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl('/collaborationHub', {
      skipNegotiation: true,
      transport: signalR.HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 10000, 30000])
    .configureLogging(signalR.LogLevel.Information)
    .build();

  // Setup reconnection handlers
  connection.onreconnecting((error) => {
    console.warn('SignalR connection lost, attempting to reconnect...', error);
  });

  connection.onreconnected(async (connectionId) => {
    console.log('SignalR reconnected with connection ID:', connectionId);
    
    // Rejoin all previously joined documents
    for (const documentId of joinedDocuments) {
      try {
        await connection!.invoke('JoinDocument', documentId);
      } catch (error) {
        console.error(`Failed to rejoin document ${documentId}:`, error);
      }
    }
  });

  connection.onclose((error) => {
    console.error('SignalR connection closed:', error);
  });

  await connection.start();
}

// Document operations
export async function joinDocument(documentId: string): Promise<void> {
  if (!documentId) {
    throw new Error('Document ID is required');
  }

  if (!connection) {
    await connectToHub();
  }

  if (connection!.state !== signalR.HubConnectionState.Connected) {
    throw new Error('SignalR connection is not active');
  }

  await connection!.invoke('JoinDocument', documentId);
  joinedDocuments.add(documentId);
}

export async function leaveDocument(documentId: string): Promise<void> {
  if (!connection || !documentId) return;

  try {
    await connection.invoke('LeaveDocument', documentId);
    joinedDocuments.delete(documentId);
  } catch (error) {
    console.error('Error leaving document:', error);
  }
}

export async function sendContentChange(documentId: string, change: ContentChange): Promise<void> {
  if (!connection || !documentId || !change) {
    throw new Error('Connection, document ID, and content change are required');
  }

  await connection.invoke('SendContentChange', documentId, change);
}

export async function sendCursorUpdate(documentId: string, update: CursorUpdate): Promise<void> {
  if (!connection || !documentId || !update) {
    throw new Error('Connection, document ID, and cursor update are required');
  }

  await connection.invoke('SendCursorUpdate', documentId, update);
}

export async function lockDocument(documentId: string): Promise<void> {
  if (!connection || !documentId) {
    throw new Error('Connection and document ID are required');
  }

  await connection.invoke('LockDocument', documentId);
}

export async function releaseDocumentLock(documentId: string): Promise<void> {
  if (!connection || !documentId) return;

  try {
    await connection.invoke('ReleaseLock', documentId);
  } catch (error) {
    console.error('Error releasing document lock:', error);
  }
}

export async function sendComment(documentId: string, comment: DocumentComment): Promise<void> {
  if (!connection || !documentId || !comment) return;

  try {
    await connection.invoke('SendComment', documentId, comment);
  } catch (error) {
    console.error('Error sending comment:', error);
    throw error;
  }
}

export function getConnectionState(): string {
  return connection?.state ? signalR.HubConnectionState[connection.state] : 'Disconnected';
}

// Event handlers
export function onContentChanged(handler: (change: ContentChange) => void): void {
  if (!connection) return;

  connection.on('ContentChanged', (change: ContentChange) => {
    try {
      handler(change);
    } catch (error) {
      console.error('Error in content changed handler:', error);
    }
  });
}

export function onUserJoined(handler: (user: UserPresence) => void): void {
  if (!connection) return;

  connection.on('UserJoined', (user: UserPresence) => {
    try {
      handler(user);
    } catch (error) {
      console.error('Error in user joined handler:', error);
    }
  });
}

export function onUserLeft(handler: (data: { userId: string; documentId: string }) => void): void {
  if (!connection) return;

  connection.on('UserLeft', (data: { userId: string; documentId: string }) => {
    try {
      handler(data);
    } catch (error) {
      console.error('Error in user left handler:', error);
    }
  });
}

export function onCursorUpdated(handler: (update: CursorUpdate) => void): void {
  if (!connection) return;

  connection.on('CursorUpdated', (update: CursorUpdate) => {
    try {
      handler(update);
    } catch (error) {
      console.error('Error in cursor updated handler:', error);
    }
  });
}

export function onDocumentLocked(handler: (lockInfo: DocumentLockInfo) => void): void {
  if (!connection) return;

  connection.on('DocumentLocked', (lockInfo: DocumentLockInfo) => {
    try {
      handler(lockInfo);
    } catch (error) {
      console.error('Error in document locked handler:', error);
    }
  });
}

export function onDocumentUnlocked(handler: (data: { documentId: string }) => void): void {
  if (!connection) return;

  connection.on('DocumentUnlocked', (data: { documentId: string }) => {
    try {
      handler(data);
    } catch (error) {
      console.error('Error in document unlocked handler:', error);
    }
  });
}

// Connection utilities
export function getConnectionId(): string | null {
  return connection?.connectionId || null;
}

export function getConnectionState(): string {
  if (!connection) return 'Disconnected';
  
  switch (connection.state) {
    case signalR.HubConnectionState.Connected:
      return 'Connected';
    case signalR.HubConnectionState.Connecting:
      return 'Connecting';
    case signalR.HubConnectionState.Reconnecting:
      return 'Reconnecting';
    case signalR.HubConnectionState.Disconnecting:
      return 'Disconnecting';
    default:
      return 'Disconnected';
  }
}

export async function disconnect(): Promise<void> {
  if (!connection) return;

  try {
    // Remove all event handlers
    connection.off('ContentChanged');
    connection.off('UserJoined');
    connection.off('UserLeft');
    connection.off('CursorUpdated');
    connection.off('DocumentLocked');
    connection.off('DocumentUnlocked');

    await connection.stop();
    joinedDocuments.clear();
  } catch (error) {
    console.error('Error disconnecting from SignalR:', error);
    throw error;
  } finally {
    connection = null;
  }
}

// Export as named object for compatibility
export const signalRService = {
  connectToHub,
  disconnect,
  joinDocument,
  leaveDocument,
  sendContentChange,
  sendCursorUpdate,
  lockDocument,
  releaseDocumentLock,
  onContentChanged,
  onUserJoined,
  onUserLeft,
  onCursorUpdated,
  onDocumentLocked,
  onDocumentUnlocked,
  getConnectionId,
  getConnectionState
};