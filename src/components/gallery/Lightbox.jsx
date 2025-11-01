'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useFileSystem } from '@/hooks/useFileSystem';
import Button from '@/components/ui/Button';

/**
 * Lightbox component for full-screen media viewing
 * Supports images and videos with navigation and download
 */
export default function Lightbox({ items, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const { downloadImage, loading: downloading } = useFileSystem();

  const currentItem = items[currentIndex];
  const canGoNext = currentIndex < items.length - 1;
  const canGoPrev = currentIndex > 0;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && canGoNext) goNext();
      if (e.key === 'ArrowLeft' && canGoPrev) goPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, items.length]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const goNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
      setIsZoomed(false);
    }
  };

  const goPrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
      setIsZoomed(false);
    }
  };

  const handleDownload = async () => {
    if (currentItem.type !== 'image') return;

    const filename = `moment-${currentItem.id}-${new Date(currentItem.createdAt)
      .toISOString()
      .split('T')[0]}.jpg`;
    await downloadImage(currentItem.url, filename, {
      preferPicker: false,
    });
  };

  const toggleZoom = () => {
    if (currentItem.type === 'image') {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
        title="Close (Esc)"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous button */}
      {canGoPrev && (
        <button
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
          title="Previous (←)"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Next button */}
      {canGoNext && (
        <button
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
          title="Next (→)"
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* Media content */}
      <div className="relative max-w-7xl max-h-[90vh] w-full mx-4">
        {currentItem.type === 'image' ? (
          <div
            className={`relative ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} w-full h-[90vh]`}
            onClick={toggleZoom}
          >
            <Image
              src={currentItem.url}
              alt={currentItem.description}
              fill
              className={`object-contain transition-transform duration-300 ${
                isZoomed ? 'scale-150' : 'scale-100'
              }`}
              style={isZoomed ? { transformOrigin: 'center center' } : {}}
              sizes="100vw"
            />
          </div>
        ) : currentItem.type === 'video' ? (
          <video
            src={currentItem.url}
            controls
            autoPlay
            className="w-full h-auto max-h-[90vh]"
          >
            Your browser does not support the video element.
          </video>
        ) : null}
      </div>

      {/* Info bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Info */}
          <div className="flex-1 mr-4">
            <p className="text-white text-sm font-medium truncate">
              {currentItem.description}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {new Date(currentItem.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' • '}
              {currentIndex + 1} / {items.length}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {currentItem.type === 'image' && (
              <>
                <Button
                  onClick={toggleZoom}
                  variant="secondary"
                  size="sm"
                  title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  {isZoomed ? '🔍-' : '🔍+'}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="secondary"
                  size="sm"
                  loading={downloading}
                  disabled={downloading}
                  title="Download Image"
                >
                  💾 Download
                </Button>
              </>
            )}
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail strip (optional, for many items) */}
      {items.length > 1 && (
        <div className="absolute bottom-20 left-0 right-0 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 justify-center px-4 pb-2">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsZoomed(false);
                }}
                className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-blue-500 opacity-100'
                    : 'border-transparent opacity-50 hover:opacity-75'
                }`}
              >
                {item.type === 'image' ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-2xl">▶️</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
