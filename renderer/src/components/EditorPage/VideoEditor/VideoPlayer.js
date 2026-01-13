import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  useContext, useState, useEffect,
} from 'react';
import { isJoinedVerse } from '@/core/editor/verseJoining';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import VideoRecorder from '@/components/EditorPage/VideoEditor/VideoRecorder';
import {
  VideoCameraIcon,
  PlayIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import VerseContextMenu from '@/components/EditorPage/VideoEditor/VerseContextMenu.jsx';
import * as logger from '../../../logger';

const VideoPlayer = ({
  content,
  onChangeVerse,
  verse,
  location,
  fontSize,
  selectedFont,
  setOpenModal,
  onJoinVerse,
  onDisjoinVerse,
  chapter,
  bookId,
  pendingRecorderReopen,
  setPendingRecorderReopen,
  setNotify,
  setSnackText,
  setOpenSnackBar,
}) => {
  const { t } = useTranslation();

  const [showVideoRecorder, setShowVideoRecorder] = useState(false);
  const [currentRecordingVerse, setCurrentRecordingVerse] = useState(null);
  const [recorderMode, setRecorderMode] = useState('record');
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    verse: null,
    isFirstVerse: false,
    isJoinedVerse: false,
  });

  const {
    actions: {
      setVideoContent,
    },
  } = useContext(ReferenceContext);
  useEffect(() => {
    if (pendingRecorderReopen) {
      setCurrentRecordingVerse(pendingRecorderReopen.verse);
      setRecorderMode(pendingRecorderReopen.mode);
      setShowVideoRecorder(true);
      setPendingRecorderReopen(null);
    }
  }, [pendingRecorderReopen, setPendingRecorderReopen]);

  const selectVerse = (value) => {
    onChangeVerse(value.toString(), verse);
  };

  const handleContextMenu = (e, verseItem) => {
    e.preventDefault();
    e.stopPropagation();
    const first = Number(verseItem.verseNumber) === 1;
    const joined = isJoinedVerse(verseItem.verseNumber);

    if (first && !joined) {
      return;
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      verse: verseItem,
      isFirstVerse: Number(verseItem.verseNumber) === 1,
      isJoinedVerse: isJoinedVerse(verseItem.verseNumber),
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      verse: null,
      isFirstVerse: false,
      isJoinedVerse: false,
    });
  };

  const handlePlayVideoForVerse = (verseNumber, e) => {
    e.stopPropagation();
    setCurrentRecordingVerse(verseNumber);
    setRecorderMode('view');
    setShowVideoRecorder(true);
  };

  const handleOpenVideoRecorder = (verseNumber, e) => {
    e.stopPropagation();
    const fs = window.require('fs');
    const path = window.require('path');
    const filename = `${chapter}_${verseNumber}.webm`;
    const filePath = path.join(location, filename);

    if (fs.existsSync(filePath)) {
      setOpenModal({
        openModel: true,
        title: t('modal-title-re-record-video'),
        confirmMessage: t('msg-re-record-video'),
        buttonName: t('label-re-record'),
        action: 'reRecordVideo',
        actionData: {
          verseNumber,
          filePath,
        },
      });
    } else {
      setCurrentRecordingVerse(verseNumber);
      setRecorderMode('record');
      setShowVideoRecorder(true);
    }
  };

  const handleRecordingComplete = (data) => {
    logger.debug('Video recording completed:', data);

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

    setVideoContent(updatedContent);
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

  const fs = window.require('fs');
  const path = window.require('path');

  const doesVideoExistForVerse = (verseNumber) => {
    const filename = `${chapter}_${verseNumber}.webm`;
    const filePath = path.join(location, filename);
    return fs.existsSync(filePath);
  };

  return (
    <div className="bg-white rounded-md overflow-hidden">
      {content?.map((mainChunk, index) => {
        const verseNum = mainChunk.verseNumber;
        if (!verseNum) { return null; }

        const isActive = (() => {
          const num = verseNum;
          const current = Number(verse);

          if (typeof num === 'string' && num.includes('-')) {
            const [start, end] = num.split('-').map(Number);
            return current >= start && current <= end;
          }

          return num === verse.toString();
        })();

        const hasVideo = doesVideoExistForVerse(verseNum);
        return (

          <div
            role="button"
            aria-label="select verse"
            tabIndex={0}
            key={mainChunk.verseNumber}
            id={`ch${chapter}v${mainChunk.verseNumber}`}
            className={`
              relative
              ${isActive ? 'bg-light' : 'bg-gray-100'}
              ${isJoinedVerse(verseNum) ? 'border-l-4 border-amber-500 bg-amber-50' : ''}
              m-3 px-3 py-4 justify-center items-center
              border border-gray-200 rounded-lg hover:bg-light cursor-pointer
            `}
            onClick={() => selectVerse(mainChunk.verseNumber, mainChunk.verseText)}
            onContextMenu={(e) => handleContextMenu(e, mainChunk, index)}
          >
            <div className="flex w-full items-start group-hover:text-white">
              <div className={`flex items-center justify-center w-10 h-8 mr-2 rounded-full text-sm text-white flex-shrink-0 ${isJoinedVerse(mainChunk.verseNumber) ? 'bg-amber-600' : 'bg-primary'
              }`}
              >
                {verseNum}
              </div>
              <p
                className={`m-0 flex-1 text-sm ${isJoinedVerse(verseNum) ? 'text-amber-900 font-medium' : 'text-gray-500'
                }`}
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${fontSize}rem`,
                  lineHeight: fontSize > 1.3 ? 1.5 : '',
                }}
              >
                {mainChunk.verseText || ''}
              </p>

              <div className="flex items-center gap-2 flex-shrink-0">

                {hasVideo ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handlePlayVideoForVerse(verseNum, e)}
                      className="flex items-center justify-center p-2 rounded-full border-2 border-success text-success hover:bg-success hover:text-white transition-all duration-200"
                      title="Play recorded video"
                    >
                      <PlayIcon className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteVideo(e, verseNum, `${chapter}_${verseNum}.webm`)}
                      className="flex items-center justify-center p-2 rounded-full border-2 border-error text-error hover:bg-error hover:text-white transition-all duration-200"
                      title="Delete recorded video"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleOpenVideoRecorder(verseNum, e)}
                    className="flex items-center justify-center p-2 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200"
                    title="Record video for this verse"
                  >
                    <VideoCameraIcon className="w-5 h-5" />
                  </button>
                )}

              </div>
            </div>
          </div>
        );
      })}
      <VerseContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        verse={contextMenu.verse}
        isFirstVerse={contextMenu.isFirstVerse}
        isJoinedVerse={contextMenu.isJoinedVerse}
        onJoinVerse={onJoinVerse}
        onDisjoinVerse={onDisjoinVerse}
        onClose={handleCloseContextMenu}
      />

      {showVideoRecorder && currentRecordingVerse && (
        <VideoRecorder
          verse={currentRecordingVerse}
          chapter={chapter}
          bookId={bookId}
          projectPath={location}
          content={content}
          mode={recorderMode}
          onRecordingComplete={handleRecordingComplete}
          onClose={() => {
            setShowVideoRecorder(false);
            setCurrentRecordingVerse(null);
          }}
          onVerseChange={handleVerseChangeInRecorder}
          setOpenModal={setOpenModal}
          setNotify={setNotify}
          setSnackText={setSnackText}
          setOpenSnackBar={setOpenSnackBar}
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
  onJoinVerse: PropTypes.func.isRequired,
  onDisjoinVerse: PropTypes.func.isRequired,
  chapter: PropTypes.string.isRequired,
  bookId: PropTypes.string.isRequired,
  pendingRecorderReopen: PropTypes.object,
  setPendingRecorderReopen: PropTypes.func,
  setNotify: PropTypes.func.isRequired,
  setSnackText: PropTypes.func.isRequired,
  setOpenSnackBar: PropTypes.func.isRequired,

};

VideoPlayer.defaultProps = {
  content: [],
  verse: '1',
  location: '',
  fontSize: 1,
  selectedFont: 'sans-serif',
};

export default VideoPlayer;
