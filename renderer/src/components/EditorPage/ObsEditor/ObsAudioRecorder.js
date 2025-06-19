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
  const [isSaving, setIsSaving] = useState(false);
  const [openModal, setOpenModal] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
    action: '',
  });

  // Refs to track current values
  const audioContentRef = useRef(audioContent);
  const selectedParagraphRef = useRef(selectedParagraph);
  const effectiveStoryIdRef = useRef(effectiveStoryId);
  const currentTakeRef = useRef(take);

  // Enhanced cache management
  const urlCacheRef = useRef(new Map());
  const lastSavedFileRef = useRef(null);
  const deletedFilesRef = useRef(new Set()); // Track deleted files
  const cacheVersionRef = useRef(0); // Global cache version

  useEffect(() => {
    audioContentRef.current = audioContent;
  }, [audioContent]);

  useEffect(() => {
    selectedParagraphRef.current = selectedParagraph;
  }, [selectedParagraph]);

  useEffect(() => {
    effectiveStoryIdRef.current = effectiveStoryId;
  }, [effectiveStoryId]);

  useEffect(() => {
    currentTakeRef.current = take;
  }, [take]);

  // Generate cache-busted URL with global version
  const getCacheBustedUrl = (filePath, forceNew = false) => {
    if (forceNew) {
      cacheVersionRef.current += 1;
    }
    const timestamp = Date.now();
    const version = cacheVersionRef.current;
    const cleanPath = filePath.replace(/\\/g, '/');
    return `file://${cleanPath}?t=${timestamp}&v=${version}`;
  };

  // Clear URL cache for specific file and mark as deleted
  const clearUrlCache = (filePath) => {
    const keys = Array.from(urlCacheRef.current.keys());
    keys.forEach((key) => {
      if (key.includes(filePath) || filePath.includes(key)) {
        urlCacheRef.current.delete(key);
      }
    });
    // Mark file as deleted
    deletedFilesRef.current.add(filePath);
  };

  // Clear all cache and increment global version
  const clearAllCache = () => {
    urlCacheRef.current.clear();
    deletedFilesRef.current.clear();
    cacheVersionRef.current += 1;
  };

  // Check if file exists and is not deleted
  const isFileAvailable = (filePath) => {
    if (deletedFilesRef.current.has(filePath)) {
      return false;
    }
    try {
      const fs = window.require('fs');
      return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
    } catch (error) {
      return false;
    }
  };

  const renameAudioFile = (oldPath, newPath) => {
    try {
      const fs = window.require('fs');
      if (fs.existsSync(oldPath) && oldPath !== newPath) {
        // Clear cache for both old and new paths
        clearUrlCache(oldPath);
        clearUrlCache(newPath);
        // Remove from deleted files if it was marked as deleted
        deletedFilesRef.current.delete(newPath);
        fs.renameSync(oldPath, newPath);
        return true;
      }
    } catch (error) {
      // console.error('Error renaming file:', error);
    }
    return false;
  };

  const clearPlayerState = () => {
    setCurrentUrl({});
    setTrigger('clear');
    setNewBlob(null);

    // Add a small delay to ensure the player processes the clear trigger
    setTimeout(() => {
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
    }, 50);
  };

  const verifyFileWritten = async (filePath, expectedSize = null) => {
    const fs = window.require('fs');
    const maxAttempts = 10;
    const delay = 100;

    const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

    const checkFile = async () => {
      try {
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
          // If we have an expected size, check if it matches (within 90% threshold)
            if (expectedSize && stats.size < expectedSize * 0.9) {
              return false;
            }
            // Additional verification - try to read the file
            try {
              fs.accessSync(filePath, fs.constants.R_OK);
              // Remove from deleted files set
              deletedFilesRef.current.delete(filePath);
              return true;
            } catch (accessError) {
              return false;
            }
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    // Use recursion instead of a loop to avoid 'await' inside a loop
    const tryCheckFile = async (attempt = 0) => {
      const result = await checkFile();
      if (result) {
        return true;
      }
      if (attempt < maxAttempts - 1) {
        await sleep(delay);
        return tryCheckFile(attempt + 1);
      }
      return false;
    };

    return tryCheckFile();
  };
  const saveAudio = async (blob, para) => {
    if (isSaving) { return false; }
    setIsSaving(true);

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
      const currentTake = currentTakeRef.current;

      const existingFiles = fs
        .readdirSync(storyFolder)
        .filter(
          (file) => file.startsWith(
            `${effectiveStoryIdRef.current}_${newStoryId}_`,
          ) && file.endsWith('.mp3'),
        );

      // More precise filtering for current take files
      const currentTakeFiles = existingFiles.filter((file) => {
        const fileName = path.parse(file).name;
        const parts = fileName.split('_');
        return parts.length >= 3 && parts[2] === currentTake.toString();
      });

      const isFirstRecording = existingFiles.length === 0;
      const isRerecordingExistingTake = currentTakeFiles.length > 0;

      // If we're re-recording an existing take, delete the old files first
      if (isRerecordingExistingTake) {
        currentTakeFiles.forEach((file) => {
          const oldFilePath = path.join(storyFolder, file);
          try {
            if (fs.existsSync(oldFilePath)) {
              clearUrlCache(oldFilePath);
              fs.unlinkSync(oldFilePath);
            }
          } catch (error) {
            // console.error('Error deleting old file:', error);
          }
        });

        // Wait a bit to ensure file system operations are complete
        await new Promise((resolve) => { setTimeout(resolve, 300); });
      }

      // Determine the new file name
      const baseFileName = `${effectiveStoryIdRef.current}_${newStoryId}_${currentTake}`;
      let fileName;

      if (isFirstRecording) {
        fileName = `${baseFileName}_default.mp3`;
      } else if (isRerecordingExistingTake) {
        const wasDefault = currentTakeFiles.some((file) => file.includes('_default.mp3'));
        fileName = wasDefault ? `${baseFileName}_default.mp3` : `${baseFileName}.mp3`;
      } else {
        fileName = `${baseFileName}.mp3`;
      }

      const filePath = path.join(storyFolder, fileName);

      // Clear any cached URL for this file path and increment cache version
      clearUrlCache(filePath);

      // Save the new file
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const expectedSize = buffer.length;

      fs.writeFileSync(filePath, buffer);

      // Store reference to last saved file for cache busting
      lastSavedFileRef.current = {
        filePath,
        timestamp: Date.now(),
        take: currentTake,
        paragraph: para,
      };

      // Verify the file was written successfully
      const fileWritten = await verifyFileWritten(filePath, expectedSize);

      if (!fileWritten) {
        return false;
      }

      // Force clear player state to ensure fresh load
      setTrigger('clear');

      return true;
    } catch (error) {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUrl = (paragraphId, specificTake = null) => {
    const newStoryId = paragraphId - 1;
    const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
    const audioData = audioContentRef.current?.[key];

    // Always clear current state first
    setNewBlob(null);
    setTrigger('clear');

    if (
      audioData
    && audioData.takes
    && Object.keys(audioData.takes).length > 0
    ) {
    // Determine which take to use
      let targetTake = specificTake || currentTakeRef.current || audioData.defaultTake || '1';

      // If the specific take doesn't exist, don't fallback to other takes
      if (specificTake && !audioData.takes[specificTake]) {
        clearPlayerState();
        return;
      }

      // If current take doesn't exist, use default take
      if (!audioData.takes[targetTake]) {
        targetTake = audioData.defaultTake || Object.keys(audioData.takes)[0];
      }

      const targetAudio = audioData.takes[targetTake];

      if (targetAudio && targetAudio.filePath && isFileAvailable(targetAudio.filePath)) {
        const playerCompatibleUrl = {
          verseNumber: paragraphId,
          paragraph: paragraphId ? paragraphId.toString() : '',
          storyNumber: effectiveStoryIdRef.current
            ? effectiveStoryIdRef.current.toString()
            : '',
          default: `take${targetTake}`,
          defaultTake: `take${targetTake}`,
          takes: {},
        };

        // Build takes object with cache-busted URLs
        Object.keys(audioData.takes).forEach((takeNumber) => {
          const takeKey = `take${takeNumber}`;
          const takeData = audioData.takes[takeNumber];

          // Skip if file is not available
          if (!isFileAvailable(takeData.filePath)) {
            return;
          }

          // Check if this is the file we just saved
          const isRecentlySaved = lastSavedFileRef.current
          && lastSavedFileRef.current.filePath === takeData.filePath
          && lastSavedFileRef.current.take === takeNumber
          && lastSavedFileRef.current.paragraph === paragraphId
          && (Date.now() - lastSavedFileRef.current.timestamp) < 10000;

          let fileUrl;
          if (isRecentlySaved) {
            fileUrl = getCacheBustedUrl(takeData.filePath, true);
          } else {
            fileUrl = getCacheBustedUrl(takeData.filePath);
          }

          playerCompatibleUrl[takeKey] = takeData.fileName;
          playerCompatibleUrl.takes[takeKey] = {
            ...takeData,
            url: fileUrl,
          };
        });

        // Only set URL if we have valid takes and the target take exists
        if (Object.keys(playerCompatibleUrl.takes).length > 0 && playerCompatibleUrl.takes[`take${targetTake}`]) {
        // Force a delay to ensure player resets before loading new audio
          setTimeout(() => {
            setCurrentUrl(playerCompatibleUrl);
            setTrigger('url');
          }, 100);
          return;
        }
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

          // Only include files that actually exist and are not marked as deleted
          if (!isFileAvailable(fullFilePath)) {
            return;
          }

          // Always use cache-busted URLs
          const fileUrl = getCacheBustedUrl(fullFilePath);

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

      // Trigger URL fetch after a short delay to ensure state updates
      if (selectedParagraphRef.current) {
        setTimeout(() => {
          fetchUrl(selectedParagraphRef.current, currentTakeRef.current);
        }, 100);
      }
    } catch (error) {
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
      const currentNewDefaultPath = path.join(folder, currentNewDefaultFile);
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

      // Clear player state before reloading
      setTrigger('clear');
      await new Promise((resolve) => { setTimeout(resolve, 200); resolve(); });
      await loadStoryAudio();
    } catch (error) {
      // console.error('Error changing default audio:', error);
    }
  };

  const handleDeleteAudio = async (para, takeValue) => {
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

      // Clear player state immediately
      setTrigger('clear');
      setCurrentUrl({});
      setNewBlob(null);

      if (fs.existsSync(defaultPath)) {
        clearUrlCache(defaultPath);
        fs.unlinkSync(defaultPath);
        deletedFilePath = defaultPath;
        wasDefault = true;
      } else if (fs.existsSync(regularPath)) {
        clearUrlCache(regularPath);
        fs.unlinkSync(regularPath);
        deletedFilePath = regularPath;
        wasDefault = false;
      } else {
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
            const currentFile = updatedTakes[newDefaultTakeNum].fileName;
            const currentPath = path.join(folder, currentFile);
            const newDefaultFileName = currentFile.replace('.mp3', '_default.mp3');
            const newDefaultPath = path.join(folder, newDefaultFileName);

            if (fs.existsSync(currentPath) && !currentFile.includes('_default')) {
              clearUrlCache(currentPath);
              clearUrlCache(newDefaultPath);
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

        // Wait longer to ensure file system operations are complete
        await new Promise((resolve) => { setTimeout(resolve, 500); });

        // Reload audio content
        await loadStoryAudio();

        // Handle take selection after deletion
        if (selectedParagraphRef.current === para) {
          const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
          const audioData = audioContentRef.current?.[key];
          if (audioData && audioData.takes) {
            const availableTakes = Object.keys(audioData.takes);
            if (availableTakes.length > 0) {
              if (!audioData.takes[currentTakeRef.current]) {
                const newTake = availableTakes[0];
                setTake(newTake);
                setTimeout(() => {
                  fetchUrl(selectedParagraphRef.current, newTake);
                }, 200);
              } else {
                setTimeout(() => {
                  fetchUrl(selectedParagraphRef.current, currentTakeRef.current);
                }, 200);
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
          // Force a complete reload with longer delays
          setTimeout(async () => {
            // Clear all caches first
            clearAllCache();
            await loadStoryAudio();
            // Force immediate URL fetch with additional delay
            setTimeout(() => {
              fetchUrl(para, currentTakeRef.current);
              setNewBlob(null);
            }, 400);
          }, 500);
        } else {
          setTimeout(() => {
            setNewBlob(null);
          }, 500);
        }
      } else {
        setNewBlob(blobUrl);
      }
    },
    [],
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
      // Clear all caches when story changes
      clearAllCache();
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
      setCurrentUrl({});
      setTrigger('clear');

      // Reset to take 1 when paragraph changes
      setTake('1');

      // Wait a bit before fetching to ensure state is cleared
      setTimeout(() => {
        fetchUrl(selectedParagraph, '1');
      }, 100);
    }
  }, [selectedParagraph, effectiveStoryId]);

  useEffect(() => {
    if (selectedParagraph && audioContent) {
    // Only fetch if we don't already have a valid URL for the current take
      const newStoryId = selectedParagraph - 1;
      const key = `story_${effectiveStoryIdRef.current}_${newStoryId}`;
      const audioData = audioContent[key];

      if (!audioData || !audioData.takes || !audioData.takes[currentTakeRef.current]) {
        const timeoutId = setTimeout(() => {
          fetchUrl(selectedParagraph, currentTakeRef.current);
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [audioContent]);
  useEffect(() => {
    if (selectedParagraph && take) {
    // Clear state immediately when take changes
      setNewBlob(null);
      setCurrentUrl({});
      setTrigger('clear');

      // Wait for clear to process, then fetch new URL
      setTimeout(() => {
        fetchUrl(selectedParagraph, take);
      }, 150);
    }
  }, [take]);

  const handleModalConfirm = () => {
    if (openModal.action === 'delete') {
      handleDeleteAudio(selectedParagraph, take);
    } else if (openModal.action === 'record') {
      setTrigger('record');
      startRecording();
    }
    setOpenModal({
      ...openModal,
      openModel: false,
      action: '',
    });
  };

  const audioFunctions = {
    fetchUrl,
    loadStoryAudio,
    changeDefault,
    startRecording: () => {
      if (selectedParagraph && !isSaving) {
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

          // Only update if it's actually different
          if (takeNum !== take) {
            // Clear current audio state first
            setNewBlob(null);
            setCurrentUrl({});
            setTrigger('clear');

            // Then set the new take
            setTake(takeNum);
          }
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
        isSaving={isSaving}
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
                  action: '',
                })}
                disabled={isDeleting || isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                disabled={isDeleting || isSaving}
                onClick={handleModalConfirm}
              >
                {(() => {
                  if (isDeleting) {
                    return 'Deleting...';
                  }
                  if (isSaving) {
                    return 'Saving...';
                  }
                  return openModal.buttonName;
                })()}
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
