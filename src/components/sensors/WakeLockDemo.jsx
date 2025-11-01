'use client';

import { useState } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';

export default function WakeLockDemo() {
  const wakeLock = useWakeLock();
  const [simulatedActivity, setSimulatedActivity] = useState(false);

  const toggleSimulation = () => {
    if (simulatedActivity) {
      setSimulatedActivity(false);
      wakeLock.release();
    } else {
      setSimulatedActivity(true);
      wakeLock.request();
    }
  };

  if (!wakeLock.isSupported) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">📱</span>
          <h3 className="text-white font-semibold">Screen Wake Lock</h3>
        </div>
        <p className="text-neutral-400 text-sm">
          Wake Lock API not supported in this browser
        </p>
        <p className="text-xs text-neutral-500 mt-2">
          Wake Lock prevents the screen from dimming or locking during activities.
          Supported in Chrome, Edge, and Safari (iOS 16.4+).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📱</span>
        <h3 className="text-white font-semibold">Screen Wake Lock</h3>
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className={`p-4 rounded-lg border-2 transition ${
          wakeLock.isActive
            ? 'bg-green-500/20 border-green-500'
            : 'bg-neutral-800 border-neutral-700'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                wakeLock.isActive ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'
              }`}></div>
              <span className={`text-sm font-semibold ${
                wakeLock.isActive ? 'text-green-400' : 'text-neutral-400'
              }`}>
                {wakeLock.isActive ? 'Active - Screen Stays On' : 'Inactive'}
              </span>
            </div>
          </div>

          {wakeLock.isActive && (
            <p className="text-xs text-green-300 mt-2">
              ✓ Your screen will not turn off or dim while wake lock is active
            </p>
          )}
        </div>

        {/* Simulation Controls */}
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">
            Simulate an activity (video recording, audio playback):
          </p>

          <button
            onClick={toggleSimulation}
            className={`w-full py-3 px-4 rounded-lg font-medium transition ${
              simulatedActivity
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {simulatedActivity ? 'Stop Activity' : 'Start Activity'}
          </button>

          {simulatedActivity && (
            <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <span className="animate-pulse">🎬</span>
                <span>Simulating activity... Screen will stay on</span>
              </p>
            </div>
          )}
        </div>

        {/* Manual Controls */}
        <div className="pt-4 border-t border-neutral-700 space-y-2">
          <p className="text-xs text-neutral-400 mb-2">Manual Controls:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={wakeLock.request}
              disabled={wakeLock.isActive}
              className="py-2 px-3 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded text-sm transition"
            >
              Request Lock
            </button>
            <button
              onClick={wakeLock.release}
              disabled={!wakeLock.isActive}
              className="py-2 px-3 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-800 disabled:text-neutral-600 text-white rounded text-sm transition"
            >
              Release Lock
            </button>
          </div>
        </div>

        {/* Error Display */}
        {wakeLock.error && (
          <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-lg">
            <p className="text-sm text-red-300">
              Error: {wakeLock.error}
            </p>
          </div>
        )}

        {/* Info */}
        <div className="bg-neutral-800 p-3 rounded-lg space-y-2">
          <p className="text-xs font-semibold text-neutral-300">How It Works:</p>
          <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
            <li>Automatically activated during video recording</li>
            <li>Stays active during audio playback</li>
            <li>Released when activity stops</li>
            <li>Auto re-acquires when page becomes visible</li>
            <li>Prevents screen dimming and auto-lock</li>
          </ul>
        </div>

        {/* Browser Compatibility */}
        <details className="text-xs text-neutral-500">
          <summary className="cursor-pointer hover:text-neutral-400">
            Browser Support
          </summary>
          <div className="mt-2 space-y-1 pl-4">
            <p>✅ Chrome 84+ (Desktop & Android)</p>
            <p>✅ Edge 84+</p>
            <p>✅ Safari 16.4+ (iOS & macOS)</p>
            <p>❌ Firefox (not supported)</p>
          </div>
        </details>
      </div>
    </div>
  );
}
