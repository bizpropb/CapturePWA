/**
 * SyncManager - Manages Background Sync API
 * Handles queuing failed operations and syncing when connection is restored
 */

const SYNC_TAG = 'sync-moments';

class SyncManager {
  constructor() {
    this.listeners = [];
    this.setupMessageListener();
  }

  /**
   * Listen for sync completion messages from service worker
   */
  setupMessageListener() {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SYNC_COMPLETE') {
          console.log('[SyncManager] Sync completed:', event.data);
          this.notifyListeners(event.data);
        }
      });
    }
  }

  /**
   * Register a background sync
   * This will trigger the service worker to sync when connection is restored
   */
  async registerSync() {
    try {
      if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
        console.warn('[SyncManager] Background Sync API not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(SYNC_TAG);
      console.log('[SyncManager] Background sync registered');
      return true;
    } catch (error) {
      console.error('[SyncManager] Failed to register background sync:', error);
      return false;
    }
  }

  /**
   * Manually trigger sync (fallback for browsers without Background Sync API)
   */
  async triggerManualSync() {
    try {
      console.log('[SyncManager] Manually triggering sync...');
      const { syncPendingMoments } = await import('./db');
      const syncedCount = await syncPendingMoments();

      this.notifyListeners({
        successful: syncedCount,
        failed: 0,
        total: syncedCount,
      });

      return syncedCount;
    } catch (error) {
      console.error('[SyncManager] Manual sync failed:', error);
      return 0;
    }
  }

  /**
   * Get sync status (number of pending items)
   */
  async getSyncStatus() {
    try {
      const { getPendingMomentsCount } = await import('./db');
      const count = await getPendingMomentsCount();
      return {
        pending: count,
        syncing: false, // We don't track this yet
      };
    } catch (error) {
      console.error('[SyncManager] Failed to get sync status:', error);
      return { pending: 0, syncing: false };
    }
  }

  /**
   * Add a listener for sync completion events
   */
  onSyncComplete(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Notify all listeners of sync completion
   */
  notifyListeners(data) {
    this.listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('[SyncManager] Listener error:', error);
      }
    });
  }

  /**
   * Check if Background Sync API is supported
   */
  static isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      'serviceWorker' in navigator &&
      'sync' in ServiceWorkerRegistration.prototype
    );
  }
}

// Singleton instance
let syncManagerInstance = null;

export function getSyncManager() {
  if (!syncManagerInstance) {
    syncManagerInstance = new SyncManager();
  }
  return syncManagerInstance;
}

export default SyncManager;
