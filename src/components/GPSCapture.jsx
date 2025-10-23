'use client';

import { useState } from 'react';
import { checkGPSSupport, requestLocation } from '@/lib/hardware-utils';

export default function GPSCapture({ onCapture, onError }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSupported] = useState(checkGPSSupport());

  const getLocation = async () => {
    setLoading(true);
    setError('');

    try {
      const position = await requestLocation();
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(coords);

      if (onCapture) {
        onCapture(coords.latitude, coords.longitude);
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);

      // Set to default 0,0 on error
      setLocation({ latitude: 0, longitude: 0, accuracy: null });
      if (onCapture) {
        onCapture(0, 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    if (onCapture) {
      onCapture(0, 0);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          📍 GPS not supported. Location will default to 0, 0.
        </p>
      </div>
    );
  }

  return (
    <div>
      {location ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-green-900">Location Captured</p>
              <p className="text-xs text-green-700 font-mono mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              {location.accuracy && (
                <p className="text-xs text-green-600 mt-1">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearLocation}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={getLocation}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading ? '📍 Getting Location...' : '📍 Get Current Location'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
