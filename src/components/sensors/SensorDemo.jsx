'use client';

import { useState } from 'react';
import { useShakeToRefresh } from '@/hooks/useShakeToRefresh';
import { useOrientation } from '@/hooks/useOrientation';
import { useStepCounter } from '@/hooks/useStepCounter';
import { useAmbientLight } from '@/hooks/useAmbientLight';
import BatteryStatus from './BatteryStatus';
import WakeLockDemo from './WakeLockDemo';

export default function SensorDemo() {
  const [shakeCount, setShakeCount] = useState(0);
  const [orientationEnabled, setOrientationEnabled] = useState(false);
  const [stepCounterEnabled, setStepCounterEnabled] = useState(false);
  const [lightSensorEnabled, setLightSensorEnabled] = useState(false);

  // Shake detection
  const shake = useShakeToRefresh(
    () => {
      setShakeCount(prev => prev + 1);
    },
    { enabled: true }
  );

  // Orientation
  const orientation = useOrientation(orientationEnabled);

  // Step counter
  const stepCounter = useStepCounter(stepCounterEnabled);

  // Ambient light
  const ambientLight = useAmbientLight({
    enabled: lightSensorEnabled,
  });

  return (
    <div className="space-y-6">
      {/* Shake to Refresh */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📳</span>
          <h3 className="text-white font-semibold">Shake Detection</h3>
        </div>

        {!shake.isSupported ? (
          <p className="text-neutral-400 text-sm">
            Shake detection not supported in this browser
          </p>
        ) : (
          <div className="space-y-3">
            {!shake.hasPermission && (
              <button
                onClick={shake.requestPermission}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              >
                Enable Shake Detection
              </button>
            )}

            {shake.hasPermission && (
              <>
                <div className={`text-center p-6 rounded-lg transition ${
                  shake.isShaking
                    ? 'bg-blue-500/20 border-2 border-blue-500'
                    : 'bg-neutral-800'
                }`}>
                  <p className="text-2xl mb-2">{shake.isShaking ? '📳' : '📱'}</p>
                  <p className="text-white font-semibold">
                    {shake.isShaking ? 'Shake Detected!' : 'Shake your device'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">Total Shakes</span>
                  <span className="text-2xl font-bold text-blue-400">{shakeCount}</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Device Orientation */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <h3 className="text-white font-semibold">Device Orientation</h3>
          </div>
          <button
            onClick={() => {
              if (!orientationEnabled && !orientation.hasPermission) {
                orientation.requestPermission().then(() => {
                  setOrientationEnabled(true);
                });
              } else {
                setOrientationEnabled(!orientationEnabled);
              }
            }}
            className={`px-3 py-1 rounded text-sm transition ${
              orientationEnabled
                ? 'bg-green-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {orientationEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {!orientation.isSupported ? (
          <p className="text-neutral-400 text-sm">
            Device orientation not supported in this browser
          </p>
        ) : orientationEnabled ? (
          <div className="space-y-3">
            <div className="text-center p-4 bg-neutral-800 rounded-lg">
              <p className="text-lg text-white font-semibold mb-2">
                {orientation.description}
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-neutral-400">Alpha</p>
                  <p className="text-white font-mono">
                    {orientation.orientation.alpha?.toFixed(0) || 0}°
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Beta</p>
                  <p className="text-white font-mono">
                    {orientation.orientation.beta?.toFixed(0) || 0}°
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Gamma</p>
                  <p className="text-white font-mono">
                    {orientation.orientation.gamma?.toFixed(0) || 0}°
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-neutral-400 text-sm">
            Enable to see device orientation data
          </p>
        )}
      </div>

      {/* Step Counter */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👟</span>
            <h3 className="text-white font-semibold">Step Counter</h3>
          </div>
          <button
            onClick={() => {
              if (!stepCounterEnabled && !stepCounter.hasPermission) {
                stepCounter.requestPermission().then(() => {
                  setStepCounterEnabled(true);
                });
              } else {
                setStepCounterEnabled(!stepCounterEnabled);
              }
            }}
            className={`px-3 py-1 rounded text-sm transition ${
              stepCounterEnabled
                ? 'bg-green-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {stepCounterEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {!stepCounter.isSupported ? (
          <p className="text-neutral-400 text-sm">
            Step counting not supported in this browser
          </p>
        ) : stepCounterEnabled ? (
          <div className="space-y-3">
            <div className="text-center p-6 bg-neutral-800 rounded-lg">
              <p className="text-5xl font-bold text-green-400 mb-2">
                {stepCounter.stepCount}
              </p>
              <p className="text-neutral-400">steps detected</p>
            </div>

            <button
              onClick={stepCounter.reset}
              className="w-full bg-neutral-700 text-white py-2 px-4 rounded-lg hover:bg-neutral-600 transition"
            >
              Reset Counter
            </button>

            <p className="text-xs text-neutral-500 text-center">
              Note: This is a rough estimate using the accelerometer
            </p>
          </div>
        ) : (
          <p className="text-neutral-400 text-sm">
            Enable to start counting steps (rough estimate)
          </p>
        )}
      </div>

      {/* Ambient Light Sensor */}
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h3 className="text-white font-semibold">Ambient Light</h3>
          </div>
          <button
            onClick={() => setLightSensorEnabled(!lightSensorEnabled)}
            className={`px-3 py-1 rounded text-sm transition ${
              lightSensorEnabled
                ? 'bg-green-600 text-white'
                : 'bg-neutral-700 text-neutral-300'
            }`}
          >
            {lightSensorEnabled ? 'Enabled' : 'Enable'}
          </button>
        </div>

        {!ambientLight.isSupported ? (
          <p className="text-neutral-400 text-sm">
            Ambient light sensor not supported in this browser
          </p>
        ) : lightSensorEnabled ? (
          <div className="space-y-3">
            <div className="text-center p-6 bg-neutral-800 rounded-lg">
              <p className="text-4xl font-bold text-yellow-400 mb-2">
                {ambientLight.lightLevel !== null
                  ? `${Math.round(ambientLight.lightLevel)} lux`
                  : 'Measuring...'}
              </p>
              <p className="text-neutral-400">{ambientLight.description}</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
              <span className="text-sm text-neutral-400">Suggested Theme</span>
              <span className="text-sm font-medium text-white">
                {ambientLight.suggestedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-neutral-400 text-sm">
            Enable to measure ambient light levels
          </p>
        )}
      </div>

      {/* Battery Status */}
      <BatteryStatus />

      {/* Wake Lock */}
      <WakeLockDemo />
    </div>
  );
}
