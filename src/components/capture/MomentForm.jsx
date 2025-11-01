'use client';

import { useState, useEffect } from 'react';
import { uploadImage, uploadAudio, validateFileType, validateFileSize, formatFileSize } from '@/lib/cloudinary';
import { createMoment } from '@/lib/api';
import CameraCapture from './CameraCapture';
import GPSCapture from './GPSCapture';
import AudioRecorder from './AudioRecorder';
import { usePasteListener } from '@/hooks/useClipboard';

export default function MomentForm({ onMomentCreated, sharedData }) {
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState(null); // Blob from camera or file
  const [audioData, setAudioData] = useState(null); // Blob from recorder or file
  const [gpsLat, setGpsLat] = useState(0);
  const [gpsLng, setGpsLng] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pasteMessage, setPasteMessage] = useState('');

  // Handle paste events (text or images)
  usePasteListener((pasteData) => {
    if (pasteData.type === 'text') {
      // Append pasted text to description
      setDescription(prev => prev ? `${prev}\n${pasteData.data}` : pasteData.data);
      setPasteMessage('Text pasted!');
      setTimeout(() => setPasteMessage(''), 2000);
    } else if (pasteData.type === 'image' && !imageData) {
      // Set pasted image if no image is already captured
      const file = new File([pasteData.blob], 'pasted-image.png', { type: pasteData.blob.type });
      setImageData(file);
      setPasteMessage('Image pasted!');
      setTimeout(() => setPasteMessage(''), 2000);
    }
  });

  // Handle shared data from Share Target API
  useEffect(() => {
    if (!sharedData) return;

    // Build description from shared data
    let desc = '';
    if (sharedData.title) desc += sharedData.title;
    if (sharedData.text) {
      if (desc) desc += '\n';
      desc += sharedData.text;
    }
    if (sharedData.url) {
      if (desc) desc += '\n';
      desc += sharedData.url;
    }

    if (desc) {
      setDescription(desc);
    }

    // Handle shared media (image or audio)
    if (sharedData.media && sharedData.media.dataUrl) {
      const { dataUrl, type, originalName } = sharedData.media;

      // Convert data URL to Blob
      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          // Add filename to blob for better UX
          const file = new File([blob], originalName, { type });

          if (type.startsWith('image/')) {
            setImageData(file);
          } else if (type.startsWith('audio/')) {
            setAudioData(file);
          }
        })
        .catch(err => {
          console.error('Error processing shared media:', err);
          setError('Failed to load shared media');
        });
    }
  }, [sharedData]);

  const handleCameraCapture = (blob) => {
    setImageData(blob);
    setError('');
  };

  const handleGPSCapture = (lat, lng) => {
    setGpsLat(lat);
    setGpsLng(lng);
  };

  const handleAudioCapture = (blob) => {
    setAudioData(blob);
    setError('');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file, ['image/'])) {
      setError('Please select a valid image file');
      return;
    }

    if (!validateFileSize(file, 10)) {
      setError(`Image too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }

    setImageData(file);
    setError('');
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFileType(file, ['audio/'])) {
      setError('Please select a valid audio file');
      return;
    }

    if (!validateFileSize(file, 10)) {
      setError(`Audio file too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }

    setAudioData(file);
    setError('');
  };

  const clearImage = () => {
    setImageData(null);
  };

  const clearAudio = () => {
    setAudioData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);
    setUploadProgress('');

    try {
      let imageUrl = null;
      let audioUrl = null;

      // Upload image if captured
      if (imageData) {
        setUploadProgress('Uploading image...');
        imageUrl = await uploadImage(imageData);
      }

      // Upload audio if recorded
      if (audioData) {
        setUploadProgress('Uploading audio...');
        audioUrl = await uploadAudio(audioData);
      }

      // Create moment (with offline support)
      setUploadProgress('Creating moment...');
      const newMoment = await createMoment({
        description: description.trim(),
        gpsLat,
        gpsLng,
        imageUrl,
        audioUrl,
      });

      // Clear form
      setDescription('');
      setImageData(null);
      setAudioData(null);
      setGpsLat(0);
      setGpsLng(0);
      setSuccess(true);
      setUploadProgress('');

      // Notify parent component
      if (onMomentCreated) {
        onMomentCreated(newMoment);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Create a Moment</h2>
        {pasteMessage && (
          <div className="text-sm text-green-400 animate-fade-in">
            ✓ {pasteMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Description */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description *
            </label>
            <span className="text-xs text-gray-400">
              💡 Tip: You can paste text or images (Ctrl+V / Cmd+V)
            </span>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind? (You can also paste text here)"
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Camera / Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Photo (optional)
          </label>

          {!imageData && (
            <>
              <CameraCapture
                onCapture={handleCameraCapture}
              />
              <div className="mt-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="image-upload"
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors duration-200 cursor-pointer"
                >
                  Or upload from files
                </label>
              </div>
            </>
          )}

          {imageData && (
            <div className="relative">
              <img
                src={URL.createObjectURL(imageData)}
                alt="Preview"
                className="w-full h-48 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 bg-red-800 text-white px-3 py-1 rounded hover:bg-red-900 transition-colors duration-200"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Audio Recorder / Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Audio (optional)
          </label>

          {!audioData && (
            <>
              <AudioRecorder
                onCapture={handleAudioCapture}
              />
              <div className="mt-2">
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                  disabled={loading}
                />
                <label
                  htmlFor="audio-upload"
                  className="text-sm text-blue-300 hover:text-blue-200 transition-colors duration-200 cursor-pointer"
                >
                  Or upload audio file
                </label>
              </div>
            </>
          )}

          {audioData && (
            <div className="flex items-center gap-2 p-3 bg-gray-700 border border-gray-600 rounded-md">
              <span className="text-sm text-gray-300 flex-1">Audio recorded</span>
              <button
                type="button"
                onClick={clearAudio}
                className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-900 transition-colors duration-200 text-sm"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* GPS Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location (optional)
          </label>
          <GPSCapture
            onCapture={handleGPSCapture}
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mb-4 p-3 bg-blue-900 border border-blue-700 text-blue-200 rounded">
            {uploadProgress}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-900 border border-green-700 text-green-200 rounded">
            Moment created successfully!
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? 'Creating...' : 'Create Moment'}
          </button>
        </div>
      </form>
    </div>
  );
}
