import { useEffect, useState } from 'react';
import { monitorBatteryStatus, checkBatterySupport, isBatteryLow } from '@/lib/sensor-utils';

/**
 * Hook to monitor device battery status
 * @param {boolean} enabled - Whether to enable battery monitoring
 * @returns {Object} Battery information and utilities
 */
export function useBattery(enabled = true) {
  const [isSupported, setIsSupported] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState({
    level: null,
    charging: false,
    chargingTime: Infinity,
    dischargingTime: Infinity,
  });

  // Check support on mount
  useEffect(() => {
    setIsSupported(checkBatterySupport());
  }, []);

  // Monitor battery status
  useEffect(() => {
    if (!enabled || !isSupported) return;

    let cleanup;

    const setupBatteryMonitor = async () => {
      try {
        cleanup = await monitorBatteryStatus((info) => {
          setBatteryInfo(info);
        });
      } catch (error) {
        console.error('Failed to monitor battery:', error);
      }
    };

    setupBatteryMonitor();

    return () => {
      if (cleanup) cleanup();
    };
  }, [enabled, isSupported]);

  // Helper to get battery status description
  const getStatusDescription = () => {
    if (batteryInfo.level === null) return 'Unknown';

    const { level, charging } = batteryInfo;

    if (charging) {
      return `Charging (${level}%)`;
    }

    if (level >= 80) return `Full (${level}%)`;
    if (level >= 50) return `Good (${level}%)`;
    if (level >= 20) return `Medium (${level}%)`;
    return `Low (${level}%)`;
  };

  // Helper to get battery icon emoji
  const getBatteryIcon = () => {
    if (batteryInfo.level === null) return '🔋';

    const { level, charging } = batteryInfo;

    if (charging) return '⚡';
    if (level >= 80) return '🔋';
    if (level >= 50) return '🔋';
    if (level >= 20) return '🪫';
    return '🪫';
  };

  // Helper to check if low battery mode should be enabled
  const isLowBattery = batteryInfo.level !== null &&
                       batteryInfo.level < 20 &&
                       !batteryInfo.charging;

  // Helper to format time
  const formatTime = (seconds) => {
    if (seconds === Infinity || seconds === null) return 'Unknown';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return {
    isSupported,
    level: batteryInfo.level,
    charging: batteryInfo.charging,
    chargingTime: batteryInfo.chargingTime,
    dischargingTime: batteryInfo.dischargingTime,
    isLowBattery,
    statusDescription: getStatusDescription(),
    icon: getBatteryIcon(),
    formattedChargingTime: formatTime(batteryInfo.chargingTime),
    formattedDischargingTime: formatTime(batteryInfo.dischargingTime),
  };
}
