/**
 * API client functions for moments CRUD operations
 * With offline support using IndexedDB
 */

import {
  getMomentsFromCache,
  saveMomentToCache,
  savePendingMoment,
  getPendingMoments,
} from './db';

const API_BASE = '/api/moments';

/**
 * Fetch all moments
 * Falls back to cached data if offline or network error
 * @returns {Promise<Array>} Array of moment objects
 */
export async function fetchMoments() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch moments');
    }
    const moments = await response.json();

    // Cache the fetched moments
    for (const moment of moments) {
      await saveMomentToCache(moment);
    }

    return moments;
  } catch (error) {
    console.error('Error fetching moments, using cache:', error);

    // Fall back to cached data
    const cachedMoments = await getMomentsFromCache();
    const pendingMoments = await getPendingMoments();

    // Combine cached and pending moments
    return [...cachedMoments, ...pendingMoments];
  }
}

/**
 * Fetch a single moment by ID
 * @param {number} id - Moment ID
 * @returns {Promise<Object>} Moment object
 */
export async function fetchMomentById(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch moment');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching moment:', error);
    throw error;
  }
}

/**
 * Create a new moment
 * Saves to pending queue if offline
 * @param {Object} data - Moment data { description, gpsLat?, gpsLng?, imageUrl?, audioUrl? }
 * @returns {Promise<Object>} Created moment object (or pending moment)
 */
export async function createMoment(data) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create moment');
    }

    const moment = await response.json();

    // Cache the created moment
    await saveMomentToCache(moment);

    return moment;
  } catch (error) {
    console.error('Error creating moment, saving offline:', error);

    // If offline or network error, save to pending queue
    const localId = await savePendingMoment(data);

    // Return a pending moment object
    return {
      localId,
      ...data,
      createdAt: new Date().toISOString(),
      pending: true,
    };
  }
}

/**
 * Update an existing moment
 * @param {number} id - Moment ID
 * @param {Object} data - Updated moment data
 * @returns {Promise<Object>} Updated moment object
 */
export async function updateMoment(id, data) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update moment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating moment:', error);
    throw error;
  }
}

/**
 * Delete a moment
 * @param {number} id - Moment ID
 * @returns {Promise<void>}
 */
export async function deleteMoment(id) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete moment');
    }
  } catch (error) {
    console.error('Error deleting moment:', error);
    throw error;
  }
}
