'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatTimelineDate, getTimeAgo } from '@/utils/date-grouping';
import MapView from '@/components/capture/MapView';
import ShareButton from '@/components/ui/ShareButton';
import Button from '@/components/ui/Button';

/**
 * Individual timeline item
 * Displays a moment with optional mini-map for GPS location
 */
export default function TimelineItem({ moment, isLast, onEdit, onDelete }) {
  const [showMap, setShowMap] = useState(false);

  const hasLocation = moment.gpsLat !== 0 || moment.gpsLng !== 0;
  const hasMedia = moment.imageUrl || moment.audioUrl || moment.videoUrl;

  return (
    <div className="relative pl-0 md:pl-16">
      {/* Timeline Dot (Desktop) */}
      <div className="hidden md:block absolute left-6 top-4 transform -translate-x-1/2">
        <div className="w-4 h-4 rounded-full bg-blue-500 border-4 border-gray-900"></div>
      </div>

      {/* Card */}
      <div className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
        {/* Media */}
        {moment.imageUrl && (
          <div className="w-full h-64 bg-gray-700 relative">
            <Image
              src={moment.imageUrl}
              alt={moment.description}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {moment.videoUrl && (
          <div className="w-full">
            <video controls className="w-full h-auto max-h-96">
              <source src={moment.videoUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {moment.audioUrl && (
          <div className="p-4 bg-gray-750">
            <audio controls className="w-full">
              <source src={moment.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Timestamp */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatTimelineDate(moment.createdAt)}</span>
              <span className="text-gray-600">·</span>
              <span>{getTimeAgo(moment.createdAt)}</span>
            </div>

            {/* Media Type Badges */}
            {hasMedia && (
              <div className="flex gap-1">
                {moment.imageUrl && (
                  <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
                    📷
                  </span>
                )}
                {moment.videoUrl && (
                  <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">
                    🎬
                  </span>
                )}
                {moment.audioUrl && (
                  <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">
                    🎤
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-100 text-lg mb-4 whitespace-pre-wrap">
            {moment.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {/* Mood */}
            {moment.mood && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Mood:</span>
                <span className="text-gray-200">{moment.mood}</span>
              </div>
            )}

            {/* Weather */}
            {moment.weather && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Weather:</span>
                <span className="text-gray-200">{moment.weather}</span>
              </div>
            )}

            {/* Category */}
            {moment.category && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Category:</span>
                <span className="text-gray-200">
                  {moment.category.icon} {moment.category.name}
                </span>
              </div>
            )}

            {/* View Count */}
            {moment.viewCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Views:</span>
                <span className="text-gray-200">{moment.viewCount}</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {moment.tags.map((tag, index) => (
                <span
                  key={`${moment.id}-tag-${tag.id}-${index}`}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Location */}
          {hasLocation && (
            <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden">
              {/* Location Header */}
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full bg-gray-900 p-3 text-left hover:bg-gray-850 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      📍 Location
                    </p>
                    {moment.locationName && (
                      <p className="text-sm text-gray-400 mt-1">
                        {moment.locationName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {moment.gpsLat.toFixed(6)}, {moment.gpsLng.toFixed(6)}
                    </p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {showMap ? '▼' : '▶'}
                  </span>
                </div>
              </button>

              {/* Mini Map */}
              {showMap && (
                <div className="border-t border-gray-700">
                  <MapView
                    lat={moment.gpsLat}
                    lng={moment.gpsLng}
                    zoom={13}
                    height={200}
                    showMarker={true}
                    popupText={moment.locationName || moment.description}
                  />
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <ShareButton
              moment={moment}
              onShareSuccess={() => console.log('Shared!')}
            />

            {onEdit && (
              <Button
                onClick={() => onEdit(moment)}
                variant="primary"
                size="sm"
              >
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                onClick={() => onDelete(moment.id)}
                variant="danger"
                size="sm"
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
