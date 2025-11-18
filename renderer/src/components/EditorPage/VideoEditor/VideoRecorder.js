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
  PauseIcon,
  StopIcon,
  ExclamationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { isJoinedVerse } from '@/core/editor/verseJoining';
import * as logger from '../../../logger';

const getNextVerseNumber = (currentVerse, content) => {
  const currentIndex = content.findIndex((v) => v.verseNumber === currentVerse);
  if (currentIndex === -1 || currentIndex >= content.length - 1) { return null; }
  return content[currentIndex + 1].verseNumber;
};

const getPreviousVerseNumber = (currentVerse, content) => {
  const currentIndex = content.findIndex((v) => v.verseNumber === currentVerse);
  if (currentIndex === -1 || currentIndex === 0) { return null; }
  return content[currentIndex - 1].verseNumber;
};
const getCameraErrorMessage = (err) => {
  if (!err) { return 'Unknown error'; }

  switch (err.name) {
  case 'NotAllowedError':
    return 'Camera permission denied. Please allow camera access.';
  case 'NotFoundError':
    return 'No camera found. Please connect a camera.';
  case 'OverconstrainedError':
    return 'Camera constraints not supported. Trying fallback...';
  default:
    return 'Failed to access camera. Please check your camera connection.';
  }
};

const getPreferredCamera = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter((device) => device.kind === 'videoinput');

    if (videoDevices.length === 0) {
      throw new Error('No camera devices found');
    }

    const builtInKeywords = ['integrated', 'built-in', 'webcam', 'facetime'];

    const usbCamera = videoDevices.find((device) => device.label.toLowerCase().includes('usb'));

    if (usbCamera) {
      return usbCamera.deviceId;
    }

    const externalCamera = videoDevices.find((device) => {
      const label = device.label.toLowerCase();
      return !builtInKeywords.some((keyword) => label.includes(keyword));
    });

    if (externalCamera) {
      return externalCamera.deviceId;
    }

    return videoDevices[0].deviceId;
  } catch (err) {
    logger.error('Error enumerating devices:', err);
    return null;
  }
};

