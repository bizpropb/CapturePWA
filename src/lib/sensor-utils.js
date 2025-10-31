/**
 * Device Sensor Utilities
 * Handles accelerometer, gyroscope, ambient light, and battery sensors
 */

/**
 * Check if device motion (accelerometer/gyroscope) is supported
 * @returns {boolean} True if device motion is available
 */
export function checkMotionSupport() {
  return typeof DeviceMotionEvent !== 'undefined';
}

/**
 * Check if device orientation is supported
 * @returns {boolean} True if device orientation is available
 */
export function checkOrientationSupport() {
  return typeof DeviceOrientationEvent !== 'undefined';
}

/**
 * Check if ambient light sensor is supported
 * @returns {boolean} True if ambient light sensor is available
 */
export function checkAmbientLightSupport() {
  return 'AmbientLightSensor' in window;
}

/**
 * Check if battery API is supported
 * @returns {boolean} True if battery API is available
 */
export function checkBatterySupport() {
  return 'getBattery' in navigator;
}

/**
 * Request permission for device motion (required on iOS 13+)
 * @returns {Promise<string>} Permission state
 */
export async function requestMotionPermission() {
  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceMotionEvent.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting motion permission:', error);
      return 'denied';
    }
  }
  // Permission not required (non-iOS or older iOS)
  return 'granted';
}

/**
 * Request permission for device orientation (required on iOS 13+)
 * @returns {Promise<string>} Permission state
 */
export async function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const permission = await DeviceOrientationEvent.requestPermission();
      return permission;
    } catch (error) {
      console.error('Error requesting orientation permission:', error);
      return 'denied';
    }
  }
  return 'granted';
}

/**
 * Detect shake gesture using accelerometer
 * @param {Function} callback - Function to call on shake detection
 * @param {number} threshold - Shake sensitivity (default: 15)
 * @returns {Function} Cleanup function to remove listener
 */
export function detectShake(callback, threshold = 15) {
  if (!checkMotionSupport()) {
    console.warn('Device motion not supported');
    return () => {};
  }

  let lastX = 0, lastY = 0, lastZ = 0;
  let lastTime = Date.now();

  const handleMotion = (event) => {
    const { x, y, z } = event.accelerationIncludingGravity || {};
    if (x === null || y === null || z === null) return;

    const currentTime = Date.now();
    const timeDiff = currentTime - lastTime;

    if (timeDiff > 100) {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      const acceleration = Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

      if (acceleration > threshold) {
        callback();
      }

      lastX = x;
      lastY = y;
      lastZ = z;
      lastTime = currentTime;
    }
  };

  window.addEventListener('devicemotion', handleMotion);

  return () => {
    window.removeEventListener('devicemotion', handleMotion);
  };
}

/**
 * Monitor device orientation changes
 * @param {Function} callback - Function to call with orientation data
 * @returns {Function} Cleanup function to remove listener
 */
export function monitorOrientation(callback) {
  if (!checkOrientationSupport()) {
    console.warn('Device orientation not supported');
    return () => {};
  }

  const handleOrientation = (event) => {
    callback({
      alpha: event.alpha, // Rotation around z-axis (0-360)
      beta: event.beta,   // Rotation around x-axis (-180 to 180)
      gamma: event.gamma, // Rotation around y-axis (-90 to 90)
      absolute: event.absolute
    });
  };

  window.addEventListener('deviceorientation', handleOrientation);

  return () => {
    window.removeEventListener('deviceorientation', handleOrientation);
  };
}

/**
 * Simple step counter using accelerometer
 * Note: This is a rough estimate, not as accurate as native step counters
 * @param {Function} callback - Function to call on step detection
 * @returns {Function} Cleanup function to remove listener
 */
