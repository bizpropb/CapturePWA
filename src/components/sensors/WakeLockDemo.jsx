'use client';

import { useState } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import Button from '@/components/ui/Button';

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
      <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
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
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📱</span>
        <h3 className="text-white font-semibold">Screen Wake Lock</h3>
      </div>

      <div className="space-y-4">
        {/* Status Display */}
        <div className={`p-4 rounded-lg border-2 ${
          wakeLock.isActive
            ? 'bg-green-500/20 border-green-500'
            : 'bg-gray-900/30 border-gray-700'
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

          <p className={`text-xs mt-2 ${wakeLock.isActive ? 'text-green-300' : 'text-red-300'}`}>
            {wakeLock.isActive 
              ? '✓ Your screen will not turn off or dim while wake lock is active'
              : '✗ Your screen may turn off or dim because wake lock is inactive'}
          </p>
        </div>

        {/* Simulation Controls */}
        <div className="space-y-3 p-3 rounded bg-gray-900/30 border border-gray-700">
          <p className="text-sm text-neutral-400">
            Simulate an activity (video recording, audio playback):
          </p>

          <Button 
            onClick={toggleSimulation}
            variant={simulatedActivity ? 'secondary' : 'secondary'}
            fullWidth
          >
            {simulatedActivity ? 'Stop Activity' : 'Start Activity'}
          </Button>

          {simulatedActivity && (
            <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
              <p className="text-sm text-blue-300 flex items-center gap-2">
                <span className="animate-pulse">🎬</span>
                <span>Simulating activity... Screen will stay on</span>
              </p>
            </div>
          )}
        </div>

        {/* Screen Lock Toggle */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📱</span>
                <h4 className="font-medium">Screen Lock</h4>
              </div>
              <p className="text-sm text-gray-400">
                Prevent screen from turning off
              </p>
            </div>
            <button
              onClick={wakeLock.isActive ? wakeLock.release : wakeLock.request}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                wakeLock.isActive ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-label="Toggle screen lock"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  wakeLock.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
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
        <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700 space-y-2">
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
