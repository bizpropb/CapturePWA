'use client';

import { useState } from 'react';
import Navigation from './Navigation';
import CaptureModal from '@/components/capture/CaptureModal';
// import InstallPrompt from './InstallPrompt';

/**
 * Main Layout Wrapper
 * Provides consistent layout with navigation
 * Handles spacing for mobile bottom nav and desktop sidebar
 */

// Get initial state from localStorage (client-side only, synchronous)
const getInitialCollapsedState = () => {
  if (typeof window === 'undefined') return true; // SSR default
  const saved = localStorage.getItem('navCollapsed');
  return saved === null ? true : saved === 'true'; // Default to true (collapsed) if never set
};

export default function MainLayout({ children }) {
  // Initialize with localStorage value (or default to collapsed)
  const [isNavCollapsed, setIsNavCollapsed] = useState(getInitialCollapsedState);
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);

  // Save to localStorage when state changes
  const handleSetCollapsed = (collapsed) => {
    setIsNavCollapsed(collapsed);
    localStorage.setItem('navCollapsed', collapsed.toString());
  };

  return (
    <>
      <Navigation
        isCollapsed={isNavCollapsed}
        setIsCollapsed={handleSetCollapsed}
        onCaptureClick={() => setIsCaptureModalOpen(true)}
      />

      <CaptureModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
      />

      {/* Main Content Area */}
      <main suppressHydrationWarning className={`min-h-screen pb-16 md:pb-0 transition-all duration-300 page-enter ${
        isNavCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        {children}
      </main>

      {/* Install Prompt (floating banner) - Temporarily disabled for build */}
      {/* <InstallPrompt /> */}
    </>
  );
}