const VideoRecorder = ({
  verse,
  chapter,
  bookId,
  projectPath,
  onRecordingComplete,
  onClose,
  onVerseChange,
  content,
  mode = 'record',
  setOpenModal,
  isVisible = true,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [error, setError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const playbackTimerRef = useRef(null);
  const [existingVideo, setExistingVideo] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarType, setSnackbarType] = useState('success');

  const currentVerseData = content?.find((v) => v.verseNumber === verse);
  const hasVideo = currentVerseData?.default && currentVerseData[currentVerseData.default];
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);

  useEffect(() => {
    const fs = window.require('fs');
    const path = window.require('path');
    const filename = `${chapter}_${verse}_1_default.mp4`;
    const filePath = path.join(projectPath, filename);

    const videoExists = fs.existsSync(filePath);
    setExistingVideo(videoExists);

    if (videoExists) {
      setCurrentMode('view');
    } else {
      setCurrentMode('record');
    }
  }, [chapter, verse, projectPath, mode]);

  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      if (currentMode === 'view') {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
        setCameraReady(false);
        return;
      }

      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        tempStream.getTracks().forEach((track) => track.stop());

        const targetCameraId = selectedCamera || (await getPreferredCamera());

        const constraints = {
          video: targetCameraId ? {
            deviceId: { exact: targetCameraId },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          } : {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
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

              const videoTrack = stream.getVideoTracks()[0];
              logger.info('Using camera:', videoTrack.label);
            }
          };
        }
      } catch (err) {
        if (mounted) {
          logger.error('Camera initialization error:', err);
          setError(getCameraErrorMessage(err));

          if (err.name === 'OverconstrainedError') {
            try {
              const fallbackStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: isAudioEnabled,
              });

              if (mounted && videoPreviewRef.current) {
                streamRef.current = fallbackStream;
                videoPreviewRef.current.srcObject = fallbackStream;
                videoPreviewRef.current.onloadedmetadata = () => {
                  if (mounted) {
                    videoPreviewRef.current.play();
                    setCameraReady(true);
                    setError(null);
                  }
                };
              }
            } catch (fallbackErr) {
              logger.error('Fallback camera access failed:', fallbackErr);
            }
          }
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
  }, [isAudioEnabled, currentMode, selectedCamera, verse, chapter]);

  useEffect(() => {
    if (currentMode === 'view' && hasVideo && videoPreviewRef.current) {
      const path = require('path');
      const filename = currentVerseData[currentVerseData.default];

      const timestamp = Date.now();
      const videoPath = `file://${path.join(projectPath, filename)}?t=${timestamp}`;

      logger.info('Loading video for playback:', videoPath);

      setIsPlaying(false);
      setPlaybackTime(0);

      const video = videoPreviewRef.current;

      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();

      setTimeout(() => {
        if (!videoPreviewRef.current) { return; }
        video.src = videoPath;
        video.load();
        video.onloadedmetadata = () => {
          if (!videoPreviewRef.current) { return; }
          let dur = video.duration;

          if (!Number.isFinite(dur) || dur === 0) {
            logger.warn('Duration invalid, forcing recalculation...');
            video.currentTime = 1e101;
            video.ontimeupdate = () => {
              if (!videoPreviewRef.current) { return; }
              video.ontimeupdate = null;
              dur = video.duration;
              if (Number.isFinite(dur)) {
                setVideoDuration(dur);
                logger.info('Duration fixed:', dur);
              } else {
                setVideoDuration(0);
              }
              video.currentTime = 0;
            };
          } else {
            setVideoDuration(dur);
          }
        };

        video.onloadeddata = () => {
          if (!videoPreviewRef.current) { return; }
          logger.info('Video data loaded and ready to play');
        };

        video.onerror = (e) => {
          logger.error('Video load error:', e);
          setError('Failed to load video file');
        };
      }, 50);
    }
  }, [currentMode, hasVideo, verse, projectPath, currentVerseData]);
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoPreviewRef.current) {
      videoPreviewRef.current.pause();
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.removeAttribute('src');
      videoPreviewRef.current.load();
    }

    setCameraReady(false);
  }, [verse, chapter]);

  useEffect(() => {
    if (currentMode === 'view' && videoPreviewRef.current) {
      if (isPlaying) {
        videoPreviewRef.current.play().catch((err) => {
          logger.error('Error playing video:', err);
          setIsPlaying(false);
        });

        playbackTimerRef.current = setInterval(() => {
          if (videoPreviewRef.current) {
            setPlaybackTime(videoPreviewRef.current.currentTime);
          }
        }, 100);
      } else {
        videoPreviewRef.current.pause();

        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
        if (videoPreviewRef.current) {
          setPlaybackTime(videoPreviewRef.current.currentTime);
        }
      }
    }

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, currentMode]);

  const showSnackbarMessage = (message, type = 'success') => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
    setTimeout(() => {
      setShowSnackbar(false);
    }, 3000);
  };

  useEffect(() => {
    async function loadCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(cams);

      if (!selectedCamera) {
        const preferred = await getPreferredCamera();
        setSelectedCamera(preferred);
      }
    }

    loadCameras();
  }, []);

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

      setExistingVideo(true);
      setCurrentMode('view');
      setIsProcessing(false);

      setTimeout(() => {
        if (videoPreviewRef.current) {
          const timestamp = Date.now();
          const videoPath = `file://${filePath}?t=${timestamp}`;
          videoPreviewRef.current.pause();
          videoPreviewRef.current.removeAttribute('src');
          videoPreviewRef.current.load();

          videoPreviewRef.current.srcObject = null;
          videoPreviewRef.current.src = videoPath;
          videoPreviewRef.current.load();

          videoPreviewRef.current.onloadedmetadata = () => {
            const video = videoPreviewRef.current;
            if (!video) { return; }
            let dur = video.duration;

            if (!Number.isFinite(dur) || dur === 0) {
              logger.warn('Duration invalid, forcing recalculation...');
              video.currentTime = 1e101;
              video.ontimeupdate = () => {
                if (!videoPreviewRef.current) { return; }
                video.ontimeupdate = null;
                dur = video.duration;
                if (Number.isFinite(dur)) {
                  setVideoDuration(dur);
                  logger.info('Duration fixed:', dur);
                } else {
                  setVideoDuration(0);
                }
                video.currentTime = 0;
              };
            } else {
              setVideoDuration(dur);
            }
          };
        }
      }, 100);
    } catch (err) {
      logger.error('Error saving video:', err);
      showSnackbarMessage(`Failed to save video: ${err.message}`, 'error');
      setIsProcessing(false);
    }
  }, [chapter, verse, projectPath, onRecordingComplete]);

  const handleDeleteClick = () => {
    const path = window.require('path');
    const filename = `${chapter}_${verse}_1_default.mp4`;
    const filePath = path.join(projectPath, filename);

    onClose();

    setOpenModal({
      openModel: true,
      title: 'Delete Video Recording?',
      confirmMessage: 'Are you sure you want to delete this video recording? This action cannot be undone.',
      buttonName: 'Delete',
      action: 'deleteVideoFromRecorder',
      actionData: {
        verse,
        chapter,
        filePath,
        filename,
        currentMode,
      },
    });
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

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePreviousVerse = () => {
    const prevVerse = getPreviousVerseNumber(verse, content);
    if (prevVerse && onVerseChange) {
      if (videoPreviewRef.current) {
        const video = videoPreviewRef.current;
        video.pause();
        video.srcObject = null;
        video.removeAttribute('src');
        video.load();
      }
      setIsPlaying(false);
      onVerseChange(prevVerse);
    }
  };

  const handleNextVerse = () => {
    const nextVerse = getNextVerseNumber(verse, content);
    if (nextVerse && onVerseChange) {
      if (videoPreviewRef.current) {
        const video = videoPreviewRef.current;
        video.pause();
        video.srcObject = null;
        video.removeAttribute('src');
        video.load();
      }
      setIsPlaying(false);
      onVerseChange(nextVerse);
    }
  };

  const switchToRecordMode = () => {
    if (videoPreviewRef.current) {
      const video = videoPreviewRef.current;
      video.pause();
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }
    setCurrentMode('record');
    setIsPlaying(false);
    setPlaybackTime(0);
    setVideoDuration(0);

    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds <= 0) { return '00:00'; }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasPreviousVerse = () => getPreviousVerseNumber(verse, content) !== null;
  const hasNextVerse = () => getNextVerseNumber(verse, content) !== null;

  return (

    <div
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[50] p-4 ${!isVisible ? 'hidden' : ''
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-secondary text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <VideoCameraIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">
                {currentMode === 'view' ? 'Video Player' : 'Video Recording'}
                {' - '}
                {bookId.toUpperCase()}
                {' '}
                {chapter}
                :
                {verse}
              </h2>
              <p className="text-sm text-gray-200">
                {(() => {
                  if (isRecording) {
                    return `Recording: ${formatTime(recordingTime)}`;
                  }
                  if (currentMode === 'view') {
                    return `${isPlaying ? 'Playing' : 'Paused'}: ${formatTime(playbackTime)} / ${formatTime(videoDuration)}`;
                  }
                  return 'Ready to record';
                })()}
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
          <div className="mb-4 flex gap-3 items-center">
            <label className="text-sm font-medium text-gray-700">Camera:</label>
            <select
              className="border border-gray-300 rounded p-2"
              value={selectedCamera || ''}
              onChange={(e) => {
                setSelectedCamera(e.target.value);
                setCameraReady(false);
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach((t) => t.stop());
                }
              }}
            >
              {videoDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '16/9' }}>
            <video
              ref={videoPreviewRef}
              autoPlay={currentMode === 'record'}
              muted={currentMode === 'record'}
              playsInline
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
              onError={(e) => {
                logger.error('Video playback error:', e);
                setIsPlaying(false);
              }}
            >
              <track kind="captions" src="" label="No captions" />
            </video>

            {currentMode === 'record' && !cameraReady && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {currentMode === 'view' && !hasVideo && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center text-gray-400">
                  <VideoCameraIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">No video available</p>
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
              {currentMode === 'record' && (
                <>
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
                    className={`p-6 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRecording
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
                </>
              )}

              {currentMode === 'view' && (
                <>
                  <button
                    type="button"
                    onClick={switchToRecordMode}
                    disabled={isRecording}
                    className="p-4 rounded-full bg-primary hover:bg-primary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Switch to record mode"
                  >
                    <VideoCameraIcon className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={!hasVideo}
                    className={`p-6 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${hasVideo
                      ? 'bg-success hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400'
                    }`}
                    title={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-8 h-8" />
                    ) : (
                      <PlayIcon className="w-8 h-8" fill="currentColor" />
                    )}
                  </button>

                </>
              )}
              <button
                type="button"
                onClick={handleDeleteClick}
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
                disabled={!hasPreviousVerse() || isRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Previous Verse</span>
              </button>

              <div className={`text-center px-6 py-2 rounded-lg ${isJoinedVerse(verse)
                ? 'bg-amber-50 border border-amber-500'
                : 'bg-gray-100'
              }`}
              >
                <p className="text-sm text-gray-600">Current Verse</p>
                <p className={`text-2xl font-bold ${isJoinedVerse(verse) ? 'text-amber-900' : 'text-gray-900'
                }`}
                >
                  {verse}
                </p>
              </div>

              <button
                type="button"
                onClick={handleNextVerse}
                disabled={!hasNextVerse() || isRecording}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Next Verse</span>
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
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
  onVerseChange: PropTypes.func,
  content: PropTypes.array.isRequired,
  mode: PropTypes.oneOf(['record', 'view']),
  setOpenModal: PropTypes.func.isRequired,
  isVisible: PropTypes.bool,
};

VideoRecorder.defaultProps = {
  onRecordingComplete: null,
  onVerseChange: null,
  mode: 'record',
};

export default VideoRecorder;
