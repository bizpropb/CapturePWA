'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getSyncManager } from '@/lib/sync-manager';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * SyncIndicator Component
 * Shows sync status and pending item count
 */
export default function SyncIndicator() {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const isOnline = useOnlineStatus();
  const [syncManager, setSyncManager] = useState(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    const manager = getSyncManager();
    setSyncManager(manager);

    // Initial status check
    updateStatus(manager);

    // Listen for sync completion
    const unsubscribe = manager.onSyncComplete((data) => {
      console.log('[SyncIndicator] Sync completed:', data);
      setSyncing(false);
      updateStatus(manager);

      // Show toast notification
      if (data.successful > 0) {
        toast.success(`✅ ${data.successful} moment${data.successful !== 1 ? 's' : ''} synced!`, {
          duration: 3000,
        });
      }
      if (data.failed > 0) {
        toast.error(`⚠️ ${data.failed} moment${data.failed !== 1 ? 's' : ''} failed to sync`, {
          duration: 4000,
        });
      }
    });

    // Poll for status updates every 5 seconds
    const interval = setInterval(() => {
      updateStatus(manager);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline && syncManager && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline, syncManager]);

  async function updateStatus(manager) {
    const status = await manager.getSyncStatus();
    setPendingCount(status.pending);
  }

  async function handleSync() {
    if (!syncManager || syncing) return;

    setSyncing(true);

    try {
      const registered = await syncManager.registerSync();

      // Fallback to manual sync if Background Sync API not supported
      if (!registered) {
        await syncManager.triggerManualSync();
        setSyncing(false);
        await updateStatus(syncManager);
      }
    } catch (error) {
      console.error('[SyncIndicator] Sync failed:', error);
      setSyncing(false);
    }
  }

  // Don't render if nothing to show
  if (pendingCount === 0 && !syncing) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-900/20 border border-yellow-700 rounded-lg text-sm">
      {syncing ? (
        <>
          <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-yellow-300">Syncing...</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-yellow-300">
            {pendingCount} moment{pendingCount !== 1 ? 's' : ''} pending sync
          </span>
          {isOnline && (
            <button
              onClick={handleSync}
              className="ml-2 text-yellow-400 hover:text-yellow-300 underline"
            >
              Sync now
            </button>
          )}
        </>
      )}
    </div>
  );
}
