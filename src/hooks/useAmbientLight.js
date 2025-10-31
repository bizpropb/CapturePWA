import { useEffect, useState } from 'react';
import { monitorAmbientLight, checkAmbientLightSupport, getThemeForLightLevel } from '@/lib/sensor-utils';

/**
 * Hook to monitor ambient light and suggest theme
 * @param {Object} options - Configuration options
 * @returns {Object} Light level and suggested theme
 */
export function useAmbientLight(options = {}) {
  const {
    enabled = true,
    autoSwitchTheme = false,
    onThemeChange = null,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [lightLevel, setLightLevel] = useState(null);
  const [suggestedTheme, setSuggestedTheme] = useState('dark');

  // Check support on mount
  useEffect(() => {
    setIsSupported(checkAmbientLightSupport());
  }, []);

  // Monitor ambient light
  useEffect(() => {
    if (!enabled || !isSupported) return;

    let cleanup;

    const setupLightSensor = async () => {
      try {
        cleanup = await monitorAmbientLight((lux) => {
          setLightLevel(lux);

          // Determine suggested theme
          const theme = getThemeForLightLevel(lux);
          setSuggestedTheme(theme);

          // Auto-switch theme if enabled
          if (autoSwitchTheme && onThemeChange) {
            onThemeChange(theme);
          }
        });
      } catch (error) {
        console.error('Failed to set up ambient light sensor:', error);
      }
    };

    setupLightSensor();

    return () => {
      if (cleanup) cleanup();
    };
  }, [enabled, isSupported, autoSwitchTheme, onThemeChange]);

  // Helper to get light level description
  const getLightDescription = () => {
    if (lightLevel === null) return 'Unknown';

    if (lightLevel < 50) return 'Very dim';
    if (lightLevel < 100) return 'Dim';
    if (lightLevel < 300) return 'Indoor';
    if (lightLevel < 500) return 'Well lit';
    if (lightLevel < 1000) return 'Bright';
    return 'Very bright';
  };

  return {
    isSupported,
    lightLevel,
    suggestedTheme,
    description: getLightDescription(),
  };
}
