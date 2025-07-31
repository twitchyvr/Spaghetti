/**
 * Service Worker for Enterprise Documentation Platform
 * Provides offline capability, caching, and push notifications
 */

const CACHE_NAME = 'enterprise-docs-v1.0.0';
const STATIC_CACHE = 'static-assets-v1';
const DYNAMIC_CACHE = 'dynamic-content-v1';

// Resources to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/favicon.svg',
  '/manifest.json',
  // Core app routes
  '/dashboard',
  '/documents',
  '/login',
  '/profile',
  // Offline page
  '/offline.html'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  /\/api\/documents$/,
  /\/api\/documents\/[0-9a-f-]+$/,
  /\/api\/users\/profile$/,
  /\/api\/health$/
];

// Background sync tags
const SYNC_TAGS = {
  DOCUMENT_SAVE: 'document-save',
  COLLABORATION_UPDATE: 'collaboration-update'
};

/**
 * Install event - Cache essential resources
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Error during installation:', error);
      })
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - Implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different resource types with appropriate strategies
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(networkFirst(request));
  } else if (isDocumentRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
  } else if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

/**
 * Background sync for offline document saves
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === SYNC_TAGS.DOCUMENT_SAVE) {
    event.waitUntil(syncDocumentSaves());
  } else if (event.tag === SYNC_TAGS.COLLABORATION_UPDATE) {
    event.waitUntil(syncCollaborationUpdates());
  }
});

/**
 * Push notifications
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new collaboration updates',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: '/documents'
    },
    actions: [
      {
        action: 'view',
        title: 'View Document'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.message || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Enterprise Docs Platform', options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_DOCUMENT') {
    cacheDocument(event.data.document);
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCaches();
  }
});

// Caching Strategies

/**
 * Cache First Strategy - For static assets
 */
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First Strategy - For API requests
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok && shouldCacheAPIResponse(request)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'No network connection available'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Stale While Revalidate Strategy - For documents
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

/**
 * Handle navigation requests with offline fallback
 */
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Serve cached page or offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page for navigation requests
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('Offline', { status: 503 });
  }
}

// Helper Functions

function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff|woff2|ttf|eot)$/);
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
}

function isDocumentRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/documents/');
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

function shouldCacheAPIResponse(request) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

async function syncDocumentSaves() {
  try {
    // Get pending document saves from IndexedDB
    const pendingSaves = await getPendingDocumentSaves();
    
    for (const save of pendingSaves) {
      try {
        await fetch('/api/documents/' + save.id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': save.token
          },
          body: JSON.stringify(save.data)
        });
        
        // Remove from pending saves
        await removePendingDocumentSave(save.id);
        
        // Notify clients of successful sync
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'DOCUMENT_SYNCED',
            documentId: save.id
          });
        });
      } catch (error) {
        console.error('[SW] Failed to sync document save:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncCollaborationUpdates() {
  try {
    // Implementation for syncing collaboration updates
    const pendingUpdates = await getPendingCollaborationUpdates();
    
    for (const update of pendingUpdates) {
      try {
        await fetch('/api/collaboration/updates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': update.token
          },
          body: JSON.stringify(update.data)
        });
        
        await removePendingCollaborationUpdate(update.id);
      } catch (error) {
        console.error('[SW] Failed to sync collaboration update:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Collaboration sync failed:', error);
  }
}

async function cacheDocument(document) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(document), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/api/documents/${document.id}`, response);
  } catch (error) {
    console.error('[SW] Failed to cache document:', error);
  }
}

async function clearCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
  }
}

// IndexedDB helpers for offline data storage
async function getPendingDocumentSaves() {
  // Implementation would use IndexedDB to store/retrieve pending saves
  return [];
}

async function removePendingDocumentSave(id) {
  // Implementation would remove from IndexedDB
}

async function getPendingCollaborationUpdates() {
  // Implementation would use IndexedDB to store/retrieve pending updates
  return [];
}

async function removePendingCollaborationUpdate(id) {
  // Implementation would remove from IndexedDB
}

console.log('[SW] Service worker script loaded');