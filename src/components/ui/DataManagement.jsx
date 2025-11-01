/**
 * DataManagement Component
 * Export and import moments data
 *
 * Features:
 * - Export all moments to JSON
 * - Import moments from JSON
 * - Data validation
 * - Preview imported data
 * - Merge or replace options
 */

'use client';

import { useState } from 'react';
import { useExportMoments, useImportMoments } from '@/hooks/useFileSystem';
import { fetchMoments, createMoment } from '@/lib/api';

export default function DataManagement() {
  const [moments, setMoments] = useState([]);
  const [loadingMoments, setLoadingMoments] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);

  const { exportMoments, loading: exporting, error: exportError, success: exportSuccess } = useExportMoments();
  const { importMoments, importedData, clearImportedData, loading: loadingImport, error: importError } = useImportMoments();

  // Load moments for export
  const loadMomentsForExport = async () => {
    setLoadingMoments(true);
    try {
      const data = await fetchMoments();
      setMoments(data);
      return data;
    } catch (error) {
      console.error('Failed to load moments:', error);
      return [];
    } finally {
      setLoadingMoments(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    let momentsToExport = moments;

    // Load moments if not already loaded
    if (moments.length === 0) {
      momentsToExport = await loadMomentsForExport();
    }

    if (momentsToExport.length === 0) {
      alert('No moments to export');
      return;
    }

    const filename = `capturepwa-export-${new Date().toISOString().split('T')[0]}.json`;
    await exportMoments(momentsToExport, filename);
  };

  // Handle file selection for import
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const result = await importMoments(file);

    if (result.success) {
      setImportPreview(result.data);
    }

    // Reset file input
    event.target.value = '';
  };

  // Handle import (merge with existing data)
  const handleImportMerge = async () => {
    if (!importedData) return;

    setImporting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const moment of importedData.moments) {
        try {
          // Remove id and timestamps to create fresh moments
          const { id, createdAt, updatedAt, exportedAt, ...momentData } = moment;

          await createMoment(momentData);
          successCount++;
        } catch (error) {
          console.error('Failed to import moment:', error);
          errorCount++;
        }
      }

      alert(`Import complete!\nSuccess: ${successCount}\nFailed: ${errorCount}`);

      // Clear preview
      setImportPreview(null);
      clearImportedData();
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  // Cancel import
  const handleCancelImport = () => {
    setImportPreview(null);
    clearImportedData();
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">📤 Export Data</h4>
        <p className="text-sm text-gray-400 mb-4">
          Download all your moments as a JSON file. This creates a backup that you can import later.
        </p>

        <button
          onClick={handleExport}
          disabled={exporting || loadingMoments}
          className="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting || loadingMoments
            ? '⏳ Exporting...'
            : exportSuccess
            ? '✓ Exported!'
            : '📤 Export All Moments'}
        </button>

        {exportError && (
          <p className="text-sm text-red-400 mt-2">Error: {exportError}</p>
        )}

        {exportSuccess && (
          <p className="text-sm text-green-400 mt-2">
            ✓ Export successful! Check your downloads folder.
          </p>
        )}
      </div>

      {/* Import Section */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">📥 Import Data</h4>
        <p className="text-sm text-gray-400 mb-4">
          Import moments from a previously exported JSON file. This will add moments to your existing collection.
        </p>

        {!importPreview ? (
          <>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              disabled={loadingImport}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-900 file:text-white hover:file:bg-green-800 file:cursor-pointer disabled:opacity-50"
            />

            {importError && (
              <p className="text-sm text-red-400 mt-2">Error: {importError}</p>
            )}
          </>
        ) : (
          /* Import Preview */
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h5 className="text-sm font-semibold text-white mb-2">Import Preview</h5>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="font-medium">Version:</span> {importPreview.version}</p>
                <p><span className="font-medium">Exported:</span> {new Date(importPreview.exported).toLocaleString()}</p>
                <p><span className="font-medium">Moments:</span> {importPreview.count}</p>
              </div>

              {importPreview.count > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Sample moments:</p>
                  <ul className="text-xs text-gray-400 space-y-1 max-h-40 overflow-y-auto">
                    {importPreview.moments.slice(0, 5).map((moment, index) => (
                      <li key={index} className="truncate">
                        • {moment.description.substring(0, 50)}...
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleImportMerge}
                disabled={importing}
                className="flex-1 bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? '⏳ Importing...' : '✓ Import Moments'}
              </button>
              <button
                onClick={handleCancelImport}
                disabled={importing}
                className="flex-1 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Tips</h4>
        <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
          <li>Export regularly to back up your moments</li>
          <li>Imported moments will be added to your existing collection</li>
          <li>Media (images, audio) are stored as URLs and remain on Cloudinary</li>
          <li>Export files are JSON format and can be inspected in a text editor</li>
        </ul>
      </div>
    </div>
  );
}
