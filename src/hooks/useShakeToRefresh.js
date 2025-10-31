import { useEffect, useRef, useState } from 'react';
import { detectShake, requestMotionPermission, checkMotionSupport } from '@/lib/sensor-utils';

/**
 * Hook to detect shake gesture and trigger refresh
 * @param {Function} onShake - Callback function to execute on shake
 * @param {Object} options - Configuration options
 * @returns {Object} Hook state and functions
 */
export function useShakeToRefresh(onShake, options = {}) {
  const {
    threshold = 15,
    enabled = true,
    cooldown = 2000, // Prevent multiple triggers
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const lastShakeTime = useRef(0);
  const cleanupRef = useRef(null);

  // Check support on mount
  useEffect(() => {
    setIsSupported(checkMotionSupport());
  }, []);

  // Request permission
  const requestPermission = async () => {
    const permission = await requestMotionPermission();
    const granted = permission === 'granted';
    setHasPermission(granted);
    return granted;
  };

  // Set up shake detection
  useEffect(() => {
    if (!enabled || !isSupported) return;

    const setupShakeDetection = async () => {
      // Request permission if needed
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) return;
      }

      // Set up shake detection
      cleanupRef.current = detectShake(() => {
        const now = Date.now();
        if (now - lastShakeTime.current > cooldown) {
          lastShakeTime.current = now;
          setIsShaking(true);

          // Visual feedback
          setTimeout(() => setIsShaking(false), 500);

          // Trigger callback
          if (onShake) {
            onShake();
          }
        }
      }, threshold);
    };

    setupShakeDetection();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [enabled, isSupported, hasPermission, onShake, threshold, cooldown]);

  return {
    isSupported,
    hasPermission,
    isShaking,
    requestPermission,
  };
}
