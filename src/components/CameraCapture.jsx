'use client';

import { useState, useRef, useEffect } from 'react';
import { checkCameraSupport, requestCamera, stopMediaStream } from '@/lib/hardware-utils';

export default function CameraCapture({ onCapture, onError }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [isSupported] = useState(checkCameraSupport());

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stopMediaStream(stream);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setError('');
    try {
      const mediaStream = await requestCamera({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setIsOpen(true);
    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stopMediaStream(stream);
      setStream(null);
    }
    setIsOpen(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);

        if (onCapture) {
          onCapture(blob);
        }

        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          📷 Camera not supported. Please use the file upload instead.
        </p>
      </div>
    );
  }

  if (!isOpen && !capturedImage) {
    return (
      <div>
        <button
          type="button"
          onClick={startCamera}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
        >
          📷 Open Camera
        </button>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div>
        <img src={capturedImage} alt="Captured" className="w-full rounded-md mb-2" />
        <button
          type="button"
          onClick={retake}
          className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
        >
          🔄 Retake Photo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative bg-black rounded-md overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={capturePhoto}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition font-medium"
        >
          📸 Capture
        </button>
        <button
          type="button"
          onClick={stopCamera}
          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
        >
          ✖ Cancel
        </button>
      </div>
    </div>
  );
}
