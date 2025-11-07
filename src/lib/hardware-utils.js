/**
 * Hardware detection and utility functions
 * Checks browser support for camera, GPS, and microphone
 */

/**
 * Check if camera/video is supported
 * @returns {boolean} True if camera is available
 */
export function checkCameraSupport() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Check if GPS/geolocation is supported
 * @returns {boolean} True if GPS is available
 */
export function checkGPSSupport() {
  return !!navigator.geolocation;
}

/**
 * Check if microphone/audio is supported
 * @returns {boolean} True if microphone is available
 */
export function checkAudioSupport() {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Request camera access
 * @param {Object} options - getUserMedia options
 * @returns {Promise<MediaStream>} Camera stream
 */
export async function requestCamera(options = { video: true }) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(options);
    return stream;
  } catch (error) {
    throw new Error(getMediaErrorMessage(error));
  }
}

/**
 * Request microphone access
 * @param {Object} options - getUserMedia options
 * @returns {Promise<MediaStream>} Audio stream
 */
export async function requestMicrophone(options = { audio: true }) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(options);
    return stream;
  } catch (error) {
    throw new Error(getMediaErrorMessage(error));
  }
}

/**
 * Request GPS location
 * @param {Object} options - Geolocation options
 * @returns {Promise<GeolocationPosition>} Position data
 */
export function requestLocation(options = { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }) {
  return new Promise((resolve, reject) => {
    if (!checkGPSSupport()) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('[GPS] Requesting location with options:', options);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('[GPS] Location received:', position);
        resolve(position);
      },
      (error) => {
        console.error('[GPS] Location error:', error);
        reject(new Error(getLocationErrorMessage(error)));
      },
      options
    );
  });
}

/**
 * Get user-friendly error message for media errors
 * @param {Error} error - Media error
 * @returns {string} User-friendly message
 */
function getMediaErrorMessage(error) {
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return 'No camera or microphone found';
  }
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return 'Permission denied. Please allow access in your browser settings.';
  }
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return 'Device is already in use';
  }
  if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
    return 'Device does not meet requirements';
  }
  return error.message || 'Failed to access media device';
}

/**
 * Get user-friendly error message for location errors
 * @param {GeolocationPositionError} error - Location error
 * @returns {string} User-friendly message
 */
function getLocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location permission denied';
    case error.POSITION_UNAVAILABLE:
      return 'Location unavailable';
    case error.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'Failed to get location';
  }
}

/**
 * Stop all tracks in a media stream
 * @param {MediaStream} stream - Stream to stop
 */
export function stopMediaStream(stream) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
}
