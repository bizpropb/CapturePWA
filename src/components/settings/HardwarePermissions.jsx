'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import {
  checkCameraSupport,
  checkAudioSupport,
  checkGPSSupport,
  requestCamera,
  requestMicrophone,
  requestLocation,
} from '@/lib/hardware-utils';

/**
 * HardwarePermissions Component
 * Shows hardware permissions status and allows testing
 */
export default function HardwarePermissions() {
  const [permissions, setPermissions] = useState({
    camera: { supported: false, status: 'unknown', error: null },
    microphone: { supported: false, status: 'unknown', error: null },
    geolocation: { supported: false, status: 'unknown', error: null },
  });
  const [loading, setLoading] = useState({
    camera: false,
    microphone: false,
    geolocation: false,
  });

  useEffect(() => {
    checkHardwareSupport();
  }, []);

  const checkHardwareSupport = async () => {
    // Check camera support
    const cameraSupported = checkCameraSupport();
    setPermissions((prev) => ({
      ...prev,
      camera: { ...prev.camera, supported: cameraSupported },
    }));

    // Check microphone support
    const micSupported = checkAudioSupport();
    setPermissions((prev) => ({
      ...prev,
      microphone: { ...prev.microphone, supported: micSupported },
    }));

    // Check geolocation support
    const geoSupported = checkGPSSupport();
    setPermissions((prev) => ({
      ...prev,
      geolocation: { ...prev.geolocation, supported: geoSupported },
    }));

    // Check actual permissions if supported
    if ('permissions' in navigator) {
      try {
        // Camera permission
        if (cameraSupported) {
          const cameraPerm = await navigator.permissions.query({ name: 'camera' });
          setPermissions((prev) => ({
            ...prev,
            camera: { ...prev.camera, status: cameraPerm.state },
          }));
        }

        // Microphone permission
        if (micSupported) {
          const micPerm = await navigator.permissions.query({ name: 'microphone' });
          setPermissions((prev) => ({
            ...prev,
            microphone: { ...prev.microphone, status: micPerm.state },
          }));
        }

        // Geolocation permission
        if (geoSupported) {
          const geoPerm = await navigator.permissions.query({ name: 'geolocation' });
          setPermissions((prev) => ({
            ...prev,
            geolocation: { ...prev.geolocation, status: geoPerm.state },
          }));
        }
      } catch (err) {
        console.warn('Permissions API not fully supported:', err);
      }
    }
  };

  const testCamera = async () => {
    setLoading((prev) => ({ ...prev, camera: true }));
    setPermissions((prev) => ({
      ...prev,
      camera: { ...prev.camera, error: null },
    }));

    try {
      const stream = await requestCamera();
      setPermissions((prev) => ({
        ...prev,
        camera: { ...prev.camera, status: 'granted' },
      }));
      // Stop stream immediately
      stream.getTracks().forEach((track) => track.stop());
      alert('Camera access granted! ✓');
    } catch (error) {
      setPermissions((prev) => ({
        ...prev,
        camera: {
          ...prev.camera,
          status: 'denied',
          error: error.message,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, camera: false }));
    }
  };

  const testMicrophone = async () => {
    setLoading((prev) => ({ ...prev, microphone: true }));
    setPermissions((prev) => ({
      ...prev,
      microphone: { ...prev.microphone, error: null },
    }));

    try {
      const stream = await requestMicrophone();
      setPermissions((prev) => ({
        ...prev,
        microphone: { ...prev.microphone, status: 'granted' },
      }));
      // Stop stream immediately
      stream.getTracks().forEach((track) => track.stop());
      alert('Microphone access granted! ✓');
    } catch (error) {
      setPermissions((prev) => ({
        ...prev,
        microphone: {
          ...prev.microphone,
          status: 'denied',
          error: error.message,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, microphone: false }));
    }
  };

  const testGeolocation = async () => {
    setLoading((prev) => ({ ...prev, geolocation: true }));
    setPermissions((prev) => ({
      ...prev,
      geolocation: { ...prev.geolocation, error: null },
    }));

    try {
      const position = await requestLocation();
      setPermissions((prev) => ({
        ...prev,
        geolocation: { ...prev.geolocation, status: 'granted' },
      }));
      alert(
        `Geolocation access granted! ✓\nLocation: ${position.coords.latitude.toFixed(
          4
        )}, ${position.coords.longitude.toFixed(4)}`
      );
    } catch (error) {
      setPermissions((prev) => ({
        ...prev,
        geolocation: {
          ...prev.geolocation,
          status: 'denied',
          error: error.message,
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, geolocation: false }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted':
        return 'text-green-400';
      case 'denied':
        return 'text-red-400';
      case 'prompt':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'granted':
        return '✓';
      case 'denied':
        return '✗';
      case 'prompt':
        return '?';
      default:
        return '○';
    }
  };

  const hardwareItems = [
    {
      name: 'Camera',
      key: 'camera',
      icon: '📷',
      testFn: testCamera,
    },
    {
      name: 'Microphone',
      key: 'microphone',
      icon: '🎤',
      testFn: testMicrophone,
    },
    {
      name: 'Geolocation',
      key: 'geolocation',
      icon: '📍',
      testFn: testGeolocation,
    },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Hardware Permissions</h3>
      <p className="text-sm text-gray-400 mb-4">
        Test and manage device hardware access permissions.
      </p>

      <div className="space-y-3">
        {hardwareItems.map((item) => {
          const perm = permissions[item.key];
          const isLoading = loading[item.key];

          return (
            <div
              key={item.key}
              className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={
                          perm.supported ? 'text-green-400' : 'text-red-400'
                        }
                      >
                        {perm.supported ? 'Supported' : 'Not Supported'}
                      </span>
                      {perm.supported && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className={getStatusColor(perm.status)}>
                            {getStatusIcon(perm.status)} {perm.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {perm.supported && (
                  <Button
                    onClick={item.testFn}
                    disabled={isLoading}
                    variant="secondary"
                    size="sm"
                  >
                    {isLoading ? 'Testing...' : 'Test'}
                  </Button>
                )}
              </div>

              {perm.error && (
                <div className="mt-2 p-2 bg-red-900/20 border border-red-700/50 rounded text-xs text-red-300">
                  {perm.error}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-900/10 border border-blue-700/30 rounded-lg">
        <p className="text-xs text-blue-300">
          <strong>Tip:</strong> If permission is denied, you'll need to reset it in
          your browser settings. In Chrome, click the lock icon in the address bar.
        </p>
      </div>
    </div>
  );
}
