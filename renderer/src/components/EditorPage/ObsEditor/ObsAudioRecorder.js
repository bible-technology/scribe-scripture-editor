import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import {
  useContext, useEffect, useState, useCallback, useRef,
} from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Player from '@/components/AudioRecorder/components/Player';
import { getDetails } from './utils/getDetails';

const ObsAudioRecorder = ({
  selectedParagraph,
  effectiveStoryId,
  isVisible = true,
}) => {
  const {
    state: { audioContent, updateWave },
    actions: { setAudioContent, setUpdateWave },
  } = useContext(ReferenceContext);
  const [currentUrl, setCurrentUrl] = useState('');
  const [newBlob, setNewBlob] = useState();
  const [take, setTake] = useState('1');
  const [trigger, setTrigger] = useState('');
  const [recordingsPath, setRecordingsPath] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openModal, setOpenModal] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });
  const audioContentRef = useRef(audioContent);
  const selectedParagraphRef = useRef(selectedParagraph);
  const effectiveStoryIdRef = useRef(effectiveStoryId);
  useEffect(() => {
    audioContentRef.current = audioContent;
  }, [audioContent]);
  useEffect(() => {
    selectedParagraphRef.current = selectedParagraph;
  }, [selectedParagraph]);
  useEffect(() => {
    effectiveStoryIdRef.current = effectiveStoryId;
  }, [effectiveStoryId]);
  const renameAudioFile = (oldPath, newPath) => {
    try {
      const fs = window.require('fs');
      if (fs.existsSync(oldPath) && oldPath !== newPath) {
        fs.renameSync(oldPath, newPath);
        return true;
      }
    } catch (error) {
      // console.error('Error renaming file:', error);
    }
    return false;
  };
  const clearPlayerState = () => {
    setCurrentUrl({
      paragraph: selectedParagraphRef.current
        ? selectedParagraphRef.current.toString()
        : '',
      storyNumber: effectiveStoryIdRef.current
        ? effectiveStoryIdRef.current.toString()
        : '',
      verseNumber: selectedParagraphRef.current,
      takes: {},
      default: 'take1',
      defaultTake: 'take1',
    });
    setTrigger('clear');
    setNewBlob(null);
  };
  const saveAudio = async (blob, para) => {
    try {
      if (!blob || !para) {
        return false;
      }
      const { projectsDir, path } = await getDetails();
      const fs = window.require('fs');
      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(
        audioFolder,
        effectiveStoryIdRef.current.toString(),
      );
      if (!fs.existsSync(audioFolder)) {
        fs.mkdirSync(audioFolder, { recursive: true });
      }
      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
      }
      const newStoryId = para - 1;
      const existingFiles = fs
        .readdirSync(storyFolder)
        .filter(
          (file) => file.startsWith(
            `${effectiveStoryIdRef.current}_${newStoryId}_`,
          ) && file.endsWith('.mp3'),
        );
      const isFirstRecording = existingFiles.length === 0;
      const baseFileName = `${effectiveStoryIdRef.current}_${newStoryId}_${take}`;
      const fileName = isFirstRecording
        ? `${baseFileName}_default.mp3`
        : `${baseFileName}.mp3`;
      const filePath = path.join(storyFolder, fileName);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      let attempts = 0;
      while (attempts < 5) {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            break;
          }
        }
        const waitUntil = Date.now() + 200;
        while (Date.now() < waitUntil) {
          // Busy-wait for 200ms
        }
        attempts += 1;
      }
      if (!fs.existsSync(filePath)) {
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  };
  const fetchUrl = (paragraphId, specificTake = null) => {
    const newStoryId = paragraphId - 1;
    const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
    const audioData = audioContentRef.current?.[key];
    setNewBlob(null);
    if (
      audioData
			&& audioData.takes
			&& Object.keys(audioData.takes).length > 0
    ) {
      const currentTake = specificTake || take;
      const takeExists = audioData.takes[currentTake];
      if (!takeExists) {
        clearPlayerState();
        return;
      }
      const defaultTake = audioData.defaultTake || '1';
      const defaultAudio = audioData.takes[defaultTake];
      if (defaultAudio && defaultAudio.filePath) {
        const playerCompatibleUrl = {
          verseNumber: paragraphId,
          paragraph: paragraphId ? paragraphId.toString() : '',
          storyNumber: effectiveStoryIdRef.current
            ? effectiveStoryIdRef.current.toString()
            : '',
          default: `take${defaultTake}`,
          defaultTake: `take${defaultTake}`,
          take1: audioData.takes['1']
            ? audioData.takes['1'].fileName
            : undefined,
          take2: audioData.takes['2']
            ? audioData.takes['2'].fileName
            : undefined,
          take3: audioData.takes['3']
            ? audioData.takes['3'].fileName
            : undefined,
          takes: {},
        };
        Object.keys(audioData.takes).forEach((takeNum) => {
          const takeKey = `take${takeNum}`;
          const takeData = audioData.takes[takeNum];
          playerCompatibleUrl[takeKey] = takeData.fileName;
          playerCompatibleUrl.takes[takeKey] = {
            ...takeData,
            url: `file://${takeData.filePath.replace(/\\/g, '/')}`,
          };
        });
        setCurrentUrl(playerCompatibleUrl);
        setTrigger('url');
        return;
      }
    }
    clearPlayerState();
  };
  const loadStoryAudio = async () => {
    try {
      const fs = window.require('fs');
      const path = window.require('path');
      const { projectsDir } = await getDetails();
      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(
        audioFolder,
        effectiveStoryIdRef.current.toString(),
      );
      setRecordingsPath(storyFolder);
      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
        clearPlayerState();
        return;
      }
      const files = fs
        .readdirSync(storyFolder)
        .filter((file) => file.endsWith('.mp3'));
      if (files.length === 0) {
        clearPlayerState();
        setAudioContent({});
        return;
      }
      const updatedContent = {};
      files.forEach((file) => {
        const name = path.parse(file).name;
        const parts = name.split('_');
        if (parts.length >= 3) {
          const [storyNum, paraNum, takeNum, ...rest] = parts;
          const isDefault = rest.includes('default');
          const key = `story_${storyNum}_${paraNum}`;
          const fullFilePath = path.join(storyFolder, file);
          const fileUrl = `file://${fullFilePath.replace(
            /\\/g,
            '/',
          )}`;
          if (!updatedContent[key]) {
            updatedContent[key] = {
              paragraph: paraNum,
              storyNumber: storyNum,
              verseNumber: paraNum,
              takes: {},
              defaultTake: '1',
              filePath: storyFolder,
            };
          }
          updatedContent[key].takes[takeNum] = {
            fileName: file,
            filePath: fullFilePath,
            url: fileUrl,
            isDefault,
          };
          if (isDefault) {
            updatedContent[key].defaultTake = takeNum;
            updatedContent[key].default = `take${takeNum}`;
          }
          updatedContent[key][`take${takeNum}`] = file;
        }
      });
      const cleanedContent = {};
      Object.keys(updatedContent).forEach((key) => {
        const takeKeys = Object.keys(updatedContent[key].takes);
        if (takeKeys.length > 0) {
          if (!updatedContent[key].default) {
            updatedContent[key].defaultTake = takeKeys[0];
            updatedContent[key].default = `take${takeKeys[0]}`;
          }
          cleanedContent[key] = updatedContent[key];
        }
      });
      setAudioContent(cleanedContent);
      setUpdateWave(!updateWave);
      if (selectedParagraphRef.current) {
        setTimeout(() => {
          fetchUrl(selectedParagraphRef.current, take);
        }, 100);
      }
    } catch (error) {
      // console.error('Error loading story audio:', error);
      clearPlayerState();
    }
  };
  const changeDefault = async (para, takeValue) => {
    try {
      let newDefaultTake;
      if (typeof takeValue === 'string' && takeValue.startsWith('take')) {
        newDefaultTake = takeValue.replace('take', '');
      } else {
        newDefaultTake = takeValue.toString();
      }
      const newStoryId = para - 1;
      const folder = recordingsPath;
      const { path } = await getDetails();
      const fs = window.require('fs');
      const files = fs
        .readdirSync(folder)
        .filter(
          (file) => file.startsWith(
            `${effectiveStoryIdRef.current}_${newStoryId}_`,
          ) && file.endsWith('.mp3'),
        );
      let currentDefault = '1';
      files.forEach((file) => {
        if (file.includes('_default.mp3')) {
          const parts = file.split('_');
          if (parts.length >= 3) {
            currentDefault = parts[2];
          }
        }
      });
      if (currentDefault === newDefaultTake) {
        return;
      }
      const oldDefaultFile = `${effectiveStoryIdRef.current}_${newStoryId}_${currentDefault}_default.mp3`;
      const oldDefaultPath = path.join(folder, oldDefaultFile);
      const newOldDefaultFile = `${effectiveStoryIdRef.current}_${newStoryId}_${currentDefault}.mp3`;
      const newOldDefaultPath = path.join(folder, newOldDefaultFile);
      const currentNewDefaultFile = `${effectiveStoryIdRef.current}_${newStoryId}_${newDefaultTake}.mp3`;
      const currentNewDefaultPath = path.join(
        folder,
        currentNewDefaultFile,
      );
      const newDefaultFile = `${effectiveStoryIdRef.current}_${newStoryId}_${newDefaultTake}_default.mp3`;
      const newDefaultPath = path.join(folder, newDefaultFile);
      if (fs.existsSync(oldDefaultPath)) {
        renameAudioFile(oldDefaultPath, newOldDefaultPath);
      }
      if (fs.existsSync(currentNewDefaultPath)) {
        renameAudioFile(currentNewDefaultPath, newDefaultPath);
      }
      const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
      if (audioContentRef.current[key]) {
        const updatedContent = {
          ...audioContentRef.current,
          [key]: {
            ...audioContentRef.current[key],
            defaultTake: newDefaultTake,
            default: `take${newDefaultTake}`,
          },
        };
        setAudioContent(updatedContent);
      }
      await loadStoryAudio();
    } catch (error) {
      // console.error('Error changing default audio:', error);
    }
  };
  const handleDeleteAudio = async (para, takeValue) => {
    // Prevent concurrent deletions
    if (isDeleting) { return false; }
    setIsDeleting(true);
    try {
      const fs = window.require('fs');
      const { path } = await getDetails();
      let takeNum;
      if (typeof takeValue === 'string' && takeValue.startsWith('take')) {
        takeNum = takeValue.replace('take', '');
      } else {
        takeNum = takeValue.toString();
      }
      const newStoryId = para - 1;
      const folder = recordingsPath;
      const defaultFile = `${effectiveStoryIdRef.current}_${newStoryId}_${takeNum}_default.mp3`;
      const regularFile = `${effectiveStoryIdRef.current}_${newStoryId}_${takeNum}.mp3`;
      const defaultPath = path.join(folder, defaultFile);
      const regularPath = path.join(folder, regularFile);
      let deletedFilePath = null;
      let wasDefault = false;
      if (fs.existsSync(defaultPath)) {
        fs.unlinkSync(defaultPath);
        deletedFilePath = defaultPath;
        wasDefault = true;
      } else if (fs.existsSync(regularPath)) {
        fs.unlinkSync(regularPath);
        deletedFilePath = regularPath;
        wasDefault = false;
      } else {
        // console.log(`No file found to delete for take ${takeNum}`);
        return false;
      }
      if (deletedFilePath) {
        const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
        if (audioContentRef.current[key]) {
          const currentAudioData = audioContentRef.current[key];
          const updatedTakes = { ...currentAudioData.takes };
          delete updatedTakes[takeNum];
          if (wasDefault && Object.keys(updatedTakes).length > 0) {
            const remainingTakeNums = Object.keys(updatedTakes);
            const newDefaultTakeNum = remainingTakeNums[0];
            const currentFile =							updatedTakes[newDefaultTakeNum].fileName;
            const currentPath = path.join(folder, currentFile);
            const newDefaultFileName = currentFile.replace(
              '.mp3',
              '_default.mp3',
            );
            const newDefaultPath = path.join(
              folder,
              newDefaultFileName,
            );
            if (
              fs.existsSync(currentPath)
							&& !currentFile.includes('_default')
            ) {
              fs.renameSync(currentPath, newDefaultPath);
              updatedTakes[newDefaultTakeNum] = {
                ...updatedTakes[newDefaultTakeNum],
                fileName: newDefaultFileName,
                filePath: newDefaultPath,
                isDefault: true,
              };
            }
          }
          const updatedContent = { ...audioContentRef.current };
          if (Object.keys(updatedTakes).length > 0) {
            updatedContent[key] = {
              ...currentAudioData,
              takes: updatedTakes,
            };
          } else {
            delete updatedContent[key];
          }
          setAudioContent(updatedContent);
        }
        clearPlayerState();
        setTimeout(async () => {
          await loadStoryAudio();
          if (selectedParagraphRef.current === para) {
            const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
            const audioData = audioContentRef.current?.[key];
            if (audioData && audioData.takes) {
              const availableTakes = Object.keys(audioData.takes);
              if (availableTakes.length > 0) {
                if (!audioData.takes[take]) {
                  const newTake = availableTakes[0];
                  setTake(newTake);
                  setTimeout(() => {
                    fetchUrl(
                      selectedParagraphRef.current,
                      newTake,
                    );
                  }, 100);
                } else {
                  setTimeout(() => {
                    fetchUrl(
                      selectedParagraphRef.current,
                      take,
                    );
                  }, 100);
                }
              } else {
                clearPlayerState();
                setTake('1');
              }
            } else {
              clearPlayerState();
              setTake('1');
            }
          }
        }, 300);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  const playRecordingFeedback = useCallback(
    async (blobUrl, blob, para) => {
      setIsRecording(false);
      setTrigger('');
      if (para && blob) {
        setNewBlob(blobUrl);
        const saveSuccess = await saveAudio(blob, para);
        if (saveSuccess) {
          await loadStoryAudio();
          setTimeout(() => {
            setNewBlob(null);
          }, 500);
        }
      } else {
        setNewBlob(blobUrl);
      }
    },
    [take],
  );
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    status,
  } = useReactMediaRecorder({
    audio: true,
    onStart: () => {
      setIsRecording(true);
    },
    onStop: (blobUrl, blob) => {
      setTimeout(() => {
        playRecordingFeedback(
          blobUrl,
          blob,
          selectedParagraphRef.current,
        );
      }, 100);
    },
    blobPropertyBag: { type: 'audio/mp3' },
  });
  useEffect(() => {
    if (effectiveStoryId) {
      loadStoryAudio();
    }
  }, [effectiveStoryId]);
  useEffect(() => {
    if (audioContent && Object.keys(audioContent).length > 0) {
      if (!take || !/^\d+$/.test(take)) {
        setTake('1');
      }
    }
  }, [audioContent, take]);
  useEffect(() => {
    if (selectedParagraph && effectiveStoryId) {
      setNewBlob(null);
      setTrigger('');
      setTake('1');
      fetchUrl(selectedParagraph);
    }
  }, [selectedParagraph, effectiveStoryId]);
  useEffect(() => {
    if (selectedParagraph && audioContent) {
      const timeoutId = setTimeout(() => {
        fetchUrl(selectedParagraph, take);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [audioContent]);
  useEffect(() => {
    if (selectedParagraph && take) {
      setNewBlob(null);
      setTrigger('');
      fetchUrl(selectedParagraph, take);
    }
  }, [take]);
  const audioFunctions = {
    fetchUrl,
    loadStoryAudio,
    changeDefault,
    startRecording: () => {
      if (selectedParagraph) {
        startRecording();
      }
    },
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
  if (!isVisible) {
    return null;
  }
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <Player
        url={currentUrl || {}}
        blobUrl={newBlob}
        setBlobUrl={setNewBlob}
        startRecording={audioFunctions.startRecording}
        stopRecording={stopRecording}
        pauseRecording={pauseRecording}
        resumeRecording={resumeRecording}
        take={`take${take}`}
        setTake={(takeValue) => {
          const takeNum = takeValue.replace('take', '');
          setTake(takeNum);
        }}
        changeDefault={(v) => changeDefault(selectedParagraph, v)}
        setOpenModal={setOpenModal}
        trigger={trigger}
        setTrigger={(v) => setTrigger(v)}
        location={recordingsPath || ''}
        isRecording={isRecording}
        recordingStatus={status}
        selectedParagraph={selectedParagraph}
        disableRecordStopShortcuts
      />
      {openModal.openModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {openModal.title}
            </h3>
            <p className="mb-6">{openModal.confirmMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setOpenModal({
                  ...openModal,
                  openModel: false,
                })}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                disabled={isDeleting}
                onClick={() => {
                  if (trigger === 'delete') {
                    handleDeleteAudio(
                      selectedParagraph,
                      take,
                    );
                  } else {
                    setTrigger('record');
                    setIsRecording(true);
                  }
                  setOpenModal({
                    ...openModal,
                    openModel: false,
                  });
                }}
              >
                {isDeleting
                  ? 'Deleting...'
                  : openModal.buttonName}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
ObsAudioRecorder.propTypes = {
  selectedParagraph: PropTypes.number,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isVisible: PropTypes.bool,
};
export default ObsAudioRecorder;
