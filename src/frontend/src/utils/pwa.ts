/**
 * Progressive Web App utilities for Enterprise Documentation Platform
 * Handles service worker registration, offline detection, and PWA features
 */

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  updateAvailable: boolean;
  showInstallPrompt: boolean;
}

export class PWAManager {
  private static instance: PWAManager;
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private callbacks: Map<string, Set<Function>> = new Map();

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private constructor() {
    this.setupEventListeners();
  }

  /**
   * Register service worker and set up PWA functionality
   */
  async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registered:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('[PWA] New content available');
              this.emit('updateAvailable', this.registration);
            } else {
              // Content cached for first time
              console.log('[PWA] Content cached for offline use');
              this.emit('cached');
            }
          }
        });
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { data } = event;
        console.log('[PWA] Message from SW:', data);
        
        if (data.type === 'DOCUMENT_SYNCED') {
          this.emit('documentSynced', data.documentId);
        }
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  /**
   * Set up PWA event listeners
   */
  private setupEventListeners(): void {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as any;
      this.emit('installable', true);
      console.log('[PWA] Install prompt available');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      this.emit('installed', true);
      console.log('[PWA] App installed');
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.emit('online', true);
      console.log('[PWA] Back online');
    });

    window.addEventListener('offline', () => {
      this.emit('offline', true);
      console.log('[PWA] Gone offline');
    });

    // Visibility change (app activation)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.emit('activated');
      }
    });
  }

  /**
   * Show install prompt to user
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      console.log('[PWA] Install prompt result:', choice.outcome);
      
      if (choice.outcome === 'accepted') {
        this.installPrompt = null;
        return true;
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
    }

    return false;
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) return;

    const newWorker = this.registration.waiting;
    if (!newWorker) return;

    // Send message to skip waiting
    newWorker.postMessage({ type: 'SKIP_WAITING' });

    // Wait for new worker to take control
    await new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', resolve);
    });

    // Reload to get latest content
    window.location.reload();
  }

  /**
   * Cache document for offline access
   */
  async cacheDocument(document: any): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'CACHE_DOCUMENT',
      document
    });
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if (!this.registration?.active) return;

    this.registration.active.postMessage({
      type: 'CLEAR_CACHE'
    });
  }

  /**
   * Check if app can be installed
   */
  isInstallable(): boolean {
    return !!this.installPrompt;
  }

  /**
   * Check if app is installed (running as PWA)
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Check if user is offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Get current PWA state
   */
  getState(): PWAState {
    return {
      isInstallable: this.isInstallable(),
      isInstalled: this.isInstalled(),
      isOffline: this.isOffline(),
      updateAvailable: !!this.registration?.waiting,
      showInstallPrompt: this.isInstallable() && !this.isInstalled()
    };
  }

  /**
   * Register event listener
   */
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }
}

/**
 * React hook for PWA functionality
 */
export function usePWA() {
  const [state, setState] = React.useState<PWAState>(() => 
    PWAManager.getInstance().getState()
  );

  React.useEffect(() => {
    const pwa = PWAManager.getInstance();
    
    const updateState = () => {
      setState(pwa.getState());
    };

    // Register event listeners
    pwa.on('installable', updateState);
    pwa.on('installed', updateState);
    pwa.on('online', updateState);
    pwa.on('offline', updateState);
    pwa.on('updateAvailable', updateState);

    // Initial registration
    pwa.registerServiceWorker();

    return () => {
      pwa.off('installable', updateState);
      pwa.off('installed', updateState);
      pwa.off('online', updateState);
      pwa.off('offline', updateState);
      pwa.off('updateAvailable', updateState);
    };
  }, []);

  const installApp = async () => {
    const result = await PWAManager.getInstance().showInstallPrompt();
    setState(PWAManager.getInstance().getState());
    return result;
  };

  const updateApp = async () => {
    await PWAManager.getInstance().updateServiceWorker();
  };

  const cacheDocument = async (document: any) => {
    await PWAManager.getInstance().cacheDocument(document);
  };

  return {
    ...state,
    installApp,
    updateApp,
    cacheDocument
  };
}

/**
 * PWA utilities for offline storage
 */
export class PWAStorage {
  private static dbName = 'EnterpriseDocsDB';
  private static version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PWAStorage.dbName, PWAStorage.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('pendingSaves')) {
          db.createObjectStore('pendingSaves', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('collaborationUpdates')) {
          db.createObjectStore('collaborationUpdates', { keyPath: 'id' });
        }
      };
    });
  }

  async storeDocument(document: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['documents'], 'readwrite');
    const store = transaction.objectStore('documents');
    await store.put(document);
  }

  async getDocument(id: string): Promise<any> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['documents'], 'readonly');
    const store = transaction.objectStore('documents');
    return store.get(id);
  }

  async storePendingSave(save: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingSaves'], 'readwrite');
    const store = transaction.objectStore('pendingSaves');
    await store.put(save);
  }

  async getPendingSaves(): Promise<any[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingSaves'], 'readonly');
    const store = transaction.objectStore('pendingSaves');
    const request = store.getAll();
    
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
  }
}

// Import React for the hook
import React from 'react';