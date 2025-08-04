import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../pantry/Alert';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  onSave: (content: string) => Promise<void>;
  className?: string;
}

interface UserPresence {
  userId: string;
  userName: string;
  status: 'active' | 'idle' | 'away' | 'typing';
  cursorPosition?: {
    position: number;
    selectionStart: number;
    selectionEnd: number;
  };
  color: string;
  lastSeen: string;
}

interface DocumentOperation {
  id: string;
  operationType: 'insert' | 'delete' | 'retain' | 'format';
  position: number;
  length?: number;
  content?: string;
  attributes?: Record<string, any>;
  version: number;
  timestamp: string;
}

// Operation result interface for future use
// interface OperationResult {
//   success: boolean;
//   errorMessage?: string;
//   transformedOperation?: DocumentOperation;
//   documentVersion: number;
//   requiredVersion?: number;
// }

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  initialContent,
  onContentChange,
  onSave,
  className = ''
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [documentVersion, setDocumentVersion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState<DocumentOperation[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastCursorPositionRef = useRef<number>(0);

  // Initialize SignalR connection
  useEffect(() => {
    if (!user || !documentId) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl('/collaboration', {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);

    return () => {
      newConnection?.stop();
    };
  }, [user, documentId]);

  // Set up SignalR event handlers
  useEffect(() => {
    if (!connection) return;

    const startConnection = async () => {
      try {
        await connection.start();
        setIsConnected(true);
        setConnectionError(null);
        
        // Join the document collaboration session
        await connection.invoke('JoinDocument', documentId);
      } catch (error) {
        console.error('Error starting SignalR connection:', error);
        setConnectionError('Failed to connect to collaboration server');
        setIsConnected(false);
      }
    };

    // Event handlers
    connection.on('ActiveUsers', (users: UserPresence[]) => {
      setActiveUsers(users);
    });

    connection.on('UserJoined', (userInfo: UserPresence) => {
      setActiveUsers(prev => [...prev.filter(u => u.userId !== userInfo.userId), userInfo]);
    });

    connection.on('UserLeft', (userInfo: { userId: string }) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== userInfo.userId));
    });

    connection.on('OperationApplied', (operationData: {
      userId: string;
      userName: string;
      operation: DocumentOperation;
      version: number;
      timestamp: string;
    }) => {
      if (operationData.userId !== user?.id) {
        applyRemoteOperation(operationData.operation);
        setDocumentVersion(operationData.version);
      }
    });

    connection.on('OperationAcknowledged', (ackData: {
      operationId: string;
      version: number;
      success: boolean;
    }) => {
      if (ackData.success) {
        setPendingOperations(prev => prev.filter(op => op.id !== ackData.operationId));
        setDocumentVersion(ackData.version);
      }
    });

    connection.on('OperationRejected', (rejectData: {
      operationId: string;
      error: string;
      requiredVersion?: number;
    }) => {
      console.error('Operation rejected:', rejectData.error);
      // Handle operation rejection - might need to resync
      if (rejectData.requiredVersion) {
        setDocumentVersion(rejectData.requiredVersion);
      }
    });

    connection.on('CursorUpdate', (cursorData: {
      userId: string;
      userName: string;
      position: number;
      selectionStart?: number;
      selectionEnd?: number;
      timestamp: string;
    }) => {
      setActiveUsers(prev => prev.map(user => 
        user.userId === cursorData.userId 
          ? { 
              ...user, 
              cursorPosition: {
                position: cursorData.position,
                selectionStart: cursorData.selectionStart ?? cursorData.position,
                selectionEnd: cursorData.selectionEnd ?? cursorData.position
              }
            }
          : user
      ));
    });

    connection.on('TypingStatusUpdate', (typingData: {
      userId: string;
      userName: string;
      isTyping: boolean;
      timestamp: string;
    }) => {
      setActiveUsers(prev => prev.map(user => 
        user.userId === typingData.userId 
          ? { ...user, status: typingData.isTyping ? 'typing' : 'active' }
          : user
      ));
    });

    connection.on('Error', (error: string) => {
      console.error('Collaboration error:', error);
      setConnectionError(error);
    });

    connection.onclose(() => {
      setIsConnected(false);
      setConnectionError('Connection lost. Attempting to reconnect...');
    });

    connection.onreconnected(() => {
      setIsConnected(true);
      setConnectionError(null);
      // Rejoin the document session
      connection.invoke('JoinDocument', documentId);
    });

    startConnection();

    return () => {
      connection.off('ActiveUsers');
      connection.off('UserJoined');
      connection.off('UserLeft');
      connection.off('OperationApplied');
      connection.off('OperationAcknowledged');
      connection.off('OperationRejected');
      connection.off('CursorUpdate');
      connection.off('TypingStatusUpdate');
      connection.off('Error');
    };
  }, [connection, documentId, user]);

  // Apply remote operation to local content
  const applyRemoteOperation = useCallback((operation: DocumentOperation) => {
    setContent(prevContent => {
      let newContent = prevContent;
      
      switch (operation.operationType) {
        case 'insert':
          if (operation.content) {
            newContent = 
              prevContent.slice(0, operation.position) + 
              operation.content + 
              prevContent.slice(operation.position);
          }
          break;
        case 'delete':
          if (operation.length) {
            newContent = 
              prevContent.slice(0, operation.position) + 
              prevContent.slice(operation.position + operation.length);
          }
          break;
        // Add more operation types as needed
      }
      
      return newContent;
    });
  }, []);

  // Send operation to server
  const sendOperation = useCallback(async (operation: DocumentOperation) => {
    if (!connection || !isConnected) return;

    try {
      setPendingOperations(prev => [...prev, operation]);
      await connection.invoke('ApplyOperation', documentId, operation);
    } catch (error) {
      console.error('Error sending operation:', error);
      setPendingOperations(prev => prev.filter(op => op.id !== operation.id));
    }
  }, [connection, isConnected, documentId]);

  // Handle text input changes
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    const cursorPosition = event.target.selectionStart;
    
    // Calculate the operation
    const oldContent = content;
    const operation = calculateOperation(oldContent, newContent, cursorPosition);
    
    if (operation) {
      operation.version = documentVersion;
      setContent(newContent);
      sendOperation(operation);
    }
    
    onContentChange(newContent);
    
    // Update typing status
    if (!isTyping) {
      setIsTyping(true);
      connection?.invoke('UpdateTypingStatus', documentId, true);
    }
    
    // Clear existing typing timeout and set new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      connection?.invoke('UpdateTypingStatus', documentId, false);
    }, 1000);

    // Auto-save after delay
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(newContent);
    }, 2000);
  }, [content, documentVersion, sendOperation, onContentChange, connection, documentId, isTyping]);

  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (!connection || !isConnected || !editorRef.current) return;

    const selectionStart = editorRef.current.selectionStart;
    const selectionEnd = editorRef.current.selectionEnd;
    
    if (selectionStart !== lastCursorPositionRef.current) {
      lastCursorPositionRef.current = selectionStart;
      
      connection.invoke('UpdateCursor', documentId, {
        position: selectionStart,
        selectionStart: selectionStart,
        selectionEnd: selectionEnd
      });
    }
  }, [connection, isConnected, documentId]);

  // Calculate operation between two content strings
  const calculateOperation = (oldContent: string, newContent: string, cursorPosition: number): DocumentOperation | null => {
    if (oldContent === newContent) return null;

    // Simple diff algorithm - in production, use a proper diff library
    const operation: DocumentOperation = {
      id: Math.random().toString(36).substring(2),
      operationType: 'insert',
      position: 0,
      version: documentVersion,
      timestamp: new Date().toISOString()
    };

    if (newContent.length > oldContent.length) {
      // Insert operation
      const insertedText = newContent.slice(cursorPosition - (newContent.length - oldContent.length), cursorPosition);
      operation.operationType = 'insert';
      operation.position = cursorPosition - insertedText.length;
      operation.content = insertedText;
    } else if (newContent.length < oldContent.length) {
      // Delete operation
      operation.operationType = 'delete';
      operation.position = cursorPosition;
      operation.length = oldContent.length - newContent.length;
    }

    return operation;
  };

  // Handle save
  const handleSave = useCallback(async (contentToSave: string) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onSave(contentToSave);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onSave]);

  // Manual save
  const handleManualSave = useCallback(() => {
    handleSave(content);
  }, [content, handleSave]);

  return (
    <div className={`collaborative-editor ${className}`}>
      {/* Header with status and users */}
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {pendingOperations.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-yellow-600">
              <AlertCircle className="w-4 h-4" />
              {pendingOperations.length} pending
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active users */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 5).map(user => (
                <div
                  key={user.userId}
                  className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                  style={{ backgroundColor: user.color }}
                  title={`${user.userName} - ${user.status}`}
                >
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 5 && (
                <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-xs font-medium text-white">
                  +{activeUsers.length - 5}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-500">{activeUsers.length} online</span>
          </div>
          
          {/* Save button */}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Connection error */}
      {connectionError && (
        <Alert className="m-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onClick={handleSelectionChange}
          className="w-full h-96 p-4 font-mono text-sm border-0 resize-none focus:outline-none"
          style={{ minHeight: '400px' }}
          placeholder="Start typing to collaborate in real-time..."
        />
        
        {/* Cursor overlays for other users would go here */}
        {/* This would require absolute positioning based on character positions */}
      </div>

      {/* Typing indicators */}
      {activeUsers.some(user => user.status === 'typing') && (
        <div className="p-2 text-sm text-gray-500 border-t bg-gray-50">
          {activeUsers
            .filter(user => user.status === 'typing')
            .map(user => user.userName)
            .join(', ')} {activeUsers.filter(user => user.status === 'typing').length === 1 ? 'is' : 'are'} typing...
        </div>
      )}
    </div>
  );
};