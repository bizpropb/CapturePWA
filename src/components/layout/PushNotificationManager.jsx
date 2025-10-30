'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { registerServiceWorker } from '@/lib/register-sw';

/**
 * PushNotificationManager Component
 * Manages push notification permissions and subscriptions
 */
export default function PushNotificationManager() {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if push notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    // Get current permission status
    setPermission(Notification.permission);

    // Register service worker and check subscription
    initServiceWorker();
  }, []);

  async function initServiceWorker() {
    try {
      console.log('[PushManager] Initializing service worker...');
      await registerServiceWorker();
      setSwRegistered(true);
      console.log('[PushManager] Service worker registered successfully');

      // Wait a bit for service worker to activate
      await new Promise(resolve => setTimeout(resolve, 500));

      await checkSubscription();
    } catch (err) {
      console.error('[PushManager] Failed to initialize service worker:', err);
      setError('Failed to register service worker: ' + err.message);
    }
  }

  /**
   * Check if user is already subscribed
   */
  async function checkSubscription() {
    try {
      console.log('[PushManager] Checking for existing subscription...');

      // Check if service worker is registered first
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('[PushManager] All registrations:', registrations.length);

      if (registrations.length === 0) {
        console.log('[PushManager] ⚠ No service worker registered at all!');
        setIsSubscribed(false);
        return;
      }

      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      console.log('[PushManager] Service worker state:', registration.active?.state);
      console.log('[PushManager] Service worker ready:', registration);

      // Get existing subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      console.log('[PushManager] Raw subscription result:', existingSubscription);

      if (existingSubscription) {
        setSubscription(existingSubscription);
        setIsSubscribed(true);
        console.log('[PushManager] ✓ SUBSCRIBED - Endpoint:', existingSubscription.endpoint.substring(0, 50) + '...');
      } else {
        setIsSubscribed(false);
        console.log('[PushManager] ✗ NOT SUBSCRIBED - No subscription found');
      }
    } catch (err) {
      console.error('[PushManager] Error checking subscription:', err);
      setIsSubscribed(false);
    }
  }

  /**
   * Request notification permission and subscribe
   */
  async function handleSubscribe() {
    setLoading(true);
    setError(null);

    try {
      // Request permission first
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        setError('Notification permission denied');
        setLoading(false);
        return;
      }

      // Wait for service worker to be ready
      console.log('Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      // Check if service worker is active
      if (!registration.active) {
        throw new Error('Service worker is not active yet. Please wait a moment and try again.');
      }

      // Subscribe to push
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        ),
      });

      console.log('New subscription created:', newSubscription);

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: newSubscription.toJSON(),
          userId: 1, // TODO: Get from user context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      const data = await response.json();
      console.log('Subscription saved:', data);

      setSubscription(newSubscription);
      setIsSubscribed(true);
    } catch (err) {
      console.error('Error subscribing to push:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async function handleUnsubscribe() {
    setLoading(true);
    setError(null);

    try {
      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from server
        await fetch(
          `/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`,
          { method: 'DELETE' }
        );

        setSubscription(null);
        setIsSubscribed(false);
        console.log('Unsubscribed successfully');
      }
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Send test notification
   */
  async function sendTestNotification() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 1, // TODO: Get from user context
          title: 'Test Notification',
          body: 'This is a test notification from CapturePWA!',
          data: { url: '/settings' },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const data = await response.json();
      console.log('Test notification sent:', data);
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Check if not supported (only runs on client since we use dynamic import with ssr: false)
  if (typeof window !== 'undefined' && !('Notification' in window)) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
        <p className="text-yellow-300">
          Push notifications are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Permission Status */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
        <p className="text-sm text-gray-400 mb-2">
          Service Worker: <span className="font-medium text-white">{swRegistered ? '✓ Registered' : '⏳ Registering...'}</span>
        </p>
        <p className="text-sm text-gray-400 mb-2">
          Permission: <span className="font-medium text-white">{permission}</span>
        </p>
        <p className="text-sm text-gray-400">
          Status:{' '}
          <span className="font-medium text-white">
            {isSubscribed ? 'Subscribed' : 'Not subscribed'}
          </span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Subscribe/Unsubscribe Button */}
      <div className="flex gap-2">
        {!isSubscribed ? (
          <Button
            onClick={handleSubscribe}
            disabled={loading || permission === 'denied' || !swRegistered}
            variant="primary"
          >
            {loading ? 'Subscribing...' : 'Enable Notifications'}
          </Button>
        ) : (
          <>
            <Button
              onClick={handleUnsubscribe}
              disabled={loading}
              variant="secondary"
            >
              {loading ? 'Unsubscribing...' : 'Disable Notifications'}
            </Button>
            <Button
              onClick={sendTestNotification}
              disabled={loading}
              variant="primary"
            >
              {loading ? 'Sending...' : 'Send Test'}
            </Button>
          </>
        )}
      </div>

      {/* Permission Denied Message */}
      {permission === 'denied' && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}

      {/* Subscription Details (dev only) */}
      {subscription && process.env.NODE_ENV === 'development' && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-400">
            Subscription Details
          </summary>
          <pre className="mt-2 p-2 bg-gray-900 rounded overflow-auto">
            {JSON.stringify(subscription.toJSON(), null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Convert base64 URL string to Uint8Array for VAPID key
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
