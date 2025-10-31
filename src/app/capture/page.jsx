'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MainLayout, PageHeader } from '@/components/layout';
import MomentForm from '@/components/capture/MomentForm';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * Capture Page
 * Dedicated page for creating new moments
 * Also handles incoming shared content via Web Share Target API
 */

function CaptureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnline = useOnlineStatus();

  const [sharedData, setSharedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if we have a share ID from the Share Target API
  useEffect(() => {
    const shareId = searchParams.get('shareId');
    const shareError = searchParams.get('error');

    if (shareError) {
      setError('Failed to receive shared content. Please try again.');
      return;
    }

    if (shareId) {
      fetchSharedData(shareId);
    }
  }, [searchParams]);

  /**
   * Fetch shared data from the API using the share ID
   */
  const fetchSharedData = async (shareId) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/share-target?shareId=${shareId}`);

      if (!response.ok) {
        throw new Error('Failed to retrieve shared content');
      }

      const data = await response.json();
      setSharedData(data);

      console.log('📥 Received shared data:', data);

    } catch (err) {
      console.error('Error fetching shared data:', err);
      setError('Failed to load shared content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful moment creation
   */
  const handleMomentCreated = () => {
    // Clear shared data
    setSharedData(null);

    // Navigate back to home page
    router.push('/');
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <PageHeader
          title="Capture Moment"
          subtitle={sharedData ? "📥 Shared content received" : "Create a new moment"}
        />

        {/* Online/Offline Status */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />
              <span className="text-blue-400">Loading shared content...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Shared Content Info */}
        {sharedData && !loading && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h3 className="text-blue-400 font-semibold mb-2">📥 Shared Content</h3>
            <div className="text-sm text-gray-300 space-y-1">
              {sharedData.title && (
                <p><span className="text-gray-400">Title:</span> {sharedData.title}</p>
              )}
              {sharedData.text && (
                <p><span className="text-gray-400">Text:</span> {sharedData.text}</p>
              )}
              {sharedData.url && (
                <p><span className="text-gray-400">URL:</span> {sharedData.url}</p>
              )}
              {sharedData.media && (
                <p><span className="text-gray-400">Media:</span> {sharedData.media.originalName} ({Math.round(sharedData.media.size / 1024)} KB)</p>
              )}
            </div>
          </div>
        )}

        {/* Moment Form */}
        <MomentForm
          onSuccess={handleMomentCreated}
          sharedData={sharedData}
        />

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CapturePage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </MainLayout>
    }>
      <CaptureContent />
    </Suspense>
  );
}
