'use client';

import { useState, useEffect } from 'react';
import Navigation from './Navigation';
// import InstallPrompt from './InstallPrompt';

/**
 * Main Layout Wrapper
 * Provides consistent layout with navigation
 * Handles spacing for mobile bottom nav and desktop sidebar
 */

export default function MainLayout({ children }) {
  // Always start with true (collapsed) for SSR, then hydrate from localStorage
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  // Hydrate from localStorage after mount (client-side only)
  useEffect(() => {
    const savedState = localStorage.getItem('navCollapsed');
    if (savedState !== null) {
      setIsNavCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage when it changes
  const handleSetCollapsed = (collapsed) => {
    setIsNavCollapsed(collapsed);
    localStorage.setItem('navCollapsed', collapsed.toString());
  };

  return (
    <>
      <Navigation
        isCollapsed={isNavCollapsed}
        setIsCollapsed={handleSetCollapsed}
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
