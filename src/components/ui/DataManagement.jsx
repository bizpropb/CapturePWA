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
import Button from '@/components/ui/Button';

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

  // Handle import (merge with existing data) - ONE BY ONE
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

      alert(`Import complete (sequential)!\nSuccess: ${successCount}\nFailed: ${errorCount}`);

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

  // Handle import using Prisma Transaction (all-or-nothing)
  // ✨ DEMONSTRATES: Prisma $transaction() - atomic bulk operations
  const handleImportTransaction = async () => {
    if (!importedData) return;

    setImporting(true);
    try {
      // Prepare moments data (remove metadata fields)
      const momentsToImport = importedData.moments.map(moment => {
        const { id, createdAt, updatedAt, exportedAt, tags, category, ...momentData } = moment;
        return momentData;
      });

      // Call bulk import API that uses Prisma transaction
      const response = await fetch('/api/moments/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moments: momentsToImport }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Bulk import successful!\n\n${result.count} moments imported atomically using Prisma transaction.\n\nAll moments imported or none (atomic operation).`);
      } else {
        throw new Error(result.message || 'Bulk import failed');
      }

      // Clear preview
      setImportPreview(null);
      clearImportedData();
    } catch (error) {
      console.error('Bulk import failed:', error);
      alert(`❌ Transaction failed!\n\n${error.message}\n\nNo moments were imported (transaction rolled back).`);
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
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3"> Export Data</h4>
        <p className="text-sm text-gray-400 mb-4">
          Download all your moments as a JSON file. This creates a backup that you can import later.
        </p>

        <Button
          onClick={handleExport}
          disabled={exporting || loadingMoments}
          variant="primary"
        >
          {exporting || loadingMoments
            ? ' Exporting...'
            : exportSuccess
            ? ' Exported!'
            : ' Export All Moments'}
        </Button>

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
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
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
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-normal file:bg-blue-900 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
            />

            {importError && (
              <p className="text-sm text-red-400 mt-2">Error: {importError}</p>
            )}
          </>
        ) : (
          /* Import Preview */
          <div className="space-y-4">
            <div className="bg-black/40 rounded-lg p-4 border border-neutral-700">
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

            <div className="space-y-2">
              {/* Transaction Import (Recommended) */}
              <button
                onClick={handleImportTransaction}
                disabled={importing}
                className="w-full bg-blue-900 text-white py-3 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-blue-600"
              >
                {importing ? '⏳ Importing...' : '✨ Bulk Import (Prisma Transaction)'}
              </button>
              <p className="text-xs text-blue-300 px-2">
                ⚡ Recommended: Atomic operation - all moments import or none (uses Prisma $transaction)
              </p>

              {/* Sequential Import (Legacy) */}
              <button
                onClick={handleImportMerge}
                disabled={importing}
                className="w-full bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? '⏳ Importing...' : '📝 Sequential Import'}
              </button>
              <p className="text-xs text-gray-400 px-2">
                Imports one-by-one (partial imports possible if errors occur)
              </p>

              {/* Cancel */}
              <button
                onClick={handleCancelImport}
                disabled={importing}
                className="w-full bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-neutral-300 mb-2">💡 Tips</h4>
        <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
          <li>Export regularly to back up your moments</li>
          <li>Imported moments will be added to your existing collection</li>
          <li>Media (images, audio) are stored as URLs and remain on Cloudinary</li>
          <li>Export files are JSON format and can be inspected in a text editor</li>
        </ul>
      </div>
    </div>
  );
}
