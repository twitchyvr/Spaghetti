import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CollaborativeEditor } from '../CollaborativeEditor';
import { AuthContext } from '../../../contexts/AuthContext';

// Mock SignalR
vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => ({
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    configureLogging: vi.fn().mockReturnThis(),
    build: vi.fn(() => ({
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      invoke: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
      onclose: vi.fn(),
      onreconnected: vi.fn(),
    })),
  })),
  LogLevel: {
    Information: 1,
  },
}));

// Mock user context
const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'editor',
  tenantId: 'tenant-123',
};

const mockAuthContext = {
  user: mockUser,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
  isAuthenticated: true,
};

const renderWithAuthContext = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      {component}
    </AuthContext.Provider>
  );
};

describe('CollaborativeEditor', () => {
  const defaultProps = {
    documentId: 'doc-123',
    initialContent: 'Initial content',
    onContentChange: vi.fn(),
    onSave: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor with initial content', () => {
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    expect(screen.getByText('Initial content')).toBeInTheDocument();
  });

  it('joins document on mount', async () => {
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(signalRService.joinDocument).toHaveBeenCalledWith('doc-123');
    });
  });

  it('leaves document on unmount', () => {
    const { unmount } = renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    unmount();
    
    expect(signalRService.leaveDocument).toHaveBeenCalledWith('doc-123');
  });

  it('sends content changes on text input', async () => {
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    const editor = screen.getByDisplayValue('Initial content');
    
    fireEvent.change(editor, { target: { value: 'Updated content' } });
    
    await waitFor(() => {
      expect(signalRService.sendContentChange).toHaveBeenCalledWith('doc-123', {
        operation: 'replace',
        startPosition: 0,
        endPosition: 15,
        content: 'Updated content',
        timestamp: expect.any(Date),
        userId: 'user-123',
        userName: 'Test User',
      });
    });
  });

  it('handles cursor position updates', async () => {
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    const editor = screen.getByDisplayValue('Initial content');
    
    // Simulate cursor position change
    fireEvent.click(editor);
    Object.defineProperty(editor, 'selectionStart', { value: 5, configurable: true });
    fireEvent.select(editor);
    
    await waitFor(() => {
      expect(signalRService.sendCursorUpdate).toHaveBeenCalledWith('doc-123', {
        userId: 'user-123',
        userName: 'Test User',
        position: 5,
        timestamp: expect.any(Date),
      });
    });
  });

  it('displays user presence indicators', async () => {
    const mockOnUserJoined = vi.fn();
    (signalRService.onUserJoined as any).mockImplementation((callback) => {
      mockOnUserJoined.mockImplementation(callback);
    });

    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    // Simulate user joining
    const joinedUser = {
      userId: 'user-456',
      userName: 'Other User',
      email: 'other@example.com',
      status: 'active',
      cursorPosition: 10,
      color: '#FF5733',
    };
    
    mockOnUserJoined(joinedUser);
    
    await waitFor(() => {
      expect(screen.getByText('Other User')).toBeInTheDocument();
    });
  });

  it('handles document locking correctly', async () => {
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    const lockButton = screen.getByRole('button', { name: /lock document/i });
    fireEvent.click(lockButton);
    
    await waitFor(() => {
      expect(signalRService.lockDocument).toHaveBeenCalledWith('doc-123');
    });
  });

  it('shows conflict resolution dialog when conflicts occur', async () => {
    const mockOnContentChanged = vi.fn();
    (signalRService.onContentChanged as any).mockImplementation((callback) => {
      mockOnContentChanged.mockImplementation(callback);
    });

    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    // Simulate conflicting change
    const conflictingChange = {
      operation: 'insert',
      startPosition: 5,
      content: 'conflicting text',
      userId: 'user-456',
      userName: 'Other User',
      timestamp: new Date(),
      version: 2,
    };
    
    mockOnContentChanged(conflictingChange);
    
    await waitFor(() => {
      expect(screen.getByText(/conflict detected/i)).toBeInTheDocument();
    });
  });

  it('applies operational transformation for concurrent edits', async () => {
    const mockOnContentChanged = vi.fn();
    (signalRService.onContentChanged as any).mockImplementation((callback) => {
      mockOnContentChanged.mockImplementation(callback);
    });

    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    const editor = screen.getByDisplayValue('Initial content');
    
    // Local edit
    fireEvent.change(editor, { target: { value: 'Initial modified content' } });
    
    // Remote edit that should be transformed
    const remoteChange = {
      operation: 'insert',
      startPosition: 0,
      content: 'Remote: ',
      userId: 'user-456',
      userName: 'Other User',
      timestamp: new Date(Date.now() + 100), // Slightly later
      version: 1,
    };
    
    mockOnContentChanged(remoteChange);
    
    await waitFor(() => {
      // Should have both changes applied with proper transformation
      expect(screen.getByDisplayValue(/Remote:.*Initial modified content/)).toBeInTheDocument();
    });
  });

  it('shows typing indicators for active users', async () => {
    const mockOnCursorUpdated = vi.fn();
    (signalRService.onCursorUpdated as any).mockImplementation((callback) => {
      mockOnCursorUpdated.mockImplementation(callback);
    });

    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    // Simulate typing indicator
    const typingUpdate = {
      userId: 'user-456',
      userName: 'Other User',
      position: 10,
      isTyping: true,
      timestamp: new Date(),
    };
    
    mockOnCursorUpdated(typingUpdate);
    
    await waitFor(() => {
      expect(screen.getByText(/Other User is typing/i)).toBeInTheDocument();
    });
  });

  it('handles read-only mode correctly', () => {
    renderWithAuthContext(
      <CollaborativeEditor {...defaultProps} readOnly={true} />
    );
    
    const editor = screen.getByDisplayValue('Initial content');
    expect(editor).toHaveAttribute('readonly');
    
    // Lock button should not be present in read-only mode
    expect(screen.queryByRole('button', { name: /lock document/i })).not.toBeInTheDocument();
  });

  it('recovers from connection errors gracefully', async () => {
    // Mock connection error
    (signalRService.joinDocument as any).mockRejectedValueOnce(new Error('Connection failed'));
    
    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText(/connection error/i)).toBeInTheDocument();
    });
    
    // Should show retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Clear the mock to allow successful retry
    (signalRService.joinDocument as any).mockResolvedValueOnce(undefined);
    
    fireEvent.click(retryButton);
    
    await waitFor(() => {
      expect(screen.queryByText(/connection error/i)).not.toBeInTheDocument();
    });
  });

  it('maintains document version consistency', async () => {
    const mockOnContentChanged = vi.fn();
    (signalRService.onContentChanged as any).mockImplementation((callback) => {
      mockOnContentChanged.mockImplementation(callback);
    });

    renderWithAuthContext(<CollaborativeEditor {...defaultProps} />);
    
    // Simulate out-of-order version
    const lateChange = {
      operation: 'insert',
      startPosition: 5,
      content: 'late change',
      userId: 'user-456',
      userName: 'Other User',
      timestamp: new Date(Date.now() - 1000), // Earlier timestamp
      version: 1,
    };
    
    const currentChange = {
      operation: 'insert',
      startPosition: 0,
      content: 'current change',
      userId: 'user-789',
      userName: 'Third User',
      timestamp: new Date(),
      version: 2,
    };
    
    // Receive current change first
    mockOnContentChanged(currentChange);
    // Then receive late change
    mockOnContentChanged(lateChange);
    
    await waitFor(() => {
      // Should handle version ordering correctly
      const editor = screen.getByDisplayValue(/current change.*late change/);
      expect(editor).toBeInTheDocument();
    });
  });
});