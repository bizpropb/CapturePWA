/**
 * Client-side utilities for uploading files to Cloudinary
 */

/**
 * Upload an image file to Cloudinary
 * @param {File|Blob} file - Image file or blob to upload
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export async function uploadImage(file) {
  return uploadFile(file, 'image');
}

/**
 * Upload an audio file to Cloudinary
 * @param {File|Blob} file - Audio file or blob to upload
 * @returns {Promise<string>} The secure URL of the uploaded audio
 */
export async function uploadAudio(file) {
  return uploadFile(file, 'audio');
}

/**
 * Upload a video file to Cloudinary
 * @param {File|Blob} file - Video file or blob to upload
 * @returns {Promise<string>} The secure URL of the uploaded video
 */
export async function uploadVideo(file) {
  return uploadFile(file, 'video');
}

/**
 * Generic file upload function
 * @param {File|Blob} file - File or blob to upload
 * @param {string} type - Type of file ('image', 'audio', or 'video')
 * @returns {Promise<string>} The secure URL of the uploaded file
 */
async function uploadFile(file, type) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} True if valid
 */
export function validateFileType(file, allowedTypes) {
  return allowedTypes.some(type => file.type.startsWith(type));
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in megabytes
 * @returns {boolean} True if valid
 */
export function validateFileSize(file, maxSizeMB) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
