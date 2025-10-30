'use client';

import Navigation from './Navigation';
import InstallPrompt from './InstallPrompt';

/**
 * Main Layout Wrapper
 * Provides consistent layout with navigation
 * Handles spacing for mobile bottom nav and desktop sidebar
 */

export default function MainLayout({ children }) {
  return (
    <>
      <Navigation />

      {/* Main Content Area */}
      <main className="min-h-screen md:ml-64 pb-16 md:pb-0">
        {children}
      </main>

      {/* Install Prompt (floating banner) */}
      <InstallPrompt />
    </>
  );
}
