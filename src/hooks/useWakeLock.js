import { useEffect, useState, useRef } from 'react';
import { checkWakeLockSupport, WakeLockManager, setupVisibilityListener } from '@/lib/wake-lock-utils';

/**
 * Hook to manage screen wake lock
 * @param {Object} options - Configuration options
 * @returns {Object} Wake lock state and controls
 */
export function useWakeLock(options = {}) {
  const {
    enabled = true,
    autoReacquire = true, // Re-acquire when page becomes visible
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);
  const managerRef = useRef(null);

  // Initialize wake lock manager
  useEffect(() => {
    const supported = checkWakeLockSupport();
    setIsSupported(supported);

    if (supported) {
      managerRef.current = new WakeLockManager();
    }

    return () => {
      if (managerRef.current) {
        managerRef.current.release();
      }
    };
  }, []);

  // Set up visibility listener for auto-reacquire
  useEffect(() => {
    if (!autoReacquire || !managerRef.current) return;

    const cleanup = setupVisibilityListener(managerRef.current);
    return cleanup;
  }, [autoReacquire]);

  // Update enabled state
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setEnabled(enabled);
    }
  }, [enabled]);

  /**
   * Request wake lock
   * @returns {Promise<boolean>} Success status
   */
  const request = async () => {
    if (!managerRef.current) return false;

    try {
      setError(null);
      const success = await managerRef.current.request();
      setIsActive(success);
      return success;
    } catch (err) {
      setError(err.message);
      setIsActive(false);
      return false;
    }
  };

  /**
   * Release wake lock
   * @returns {Promise<void>}
   */
  const release = async () => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.release();
      setIsActive(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  /**
   * Toggle wake lock on/off
   * @returns {Promise<boolean>} New active state
   */
  const toggle = async () => {
    if (isActive) {
      await release();
      return false;
    } else {
      const success = await request();
      return success;
    }
  };

  return {
    isSupported,
    isActive,
    error,
    request,
    release,
    toggle,
  };
}

/**
 * Hook that automatically manages wake lock based on a condition
 * Example: Keep screen on while video is playing
 * @param {boolean} shouldBeActive - Whether wake lock should be active
 * @param {Object} options - Configuration options
 * @returns {Object} Wake lock state
 */
export function useAutoWakeLock(shouldBeActive, options = {}) {
  const wakeLock = useWakeLock(options);

  useEffect(() => {
    if (!wakeLock.isSupported) return;

    if (shouldBeActive && !wakeLock.isActive) {
      wakeLock.request();
    } else if (!shouldBeActive && wakeLock.isActive) {
      wakeLock.release();
    }
  }, [shouldBeActive, wakeLock.isSupported]);

  return wakeLock;
}
