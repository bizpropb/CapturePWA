/**
 * useClipboard Hook
 * React hook for clipboard operations
 *
 * Features:
 * - Copy text/images with loading states
 * - Read clipboard content
 * - Track operation status
 * - Auto-reset success state
 *
 * @example
 * const { copyText, copied, error } = useClipboard();
 *
 * <button onClick={() => copyText('Hello World')}>
 *   {copied ? 'Copied!' : 'Copy'}
 * </button>
 */

import { useState, useCallback, useEffect } from 'react';
import {
  copyText as copyTextUtil,
  copyImage as copyImageUtil,
  readText as readTextUtil,
  readImage as readImageUtil,
  isClipboardSupported,
  getClipboardCapabilities
} from '@/lib/clipboard-utils';

/**
 * Custom hook for clipboard operations
 * @param {Object} options - Hook options
 * @param {number} options.resetDelay - Time in ms before resetting copied state (default: 2000)
 * @returns {Object} Clipboard methods and state
 */
export function useClipboard({ resetDelay = 2000 } = {}) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capabilities, setCapabilities] = useState(null);

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, resetDelay);

      return () => clearTimeout(timer);
    }
  }, [copied, resetDelay]);

  // Load capabilities on mount
  useEffect(() => {
    getClipboardCapabilities().then(setCapabilities);
  }, []);

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   */
  const copyText = useCallback(async (text) => {
    setLoading(true);
    setError(null);

    const result = await copyTextUtil(text);

    if (result.success) {
      setCopied(true);
    } else {
      setError(result.error || 'Failed to copy text');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Copy image to clipboard
   * @param {Blob|File|string} image - Image to copy
   */
  const copyImage = useCallback(async (image) => {
    setLoading(true);
    setError(null);

    const result = await copyImageUtil(image);

    if (result.success) {
      setCopied(true);
    } else {
      setError(result.error || 'Failed to copy image');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Read text from clipboard
   */
  const readText = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await readTextUtil();

    if (!result.success) {
      setError(result.error || 'Failed to read clipboard');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Read image from clipboard
   */
  const readImage = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await readImageUtil();

    if (!result.success) {
      setError(result.error || 'Failed to read clipboard image');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Methods
    copyText,
    copyImage,
    readText,
    readImage,
    reset,

    // State
    copied,
    loading,
    error,
    isSupported: isClipboardSupported(),
    capabilities
  };
}

/**
 * Hook for handling paste events
 * @param {function} onPaste - Callback when paste occurs
 * @param {Object} options - Options
 * @param {boolean} options.enabled - Whether paste listener is enabled (default: true)
 */
export function usePasteListener(onPaste, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;

    const handler = async (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        // Handle text
        if (item.type === 'text/plain') {
          event.preventDefault();
          item.getAsString((text) => {
            onPaste({ type: 'text', data: text });
          });
        }

        // Handle images
        if (item.type.startsWith('image/')) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              onPaste({
                type: 'image',
                data: reader.result,
                blob: file
              });
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    document.addEventListener('paste', handler);
    return () => document.removeEventListener('paste', handler);
  }, [onPaste, enabled]);
}

/**
 * Hook for copy button with auto-feedback
 * Returns a button-ready object with onClick and children
 */
export function useCopyButton(text, options = {}) {
  const {
    successText = 'Copied!',
    defaultText = 'Copy',
    resetDelay = 2000
  } = options;

  const { copyText, copied, loading } = useClipboard({ resetDelay });

  const handleClick = useCallback(() => {
    copyText(text);
  }, [text, copyText]);

  return {
    onClick: handleClick,
    disabled: loading,
    children: copied ? successText : defaultText,
    copied,
    loading
  };
}
