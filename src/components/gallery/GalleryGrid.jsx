'use client';

import { useState, useEffect } from 'react';
import Skeleton from '@/components/ui/Skeleton';

/**
 * Masonry grid layout for gallery items
 * Responsive columns: 1 (mobile) -> 2 (sm) -> 3 (lg) -> 4 (xl)
 */
export default function GalleryGrid({ moments, onItemClick, loading }) {
  const [columns, setColumns] = useState(4);

  // Update columns based on window size
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 1024) setColumns(2);
      else if (window.innerWidth < 1280) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Distribute moments into columns for masonry layout
  const distributeMoments = () => {
    const cols = Array.from({ length: columns }, () => []);
    moments.forEach((moment, index) => {
      cols[index % columns].push({ moment, index });
    });
    return cols;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    );
  }

  const columnArrays = distributeMoments();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {columnArrays.map((column, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-4">
          {column.map(({ moment, index }) => (
            <GalleryItem
              key={moment.id}
              moment={moment}
              onClick={() => onItemClick(index)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Individual gallery item card
 */
function GalleryItem({ moment, onClick }) {
  const hasImage = moment.imageUrl;
  const hasVideo = moment.videoUrl;
  const hasAudio = moment.audioUrl;

  return (
    <div
      className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Media Preview */}
      {hasImage && (
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={moment.imageUrl}
            alt={moment.description}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Hover overlay */}
          <div
            className="absolute inset-0 bg-black transition-opacity duration-300 flex items-center justify-center pointer-events-none"
            style={{ opacity: 0 }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.5'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
          >
            <span className="text-white text-4xl">🔍</span>
          </div>
        </div>
      )}

      {hasVideo && !hasImage && (
        <div className="relative aspect-video bg-gray-900">
          <video
            src={moment.videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-white text-5xl">▶️</span>
          </div>
        </div>
      )}

      {hasAudio && !hasImage && !hasVideo && (
        <div className="aspect-video bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-2 block">🎵</span>
            <p className="text-sm text-gray-300">Audio Recording</p>
          </div>
        </div>
      )}

      {/* Info Overlay */}
      <div className="p-4">
        {/* Description */}
        <p className="text-sm text-gray-300 line-clamp-2 mb-2">
          {moment.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {new Date(moment.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>

          {/* Media type badges */}
          <div className="flex gap-1">
            {hasImage && (
              <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">
                📷
              </span>
            )}
            {hasVideo && (
              <span className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs">
                🎬
              </span>
            )}
            {hasAudio && (
              <span className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs">
                🎤
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {moment.tags && moment.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {moment.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
            ))}
            {moment.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{moment.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Mood */}
        {moment.mood && (
          <div className="mt-2 text-xs text-gray-400">
            Mood: {moment.mood}
          </div>
        )}
      </div>
    </div>
  );
}
