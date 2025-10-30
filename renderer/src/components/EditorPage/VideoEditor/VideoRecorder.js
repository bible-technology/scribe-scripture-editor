import React, {
  useState, useRef, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import {
  MicrophoneIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoCameraIcon,
  PlayIcon,
  StopIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import * as logger from '../../../logger';

const VideoRecorder = ({
  verse,
  chapter,
  bookId,
  projectPath,
  onRecordingComplete,
  onClose,
  totalVerses,
  onVerseChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [existingVideo, setExistingVideo] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState('success');

  useEffect(() => {
    const fs = window.require('fs');
    const path = window.require('path');
    const filename = `${chapter}_${verse}_1_default.mp4`;
    const filePath = path.join(projectPath, filename);

    setExistingVideo(fs.existsSync(filePath));
  }, [chapter, verse, projectPath]);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        const constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
            facingMode: 'user',
          },
          audio: isAudioEnabled,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.onloadedmetadata = () => {
            if (mounted) {
              videoPreviewRef.current.play();
              setCameraReady(true);
            }
          };
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access.'
              : 'Failed to access camera. Please check your camera connection.',
          );
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAudioEnabled]);

  const showSnackbarMessage = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
  };

  const saveVideo = useCallback(async (blob) => {
    setIsProcessing(true);

    try {
      const fs = window.require('fs');
      const path = window.require('path');

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = `${chapter}_${verse}_1_default.mp4`;
      const filePath = path.join(projectPath, filename);

      fs.writeFileSync(filePath, buffer);

      showSnackbarMessage(`Video saved successfully: ${filename}`, 'success');

      if (onRecordingComplete) {
        onRecordingComplete({
          verse,
          chapter,
          filePath,
          filename,
        });
      }

      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
    }
  }, [chapter, verse, projectPath, onRecordingComplete]);

  const handleDeleteExistingVideo = () => {
    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const filename = `${chapter}_${verse}_1_default.mp4`;
      const filePath = path.join(projectPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        setExistingVideo(false);

        if (onRecordingComplete) {
          onRecordingComplete({
            verse,
            chapter,
            filePath: null,
            filename: null,
            deleted: true,
          });
        }

        showSnackbarMessage('Video deleted successfully.', 'success');
        logger.info('Video deleted:', filePath);
      } else {
        showSnackbarMessage('Video file not found.', 'error');
      }
    } catch (err) {
      logger.error('Error deleting existing video:', err);
      showSnackbarMessage(`Failed to delete video: ${err.message}`, 'error');
    }
  };

  const startNewRecording = useCallback(() => {
    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const filename = `${chapter}_${verse}_1_default.mp4`;
      const filePath = path.join(projectPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      const options = {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8';
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveVideo(blob);
      };

      mediaRecorder.onerror = () => {
        setError('Recording failed. Please try again.');
        setIsRecording(false);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to start recording. Please try again.');
    }
  }, [chapter, verse, projectPath, saveVideo]);

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

  const startRecording = async () => {
    if (!streamRef.current) {
      setError('Camera not ready');
      return;
    }

    try {
      if (existingVideo) {
        const fs = window.require('fs');
        const path = window.require('path');
        const filename = `${chapter}_${verse}_1_default.mp4`;
        const filePath = path.join(projectPath, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Deleted existing video for re-recording');
        }
      }

      startNewRecording();
    } catch (err) {
      setError('Failed to access file system.');
    }
  };

  const toggleAudio = async () => {
    if (isRecording) {
      setError('Cannot change audio settings while recording');
      return;
    }

    setIsAudioEnabled(!isAudioEnabled);
    setCameraReady(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handlePreviousVerse = () => {
    if (verse > 1 && onVerseChange) {
      onVerseChange(parseInt(verse, 10) - 1);
    }
  };

  const handleNextVerse = () => {
    if (verse < totalVerses && onVerseChange) {
      onVerseChange(parseInt(verse, 10) + 1);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[50] p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-secondary text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <VideoCameraIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">
                Video Recording -
                {' '}
                {bookId.toUpperCase()}
                {' '}
                {chapter}
                :
                {verse}
              </h2>
              <p className="text-sm text-gray-200">
                {isRecording ? `Recording: ${formatTime(recordingTime)}` : 'Ready to record'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            disabled={isRecording}
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />

            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full" />
                <span className="text-sm font-medium">REC</span>
              </div>
            )}

            {!cameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p>Saving video...</p>
                </div>
              </div>
            )}
          </div>

          {showSnackbar && (
            <div
              className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeInOut
                ${(() => {
              switch (snackbarType) {
              case 'error':
                return 'bg-error';
              case 'warning':
                return 'bg-primary';
              default:
                return 'bg-success';
              }
            })()} text-white`}
            >
              {' '}
              {snackbarMessage}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={toggleAudio}
                disabled={!cameraReady || isProcessing}
                className={`p-4 rounded-full transition-colors ${isAudioEnabled
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isAudioEnabled ? 'Disable audio' : 'Enable audio'}
              >
                {isAudioEnabled ? <MicrophoneIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6 " />}
              </button>

              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!cameraReady || isProcessing || existingVideo}
                className={`p-6 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-primary hover:bg-primary-dark text-white'
                }`}
                title={(() => {
                  if (isRecording) { return 'Stop recording'; }
                  if (existingVideo) { return 'Recording exists - delete it first'; }
                  return 'Start recording';
                })()}

              >
                {isRecording ? (
                  <StopIcon className="w-8 h-8" fill="currentColor" />
                ) : (
                  <PlayIcon className="w-8 h-8" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={handleDeleteExistingVideo}
                disabled={!existingVideo || isRecording || isProcessing}
                className={`p-4 rounded-full transition-all ${existingVideo
                  ? 'bg-error text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={existingVideo ? 'Delete recorded video' : 'No video to delete'}
              >
                <TrashIcon className="w-6 h-6" />
              </button>

            </div>

            <div className="flex items-center justify-center gap-6 pt-4 border-t">
              <button
                type="button"
                onClick={handlePreviousVerse}
                disabled={verse <= 1 || isRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Previous Verse</span>
              </button>

              <div className="text-center px-6 py-2 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">Current Verse</p>
                <p className="text-2xl font-bold text-gray-900">{verse}</p>
              </div>

              <button
                type="button"
                onClick={handleNextVerse}
                disabled={verse >= totalVerses || isRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next Verse</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* <div className="bg-gray-50 px-6 py-4 border-t text-sm text-gray-600">
          <p>
            <strong>Instructions:</strong> Click the play button to start recording. Click the stop button when finished.
            Navigate between verses using the Previous/Next buttons.
          </p>
        </div> */}
      </div>
    </div>
  );
};

VideoRecorder.propTypes = {
  verse: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  chapter: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  bookId: PropTypes.string.isRequired,
  projectPath: PropTypes.string.isRequired,
  onRecordingComplete: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  totalVerses: PropTypes.number.isRequired,
  onVerseChange: PropTypes.func,
};

VideoRecorder.defaultProps = {
  onRecordingComplete: null,
  onVerseChange: null,
};

export default VideoRecorder;
