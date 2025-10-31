import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

/**
 * Generate metadata for shared moment (SEO + Social sharing)
 */
export async function generateMetadata({ params }) {
  const { token } = await params;

  try {
    const moment = await prisma.moment.findUnique({
      where: { shareToken: token },
      include: {
        user: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    if (!moment || !moment.isPublic) {
      return {
        title: 'Moment Not Found',
      };
    }

    const description = moment.description?.slice(0, 160) || 'Check out this moment!';

    return {
      title: `Moment by ${moment.user.name} | CapturePWA`,
      description: description,
      openGraph: {
        title: `Moment by ${moment.user.name}`,
        description: description,
        images: moment.imageUrl ? [moment.imageUrl] : [],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Moment by ${moment.user.name}`,
        description: description,
        images: moment.imageUrl ? [moment.imageUrl] : [],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Moment Not Found',
    };
  }
}

/**
 * Share page for viewing public moments
 */
export default async function SharePage({ params }) {
  const { token } = await params;

  // Fetch moment by share token
  let moment;
  try {
    moment = await prisma.moment.findUnique({
      where: { shareToken: token },
      include: {
        user: { select: { name: true } },
        category: { select: { name: true, icon: true } },
        tags: {
          include: {
            tag: { select: { name: true, color: true } },
          },
        },
      },
    });

    // Increment view count
    if (moment && moment.isPublic) {
      await prisma.moment.update({
        where: { id: moment.id },
        data: { viewCount: { increment: 1 } },
      });
    }
  } catch (error) {
    console.error('Error fetching moment:', error);
    moment = null;
  }

  // If moment not found or not public, show 404
  if (!moment || !moment.isPublic) {
    notFound();
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasLocation = moment.gpsLat !== 0 || moment.gpsLng !== 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to CapturePWA</span>
          </Link>

          <div className="text-sm text-gray-400">
            {moment.viewCount} view{moment.viewCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Moment Card */}
        <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
          {/* Image */}
          {moment.imageUrl && (
            <div className="w-full">
              <img
                src={moment.imageUrl}
                alt="Shared moment"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Author & Category */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {moment.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-lg">{moment.user.name}</p>
                {moment.category && (
                  <p className="text-sm text-gray-400">
                    {moment.category.icon} {moment.category.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <p className="text-gray-100 text-lg whitespace-pre-wrap leading-relaxed">
                {moment.description}
              </p>
            </div>

            {/* Tags */}
            {moment.tags.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {moment.tags.map(({ tag }) => (
                  <span
                    key={tag.name}
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
            )}

            {/* Audio Player */}
            {moment.audioUrl && (
              <div className="mb-4">
                <audio controls className="w-full">
                  <source src={moment.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Mood & Weather */}
            {(moment.mood || moment.weather) && (
              <div className="mb-4 flex gap-4">
                {moment.mood && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-lg">😊</span>
                    <span className="capitalize">{moment.mood}</span>
                  </div>
                )}
                {moment.weather && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span className="text-lg">🌤️</span>
                    <span className="capitalize">{moment.weather}</span>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-400 space-y-1 border-t border-gray-800 pt-4">
              <p>
                <span className="font-medium">Captured:</span> {formatDate(moment.createdAt)}
              </p>

              {hasLocation && (
                <p>
                  <span className="font-medium">Location:</span>{' '}
                  <a
                    href={`https://www.google.com/maps?q=${moment.gpsLat},${moment.gpsLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {moment.gpsLat.toFixed(4)}, {moment.gpsLng.toFixed(4)} 📍
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-3">Capture your own moments with CapturePWA</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Try CapturePWA
          </Link>
        </div>
      </div>
    </div>
  );
}
