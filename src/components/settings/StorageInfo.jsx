'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { db } from '@/lib/db';

/**
 * StorageInfo Component
 * Shows storage usage and allows clearing caches
 */
export default function StorageInfo() {
  const [storageInfo, setStorageInfo] = useState({
    supported: false,
    usage: 0,
    quota: 0,
    percentage: 0,
    indexedDBSize: 0,
    cacheSize: 0,
  });
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    setLoading(true);

    try {
      let usage = 0;
      let quota = 0;
      let percentage = 0;

      // Check if Storage API is supported
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        usage = estimate.usage || 0;
        quota = estimate.quota || 0;
        percentage = quota > 0 ? (usage / quota) * 100 : 0;
      }

      // Get IndexedDB size (approximate by counting records)
      let indexedDBSize = 0;
      try {
        const moments = await db.moments.toArray();
        const pendingMoments = await db.pendingMoments.toArray();

        // Rough estimate: assume each moment is ~1KB
        indexedDBSize = (moments.length + pendingMoments.length) * 1024;
      } catch (err) {
        console.error('Failed to get IndexedDB size:', err);
      }

      // Get cache size (if Cache API is available)
      let cacheSize = 0;
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            // Rough estimate: assume each cached item is ~10KB
            cacheSize += keys.length * 10240;
          }
        } catch (err) {
          console.error('Failed to get cache size:', err);
        }
      }

      setStorageInfo({
        supported: 'storage' in navigator,
        usage,
        quota,
        percentage,
        indexedDBSize,
        cacheSize,
      });
    } catch (err) {
      console.error('Failed to check storage:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (!confirm('Clear all cached data? This will remove offline content.')) {
      return;
    }

    setClearing(true);

    try {
      // Clear cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log('Cache storage cleared');
      }

      // Refresh storage info
      await checkStorage();

      alert('Cache cleared successfully!');
    } catch (err) {
      console.error('Failed to clear cache:', err);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const clearIndexedDB = async () => {
    if (
      !confirm(
        'Clear IndexedDB? This will remove all cached moments and pending sync data. This action cannot be undone.'
      )
    ) {
      return;
    }

    setClearing(true);

    try {
      // Clear all tables
      await db.moments.clear();
      await db.pendingMoments.clear();

      console.log('IndexedDB cleared');

      // Refresh storage info
      await checkStorage();

      alert('IndexedDB cleared successfully!');
    } catch (err) {
      console.error('Failed to clear IndexedDB:', err);
      alert('Failed to clear IndexedDB. Please try again.');
    } finally {
      setClearing(false);
    }
  };

  const clearAllData = async () => {
    if (
      !confirm(
        'Clear ALL app data? This will remove all cached content, IndexedDB data, and preferences. This action cannot be undone.'
      )
    ) {
      return;
    }

    setClearing(true);

    try {
      // Clear cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      // Clear IndexedDB
      await db.moments.clear();
      await db.pendingMoments.clear();

      // Clear localStorage
      localStorage.clear();

      // Refresh storage info
      await checkStorage();

      alert('All data cleared successfully! The page will reload.');

      // Reload page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error('Failed to clear all data:', err);
      alert('Failed to clear all data. Please try again.');
      setClearing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Storage</h3>
      <p className="text-sm text-gray-400 mb-4">
        View storage usage and manage cached data.
      </p>

      <div className="space-y-4">
        {/* Storage Overview */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
            </div>
          ) : storageInfo.supported ? (
            <div className="space-y-3">
              {/* Total Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Total Usage:</span>
                  <span className="font-medium">
                    {formatBytes(storageInfo.usage)} / {formatBytes(storageInfo.quota)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      storageInfo.percentage < 50
                        ? 'bg-green-500'
                        : storageInfo.percentage < 80
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {storageInfo.percentage.toFixed(1)}% used
                </p>
              </div>

              {/* Breakdown */}
              <div className="pt-3 border-t border-gray-700 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">IndexedDB:</span>
                  <span>{formatBytes(storageInfo.indexedDBSize)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Cache Storage:</span>
                  <span>{formatBytes(storageInfo.cacheSize)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-yellow-300">
              Storage API not supported in this browser.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={checkStorage}
            disabled={loading || clearing}
            variant="primary"
            fullWidth
          >
            {loading ? 'Checking...' : 'Refresh Storage Info'}
          </Button>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={clearCache}
              disabled={clearing}
              variant="danger"
              size="sm"
              fullWidth
            >
              Clear Cache
            </Button>
            <Button
              onClick={clearIndexedDB}
              disabled={clearing}
              variant="danger"
              size="sm"
              fullWidth
            >
              Clear IndexedDB
            </Button>
            <Button
              onClick={clearAllData}
              disabled={clearing}
              variant="danger"
              size="sm"
              fullWidth
            >
              {clearing ? 'Clearing...' : 'Clear All Data'}
            </Button>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 bg-red-900/10 border border-red-700/30 rounded-lg">
          <p className="text-xs text-red-300">
            <strong>Warning:</strong> Clearing data will remove all cached content and
            may require re-downloading data. Make sure important moments are synced
            before clearing.
          </p>
        </div>
      </div>
    </div>
  );
}
