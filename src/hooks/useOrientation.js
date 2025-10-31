import { useEffect, useState } from 'react';
import { monitorOrientation, requestOrientationPermission, checkOrientationSupport } from '@/lib/sensor-utils';

/**
 * Hook to monitor device orientation
 * @param {boolean} enabled - Whether to enable orientation monitoring
 * @returns {Object} Orientation data and control functions
 */
export function useOrientation(enabled = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [orientation, setOrientation] = useState({
    alpha: 0,
    beta: 0,
    gamma: 0,
    absolute: false,
  });

  // Check support on mount
  useEffect(() => {
    setIsSupported(checkOrientationSupport());
  }, []);

  // Request permission
  const requestPermission = async () => {
    const permission = await requestOrientationPermission();
    const granted = permission === 'granted';
    setHasPermission(granted);
    return granted;
  };

  // Monitor orientation
  useEffect(() => {
    if (!enabled || !isSupported) return;

    const setupOrientation = async () => {
      // Request permission if needed
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Start monitoring
      const cleanup = monitorOrientation((data) => {
        setOrientation(data);
      });

      return cleanup;
    };

    let cleanup;
    setupOrientation().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [enabled, isSupported, hasPermission]);

  // Helper to get orientation description
  const getOrientationDescription = () => {
    const { beta, gamma } = orientation;

    // Beta: front-to-back tilt (-180 to 180)
    // Gamma: left-to-right tilt (-90 to 90)

    if (Math.abs(beta) < 45 && Math.abs(gamma) < 45) {
      return 'flat';
    } else if (beta > 45) {
      return 'tilted backward';
    } else if (beta < -45) {
      return 'tilted forward';
    } else if (gamma > 45) {
      return 'tilted right';
    } else if (gamma < -45) {
      return 'tilted left';
    }

    return 'tilted';
  };

  return {
    isSupported,
    hasPermission,
    orientation,
    description: getOrientationDescription(),
    requestPermission,
  };
}
