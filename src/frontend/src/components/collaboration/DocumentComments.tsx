import React, { useState, useRef } from 'react';
import { MessageCircle, Send, Reply, Edit, Trash2, Check, X, MoreVertical } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentComment } from '../../types/collaboration';

interface DocumentCommentsProps {
  documentId: string;
  comments: DocumentComment[];
  onAddComment: (comment: Omit<DocumentComment, 'id' | 'createdAt' | 'userId' | 'userName'>) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
  onReplyToComment: (parentCommentId: string, content: string) => void;
  className?: string;
}

interface CommentThread {
  comment: DocumentComment;
  replies: DocumentComment[];
}

export const DocumentComments: React.FC<DocumentCommentsProps> = ({
  documentId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  onReplyToComment,
  className = ''
}) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showResolved, setShowResolved] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  // Group comments into threads
  const commentThreads: CommentThread[] = React.useMemo(() => {
    const parentComments = comments.filter(c => !(c as any).parentId);
    return parentComments.map(comment => ({
      comment,
      replies: comments
        .filter(c => (c as any).parentId === comment.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }));
  }, [comments]);

  // Filter threads based on resolved status
  const filteredThreads = commentThreads.filter(thread => 
    showResolved || !thread.comment.isResolved
  );

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    onAddComment({
      documentId,
      content: newComment.trim(),
      position: 0, // For now, not position-specific
      isResolved: false
    });

    setNewComment('');
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingCommentId(commentId);
      setEditingContent(comment.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingCommentId && editingContent.trim()) {
      onEditComment(editingCommentId, editingContent.trim());
      setEditingCommentId(null);
      setEditingContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const handleReply = (commentId: string) => {
    setReplyingToId(commentId);
    setTimeout(() => {
      const replyInput = document.getElementById(`reply-input-${commentId}`);
      if (replyInput) {
        replyInput.focus();
      }
    }, 100);
  };

  const handleSendReply = (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    onReplyToComment(parentCommentId, replyContent.trim());
    setReplyingToId(null);
    setReplyContent('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      action();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  };

  const canEditComment = (comment: DocumentComment) => {
    return user?.id === comment.userId && !comment.isResolved;
  };

  const canDeleteComment = (comment: DocumentComment) => {
    return user?.id === comment.userId || (user as any)?.roles?.includes('Admin');
  };

  return (
    <div className={`document-comments h-full flex flex-col bg-white border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">
            Comments ({filteredThreads.length})
          </h3>
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`text-sm px-3 py-1 rounded transition-colors ${
            showResolved 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {showResolved ? 'Hide resolved' : 'Show resolved'}
        </button>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No comments yet</p>
            <p className="text-sm">Start a conversation about this document</p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <CommentThread
              key={thread.comment.id}
              thread={thread}
              currentUserId={user?.id || ''}
              editingCommentId={editingCommentId}
              editingContent={editingContent}
              replyingToId={replyingToId}
              replyContent={replyContent}
              onEdit={handleEditComment}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={onDeleteComment}
              onResolve={onResolveComment}
              onReply={handleReply}
              onSendReply={handleSendReply}
              onEditingContentChange={setEditingContent}
              onReplyContentChange={setReplyContent}
              formatDate={formatDate}
              canEdit={canEditComment}
              canDelete={canDeleteComment}
            />
          ))
        )}
      </div>

      {/* New comment input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleAddComment)}
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                Press Ctrl+Enter to send
              </span>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CommentThreadProps {
  thread: CommentThread;
  currentUserId: string;
  editingCommentId: string | null;
  editingContent: string;
  replyingToId: string | null;
  replyContent: string;
  onEdit: (commentId: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onReply: (commentId: string) => void;
  onSendReply: (parentCommentId: string) => void;
  onEditingContentChange: (content: string) => void;
  onReplyContentChange: (content: string) => void;
  formatDate: (date: string) => string;
  canEdit: (comment: DocumentComment) => boolean;
  canDelete: (comment: DocumentComment) => boolean;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  thread,
  currentUserId,
  editingCommentId,
  editingContent,
  replyingToId,
  replyContent,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onResolve,
  onReply,
  onSendReply,
  onEditingContentChange,
  onReplyContentChange,
  formatDate,
  canEdit,
  canDelete
}) => {
  const [showActions, setShowActions] = useState<string | null>(null);

  const renderComment = (comment: DocumentComment, isReply = false) => (
    <div
      key={comment.id}
      className={`comment ${isReply ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''} ${
        comment.isResolved ? 'opacity-60' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {comment.userName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{comment.userName}</span>
              <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              {comment.isResolved && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  Resolved
                </span>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowActions(showActions === comment.id ? null : comment.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              {showActions === comment.id && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                  {!comment.isResolved && (
                    <button
                      onClick={() => onReply(comment.id)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Reply className="w-4 h-4 inline mr-2" />
                      Reply
                    </button>
                  )}
                  {canEdit(comment) && (
                    <button
                      onClick={() => onEdit(comment.id)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                  )}
                  {canDelete(comment) && (
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                    >
                      <Trash2 className="w-4 h-4 inline mr-2" />
                      Delete
                    </button>
                  )}
                  {!comment.isResolved && currentUserId === comment.userId && (
                    <button
                      onClick={() => onResolve(comment.id)}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-green-600"
                    >
                      <Check className="w-4 h-4 inline mr-2" />
                      Resolve
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {editingCommentId === comment.id ? (
            <div className="mt-2">
              <textarea
                value={editingContent}
                onChange={(e) => onEditingContentChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={onSaveEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1">
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          )}

          {replyingToId === comment.id && (
            <div className="mt-3 ml-8">
              <div className="flex gap-2">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {currentUserId.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <textarea
                    id={`reply-input-${comment.id}`}
                    value={replyContent}
                    onChange={(e) => onReplyContentChange(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onSendReply(comment.id)}
                      disabled={!replyContent.trim()}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setShowActions(null);
                        onReplyContentChange('');
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="comment-thread space-y-3">
      {renderComment(thread.comment)}
      {thread.replies.map(reply => renderComment(reply, true))}
    </div>
  );
};