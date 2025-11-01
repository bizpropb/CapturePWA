'use client';

import { usePullToRefresh } from '@/hooks/usePullToRefresh';

/**
 * PullToRefreshWrapper Component
 * Wraps content with pull-to-refresh functionality
 * Shows a visual indicator when pulling
 */
export default function PullToRefreshWrapper({ children, onRefresh }) {
  const {
    containerRef,
    pullDistance,
    isRefreshing,
    isTriggered
  } = usePullToRefresh(onRefresh, {
    threshold: 80,
    disabled: false
  });

  // Calculate rotation for spinner based on pull distance
  const rotation = Math.min((pullDistance / 80) * 360, 360);

  // Calculate opacity for indicator
  const opacity = Math.min(pullDistance / 80, 1);

  return (
    <div ref={containerRef} className="relative min-h-screen">
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-200"
        style={{
          transform: `translate(-50%, ${Math.max(pullDistance - 40, 0)}px)`,
          opacity: opacity
        }}
      >
        <div className="bg-neutral-800 border border-neutral-700 rounded-full p-4 shadow-lg">
          {isRefreshing ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className="w-8 h-8 flex items-center justify-center text-2xl transition-transform duration-200"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            >
              {isTriggered ? '🔄' : '⬇️'}
            </div>
          )}
        </div>

        {/* Pull instruction text */}
        <div className="text-center mt-2">
          <p className="text-xs text-neutral-400 font-medium">
            {isRefreshing ? 'Refreshing...' : isTriggered ? 'Release to refresh' : 'Pull to refresh'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200"
        style={{
          transform: isRefreshing ? 'translateY(80px)' : 'translateY(0)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
