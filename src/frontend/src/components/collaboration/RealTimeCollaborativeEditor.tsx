/**
 * Real-Time Collaborative Editor with SignalR Integration
 * Sprint 6 - Advanced Collaboration Infrastructure
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Eye,
  Edit3,
  Clock,
  Check,
  AlertCircle,
  Wifi,
  WifiOff,
  Save,
  Lock,
  Unlock
} from 'lucide-react';

import { signalRService } from '../../services/signalRService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserPresence, 
  DocumentComment, 
  DocumentOperationRequest
} from '../../types/collaboration';

interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
  status: 'active' | 'idle' | 'away' | 'typing';
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  line: number;
  resolved: boolean;
  replies: Comment[];
}

interface DocumentLock {
  isLocked: boolean;
  lockedBy: string;
  lockedByName: string;
  lockedAt: Date;
  canEdit: boolean;
}

const RealTimeCollaborativeEditor: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  // Editor state
  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('Disconnected');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [documentLock, setDocumentLock] = useState<DocumentLock | null>(null);
  
  // UI state
  const [showComments, setShowComments] = useState(false);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Real-time state
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pendingOperations, setPendingOperations] = useState<DocumentOperationRequest[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lastContentRef = useRef<string>('');
  const operationIdCounter = useRef<number>(0);

  // Initialize SignalR connection
  useEffect(() => {
    if (!documentId || !user || !token) {
      navigate('/documents');
      return;
    }

    const initializeSignalR = async () => {
      try {
        await signalRService.connectToHub();
        
        // Setup event handlers
        signalRService.onContentChanged(handleOperationApplied);
        signalRService.onUserJoined(handleUserJoined);
        signalRService.onUserLeft(handleUserLeft);
        signalRService.onCursorUpdated(handleCursorUpdate);
        signalRService.onDocumentLocked(handleDocumentLocked);
        signalRService.onDocumentUnlocked(handleDocumentUnlocked);
        
        // Join the document room
        await signalRService.joinDocument(documentId);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
        setIsConnected(false);
      }
    };

    initializeSignalR();

    return () => {
      if (documentId) {
        signalRService.leaveDocument(documentId);
      }
      signalRService.disconnect();
    };
  }, [documentId, user, token, navigate]);

  // SignalR event handlers
  const handleUserJoined = useCallback((userInfo: any) => {
    console.log('User joined:', userInfo);
    setActiveUsers(prev => [
      ...prev.filter(u => u.id !== userInfo.UserId),
      {
        id: userInfo.UserId,
        name: userInfo.UserName,
        avatar: userInfo.UserName.substring(0, 2).toUpperCase(),
        color: `bg-${['blue', 'green', 'purple', 'orange', 'pink'][Math.floor(Math.random() * 5)]}-500`,
        status: 'active'
      }
    ]);
  }, []);

  const handleUserLeft = useCallback((userInfo: any) => {
    console.log('User left:', userInfo);
    setActiveUsers(prev => prev.filter(u => u.id !== userInfo.UserId));
  }, []);

  const handleActiveUsers = useCallback((users: UserPresence[]) => {
    console.log('Active users:', users);
    setActiveUsers(users.map(user => ({
      id: user.userId,
      name: user.userName || 'Unknown User',
      avatar: (user.userName || 'U').substring(0, 2).toUpperCase(),
      color: user.color || 'bg-gray-500',
      status: user.status || 'active'
    })));
  }, []);

  const handleLockStatus = useCallback((lockInfo: any) => {
    console.log('Lock status:', lockInfo);
    if (lockInfo) {
      setDocumentLock({
        isLocked: true,
        lockedBy: lockInfo.LockedBy,
        lockedByName: lockInfo.LockedByName,
        lockedAt: new Date(lockInfo.LockedAt),
        canEdit: lockInfo.LockedBy === user?.id
      });
    } else {
      setDocumentLock(null);
    }
  }, [user?.id]);

  const handleDocumentLocked = useCallback((lockInfo: any) => {
    console.log('Document locked:', lockInfo);
    handleLockStatus(lockInfo);
  }, [handleLockStatus]);

  const handleDocumentUnlocked = useCallback((info: any) => {
    console.log('Document unlocked:', info);
    setDocumentLock(null);
  }, []);

  const handlePresenceUpdate = useCallback((presence: UserPresence) => {
    setActiveUsers(prev => prev.map(user => 
      user.id === presence.userId 
        ? { ...user, status: presence.status || 'active' }
        : user
    ));
  }, []);

  const handleOperationApplied = useCallback((operation: any) => {
    console.log('Operation applied:', operation);
    
    // Apply operation to content if it's not from current user
    if (operation.UserId !== user?.id) {
      applyOperationToContent(operation);
    }
    
    // Remove from pending operations if acknowledged
    setPendingOperations(prev => 
      prev.filter(op => op.id !== operation.OperationId)
    );
  }, [user?.id]);

  const handleOperationAcknowledged = useCallback((ack: any) => {
    console.log('Operation acknowledged:', ack);
    setPendingOperations(prev => 
      prev.filter(op => op.id !== ack.OperationId)
    );
  }, []);

  const handleOperationRejected = useCallback((rejection: any) => {
    console.log('Operation rejected:', rejection);
    setPendingOperations(prev => 
      prev.filter(op => op.id !== rejection.OperationId)
    );
    
    // Show error to user
    console.error('Operation rejected:', rejection.Error);
  }, []);

  const handleCursorUpdate = useCallback((cursor: any) => {
    setActiveUsers(prev => prev.map(user => 
      user.id === cursor.UserId 
        ? { ...user, cursor: { line: cursor.Position || 0, column: 0 } }
        : user
    ));
  }, []);

  const handleTypingStatusUpdate = useCallback((status: any) => {
    setActiveUsers(prev => prev.map(user => 
      user.id === status.UserId 
        ? { ...user, status: status.IsTyping ? 'typing' : 'active' }
        : user
    ));
  }, []);

  const handleNewComment = useCallback((comment: DocumentComment) => {
    console.log('New comment:', comment);
    setComments(prev => [...prev, {
      id: comment.id || Date.now().toString(),
      userId: comment.userId,
      userName: comment.userName,
      content: comment.content,
      timestamp: new Date(comment.createdAt || Date.now()),
      line: comment.line || 0,
      resolved: false,
      replies: []
    }]);
  }, []);

  const handleSignalRError = useCallback((error: string) => {
    console.error('SignalR error:', error);
    // Show error toast or notification
  }, []);

  // Content change handling
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldContent = lastContentRef.current;
    
    setContent(newContent);
    lastContentRef.current = newContent;

    // Generate operation for change
    if (documentId && user && isConnected && documentLock?.canEdit) {
      const operation = generateOperation(oldContent, newContent);
      if (operation) {
        sendOperation(operation);
      }
    }

    // Send typing indicator
    if (documentId && isConnected) {
      signalRService.sendCursorUpdate(documentId, {
        userId: user?.id || '',
        userName: user?.email || '',
        position: 0,
        timestamp: new Date(),
        isTyping: true
      });
      
      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        signalRService.sendCursorUpdate(documentId, {
          userId: user?.id || '',
          userName: user?.email || '',
          position: 0,
          timestamp: new Date(),
          isTyping: false
        });
      }, 1000);
      
      setTypingTimeout(timeout);
    }
  }, [documentId, user, isConnected, documentLock?.canEdit, typingTimeout]);

  // Generate operational transformation operation
  const generateOperation = (oldContent: string, newContent: string): DocumentOperationRequest | null => {
    // Simple diff algorithm - in production, use a proper OT library
    if (oldContent === newContent) return null;

    operationIdCounter.current++;
    
    // Find the first difference
    let i = 0;
    while (i < oldContent.length && i < newContent.length && oldContent[i] === newContent[i]) {
      i++;
    }

    // Determine operation type
    if (newContent.length > oldContent.length) {
      // Insert operation
      const insertedText = newContent.substring(i, i + (newContent.length - oldContent.length));
      return {
        id: operationIdCounter.current.toString(),
        operationType: 'insert',
        position: i,
        content: insertedText,
        length: insertedText.length,
        version: 0, // Server will set actual version
        userId: user!.id,
        timestamp: new Date()
      };
    } else if (newContent.length < oldContent.length) {
      // Delete operation
      return {
        id: operationIdCounter.current.toString(),
        operationType: 'delete',
        position: i,
        content: '',
        length: oldContent.length - newContent.length,
        version: 0,
        userId: user!.id,
        timestamp: new Date()
      };
    } else {
      // Replace operation
      const replacedText = newContent.substring(i);
      return {
        id: operationIdCounter.current.toString(),
        operationType: 'replace',
        position: i,
        content: replacedText,
        length: replacedText.length,
        version: 0,
        userId: user!.id,
        timestamp: new Date()
      };
    }
  };

  // Send operation to SignalR
  const sendOperation = async (operation: DocumentOperationRequest) => {
    if (!documentId) return;

    try {
      setPendingOperations(prev => [...prev, operation]);
      await signalRService.sendContentChange(documentId, {
        operation: 'replace' as const,
        startPosition: operation.position,
        endPosition: operation.position + (operation.content?.length || 0),
        content: operation.content || '',
        timestamp: new Date(),
        userId: user?.id || '',
        userName: user?.email || '',
        version: 1
      });
    } catch (error) {
      console.error('Failed to send operation:', error);
      setPendingOperations(prev => prev.filter(op => op.id !== operation.id));
    }
  };

  // Apply operation to content
  const applyOperationToContent = (operation: any) => {
    const { Operation } = operation;
    if (!Operation) return;

    setContent(prevContent => {
      let newContent = prevContent;
      
      switch (Operation.OperationType) {
        case 'insert':
          newContent = prevContent.slice(0, Operation.Position) + 
                      Operation.Content + 
                      prevContent.slice(Operation.Position);
          break;
        case 'delete':
          newContent = prevContent.slice(0, Operation.Position) + 
                      prevContent.slice(Operation.Position + Operation.Length);
          break;
        case 'replace':
          newContent = prevContent.slice(0, Operation.Position) + 
                      Operation.Content + 
                      prevContent.slice(Operation.Position + Operation.Length);
          break;
      }
      
      lastContentRef.current = newContent;
      return newContent;
    });
  };

  // Document locking functions
  const requestLock = async () => {
    if (!documentId) return;
    
    try {
      await signalRService.lockDocument(documentId);
    } catch (error) {
      console.error('Failed to request lock:', error);
    }
  };

  const releaseLock = async () => {
    if (!documentId) return;
    
    try {
      await signalRService.releaseDocumentLock(documentId);
    } catch (error) {
      console.error('Failed to release lock:', error);
    }
  };

  // Other UI handlers
  const handleTextSelection = () => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      if (start !== end) {
        setSelectedText({ start, end });
      } else {
        setSelectedText(null);
      }
    }
  };

  const addComment = async () => {
    if (!newCommentContent.trim() || !selectedText || !documentId || !user) return;

    const comment: DocumentComment = {
      id: Date.now().toString(),
      documentId: documentId,
      userId: user.id,
      userName: user.fullName || 'Unknown User',
      content: newCommentContent,
      createdAt: new Date(),
      line: Math.floor(selectedText.start / 50), // Approximate line number
      position: selectedText.start,
      isResolved: false
    };

    try {
      // TODO: Implement sendComment in signalRService
      // await signalRService.sendComment(documentId, comment);
      console.log('Comment feature not yet implemented:', comment);
      setNewCommentContent('');
      setSelectedText(null);
    } catch (error) {
      console.error('Failed to send comment:', error);
    }
  };

  const resolveComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: true }
        : comment
    ));
  };

  const saveDocument = async () => {
    if (!documentId || isSaving) return;

    setIsSaving(true);
    try {
      // Implementation for saving document
      // This would call your document service API
      console.log('Saving document...', content);
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Document saved successfully');
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getUserStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Eye className="h-3 w-3 text-green-500" />;
      case 'typing': return <Edit3 className="h-3 w-3 text-blue-500 animate-pulse" />;
      case 'idle': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'away': return <Clock className="h-3 w-3 text-gray-400" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Collaboration Controls */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {connectionState}
              </span>
            </div>

            {/* Active Users */}
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-600" />
              <div className="flex -space-x-2">
                {activeUsers.map((user) => (
                  <div key={user.id} className="relative">
                    <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white`}>
                      {user.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getUserStatusIcon(user.status)}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {activeUsers.length} users online
              </span>
            </div>

            {/* Document Lock Status */}
            {documentLock && (
              <div className="flex items-center space-x-2 text-sm">
                {documentLock.canEdit ? (
                  <div className="flex items-center text-green-600">
                    <Unlock className="h-4 w-4 mr-1" />
                    <span>You have edit access</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Locked by {documentLock.lockedByName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Save Button */}
            <button
              onClick={saveDocument}
              disabled={isSaving}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isSaving 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Save className={`h-4 w-4 mr-2 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            {/* Lock/Unlock Button */}
            {documentLock ? (
              documentLock.canEdit ? (
                <button
                  onClick={releaseLock}
                  className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Release Lock
                </button>
              ) : (
                <div className="flex items-center px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg">
                  <Lock className="h-4 w-4 mr-2" />
                  Read Only
                </div>
              )
            ) : (
              <button
                onClick={requestLock}
                className="flex items-center px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Lock className="h-4 w-4 mr-2" />
                Request Edit
              </button>
            )}

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({comments.filter(c => !c.resolved).length})
            </button>
          </div>
        </div>

        {/* Pending Operations Indicator */}
        {pendingOperations.length > 0 && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-2">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                {pendingOperations.length} operation(s) pending...
              </span>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 p-4">
          <div className="relative h-full">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleTextSelection}
              disabled={documentLock ? !documentLock.canEdit : false}
              placeholder={
                documentLock && !documentLock.canEdit 
                  ? "Document is locked for editing. Request edit access to make changes."
                  : "Start typing your document... Multiple users can edit simultaneously."
              }
              className={`w-full h-full p-4 border rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                documentLock && !documentLock.canEdit 
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                  : 'border-gray-300'
              }`}
            />
            
            {/* User Cursors */}
            {activeUsers.map((activeUser) => (
              activeUser.cursor && activeUser.id !== user?.id && (
                <div
                  key={activeUser.id}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${activeUser.cursor.line * 20 + 20}px`,
                    left: `${activeUser.cursor.column * 8 + 20}px`
                  }}
                >
                  <div className={`w-0.5 h-5 ${activeUser.color.replace('bg-', 'bg-')} animate-pulse`}></div>
                  <div className={`px-2 py-1 ${activeUser.color} text-white text-xs rounded mt-1 whitespace-nowrap`}>
                    {activeUser.name}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Comments Sidebar */}
      {showComments && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Comments & Discussion</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className={`border rounded-lg p-3 ${comment.resolved ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                      {comment.userName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                      Line {comment.line}
                    </span>
                  </div>
                  {!comment.resolved && (
                    <button
                      onClick={() => resolveComment(comment.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                
                <div className="text-xs text-gray-500">
                  {comment.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          {selectedText && (
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Adding comment to selected text
                </div>
                <textarea
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  placeholder="Add your comment..."
                  className="w-full h-20 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedText(null)}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addComment}
                    disabled={!newCommentContent.trim()}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      newCommentContent.trim()
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealTimeCollaborativeEditor;