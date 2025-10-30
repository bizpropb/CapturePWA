'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Status Indicator Component
 * Shows online/offline status and sync status
 */

export default function StatusIndicator({ syncing = false }) {
  const isOnline = useOnlineStatus();

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
