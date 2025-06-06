import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import {
  useContext, useEffect, useState, useCallback,
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
      const storyFolder = path.join(audioFolder, effectiveStoryId.toString());

      // Ensure directories exist
      if (!fs.existsSync(audioFolder)) {
        fs.mkdirSync(audioFolder, { recursive: true });
      }
      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
      }

      // Check if this is the first recording for this paragraph by checking existing files
      const existingFiles = fs.readdirSync(storyFolder)
        .filter((file) => file.startsWith(`${effectiveStoryId}_${para}_`) && file.endsWith('.mp3'));
      const isFirstRecording = existingFiles.length === 0;

      // New filename format: {storyNum}_{para}_{take}_default.mp3 or {storyNum}_{para}_{take}.mp3
      const baseFileName = `${effectiveStoryId}_${para}_${take}`;
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

  // Fix the fetchUrl function to work with new format
  const fetchUrl = (paragraphId) => {
    const key = `story_${effectiveStoryId}_${paragraphId}`;
    const audioData = audioContent?.[key];
    setNewBlob(null);

    if (audioData && audioData.takes && Object.keys(audioData.takes).length > 0) {
      const defaultTake = audioData.defaultTake || '1';
      const defaultAudio = audioData.takes[defaultTake];
      if (defaultAudio && defaultAudio.filePath) {
        const fileUrl = `file://${defaultAudio.filePath.replace(/\\/g, '/')}`;

        // Create URL structure compatible with Player (converting numbers to takeX format for Player)
        const urlData = {
          ...audioData,
          [`take${defaultTake}`]: defaultAudio.fileName,
          default: `take${defaultTake}`,
          verseNumber: paragraphId,
          currentTakeData: defaultAudio,
          currentTake: `take${defaultTake}`,
          activeAudioUrl: fileUrl,
          takes: {},
        };

        // Convert all takes to takeX format for Player compatibility
        Object.keys(audioData.takes).forEach((takeNum) => {
          const takeKey = `take${takeNum}`;
          urlData[takeKey] = audioData.takes[takeNum].fileName;
          urlData.takes[takeKey] = {
            ...audioData.takes[takeNum],
            url: `file://${audioData.takes[takeNum].filePath.replace(/\\/g, '/')}`,
          };
        });

        setCurrentUrl(urlData);
        setTrigger('url');
        return;
      }
    }
    setCurrentUrl({
      paragraph: paragraphId ? paragraphId.toString() : '',
      storyNumber: effectiveStoryId ? effectiveStoryId.toString() : '',
      takes: {},
      defaultTake: 'take1',
      verseNumber: paragraphId,
    });
    setTrigger('');
  };

  // Updated loadStoryAudio function
  const loadStoryAudio = async () => {
    try {
      const fs = window.require('fs');
      const path = window.require('path');

      const { projectsDir } = await getDetails();
      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(audioFolder, effectiveStoryId.toString());

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
    } catch (error) {
      // console.error('Error loading story audio:', error);
    }
  };

  const playRecordingFeedback = useCallback(
    async (blobUrl, blob, para) => {
      setIsRecording(false);
      if (para && blob) {
        setNewBlob(blobUrl);

        const saveSuccess = await saveAudio(blob, para);

        if (saveSuccess) {
          await loadStoryAudio();
          setTimeout(() => {
            setNewBlob(null);
            fetchUrl(para);
          }, 1000);
        }
      } else {
        setNewBlob(blobUrl);
      }
    },
    [effectiveStoryId, take, recordingsPath],
  );

  const changeDefault = async (para, takeValue) => {
    try {
      // takeValue comes from Player as number (1, 2, 3)
      const newDefaultTake = takeValue.toString();
      const folder = recordingsPath;
      const { path } = await getDetails();
      const fs = window.require('fs');

      // Get existing files to determine current default
      const files = fs.readdirSync(folder).filter((file) => file.startsWith(`${effectiveStoryId}_${para}_`) && file.endsWith('.mp3'));

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
      const oldDefaultFile = `${effectiveStoryId}_${para}_${currentDefault}_default.mp3`;
      const oldDefaultPath = path.join(folder, oldDefaultFile);
      const newOldDefaultFile = `${effectiveStoryId}_${para}_${currentDefault}.mp3`;
      const newOldDefaultPath = path.join(folder, newOldDefaultFile);

      const currentNewDefaultFile = `${effectiveStoryId}_${para}_${newDefaultTake}.mp3`;
      const currentNewDefaultPath = path.join(folder, currentNewDefaultFile);
      const newDefaultFile = `${effectiveStoryId}_${para}_${newDefaultTake}_default.mp3`;
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
      const key = `story_${effectiveStoryId}_${para}`;
      if (audioContent[key]) {
        const updatedContent = {
          ...audioContent,
          [key]: {
            ...audioContent[key],
            defaultTake: newDefaultTake,
            default: `take${newDefaultTake}`,
          },
        };
        setAudioContent(updatedContent);

        if (selectedParagraph === para) {
          setTimeout(() => {
            fetchUrl(para);
          }, 100);
        }
      }

      // Reload audio content to ensure everything is in sync
      await loadStoryAudio();
    } catch (error) {
      // console.error('Error changing default audio:', error);
    }
  };

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
        playRecordingFeedback(blobUrl, blob, selectedParagraph);
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
  }, [audioContent]);

  // Update audio URL when selected paragraph changes
  useEffect(() => {
    if (selectedParagraph && effectiveStoryId) {
      setNewBlob(null);
      setTrigger('');
      setTake('1');
      fetchUrl(selectedParagraph);
    }
  }, [selectedParagraph, effectiveStoryId]);

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
        trigger={trigger}
        setTrigger={(v) => setTrigger(v)}
        location={recordingsPath || ''}
        isRecording={isRecording}
        recordingStatus={status}
        selectedParagraph={selectedParagraph}
      />
    </div>
  );
};

ObsAudioRecorder.propTypes = {
  selectedParagraph: PropTypes.number,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isVisible: PropTypes.bool,
};

export default ObsAudioRecorder;
