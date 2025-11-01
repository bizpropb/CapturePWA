'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { checkCameraSupport, requestCamera, stopMediaStream } from '@/lib/hardware-utils';
import { useAutoWakeLock } from '@/hooks/useWakeLock';
import jsQR from 'jsqr';

/**
 * Enhanced Camera Capture Component
 * Features: Mode switching, flash, zoom, filters, editing, multiple photos, QR scanning
 */
export default function CameraCapture({ onCapture, onError, allowMultiple = false }) {
  // Core states
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [currentEditingIndex, setCurrentEditingIndex] = useState(null);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  // Camera control states
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front) or 'environment' (back)
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capabilities, setCapabilities] = useState(null);

  // Mode states
  const [mode, setMode] = useState('photo'); // 'photo', 'video', or 'qr'
  const [qrResult, setQrResult] = useState(null);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const [estimatedSize, setEstimatedSize] = useState(0);

  // Filter & Edit states
  const [activeFilter, setActiveFilter] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const qrScanIntervalRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Keep screen on during video recording
  const wakeLock = useAutoWakeLock(isRecording);

  // Check camera support after component mounts
  useEffect(() => {
    setIsSupported(checkCameraSupport());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
      if (qrScanIntervalRef.current) {
        clearInterval(qrScanIntervalRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [stream, mediaRecorder]);

  // Get camera capabilities
  const updateCapabilities = useCallback((mediaStream) => {
    try {
      const videoTrack = mediaStream.getVideoTracks()[0];
      const caps = videoTrack.getCapabilities();
      setCapabilities(caps);

      // Set initial zoom if supported
      if (caps.zoom) {
        setZoomLevel(caps.zoom.min || 1);
      }
    } catch (err) {
      console.warn('Could not get camera capabilities:', err);
    }
  }, []);

  // Start camera with current settings
  const startCamera = async () => {
    setError('');
    setQrResult(null);
    setRecordedVideoUrl(null);
    setVideoBlob(null);
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          zoom: capabilities?.zoom ? zoomLevel : undefined,
        },
        // Add audio for video mode
        audio: mode === 'video'
      };

      const mediaStream = await requestCamera(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      updateCapabilities(mediaStream);
      setIsOpen(true);

      // Start QR scanning if in QR mode
      if (mode === 'qr') {
        startQRScanning();
      }

      // Setup MediaRecorder for video mode
      if (mode === 'video') {
        setupMediaRecorder(mediaStream);
      }
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    if (qrScanIntervalRef.current) {
      clearInterval(qrScanIntervalRef.current);
    }
    setIsOpen(false);
    setEditMode(false);
  };

  // Switch camera (front/back)
  const switchCamera = async () => {
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }

    // Restart with new facing mode
    setTimeout(() => startCamera(), 100);
  };

  // Toggle flash
  const toggleFlash = async () => {
    if (!stream) return;

    try {
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      if (capabilities.torch) {
        await videoTrack.applyConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      } else {
        setError('Flash not supported on this device');
      }
    } catch (err) {
      setError('Could not toggle flash: ' + err.message);
    }
  };

  // Update zoom level
  const handleZoomChange = async (newZoom) => {
    if (!stream || !capabilities?.zoom) return;

    try {
      const videoTrack = stream.getVideoTracks()[0];
      await videoTrack.applyConstraints({
        advanced: [{ zoom: newZoom }]
      });
      setZoomLevel(newZoom);
    } catch (err) {
      console.warn('Could not set zoom:', err);
    }
  };

  // Apply filter to canvas context
  const applyFilter = (context, width, height) => {
    if (activeFilter === 'none') return;

    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (activeFilter === 'grayscale') {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = data[i + 1] = data[i + 2] = gray;
      } else if (activeFilter === 'sepia') {
        data[i] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
        data[i + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
        data[i + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
      } else if (activeFilter === 'vibrant') {
        data[i] = Math.min(255, r * 1.3);
        data[i + 1] = Math.min(255, g * 1.3);
        data[i + 2] = Math.min(255, b * 1.3);
      }
    }

    context.putImageData(imageData, 0, 0);
  };

  // Apply brightness and rotation
  const applyEdits = (context, canvas, width, height, rotate = rotation) => {
    // Apply rotation
    if (rotate !== 0) {
      const radians = (rotate * Math.PI) / 180;
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(radians);
      context.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply brightness
    if (brightness !== 100) {
      context.filter = `brightness(${brightness}%)`;
    }
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    // Apply edits first
    applyEdits(context, canvas, canvas.width, canvas.height);

    // Draw video frame
    context.drawImage(video, 0, 0);

    // Apply filter
    applyFilter(context, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);

        if (allowMultiple) {
          const newImages = [...capturedImages, { url: imageUrl, blob }];
          setCapturedImages(newImages);
        } else {
          setCapturedImages([{ url: imageUrl, blob }]);
          stopCamera();
        }
      }
    }, 'image/jpeg', 0.9);
  };

  // QR Code scanning
  const startQRScanning = () => {
    if (qrScanIntervalRef.current) {
      clearInterval(qrScanIntervalRef.current);
    }

    qrScanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setQrResult(code.data);
          clearInterval(qrScanIntervalRef.current);
          stopCamera();
        }
      }
    }, 100);
  };

  // Video Recording Functions
  const setupMediaRecorder = (mediaStream) => {
    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };

      // Fallback to vp8 if vp9 not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      // Fallback to default if webm not supported
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(mediaStream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
          // Estimate file size (approximate)
          setEstimatedSize(prev => prev + event.data.size);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideoUrl(videoUrl);
        setVideoBlob(blob);
        setRecordedChunks([]);
        setEstimatedSize(0);
        stopCamera();
      };

      setMediaRecorder(recorder);
      setRecordedChunks([]);
      setEstimatedSize(0);
    } catch (err) {
      setError('MediaRecorder not supported: ' + err.message);
    }
  };

  const startRecording = () => {
    if (!mediaRecorder) return;

    try {
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;

          // Stop recording at 5 minutes (300 seconds) or 100MB
          if (newTime >= 300 || estimatedSize >= 100 * 1024 * 1024) {
            stopRecording();
          }

          return newTime;
        });
      }, 1000);
    } catch (err) {
      setError('Could not start recording: ' + err.message);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') return;

    try {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    } catch (err) {
      setError('Could not stop recording: ' + err.message);
    }
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Generate video thumbnail
  const generateVideoThumbnail = (videoElement) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const context = canvas.getContext('2d');
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.7);
    });
  };

  // Confirm video
  const confirmVideo = async () => {
    if (!videoBlob) return;

    // Generate thumbnail
    const videoElement = document.querySelector('video.preview-video');
    let thumbnailBlob = null;

    if (videoElement) {
      thumbnailBlob = await generateVideoThumbnail(videoElement);
    }

    if (onCapture) {
      onCapture({ video: videoBlob, thumbnail: thumbnailBlob });
    }

    setRecordedVideoUrl(null);
    setVideoBlob(null);
    setRecordingTime(0);
  };

  // Retake video
  const retakeVideo = () => {
    setRecordedVideoUrl(null);
    setVideoBlob(null);
    setRecordingTime(0);
    startCamera();
  };

  // Edit captured photo
  const editPhoto = (index) => {
    setCurrentEditingIndex(index);
    setEditMode(true);
  };

  // Apply edits to captured photo
  const applyPhotoEdits = () => {
    if (currentEditingIndex === null) return;

    const image = new Image();
    image.src = capturedImages[currentEditingIndex].url;

    image.onload = () => {
      const canvas = canvasRef.current;
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Apply edits
      applyEdits(context, canvas, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      applyFilter(context, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          const newImages = [...capturedImages];
          newImages[currentEditingIndex] = { url: imageUrl, blob };
          setCapturedImages(newImages);
          setEditMode(false);
          setCurrentEditingIndex(null);

          // Reset edits
          setBrightness(100);
          setRotation(0);
          setActiveFilter('none');
        }
      }, 'image/jpeg', 0.9);
    };
  };

  // Remove photo
  const removePhoto = (index) => {
    const newImages = capturedImages.filter((_, i) => i !== index);
    setCapturedImages(newImages);
  };

  // Confirm all photos
  const confirmPhotos = () => {
    if (capturedImages.length > 0) {
      if (allowMultiple) {
        if (onCapture) onCapture(capturedImages.map(img => img.blob));
      } else {
        if (onCapture) onCapture(capturedImages[0].blob);
      }
      setCapturedImages([]);
    }
  };

  // Retake all
  const retakeAll = () => {
    setCapturedImages([]);
    setEditMode(false);
    setCurrentEditingIndex(null);
    setBrightness(100);
    setRotation(0);
    setActiveFilter('none');
    startCamera();
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-900 border border-yellow-700 rounded-md">
        <p className="text-sm text-white">
          Camera not supported. Please use the file upload instead.
        </p>
      </div>
    );
  }

  // QR result view
  if (qrResult) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-900 border border-green-700 rounded-md">
          <h3 className="font-semibold text-white mb-2">QR Code Detected:</h3>
          <p className="text-sm text-white break-all">{qrResult}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setQrResult(null);
            startCamera();
          }}
          className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors duration-200"
        >
          Scan Another
        </button>
      </div>
    );
  }

  // Video preview view
  if (recordedVideoUrl) {
    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-md overflow-hidden">
          <video
            src={recordedVideoUrl}
            controls
            className="w-full preview-video"
          />
        </div>

        <div className="flex gap-2 text-sm text-white">
          <div className="flex-1 bg-gray-700 p-2 rounded-md text-center">
            <div className="font-semibold">Duration</div>
            <div>{formatTime(recordingTime)}</div>
          </div>
          <div className="flex-1 bg-gray-700 p-2 rounded-md text-center">
            <div className="font-semibold">Size</div>
            <div>{formatFileSize(videoBlob?.size || 0)}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirmVideo}
            className="flex-1 bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-900 font-medium"
          >
            Confirm Video
          </button>
          <button
            type="button"
            onClick={retakeVideo}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  // Edit mode view
  if (editMode && currentEditingIndex !== null) {
    return (
      <div className="space-y-4">
        <div className="relative bg-black rounded-md overflow-hidden">
          <canvas ref={canvasRef} className="w-full" />
        </div>

        {/* Filter selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Filter</label>
          <div className="flex gap-2">
            {['none', 'grayscale', 'sepia', 'vibrant'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`flex-1 py-2 px-3 rounded-md text-sm capitalize transition-colors duration-200 ${
                  activeFilter === filter
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Brightness control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Brightness: {brightness}%
          </label>
          <input
            type="range"
            min="50"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Rotation control */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Rotation: {rotation}°
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRotation((rotation - 90) % 360)}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              ← 90°
            </button>
            <button
              type="button"
              onClick={() => setRotation(0)}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setRotation((rotation + 90) % 360)}
              className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              90° →
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={applyPhotoEdits}
            className="flex-1 bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-900 font-medium"
          >
            Apply Edits
          </button>
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setCurrentEditingIndex(null);
              setBrightness(100);
              setRotation(0);
              setActiveFilter('none');
            }}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Captured images view
  if (capturedImages.length > 0 && !isOpen) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {capturedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.url}
                alt={`Captured ${index + 1}`}
                className="w-full rounded-md"
              />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => editPhoto(index)}
                  className="bg-blue-900 text-white p-2 rounded-md hover:bg-blue-800 text-xs"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="bg-red-950 text-white p-2 rounded-md hover:bg-red-900 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={confirmPhotos}
            className="flex-1 bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-900 font-medium"
          >
            Confirm {capturedImages.length > 1 ? `${capturedImages.length} Photos` : 'Photo'}
          </button>
          <button
            type="button"
            onClick={retakeAll}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Retake
          </button>
        </div>
      </div>
    );
  }

  // Camera closed view
  if (!isOpen) {
    return (
      <div className="space-y-4">
        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMode('photo')}
            className={`py-2 px-4 rounded-md transition-colors duration-200 ${
              mode === 'photo'
                ? 'bg-blue-900 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📷 Photo
          </button>
          <button
            type="button"
            onClick={() => setMode('video')}
            className={`py-2 px-4 rounded-md transition-colors duration-200 ${
              mode === 'video'
                ? 'bg-blue-900 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🎥 Video
          </button>
          <button
            type="button"
            onClick={() => setMode('qr')}
            className={`py-2 px-4 rounded-md transition-colors duration-200 ${
              mode === 'qr'
                ? 'bg-blue-900 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            📱 QR
          </button>
        </div>

        <button
          type="button"
          onClick={startCamera}
          className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors duration-200"
        >
          {mode === 'photo' && 'Open Camera'}
          {mode === 'video' && 'Start Video Camera'}
          {mode === 'qr' && 'Start QR Scanner'}
        </button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // Camera active view
  return (
    <div className="space-y-4">
      {/* Video preview */}
      <div className="relative bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera controls overlay */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          {/* Left controls */}
          <div className="flex gap-2">
            {capabilities?.torch && (
              <button
                type="button"
                onClick={toggleFlash}
                className={`p-2 rounded-md backdrop-blur-sm transition-colors duration-200 ${
                  flashEnabled
                    ? 'bg-yellow-500/80 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                }`}
                title="Toggle Flash"
              >
                {flashEnabled ? '⚡' : '🔦'}
              </button>
            )}
          </div>

          {/* Right controls */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={switchCamera}
              className="p-2 rounded-md bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
              title="Switch Camera"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Mode indicator */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
            {mode === 'qr' && '📱 Scanning QR Code...'}
            {mode === 'photo' && '📷 Photo Mode'}
            {mode === 'video' && !isRecording && '🎥 Video Mode'}
            {mode === 'video' && isRecording && (
              <span className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                REC {formatTime(recordingTime)}
              </span>
            )}
          </div>
        </div>

        {/* File size indicator (video recording) */}
        {mode === 'video' && isRecording && (
          <div className="absolute bottom-2 left-2">
            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              {formatFileSize(estimatedSize)}
            </div>
          </div>
        )}
      </div>

      {/* Zoom control (photo mode only) */}
      {mode === 'photo' && capabilities?.zoom && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Zoom: {zoomLevel.toFixed(1)}x
          </label>
          <input
            type="range"
            min={capabilities.zoom.min}
            max={capabilities.zoom.max}
            step={capabilities.zoom.step || 0.1}
            value={zoomLevel}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* Filter selection (photo mode only) */}
      {mode === 'photo' && (
        <div className="flex gap-2">
          {['none', 'grayscale', 'sepia', 'vibrant'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2 px-3 rounded-md text-sm capitalize transition-colors duration-200 ${
                activeFilter === filter
                  ? 'bg-blue-900 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {mode === 'photo' && (
          <button
            type="button"
            onClick={capturePhoto}
            className="flex-1 bg-green-800 text-white py-3 px-4 rounded-md hover:bg-green-900 transition-colors duration-200 font-medium"
          >
            📸 Capture
          </button>
        )}
        {mode === 'video' && !isRecording && (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 bg-red-800 text-white py-3 px-4 rounded-md hover:bg-red-900 transition-colors duration-200 font-medium"
          >
            ⏺ Start Recording
          </button>
        )}
        {mode === 'video' && isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex-1 bg-yellow-700 text-white py-3 px-4 rounded-md hover:bg-yellow-800 transition-colors duration-200 font-medium animate-pulse"
          >
            ⏹ Stop Recording
          </button>
        )}
        <button
          type="button"
          onClick={stopCamera}
          className="flex-1 bg-red-950 text-white py-3 px-4 rounded-md hover:bg-red-900 transition-colors duration-200"
          disabled={isRecording}
        >
          Cancel
        </button>
      </div>

      {/* Captured count (multiple mode) */}
      {allowMultiple && capturedImages.length > 0 && (
        <div className="text-center text-sm text-white">
          {capturedImages.length} photo{capturedImages.length > 1 ? 's' : ''} captured
        </div>
      )}
    </div>
  );
}
