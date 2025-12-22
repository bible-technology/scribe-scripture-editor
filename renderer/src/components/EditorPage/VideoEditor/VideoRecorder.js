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
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
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
  setNotify,
  setSnackText,
  setOpenSnackBar,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
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
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const cameraMenuRef = useRef(null);

  const fs = window.require('fs');
  const path = window.require('path');

  const filename = `${chapter}_${verse}.mp4`;
  const filePath = path.join(projectPath, filename);

  const hasVideo = fs.existsSync(filePath);

  useEffect(() => {
    const fs = window.require('fs');
    const path = window.require('path');
    const filename = `${chapter}_${verse}.mp4`;
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
    const handleClickOutside = (event) => {
      if (cameraMenuRef.current && !cameraMenuRef.current.contains(event.target)) {
        setShowCameraMenu(false);
      }
    };

    if (showCameraMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCameraMenu]);

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

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === 'videoinput');
        if (mounted) {
          setVideoDevices(cams);
        }

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
              logger.debug('Using camera:', videoTrack.label);
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
      const fs = window.require('fs');

      const filename = `${chapter}_${verse}.mp4`;
      const fullPath = path.join(projectPath, filename);

      try {
        if (!fs.existsSync(fullPath)) {
          logger.error('Video file does not exist:', fullPath);
          setError(`Video file not found: ${filename}`);
          return;
        }

        const stats = fs.statSync(fullPath);
        logger.debug('Video file size:', stats.size);

        if (stats.size === 0) {
          setError('Video file is empty');
          return;
        }
      } catch (err) {
        logger.error('Error checking video file:', err);
        setError(`Cannot access video: ${err.message}`);
        return;
      }

      const buffer = fs.readFileSync(fullPath);
      const blob = new Blob([buffer], { type: 'video/mp4' });
      const videoPath = URL.createObjectURL(blob);

      logger.debug('Loading video from Blob URL:', videoPath);

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
          logger.debug('Video data loaded and ready to play');
        };

        video.onerror = (e) => {
          logger.error('Video load error:', e);
          setError('Failed to load video file');
        };
      }, 50);
    }
  }, [currentMode, hasVideo, verse, projectPath]);
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

  const saveVideo = useCallback(async (blob) => {
    setIsProcessing(true);

    try {
      const fs = window.require('fs');
      const path = window.require('path');

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = `${chapter}_${verse}.mp4`;
      const filePath = path.join(projectPath, filename);

      fs.writeFileSync(filePath, buffer);
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

      setNotify('success');
      setSnackText('Video saved successfully');
      setOpenSnackBar(true);

      setTimeout(() => {
        if (videoPreviewRef.current) {
          const buffer = fs.readFileSync(filePath);
          const blob = new Blob([buffer], { type: 'video/mp4' });
          const objectUrl = URL.createObjectURL(blob);

          videoPreviewRef.current.pause();
          videoPreviewRef.current.srcObject = null;
          videoPreviewRef.current.removeAttribute('src');
          videoPreviewRef.current.load();

          videoPreviewRef.current.src = objectUrl;
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
                  logger.debug('Duration fixed:', dur);
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
      setNotify('failure');
      setSnackText(`Failed to save video: ${err.message}`);
      setOpenSnackBar(true);
      setIsProcessing(false);
    }
  }, [chapter, verse, projectPath, onRecordingComplete]);

  const handleDeleteClick = () => {
    const path = window.require('path');
    const filename = `${chapter}_${verse}.mp4`;
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
      const filename = `${chapter}_${verse}.mp4`;
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
        setIsPaused(false);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Failed to start recording. Please try again.');
    }
  }, [chapter, verse, projectPath, saveVideo]);

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      logger.debug('Recording paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      logger.debug('Recording resumed');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);

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
        const filename = `${chapter}_${verse}.mp4`;
        const filePath = path.join(projectPath, filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.debug('Deleted existing video for re-recording');
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
        <div className="bg-secondary text-white px-6 py-6 flex items-center justify-between">
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
                    return `${isPaused ? 'Paused' : 'Recording'}: ${formatTime(recordingTime)}`;
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

        <div className="flex-1 overflow-auto p-2">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-2" style={{ aspectRatio: '16/9' }}>
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
            {isPaused && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg">
                Recording Paused
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center  border-t relative">
              <div className="flex items-center justify-center gap-6 flex-1">
                <div className="w-6" />
                <button
                  type="button"
                  onClick={toggleAudio}
                  disabled={!cameraReady || isProcessing || currentMode === 'view'}
                  className="p-4 rounded-full transition-colors bg-gray-300 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isAudioEnabled ? 'Disable audio' : 'Enable audio'}
                >
                  {isAudioEnabled ? (
                    <MicrophoneIcon className="w-6 h-6 text-gray-700" />
                  ) : (
                    <div className="relative">
                      <MicrophoneIcon className="w-6 h-6 text-gray-600" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-0.5 bg-red-600 rotate-45" />
                      </div>
                    </div>
                  )}
                </button>
                <div className="w-6" />

                <button
                  type="button"
                  onClick={handlePreviousVerse}
                  disabled={!hasPreviousVerse() || isRecording}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Verse"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                {currentMode === 'record' ? (
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!cameraReady || isProcessing || existingVideo}
                    className={`p-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRecording
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
                      <StopIcon className="w-6 h-6" fill="currentColor" />
                    ) : (

                      <VideoCameraIcon className="w-6 h-6" />)}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={!hasVideo}
                    className={`p-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${hasVideo
                      ? 'bg-success hover:bg-green-700 text-white'
                      : 'bg-gray-600 text-gray-400'
                    }`}
                    title={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? (
                      <PauseIcon className="w-6 h-6" />
                    ) : (
                      <PlayIcon className="w-6 h-6" fill="currentColor" />
                    )}
                  </button>
                )}

                {isRecording && (
                  <button
                    type="button"
                    onClick={isPaused ? resumeRecording : pauseRecording}
                    className="p-4 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all transform hover:scale-105 text-white"
                    title={isPaused ? 'Resume recording' : 'Pause recording'}
                  >
                    {isPaused ? (
                      <PlayIcon className="w-6 h-6" fill="currentColor" />
                    ) : (
                      <PauseIcon className="w-6 h-6" />
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextVerse}
                  disabled={!hasNextVerse() || isRecording}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Verse"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>

                <div className="w-6" />

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

              <div ref={cameraMenuRef} className="relative ml-auto group">
                <button
                  type="button"
                  onClick={() => setShowCameraMenu(!showCameraMenu)}
                  disabled={currentMode === 'view' || isRecording}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Camera Settings"
                >
                  <Cog6ToothIcon className="w-6 h-6" />
                </button>
                <div className="absolute right-full top-1/2 -translate-y-1/2  mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Camera Settings
                </div>

                {showCameraMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[250px] z-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                      <p className="text-sm font-medium text-gray-700">Select Camera</p>
                    </div>
                    {' '}
                    {videoDevices.map((device) => (
                      <button
                        key={device.deviceId}
                        type="button"
                        onClick={() => {
                          setSelectedCamera(device.deviceId);
                          setCameraReady(false);
                          if (streamRef.current) {
                            streamRef.current.getTracks().forEach((t) => t.stop());
                          }
                          setShowCameraMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${selectedCamera === device.deviceId ? 'bg-gray-200 font-medium' : ''
                        }`}
                      >
                        {device.label || `Camera ${device.deviceId.substring(0, 5)}`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
  setNotify: PropTypes.func.isRequired,
  setSnackText: PropTypes.func.isRequired,
  setOpenSnackBar: PropTypes.func.isRequired,
};

VideoRecorder.defaultProps = {
  onRecordingComplete: null,
  onVerseChange: null,
  mode: 'record',
};

export default VideoRecorder;
