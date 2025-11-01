/**
 * ClipboardDemo Component
 * Interactive demo of Clipboard API capabilities
 *
 * Features:
 * - Copy text
 * - Copy images
 * - Read clipboard text
 * - Read clipboard images
 * - Display browser capabilities
 * - Permission status
 */

'use client';

import { useState, useEffect } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import { getClipboardCapabilities } from '@/lib/clipboard-utils';

export default function ClipboardDemo() {
  const { copyText, copyImage, readText, readImage, copied, loading, error, capabilities } = useClipboard();
  const [textInput, setTextInput] = useState('Hello from CapturePWA! 👋');
  const [imagePreview, setImagePreview] = useState(null);
  const [readTextResult, setReadTextResult] = useState('');
  const [readImageResult, setReadImageResult] = useState(null);
  const [detailedCaps, setDetailedCaps] = useState(null);

  // Load detailed capabilities
  useEffect(() => {
    getClipboardCapabilities().then(setDetailedCaps);
  }, []);

  const handleCopyText = () => {
    copyText(textInput);
  };

  const handleCopyImage = () => {
    if (!imagePreview) {
      alert('Please select an image first');
      return;
    }
    copyImage(imagePreview);
  };

  const handleReadText = async () => {
    const result = await readText();
    if (result.success) {
      setReadTextResult(result.text);
    }
  };

  const handleReadImage = async () => {
    const result = await readImage();
    if (result.success) {
      setReadImageResult(result.dataUrl);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (supported) => {
    if (supported === true) {
      return <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">✓ Supported</span>;
    } else if (supported === false) {
      return <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">✗ Not Supported</span>;
    } else {
      return <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">? Unknown</span>;
    }
  };

  const getPermissionBadge = (permission) => {
    if (permission === 'granted') {
      return <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">✓ Granted</span>;
    } else if (permission === 'denied') {
      return <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded">✗ Denied</span>;
    } else if (permission === 'prompt') {
      return <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-1 rounded">⚠ Prompt</span>;
    } else {
      return <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">? Unknown</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">📋 Clipboard API Demo</h3>
        <p className="text-sm text-gray-400">
          Test clipboard operations: copy and read text/images
        </p>
      </div>

      {/* Capabilities */}
      {detailedCaps && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-semibold text-white mb-3">Browser Capabilities</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Clipboard API</span>
              {getStatusBadge(detailedCaps.supported)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Write Support</span>
              {getStatusBadge(detailedCaps.writeSupported)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Read Support</span>
              {getStatusBadge(detailedCaps.readSupported)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Image Support</span>
              {getStatusBadge(detailedCaps.supportsImages)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Write Permission</span>
              {getPermissionBadge(detailedCaps.writePermission)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Read Permission</span>
              {getPermissionBadge(detailedCaps.readPermission)}
            </div>
          </div>
        </div>
      )}

      {/* Copy Text */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">📝 Copy Text</h4>
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter text to copy..."
          />
          <button
            onClick={handleCopyText}
            disabled={loading || !textInput}
            className="w-full bg-blue-900 text-white py-2 px-4 rounded hover:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? '✓ Copied!' : 'Copy Text to Clipboard'}
          </button>
        </div>
      </div>

      {/* Copy Image */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">🖼️ Copy Image</h4>
        <div className="space-y-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-white hover:file:bg-blue-800 file:cursor-pointer"
          />
          {imagePreview && (
            <div className="w-full h-32 bg-gray-700 rounded-md overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <button
            onClick={handleCopyImage}
            disabled={loading || !imagePreview || !detailedCaps?.supportsImages}
            className="w-full bg-purple-900 text-white py-2 px-4 rounded hover:bg-purple-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? '✓ Image Copied!' : 'Copy Image to Clipboard'}
          </button>
          {!detailedCaps?.supportsImages && (
            <p className="text-xs text-yellow-400">
              ⚠️ Image clipboard not supported in your browser
            </p>
          )}
        </div>
      </div>

      {/* Read Text */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">📖 Read Clipboard Text</h4>
        <div className="space-y-3">
          <button
            onClick={handleReadText}
            disabled={loading || !detailedCaps?.readSupported}
            className="w-full bg-green-900 text-white py-2 px-4 rounded hover:bg-green-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Read Text from Clipboard
          </button>
          {readTextResult && (
            <div className="p-3 bg-gray-700 rounded-md">
              <p className="text-sm text-gray-300 whitespace-pre-wrap">{readTextResult}</p>
            </div>
          )}
          {!detailedCaps?.readSupported && (
            <p className="text-xs text-yellow-400">
              ⚠️ Clipboard read not supported in your browser
            </p>
          )}
        </div>
      </div>

      {/* Read Image */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-white mb-3">🖼️ Read Clipboard Image</h4>
        <div className="space-y-3">
          <button
            onClick={handleReadImage}
            disabled={loading || !detailedCaps?.readSupported}
            className="w-full bg-indigo-900 text-white py-2 px-4 rounded hover:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Read Image from Clipboard
          </button>
          {readImageResult && (
            <div className="w-full h-48 bg-gray-700 rounded-md overflow-hidden">
              <img
                src={readImageResult}
                alt="From clipboard"
                className="w-full h-full object-contain"
              />
            </div>
          )}
          {!detailedCaps?.readSupported && (
            <p className="text-xs text-yellow-400">
              ⚠️ Clipboard read not supported in your browser
            </p>
          )}
          <p className="text-xs text-gray-400">
            💡 Tip: Copy an image (right-click → Copy Image) from anywhere, then click the button above
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-sm text-red-200">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 Usage Tips</h4>
        <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
          <li>Copy operations work in most modern browsers</li>
          <li>Read operations may require user permission</li>
          <li>Image clipboard support varies by browser</li>
          <li>Some browsers only support clipboard in secure contexts (HTTPS)</li>
          <li>Best support in Chrome, Edge, and modern Safari</li>
        </ul>
      </div>
    </div>
  );
}
