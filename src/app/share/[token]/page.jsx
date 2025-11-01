import { notFound } from 'next/navigation';
import Image from 'next/image';
import SharePageClient from './SharePageClient';

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

/**
 * Fetch moment data by share token
 */
async function getMoment(token) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/moments/share/${token}`, {
      next: { revalidate: 3600 }, // ISR cache for 1 hour
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching moment:', error);
    return null;
  }
}

/**
 * Generate dynamic metadata for social sharing
 */
export async function generateMetadata({ params }) {
  const { token } = await params;
  const moment = await getMoment(token);

  if (!moment) {
    return {
      title: 'Moment Not Found - CapturePWA',
      description: 'This moment could not be found or is no longer shared publicly.',
    };
  }

  const title = `${moment.user.name}'s Moment - CapturePWA`;
  const description = moment.description || 'Check out this moment captured on CapturePWA';
  const imageUrl = moment.imageUrl || '/icons/icon-512x512.png';
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/share/${token}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'CapturePWA',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: description,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: moment.createdAt,
      modifiedTime: moment.updatedAt,
      authors: [moment.user.name],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@capturepwa',
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Share Page Component (Server Component)
 */
export default async function SharePage({ params }) {
  const { token } = await params;
  const moment = await getMoment(token);

  // If moment not found, show 404
  if (!moment) {
    notFound();
  }

  const formattedDate = new Date(moment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold">
              {moment.user.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold">{moment.user.name}</h2>
              <p className="text-sm text-gray-400">{formattedDate}</p>
            </div>
          </div>

          {/* View Count */}
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm">{moment.viewCount + 1} views</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Image */}
        {moment.imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-gray-800">
            <img
              src={moment.imageUrl}
              alt={moment.description}
              className="w-full h-auto max-h-[600px] object-contain"
            />
          </div>
        )}

        {/* Video */}
        {moment.videoUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-gray-800">
            <video
              src={moment.videoUrl}
              controls
              className="w-full h-auto max-h-[600px]"
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}

        {/* Audio */}
        {moment.audioUrl && (
          <div className="mb-6 p-6 rounded-2xl bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Audio Recording</h3>
                <p className="text-sm text-gray-400">Tap to play</p>
              </div>
            </div>
            <audio
              src={moment.audioUrl}
              controls
              className="w-full"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        )}

        {/* Description */}
        <div className="mb-6 p-6 rounded-2xl bg-gray-800/50">
          <p className="text-lg leading-relaxed whitespace-pre-wrap">
            {moment.description}
          </p>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Mood */}
          {moment.mood && (
            <div className="px-4 py-2 rounded-full bg-purple-600/20 text-purple-300 text-sm font-medium">
              {moment.mood}
            </div>
          )}

          {/* Weather */}
          {moment.weather && (
            <div className="px-4 py-2 rounded-full bg-blue-600/20 text-blue-300 text-sm font-medium">
              {moment.weather}
            </div>
          )}

          {/* Category */}
          {moment.category && (
            <div className="px-4 py-2 rounded-full bg-green-600/20 text-green-300 text-sm font-medium">
              {moment.category.icon} {moment.category.name}
            </div>
          )}
        </div>

        {/* Tags */}
        {moment.tags && moment.tags.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {moment.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location */}
        {(moment.gpsLat !== 0 || moment.gpsLng !== 0) && (
          <div className="mb-6 p-6 rounded-2xl bg-gray-800/50">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                {moment.locationName ? (
                  <p className="text-gray-300">{moment.locationName}</p>
                ) : (
                  <p className="text-gray-400 text-sm">
                    {moment.gpsLat.toFixed(6)}, {moment.gpsLng.toFixed(6)}
                    {moment.gpsAccuracy && ` (±${Math.round(moment.gpsAccuracy)}m)`}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Client-side components (Open in App button) */}
        <SharePageClient />
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-gray-800">
        <p className="text-gray-400 mb-4">
          Captured with <span className="text-blue-400 font-semibold">CapturePWA</span>
        </p>
        <p className="text-sm text-gray-500">
          A progressive web app for capturing life's moments
        </p>
      </footer>
    </div>
  );
}
