/**
 * Geofence Manager
 * Monitors user location and triggers notifications when entering/leaving geofenced areas
 */

import { isInsideGeofence } from '@/utils/location-utils';

class GeofenceManager {
  constructor() {
    this.geofences = [];
    this.watchId = null;
    this.currentPosition = null;
    this.activeGeofences = new Set(); // Track which geofences user is currently inside
  }

  /**
   * Add a geofence
   * @param {Object} geofence - {id, name, lat, lng, radius, onEnter, onExit}
   */
  addGeofence(geofence) {
    if (!geofence.id || !geofence.lat || !geofence.lng || !geofence.radius) {
      throw new Error('Geofence must have id, lat, lng, and radius');
    }

    // Remove existing geofence with same ID
    this.removeGeofence(geofence.id);

    this.geofences.push({
      id: geofence.id,
      name: geofence.name || 'Unnamed Location',
      lat: geofence.lat,
      lng: geofence.lng,
      radius: geofence.radius, // in meters
      onEnter: geofence.onEnter || null,
      onExit: geofence.onExit || null,
      notifyOnEnter: geofence.notifyOnEnter !== false, // default true
      notifyOnExit: geofence.notifyOnExit !== false, // default true
    });

    console.log(`Geofence added: ${geofence.name} (${geofence.radius}m radius)`);
  }

  /**
   * Remove a geofence by ID
   * @param {string} id - Geofence ID
   */
  removeGeofence(id) {
    this.geofences = this.geofences.filter(g => g.id !== id);
    this.activeGeofences.delete(id);
  }

  /**
   * Clear all geofences
   */
  clearGeofences() {
    this.geofences = [];
    this.activeGeofences.clear();
  }

  /**
   * Start monitoring geofences
   */
  startMonitoring() {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return false;
    }

    if (this.watchId !== null) {
      console.log('Geofence monitoring already active');
      return true;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        this.checkGeofences();
      },
      (error) => {
        console.error('Geofence monitoring error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    console.log('Geofence monitoring started');
    return true;
  }

  /**
   * Stop monitoring geofences
   */
  stopMonitoring() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      console.log('Geofence monitoring stopped');
    }
  }

  /**
   * Check current position against all geofences
   */
  checkGeofences() {
    if (!this.currentPosition) return;

    const { lat, lng } = this.currentPosition;

    this.geofences.forEach(geofence => {
      const isInside = isInsideGeofence(
        lat,
        lng,
        geofence.lat,
        geofence.lng,
        geofence.radius
      );

      const wasInside = this.activeGeofences.has(geofence.id);

      // Entering geofence
      if (isInside && !wasInside) {
        this.activeGeofences.add(geofence.id);
        console.log(`Entered geofence: ${geofence.name}`);

        // Trigger callback
        if (geofence.onEnter) {
          geofence.onEnter(geofence, this.currentPosition);
        }

        // Show notification
        if (geofence.notifyOnEnter && 'Notification' in window) {
          this.showNotification(
            `Entered ${geofence.name}`,
            `You are now near ${geofence.name}`
          );
        }

        // Trigger vibration
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
      }

      // Exiting geofence
      if (!isInside && wasInside) {
        this.activeGeofences.delete(geofence.id);
        console.log(`Exited geofence: ${geofence.name}`);

        // Trigger callback
        if (geofence.onExit) {
          geofence.onExit(geofence, this.currentPosition);
        }

        // Show notification
        if (geofence.notifyOnExit && 'Notification' in window) {
          this.showNotification(
            `Left ${geofence.name}`,
            `You have left ${geofence.name}`
          );
        }

        // Trigger vibration
        if ('vibrate' in navigator) {
          navigator.vibrate(200);
        }
      }
    });
  }

  /**
   * Show browser notification
   * @param {string} title
   * @param {string} body
   */
  async showNotification(title, body) {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return;
    }

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    // Show notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'geofence',
        vibrate: [200, 100, 200],
      });
    }
  }

  /**
   * Get all active geofences (user is currently inside)
   * @returns {Array} Array of geofence objects
   */
  getActiveGeofences() {
    return this.geofences.filter(g => this.activeGeofences.has(g.id));
  }

  /**
   * Get all geofences
   * @returns {Array}
   */
  getAllGeofences() {
    return this.geofences;
  }

  /**
   * Get current position
   * @returns {Object|null}
   */
  getCurrentPosition() {
    return this.currentPosition;
  }

  /**
   * Check if monitoring is active
   * @returns {boolean}
   */
  isMonitoring() {
    return this.watchId !== null;
  }
}

// Create singleton instance
const geofenceManager = new GeofenceManager();

export default geofenceManager;
