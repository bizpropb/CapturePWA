'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

/**
 * InstallPrompt Component
 * Handles PWA installation with custom UI
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Check if already installed
    checkIfInstalled();

    // Capture the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[InstallPrompt] beforeinstallprompt event fired');

      // Prevent the default mini-infobar from appearing
      e.preventDefault();

      // Save the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);

      // Show our custom install UI after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      console.log('[InstallPrompt] App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Check if app is already installed
   */
  function checkIfInstalled() {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // iOS specific check
    const isIOSStandalone = window.navigator.standalone === true;

    if (isStandalone || isIOSStandalone) {
      console.log('[InstallPrompt] App is already installed');
      setIsInstalled(true);
      setIsInstallable(false);
    }
  }

  /**
   * Handle install button click
   */
  async function handleInstallClick() {
    if (!deferredPrompt) {
      console.log('[InstallPrompt] No deferred prompt available');
      return;
    }

    console.log('[InstallPrompt] Showing install prompt');

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[InstallPrompt] User choice:', outcome);

    if (outcome === 'accepted') {
      console.log('[InstallPrompt] User accepted the install');
    } else {
      console.log('[InstallPrompt] User dismissed the install');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  }

  /**
   * Dismiss the install banner
   */
  function handleDismiss() {
    setShowPrompt(false);
    // Remember dismissal for this session
    sessionStorage.setItem('installPromptDismissed', 'true');
  }

  // Don't show anything if not installable or already installed
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Banner (appears after delay) */}
      {showPrompt && (
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
          <div className="bg-neutral-900 rounded-lg shadow-2xl p-4 border border-neutral-700">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg p-2">
                <svg
                  className="w-full h-full text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-white mb-1">Install CapturePWA</h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Install this app for a better experience. Works offline!
                </p>

                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    variant="primary"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  >
                    Not now
                  </Button>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-neutral-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * InstallButton Component
 * Simple button for settings page
 */
export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Capture install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>App installed</span>
      </div>
    );
  }

  if (!isInstallable) {
    return (
      <p className="text-sm text-gray-400">
        Install option not available (may already be installed or browser doesn't support PWA installation)
      </p>
    );
  }

  return (
    <Button onClick={handleInstall} variant="primary">
      Install App
    </Button>
  );
}
