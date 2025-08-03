/**
 * SignalR Service for Real-time Collaboration
 * Sprint 6 - Advanced Collaboration Infrastructure
 */

import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { 
  UserPresence, 
  DocumentComment, 
  DocumentOperationRequest,
  CursorPosition
} from '../types/collaboration';

interface SignalRCallbacks {
  onUserJoined?: (user: any) => void;
  onUserLeft?: (user: any) => void;
  onActiveUsers?: (users: UserPresence[]) => void;
  onLockStatus?: (lockInfo: any) => void;
  onDocumentLocked?: (lockInfo: any) => void;
  onDocumentUnlocked?: (info: any) => void;
  onPresenceUpdate?: (presence: UserPresence) => void;
  onOperationApplied?: (operation: any) => void;
  onOperationAcknowledged?: (ack: any) => void;
  onOperationRejected?: (rejection: any) => void;
  onCursorUpdate?: (cursor: any) => void;
  onTypingStatusUpdate?: (status: any) => void;
  onNewComment?: (comment: DocumentComment) => void;
  onError?: (error: string) => void;
  onConnectionStateChanged?: (state: string) => void;
}

class SignalRService {
  private connection: HubConnection | null = null;
  private callbacks: SignalRCallbacks = {};
  private currentDocumentId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  /**
   * Initialize SignalR connection
   */
  async initialize(accessToken: string, callbacks: SignalRCallbacks = {}): Promise<void> {
    try {
      this.callbacks = callbacks;

      // Build the connection
      this.connection = new HubConnectionBuilder()
        .withUrl('/hubs/collaboration', {
          accessTokenFactory: () => accessToken,
          transport: 1 | 2, // WebSockets and Server-Sent Events
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) {
              return 2000;
            } else if (retryContext.previousRetryCount < 5) {
              return 5000;
            } else {
              return 10000;
            }
          }
        })
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.setupEventHandlers();

      // Start the connection
      await this.connection.start();
      console.log('[SignalR] Connected successfully');
      
