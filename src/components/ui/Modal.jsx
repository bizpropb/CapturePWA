/**
 * Reusable Modal component
 * Backdrop with centered content, dark theme
 */

'use client';

import { useEffect } from 'react';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  maxWidth = null,
  className = '',
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const widthClass = maxWidth ? '' : sizes[size];
  const customMaxWidth = maxWidth ? { maxWidth } : {};

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center p-2 sm:p-4 z-50 animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-gray-800 rounded-lg shadow-xl w-full ${widthClass} ${className} animate-slideUp my-4 sm:my-8 mx-2 sm:mx-4 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] flex flex-col`}
        style={customMaxWidth}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
