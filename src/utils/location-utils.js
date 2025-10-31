/**
 * Location Utilities
 * Functions for GPS calculations, distance measurement, and geofencing
 */

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

/**
 * Format distance in human-readable format
 * @param {number} distanceInMeters - Distance in meters
 * @returns {string} Formatted distance (e.g., "1.5 km" or "250 m")
 */
export function formatDistance(distanceInMeters) {
  if (distanceInMeters >= 1000) {
    return `${(distanceInMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceInMeters)} m`;
}

/**
 * Calculate total distance traveled between multiple moments
 * @param {Array} moments - Array of moment objects with gpsLat and gpsLng
 * @returns {number} Total distance in meters
 */
export function calculateTotalDistance(moments) {
  if (moments.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < moments.length; i++) {
    const prev = moments[i - 1];
    const curr = moments[i];

    // Skip if coordinates are 0,0 (not captured)
    if (
      prev.gpsLat === 0 && prev.gpsLng === 0 ||
      curr.gpsLat === 0 && curr.gpsLng === 0
    ) {
      continue;
    }

    totalDistance += calculateDistance(
      prev.gpsLat,
      prev.gpsLng,
      curr.gpsLat,
      curr.gpsLng
    );
  }

  return totalDistance;
}

/**
 * Check if a coordinate is within a geofence radius
 * @param {number} lat - Current latitude
 * @param {number} lng - Current longitude
 * @param {number} centerLat - Geofence center latitude
 * @param {number} centerLng - Geofence center longitude
 * @param {number} radiusInMeters - Geofence radius in meters
 * @returns {boolean} True if inside geofence
 */
export function isInsideGeofence(lat, lng, centerLat, centerLng, radiusInMeters) {
  const distance = calculateDistance(lat, lng, centerLat, centerLng);
  return distance <= radiusInMeters;
}

/**
 * Find moments near a specific location
 * @param {Array} moments - Array of moment objects with gpsLat and gpsLng
 * @param {number} targetLat - Target latitude
 * @param {number} targetLng - Target longitude
 * @param {number} radiusInMeters - Search radius in meters (default: 1000)
 * @returns {Array} Array of moments within radius, sorted by distance
 */
export function findMomentsNearLocation(moments, targetLat, targetLng, radiusInMeters = 1000) {
  const momentsWithDistance = moments
    .filter(m => m.gpsLat !== 0 || m.gpsLng !== 0) // Filter out moments without GPS
    .map(moment => ({
      ...moment,
      distance: calculateDistance(moment.gpsLat, moment.gpsLng, targetLat, targetLng)
    }))
    .filter(m => m.distance <= radiusInMeters)
    .sort((a, b) => a.distance - b.distance);

  return momentsWithDistance;
}

/**
 * Get bounding box for a set of coordinates
 * Useful for fitting a map view to multiple markers
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @returns {Object} Bounding box {minLat, maxLat, minLng, maxLng, center}
 */
export function getBoundingBox(coordinates) {
  if (coordinates.length === 0) {
    return null;
  }

  let minLat = coordinates[0].lat;
  let maxLat = coordinates[0].lat;
  let minLng = coordinates[0].lng;
  let maxLng = coordinates[0].lng;

  coordinates.forEach(({ lat, lng }) => {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  });

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    center: { lat: centerLat, lng: centerLng }
  };
}

/**
 * Convert moment objects to coordinate array for mapping
 * @param {Array} moments - Array of moment objects
 * @returns {Array} Array of {lat, lng, popup} objects
 */
export function momentsToCoordinates(moments) {
  return moments
    .filter(m => m.gpsLat !== 0 || m.gpsLng !== 0)
    .map(m => ({
      lat: m.gpsLat,
      lng: m.gpsLng,
      popup: m.description || m.locationName || 'Moment',
      moment: m
    }));
}

/**
 * Group moments by proximity (clustering)
 * @param {Array} moments - Array of moment objects with gpsLat and gpsLng
 * @param {number} clusterRadiusInMeters - Radius for grouping (default: 100m)
 * @returns {Array} Array of clusters: [{moments: [], center: {lat, lng}, count}]
 */
export function clusterMoments(moments, clusterRadiusInMeters = 100) {
  const clusters = [];
  const processed = new Set();

  moments
    .filter(m => m.gpsLat !== 0 || m.gpsLng !== 0)
    .forEach((moment, index) => {
      if (processed.has(index)) return;

      const cluster = {
        moments: [moment],
        center: { lat: moment.gpsLat, lng: moment.gpsLng },
        count: 1
      };

      // Find nearby moments
      moments.forEach((other, otherIndex) => {
        if (
          index !== otherIndex &&
          !processed.has(otherIndex) &&
          (other.gpsLat !== 0 || other.gpsLng !== 0)
        ) {
          const distance = calculateDistance(
            moment.gpsLat,
            moment.gpsLng,
            other.gpsLat,
            other.gpsLng
          );

          if (distance <= clusterRadiusInMeters) {
            cluster.moments.push(other);
            cluster.count++;
            processed.add(otherIndex);
          }
        }
      });

      // Recalculate cluster center (average position)
      if (cluster.moments.length > 1) {
        const avgLat = cluster.moments.reduce((sum, m) => sum + m.gpsLat, 0) / cluster.moments.length;
        const avgLng = cluster.moments.reduce((sum, m) => sum + m.gpsLng, 0) / cluster.moments.length;
        cluster.center = { lat: avgLat, lng: avgLng };
      }

      clusters.push(cluster);
      processed.add(index);
    });

  return clusters;
}

/**
 * Calculate bearing (direction) between two points
 * @param {number} lat1 - Start latitude
 * @param {number} lng1 - Start longitude
 * @param {number} lat2 - End latitude
 * @param {number} lng2 - End longitude
 * @returns {number} Bearing in degrees (0-360, 0=North, 90=East)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  const bearing = ((θ * 180) / Math.PI + 360) % 360;

  return bearing;
}

/**
 * Convert bearing to cardinal direction
 * @param {number} bearing - Bearing in degrees
 * @returns {string} Cardinal direction (e.g., "N", "NE", "E", etc.)
 */
export function bearingToCardinal(bearing) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

/**
 * Check if GPS coordinates are valid
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {boolean} True if valid
 */
export function isValidGPSCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !(lat === 0 && lng === 0) // Exclude default 0,0
  );
}