      this.reconnectAttempts = 0;
      this.callbacks.onConnectionStateChanged?.('Connected');
    } catch (error) {
      console.error('[SignalR] Connection failed:', error);
      this.callbacks.onError?.('Failed to connect to collaboration hub');
      
      // Attempt to reconnect
      this.scheduleReconnect();
      throw error;
    }
  }

  /**
   * Set up all SignalR event handlers
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Connection state events
    this.connection.onclose(() => {
      console.log('[SignalR] Connection closed');
      this.callbacks.onConnectionStateChanged?.('Disconnected');
      this.scheduleReconnect();
    });

    this.connection.onreconnecting(() => {
      console.log('[SignalR] Reconnecting...');
      this.callbacks.onConnectionStateChanged?.('Reconnecting');
    });

    this.connection.onreconnected(() => {
      console.log('[SignalR] Reconnected');
      this.callbacks.onConnectionStateChanged?.('Connected');
      this.reconnectAttempts = 0;
      
      // Rejoin current document if any
      if (this.currentDocumentId) {
        this.joinDocument(this.currentDocumentId);
      }
    });

    // User presence events
    this.connection.on('UserJoined', (user) => {
      console.log('[SignalR] User joined:', user);
      this.callbacks.onUserJoined?.(user);
    });

    this.connection.on('UserLeft', (user) => {
      console.log('[SignalR] User left:', user);
      this.callbacks.onUserLeft?.(user);
    });

    this.connection.on('ActiveUsers', (users) => {
      console.log('[SignalR] Active users:', users);
      this.callbacks.onActiveUsers?.(users);
    });

    this.connection.on('PresenceUpdate', (presence) => {
      this.callbacks.onPresenceUpdate?.(presence);
    });

    // Document locking events
    this.connection.on('LockStatus', (lockInfo) => {
      console.log('[SignalR] Lock status:', lockInfo);
      this.callbacks.onLockStatus?.(lockInfo);
    });

    this.connection.on('DocumentLocked', (lockInfo) => {
      console.log('[SignalR] Document locked:', lockInfo);
      this.callbacks.onDocumentLocked?.(lockInfo);
    });

    this.connection.on('DocumentUnlocked', (info) => {
      console.log('[SignalR] Document unlocked:', info);
      this.callbacks.onDocumentUnlocked?.(info);
    });

    this.connection.on('LockRequestFailed', (failure) => {
      console.log('[SignalR] Lock request failed:', failure);
      this.callbacks.onError?.(failure.Error || 'Failed to acquire document lock');
    });

    // Operational transformation events
    this.connection.on('OperationApplied', (operation) => {
      console.log('[SignalR] Operation applied:', operation);
      this.callbacks.onOperationApplied?.(operation);
    });

    this.connection.on('OperationAcknowledged', (ack) => {
      console.log('[SignalR] Operation acknowledged:', ack);
      this.callbacks.onOperationAcknowledged?.(ack);
    });

    this.connection.on('OperationRejected', (rejection) => {
      console.log('[SignalR] Operation rejected:', rejection);
      this.callbacks.onOperationRejected?.(rejection);
    });

    // Cursor and typing events
    this.connection.on('CursorUpdate', (cursor) => {
      this.callbacks.onCursorUpdate?.(cursor);
    });

    this.connection.on('TypingStatusUpdate', (status) => {
      this.callbacks.onTypingStatusUpdate?.(status);
    });

    // Comment events
    this.connection.on('NewComment', (comment) => {
      console.log('[SignalR] New comment:', comment);
      this.callbacks.onNewComment?.(comment);
    });

    // Error events
    this.connection.on('Error', (error) => {
      console.error('[SignalR] Server error:', error);
      this.callbacks.onError?.(error);
    });
  }

  /**
   * Join a document collaboration session
   */
  async joinDocument(documentId: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR connection not established');
    }

    try {
      this.currentDocumentId = documentId;
      await this.connection.invoke('JoinDocument', documentId);
      console.log(`[SignalR] Joined document: ${documentId}`);
    } catch (error) {
      console.error('[SignalR] Failed to join document:', error);
      throw error;
    }
  }

  /**
   * Leave a document collaboration session
   */
  async leaveDocument(documentId: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('LeaveDocument', documentId);
      console.log(`[SignalR] Left document: ${documentId}`);
      
      if (this.currentDocumentId === documentId) {
        this.currentDocumentId = null;
      }
    } catch (error) {
      console.error('[SignalR] Failed to leave document:', error);
    }
  }

  /**
   * Request exclusive lock on a document
   */
  async requestLock(documentId: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('RequestLock', documentId);
    } catch (error) {
      console.error('[SignalR] Failed to request lock:', error);
      throw error;
    }
  }

  /**
   * Release lock on a document
   */
  async releaseLock(documentId: string): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('ReleaseLock', documentId);
    } catch (error) {
      console.error('[SignalR] Failed to release lock:', error);
    }
  }

  /**
   * Update user presence information
   */
  async updatePresence(documentId: string, presence: UserPresence): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('UpdatePresence', documentId, presence);
    } catch (error) {
      console.error('[SignalR] Failed to update presence:', error);
    }
  }

  /**
   * Apply operational transformation operation
   */
  async applyOperation(documentId: string, operation: DocumentOperationRequest): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('ApplyOperation', documentId, operation);
    } catch (error) {
      console.error('[SignalR] Failed to apply operation:', error);
      throw error;
    }
  }

  /**
   * Update cursor position
   */
  async updateCursor(documentId: string, cursorPosition: CursorPosition): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('UpdateCursor', documentId, cursorPosition);
    } catch (error) {
      console.error('[SignalR] Failed to update cursor:', error);
    }
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(documentId: string, isTyping: boolean): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      return;
    }

    try {
      await this.connection.invoke('UpdateTypingStatus', documentId, isTyping);
    } catch (error) {
      console.error('[SignalR] Failed to update typing status:', error);
    }
  }

  /**
   * Send a comment
   */
  async sendComment(documentId: string, comment: DocumentComment): Promise<void> {
    if (!this.connection || this.connection.state !== 'Connected') {
      throw new Error('SignalR connection not established');
    }

    try {
      await this.connection.invoke('SendComment', documentId, comment);
    } catch (error) {
      console.error('[SignalR] Failed to send comment:', error);
      throw error;
    }
  }

  /**
   * Get connection state
   */
  getConnectionState(): string {
    return this.connection?.state || 'Disconnected';
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SignalR] Max reconnect attempts reached');
      this.callbacks.onError?.('Connection lost and could not be restored');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[SignalR] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.connection?.state === 'Disconnected') {
        this.connection.start().catch((error) => {
          console.error('[SignalR] Reconnect failed:', error);
          this.scheduleReconnect();
        });
      }
    }, this.reconnectInterval);
  }

  /**
   * Update callbacks
   */
  updateCallbacks(callbacks: SignalRCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        if (this.currentDocumentId) {
          await this.leaveDocument(this.currentDocumentId);
        }
        
        await this.connection.stop();
        console.log('[SignalR] Disconnected');
      } catch (error) {
        console.error('[SignalR] Error during disconnect:', error);
      } finally {
        this.connection = null;
        this.currentDocumentId = null;
        this.reconnectAttempts = 0;
        this.callbacks.onConnectionStateChanged?.('Disconnected');
      }
    }
  }
}

// Export singleton instance
export const signalRService = new SignalRService();
export default signalRService;