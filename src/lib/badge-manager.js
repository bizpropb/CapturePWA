/**
 * BadgeManager - Manages app icon badge notifications
 * Uses Badge API to show unsynced item counts on the app icon
 * Falls back to document title for unsupported browsers
 */

class BadgeManager {
  constructor() {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      this.isSupported = false;
      this.currentCount = 0;
      this.originalTitle = '';
      return;
    }

    this.isSupported = this.checkSupport();
    this.currentCount = 0;
    this.originalTitle = typeof document !== 'undefined' ? document.title : '';
  }

  /**
   * Check if Badge API is supported
   * @returns {boolean} Whether Badge API is supported
   */
  checkSupport() {
    return (
      typeof navigator !== 'undefined' &&
      'setAppBadge' in navigator &&
      'clearAppBadge' in navigator
    );
  }

  /**
   * Set the app badge to a specific count
   * @param {number} count - Number to display on badge
   * @returns {Promise<boolean>} Success status
   */
  async setBadge(count) {
    this.currentCount = count;

    if (this.isSupported) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
          console.log(`[BadgeManager] Badge set to ${count}`);
        } else {
          await navigator.clearAppBadge();
          console.log('[BadgeManager] Badge cleared');
        }
        this.clearTitleFallback();
        return true;
      } catch (error) {
        console.error('[BadgeManager] Failed to set badge:', error);
        this.setTitleFallback(count);
        return false;
      }
    } else {
      // Fallback to document title
      this.setTitleFallback(count);
      return false;
    }
  }

  /**
   * Clear the app badge
   * @returns {Promise<boolean>} Success status
   */
  async clearBadge() {
    return this.setBadge(0);
  }

  /**
   * Increment the badge count
   * @param {number} amount - Amount to increment by (default: 1)
   * @returns {Promise<boolean>} Success status
   */
  async incrementBadge(amount = 1) {
    return this.setBadge(this.currentCount + amount);
  }

  /**
   * Decrement the badge count
   * @param {number} amount - Amount to decrement by (default: 1)
   * @returns {Promise<boolean>} Success status
   */
  async decrementBadge(amount = 1) {
    const newCount = Math.max(0, this.currentCount - amount);
    return this.setBadge(newCount);
  }

  /**
   * Get current badge count
   * @returns {number} Current badge count
   */
  getBadgeCount() {
    return this.currentCount;
  }

  /**
   * Fallback: Update document title to show count
   * @param {number} count - Number to display
   */
  setTitleFallback(count) {
    if (typeof document === 'undefined') return;

    if (count > 0) {
      document.title = `(${count}) ${this.originalTitle}`;
      console.log(`[BadgeManager] Title fallback: (${count}) ${this.originalTitle}`);
    } else {
      document.title = this.originalTitle;
    }
  }

  /**
   * Clear the title fallback
   */
  clearTitleFallback() {
    if (typeof document === 'undefined') return;
    document.title = this.originalTitle;
  }

  /**
   * Check if Badge API is supported (static method)
   * @returns {boolean} Whether Badge API is supported
   */
  static isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      'setAppBadge' in navigator &&
      'clearAppBadge' in navigator
    );
  }
}

// Singleton instance
let badgeManagerInstance = null;

/**
 * Get the BadgeManager singleton instance
 * @returns {BadgeManager} BadgeManager instance
 */
export function getBadgeManager() {
  // Only create instance in browser environment
  if (typeof window === 'undefined') {
    return {
      isSupported: false,
      currentCount: 0,
      setBadge: async () => false,
      clearBadge: async () => false,
      incrementBadge: async () => false,
      decrementBadge: async () => false,
      getBadgeCount: () => 0,
    };
  }

  if (!badgeManagerInstance) {
    badgeManagerInstance = new BadgeManager();
  }
  return badgeManagerInstance;
}

export default BadgeManager;
