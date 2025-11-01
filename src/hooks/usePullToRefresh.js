import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * usePullToRefresh Hook
 * Implements pull-to-refresh gesture for mobile devices
 *
 * @param {Function} onRefresh - Callback function to execute on refresh
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Distance in pixels to trigger refresh (default: 80)
 * @param {boolean} options.disabled - Disable pull-to-refresh (default: false)
 * @returns {Object} Pull-to-refresh state and handlers
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80,
    disabled = false
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);

  const startY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (disabled || isRefreshing) return;

    // Only start pull if we're at the top of the page
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e) => {
    if (!isPulling || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    // Only pull down (positive distance) and apply resistance
    if (distance > 0) {
      // Apply resistance curve (gets harder to pull as distance increases)
      const resistanceFactor = Math.min(distance / threshold, 2);
      const adjustedDistance = distance * (1 - resistanceFactor * 0.3);

      setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

      // Prevent default scroll behavior when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [isPulling, disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    // Trigger refresh if pulled past threshold
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        // Keep refreshing state for a moment to show completion
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      // Animate back to 0
      setPullDistance(0);
    }
  }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    isPulling,
    isTriggered: pullDistance >= threshold
  };
}
