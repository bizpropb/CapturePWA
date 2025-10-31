import { useEffect, useCallback, useState, useRef } from 'react';
import { getBadgeManager } from '@/lib/badge-manager';
import { getPendingMomentsCount } from '@/lib/db';

/**
 * Custom hook for managing app badge notifications
 * Automatically syncs badge with pending moments count
 *
 * @returns {Object} Badge utilities
 */
export function useBadge() {
  const [badgeCount, setBadgeCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const badgeManagerRef = useRef(null);

  // Initialize badge manager only on client-side
  useEffect(() => {
    badgeManagerRef.current = getBadgeManager();
    setIsSupported(badgeManagerRef.current.isSupported);
  }, []);

  /**
   * Update badge with pending moments count
   */
  const updateBadgeFromPendingCount = useCallback(async () => {
    if (!badgeManagerRef.current) return 0;
    try {
      const count = await getPendingMomentsCount();
      await badgeManagerRef.current.setBadge(count);
      setBadgeCount(count);
      return count;
    } catch (error) {
      console.error('[useBadge] Failed to update badge:', error);
      return 0;
    }
  }, []);

  /**
   * Clear the badge
   */
  const clearBadge = useCallback(async () => {
    if (!badgeManagerRef.current) return;
    await badgeManagerRef.current.clearBadge();
    setBadgeCount(0);
  }, []);

  /**
   * Set badge to specific count
   */
  const setBadge = useCallback(async (count) => {
    if (!badgeManagerRef.current) return;
    await badgeManagerRef.current.setBadge(count);
    setBadgeCount(count);
  }, []);

  /**
   * Increment badge count
   */
  const incrementBadge = useCallback(async (amount = 1) => {
    if (!badgeManagerRef.current) return;
    await badgeManagerRef.current.incrementBadge(amount);
    setBadgeCount(badgeManagerRef.current.getBadgeCount());
  }, []);

  /**
   * Decrement badge count
   */
  const decrementBadge = useCallback(async (amount = 1) => {
    if (!badgeManagerRef.current) return;
    await badgeManagerRef.current.decrementBadge(amount);
    setBadgeCount(badgeManagerRef.current.getBadgeCount());
  }, []);

  return {
    badgeCount,
    isSupported,
    updateBadgeFromPendingCount,
    clearBadge,
    setBadge,
    incrementBadge,
    decrementBadge,
  };
}

/**
 * Hook to automatically sync badge with pending moments count
 * Updates badge whenever dependencies change
 * Clears badge when app is in foreground
 *
 * Note: Pass a stable reference for dependencies to avoid infinite loops
 */
export function useAutoBadge() {
  const { updateBadgeFromPendingCount, clearBadge } = useBadge();

  // Update badge on mount
  useEffect(() => {
    updateBadgeFromPendingCount();
  }, [updateBadgeFromPendingCount]);

  // Clear badge when app is opened/focused
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When app comes to foreground, clear badge
        clearBadge();
      } else {
        // When app goes to background, update badge
        updateBadgeFromPendingCount();
      }
    };

    const handleFocus = () => {
      // Clear badge when window gains focus
      clearBadge();
    };

    const handleBlur = () => {
      // Update badge when window loses focus
      updateBadgeFromPendingCount();
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for focus/blur (for browsers that don't support visibilitychange well)
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Clear badge on mount (app is open)
    clearBadge();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [clearBadge, updateBadgeFromPendingCount]);
}
