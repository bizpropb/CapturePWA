/**
 * Wake Lock API Utilities
 * Prevents device screen from turning off during activities
 */

/**
 * Check if Wake Lock API is supported
 * @returns {boolean} True if wake lock is available
 */
export function checkWakeLockSupport() {
  return 'wakeLock' in navigator;
}

/**
 * Request a wake lock to keep the screen on
 * @param {string} type - Wake lock type (currently only 'screen' is supported)
 * @returns {Promise<WakeLockSentinel|null>} Wake lock sentinel or null if failed
 */
export async function requestWakeLock(type = 'screen') {
  if (!checkWakeLockSupport()) {
    console.warn('Wake Lock API not supported');
    return null;
  }

  try {
    const wakeLock = await navigator.wakeLock.request(type);
    console.log('Wake lock acquired:', type);

    // Listen for release
    wakeLock.addEventListener('release', () => {
      console.log('Wake lock released:', type);
    });

    return wakeLock;
  } catch (error) {
    console.error('Failed to acquire wake lock:', error);
    return null;
  }
}

/**
 * Release a wake lock
 * @param {WakeLockSentinel} wakeLock - Wake lock to release
 * @returns {Promise<void>}
 */
export async function releaseWakeLock(wakeLock) {
  if (!wakeLock) return;

  try {
    await wakeLock.release();
    console.log('Wake lock manually released');
  } catch (error) {
    console.error('Failed to release wake lock:', error);
  }
}

/**
 * Check if a wake lock is currently active
 * @param {WakeLockSentinel} wakeLock - Wake lock to check
 * @returns {boolean} True if wake lock is active
 */
export function isWakeLockActive(wakeLock) {
  return wakeLock && !wakeLock.released;
}

/**
 * WakeLockManager class for easier management
 */
export class WakeLockManager {
  constructor() {
    this.wakeLock = null;
    this.isEnabled = true;
  }

  /**
   * Request wake lock if not already active
   * @returns {Promise<boolean>} True if wake lock is active
   */
  async request() {
    if (!this.isEnabled) {
      console.log('Wake lock disabled by user');
      return false;
    }

    if (isWakeLockActive(this.wakeLock)) {
      console.log('Wake lock already active');
      return true;
    }

    this.wakeLock = await requestWakeLock();
    return isWakeLockActive(this.wakeLock);
  }

  /**
   * Release wake lock if active
   * @returns {Promise<void>}
   */
  async release() {
    if (this.wakeLock) {
      await releaseWakeLock(this.wakeLock);
      this.wakeLock = null;
    }
  }

  /**
   * Check if wake lock is currently active
   * @returns {boolean}
   */
  isActive() {
    return isWakeLockActive(this.wakeLock);
  }

  /**
   * Enable or disable wake lock functionality
   * @param {boolean} enabled - Whether to enable wake lock
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.isActive()) {
      this.release();
    }
  }

  /**
   * Re-acquire wake lock after visibility change
   * Useful when app regains focus after being in background
   * @returns {Promise<void>}
   */
  async reacquireOnVisibilityChange() {
    if (!document.hidden && this.isEnabled && !this.isActive()) {
      await this.request();
    }
  }
}

/**
 * Set up automatic wake lock reacquisition when page becomes visible
 * Wake locks are automatically released when page is hidden
 * @param {WakeLockManager} manager - Wake lock manager instance
 * @returns {Function} Cleanup function to remove listener
 */
export function setupVisibilityListener(manager) {
  const handleVisibilityChange = async () => {
    await manager.reacquireOnVisibilityChange();
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
