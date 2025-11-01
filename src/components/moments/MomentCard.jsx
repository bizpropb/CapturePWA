'use client';

import { useState } from 'react';
import ShareButton from '@/components/ui/ShareButton';
import MapView from '@/components/capture/MapView';
import { useClipboard } from '@/hooks/useClipboard';

export default function MomentCard({ moment, onDelete, onEdit }) {
  const [showMap, setShowMap] = useState(false);
  const { copyText, copied, loading: copying } = useClipboard();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasLocation = moment.gpsLat !== 0 || moment.gpsLng !== 0;

  // Copy moment text
  const handleCopyText = () => {
    const text = `${moment.description}\n\nCreated: ${formatDate(moment.createdAt)}${
      hasLocation ? `\nLocation: ${moment.gpsLat.toFixed(6)}, ${moment.gpsLng.toFixed(6)}` : ''
    }${moment.mood ? `\nMood: ${moment.mood}` : ''}${
      moment.weather ? `\nWeather: ${moment.weather}` : ''
    }`;
    copyText(text);
  };

  // Copy share link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/moments/${moment.id}`;
    copyText(url);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
      {/* Image */}
      {moment.imageUrl && (
        <div className="w-full h-48 bg-gray-700">
          <img
            src={moment.imageUrl}
            alt="Moment"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => window.open(moment.imageUrl, '_blank')}
          />
        </div>
      )}

      <div className="p-6">
        {/* Description */}
        <div className="mb-3">
          <p className="text-gray-100 text-lg whitespace-pre-wrap">{moment.description}</p>
        </div>

        {/* Video Player */}
        {moment.videoUrl && (
          <div className="mb-3">
            <video controls className="w-full rounded-lg">
              <source src={moment.videoUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          </div>
        )}

        {/* Audio Player */}
        {moment.audioUrl && (
          <div className="mb-3">
            <audio controls className="w-full">
              <source src={moment.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Location Display */}
        {hasLocation && (
          <div className="mb-3 border border-gray-700 rounded-lg overflow-hidden">
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
                  {moment.gpsAccuracy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Accuracy: ±{Math.round(moment.gpsAccuracy)}m
                    </p>
                  )}
                </div>
                <span className="text-gray-400 text-sm">
                  {showMap ? '▼' : '▶'}
                </span>
              </div>
            </button>

            {/* Embedded Map */}
            {showMap && (
              <div className="border-t border-gray-700">
                <MapView
                  lat={moment.gpsLat}
                  lng={moment.gpsLng}
                  zoom={15}
                  height={250}
                  showMarker={true}
                  popupText={moment.locationName || moment.description}
                />
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-sm text-gray-400 space-y-1">
          <p>
            <span className="font-medium">Created:</span> {formatDate(moment.createdAt)}
          </p>

          {/* Mood */}
          {moment.mood && (
            <p>
              <span className="font-medium">Mood:</span> {moment.mood}
            </p>
          )}

          {/* Weather */}
          {moment.weather && (
            <p>
              <span className="font-medium">Weather:</span> {moment.weather}
            </p>
          )}

          {!hasLocation && (
            <p className="text-gray-500">No location</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col gap-2">
          {/* Share Button (Full Width) */}
          <ShareButton
            moment={moment}
            onShareSuccess={() => console.log('Shared successfully!')}
            className="w-full"
          />

          {/* Copy Buttons (Side by Side) */}
          <div className="flex gap-2">
            <button
              onClick={handleCopyText}
              disabled={copying}
              className="flex-1 bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Copy moment text to clipboard"
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span>Copy Text</span>
                </>
              )}
            </button>
            <button
              onClick={handleCopyLink}
              disabled={copying}
              className="flex-1 bg-purple-900 text-white py-2 px-4 rounded hover:bg-purple-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Copy shareable link to clipboard"
            >
              {copied ? (
                <>
                  <span>✓</span>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Edit & Delete Buttons (Side by Side) */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(moment)}
              className="flex-1 bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800 transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(moment.id)}
              className="flex-1 bg-red-900 text-white py-2 px-4 rounded hover:bg-red-800 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
