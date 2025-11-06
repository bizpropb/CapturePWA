'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation Component
 * Mobile: Bottom navigation bar
 * Desktop: Sidebar navigation with collapsible feature
 */

export default function Navigation({ isCollapsed, setIsCollapsed, onCaptureClick }) {
  const pathname = usePathname();

  const navItems = [
    // {
    //   name: 'Home',
    //   href: '/',
    //   icon: (
    //     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    //     </svg>
    //   ),
    // },
    {
      name: 'Timeline',
      href: '/timeline',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Capture',
      href: null, // Modal trigger, not a link
      isButton: true,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      name: 'Gallery',
      href: '/gallery',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Stats',
      href: '/stats',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav suppressHydrationWarning className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40 overflow-x-hidden" data-nav-collapsed={isCollapsed}>
        <div className="flex justify-around items-center h-16 overflow-x-hidden">
          {navItems.map((item) => {
            if (item.isButton) {
              return (
                <button
                  key={item.name}
                  onClick={onCaptureClick}
                  className="flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 text-gray-400 hover:text-gray-200"
                >
                  {item.icon}
                  <span className="text-xs mt-1">{item.name}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav
        suppressHydrationWarning
        className={`hidden md:flex fixed left-0 top-0 bottom-0 bg-gray-800 border-r border-gray-700 flex-col z-40 transition-all duration-300 overflow-x-hidden ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo/Brand & Toggle Button */}
        <div className={`p-6 border-b border-gray-700 flex items-center overflow-x-hidden ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <div suppressHydrationWarning className={`transition-opacity duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <h1 className="text-2xl font-bold text-white whitespace-nowrap">CapturePWA</h1>
            <p className="text-sm text-gray-400 mt-1 whitespace-nowrap">Save Your Moments</p>
          </div>

          {/* Hamburger Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isCollapsed ? (
                // Menu icon (expand)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              ) : (
                // Left arrow icon (collapse)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          {navItems.map((item) => {
            if (item.isButton) {
              return (
                <button
                  key={item.name}
                  onClick={onCaptureClick}
                  className={`flex items-center overflow-x-hidden ${isCollapsed ? 'justify-center px-6' : 'px-6'} py-3 transition-all duration-200 group relative text-gray-300 hover:bg-gray-700 hover:text-white w-full`}
                  title={isCollapsed ? item.name : ''}
                >
                  <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                  <span
                    suppressHydrationWarning
                    className={`font-medium transition-all duration-300 ${
                      isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {item.name}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center overflow-x-hidden ${isCollapsed ? 'justify-center px-6' : 'px-6'} py-3 transition-all duration-200 group relative ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <span className={isCollapsed ? '' : 'mr-3'}>{item.icon}</span>
                <span
                  suppressHydrationWarning
                  className={`font-medium transition-all duration-300 ${
                    isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                  }`}
                >
                  {item.name}
                </span>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Info */}
        <div suppressHydrationWarning className={`p-6 border-t border-gray-700 text-sm text-gray-400 transition-all duration-300 overflow-x-hidden ${
          isCollapsed ? 'text-center' : ''
        }`}>
          {isCollapsed ? (
            <p className="text-xs">v2.0</p>
          ) : (
            <>
              <p>PWA Showcase</p>
              <p className="mt-1">v2.0</p>
            </>
          )}
        </div>
      </nav>
    </>
  );
}
