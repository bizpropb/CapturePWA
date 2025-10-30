/**
 * Manual Service Worker Registration
 * Used in development when next-pwa is disabled
 */

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[SW] Service Workers not supported');
    return null;
  }

  try {
    // Check if service worker is already registered
    const existingRegistration = await navigator.serviceWorker.getRegistration('/');

    if (existingRegistration) {
      console.log('[SW] Service worker already registered, reusing existing registration');
      await navigator.serviceWorker.ready;
      return existingRegistration;
    }

    // Register our manual service worker only if not already registered
    console.log('[SW] Registering new service worker...');
    const registration = await navigator.serviceWorker.register('/sw-manual.js', {
      scope: '/',
      updateViaCache: 'none', // Don't cache the service worker file
    });

    console.log('[SW] Service Worker registered successfully:', registration);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;
    console.log('[SW] Service Worker is ready');

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
}

export function isServiceWorkerReady() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  return !!navigator.serviceWorker.controller;
}
