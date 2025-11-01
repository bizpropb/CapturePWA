'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Custom Error Page
 * Catches runtime errors in the app
 * @param {Object} props
 * @param {Error} props.error - The error that was thrown
 * @param {Function} props.reset - Function to reset the error boundary
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Application error:', error);

    // You could also log to an error reporting service here
    // Example: logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Error Illustration */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-900/30 border-2 border-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Oops! Something Went Wrong
        </h1>
        <p className="text-xl text-gray-400 mb-6">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Error Details (Collapsible) */}
        <details className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 text-left">
          <summary className="cursor-pointer font-semibold text-gray-200 hover:text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Error Details
            </span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 p-4 bg-gray-900 rounded border border-gray-700">
            <p className="text-sm font-mono text-red-400 break-all">
              {error.message || 'An unknown error occurred'}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </details>

        {/* What Happened Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3 text-gray-200">
            What happened?
          </h2>
          <ul className="text-left space-y-2 text-gray-300 text-sm">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>The application encountered an unexpected error while processing your request</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your data has been preserved and is safe</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>The error has been logged for investigation</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 shadow-lg shadow-blue-600/30"
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </div>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              href="/"
              className="block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-700"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Home
              </div>
            </Link>

            <button
              onClick={() => window.location.reload()}
              className="block bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 border border-gray-700"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload Page
              </div>
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-8 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400">
            If this error persists, please try the following:
          </p>
          <div className="mt-2 space-y-1 text-xs text-gray-500">
            <p>• Clear your browser cache and reload</p>
            <p>• Try using a different browser</p>
            <p>• Check your internet connection</p>
            <p>• Contact support if the issue continues</p>
          </div>
        </div>

        {/* Error Code */}
        <p className="text-gray-600 text-xs mt-6">
          Error boundary triggered • {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  );
}
