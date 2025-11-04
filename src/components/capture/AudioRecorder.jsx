'use client';

import { useState, useRef, useEffect } from 'react';
import { checkAudioSupport, requestMicrophone, stopMediaStream } from '@/lib/hardware-utils';
import { useAutoWakeLock } from '@/hooks/useWakeLock';
import Button from '@/components/ui/Button';

/**
 * Enhanced Audio Recorder Component
 * Features: Waveform visualization, voice-to-text, playback speed, trimming, background recording
 */
export default function AudioRecorder({ onCapture, onError, onTranscript }) {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  // Visualization states
  const [isVisualizing, setIsVisualizing] = useState(false);

  // Voice-to-text states
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptSupported, setTranscriptSupported] = useState(false);

  // Playback states
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Trimming states
  const [isTrimming, setIsTrimming] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);

  // Background recording states
  const [isBackgroundRecording, setIsBackgroundRecording] = useState(false);

  // Refs
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioElementRef = useRef(null);
  const recognitionRef = useRef(null);

  // Keep screen on during audio playback
  const wakeLock = useAutoWakeLock(isPlaying);

  // Check support after component mounts
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    setIsSupported(checkAudioSupport());

    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setTranscriptSupported(!!SpeechRecognition);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Setup audio visualization
  const setupVisualization = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 2048;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsVisualizing(true);
      visualize();
    } catch (err) {
      console.warn('Visualization not supported:', err);
    }
  };

  // Visualize audio waveform
  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasContext = canvas.getContext('2d');
    const analyser = analyserRef.current;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording && !isVisualizing) return;

      animationFrameRef.current = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      canvasContext.fillStyle = 'rgb(15, 23, 42)'; // bg-slate-900
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);

      canvasContext.lineWidth = 2;
      canvasContext.strokeStyle = 'rgb(34, 211, 238)'; // cyan-400
      canvasContext.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasContext.moveTo(x, y);
        } else {
          canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasContext.lineTo(canvas.width, canvas.height / 2);
      canvasContext.stroke();
    };

    draw();
  };

  // Setup voice-to-text recognition
  const setupRecognition = () => {
    if (!transcriptSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      setTranscript(fullTranscript);

      if (onTranscript && finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsTranscribing(false);
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    recognitionRef.current = recognition;
  };

  // Start recording
  const startRecording = async (enableTranscription = false) => {
    setError('');
    chunksRef.current = [];
    setTranscript('');

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

        // Stop visualization
        setIsVisualizing(false);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }

        // Stop transcription
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Setup visualization
      setupVisualization(stream);

      // Setup voice-to-text if enabled
      if (enableTranscription && transcriptSupported) {
        setupRecognition();
        recognitionRef.current.start();
        setIsTranscribing(true);
      }

    } catch (err) {
      setError(err.message);
      if (onError) onError(err.message);
    }
  };

  // Stop recording
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

  // Delete recording
  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl('');
    setDuration(0);
    setTranscript('');
    setTrimStart(0);
    setTrimEnd(100);
    setPlaybackRate(1.0);
  };

  // Change playback speed
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioElementRef.current) {
      audioElementRef.current.playbackRate = rate;
    }
  };

  // Trim audio
  const trimAudio = async () => {
    if (!audioBlob) return;

    try {
      // Load audio into AudioContext
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate trim points
      const startTime = (trimStart / 100) * audioBuffer.duration;
      const endTime = (trimEnd / 100) * audioBuffer.duration;
      const trimmedLength = Math.ceil((endTime - startTime) * audioBuffer.sampleRate);

      // Create new trimmed buffer
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        trimmedLength,
        audioBuffer.sampleRate
      );

      // Copy trimmed audio data
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const trimmedData = trimmedBuffer.getChannelData(channel);
        const startSample = Math.floor(startTime * audioBuffer.sampleRate);

        for (let i = 0; i < trimmedLength; i++) {
          trimmedData[i] = channelData[startSample + i] || 0;
        }
      }

      // Convert buffer back to blob
      const offlineContext = new OfflineAudioContext(
        trimmedBuffer.numberOfChannels,
        trimmedBuffer.length,
        trimmedBuffer.sampleRate
      );

      const source = offlineContext.createBufferSource();
      source.buffer = trimmedBuffer;
      source.connect(offlineContext.destination);
      source.start();

      const renderedBuffer = await offlineContext.startRendering();

      // Convert to WAV blob
      const wavBlob = await bufferToWave(renderedBuffer, renderedBuffer.length);
      const url = URL.createObjectURL(wavBlob);

      setAudioBlob(wavBlob);
      setAudioUrl(url);
      setIsTrimming(false);
      setTrimStart(0);
      setTrimEnd(100);

      // Update duration
      const newDuration = Math.ceil(renderedBuffer.duration);
      setDuration(newDuration);

      if (onCapture) {
        onCapture(wavBlob);
      }

    } catch (err) {
      setError('Failed to trim audio: ' + err.message);
    }
  };

  // Convert AudioBuffer to WAV Blob
  const bufferToWave = (audioBuffer, len) => {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let sample;
    let offset = 0;
    let pos = 0;

    // Write WAV header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // Write interleaved data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < len) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // convert to 16-bit
        view.setInt16(offset, sample, true); // write 16-bit sample
        offset += 2;
      }
      pos++;
    }

    return new Blob([buffer], { type: 'audio/wav' });

    function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
    }

    function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get trim time display
  const getTrimTime = (percentage) => {
    const seconds = Math.floor((percentage / 100) * duration);
    return formatDuration(seconds);
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-900 border border-yellow-700 rounded-md">
        <p className="text-sm text-white">
          Microphone not supported. Please use the file upload instead.
        </p>
      </div>
    );
  }

  // Trimming view
  if (isTrimming && audioBlob) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-700 border border-gray-600 rounded-md">
          <h3 className="text-sm font-semibold text-white mb-3">Trim Audio</h3>

          {/* Audio preview */}
          <audio ref={audioElementRef} controls src={audioUrl} className="w-full mb-4" />

          {/* Start trim slider */}
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-1 block">
              Start: {getTrimTime(trimStart)}
            </label>
            <input
              type="range"
              min="0"
              max={trimEnd - 1}
              value={trimStart}
              onChange={(e) => setTrimStart(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* End trim slider */}
          <div className="mb-4">
            <label className="text-xs text-gray-300 mb-1 block">
              End: {getTrimTime(trimEnd)}
            </label>
            <input
              type="range"
              min={trimStart + 1}
              max="100"
              value={trimEnd}
              onChange={(e) => setTrimEnd(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Trim info */}
          <p className="text-xs text-gray-400 mb-4">
            New duration: {getTrimTime(trimEnd - trimStart)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={trimAudio}
              className="flex-1 bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-900 text-sm font-medium"
            >
              Apply Trim
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTrimming(false);
                setTrimStart(0);
                setTrimEnd(100);
              }}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playback view
  if (audioBlob) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-700 border border-gray-600 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">
              Recorded Audio ({formatDuration(duration)})
            </span>
            <button
              type="button"
              onClick={deleteRecording}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors duration-200"
            >
              Delete
            </button>
          </div>

          {/* Audio player */}
          <audio
            ref={audioElementRef}
            controls
            src={audioUrl}
            className="w-full mb-3"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Playback speed control */}
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-2 block">Playback Speed</label>
            <div className="flex gap-2">
              {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`flex-1 py-1 px-2 rounded text-xs transition-colors duration-200 ${
                    playbackRate === rate
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Transcript display */}
          {transcript && (
            <div className="mb-3 p-3 bg-gray-800 rounded-md">
              <label className="text-xs text-gray-400 mb-1 block">Transcript</label>
              <p className="text-sm text-white">{transcript}</p>
            </div>
          )}

          {/* Actions */}
          <button
            type="button"
            onClick={() => setIsTrimming(true)}
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 transition-colors duration-200 text-sm"
          >
            ✂️ Trim Audio
          </button>
        </div>
      </div>
    );
  }

  // Recording view
  if (isRecording) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-900 border border-red-700 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="animate-pulse h-3 w-3 bg-red-400 rounded-full mr-2"></span>
              <span className="text-sm font-medium text-red-100">
                Recording... {formatDuration(duration)}
              </span>
            </div>
            {isTranscribing && (
              <span className="text-xs text-red-200">🎤 Transcribing</span>
            )}
          </div>

          {/* Waveform visualization */}
          {isVisualizing && (
            <canvas
              ref={canvasRef}
              width="600"
              height="100"
              className="w-full h-24 mb-3 rounded bg-slate-900"
            />
          )}

          {/* Live transcript */}
          {isTranscribing && transcript && (
            <div className="mb-3 p-3 bg-red-950 rounded-md">
              <p className="text-xs text-red-200">{transcript}</p>
            </div>
          )}

          <button
            type="button"
            onClick={stopRecording}
            className="w-full bg-red-950 text-white py-2 px-4 rounded-md hover:bg-red-900 transition-colors duration-200"
          >
            ⏹ Stop Recording
          </button>
        </div>
      </div>
    );
  }

  // Initial view
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          onClick={() => startRecording(false)}
          variant="primary"
          size="sm"
        >
          🎙️ Start Recording
        </Button>

        {transcriptSupported && (
          <Button
            type="button"
            onClick={() => startRecording(true)}
            variant="primary"
            size="sm"
          >
            🎤 Record with Transcription
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
