// Sprint 2 Frontend Collaboration Service Implementation
import { 
  UserPresence, 
  DocumentLockInfo, 
  ContentChange, 
  DocumentComment 
} from '../types/collaboration';
import api from './api';

class CollaborationServiceImpl {
  private readonly baseUrl = '/collaboration';

  /**
   * Get active users currently editing a document
   */
  async getActiveUsers(documentId: string): Promise<UserPresence[]> {
    try {
      const response = await api.get<UserPresence[]>(
        `${this.baseUrl}/document/${documentId}/users`
      );
      
      return response;
    } catch (error) {
      console.error('Get active users error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get active users'
      );
    }
  }

  /**
   * Get current lock status for a document
   */
  async getLockStatus(documentId: string): Promise<DocumentLockInfo | null> {
    try {
      const response = await api.get<DocumentLockInfo | null>(
        `${this.baseUrl}/document/${documentId}/lock`
      );
      
      return response;
    } catch (error) {
      console.error('Get lock status error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get lock status'
      );
    }
  }

  /**
   * Request exclusive lock on a document for editing
   */
  async requestLock(documentId: string): Promise<DocumentLockInfo> {
    try {
      const response = await api.post<DocumentLockInfo>(
        `${this.baseUrl}/document/${documentId}/lock`
      );
      
      return response;
    } catch (error) {
      console.error('Request lock error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('409')) {
          throw new Error('Document is already locked by another user');
        }
        if (error.message.includes('403')) {
          throw new Error('You do not have permission to lock this document');
        }
      }
      
      throw new Error(
        error instanceof Error ? error.message : 'Failed to acquire document lock'
      );
    }
  }

  /**
   * Release lock on a document
   */
  async releaseLock(documentId: string): Promise<void> {
    try {
      await api.delete<void>(
        `${this.baseUrl}/document/${documentId}/lock`
      );
    } catch (error) {
      console.error('Release lock error:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new Error('Document is not locked or lock not found');
        }
        if (error.message.includes('403')) {
          throw new Error('You do not own this document lock');
        }
      }
      
      throw new Error(
        error instanceof Error ? error.message : 'Failed to release document lock'
      );
    }
  }

  /**
   * Get content changes since a specific timestamp for synchronization
   */
  async getContentChangesSince(documentId: string, since: string): Promise<ContentChange[]> {
    try {
      const url = new URL(`${this.baseUrl}/document/${documentId}/changes`, window.location.origin);
      url.searchParams.append('since', since);
      
      const response = await api.get<ContentChange[]>(url.pathname + url.search);
      
      return response;
    } catch (error) {
      console.error('Get content changes error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get content changes'
      );
    }
  }

  /**
   * Store a content change for real-time synchronization
   */
  async storeContentChange(documentId: string, change: ContentChange): Promise<void> {
    try {
      await api.post<void>(
        `${this.baseUrl}/document/${documentId}/changes`,
        change
      );
    } catch (error) {
      console.error('Store content change error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to store content change'
      );
    }
  }

  /**
   * Get comments for a document
   */
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    try {
      const response = await api.get<DocumentComment[]>(
        `${this.baseUrl}/document/${documentId}/comments`
      );
      
      return response;
    } catch (error) {
      console.error('Get document comments error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get document comments'
      );
    }
  }

  /**
   * Add a comment to a document
   */
  async addComment(documentId: string, comment: DocumentComment): Promise<void> {
    try {
      await api.post<void>(
        `${this.baseUrl}/document/${documentId}/comments`,
        comment
      );
    } catch (error) {
      console.error('Add comment error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to add comment'
      );
    }
  }

  /**
   * Utility method to check if a document is currently locked
   */
  async isDocumentLocked(documentId: string): Promise<boolean> {
    try {
      const lockInfo = await this.getLockStatus(documentId);
      return lockInfo !== null && lockInfo.isActive;
    } catch (error) {
      console.error('Check document lock error:', error);
      return false;
    }
  }

  /**
   * Utility method to check if current user has the lock
   */
  async hasUserLock(documentId: string, userId: string): Promise<boolean> {
    try {
      const lockInfo = await this.getLockStatus(documentId);
      return lockInfo !== null && lockInfo.lockedBy === userId && lockInfo.isActive;
    } catch (error) {
      console.error('Check user lock error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const collaborationService = new CollaborationServiceImpl();

// Export default for easier importing
export default collaborationService;