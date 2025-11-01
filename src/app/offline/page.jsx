'use client';

import { useState, useEffect } from 'react';
import { getMomentsFromCache, getPendingMomentsCount, syncPendingMoments } from '@/lib/db';
import MemoryGame from '@/components/offline/MemoryGame';

export default function OfflinePage() {
  const [cachedCount, setCachedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');

  // Load cached data counts
  useEffect(() => {
    loadCounts();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadCounts();
      attemptSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCounts = async () => {
    try {
      const cached = await getMomentsFromCache();
      const pending = await getPendingMomentsCount();
      setCachedCount(cached.length);
      setPendingCount(pending);
    } catch (error) {
      console.error('Failed to load counts:', error);
    }
  };

  const attemptSync = async () => {
    if (!navigator.onLine || pendingCount === 0) return;

    try {
      setSyncStatus('Syncing...');
      const synced = await syncPendingMoments();
      setSyncStatus(`Synced ${synced} moment${synced !== 1 ? 's' : ''}!`);
      await loadCounts();

      setTimeout(() => setSyncStatus(''), 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('Sync failed');
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setSyncStatus('Checking connection...');

    // Force a network check
    try {
      const response = await fetch('/api/moments?limit=1', {
        method: 'GET',
        cache: 'no-cache',
      });

      if (response.ok) {
        setSyncStatus('Connection restored!');
        setIsOnline(true);
        await attemptSync();

        // Redirect to home after 1 second
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        setSyncStatus('Still offline');
      }
    } catch (error) {
      setSyncStatus('Connection failed');
    } finally {
      setIsRetrying(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Offline Mode</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Connection Status Banner */}
        <div className={`mb-6 p-4 rounded-lg border ${
          isOnline
            ? 'bg-green-900/20 border-green-600'
            : 'bg-yellow-900/20 border-yellow-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {isOnline ? '🟢' : '🔴'}
            </div>
            <div>
              <h2 className="font-bold text-lg">
                {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
              </h2>
              <p className="text-sm opacity-90">
                {isOnline
                  ? 'Your internet connection is back. Redirecting to home...'
                  : 'No internet connection detected. Don\'t worry, you can still view cached moments!'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Cached Moments Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300">Cached Moments</h3>
                <p className="text-2xl font-bold text-blue-400">{cachedCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Available to view offline
            </p>
          </div>

          {/* Pending Sync Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-orange-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-300">Pending Sync</h3>
                <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              Will upload when online
            </p>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600 rounded-lg text-center">
            <p className="text-blue-300 font-medium">{syncStatus}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 space-y-3">
          <button
            onClick={handleRetryConnection}
            disabled={isRetrying || isOnline}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
          >
            {isRetrying ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Checking Connection...</span>
              </>
            ) : isOnline ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Connected</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Retry Connection</span>
              </>
            )}
          </button>

          <a
            href="/"
            className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-center"
          >
            Go to Home
          </a>
        </div>

        {/* Troubleshooting Tips */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Network Troubleshooting Tips
          </h3>

          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">1.</span>
              <div>
                <p className="font-medium">Check your WiFi or mobile data</p>
                <p className="text-gray-400">Make sure airplane mode is off and you're connected to a network</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">2.</span>
              <div>
                <p className="font-medium">Try toggling airplane mode</p>
                <p className="text-gray-400">Turn airplane mode on, wait 10 seconds, then turn it off</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">3.</span>
              <div>
                <p className="font-medium">Check your signal strength</p>
                <p className="text-gray-400">Move to an area with better reception if possible</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">4.</span>
              <div>
                <p className="font-medium">Restart your device</p>
                <p className="text-gray-400">Sometimes a simple restart can fix connectivity issues</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-400 mt-1">5.</span>
              <div>
                <p className="font-medium">Your data is safe</p>
                <p className="text-gray-400">All unsaved moments are stored locally and will sync automatically when you're back online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Game Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Pass the Time</h3>
            <button
              onClick={() => setShowGame(!showGame)}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm"
            >
              {showGame ? 'Hide Game' : 'Play Game'}
            </button>
          </div>

          {showGame ? (
            <MemoryGame />
          ) : (
            <p className="text-gray-400 text-sm text-center py-4">
              Click "Play Game" to start a memory game while waiting for connection
            </p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-gray-800 mt-8">
        <p className="text-gray-400 text-sm">
          This page works offline thanks to Progressive Web App technology
        </p>
      </footer>
    </div>
  );
}
