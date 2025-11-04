'use client';

import { useState, useEffect } from 'react';
import { useBadge } from '@/hooks/useBadge';
import Button from '@/components/ui/Button';

/**
 * BadgeManager Component
 * Manages app icon badge notifications
 */
export default function BadgeManager() {
  const {
    badgeCount,
    isSupported,
    updateBadgeFromPendingCount,
    clearBadge,
    setBadge,
  } = useBadge();

  const [testCount, setTestCount] = useState(5);
  const [loading, setLoading] = useState(false);

  // Update badge on mount and periodically
  useEffect(() => {
    updateBadgeFromPendingCount();

    // Update every 10 seconds
    const interval = setInterval(() => {
      updateBadgeFromPendingCount();
    }, 10000);

    return () => clearInterval(interval);
  }, [updateBadgeFromPendingCount]);

  const handleSetTestBadge = async () => {
    setLoading(true);
    try {
      await setBadge(testCount);
    } catch (error) {
      console.error('Failed to set test badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearBadge = async () => {
    setLoading(true);
    try {
      await clearBadge();
    } catch (error) {
      console.error('Failed to clear badge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFromPending = async () => {
    setLoading(true);
    try {
      await updateBadgeFromPendingCount();
    } catch (error) {
      console.error('Failed to update badge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">App Badge</h3>
      <p className="text-sm text-gray-400 mb-3">
        Show notification counts on the app icon when in background.
      </p>

      {/* Support Status */}
      <div className="mb-4 p-3 rounded bg-gray-900/50 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Badge API Status:</span>
          <span
            className={`text-sm font-semibold ${
              isSupported ? 'text-green-400' : 'text-yellow-400'
            }`}
          >
            {isSupported ? '✓ Supported' : '⚠ Not Supported'}
          </span>
        </div>

        {!isSupported && (
          <p className="text-xs text-yellow-400">
            Badge API is not supported in your browser. Badge count will be shown in
            the document title instead.
          </p>
        )}

        {isSupported && (
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Current Badge Count:</span>
              <span className="text-lg font-bold text-blue-400">{badgeCount}</span>
            </div>
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="mb-4 p-3 rounded bg-gray-900/50 border border-gray-700">
        <h4 className="text-sm font-semibold mb-2">How it works:</h4>
        <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
          <li>Badge shows pending sync count when app is in background</li>
          <li>Badge automatically clears when app is opened</li>
          <li>Badge updates after background sync completes</li>
          <li>Falls back to document title if Badge API not supported</li>
        </ul>
      </div>

      {/* Test Controls */}
      <div className="space-y-3 p-3 rounded bg-gray-900/50 border border-gray-700">
        <div>
          <label className="block text-sm font-medium mb-2">Test Badge:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="99"
              value={testCount}
              onChange={(e) => setTestCount(parseInt(e.target.value) || 0)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleSetTestBadge}
              disabled={loading}
              variant="primary"
              size="sm"
            >
              Set Badge
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdateFromPending}
            disabled={loading}
            variant="secondary"
            size="sm"
            fullWidth
          >
            Update from Pending
          </Button>
          <Button
            onClick={handleClearBadge}
            disabled={loading}
            variant="danger"
            size="sm"
            fullWidth
          >
            Clear Badge
          </Button>
        </div>
      </div>

      {/* Browser Support Info */}
      <div className="mt-4 p-3 rounded bg-gray-900/30 border border-gray-700">
        <p className="text-xs text-gray-500">
          <strong>Browser Support:</strong> Badge API is supported in Chromium-based
          browsers (Chrome, Edge, Opera) on desktop and Android. Safari and Firefox
          currently do not support this API.
        </p>
      </div>
    </div>
  );
}
