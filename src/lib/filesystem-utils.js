/**
 * File System Access API Utilities
 * Provides file download, upload, and File System Access API features
 *
 * Features:
 * - Export/download files (JSON, images)
 * - Import/upload files
 * - File System Access API (save file picker)
 * - Legacy fallback for unsupported browsers
 * - Browser compatibility checks
 *
 * Browser Support:
 * - Chrome 86+ (File System Access API)
 * - Edge 86+
 * - Safari (fallback methods)
 * - Firefox (fallback methods)
 *
 * @module filesystem-utils
 */

/**
 * Check if File System Access API is supported
 * @returns {boolean} True if supported
 */
export function isFileSystemAccessSupported() {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
}

/**
 * Check if File System Access API save is supported
 * @returns {boolean} True if save picker is supported
 */
export function isSaveFilePickerSupported() {
  return 'showSaveFilePicker' in window;
}

/**
 * Check if File System Access API open is supported
 * @returns {boolean} True if open picker is supported
 */
export function isOpenFilePickerSupported() {
  return 'showOpenFilePicker' in window;
}

/**
 * Download a file using legacy method (creates <a> element)
 * Works in all browsers
 * @param {Blob|string} data - Blob or data URL
 * @param {string} filename - Filename to save as
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function downloadFileLegacy(data, filename) {
  try {
    let url;

    if (data instanceof Blob) {
      url = URL.createObjectURL(data);
    } else if (typeof data === 'string') {
      url = data;
    } else {
      return {
        success: false,
        error: 'Invalid data type. Expected Blob or string.'
      };
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      if (data instanceof Blob) {
        URL.revokeObjectURL(url);
      }
    }, 100);

    return { success: true };
  } catch (error) {
    console.error('Legacy download failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Download a file using File System Access API
 * Shows save file picker dialog
 * @param {Blob} blob - File content as blob
 * @param {string} suggestedName - Suggested filename
 * @param {Object} options - File picker options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function downloadFileWithPicker(blob, suggestedName, options = {}) {
  if (!isSaveFilePickerSupported()) {
    return {
      success: false,
      error: 'File System Access API not supported'
    };
  }

  try {
    const opts = {
      suggestedName,
      types: options.types || [],
      ...options
    };

    const handle = await window.showSaveFilePicker(opts);
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();

    return { success: true };
  } catch (error) {
    // User cancelled
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'User cancelled save'
      };
    }

    console.error('File System Access API save failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Download a file (auto-selects best method)
 * Tries File System Access API first, falls back to legacy
 * @param {Blob|string} data - File data
 * @param {string} filename - Filename
 * @param {Object} options - Options for File System Access API
 * @param {boolean} options.preferPicker - Prefer picker over legacy (default: false)
 * @returns {Promise<{success: boolean, method?: string, error?: string}>}
 */
export async function downloadFile(data, filename, options = {}) {
  const { preferPicker = false } = options;

  // Convert data to blob if needed
  let blob = data;
  if (typeof data === 'string' && data.startsWith('data:')) {
    blob = await dataURLToBlob(data);
  } else if (typeof data === 'string') {
    blob = new Blob([data], { type: 'text/plain' });
  }

  // Try File System Access API if preferred and supported
  if (preferPicker && isSaveFilePickerSupported()) {
    const result = await downloadFileWithPicker(blob, filename, options);
    if (result.success) {
      return { ...result, method: 'picker' };
    }
    // Fall through to legacy if picker failed
  }

  // Use legacy method
  const result = await downloadFileLegacy(blob, filename);
  return { ...result, method: 'legacy' };
}

