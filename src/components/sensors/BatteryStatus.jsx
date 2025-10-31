'use client';

import { useBattery } from '@/hooks/useBattery';

export default function BatteryStatus() {
  const battery = useBattery();

  if (!battery.isSupported) {
    return (
      <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🔋</span>
          <h3 className="text-white font-semibold">Battery Status</h3>
        </div>
        <p className="text-neutral-400 text-sm">
          Battery API not supported in this browser
        </p>
      </div>
    );
  }

  const getBatteryColor = () => {
    if (battery.charging) return 'text-green-400';
    if (battery.level >= 50) return 'text-green-400';
    if (battery.level >= 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBatteryBgColor = () => {
    if (battery.charging) return 'bg-green-500/20';
    if (battery.level >= 50) return 'bg-green-500/20';
    if (battery.level >= 20) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{battery.icon}</span>
        <h3 className="text-white font-semibold">Battery Status</h3>
      </div>

      <div className="space-y-3">
        {/* Battery Level */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Level</span>
            <span className={`text-sm font-semibold ${getBatteryColor()}`}>
              {battery.level !== null ? `${battery.level}%` : 'Loading...'}
            </span>
          </div>

          {/* Battery Bar */}
          {battery.level !== null && (
            <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  battery.charging ? 'bg-green-500' :
                  battery.level >= 50 ? 'bg-green-500' :
                  battery.level >= 20 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${battery.level}%` }}
              />
            </div>
          )}
        </div>

        {/* Charging Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-400">Status</span>
          <span className={`text-sm font-medium ${getBatteryColor()}`}>
            {battery.charging ? 'Charging' : 'Not Charging'}
          </span>
        </div>

        {/* Time Remaining */}
        {battery.charging && battery.chargingTime !== Infinity && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Time to Full</span>
            <span className="text-sm text-neutral-300">
              {battery.formattedChargingTime}
            </span>
          </div>
        )}

        {!battery.charging && battery.dischargingTime !== Infinity && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-neutral-400">Time Remaining</span>
            <span className="text-sm text-neutral-300">
              {battery.formattedDischargingTime}
            </span>
          </div>
        )}

        {/* Low Battery Warning */}
        {battery.isLowBattery && (
          <div className={`${getBatteryBgColor()} border border-red-500/30 p-3 rounded-lg`}>
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span>⚠️</span>
              <span>Low battery mode active. Some features may be limited.</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
