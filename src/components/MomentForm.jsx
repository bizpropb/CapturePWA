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
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Create a Moment</h2>

      <form onSubmit={handleSubmit}>
        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's on your mind?"
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
                onError={(err) => setError(err)}
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
                onError={(err) => setError(err)}
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
            onError={(err) => setError(err)}
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
