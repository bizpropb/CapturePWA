'use client';

import dynamic from 'next/dynamic';
import { MainLayout, PageHeader } from '@/components/layout';
import Card from '@/components/ui/Card';

// Load PushNotificationManager only on client-side to avoid hydration issues
const PushNotificationManager = dynamic(
  () => import('@/components/layout/PushNotificationManager'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }
);

export default function SettingsPage() {
  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        subtitle="Configure your PWA experience"
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* PWA Features Section */}
        <Card>
          <h2 className="text-xl font-bold mb-4">PWA Features</h2>

          <div className="space-y-6">
            {/* Push Notifications */}
            <div>
              <PushNotificationManager />
            </div>

            {/* Install App (placeholder) */}
            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Install App</h3>
              <p className="text-sm text-gray-400 mb-3">
                Install this app on your device for a native experience.
              </p>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                disabled
              >
                Install (Coming Soon)
              </button>
            </div>

            {/* Badge API (placeholder) */}
            <div className="pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold mb-2">App Badge</h3>
              <p className="text-sm text-gray-400 mb-3">
                Show notification counts on app icon.
              </p>
              <div className="text-sm text-gray-500">
                Coming in Phase 1.4
              </div>
            </div>
          </div>
        </Card>

        {/* Hardware Section */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Hardware</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Camera:</p>
              <p className="text-sm font-medium" suppressHydrationWarning>
                {typeof navigator !== 'undefined' && navigator.mediaDevices
                  ? 'Available'
                  : 'Not available'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Geolocation:</p>
              <p className="text-sm font-medium" suppressHydrationWarning>
                {typeof navigator !== 'undefined' && navigator.geolocation
                  ? 'Available'
                  : 'Not available'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Audio Recording:</p>
              <p className="text-sm font-medium" suppressHydrationWarning>
                {typeof navigator !== 'undefined' && navigator.mediaDevices
                  ? 'Available'
                  : 'Not available'}
              </p>
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card>
          <h2 className="text-xl font-bold mb-4">About</h2>

          <div className="space-y-2 text-sm">
            <div>
              <p className="text-gray-400">Version:</p>
              <p className="font-medium">2.0.0-alpha (Phase 1)</p>
            </div>
            <div>
              <p className="text-gray-400">Tech Stack:</p>
              <p className="font-medium">Next.js 15 + Prisma + PWA</p>
            </div>
            <div>
              <p className="text-gray-400">Phase:</p>
              <p className="font-medium">Phase 1 - Advanced PWA Features</p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
