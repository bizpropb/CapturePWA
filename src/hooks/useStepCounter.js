import { useEffect, useState, useRef } from 'react';
import { startStepCounter, requestMotionPermission, checkMotionSupport } from '@/lib/sensor-utils';

/**
 * Hook to count steps using accelerometer
 * Note: This is a rough estimate, not as accurate as native step counters
 * @param {boolean} enabled - Whether to enable step counting
 * @returns {Object} Step count and control functions
 */
export function useStepCounter(enabled = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
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

  // Start counting steps
  const start = async () => {
    if (!isSupported) return false;

    // Request permission if needed
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    // Start step counter
    cleanupRef.current = startStepCounter((count) => {
      setStepCount(count);
    });

    setIsActive(true);
    return true;
  };

  // Stop counting
  const stop = () => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsActive(false);
  };

  // Reset counter
  const reset = () => {
    setStepCount(0);
  };

  // Auto-start if enabled
  useEffect(() => {
    if (enabled && isSupported && !isActive) {
      start();
    }

    return () => {
      stop();
    };
  }, [enabled, isSupported]);

  return {
    isSupported,
    hasPermission,
    stepCount,
    isActive,
    start,
    stop,
    reset,
    requestPermission,
  };
}