export function startStepCounter(callback) {
  if (!checkMotionSupport()) {
    console.warn('Device motion not supported');
    return () => {};
  }

  let lastY = 0;
  let stepCount = 0;
  let lastStepTime = 0;
  const stepThreshold = 1.2;
  const minStepInterval = 300; // ms

  const handleMotion = (event) => {
    const { y } = event.accelerationIncludingGravity || {};
    if (y === null) return;

    const currentTime = Date.now();
    const deltaY = Math.abs(y - lastY);

    // Detect vertical movement spike (potential step)
    if (deltaY > stepThreshold &&
        currentTime - lastStepTime > minStepInterval) {
      stepCount++;
      lastStepTime = currentTime;
      callback(stepCount);
    }

    lastY = y;
  };

  window.addEventListener('devicemotion', handleMotion);

  return () => {
    window.removeEventListener('devicemotion', handleMotion);
  };
}

/**
 * Monitor ambient light levels
 * @param {Function} callback - Function to call with light level (lux)
 * @returns {Function|null} Cleanup function or null if not supported
 */
export async function monitorAmbientLight(callback) {
  if (!checkAmbientLightSupport()) {
    console.warn('Ambient light sensor not supported');
    return null;
  }

  try {
    const sensor = new AmbientLightSensor();

    sensor.addEventListener('reading', () => {
      callback(sensor.illuminance); // Light level in lux
    });

    sensor.addEventListener('error', (event) => {
      console.error('Ambient light sensor error:', event.error);
    });

    await sensor.start();

    return () => {
      sensor.stop();
    };
  } catch (error) {
    console.error('Failed to start ambient light sensor:', error);
    return null;
  }
}

/**
 * Get battery status
 * @returns {Promise<BatteryManager>} Battery information
 */
export async function getBatteryStatus() {
  if (!checkBatterySupport()) {
    throw new Error('Battery API not supported');
  }

  try {
    const battery = await navigator.getBattery();
    return {
      level: Math.round(battery.level * 100), // Percentage
      charging: battery.charging,
      chargingTime: battery.chargingTime, // Seconds until fully charged
      dischargingTime: battery.dischargingTime, // Seconds until empty
    };
  } catch (error) {
    console.error('Failed to get battery status:', error);
    throw error;
  }
}

/**
 * Monitor battery status changes
 * @param {Function} callback - Function to call with battery updates
 * @returns {Promise<Function>} Cleanup function
 */
export async function monitorBatteryStatus(callback) {
  if (!checkBatterySupport()) {
    console.warn('Battery API not supported');
    return () => {};
  }

  try {
    const battery = await navigator.getBattery();

    const updateCallback = () => {
      callback({
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      });
    };

    // Initial call
    updateCallback();

    // Listen for changes
    battery.addEventListener('levelchange', updateCallback);
    battery.addEventListener('chargingchange', updateCallback);
    battery.addEventListener('chargingtimechange', updateCallback);
    battery.addEventListener('dischargingtimechange', updateCallback);

    return () => {
      battery.removeEventListener('levelchange', updateCallback);
      battery.removeEventListener('chargingchange', updateCallback);
      battery.removeEventListener('chargingtimechange', updateCallback);
      battery.removeEventListener('dischargingtimechange', updateCallback);
    };
  } catch (error) {
    console.error('Failed to monitor battery status:', error);
    return () => {};
  }
}

/**
 * Determine if battery is low (below 20%)
 * @returns {Promise<boolean>} True if battery is low
 */
export async function isBatteryLow() {
  try {
    const battery = await getBatteryStatus();
    return battery.level < 20 && !battery.charging;
  } catch {
    return false;
  }
}

/**
 * Get suggested theme based on ambient light
 * @param {number} lux - Light level in lux
 * @returns {string} 'dark' or 'light'
 */
export function getThemeForLightLevel(lux) {
  // Typical indoor light: 100-500 lux
  // Dim indoor light: < 100 lux
  // Bright indoor/outdoor: > 500 lux

  if (lux < 50) {
    return 'dark'; // Very dim, use dark theme
  } else if (lux > 400) {
    return 'light'; // Bright, use light theme
  }

  // Medium light, check user preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
