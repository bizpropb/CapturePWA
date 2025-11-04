'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * PreferencesManager Component
 * Manages user preferences: dark mode, vibration, auto-sync
 */
export default function PreferencesManager() {
  const [preferences, setPreferences] = useState({
    darkMode: true,
    vibration: true,
    autoSync: true,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vibrationSupported, setVibrationSupported] = useState(false);

  useEffect(() => {
    // Check if vibration is supported
    setVibrationSupported('vibrate' in navigator);

    // Load preferences from localStorage
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('userPreferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({
          darkMode: parsed.darkMode !== undefined ? parsed.darkMode : true,
          vibration: parsed.vibration !== undefined ? parsed.vibration : true,
          autoSync: parsed.autoSync !== undefined ? parsed.autoSync : true,
        });
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);

    // Immediate feedback for vibration toggle
    if (key === 'vibration' && !preferences.vibration && vibrationSupported) {
      navigator.vibrate(50); // Short haptic feedback
    }
  };

  const savePreferences = () => {
    setSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      // Apply dark mode preference
      applyDarkMode(preferences.darkMode);

      // Provide haptic feedback if enabled
      if (preferences.vibration && vibrationSupported) {
        navigator.vibrate([50, 100, 50]); // Success pattern
      }

      setHasChanges(false);

      setTimeout(() => {
        setSaving(false);
      }, 500);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save preferences. Please try again.');
      setSaving(false);
    }
  };

  const applyDarkMode = (enabled) => {
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const resetPreferences = () => {
    if (confirm('Reset all preferences to default values?')) {
      const defaults = {
        darkMode: true,
        vibration: true,
        autoSync: true,
      };
      setPreferences(defaults);
      setHasChanges(true);

      // Haptic feedback
      if (vibrationSupported) {
        navigator.vibrate(100);
      }
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Preferences</h3>
      <p className="text-sm text-gray-400 mb-4">
        Customize your app experience.
      </p>

      <div className="space-y-3">
        {/* Dark Mode Toggle */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🌙</span>
                <h4 className="font-medium">Dark Mode</h4>
              </div>
              <p className="text-sm text-gray-400">
                Use dark theme throughout the app (This app has no lightmode🙃)
              </p>
            </div>
            <button
              onClick={() => handleToggle('darkMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.darkMode ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-label="Toggle dark mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Vibration Toggle */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📳</span>
                <h4 className="font-medium">Vibration</h4>
                {!vibrationSupported && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded">
                    Not Supported
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">
                Haptic feedback for interactions
              </p>
            </div>
            <button
              onClick={() => handleToggle('vibration')}
              disabled={!vibrationSupported}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.vibration && vibrationSupported
                  ? 'bg-blue-600'
                  : 'bg-gray-600'
              } ${!vibrationSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Toggle vibration"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.vibration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto-Sync Toggle */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🔄</span>
                <h4 className="font-medium">Auto-Sync</h4>
              </div>
              <p className="text-sm text-gray-400">
                Automatically sync data when online
              </p>
            </div>
            <button
              onClick={() => handleToggle('autoSync')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.autoSync ? 'bg-blue-600' : 'bg-gray-600'
              }`}
              aria-label="Toggle auto-sync"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.autoSync ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="mt-4 flex gap-2">
          <Button
            onClick={savePreferences}
            disabled={saving}
            variant="primary"
            fullWidth
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            onClick={loadPreferences}
            disabled={saving}
            variant="danger"
            fullWidth
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="mt-3">
        <Button
          onClick={resetPreferences}
          disabled={saving}
          variant="danger"
          size="sm"
          fullWidth
        >
          Reset to Defaults
        </Button>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-900/10 border border-blue-700/30 rounded-lg">
        <p className="text-xs text-blue-300">
          Preferences are saved locally in your browser and will persist across
          sessions.
        </p>
      </div>
    </div>
  );
}
