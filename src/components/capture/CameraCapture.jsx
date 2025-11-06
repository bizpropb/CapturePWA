'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { checkCameraSupport, requestCamera, stopMediaStream } from '@/lib/hardware-utils';
import { useAutoWakeLock } from '@/hooks/useWakeLock';
import jsQR from 'jsqr';
import Button from '@/components/ui/Button';

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

  // Camera control states - SIMPLIFIED
  const [facingMode, setFacingMode] = useState('user'); // 'user' (front) by default - laptops don't have back cameras
  // const [flashEnabled, setFlashEnabled] = useState(false);
  // const [zoomLevel, setZoomLevel] = useState(1);
  // const [capabilities, setCapabilities] = useState(null);

  // Mode states
  const [mode, setMode] = useState('photo'); // Always photo mode
  // const [qrResult, setQrResult] = useState(null);

  // Video recording states - DISABLED
  // const [isRecording, setIsRecording] = useState(false);
  // const [mediaRecorder, setMediaRecorder] = useState(null);
  // const [recordedChunks, setRecordedChunks] = useState([]);
  // const [recordingTime, setRecordingTime] = useState(0);
  // const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  // const [videoBlob, setVideoBlob] = useState(null);
  // const [estimatedSize, setEstimatedSize] = useState(0);

  // Filter & Edit states - DISABLED
  // const [activeFilter, setActiveFilter] = useState('none');
  // const [brightness, setBrightness] = useState(100);
  // const [rotation, setRotation] = useState(0);
  // const [editMode, setEditMode] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // const qrScanIntervalRef = useRef(null);
  // const recordingTimerRef = useRef(null);

  // Keep screen on during video recording - DISABLED
  // const wakeLock = useAutoWakeLock(isRecording);

  // Check camera support after component mounts
  useEffect(() => {
    setIsSupported(checkCameraSupport());
  }, []);

  // Hook stream to video element when it changes
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
      // if (qrScanIntervalRef.current) {
      //   clearInterval(qrScanIntervalRef.current);
      // }
      // if (recordingTimerRef.current) {
      //   clearInterval(recordingTimerRef.current);
      // }
      // if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      //   mediaRecorder.stop();
      // }
    };
  }, [stream]);

  // Get camera capabilities - DISABLED
  // const updateCapabilities = useCallback((mediaStream) => {
  //   try {
  //     const videoTrack = mediaStream.getVideoTracks()[0];
  //     const caps = videoTrack.getCapabilities();
  //     setCapabilities(caps);
  //     // Set initial zoom if supported
  //     if (caps.zoom) {
  //       setZoomLevel(caps.zoom.min || 1);
  //     }
  //   } catch (err) {
  //     console.warn('Could not get camera capabilities:', err);
  //   }
  // }, []);

  // Start camera with current settings - SIMPLIFIED
  const startCamera = async () => {
    setError('');
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
        },
        audio: false
      };

      const mediaStream = await requestCamera(constraints);
      setIsOpen(true); // Set this BEFORE setting stream so video element exists
      setStream(mediaStream); // useEffect will handle attaching to video element
    } catch (err) {
      console.error('Camera error:', err);
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  // Stop camera - SIMPLIFIED
  const stopCamera = () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    // if (qrScanIntervalRef.current) {
    //   clearInterval(qrScanIntervalRef.current);
    // }
    setIsOpen(false);
    // setEditMode(false);
  };

  // Switch camera (front/back) - FIXED to actually toggle
  const switchCamera = async () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }

    // Toggle the facing mode FIRST
    const newFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacingMode);

    // Restart with the NEW facing mode
    try {
      const constraints = {
        video: {
          facingMode: newFacingMode, // Use the NEW mode here!
        },
        audio: false
      };

      const mediaStream = await requestCamera(constraints);
      setStream(mediaStream); // useEffect will handle attaching to video element
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  // ALL OTHER FANCY FEATURES DISABLED
  // const toggleFlash = async () => { ... };
  // const handleZoomChange = async (newZoom) => { ... };
  // const applyFilter = (context, width, height) => { ... };
  // const applyEdits = (context, canvas, width, height, rotate = rotation) => { ... };

  // Capture photo - SIMPLIFIED (no filters/edits)
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');

    // Just draw the video frame - no filters, no edits
    context.drawImage(video, 0, 0);

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

  // ALL VIDEO/QR/ADVANCED FEATURES - DISABLED
  // const startQRScanning = () => { ... };
  // const setupMediaRecorder = (mediaStream) => { ... };
  // const startRecording = () => { ... };
  // const stopRecording = () => { ... };
  // const formatTime = (seconds) => { ... };
  // const formatFileSize = (bytes) => { ... };
  // const generateVideoThumbnail = (videoElement) => { ... };
  // const confirmVideo = async () => { ... };
  // const retakeVideo = () => { ... };

  // REMOVED: Edit mode functions - filters/brightness now applied during capture
  // const editPhoto = (index) => {
  //   setCurrentEditingIndex(index);
  //   setEditMode(true);
  // };

  // const applyPhotoEdits = () => {
  //   if (currentEditingIndex === null) return;
  //   const image = new Image();
  //   image.src = capturedImages[currentEditingIndex].url;
  //   image.onload = () => {
  //     // Apply edits to captured photo
  //   };
  // };

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

  // Retake all - SIMPLIFIED
  const retakeAll = () => {
    setCapturedImages([]);
    // setEditMode(false);
    // setCurrentEditingIndex(null);
    // setBrightness(100);
    // setRotation(0);
    // setActiveFilter('none');
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

  // QR/VIDEO/EDIT VIEWS - ALL DISABLED
  // if (qrResult) { return <QR result view> }
  // if (recordedVideoUrl) { return <Video preview view> }
  // if (editMode && currentEditingIndex !== null) { return <Edit view> }
  // if (editMode && currentEditingIndex !== null) {
  //   return (
  //     <div className="space-y-4">
  //       <div className="relative bg-black rounded-md overflow-hidden">
  //         <canvas ref={canvasRef} className="w-full" />
  //       </div>
  //       {/* Filter selection, brightness control, rotation control, action buttons */}
  //     </div>
  //   );
  // }

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
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="text-white p-2 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={confirmPhotos}
            variant="primary"
          >
            Confirm {capturedImages.length > 1 ? `${capturedImages.length} Photos` : 'Photo'}
          </Button>
          <Button
            type="button"
            onClick={retakeAll}
            variant="secondary"
          >
            Retake
          </Button>
        </div>
      </div>
    );
  }

  // Camera closed view
  if (!isOpen) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          onClick={startCamera}
          variant="primary"
          size="sm"
        >
          📷 Open Camera
        </Button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>
    );
  }

  // Camera active view - SIMPLIFIED (video + switch + capture)
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

        {/* Switch camera button (overlay) */}
        {/* DISABLED
        <div className="absolute top-2 right-2">
          <button
            type="button"
            onClick={switchCamera}
            className="p-2 rounded-md bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
            title="Switch Camera"
          >
            🔄
          </button>
        </div>
        */}
      </div>

      {/* Action buttons - SIMPLIFIED */}
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={capturePhoto}
          variant="primary"
          size="sm"
        >
          📸 Capture
        </Button>
        <Button
          type="button"
          onClick={stopCamera}
          variant="danger"
          size="sm"
        >
          Cancel
        </Button>
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
