'use client';

import { useState, useRef, useEffect } from 'react';
import { checkAudioSupport, requestMicrophone, stopMediaStream } from '@/lib/hardware-utils';

export default function AudioRecorder({ onCapture, onError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [isSupported] = useState(checkAudioSupport());

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setError('');
    chunksRef.current = [];

    try {
      const stream = await requestMicrophone();
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);

        if (onCapture) {
          onCapture(blob);
        }

        stopMediaStream(streamRef.current);
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setDuration(0);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          🎤 Microphone not supported. Please use the file upload instead.
        </p>
      </div>
    );
  }

  if (audioBlob) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Recorded Audio ({formatDuration(duration)})
          </span>
          <button
            type="button"
            onClick={deleteRecording}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Delete
          </button>
        </div>
        <audio controls src={audioUrl} className="w-full" />
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="animate-pulse h-3 w-3 bg-red-600 rounded-full mr-2"></span>
            <span className="text-sm font-medium text-red-900">
              Recording... {formatDuration(duration)}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={stopRecording}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
        >
          ⏹ Stop Recording
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={startRecording}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
      >
        🎤 Start Recording
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
