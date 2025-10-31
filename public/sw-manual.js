// Manual Service Worker for Development
// Enhanced with Background Sync API support

const SYNC_TAG = 'sync-moments';

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

// Background Sync Event
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event triggered:', event.tag);

  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingMoments());
  }
});

/**
 * Sync pending moments from IndexedDB to server
 */
async function syncPendingMoments() {
  console.log('[Service Worker] Starting background sync...');

  try {
    // Open IndexedDB
    const db = await openDatabase();
    const tx = db.transaction(['pendingMoments'], 'readonly');
    const store = tx.objectStore('pendingMoments');
    const pendingMoments = await store.getAll();

    console.log(`[Service Worker] Found ${pendingMoments.length} pending moments to sync`);

    if (pendingMoments.length === 0) {
      return;
    }

    // Sync each pending moment
    const results = await Promise.allSettled(
      pendingMoments.map((moment) => syncMoment(moment, db))
    );

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(`[Service Worker] Sync complete: ${successful} succeeded, ${failed} failed`);

    // Update badge with remaining pending count
    await updateBadge(db);

    // Notify clients about sync completion
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        successful,
        failed,
        total: pendingMoments.length,
      });
    });
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
    throw error; // Re-throw to trigger retry
  }
}

/**
 * Sync a single moment to the server
 */
async function syncMoment(moment, db) {
  try {
    const response = await fetch('/api/moments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moment.data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[Service Worker] Synced moment:', result);

    // Remove from pending queue
    const tx = db.transaction(['pendingMoments'], 'readwrite');
    const store = tx.objectStore('pendingMoments');
    await store.delete(moment.id);

    return result;
  } catch (error) {
    console.error('[Service Worker] Failed to sync moment:', error);
    throw error;
  }
}

/**
 * Open IndexedDB
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CapturePWA', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingMoments')) {
        db.createObjectStore('pendingMoments', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('moments')) {
        db.createObjectStore('moments', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Update app badge with pending moments count
 * @param {IDBDatabase} db - Database instance
 */
async function updateBadge(db) {
  try {
    // Check if Badge API is supported
    if (!('setAppBadge' in self.navigator) || !('clearAppBadge' in self.navigator)) {
      console.log('[Service Worker] Badge API not supported');
      return;
    }

    // Get pending moments count
    const tx = db.transaction(['pendingMoments'], 'readonly');
    const store = tx.objectStore('pendingMoments');
    const pendingCount = await store.count();

    // Update badge
    if (pendingCount > 0) {
      await self.navigator.setAppBadge(pendingCount);
      console.log(`[Service Worker] Badge updated to ${pendingCount}`);
    } else {
      await self.navigator.clearAppBadge();
      console.log('[Service Worker] Badge cleared');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to update badge:', error);
  }
}

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'New Notification', body: event.data.text() };
    }
  }

  const title = data.title || 'CapturePWA';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: 'capture-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    Promise.all([
      // Clear badge when notification is clicked
      clearBadge(),
      // Open or focus window
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    ])
  );
});

/**
 * Clear the app badge
 */
async function clearBadge() {
  try {
    if ('clearAppBadge' in self.navigator) {
      await self.navigator.clearAppBadge();
      console.log('[Service Worker] Badge cleared on notification click');
    }
  } catch (error) {
    console.error('[Service Worker] Failed to clear badge:', error);
  }
}
