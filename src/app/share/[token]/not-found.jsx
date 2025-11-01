import Link from 'next/link';

/**
 * Custom 404 page for share links
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold mb-4">Moment Not Found</h1>

        {/* Description */}
        <p className="text-gray-400 mb-8">
          This moment could not be found. It may have been deleted, the link might be incorrect, or it may no longer be shared publicly.
        </p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Go to Home
          </Link>

          <Link
            href="/capture"
            className="block w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors duration-200 border border-gray-700"
          >
            Create Your Own Moment
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 mt-8">
          Need help? Contact support or check if the share link is correct.
        </p>
      </div>
    </div>
  );
}
