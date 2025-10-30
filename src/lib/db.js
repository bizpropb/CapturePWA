import Dexie from 'dexie';

/**
 * IndexedDB database for offline storage
 * Using Dexie.js for easier IndexedDB management
 */

class MomentDatabase extends Dexie {
  constructor() {
    super('MomentCaptureDB');

    this.version(1).stores({
      // Cached moments from server
      moments: 'id, createdAt, synced',

      // Pending moments to upload when back online
      pendingMoments: '++localId, createdAt, description',
    });
  }
}

// Create database instance
export const db = new MomentDatabase();

/**
 * Save a moment to IndexedDB cache
 * @param {Object} moment - Moment object from server
 */
export async function saveMomentToCache(moment) {
  try {
    await db.moments.put({ ...moment, synced: true });
  } catch (error) {
    console.error('Failed to cache moment:', error);
  }
}

/**
 * Get all moments from IndexedDB cache
 * @returns {Promise<Array>} Cached moments
 */
export async function getMomentsFromCache() {
  try {
    const moments = await db.moments.orderBy('createdAt').reverse().toArray();
    return moments;
  } catch (error) {
    console.error('Failed to get cached moments:', error);
    return [];
  }
}

/**
 * Save a pending moment (offline creation)
 * @param {Object} momentData - Moment data to save
 * @returns {Promise<number>} Local ID of pending moment
 */
export async function savePendingMoment(momentData) {
  try {
    const localId = await db.pendingMoments.add({
      ...momentData,
      createdAt: new Date().toISOString(),
      pending: true,
    });
    return localId;
  } catch (error) {
    console.error('Failed to save pending moment:', error);
    throw error;
  }
}

/**
 * Get all pending moments
 * @returns {Promise<Array>} Pending moments
 */
export async function getPendingMoments() {
  try {
    return await db.pendingMoments.toArray();
  } catch (error) {
    console.error('Failed to get pending moments:', error);
    return [];
  }
}

/**
 * Get count of pending moments
 * @returns {Promise<number>} Number of pending moments
 */
export async function getPendingMomentsCount() {
  try {
    return await db.pendingMoments.count();
  } catch (error) {
    console.error('Failed to get pending moments count:', error);
    return 0;
  }
}

/**
 * Delete a pending moment after successful upload
 * @param {number} localId - Local ID of pending moment
 */
export async function deletePendingMoment(localId) {
  try {
    await db.pendingMoments.delete(localId);
  } catch (error) {
    console.error('Failed to delete pending moment:', error);
  }
}

/**
 * Sync pending moments to server
 * @returns {Promise<number>} Number of moments synced
 */
export async function syncPendingMoments() {
  try {
    const pending = await getPendingMoments();

    if (pending.length === 0) {
      return 0;
    }

    let syncedCount = 0;

    for (const pendingMoment of pending) {
      try {
        // Upload to server
        const response = await fetch('/api/moments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: pendingMoment.description,
            gpsLat: pendingMoment.gpsLat || 0,
            gpsLng: pendingMoment.gpsLng || 0,
            imageUrl: pendingMoment.imageUrl || null,
            audioUrl: pendingMoment.audioUrl || null,
          }),
        });

        if (response.ok) {
          const serverMoment = await response.json();

          // Save to cache
          await saveMomentToCache(serverMoment);

          // Delete pending
          await deletePendingMoment(pendingMoment.localId);

          syncedCount++;
        }
      } catch (error) {
        console.error('Failed to sync moment:', error);
        // Continue with next moment
      }
    }

    return syncedCount;
  } catch (error) {
    console.error('Sync failed:', error);
    return 0;
  }
}

/**
 * Clear all cached data
 */
export async function clearAllCache() {
  try {
    await db.moments.clear();
    await db.pendingMoments.clear();
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}
