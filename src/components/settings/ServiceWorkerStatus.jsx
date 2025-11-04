'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * ServiceWorkerStatus Component
 * Shows service worker status and allows checking for updates
 */
export default function ServiceWorkerStatus() {
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState({
    supported: false,
    registered: false,
    state: 'unknown',
    updateAvailable: false,
  });
  const [loading, setLoading] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    checkServiceWorker();
  }, []);

  const checkServiceWorker = async () => {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      setStatus({
        supported: false,
        registered: false,
        state: 'not-supported',
        updateAvailable: false,
      });
      return;
    }

    setStatus((prev) => ({ ...prev, supported: true }));

    try {
      // Get all registrations
      const registrations = await navigator.serviceWorker.getRegistrations();

      if (registrations.length === 0) {
        setStatus((prev) => ({
          ...prev,
          registered: false,
          state: 'not-registered',
        }));
        return;
      }

      // Get the active registration
      const reg = registrations[0];
      setRegistration(reg);

      // Determine state
      let state = 'unknown';
      if (reg.active) {
        state = 'active';
      } else if (reg.installing) {
        state = 'installing';
      } else if (reg.waiting) {
        state = 'waiting';
      }

      setStatus((prev) => ({
        ...prev,
        registered: true,
        state: state,
        updateAvailable: !!reg.waiting,
      }));

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        console.log('[SW] Update found!');
        setStatus((prev) => ({ ...prev, updateAvailable: true }));
      });
    } catch (err) {
      console.error('Failed to check service worker:', err);
    }
  };

  const checkForUpdates = async () => {
    setLoading(true);

    try {
      if (!registration) {
        await checkServiceWorker();
        setLoading(false);
        return;
      }

      // Check for updates
      await registration.update();

      // Wait a bit and check if update was found
      setTimeout(() => {
        if (registration.waiting) {
          setStatus((prev) => ({ ...prev, updateAvailable: true }));
          alert('Update available! Click "Update Now" to apply it.');
        } else {
          alert('You are running the latest version!');
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to check for updates:', err);
      alert('Failed to check for updates. Please try again.');
      setLoading(false);
    }
  };

  const applyUpdate = () => {
    if (!registration || !registration.waiting) {
      return;
    }

    // Tell the waiting service worker to activate
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page when the new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  };

  const unregisterServiceWorker = async () => {
    if (
      !confirm(
        'Are you sure you want to unregister the service worker? This will disable offline functionality.'
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }

      setStatus({
        supported: true,
        registered: false,
        state: 'unregistered',
        updateAvailable: false,
      });

      alert('Service worker unregistered. Reload the page to re-register it.');
    } catch (err) {
      console.error('Failed to unregister service worker:', err);
      alert('Failed to unregister service worker.');
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'active':
        return 'text-green-400';
      case 'installing':
      case 'waiting':
        return 'text-yellow-400';
      case 'not-registered':
      case 'unregistered':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'active':
        return '✓';
      case 'installing':
        return '⏳';
      case 'waiting':
        return '⏸';
      case 'not-supported':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Service Worker</h3>
      <p className="text-sm text-gray-400 mb-4">
        Manages offline functionality and caching.
      </p>

      <div className="space-y-4">
        {/* Status Display */}
        <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Support:</span>
              <span
                className={
                  status.supported ? 'text-green-400' : 'text-red-400'
                }
              >
                {status.supported ? 'Supported' : 'Not Supported'}
              </span>
            </div>

            {status.supported && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Registration:</span>
                  <span
                    className={
                      status.registered ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {status.registered ? 'Registered' : 'Not Registered'}
                  </span>
                </div>

                {status.registered && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">State:</span>
                    <span className={getStateColor(status.state)}>
                      {getStateIcon(status.state)} {status.state}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Online Status:</span>
                  <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
                    {isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Update Available Alert */}
        {status.updateAvailable && (
          <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-medium text-blue-300 mb-1">
                  Update Available
                </h4>
                <p className="text-sm text-blue-200">
                  A new version of the app is ready to install.
                </p>
              </div>
              <Button onClick={applyUpdate} variant="primary" size="sm">
                Update Now
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {status.supported && status.registered && (
          <div className="space-y-2">
            <Button
              onClick={checkForUpdates}
              disabled={loading}
              variant="secondary"
              fullWidth
            >
              {loading ? 'Checking...' : 'Check for Updates'}
            </Button>

            <Button
              onClick={unregisterServiceWorker}
              disabled={loading}
              variant="danger"
              size="sm"
              fullWidth
            >
              Unregister Service Worker
            </Button>
          </div>
        )}

        {/* Not Registered Info */}
        {status.supported && !status.registered && (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <p className="text-sm text-yellow-300">
              Service worker is not registered. Reload the page to register it and
              enable offline functionality.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="sm"
              className="mt-2"
            >
              Reload Page
            </Button>
          </div>
        )}

        {/* Not Supported Info */}
        {!status.supported && (
          <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <p className="text-sm text-red-300">
              Service workers are not supported in this browser. Offline functionality
              will not be available.
            </p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-900/10 border border-blue-700/30 rounded-lg">
        <p className="text-xs text-blue-300">
          The service worker enables offline functionality, caching, and background
          sync. It runs in the background even when the app is closed.
        </p>
      </div>
    </div>
  );
}
