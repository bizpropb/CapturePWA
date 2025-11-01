/**
 * useFileSystem Hook
 * React hook for file system operations
 *
 * Features:
 * - Download files with progress
 * - Upload files with validation
 * - Export/import JSON
 * - Track operation status
 * - Error handling
 *
 * @example
 * const { downloadFile, exportJSON, importJSON, loading, error } = useFileSystem();
 *
 * <button onClick={() => exportJSON(data, 'export.json')}>
 *   Export Data
 * </button>
 */

import { useState, useCallback, useEffect } from 'react';
import {
  downloadFile as downloadFileUtil,
  exportJSON as exportJSONUtil,
  importJSON as importJSONUtil,
  downloadImage as downloadImageUtil,
  openFilePicker as openFilePickerUtil,
  getFileSystemCapabilities
} from '@/lib/filesystem-utils';

/**
 * Custom hook for file system operations
 * @param {Object} options - Hook options
 * @returns {Object} File system methods and state
 */
export function useFileSystem(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [capabilities, setCapabilities] = useState(null);

  // Load capabilities on mount
  useEffect(() => {
    setCapabilities(getFileSystemCapabilities());
  }, []);

  // Reset success state after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [success]);

  /**
   * Download file
   * @param {Blob|string} data - File data
   * @param {string} filename - Filename
   * @param {Object} opts - Download options
   */
  const downloadFile = useCallback(async (data, filename, opts = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await downloadFileUtil(data, filename, opts);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to download file');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Export data as JSON
   * @param {Object} data - Data to export
   * @param {string} filename - Filename
   * @param {Object} opts - Export options
   */
  const exportJSON = useCallback(async (data, filename = 'data.json', opts = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await exportJSONUtil(data, filename, opts);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to export JSON');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Import JSON file
   * @param {File} file - File to import
   */
  const importJSON = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await importJSONUtil(file);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to import JSON');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Download image
   * @param {string} url - Image URL
   * @param {string} filename - Filename
   * @param {Object} opts - Download options
   */
  const downloadImage = useCallback(async (url, filename, opts = {}) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await downloadImageUtil(url, filename, opts);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to download image');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Open file picker
   * @param {Object} opts - Picker options
   */
  const openFilePicker = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);

    const result = await openFilePickerUtil(opts);

    if (!result.success) {
      setError(result.error || 'Failed to open file picker');
    }

    setLoading(false);
    return result;
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    // Methods
    downloadFile,
    exportJSON,
    importJSON,
    downloadImage,
    openFilePicker,
    reset,

    // State
    loading,
    error,
    success,
    capabilities
  };
}

/**
 * Hook for exporting moments data
 * Includes helper function to prepare data for export
 */
export function useExportMoments() {
  const { exportJSON, loading, error, success } = useFileSystem();

  const exportMoments = useCallback(async (moments, filename = 'moments-export.json') => {
    const exportData = {
      version: '2.0',
      exported: new Date().toISOString(),
      count: moments.length,
      moments: moments.map(moment => ({
        ...moment,
        exportedAt: new Date().toISOString()
      }))
    };

    return await exportJSON(exportData, filename, {
      preferPicker: true
    });
  }, [exportJSON]);

  return {
    exportMoments,
    loading,
    error,
    success
  };
}

/**
 * Hook for importing moments data
 * Includes validation
 */
export function useImportMoments() {
  const { importJSON, loading, error } = useFileSystem();
  const [importedData, setImportedData] = useState(null);

  const importMoments = useCallback(async (file) => {
    const result = await importJSON(file);

    if (result.success) {
      // Validate imported data structure
      if (!result.data.moments || !Array.isArray(result.data.moments)) {
        return {
          success: false,
          error: 'Invalid data format. Expected moments array.'
        };
      }

      setImportedData(result.data);
      return {
        success: true,
        data: result.data
      };
    }

    return result;
  }, [importJSON]);

  const clearImportedData = useCallback(() => {
    setImportedData(null);
  }, []);

  return {
    importMoments,
    importedData,
    clearImportedData,
    loading,
    error
  };
}

/**
 * Hook for download button with auto-feedback
 */
export function useDownloadButton(data, filename, options = {}) {
  const { downloadFile, loading, success } = useFileSystem();

  const handleClick = useCallback(() => {
    downloadFile(data, filename, options);
  }, [data, filename, options, downloadFile]);

  return {
    onClick: handleClick,
    disabled: loading,
    children: success ? '✓ Downloaded!' : 'Download',
    loading,
    success
  };
}
