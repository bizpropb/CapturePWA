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
    } finally {
      setLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setError('');
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-900 border border-yellow-700 rounded-md">
        <p className="text-sm text-white">
          GPS not supported. Location will default to 0, 0.
        </p>
      </div>
    );
  }

  return (
    <div>
      {location ? (
        <div className="p-4 bg-green-900 border border-green-700 rounded-md">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-green-100">Location Captured</p>
              <p className="text-xs text-green-200 font-mono mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
              {location.accuracy && (
                <p className="text-xs text-green-300 mt-1">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={clearLocation}
              className="text-green-200 hover:text-green-100 text-sm font-medium"
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
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? 'Getting Location...' : 'Get Current Location'}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
