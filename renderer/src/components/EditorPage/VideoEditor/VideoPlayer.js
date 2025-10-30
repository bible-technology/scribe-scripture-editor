import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  useContext, useState, useRef, useEffect,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import VideoRecorder from '@/components/EditorPage/VideoEditor/VideoRecorder';
import {
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import * as logger from '../../../logger';

const VideoPlayer = ({
  content,
  onChangeVerse,
  verse,
  location,
  fontSize,
  selectedFont,
  setOpenModal,
}) => {
  const path = require('path');
  const fs = window.require('fs');
  const { t } = useTranslation();

  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [currentRecordingVerse, setCurrentRecordingVerse] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [playingVerseNumber, setPlayingVerseNumber] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoPlayerRef = useRef(null);

  const {
    state: {
      bookId,
      chapter,
    },
    actions: {
      setAudioContent,
    },
  } = useContext(ReferenceContext);

  const playingVerseData = content?.find((item) => item.verseNumber === playingVerseNumber);
  const hasVideoPlaying = playingVerseData?.default && playingVerseData[playingVerseData.default];

  useEffect(() => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.play().catch((err) => {
          logger.error('Error playing video:', err);
          setIsPlaying(false);
        });
      } else {
        videoPlayerRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (showVideoPlayer && hasVideoPlaying) {
      setIsPlaying(true);
    }
  }, [showVideoPlayer, playingVerseNumber]);

  useEffect(() => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = 0;
    }
  }, [playingVerseNumber]);

  const selectVerse = (value) => {
    onChangeVerse(value.toString(), verse);
  };

  const handlePlayVideoForVerse = (verseNumber, e) => {
    e.stopPropagation();

    const verseData = content?.find((item) => item.verseNumber === verseNumber);
    const hasVideo = verseData?.default && verseData[verseData.default];

    if (hasVideo) {
      setPlayingVerseNumber(verseNumber);
      setShowVideoPlayer(true);
      setIsPlaying(true);
    }
  };

  const handleCloseVideoPlayer = () => {
    setShowVideoPlayer(false);
    setIsPlaying(false);
    setPlayingVerseNumber(null);
  };

  const handleOpenVideoRecorder = (verseNumber, e) => {
    e.stopPropagation();
    const filename = `${chapter}_${verseNumber}_1_default.mp4`;
    const filePath = path.join(location, filename);

    if (fs.existsSync(filePath)) {
      setOpenModal({
        openModel: true,
        title: t('modal-title-re-record-video') || 'Re-record Video',
        confirmMessage: t('msg-re-record-video') || 'This verse already has a recording. Do you want to re-record it?',
        buttonName: t('label-re-record') || 'Re-record',
        action: 'reRecordVideo',
        actionData: {
          verseNumber,
          filePath,
        },
      });
    } else {
      setCurrentRecordingVerse(verseNumber);
      setShowVideoRecorder(true);
    }
  };

  const handleRecordingComplete = (data) => {
    logger.info('Video recording completed:', data);

    const updatedContent = content.map((item) => {
      if (item.verseNumber === data.verse.toString()) {
        if (data.deleted) {
          const updated = { ...item };
          delete updated.take1;
          delete updated[updated.default];
          updated.default = '';
          return updated;
        }
        return {
          ...item,
          take1: data.filename,
          default: 'take1',
        };
      }
      return item;
    });

    setAudioContent(updatedContent);
  };

  const handleVerseChangeInRecorder = (newVerseNumber) => {
    setCurrentRecordingVerse(newVerseNumber);
    onChangeVerse(newVerseNumber.toString(), verse);
  };

  const handleDeleteVideo = (e, verseNumber, videoFileName) => {
    e.stopPropagation();

    setOpenModal({
      openModel: true,
      title: t('modal-title-delete-video'),
      confirmMessage: t('msg-delete-video'),
      buttonName: t('label-delete'),
      action: 'deleteVideo',
      actionData: {
        verseNumber,
        videoFileName,
      },
    });
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePreviousVerse = () => {
    if (!playingVerseNumber) { return; }

    const currentIndex = content.findIndex((item) => item.verseNumber === playingVerseNumber);
    if (currentIndex > 0) {
      const prevVerse = content[currentIndex - 1];
      // Only navigate to previous verse if it has a video
      if (prevVerse.default && prevVerse[prevVerse.default]) {
        setPlayingVerseNumber(prevVerse.verseNumber);
        setIsPlaying(true);
      }
    }
  };

  const handleNextVerse = () => {
    if (!playingVerseNumber) { return; }

    const currentIndex = content.findIndex((item) => item.verseNumber === playingVerseNumber);
    if (currentIndex < content.length - 1) {
      const nextVerse = content[currentIndex + 1];
      // Only navigate to next verse if it has a video
      if (nextVerse.default && nextVerse[nextVerse.default]) {
        setPlayingVerseNumber(nextVerse.verseNumber);
        setIsPlaying(true);
      }
    }
  };

  const getVideoPath = () => {
    if (playingVerseData?.default && playingVerseData[playingVerseData.default]) {
      return `file://${path.join(location, playingVerseData[playingVerseData.default])}`;
    }
    return null;
  };

  const hasPreviousVideo = () => {
    if (!playingVerseNumber) { return false; }
    const currentIndex = content.findIndex((item) => item.verseNumber === playingVerseNumber);
    if (currentIndex <= 0) { return false; }

    for (let i = currentIndex - 1; i >= 0; i--) {
      if (content[i].default && content[i][content[i].default]) {
        return true;
      }
    }
    return false;
  };

  const hasNextVideo = () => {
    if (!playingVerseNumber) { return false; }
    const currentIndex = content.findIndex((item) => item.verseNumber === playingVerseNumber);
    if (currentIndex < 0 || currentIndex >= content.length - 1) { return false; }

    for (let i = currentIndex + 1; i < content.length; i++) {
      if (content[i].default && content[i][content[i].default]) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="bg-white rounded-md overflow-hidden">
      {content?.map((mainChunk) => (
        mainChunk.verseNumber && (
          <div
            role="button"
            aria-label="select verse"
            tabIndex={0}
            key={mainChunk.verseNumber}
            className={`relative ${mainChunk.verseNumber === verse ? 'bg-light' : 'bg-gray-100'
            } m-3 px-3 py-4 justify-center items-center border border-gray-200 rounded-lg hover:bg-light cursor-pointer`}
            onClick={() => selectVerse(mainChunk.verseNumber, mainChunk.verseText)}
          >
            <div className="flex w-full items-start group-hover:text-white">
              <div className="flex items-center justify-center bg-primary w-10 h-8 mr-2 rounded-full text-sm text-white flex-shrink-0">
                {mainChunk.verseNumber}
              </div>
              <p
                className="m-0 flex-1 text-sm text-gray-500"
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${fontSize}rem`,
                  lineHeight: fontSize > 1.3 ? 1.5 : '',
                }}
              >
                {mainChunk.verseText || ''}
              </p>

              {mainChunk.default && mainChunk[mainChunk.default] ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handlePlayVideoForVerse(mainChunk.verseNumber, e)}
                    className="flex items-center justify-center p-2 rounded-full border-2 border-success text-success hover:bg-success hover:text-white transition-all duration-200"
                    title="Play recorded video"
                    aria-label={`Play video for verse ${mainChunk.verseNumber}`}
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteVideo(e, mainChunk.verseNumber, mainChunk[mainChunk.default])}
                    className="flex items-center justify-center p-2 rounded-full border-2 border-error text-error hover:bg-error hover:text-white transition-all duration-200"
                    title="Delete recorded video"
                    aria-label={`Delete video for verse ${mainChunk.verseNumber}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleOpenVideoRecorder(mainChunk.verseNumber, e)}
                  className="flex items-center justify-center p-2 ml-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 flex-shrink-0"
                  title="Record video for this verse"
                  aria-label={`Record video for verse ${mainChunk.verseNumber}`}
                >
                  <VideoCameraIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        )
      ))}

      {showVideoPlayer && playingVerseNumber && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[50] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-secondary text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <PlayIcon className="w-6 h-6" />
                <div>
                  <h2 className="text-lg font-semibold">
                    Video Player -
                    {' '}
                    {bookId.toUpperCase()}
                    {' '}
                    {chapter}
                    :
                    {playingVerseNumber}
                  </h2>
                  <p className="text-sm text-gray-200">
                    {isPlaying ? 'Playing' : 'Paused'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseVideoPlayer}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                title="Close"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-gray-900 p-6">
              <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                {hasVideoPlaying ? (
                  <video
                    ref={videoPlayerRef}
                    src={getVideoPath()}
                    className="w-full h-full object-contain"
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      logger.error('Video playback error:', e);
                      setIsPlaying(false);
                    }}
                  >
                    <track kind="captions" src="" label="No captions" />
                  </video>

                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <VideoCameraIcon className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">Video not available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Verse Text */}
              {/* {playingVerseData?.verseText && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center bg-primary w-8 h-8 rounded-full text-sm text-white flex-shrink-0">
                      {playingVerseNumber}
                    </div>
                    <p
                      className="flex-1 text-gray-200"
                      style={{
                        fontFamily: selectedFont || 'sans-serif',
                        fontSize: `${fontSize}rem`,
                        lineHeight: fontSize > 1.3 ? 1.5 : 1.6,
                      }}
                    >
                      {playingVerseData.verseText}
                    </p>
                  </div>
                </div>
              )} */}

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    disabled={!hasVideoPlaying}
                    className={`p-6 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasVideoPlaying
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

                  <button
                    type="button"
                    onClick={(e) => {
                      handleDeleteVideo(e, playingVerseNumber, playingVerseData[playingVerseData.default]);
                      handleCloseVideoPlayer();
                    }}
                    disabled={!hasVideoPlaying}
                    className={`p-4 rounded-full transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      hasVideoPlaying
                        ? 'bg-error hover:bg-red-700 text-white'
                        : 'bg-gray-600 text-gray-400'
                    }`}
                    title="Delete video"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={handlePreviousVerse}
                    disabled={!hasPreviousVideo()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                    <span>Previous</span>
                  </button>

                  <div className="text-center px-6 py-2 bg-primary bg-opacity-20 rounded-lg border border-primary">
                    <p className="text-xs text-gray-400 mb-1">Verse</p>
                    <p className="text-2xl font-bold text-white">{playingVerseNumber}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextVerse}
                    disabled={!hasNextVideo()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVideoRecorder && currentRecordingVerse && (
        <VideoRecorder
          verse={currentRecordingVerse}
          chapter={chapter}
          bookId={bookId}
          projectPath={location}
          totalVerses={content?.length || 0}
          onRecordingComplete={handleRecordingComplete}
          onClose={() => {
            setShowVideoRecorder(false);
            setCurrentRecordingVerse(null);
          }}
          onVerseChange={handleVerseChangeInRecorder}
          onDeleteVideo={(verseNum) => {
            const updatedContent = content.map((item) => {
              if (item.verseNumber === verseNum.toString()) {
                const updated = { ...item };
                delete updated.take1;
                delete updated[updated.default];
                updated.default = '';
                return updated;
              }
              return item;
            });
            setAudioContent(updatedContent);

            // If we deleted the currently playing video, close the player
            if (verseNum.toString() === playingVerseNumber) {
              handleCloseVideoPlayer();
            }

            return true;
          }}
        />
      )}
    </div>
  );
};

VideoPlayer.propTypes = {
  content: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onChangeVerse: PropTypes.func.isRequired,
  verse: PropTypes.string,
  location: PropTypes.string,
  fontSize: PropTypes.number,
  selectedFont: PropTypes.string,
  setOpenModal: PropTypes.func.isRequired,
};

VideoPlayer.defaultProps = {
  content: [],
  verse: '1',
  location: '',
  fontSize: 1,
  selectedFont: 'sans-serif',
};

export default VideoPlayer;
