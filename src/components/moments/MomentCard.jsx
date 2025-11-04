'use client';

import { useState } from 'react';
import Image from 'next/image';
import ShareButton from '@/components/ui/ShareButton';
import MapView from '@/components/capture/MapView';
import { useClipboard } from '@/hooks/useClipboard';
import { useFileSystem } from '@/hooks/useFileSystem';

export default function MomentCard({ moment, onDelete, onEdit }) {
  const [showMap, setShowMap] = useState(false);
  const { copyText, copied, loading: copying } = useClipboard();
  const { downloadImage, loading: downloading, success: downloaded } = useFileSystem();

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

  // Download image
  const handleDownloadImage = async () => {
    if (!moment.imageUrl) return;

    const filename = `moment-${moment.id}-${new Date(moment.createdAt).toISOString().split('T')[0]}.jpg`;
    await downloadImage(moment.imageUrl, filename, {
      preferPicker: false // Use direct download for better UX
    });
  };

  return (
    <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Image */}
      {moment.imageUrl && (
        <div className="w-full h-48 bg-gray-700 relative cursor-pointer" onClick={() => window.open(moment.imageUrl, '_blank')}>
          <Image
            src={moment.imageUrl}
            alt="Moment"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Share Button */}
          <ShareButton
            moment={moment}
            onShareSuccess={() => console.log('Shared successfully!')}
          />

          {/* Copy Text */}
          <button
            onClick={handleCopyText}
            disabled={copying}
            className="bg-neutral-900 border-2 border-emerald-900 text-emerald-100 py-2 px-4 rounded hover:bg-neutral-800 hover:border-emerald-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy moment text to clipboard"
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            disabled={copying}
            className="bg-neutral-900 border-2 border-emerald-900 text-emerald-100 py-2 px-4 rounded hover:bg-neutral-800 hover:border-emerald-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Copy shareable link to clipboard"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>

          {/* Download Image Button (if image exists) */}
          {moment.imageUrl && (
            <button
              onClick={handleDownloadImage}
              disabled={downloading}
              className="bg-neutral-900 border-2 border-emerald-900 text-emerald-100 py-2 px-4 rounded hover:bg-neutral-800 hover:border-emerald-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download image to device"
            >
              {downloaded ? 'Downloaded!' : downloading ? 'Downloading...' : 'Download Image'}
            </button>
          )}

          {/* Edit Button */}
          <button
            onClick={() => onEdit(moment)}
            className="bg-neutral-900 border-2 border-purple-900 text-purple-100 py-2 px-4 rounded hover:bg-neutral-800 hover:border-purple-800 transition-colors duration-200"
          >
            Edit
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(moment.id)}
            className="bg-neutral-900 border-2 border-red-900 text-red-100 py-2 px-4 rounded hover:bg-neutral-800 hover:border-red-800 transition-colors duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
