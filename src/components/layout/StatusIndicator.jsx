'use client';

import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Status Indicator Component
 * Shows online/offline status and sync status
 */

export default function StatusIndicator({ syncing = false }) {
  const isOnline = useOnlineStatus();
  const previousOnlineStatus = useRef(isOnline);

  // Show toast when online status changes
  useEffect(() => {
    // Skip on first render
    if (previousOnlineStatus.current === null) {
      previousOnlineStatus.current = isOnline;
      return;
    }

    // Detect change
    if (previousOnlineStatus.current !== isOnline) {
      if (isOnline) {
        toast.success('🟢 Back online! Syncing pending moments...', {
          duration: 3000,
        });
      } else {
        toast('🔴 You are offline. Moments will be saved locally.', {
          duration: 4000,
          icon: '⚠️',
        });
      }
      previousOnlineStatus.current = isOnline;
    }
  }, [isOnline]);

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Indicator */}
      <div
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          isOnline
            ? 'bg-green-900 text-green-200'
            : 'bg-red-900 text-red-200'
        }`}
      >
        {isOnline ? '🟢 Online' : '🔴 Offline'}
      </div>

      {/* Syncing Indicator */}
      {syncing && (
        <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-200">
          🔄 Syncing...
        </div>
      )}
    </div>
  );
}
