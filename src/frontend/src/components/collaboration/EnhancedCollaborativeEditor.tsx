import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff,
  Eye,
  Edit3,
  Clock,
  Check,
  AlertCircle,
  Volume2
} from 'lucide-react';

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

interface ConflictResolution {
  id: string;
  type: 'merge' | 'overwrite' | 'manual';
  description: string;
  yourChange: string;
  theirChange: string;
  resolved: boolean;
}

const EnhancedCollaborativeEditor: React.FC = () => {
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [selectedText, setSelectedText] = useState<{ start: number; end: number } | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock active users
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        avatar: 'SJ',
        color: 'bg-blue-500',
        status: 'active',
        cursor: { line: 5, column: 12 }
      },
      {
        id: '2', 
        name: 'Michael Chen',
        avatar: 'MC',
        color: 'bg-green-500',
        status: 'typing',
        cursor: { line: 8, column: 25 }
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        avatar: 'ER',
        color: 'bg-purple-500', 
        status: 'idle',
        cursor: { line: 12, column: 8 }
      }
    ];

    const mockComments: Comment[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Sarah Johnson',
        content: 'Should we add more specific language about data retention here?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        line: 5,
        resolved: false,
        replies: [
          {
            id: '1-1',
            userId: '2',
            userName: 'Michael Chen',
            content: 'Agreed, I think we need to specify the 7-year requirement.',
            timestamp: new Date(Date.now() - 1000 * 60 * 3),
            line: 5,
            resolved: false,
            replies: []
          }
        ]
      },
      {
        id: '2',
        userId: '3',
        userName: 'Emily Rodriguez',
        content: 'This clause looks good to me.',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        line: 12,
        resolved: true,
        replies: []
      }
    ];

    const mockConflicts: ConflictResolution[] = [
      {
        id: '1',
        type: 'merge',
        description: 'Conflicting changes in paragraph 3',
        yourChange: 'The agreement shall be valid for 12 months',
        theirChange: 'The agreement shall be valid for 24 months',
        resolved: false
      }
    ];

    setActiveUsers(mockUsers);
    setComments(mockComments);
    setConflicts(mockConflicts);
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Simulate real-time collaboration by broadcasting changes
    // In a real app, this would use WebSocket or similar
  };

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

  const addComment = () => {
    if (!newCommentContent.trim() || !selectedText) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content: newCommentContent,
      timestamp: new Date(),
      line: Math.floor(selectedText.start / 50), // Approximate line number
      resolved: false,
      replies: []
    };

    setComments([...comments, newComment]);
    setNewCommentContent('');
    setSelectedText(null);
  };

  const resolveComment = (commentId: string) => {
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: true }
        : comment
    ));
  };

  // Conflict resolution functionality (simplified for demo)
  // const resolveConflict = (conflictId: string, resolution: 'yours' | 'theirs' | 'manual') => {
  //   setConflicts(conflicts.map(conflict =>
  //     conflict.id === conflictId
  //       ? { ...conflict, resolved: true }
  //       : conflict
  //   ));
  // };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsVideoCallActive(true);
    } catch (error) {
      console.error('Error starting video call:', error);
    }
  };

  const endVideoCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsVideoCallActive(false);
  };

  const toggleAudio = () => {
    setIsAudioMuted(!isAudioMuted);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isAudioMuted;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoMuted(!isVideoMuted);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoMuted;
      });
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // In a real app, you'd use MediaRecorder to capture audio
      setTimeout(() => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        // Simulate transcription result
        const transcription = "This clause needs to be reviewed for compliance with GDPR requirements.";
        setContent(content + "\n\n[Voice Note Transcription]: " + transcription);
      }, 3000);
    } catch (error) {
      console.error('Error starting voice recording:', error);
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

            {/* Collaboration Status */}
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live collaboration active</span>
            </div>
          </div>

          {/* Video/Audio Controls */}
          <div className="flex items-center space-x-2">
            {!isVideoCallActive ? (
              <button
                onClick={startVideoCall}
                className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Video className="h-4 w-4 mr-2" />
                Start Call
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleAudio}
                  className={`p-2 rounded-lg transition-colors ${
                    isAudioMuted 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  onClick={toggleVideo}
                  className={`p-2 rounded-lg transition-colors ${
                    isVideoMuted 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isVideoMuted ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>
                <button
                  onClick={endVideoCall}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <PhoneOff className="h-4 w-4" />
                </button>
              </div>
            )}

            <button
              onClick={startVoiceRecording}
              disabled={isRecording}
              className={`flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                isRecording 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              <Volume2 className={`h-4 w-4 mr-2 ${isRecording ? 'animate-pulse' : ''}`} />
              {isRecording ? 'Recording...' : 'Voice Note'}
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments ({comments.filter(c => !c.resolved).length})
            </button>
          </div>
        </div>

        {/* Conflict Resolution Banner */}
        {conflicts.some(c => !c.resolved) && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  {conflicts.filter(c => !c.resolved).length} merge conflict(s) need resolution
                </span>
              </div>
              <button className="text-sm text-yellow-700 hover:text-yellow-900 underline">
                Resolve conflicts
              </button>
            </div>
          </div>
        )}

        {/* Video Call Area */}
        {isVideoCallActive && (
          <div className="bg-gray-900 p-4">
            <div className="flex space-x-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-48 h-32 bg-gray-800 rounded-lg"
                />
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                  You
                </div>
              </div>
              {/* Other participants would appear here */}
              <div className="w-48 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-lg font-medium mx-auto mb-2">
                    SJ
                  </div>
                  <div className="text-sm">Sarah Johnson</div>
                </div>
              </div>
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
              placeholder="Start typing your document... Multiple users can edit simultaneously."
              className="w-full h-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
            />
            
            {/* User Cursors (simulated) */}
            {activeUsers.map((user) => (
              user.cursor && (
                <div
                  key={user.id}
                  className="absolute pointer-events-none"
                  style={{
                    top: `${user.cursor.line * 20 + 20}px`,
                    left: `${user.cursor.column * 8 + 20}px`
                  }}
                >
                  <div className={`w-0.5 h-5 ${user.color.replace('bg-', 'bg-')} animate-pulse`}></div>
                  <div className={`px-2 py-1 ${user.color} text-white text-xs rounded mt-1 whitespace-nowrap`}>
                    {user.name}
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
                
                <div className="text-xs text-gray-500 mb-2">
                  {comment.timestamp.toLocaleTimeString()}
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-4 border-l-2 border-gray-200 pl-3 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-700">{reply.userName}</span>
                          <span className="text-xs text-gray-500">
                            {reply.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-600">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
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

export default EnhancedCollaborativeEditor;