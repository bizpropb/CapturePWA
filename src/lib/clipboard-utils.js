/**
 * Clipboard API Utilities
 * Provides comprehensive clipboard operations for text and images
 *
 * Features:
 * - Copy text to clipboard
 * - Copy images to clipboard
 * - Read text from clipboard
 * - Read images from clipboard
 * - Permission handling
 * - Browser compatibility checks
 *
 * Browser Support:
 * - Chrome 66+ (full support)
 * - Edge 79+
 * - Firefox 63+ (limited support for images)
 * - Safari 13.1+
 * - iOS Safari 13.4+
 *
 * @module clipboard-utils
 */

/**
 * Check if Clipboard API is supported
 * @returns {boolean} True if clipboard API is available
 */
export function isClipboardSupported() {
  return typeof navigator !== 'undefined' && 'clipboard' in navigator;
}

/**
 * Check if clipboard write is supported
 * @returns {boolean} True if clipboard write is available
 */
export function isClipboardWriteSupported() {
  return isClipboardSupported() && 'write' in navigator.clipboard;
}

/**
 * Check if clipboard read is supported
 * @returns {boolean} True if clipboard read is available
 */
export function isClipboardReadSupported() {
  return isClipboardSupported() && 'read' in navigator.clipboard;
}

/**
 * Check clipboard permission status
 * @param {string} type - Permission type: 'clipboard-read' or 'clipboard-write'
 * @returns {Promise<PermissionState>} Permission state: 'granted', 'denied', or 'prompt'
 */
export async function checkClipboardPermission(type = 'clipboard-write') {
  if (!('permissions' in navigator)) {
    return 'unknown';
  }

  try {
    const result = await navigator.permissions.query({ name: type });
    return result.state;
  } catch (error) {
    // Some browsers don't support clipboard permission queries
    console.warn('Clipboard permission query not supported:', error);
    return 'unknown';
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function copyText(text) {
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Invalid text provided'
    };
  }

  if (!isClipboardSupported()) {
    // Fallback to old method
    return copyTextFallback(text);
  }

  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (error) {
    console.error('Failed to copy text:', error);

    // Try fallback method
    return copyTextFallback(text);
  }
}

/**
 * Fallback method for copying text (older browsers)
 * @param {string} text - Text to copy
 * @returns {Promise<{success: boolean, error?: string}>}
 */
function copyTextFallback(text) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const success = document.execCommand('copy');
    document.body.removeChild(textarea);

    return {
      success,
      error: success ? undefined : 'Failed to copy text using fallback method'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Copy image to clipboard
 * @param {Blob|File|string} image - Image blob, file, or data URL
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function copyImage(image) {
  if (!isClipboardWriteSupported()) {
    return {
      success: false,
      error: 'Clipboard image copy not supported in this browser'
    };
  }

  try {
    let blob = image;

    // Convert data URL to blob if needed
    if (typeof image === 'string' && image.startsWith('data:')) {
      blob = await dataURLToBlob(image);
    }

    // Ensure we have a blob
    if (!(blob instanceof Blob)) {
      return {
        success: false,
        error: 'Invalid image format'
      };
    }

    // Create ClipboardItem with the image
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob
    });

    await navigator.clipboard.write([clipboardItem]);
    return { success: true };
  } catch (error) {
    console.error('Failed to copy image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Read text from clipboard
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function readText() {
  if (!isClipboardSupported()) {
    return {
      success: false,
      error: 'Clipboard API not supported'
    };
  }

  try {
    const text = await navigator.clipboard.readText();
    return {
      success: true,
      text
    };
  } catch (error) {
    console.error('Failed to read clipboard text:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Read image from clipboard
 * @returns {Promise<{success: boolean, blob?: Blob, dataUrl?: string, error?: string}>}
 */
export async function readImage() {
  if (!isClipboardReadSupported()) {
    return {
      success: false,
      error: 'Clipboard read not supported'
    };
  }

  try {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      // Look for image types
      for (const type of item.types) {
        if (type.startsWith('image/')) {
          const blob = await item.getType(type);
          const dataUrl = await blobToDataURL(blob);

          return {
            success: true,
            blob,
            dataUrl
          };
        }
      }
    }

    return {
      success: false,
      error: 'No image found in clipboard'
    };
  } catch (error) {
    console.error('Failed to read clipboard image:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Listen for paste events and handle text/images
 * @param {function} callback - Callback function to receive paste data
 * @returns {function} Cleanup function to remove event listener
 */
export function onPaste(callback) {
  const handler = async (event) => {
    event.preventDefault();

    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      // Handle text
      if (item.type === 'text/plain') {
        item.getAsString((text) => {
          callback({
            type: 'text',
            data: text
          });
        });
      }

      // Handle images
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const dataUrl = await blobToDataURL(file);
          callback({
            type: 'image',
            data: dataUrl,
            blob: file
          });
        }
      }
    }
  };

  document.addEventListener('paste', handler);

  // Return cleanup function
  return () => {
    document.removeEventListener('paste', handler);
  };
}

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL to convert
 * @returns {Promise<Blob>}
 */
export async function dataURLToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Convert Blob to data URL
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>}
 */
export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Get clipboard capabilities summary
 * @returns {Promise<Object>} Summary of clipboard capabilities
 */
export async function getClipboardCapabilities() {
  const writePermission = await checkClipboardPermission('clipboard-write');
  const readPermission = await checkClipboardPermission('clipboard-read');

  return {
    supported: isClipboardSupported(),
    writeSupported: isClipboardWriteSupported(),
    readSupported: isClipboardReadSupported(),
    writePermission,
    readPermission,
    supportsImages: isClipboardWriteSupported() && typeof ClipboardItem !== 'undefined'
  };
}
