'use client';

import { useState } from 'react';
import { uploadImage, uploadAudio, validateFileType, validateFileSize, formatFileSize } from '@/lib/cloudinary';

export default function MomentForm({ onMomentCreated }) {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file, ['image/'])) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (10MB)
    if (!validateFileSize(file, 10)) {
      setError(`Image too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!validateFileType(file, ['audio/'])) {
      setError('Please select a valid audio file');
      return;
    }

    // Validate file size (10MB)
    if (!validateFileSize(file, 10)) {
      setError(`Audio file too large (${formatFileSize(file.size)}). Maximum size is 10MB.`);
      return;
    }

    setAudioFile(file);
    setError('');
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const clearAudio = () => {
    setAudioFile(null);
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

      // Upload image if selected
      if (imageFile) {
        setUploadProgress('Uploading image...');
        imageUrl = await uploadImage(imageFile);
      }

      // Upload audio if selected
      if (audioFile) {
        setUploadProgress('Uploading audio...');
        audioUrl = await uploadAudio(audioFile);
      }

      // Create moment
      setUploadProgress('Creating moment...');
      const response = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim(),
          imageUrl,
          audioUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create moment');
      }

      const newMoment = await response.json();

      // Clear form
      setDescription('');
      setImageFile(null);
      setAudioFile(null);
      setImagePreview('');
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
        <div className="mb-4">
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

        {/* Image Upload */}
        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Image (optional)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
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
          ) : (
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          )}
        </div>

        {/* Audio Upload */}
        <div className="mb-4">
          <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
            Audio (optional)
          </label>
          {audioFile ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{audioFile.name}</span>
              <button
                type="button"
                onClick={clearAudio}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              id="audio"
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          )}
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Creating...' : 'Create Moment'}
        </button>
      </form>
    </div>
  );
}
