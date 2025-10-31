'use client';

import { useState } from 'react';

/**
 * ShareButton Component - Web Share API Implementation
 *
 * Allows sharing content using the device's native share functionality.
 * Falls back to clipboard copy on unsupported browsers.
 *
 * @param {Object} props
 * @param {Object} props.moment - Moment object to share
 * @param {Function} props.onShareSuccess - Callback on successful share
 * @param {string} props.className - Additional CSS classes
 */
export default function ShareButton({ moment, onShareSuccess, className = '' }) {
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [shareToken, setShareToken] = useState(moment.shareToken);

  /**
   * Check if Web Share API is supported
   */
  const canShare = typeof navigator !== 'undefined' && navigator.share;

  /**
   * Generate share token if one doesn't exist
   */
  const ensureShareToken = async () => {
    if (shareToken) return shareToken;

    try {
      const response = await fetch(`/api/moments/${moment.id}/share`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate share token');
      }

      const data = await response.json();
      setShareToken(data.shareToken);
      return data.shareToken;
    } catch (error) {
      console.error('Error generating share token:', error);
      throw error;
    }
  };

  /**
   * Generate share URL for moment
   */
  const getShareUrl = async () => {
    if (typeof window === 'undefined') return '';
    const token = await ensureShareToken();
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${token}`;
  };

  /**
   * Prepare share data
   */
  const getShareData = async () => {
    const url = await getShareUrl();
    const description = moment.description?.slice(0, 100) || 'Check out this moment!';

    return {
      title: 'Moment from CapturePWA',
      text: description,
      url: url,
    };
  };

  /**
   * Share with Web Share API
   */
  const handleShare = async () => {
    setIsSharing(true);

    try {
      const shareData = getShareData();

      // If there's an image, try to share it too
      if (moment.imageUrl && navigator.canShare) {
        try {
          const response = await fetch(moment.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'moment.jpg', { type: blob.type });

          // Check if we can share files
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              ...shareData,
              files: [file],
            });
            onShareSuccess?.();
            return;
          }
        } catch (error) {
          console.warn('Could not share image, sharing link only:', error);
          // Fall through to text-only sharing
        }
      }

      // Share text + link only
      await navigator.share(shareData);
      onShareSuccess?.();
    } catch (error) {
      // User cancelled share or error occurred
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fall back to copy
        await handleCopyLink();
      }
    } finally {
      setIsSharing(false);
    }
  };

  /**
   * Fallback: Copy link to clipboard
   */
  const handleCopyLink = async () => {
    try {
      const url = await getShareUrl();
      await navigator.clipboard.writeText(url);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
      onShareSuccess?.();
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };

  /**
   * Main click handler
   */
  const handleClick = async () => {
    if (canShare) {
      await handleShare();
    } else {
      await handleCopyLink();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSharing}
      className={`
        relative flex items-center justify-center gap-2
        bg-green-600 text-white py-2 px-4 rounded
        hover:bg-green-700 active:bg-green-800
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      title={canShare ? 'Share' : 'Copy link'}
    >
      {/* Icon */}
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
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>

      {/* Text */}
      {isSharing ? (
        <span>Sharing...</span>
      ) : showCopied ? (
        <span>✓ Copied!</span>
      ) : (
        <span>{canShare ? 'Share' : 'Copy Link'}</span>
      )}

      {/* Success indicator */}
      {showCopied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm py-1 px-3 rounded shadow-lg whitespace-nowrap">
          Link copied to clipboard!
        </div>
      )}
    </button>
  );
}
