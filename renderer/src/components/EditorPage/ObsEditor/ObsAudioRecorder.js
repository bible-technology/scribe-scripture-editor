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
    state: {
      audioContent,
      updateWave,
    },
    actions: {
      setAudioContent,
      setUpdateWave,
    },
  } = useContext(ReferenceContext);

  const [currentUrl, setCurrentUrl] = useState('');
  const [newBlob, setNewBlob] = useState();
  const [take, setTake] = useState('1');
  const [trigger, setTrigger] = useState('');
  const [recordingsPath, setRecordingsPath] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  // Add modal state
  const [openModal, setOpenModal] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  // Use refs to avoid stale closures
  const audioContentRef = useRef(audioContent);
  const selectedParagraphRef = useRef(selectedParagraph);
  const effectiveStoryIdRef = useRef(effectiveStoryId);

  // Update refs when values change
  useEffect(() => {
    audioContentRef.current = audioContent;
  }, [audioContent]);

  useEffect(() => {
    selectedParagraphRef.current = selectedParagraph;
  }, [selectedParagraph]);

  useEffect(() => {
    effectiveStoryIdRef.current = effectiveStoryId;
  }, [effectiveStoryId]);

  // Helper function to rename files when default changes
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

  const saveAudio = async (blob, para) => {
    try {
      if (!blob || !para) {
        return false;
      }

      const { projectsDir, path } = await getDetails();
      const fs = window.require('fs');

      // New folder structure: ingredients/audio/{storyNum}/
      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(audioFolder, effectiveStoryIdRef.current.toString());

      // Ensure directories exist
      if (!fs.existsSync(audioFolder)) {
        fs.mkdirSync(audioFolder, { recursive: true });
      }
      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
      }

      // Check if this is the first recording for this paragraph by checking existing files
      const existingFiles = fs.readdirSync(storyFolder)
        .filter((file) => file.startsWith(`${effectiveStoryIdRef.current}_${para}_`) && file.endsWith('.mp3'));
      const isFirstRecording = existingFiles.length === 0;

      // New filename format: {storyNum}_{para}_{take}_default.mp3 or {storyNum}_{para}_{take}.mp3
      const baseFileName = `${effectiveStoryIdRef.current}_${para}_${take}`;
      const fileName = isFirstRecording ? `${baseFileName}_default.mp3` : `${baseFileName}.mp3`;
      const filePath = path.join(storyFolder, fileName);

      // Convert blob to buffer and save
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);

      // Verify file was created
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

  const fetchUrl = (paragraphId) => {
    const key = `story_${effectiveStoryIdRef.current}_${paragraphId}`;
    const audioData = audioContentRef.current?.[key];
    setNewBlob(null);

    if (audioData && audioData.takes && Object.keys(audioData.takes).length > 0) {
      const defaultTake = audioData.defaultTake || '1';
      const defaultAudio = audioData.takes[defaultTake];

      if (defaultAudio && defaultAudio.filePath) {
        // Create Player-compatible URL structure
        const playerCompatibleUrl = {
          verseNumber: paragraphId,
          paragraph: paragraphId ? paragraphId.toString() : '',
          storyNumber: effectiveStoryIdRef.current ? effectiveStoryIdRef.current.toString() : '',
          default: `take${defaultTake}`,
          defaultTake: `take${defaultTake}`,
          // Add individual take properties that Player expects
          take1: audioData.takes['1'] ? audioData.takes['1'].fileName : undefined,
          take2: audioData.takes['2'] ? audioData.takes['2'].fileName : undefined,
          take3: audioData.takes['3'] ? audioData.takes['3'].fileName : undefined,
          // Add takes object for the new logic in Player
          takes: {},
        };

        // Convert all takes to Player's expected format
        Object.keys(audioData.takes).forEach((takeNum) => {
          const takeKey = `take${takeNum}`;
          const takeData = audioData.takes[takeNum];

          // Set the takeX property for legacy compatibility
          playerCompatibleUrl[takeKey] = takeData.fileName;

          // Set the takes object for new logic
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

    // Default empty structure when no audio exists
    setCurrentUrl({
      paragraph: paragraphId ? paragraphId.toString() : '',
      storyNumber: effectiveStoryIdRef.current ? effectiveStoryIdRef.current.toString() : '',
      verseNumber: paragraphId,
      takes: {},
      default: 'take1',
      defaultTake: 'take1',
    });
    setTrigger('');
  };

  const loadStoryAudio = async () => {
    try {
      const fs = window.require('fs');
      const path = window.require('path');

      const { projectsDir } = await getDetails();
      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(audioFolder, effectiveStoryIdRef.current.toString());

      setRecordingsPath(storyFolder);

      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
        return;
      }

      const files = fs.readdirSync(storyFolder).filter((file) => file.endsWith('.mp3'));
      const updatedContent = {};

      // Process files and create structure
      files.forEach((file) => {
        const name = path.parse(file).name;
        const parts = name.split('_');

        // Parse filename: {storyNum}_{para}_{take}_default or {storyNum}_{para}_{take}
        if (parts.length >= 3) {
          const [storyNum, paraNum, takeNum, ...rest] = parts;
          const isDefault = rest.includes('default');

          const key = `story_${storyNum}_${paraNum}`;
          const fullFilePath = path.join(storyFolder, file);
          const fileUrl = `file://${fullFilePath.replace(/\\/g, '/')}`;

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

          // Store with simple number
          updatedContent[key].takes[takeNum] = {
            fileName: file,
            filePath: fullFilePath,
            url: fileUrl,
            isDefault,
          };

          // Set default based on filename
          if (isDefault) {
            updatedContent[key].defaultTake = takeNum;
            updatedContent[key].default = `take${takeNum}`;
          }

          // For Player compatibility, also store as takeX
          updatedContent[key][`take${takeNum}`] = file;
        }
      });

      // Ensure default is set for each paragraph
      Object.keys(updatedContent).forEach((key) => {
        if (!updatedContent[key].default) {
          const takeKeys = Object.keys(updatedContent[key].takes).sort();
          if (takeKeys.length > 0) {
            updatedContent[key].defaultTake = takeKeys[0];
            updatedContent[key].default = `take${takeKeys[0]}`;
          }
        }
      });

      setAudioContent(updatedContent);
      setUpdateWave(!updateWave);

      // Update current URL if we're viewing the same paragraph
      if (selectedParagraphRef.current) {
        setTimeout(() => {
          fetchUrl(selectedParagraphRef.current);
        }, 100);
      }
    } catch (error) {
      // console.error('Error loading story audio:', error);
    }
  };

  // Fix the changeDefault function parameter handling
  const changeDefault = async (para, takeValue) => {
    try {
      // takeValue comes from Player as number (1, 2, 3), but sometimes as takeX string
      // Normalize it to a number string
      let newDefaultTake;
      if (typeof takeValue === 'string' && takeValue.startsWith('take')) {
        newDefaultTake = takeValue.replace('take', '');
      } else {
        newDefaultTake = takeValue.toString();
      }

      const folder = recordingsPath;
      const { path } = await getDetails();
      const fs = window.require('fs');

      // Get existing files to determine current default
      const files = fs.readdirSync(folder).filter((file) => file.startsWith(`${effectiveStoryIdRef.current}_${para}_`) && file.endsWith('.mp3'));

      let currentDefault = '1';
      files.forEach((file) => {
        if (file.includes('_default.mp3')) {
          const parts = file.split('_');
          if (parts.length >= 3) {
            currentDefault = parts[2]; // Take number
          }
        }
      });

      // If it's already the default, do nothing
      if (currentDefault === newDefaultTake) { return; }

      // Rename files: remove _default from old default, add _default to new default
      const oldDefaultFile = `${effectiveStoryIdRef.current}_${para}_${currentDefault}_default.mp3`;
      const oldDefaultPath = path.join(folder, oldDefaultFile);
      const newOldDefaultFile = `${effectiveStoryIdRef.current}_${para}_${currentDefault}.mp3`;
      const newOldDefaultPath = path.join(folder, newOldDefaultFile);

      const currentNewDefaultFile = `${effectiveStoryIdRef.current}_${para}_${newDefaultTake}.mp3`;
      const currentNewDefaultPath = path.join(folder, currentNewDefaultFile);
      const newDefaultFile = `${effectiveStoryIdRef.current}_${para}_${newDefaultTake}_default.mp3`;
      const newDefaultPath = path.join(folder, newDefaultFile);

      // Rename old default (remove _default)
      if (fs.existsSync(oldDefaultPath)) {
        renameAudioFile(oldDefaultPath, newOldDefaultPath);
      }

      // Rename new default (add _default)
      if (fs.existsSync(currentNewDefaultPath)) {
        renameAudioFile(currentNewDefaultPath, newDefaultPath);
      }

      // Update local audio content
      const key = `story_${effectiveStoryIdRef.current}_${para}`;
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

      // Reload audio content to ensure everything is in sync
      await loadStoryAudio();
    } catch (error) {
      // console.error('Error changing default audio:', error);
    }
  };

  const handleDeleteAudio = async (para, takeValue) => {
    try {
      const fs = window.require('fs');
      const { path } = await getDetails();

      // Normalize take value
      let takeNum;
      if (typeof takeValue === 'string' && takeValue.startsWith('take')) {
        takeNum = takeValue.replace('take', '');
      } else {
        takeNum = takeValue.toString();
      }

      const folder = recordingsPath;

      // Find the file to delete (could be with or without _default)
      const defaultFile = `${effectiveStoryIdRef.current}_${para}_${takeNum}_default.mp3`;
      const regularFile = `${effectiveStoryIdRef.current}_${para}_${takeNum}.mp3`;

      const defaultPath = path.join(folder, defaultFile);
      const regularPath = path.join(folder, regularFile);

      let deletedFilePath = null;
      let wasDefault = false;

      // Check which file exists and delete it
      if (fs.existsSync(defaultPath)) {
        fs.unlinkSync(defaultPath);
        deletedFilePath = defaultPath;
        wasDefault = true;
      } else if (fs.existsSync(regularPath)) {
        fs.unlinkSync(regularPath);
        deletedFilePath = regularPath;
        wasDefault = false;
      }

      if (deletedFilePath) {
        // If we deleted the default, make another take the default
        if (wasDefault) {
          const files = fs.readdirSync(folder)
            .filter((file) => file.startsWith(`${effectiveStoryIdRef.current}_${para}_`) && file.endsWith('.mp3'))
            .filter((file) => !file.includes(`_${takeNum}_`)); // Exclude the deleted take

          if (files.length > 0) {
            // Get the first available take and make it default
            const firstFile = files[0];
            const parts = firstFile.split('_');
            if (parts.length >= 3) {
              const newDefaultTake = parts[2];
              const oldPath = path.join(folder, firstFile);
              const newPath = path.join(folder, `${effectiveStoryIdRef.current}_${para}_${newDefaultTake}_default.mp3`);

              if (fs.existsSync(oldPath)) {
                fs.renameSync(oldPath, newPath);
              }
            }
          }
        }

        // Reload audio content and update UI
        await loadStoryAudio();

        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  const playRecordingFeedback = useCallback(
    async (blobUrl, blob, para) => {
      setIsRecording(false);
      if (para && blob) {
        setNewBlob(blobUrl);

        const saveSuccess = await saveAudio(blob, para);

        if (saveSuccess) {
          // Reload audio content immediately
          await loadStoryAudio();

          // Clear the blob after a short delay
          setTimeout(() => {
            setNewBlob(null);
          }, 500);
        }
      } else {
        setNewBlob(blobUrl);
      }
    },
    [take], // Only depend on take, not on functions that might cause re-renders
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
        playRecordingFeedback(blobUrl, blob, selectedParagraphRef.current);
      }, 100);
    },
    blobPropertyBag: { type: 'audio/mp3' },
  });

  // Load audio when story changes
  useEffect(() => {
    if (effectiveStoryId) {
      loadStoryAudio();
    }
  }, [effectiveStoryId]);

  // Reset take when audio content changes
  useEffect(() => {
    if (audioContent && Object.keys(audioContent).length > 0) {
      if (!take || !/^\d+$/.test(take)) {
        setTake('1');
      }
    }
  }, [audioContent, take]);

  // Update audio URL when selected paragraph changes
  useEffect(() => {
    if (selectedParagraph && effectiveStoryId) {
      setNewBlob(null);
      setTrigger('');
      setTake('1');
      fetchUrl(selectedParagraph);
    }
  }, [selectedParagraph, effectiveStoryId]);

  // Separate effect to handle audio content changes for current paragraph
  useEffect(() => {
    if (selectedParagraph && audioContent) {
      // Small delay to ensure all state updates are complete
      const timeoutId = setTimeout(() => {
        fetchUrl(selectedParagraph);
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [audioContent]);

  // Expose functions for parent component
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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <Player
        url={currentUrl || {}}
        blobUrl={newBlob}
        setBlobUrl={setNewBlob}
        startRecording={audioFunctions.startRecording}
        stopRecording={stopRecording}
        pauseRecording={pauseRecording}
        resumeRecording={resumeRecording}
        take={`take${take}`} // Convert number to takeX format for Player
        setTake={(takeValue) => {
          // Convert takeX back to number
          const takeNum = takeValue.replace('take', '');
          setTake(takeNum);
        }}
        changeDefault={(v) => changeDefault(selectedParagraph, v)}
        setOpenModal={setOpenModal} // Add this line
        trigger={trigger}
        setTrigger={(v) => setTrigger(v)}
        location={recordingsPath || ''}
        isRecording={isRecording}
        recordingStatus={status}
        selectedParagraph={selectedParagraph}
      />

      {/* Add Modal Component - You'll need to create or import your modal component */}
      {openModal.openModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{openModal.title}</h3>
            <p className="mb-6">{openModal.confirmMessage}</p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setOpenModal({ ...openModal, openModel: false })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => {
                  // Handle the action based on the trigger
                  if (trigger === 'delete') {
                    // Use the local delete function since we need the specific file handling logic
                    handleDeleteAudio(selectedParagraph, take);
                  } else {
                    // Handle re-record
                    setTrigger('record');
                    setIsRecording(true);
                  }
                  setOpenModal({ ...openModal, openModel: false });
                }}
              >
                {openModal.buttonName}
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
