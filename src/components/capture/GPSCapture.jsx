'use client';

import { useState, useEffect, useRef } from 'react';
import { checkGPSSupport, requestLocation } from '@/lib/hardware-utils';
import { calculateDistance, formatDistance } from '@/utils/location-utils';
import Button from '@/components/ui/Button';

export default function GPSCapture({ onCapture, onError, enableContinuousTracking = false }) {
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  const watchIdRef = useRef(null);
  const lastPositionRef = useRef(null);

  // Check GPS support after component mounts (client-side only)
  useEffect(() => {
    setIsSupported(checkGPSSupport());
  }, []);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      setLoadingAddress(true);
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setLocationName(data.shortAddress || data.displayName);
        return data;
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
    } finally {
      setLoadingAddress(false);
    }
    return null;
  };

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
      lastPositionRef.current = coords;

      // Reverse geocode to get address
      await reverseGeocode(coords.latitude, coords.longitude);

      if (onCapture) {
        onCapture(coords.latitude, coords.longitude, coords.accuracy);
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start continuous tracking
  const startTracking = () => {
    if (!navigator.geolocation) return;

    setIsTracking(true);
    setError('');
    setDistanceTraveled(0);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        // Calculate distance if we have a previous position
        if (lastPositionRef.current) {
          const distance = calculateDistance(
            lastPositionRef.current.latitude,
            lastPositionRef.current.longitude,
            coords.latitude,
            coords.longitude
          );
          setDistanceTraveled(prev => prev + distance);
        }

        setLocation(coords);
        lastPositionRef.current = coords;

        // Update address occasionally (not on every position update)
        if (!locationName) {
          reverseGeocode(coords.latitude, coords.longitude);
        }

        if (onCapture) {
          onCapture(coords.latitude, coords.longitude, coords.accuracy);
        }
      },
      (err) => {
        setError(err.message);
        if (onError) onError(err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  };

  // Stop continuous tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const clearLocation = () => {
    stopTracking();
    setLocation(null);
    setLocationName('');
    setError('');
    setDistanceTraveled(0);
    lastPositionRef.current = null;
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
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-green-100">
                  {isTracking ? '📍 Tracking Location' : 'Location Captured'}
                </p>
                {isTracking && (
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>

              {/* Address */}
              {locationName && (
                <p className="text-sm text-green-200 mt-1">
                  {locationName}
                </p>
              )}
              {loadingAddress && (
                <p className="text-xs text-green-300 mt-1 italic">
                  Loading address...
                </p>
              )}

              {/* Coordinates */}
              <p className="text-xs text-green-200 font-mono mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>

              {/* Accuracy */}
              {location.accuracy && (
                <p className="text-xs text-green-300 mt-1">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </p>
              )}

              {/* Distance traveled (only in tracking mode) */}
              {isTracking && distanceTraveled > 0 && (
                <p className="text-xs text-green-300 mt-1">
                  Distance: {formatDistance(distanceTraveled)}
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

          {/* Continuous tracking toggle (if enabled) */}
          {enableContinuousTracking && (
            <div className="mt-3 pt-3 border-t border-green-700">
              {isTracking ? (
                <button
                  type="button"
                  onClick={stopTracking}
                  className="bg-red-900 text-white py-2 px-4 rounded-md hover:bg-red-800 transition-colors duration-200 text-sm"
                >
                  Stop Tracking
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startTracking}
                  className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors duration-200 text-sm"
                >
                  Start Continuous Tracking
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <Button
            type="button"
            onClick={getLocation}
            disabled={loading}
            variant="primary"
            size="sm"
          >
            {loading ? 'Getting Location...' : 'Get Current Location'}
          </Button>

          {/* Continuous tracking option (if enabled and supported) */}
          {enableContinuousTracking && !loading && (
            <Button
              type="button"
              onClick={startTracking}
              variant="primary"
              size="sm"
              className="mt-2"
            >
              Start Continuous Tracking
            </Button>
          )}

          {error && (
            <p className="mt-2 text-sm text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
