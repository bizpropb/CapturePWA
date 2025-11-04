'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
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
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
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
          <Button
            onClick={handleCopyText}
            disabled={copying}
            variant="secondary"
            size="sm"
          >
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>

          {/* Copy Link */}
          <Button
            onClick={handleCopyLink}
            disabled={copying}
            variant="secondary"
            size="sm"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>

          {/* Download Image Button (if image exists) */}
          {moment.imageUrl && (
            <Button
              onClick={handleDownloadImage}
              disabled={downloading}
              variant="primary"
              size="sm"
            >
              {downloaded ? 'Downloaded!' : downloading ? 'Downloading...' : 'Download Image'}
            </Button>
          )}

          {/* Edit Button */}
          <Button
            onClick={() => onEdit(moment)}
            variant="primary"
            size="sm"
          >
            Edit
          </Button>

          {/* Delete Button */}
          <Button
            onClick={() => onDelete(moment.id)}
            variant="danger"
            size="sm"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
