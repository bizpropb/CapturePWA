'use client';

import MainLayout from '@/components/layout/MainLayout';
import { InstallButton } from '@/components/layout/InstallPrompt';
import Card from '@/components/ui/Card';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/layout/PageHeader';

// Import new settings components
import HardwarePermissions from '@/components/settings/HardwarePermissions';
import PreferencesManager from '@/components/settings/PreferencesManager';
import ServiceWorkerStatus from '@/components/settings/ServiceWorkerStatus';
import StorageInfo from '@/components/settings/StorageInfo';

// Dynamically import components that use browser APIs
const PushNotificationManager = dynamic(
  () => import('@/components/layout/PushNotificationManager'),
  { ssr: false }
);
const BadgeManager = dynamic(
  () => import('@/components/layout/BadgeManager'),
  { ssr: false }
);
const SensorDemo = dynamic(
  () => import('@/components/sensors/SensorDemo'),
  { ssr: false }
);
const ClipboardDemo = dynamic(
  () => import('@/components/ui/ClipboardDemo'),
  { ssr: false }
);
const DataManagement = dynamic(
  () => import('@/components/ui/DataManagement'),
  { ssr: false }
);

/**
 * Settings Page
 * Comprehensive settings and controls for the PWA
 */
export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto max-w-[1200px] px-4 py-8 pb-24">
        {/* Page Header with Online Indicator */}
        <PageHeader
          title="Settings"
          description="Configure your PWA experience"
        />
        <div className="space-y-8">
          {/* ========== ACCOUNT SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Account</h2>
            <Card>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">User Name:</label>
                  <p className="font-medium">Demo User</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email:</label>
                  <p className="text-gray-500 text-sm">
                    (Multi-user authentication not yet implemented)
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* ========== PWA FEATURES SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">PWA Features</h2>
            <div className="space-y-4">
              {/* Install App */}
              <Card>
                <h3 className="text-lg font-semibold mb-2">Install App</h3>
                <p className="text-sm text-gray-400 mb-3">
                  Install CapturePWA on your device for a native app experience.
                </p>
                <InstallButton />
              </Card>

              {/* Push Notifications */}
              <Card>
                <PushNotificationManager />
              </Card>

              {/* App Badge */}
              <Card>
                <BadgeManager />
              </Card>

              {/* Service Worker */}
              <Card>
                <ServiceWorkerStatus />
              </Card>
            </div>
          </section>

          {/* ========== HARDWARE SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Hardware</h2>
            <Card>
              <HardwarePermissions />
            </Card>
          </section>

          {/* ========== PREFERENCES SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Preferences</h2>
            <Card>
              <PreferencesManager />
            </Card>
          </section>

          {/* ========== STORAGE SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Storage</h2>
            <Card>
              <StorageInfo />
            </Card>
          </section>

          {/* ========== DATA SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Data</h2>
            <Card>
              <DataManagement />
            </Card>
          </section>

          {/* ========== ADVANCED FEATURES ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">Advanced Features</h2>

            {/* Device Sensors */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Device Sensors</h3>
              <SensorDemo />
            </div>

            {/* Clipboard API */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-300">Clipboard API</h3>
              <Card>
                <ClipboardDemo />
              </Card>
            </div>
          </section>

          {/* ========== ABOUT SECTION ========== */}
          <section>
            <h2 className="text-xl font-bold mb-4 text-gray-200">About</h2>
            <Card>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">CapturePWA</h3>
                  <div className="text-sm text-gray-400 space-y-2">
                    <p>
                      <span className="font-semibold text-gray-300">Version:</span> 2.0.0
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Built with:</span>{' '}
                      Next.js 15, React 19, Prisma, Tailwind CSS
                    </p>
                    <p>
                      <span className="font-semibold text-gray-300">Database:</span>{' '}
                      SQLite (Development), PostgreSQL (Production)
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-4">
                    CapturePWA is a comprehensive showcase Progressive Web Application
                    demonstrating modern web capabilities including offline-first
                    architecture, hardware access, push notifications, and more.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://github.com/bizpropb/CapturePWA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      GitHub Repository →
                    </a>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    Tech Stack:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Next.js',
                      'React',
                      'Prisma',
                      'PWA',
                      'IndexedDB',
                      'Service Workers',
                      'Web APIs',
                      'Tailwind CSS',
                    ].map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs bg-gray-900 border border-gray-700 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
