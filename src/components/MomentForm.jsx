'use client';

import { useState } from 'react';
import { uploadImage, uploadAudio, validateFileType, validateFileSize, formatFileSize } from '@/lib/cloudinary';
import { createMoment } from '@/lib/api';
import CameraCapture from './CameraCapture';
import GPSCapture from './GPSCapture';
import AudioRecorder from './AudioRecorder';

export default function MomentForm({ onMomentCreated }) {
  const [description, setDescription] = useState('');
  const [imageData, setImageData] = useState(null); // Blob from camera or file
  const [audioData, setAudioData] = useState(null); // Blob from recorder or file
  const [gpsLat, setGpsLat] = useState(0);
  const [gpsLng, setGpsLng] = useState(0);
  const [useFileUpload, setUseFileUpload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">Create a Moment</h2>

      <form onSubmit={handleSubmit}>
        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind?"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Camera / Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo (optional)
          </label>

          {!imageData && !useFileUpload && (
            <CameraCapture
              onCapture={handleCameraCapture}
              onError={(err) => setError(err)}
            />
          )}

          {!imageData && !useFileUpload && (
            <button
              type="button"
              onClick={() => setUseFileUpload(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Or upload from files
            </button>
          )}

          {(useFileUpload && !imageData) && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setUseFileUpload(false)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Or use camera
              </button>
            </div>
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
                className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Audio Recorder / Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Audio (optional)
          </label>

          {!audioData && (
            <AudioRecorder
              onCapture={handleAudioCapture}
              onError={(err) => setError(err)}
            />
          )}

          {audioData && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-sm text-gray-600 flex-1">Audio recorded</span>
              <button
                type="button"
                onClick={clearAudio}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          )}

          {!audioData && (
            <div className="mt-2">
              <label className="text-sm text-gray-600">Or upload audio file:</label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mt-1"
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* GPS Location */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location (optional)
          </label>
          <GPSCapture
            onCapture={handleGPSCapture}
            onError={(err) => setError(err)}
          />
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
            {uploadProgress}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            Moment created successfully!
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
        >
          {loading ? 'Creating...' : 'Create Moment'}
        </button>
      </form>
    </div>
  );
}
