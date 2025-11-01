'use client';

import { MainLayout, PageHeader } from '@/components/layout';
import { InstallButton } from '@/components/layout/InstallPrompt';
import Card from '@/components/ui/Card';
import SensorDemo from '@/components/sensors/SensorDemo';
import ClipboardDemo from '@/components/ui/ClipboardDemo';

export default function SettingsPage() {
  return (
    <MainLayout>
      <PageHeader
        title="Settings"
        subtitle="Configure your PWA experience"
      />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <div className="space-y-6">
          {/* PWA Installation */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">Install App</h3>
            <p className="text-sm text-gray-400 mb-3">
              Install CapturePWA on your device for a native app experience.
            </p>
            <InstallButton />
          </Card>

          {/* Push Notifications - Placeholder */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
            <p className="text-sm text-gray-400 mb-3">
              Receive notifications for new moments and sync status.
            </p>
            <p className="text-xs text-yellow-400">
              Push notification controls available in development mode
            </p>
          </Card>

          {/* Badge Notifications - Placeholder */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">App Badge</h3>
            <p className="text-sm text-gray-400 mb-3">
              Show notification counts on the app icon when in background.
            </p>
            <p className="text-xs text-yellow-400">
              Badge controls available in development mode
            </p>
          </Card>

          {/* Device Sensors */}
          <div>
            <h2 className="text-2xl font-bold mb-4 px-1">Device Sensors</h2>
            <SensorDemo />
          </div>

          {/* Clipboard API */}
          <div>
            <h2 className="text-2xl font-bold mb-4 px-1">Clipboard API</h2>
            <Card>
              <ClipboardDemo />
            </Card>
          </div>

          {/* About Section */}
          <Card>
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <div className="text-sm text-gray-400 space-y-2">
              <p>
                <span className="font-semibold text-gray-300">Version:</span> 2.0.0
              </p>
              <p>
                <span className="font-semibold text-gray-300">Built with:</span> Next.js,
                React, Prisma, PWA APIs
              </p>
              <p className="mt-4 pt-4 border-t border-gray-700">
                CapturePWA is a showcase Progressive Web Application demonstrating modern
                web capabilities.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
