'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Client-side component for Share Page
 * Handles "Open in App" button and install detection
 */
export default function SharePageClient() {
  const router = useRouter();
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      // Check if running in standalone mode (installed PWA)
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }

      // Check for navigator.standalone (iOS Safari)
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }

      // Check for document.referrer (Android)
      if (document.referrer.includes('android-app://')) {
        setIsInstalled(true);
        return;
      }

      setIsInstalled(false);
    };

    checkInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleOpenInApp = () => {
    // If installed, navigate to home
    if (isInstalled) {
      router.push('/');
    } else {
      // If not installed, show install instructions or trigger install prompt
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
          }
          setDeferredPrompt(null);
          setShowInstallPrompt(false);
        });
      } else {
        // Fallback: navigate to home page
        router.push('/');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Open in App Button */}
      <button
        onClick={handleOpenInApp}
        className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        {isInstalled ? 'Open in App' : 'Get CapturePWA'}
      </button>

      {/* Install Instructions (if not installed and no prompt available) */}
      {!isInstalled && !showInstallPrompt && (
        <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
          <h3 className="font-semibold mb-2 text-sm">Install CapturePWA</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p><strong>Chrome/Edge:</strong> Tap the menu (î) ’ "Install app"</p>
            <p><strong>Safari iOS:</strong> Tap Share (—) ’ "Add to Home Screen"</p>
            <p><strong>Safari Mac:</strong> File ’ "Add to Dock"</p>
          </div>
        </div>
      )}

      {/* Share Button */}
      <ShareButton />
    </div>
  );
}

/**
 * Share button component with Web Share API
 */
function ShareButton() {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share !== 'undefined');
  }, []);

  const handleShare = async () => {
    if (!navigator.share) {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
      return;
    }

    try {
      await navigator.share({
        title: document.title,
        text: 'Check out this moment on CapturePWA',
        url: window.location.href,
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="w-full py-4 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-2xl transition-colors duration-200 flex items-center justify-center gap-3 border border-gray-700"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      {canShare ? 'Share this Moment' : 'Copy Link'}
    </button>
  );
}
