import React, {
  useState, useRef, useEffect,
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
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

import { useCamera } from '@/hooks/video/useCamera';
import { useCameraMenu } from '@/hooks/video/useCameraMenu';
import { useFullscreen } from '@/hooks/video/useFullscreen';
import { useErrorHandler } from '@/hooks/video/useErrorHandler';
import { useVideoPlayback } from '@/hooks/video/useVideoPlayback';
import { useVideoRecording } from '@/hooks/video/useVideoRecording';
import { useVideoThumbnail } from '@/hooks/video/useVideoThumbnail';

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
  fileNameOverride,
  titleOverride,
  hideVerseNavigation = false,
  disableExistingVideoCheck = false,
  allowOverwriteExistingVideo = false,
  hideDeleteButton = false,
  commentCount = 0,
  onOpenComments,
  showCommentsButton = false,
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [existingVideo, setExistingVideo] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  const videoPreviewRef = useRef(null);
  const containerRef = useRef(null);
  const seekBarRef = useRef(null);

  const fs = window.require('fs');
  const path = window.require('path');

  const hasVideo = fileNameOverride
    ? fs.existsSync(path.join(projectPath, fileNameOverride))
    : ['webm', 'mp4'].some((ext) => fs.existsSync(path.join(projectPath, `${chapter}_${verse}.${ext}`)));
  const videoExt = ['webm', 'mp4'].find((ext) => fs.existsSync(path.join(projectPath, `${chapter}_${verse}.${ext}`)));
  const filename = fileNameOverride || (videoExt ? `${chapter}_${verse}.${videoExt}` : `${chapter}_${verse}.webm`);
  const filePath = path.join(projectPath, filename);

  const { error, setError, clearError } = useErrorHandler();

  const {
    cameraReady, videoDevices, streamRef, toggleAudio,
  } = useCamera({
    currentMode,
    isAudioEnabled,
    selectedCamera,
    videoPreviewRef,
    onError: setError,
    clearError,
    verse,
    chapter,
  });

  const {
    isPlaying,
    playbackTime,
    videoDuration,
    playbackSpeed,
    togglePlayPause,
    seek,
    cycleSpeed,
    resetPlayback,
    setIsPlaying,
  } = useVideoPlayback({
    currentMode,
    hasVideo,
    verse,
    chapter,
    projectPath,
    videoPreviewRef,
    onError: setError,
    fileNameOverride,
  });

  const handleSaveComplete = ({
    verse, chapter, filePath, filename, buffer,
  }) => {
    if (onRecordingComplete) {
      onRecordingComplete({
        verse, chapter, filePath, filename,
      });
    }

    setExistingVideo(true);
    setCurrentMode('view');

    setNotify('success');
    setSnackText('Video saved successfully');
    setOpenSnackBar(true);

    setTimeout(() => {
      if (videoPreviewRef.current) {
        const blob = new Blob([buffer], { type: 'video/webm' });
        const objectUrl = URL.createObjectURL(blob);

        videoPreviewRef.current.pause();
        videoPreviewRef.current.srcObject = null;
        videoPreviewRef.current.removeAttribute('src');
        videoPreviewRef.current.load();

        videoPreviewRef.current.src = objectUrl;
        videoPreviewRef.current.load();
      }
    }, 100);
  };

  const {
    isRecording,
    isPaused,
    recordingTime,
    isProcessing,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  } = useVideoRecording({
    chapter,
    verse,
    projectPath,
    streamRef,
    onSaveComplete: handleSaveComplete,
    onError: setError,
    fileNameOverride,
  });

  const {
    thumbnailData,
    hoverTime,
    showHoverTime,
    handleSeekHover,
    clearSeekHover,
  } = useVideoThumbnail({
    currentMode,
    hasVideo,
    videoPreviewRef,
  });

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const { showCameraMenu, setShowCameraMenu, cameraMenuRef } = useCameraMenu();

  useEffect(() => {
    const videoExists = fileNameOverride
      ? fs.existsSync(path.join(projectPath, fileNameOverride))
      : ['webm', 'mp4'].some((ext) => fs.existsSync(path.join(projectPath, `${chapter}_${verse}.${ext}`)));
    let nextMode = 'record';
    if (fileNameOverride) {
      nextMode = mode;
    } else if (videoExists && !disableExistingVideoCheck) {
      nextMode = 'view';
    }

    setExistingVideo(videoExists);
    setCurrentMode(nextMode);
  }, [chapter, verse, projectPath, mode, fileNameOverride, disableExistingVideoCheck]);

  useEffect(() => {
    if (!seekBarRef.current || !videoDuration) { return; }
    const percent = (playbackTime / videoDuration) * 100;
    seekBarRef.current.style.setProperty('--progress', `${percent}%`);
  }, [playbackTime, videoDuration]);

  useEffect(() => () => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.pause();
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current.src = '';
      videoPreviewRef.current.load();
    }

    if (videoPreviewRef.current?.src?.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreviewRef.current.src);
    }
  }, []);

  const handleDeleteClick = () => {
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

  const handleToggleAudio = async () => {
    const success = await toggleAudio(isRecording);
    if (success) {
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const handlePreviousVerse = () => {
    const prevVerse = getPreviousVerseNumber(verse, content);
    if (prevVerse && onVerseChange) {
      resetPlayback();
      onVerseChange(prevVerse);
    }
  };

  const handleNextVerse = () => {
    const nextVerse = getNextVerseNumber(verse, content);
    if (nextVerse && onVerseChange) {
      resetPlayback();
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
      className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[50] p-4 ${!isVisible ? 'hidden' : ''}`}
    >
      <div
        ref={containerRef}
        className={`bg-white shadow-2xl flex flex-col transition-all ${isFullscreen
          ? 'fixed inset-0 max-w-none max-h-none h-screen w-screen rounded-none z-[60]'
          : 'rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'}`}
      >
        <div className="bg-secondary text-white px-6 py-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <VideoCameraIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">
                {titleOverride || (
                  <>
                    {currentMode === 'view' ? 'Video Player' : 'Video Recording'}
                    {' - '}
                    {bookId.toUpperCase()}
                    {' '}
                    {chapter}
                    :
                    {verse}
                  </>
                )}
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

        <div className={`flex-1 flex flex-col ${isFullscreen ? 'overflow-hidden' : 'overflow-auto'} p-2`}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => clearError()}
                className="ml-auto text-red-600 hover:text-red-800"
                title="Close"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}
          <div
            className={`relative bg-gray-900 rounded-lg overflow-hidden mb-2 group ${isFullscreen ? 'flex-1' : ''}`}
            style={isFullscreen ? {} : { aspectRatio: '16/9' }}
          >
            {' '}
            <video
              ref={videoPreviewRef}
              autoPlay={currentMode === 'record'}
              muted={currentMode === 'record'}
              playsInline
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
            >
              <track kind="captions" src="" label="No captions" />
            </video>
            {' '}

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
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full shadow-lg">
                Recording Paused
              </div>
            )}
          </div>

          {currentMode === 'view' && hasVideo && (
            <div className="relative px-4 pb-2 flex-shrink-0">
              <input
                ref={seekBarRef}
                type="range"
                min={0}
                max={videoDuration || 0}
                step={0.01}
                value={playbackTime}
                onChange={(e) => seek(Number(e.target.value))}
                onMouseMove={(e) => handleSeekHover(e, seekBarRef, videoDuration)}
                onMouseLeave={clearSeekHover}
                className="w-full accent-primary cursor-pointer"
              />

              {showHoverTime && hoverTime !== null && (
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    left: (() => {
                      const thumbnailWidth = 160;
                      const rect = seekBarRef.current?.getBoundingClientRect();
                      if (!rect) { return '0px'; }

                      const position = (hoverTime / videoDuration) * 100;
                      const pixelPosition = (position / 100) * rect.width;
                      const halfThumb = thumbnailWidth / 2;

                      const clampedPosition = Math.max(
                        halfThumb,
                        Math.min(rect.width - halfThumb, pixelPosition),
                      );

                      return `${clampedPosition}px`;
                    })(),
                    transform: 'translateX(-50%)',
                    bottom: '100%',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div className="flex flex-col items-center">
                    {thumbnailData && (
                      <div className="mb-1 rounded overflow-hidden shadow-lg border-2 border-white w-40">
                        <img
                          src={thumbnailData}
                          alt="Video preview"
                          className="w-full h-auto block"
                          style={{ aspectRatio: '16/9' }}
                        />
                      </div>
                    )}
                    <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      {formatTime(hoverTime)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4 flex-shrink-0">
            <div className="flex items-center border-t relative px-4 py-2">
              <div className="flex items-center gap-2 w-44">
                {currentMode === 'view' && hasVideo && (
                  <div className="flex items-center gap-2 text-black px-3 py-1.5 rounded-md">
                    <span className="text-xs font-bold tracking-wide opacity-70 w-12">Speed</span>
                    <button
                      type="button"
                      onClick={cycleSpeed}
                      className="bg-orange-500 hover:bg-primary text-white text-sm font-medium px-3 py-1 rounded-full w-16 text-center"
                      title="Change playback speed"
                    >
                      {playbackSpeed}
                      x
                    </button>
                  </div>
                )}
                {currentMode === 'view' && hasVideo && showCommentsButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);

                      if (videoPreviewRef.current) {
                        videoPreviewRef.current.pause();
                      }

                      onOpenComments?.();
                    }}
                    className="relative flex items-center justify-center p-2 rounded-full border-2 border-gray-400 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    title="Open comments"
                  >
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5" />

                    {commentCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                        {commentCount}
                      </span>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center gap-10">
                <button
                  type="button"
                  onClick={handleToggleAudio}
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

                <div className="flex items-center gap-8">
                  <button
                    type="button"
                    onClick={handlePreviousVerse}
                    disabled={hideVerseNavigation || !hasPreviousVerse() || isRecording}
                    className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous Verse"
                  >
                    <ChevronLeftIcon className="w-6 h-6" />
                  </button>

                  {currentMode === 'record' ? (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!cameraReady || isProcessing || (existingVideo && !allowOverwriteExistingVideo)}
                      className={`p-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isRecording
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-primary hover:bg-primary-dark text-white'}`}
                      title={(() => {
                        if (isRecording) { return 'Stop recording'; }
                        if (existingVideo && !allowOverwriteExistingVideo) { return 'Recording exists - delete it first'; }
                        if (existingVideo && allowOverwriteExistingVideo) { return 'Re-record video'; }
                        return 'Start recording';
                      })()}
                    >
                      {isRecording ? (
                        <StopIcon className="w-6 h-6" fill="currentColor" />
                      ) : (
                        <VideoCameraIcon className="w-6 h-6" />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      disabled={!hasVideo}
                      className={`p-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${hasVideo
                        ? 'bg-success hover:bg-green-700 text-white'
                        : 'bg-gray-600 text-gray-400'}`}
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
                      className="p-4 bg-primary hover:bg-primary rounded-full transition-all transform hover:scale-105 text-white"
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
                    disabled={hideVerseNavigation || !hasNextVerse() || isRecording}
                    className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next Verse"
                  >
                    <ChevronRightIcon className="w-6 h-6" />
                  </button>
                </div>

                {!hideDeleteButton && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={!existingVideo || isRecording || isProcessing}
                    className={`p-4 rounded-full transition-all ${existingVideo
                      ? 'bg-error text-white hover:bg-red-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'} 
                      disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={existingVideo ? 'Delete recorded video' : 'No video to delete'}
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-40 justify-end">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (F)'}
                >
                  {isFullscreen ? (
                    <ArrowsPointingInIcon className="w-6 h-6" />
                  ) : (
                    <ArrowsPointingOutIcon className="w-6 h-6" />
                  )}
                </button>

                <div ref={cameraMenuRef} className="relative group">
                  <button
                    type="button"
                    onClick={() => setShowCameraMenu(!showCameraMenu)}
                    disabled={isRecording || currentMode === 'view'}
                    className="p-4 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Camera Settings"
                  >
                    <Cog6ToothIcon className="w-6 h-6" />
                  </button>
                  {currentMode === 'record' && (
                    <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Camera Settings
                    </div>
                  )}

                  {showCameraMenu && currentMode === 'record' && (
                    <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[250px] z-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                        <p className="text-sm font-medium text-gray-700">Select Camera</p>
                      </div>
                      {videoDevices.map((device) => (
                        <button
                          key={device.deviceId}
                          type="button"
                          onClick={() => {
                            setSelectedCamera(device.deviceId);
                            setShowCameraMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm ${selectedCamera === device.deviceId ? 'bg-gray-200 font-medium' : ''}`}
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
  fileNameOverride: PropTypes.string,
  titleOverride: PropTypes.string,
  hideVerseNavigation: PropTypes.bool,
  disableExistingVideoCheck: PropTypes.bool,
  allowOverwriteExistingVideo: PropTypes.bool,
  hideDeleteButton: PropTypes.bool,
  commentCount: PropTypes.number,
  onOpenComments: PropTypes.func,
  showCommentsButton: PropTypes.bool,
};

VideoRecorder.defaultProps = {
  onRecordingComplete: null,
  onVerseChange: null,
  mode: 'record',
  fileNameOverride: null,
  titleOverride: null,
  hideVerseNavigation: false,
  disableExistingVideoCheck: false,
  allowOverwriteExistingVideo: false,
  hideDeleteButton: false,
  commentCount: 0,
  onOpenComments: null,
  showCommentsButton: false,

};

export default VideoRecorder;
