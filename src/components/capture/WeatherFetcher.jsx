'use client';

import { useState, useEffect } from 'react';

/**
 * WeatherFetcher Component
 * Fetches and displays current weather based on GPS coordinates
 * Optional - requires OpenWeather API key in environment
 */

const WEATHER_ICONS = {
  clear: '☀️',
  clouds: '☁️',
  rain: '🌧️',
  drizzle: '🌦️',
  thunderstorm: '⛈️',
  snow: '❄️',
  mist: '🌫️',
  fog: '🌫️',
  haze: '🌫️',
  default: '🌤️'
};

export default function WeatherFetcher({ gpsLat, gpsLng, value, onChange, disabled = false }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);

  // Automatically fetch weather when GPS coordinates are available
  useEffect(() => {
    if (gpsLat && gpsLng && gpsLat !== 0 && gpsLng !== 0) {
      fetchWeather();
    }
  }, [gpsLat, gpsLng]);

  const fetchWeather = async () => {
    if (!gpsLat || !gpsLng || gpsLat === 0 || gpsLng === 0) {
      setError('GPS coordinates required to fetch weather');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/weather?lat=${gpsLat}&lng=${gpsLng}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch weather');
      }

      const data = await response.json();
      setWeatherData(data);

      // Automatically set weather value if not already set
      if (!value && data.condition) {
        onChange(data.condition);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSelect = (condition) => {
    onChange(condition === value ? null : condition);
  };

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: '☀️' },
    { value: 'cloudy', label: 'Cloudy', icon: '☁️' },
    { value: 'rainy', label: 'Rainy', icon: '🌧️' },
    { value: 'stormy', label: 'Stormy', icon: '⛈️' },
    { value: 'snowy', label: 'Snowy', icon: '❄️' },
    { value: 'foggy', label: 'Foggy', icon: '🌫️' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Weather (optional)
      </label>

      {/* Auto-fetch button */}
      {(!gpsLat || gpsLat === 0) && (
        <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
          💡 Enable location to auto-fetch weather data
        </div>
      )}

      {(gpsLat && gpsLat !== 0 && gpsLng && gpsLng !== 0) && !weatherData && !loading && (
        <button
          type="button"
          onClick={fetchWeather}
          disabled={disabled || loading}
          className="mb-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <span>🌤️</span>
          Fetch Current Weather
        </button>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-3 p-3 bg-gray-700 rounded-md text-sm text-gray-300 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
          Fetching weather...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Auto-fetched Weather Data */}
      {weatherData && (
        <div className="mb-3 p-3 bg-green-500/10 border border-green-500/30 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {WEATHER_ICONS[weatherData.condition] || WEATHER_ICONS.default}
              </span>
              <div>
                <div className="text-sm text-gray-200 font-medium capitalize">
                  {weatherData.description}
                </div>
                {weatherData.temperature && (
                  <div className="text-xs text-gray-400">
                    {weatherData.temperature}°C
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchWeather}
              disabled={disabled || loading}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      )}

      {/* Manual Weather Selection */}
      <div className="mb-2">
        <div className="text-xs text-gray-400 mb-2">Or select manually:</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weatherOptions.map((weather) => (
            <button
              key={weather.value}
              type="button"
              onClick={() => handleManualSelect(weather.value)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center gap-1
                p-3 rounded-lg border-2 transition-all duration-200
                ${value === weather.value
                  ? 'border-green-500 bg-green-500/20 scale-105'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={weather.label}
            >
              <span className="text-2xl">{weather.icon}</span>
              <span className="text-xs text-gray-300">{weather.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Weather Display */}
      {value && (
        <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-400">
          Weather: {weatherOptions.find(w => w.value === value)?.icon || weatherData?.condition && WEATHER_ICONS[weatherData.condition]} {value}
        </div>
      )}
    </div>
  );
}
