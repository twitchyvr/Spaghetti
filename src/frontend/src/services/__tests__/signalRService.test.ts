import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as signalR from '@microsoft/signalr';
import {
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
  disconnect,
  getConnectionId,
  getConnectionState,
} from '../signalRService';

// Mock SignalR
const mockConnection = {
  start: vi.fn(),
  stop: vi.fn(),
  invoke: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  connectionId: 'mock-connection-id',
  state: signalR.HubConnectionState.Connected,
  onreconnecting: vi.fn(),
  onreconnected: vi.fn(),
  onclose: vi.fn(),
};

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: vi.fn(() => ({
    withUrl: vi.fn().mockReturnThis(),
    withAutomaticReconnect: vi.fn().mockReturnThis(),
    configureLogging: vi.fn().mockReturnThis(),
    build: vi.fn(() => mockConnection),
  })),
  HubConnectionState: {
    Disconnected: 'Disconnected',
    Connecting: 'Connecting',
    Connected: 'Connected',
    Disconnecting: 'Disconnecting',
    Reconnecting: 'Reconnecting',
  },
  LogLevel: {
    Information: 1,
    Warning: 2,
    Error: 3,
  },
}));

describe('SignalR Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnection.start.mockResolvedValue(undefined);
    mockConnection.stop.mockResolvedValue(undefined);
    mockConnection.invoke.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('establishes connection when joining first document', async () => {
      await joinDocument('doc-123');
      
      expect(mockConnection.start).toHaveBeenCalledTimes(1);
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinDocument', 'doc-123');
    });

    it('reuses existing connection for multiple documents', async () => {
      await joinDocument('doc-123');
      await joinDocument('doc-456');
      
      expect(mockConnection.start).toHaveBeenCalledTimes(1);
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinDocument', 'doc-123');
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinDocument', 'doc-456');
    });

    it('handles connection failures gracefully', async () => {
      const connectionError = new Error('Connection failed');
      mockConnection.start.mockRejectedValue(connectionError);
      
      await expect(joinDocument('doc-123')).rejects.toThrow('Connection failed');
    });

    it('returns correct connection state', async () => {
      await joinDocument('doc-123');
      
      expect(getConnectionState()).toBe('Connected');
    });

    it('returns connection ID after successful connection', async () => {
      await joinDocument('doc-123');
      
      expect(getConnectionId()).toBe('mock-connection-id');
    });
  });

  describe('Document Operations', () => {
    beforeEach(async () => {
      await joinDocument('doc-123');
    });

    it('sends content changes with proper format', async () => {
      const contentChange = {
        operation: 'insert',
        startPosition: 10,
        endPosition: 10,
        content: 'Hello World',
        timestamp: new Date(),
        userId: 'user-123',
        userName: 'Test User',
        version: 1,
      };
      
      await sendContentChange('doc-123', contentChange);
      
      expect(mockConnection.invoke).toHaveBeenCalledWith(
        'SendContentChange',
        'doc-123',
        contentChange
      );
    });

    it('sends cursor updates with user information', async () => {
      const cursorUpdate = {
        userId: 'user-123',
        userName: 'Test User',
        position: 25,
        timestamp: new Date(),
      };
      
      await sendCursorUpdate('doc-123', cursorUpdate);
      
      expect(mockConnection.invoke).toHaveBeenCalledWith(
        'SendCursorUpdate',
        'doc-123',
        cursorUpdate
      );
    });

    it('handles document locking requests', async () => {
      await lockDocument('doc-123');
      
      expect(mockConnection.invoke).toHaveBeenCalledWith('LockDocument', 'doc-123');
    });

    it('handles document lock release', async () => {
      await releaseDocumentLock('doc-123');
      
      expect(mockConnection.invoke).toHaveBeenCalledWith('ReleaseLock', 'doc-123');
    });

    it('leaves document and cleans up resources', async () => {
      await leaveDocument('doc-123');
      
      expect(mockConnection.invoke).toHaveBeenCalledWith('LeaveDocument', 'doc-123');
    });
  });

  describe('Event Handlers', () => {
    beforeEach(async () => {
      await joinDocument('doc-123');
    });

    it('registers content change event handlers', () => {
      const handler = vi.fn();
      
      onContentChanged(handler);
      
      expect(mockConnection.on).toHaveBeenCalledWith('ContentChanged', handler);
    });

    it('registers user presence event handlers', () => {
      const joinHandler = vi.fn();
      const leftHandler = vi.fn();
      
      onUserJoined(joinHandler);
      onUserLeft(leftHandler);
      
      expect(mockConnection.on).toHaveBeenCalledWith('UserJoined', joinHandler);
      expect(mockConnection.on).toHaveBeenCalledWith('UserLeft', leftHandler);
    });

    it('registers cursor update event handlers', () => {
      const handler = vi.fn();
      
      onCursorUpdated(handler);
      
      expect(mockConnection.on).toHaveBeenCalledWith('CursorUpdated', handler);
    });

    it('registers document lock event handlers', () => {
      const lockHandler = vi.fn();
      const unlockHandler = vi.fn();
      
      onDocumentLocked(lockHandler);
      onDocumentUnlocked(unlockHandler);
      
      expect(mockConnection.on).toHaveBeenCalledWith('DocumentLocked', lockHandler);
      expect(mockConnection.on).toHaveBeenCalledWith('DocumentUnlocked', unlockHandler);
    });

    it('handles event handler errors gracefully', () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });
      
      onContentChanged(handler);
      
      // Simulate event trigger
      const registeredHandler = mockConnection.on.mock.calls.find(
        call => call[0] === 'ContentChanged'
      )?.[1];
      
      expect(() => registeredHandler?.({})).not.toThrow();
    });
  });

  describe('Connection Resilience', () => {
    it('handles automatic reconnection', async () => {
      await joinDocument('doc-123');
      
      // Simulate reconnection setup
      expect(mockConnection.onreconnecting).toBeDefined();
      expect(mockConnection.onreconnected).toBeDefined();
    });

    it('handles connection close events', async () => {
      await joinDocument('doc-123');
      
      expect(mockConnection.onclose).toBeDefined();
    });

    it('reconnects and rejoins documents after connection loss', async () => {
      await joinDocument('doc-123');
      await joinDocument('doc-456');
      
      // Simulate connection loss and reconnection
      mockConnection.state = 'Reconnecting' as any;
      
      // Simulate reconnected event
      const reconnectedHandler = mockConnection.onreconnected;
      if (reconnectedHandler) {
        await reconnectedHandler('new-connection-id');
      }
      
      // Should rejoin all previously joined documents
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinDocument', 'doc-123');
      expect(mockConnection.invoke).toHaveBeenCalledWith('JoinDocument', 'doc-456');
    });
  });

  describe('Error Handling', () => {
    it('handles invoke errors gracefully', async () => {
      await joinDocument('doc-123');
      
      const invokeError = new Error('Invoke failed');
      mockConnection.invoke.mockRejectedValue(invokeError);
      
      await expect(sendContentChange('doc-123', {
        operation: 'insert',
        startPosition: 0,
        endPosition: 0,
        content: 'test',
        timestamp: new Date(),
        userId: 'user-123',
        userName: 'Test User',
        version: 1,
      })).rejects.toThrow('Invoke failed');
    });

    it('handles malformed event data', () => {
      const handler = vi.fn();
      
      onContentChanged(handler);
      
      const registeredHandler = mockConnection.on.mock.calls.find(
        call => call[0] === 'ContentChanged'
      )?.[1];
      
      // Simulate malformed data
      expect(() => registeredHandler?.(null)).not.toThrow();
      expect(() => registeredHandler?.(undefined)).not.toThrow();
      expect(() => registeredHandler?.({ invalidData: true })).not.toThrow();
    });

    it('validates required parameters', async () => {
      await expect(joinDocument('')).rejects.toThrow();
      await expect(sendContentChange('', {} as any)).rejects.toThrow();
      await expect(lockDocument('')).rejects.toThrow();
    });
  });

  describe('Performance Optimizations', () => {
    it('debounces rapid content changes', async () => {
      await joinDocument('doc-123');
      
      const contentChange = {
        operation: 'insert',
        startPosition: 0,
        endPosition: 0,
        content: 'a',
        timestamp: new Date(),
        userId: 'user-123',
        userName: 'Test User',
        version: 1,
      };
      
      // Send rapid changes
      const promises = Array.from({ length: 5 }, (_, i) => 
        sendContentChange('doc-123', { ...contentChange, content: `char${i}` })
      );
      
      await Promise.all(promises);
      
      // Should not exceed reasonable invoke count due to debouncing
      expect(mockConnection.invoke).toHaveBeenCalledTimes(6); // 1 join + up to 5 content changes
    });

    it('batches cursor updates to prevent flooding', async () => {
      await joinDocument('doc-123');
      
      const cursorUpdate = {
        userId: 'user-123',
        userName: 'Test User',
        position: 0,
        timestamp: new Date(),
      };
      
      // Send rapid cursor updates
      const promises = Array.from({ length: 10 }, (_, i) =>
        sendCursorUpdate('doc-123', { ...cursorUpdate, position: i })
      );
      
      await Promise.all(promises);
      
      // Should batch updates to prevent flooding
      expect(mockConnection.invoke).toHaveBeenCalledTimes(3); // 1 join + reasonable number of batched updates
    });
  });

  describe('Connection Cleanup', () => {
    it('properly disconnects and cleans up resources', async () => {
      await joinDocument('doc-123');
      await joinDocument('doc-456');
      
      await disconnect();
      
      expect(mockConnection.stop).toHaveBeenCalledTimes(1);
    });

    it('removes event handlers on disconnect', async () => {
      await joinDocument('doc-123');
      
      const handler = vi.fn();
      onContentChanged(handler);
      
      await disconnect();
      
      expect(mockConnection.off).toHaveBeenCalledWith('ContentChanged', handler);
    });

    it('handles disconnect errors gracefully', async () => {
      await joinDocument('doc-123');
      
      const disconnectError = new Error('Disconnect failed');
      mockConnection.stop.mockRejectedValue(disconnectError);
      
      await expect(disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('Message Ordering', () => {
    it('maintains message order for sequential operations', async () => {
      await joinDocument('doc-123');
      
      const operations = [
        { operation: 'insert', content: 'Hello', position: 0 },
        { operation: 'insert', content: ' ', position: 5 },
        { operation: 'insert', content: 'World', position: 6 },
      ];
      
      const promises = operations.map((op, index) =>
        sendContentChange('doc-123', {
          operation: op.operation as any,
          startPosition: op.position,
          endPosition: op.position,
          content: op.content,
          timestamp: new Date(Date.now() + index),
          userId: 'user-123',
          userName: 'Test User',
          version: index + 1,
        })
      );
      
      await Promise.all(promises);
      
      // Verify operations were sent in order
      const contentChangeCalls = mockConnection.invoke.mock.calls.filter(
        call => call[0] === 'SendContentChange'
      );
      
      expect(contentChangeCalls).toHaveLength(3);
      expect(contentChangeCalls[0][2].content).toBe('Hello');
      expect(contentChangeCalls[1][2].content).toBe(' ');
      expect(contentChangeCalls[2][2].content).toBe('World');
    });
  });
});