/**
 * Export data as JSON file
 * @param {Object} data - Data to export
 * @param {string} filename - Filename (default: data.json)
 * @param {Object} options - Download options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function exportJSON(data, filename = 'data.json', options = {}) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    const fileOptions = {
      ...options,
      types: [{
        description: 'JSON File',
        accept: { 'application/json': ['.json'] }
      }]
    };

    return await downloadFile(blob, filename, fileOptions);
  } catch (error) {
    console.error('Export JSON failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Import JSON file
 * @param {File} file - File to import
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function importJSON(file) {
  try {
    if (!file) {
      return {
        success: false,
        error: 'No file provided'
      };
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      return {
        success: false,
        error: 'Invalid file type. Expected JSON file.'
      };
    }

    const text = await file.text();
    const data = JSON.parse(text);

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Import JSON failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Open file picker and read files
 * Uses File System Access API if available, otherwise uses <input type="file">
 * @param {Object} options - Picker options
 * @param {boolean} options.multiple - Allow multiple files
 * @param {string[]} options.accept - MIME types to accept
 * @returns {Promise<{success: boolean, files?: File[], error?: string}>}
 */
export async function openFilePicker(options = {}) {
  const { multiple = false, accept = [] } = options;

  // Try File System Access API first
  if (isOpenFilePickerSupported()) {
    try {
      const pickerOpts = {
        multiple,
        types: accept.length > 0 ? [{
          description: 'Files',
          accept: accept.reduce((acc, type) => {
            const ext = type.split('/')[1];
            acc[type] = [`.${ext}`];
            return acc;
          }, {})
        }] : []
      };

      const handles = await window.showOpenFilePicker(pickerOpts);
      const files = await Promise.all(
        handles.map(handle => handle.getFile())
      );

      return {
        success: true,
        files
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'User cancelled file selection'
        };
      }
      console.error('File System Access API open failed:', error);
      // Fall through to legacy method
    }
  }

  // Legacy method using <input type="file">
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    if (accept.length > 0) {
      input.accept = accept.join(',');
    }

    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);

      if (files.length === 0) {
        resolve({
          success: false,
          error: 'No files selected'
        });
      } else {
        resolve({
          success: true,
          files
        });
      }
    };

    input.oncancel = () => {
      resolve({
        success: false,
        error: 'User cancelled file selection'
      });
    };

    input.click();
  });
}

/**
 * Download image from URL
 * @param {string} url - Image URL
 * @param {string} filename - Filename to save as
 * @param {Object} options - Download options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function downloadImage(url, filename, options = {}) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    const fileOptions = {
      ...options,
      types: [{
        description: 'Image',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp']
        }
      }]
    };

    return await downloadFile(blob, filename, fileOptions);
  } catch (error) {
    console.error('Download image failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL
 * @returns {Promise<Blob>}
 */
export async function dataURLToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}

/**
 * Convert Blob to data URL
 * @param {Blob} blob - Blob
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
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<{success: boolean, text?: string, error?: string}>}
 */
export async function readFileAsText(file) {
  try {
    const text = await file.text();
    return {
      success: true,
      text
    };
  } catch (error) {
    console.error('Read file as text failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Read file as data URL
 * @param {File} file - File to read
 * @returns {Promise<{success: boolean, dataUrl?: string, error?: string}>}
 */
export async function readFileAsDataURL(file) {
  try {
    const dataUrl = await blobToDataURL(file);
    return {
      success: true,
      dataUrl
    };
  } catch (error) {
    console.error('Read file as data URL failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get file system capabilities
 * @returns {Object} Capabilities object
 */
export function getFileSystemCapabilities() {
  return {
    fileSystemAccess: isFileSystemAccessSupported(),
    saveFilePicker: isSaveFilePickerSupported(),
    openFilePicker: isOpenFilePickerSupported(),
    legacyDownload: true, // Always supported
    legacyUpload: true // Always supported
  };
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Allowed MIME types or extensions
 * @returns {boolean} True if valid
 */
export function validateFileType(file, allowedTypes) {
  if (!file) return false;

  return allowedTypes.some(type => {
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    return file.type.startsWith(type);
  });
}

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} True if valid
 */
export function validateFileSize(file, maxSizeMB) {
  if (!file) return false;
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
