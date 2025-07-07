import PropTypes from 'prop-types';
import {
  useState, useCallback, useEffect, useContext,
} from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Player from '@/components/AudioRecorder/components/Player';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { getDetails } from './utils/getDetails';

const ObsAudioRecorder = ({
  isVisible = true,
  onAudioUpdate,
  autoLoadAudio = false,
}) => {
  const {
    state: {
      selectedParagraph,
      effectiveStoryId,
      recordingsPath,
      storyId,
      updateWave,
      audioEnabled,
      obsAudioContent,
    },
    actions: {
      setRecordingsPath,
      setEffectiveStoryId,
      setUpdateWave,
      setObsAudioContent,
    },
  } = useContext(ReferenceContext);

  const [currentUrl, setCurrentUrl] = useState('');
  const [newBlob, setNewBlob] = useState();
  const [take, setTake] = useState('take1');
  const [trigger, setTrigger] = useState('');
  const [model, setModel] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  // Internal audio loading function
  const loadStoryAudio = async () => {
    if (effectiveStoryId) {
      const fs = window.require('fs');
      const path = require('path');
      const { projectsDir } = await getDetails();

      const audioFolder = path.join(projectsDir, 'ingredients', 'audio');
      const storyFolder = path.join(audioFolder, effectiveStoryId.toString());

      setRecordingsPath(storyFolder);

      if (!fs.existsSync(audioFolder)) {
        fs.mkdirSync(audioFolder, { recursive: true });
      }
      if (!fs.existsSync(storyFolder)) {
        fs.mkdirSync(storyFolder, { recursive: true });
        setObsAudioContent({});
        return;
      }

      const files = fs.readdirSync(storyFolder).filter((file) => file.endsWith('.mp3'));
      const updatedContent = {};

      files.forEach((file) => {
        const name = path.parse(file).name;
        const parts = name.split('_');

        if (parts.length >= 3) {
          const [storyNum, paraNum, takeNum, ...rest] = parts;
          const isDefault = rest.includes('default');
          const key = `story_${storyNum}_${paraNum}`;

          if (!updatedContent[key]) {
            updatedContent[key] = {
              paragraph: paraNum,
              storyNumber: storyNum,
              verseNumber: parseInt(paraNum, 10),
              default: 'take1',
            };
          }

          const takeKey = `take${takeNum}`;
          updatedContent[key][takeKey] = file;

          if (isDefault) {
            updatedContent[key].default = takeKey;
          }
        }
      });

      setObsAudioContent(updatedContent);
      setUpdateWave(!updateWave);
    }
  };

  // Internal refresh function
  const internalRefreshAudioData = () => {
    loadStoryAudio();
  };

  // Use external refresh function if available, otherwise use internal
  const refreshAudioData = onAudioUpdate || internalRefreshAudioData;

  // Auto-load audio if enabled and effectiveStoryId changes
  useEffect(() => {
    if (autoLoadAudio && effectiveStoryId && audioEnabled) {
      loadStoryAudio();
    }
  }, [effectiveStoryId, autoLoadAudio, audioEnabled]);

  // Set effectiveStoryId if not set but storyId is available
  useEffect(() => {
    if (storyId && !effectiveStoryId) {
      setEffectiveStoryId(storyId);
    }
  }, [storyId, effectiveStoryId, setEffectiveStoryId]);

  const clearAudioState = () => {
    setNewBlob();
    setTrigger('');
    setCurrentUrl('');
    setTake('take1');
  };

  const fetchUrl = () => {
    const key = `story_${effectiveStoryId}_${parseInt(selectedParagraph, 10) - 1}`;

    const currentAudioContent = obsAudioContent;
    if (currentAudioContent && currentAudioContent[key]) {
      const audioData = currentAudioContent[key];
      const currentTake = audioData[take];
      setCurrentUrl({
        ...audioData,
        currentTake: currentTake || null,
        filePath: recordingsPath,
      });

      if (currentTake) {
        setTrigger('url');
      } else {
        setTrigger('');
      }
    } else {
      setCurrentUrl('');
      setTrigger('');
    }
  };

  useEffect(() => {
    const currentAudioContent = obsAudioContent;
    if (audioEnabled && currentAudioContent && Object.keys(currentAudioContent).length > 0) {
      fetchUrl();
    }
  }, [obsAudioContent, selectedParagraph, take, recordingsPath, audioEnabled]);

  const changeDefault = (value) => {
    const takeValue = typeof value === 'string' ? value : `take${value}`;
    const fs = window.require('fs');
    const path = require('path');
    const takeNum = takeValue.replace('take', '');
    const newStoryId = parseInt(selectedParagraph, 10) - 1;

    const currentFile = `${effectiveStoryId}_${newStoryId}_${takeNum}.mp3`;
    const defaultFile = `${effectiveStoryId}_${newStoryId}_${takeNum}_default.mp3`;

    if (
      fs.existsSync(path.join(recordingsPath, currentFile))
      || fs.existsSync(path.join(recordingsPath, defaultFile))
    ) {
      let i = 1;
      while (i < 4) {
        const existingDefault = `${effectiveStoryId}_${newStoryId}_${i}_default.mp3`;
        const existingDefaultPath = path.join(recordingsPath, existingDefault);

        if (fs.existsSync(existingDefaultPath)) {
          if (i !== parseInt(takeNum, 10)) {
            const newOldPath = path.join(
              recordingsPath,
              `${effectiveStoryId}_${newStoryId}_${i}.mp3`,
            );
            fs.renameSync(existingDefaultPath, newOldPath);
            const currentPath = path.join(
              recordingsPath,
              `${effectiveStoryId}_${newStoryId}_${takeNum}.mp3`,
            );
            const newDefaultPath = path.join(
              recordingsPath,
              `${effectiveStoryId}_${newStoryId}_${takeNum}_default.mp3`,
            );
            if (fs.existsSync(currentPath)) {
              fs.renameSync(currentPath, newDefaultPath);
            }
          }
          break;
        }
        i += 1;
      }
      refreshAudioData();
    }
  };

  const saveAudio = (blob) => {
    getDetails()
      .then(({ path }) => {
        const fs = window.require('fs');
        const takeNum = take.replace(/take/g, '');
        const newStoryId = parseInt(selectedParagraph, 10) - 1;

        const folderFiles = fs.readdirSync(recordingsPath);
        const existingFiles = folderFiles.filter((w) => w.match(`^${effectiveStoryId}_${newStoryId}_`));

        let filePath;
        if (existingFiles.length > 0) {
          const defaultFile = `${effectiveStoryId}_${newStoryId}_${takeNum}_default.mp3`;
          const regularFile = `${effectiveStoryId}_${newStoryId}_${takeNum}.mp3`;

          if (fs.existsSync(path.join(recordingsPath, defaultFile))) {
            filePath = path.join(recordingsPath, defaultFile);
          } else {
            filePath = path.join(recordingsPath, regularFile);
          }
        } else {
          filePath = path.join(recordingsPath, `${effectiveStoryId}_${newStoryId}_${takeNum}_default.mp3`);
        }

        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        const fileReader = new FileReader();
        // eslint-disable-next-line func-names
        fileReader.onload = function () {
          // eslint-disable-next-line react/no-this-in-sfc
          fs.writeFile(filePath, Buffer.from(new Uint8Array(this.result)), (err) => {
            if (!err) {
              refreshAudioData();
            }
          });
        };
        fileReader.readAsArrayBuffer(blob);
      });
  };

  const playRecordingFeedback = useCallback(
    async (blobUrl, blob) => {
      setNewBlob(blobUrl);
      saveAudio(blob);
    },
    [effectiveStoryId, selectedParagraph, take, recordingsPath],
  );

  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useReactMediaRecorder({
    audio: true,
    onStop: playRecordingFeedback,
    blobPropertyBag: { type: 'audio/mp3' },
  });

  const handleFunction = () => {
    if (trigger === 'delete') {
      const fs = window.require('fs');
      const path = require('path');
      const takeNum = take.replace(/take/g, '');
      const newStoryId = parseInt(selectedParagraph, 10) - 1;
      const key = `story_${effectiveStoryId}_${newStoryId}`;

      const defaultFile = `${effectiveStoryId}_${newStoryId}_${takeNum}_default.mp3`;
      const regularFile = `${effectiveStoryId}_${newStoryId}_${takeNum}.mp3`;
      const defaultPath = path.join(recordingsPath, defaultFile);
      const regularPath = path.join(recordingsPath, regularFile);

      if (fs.existsSync(defaultPath)) {
        let i = 1;
        while (i < 4) {
          if (i !== parseInt(takeNum, 10)) {
            const otherFile = `${effectiveStoryId}_${newStoryId}_${i}.mp3`;
            const otherPath = path.join(recordingsPath, otherFile);
            if (fs.existsSync(otherPath)) {
              const newDefaultPath = path.join(recordingsPath, `${effectiveStoryId}_${newStoryId}_${i}_default.mp3`);
              fs.renameSync(otherPath, newDefaultPath);
              break;
            }
          }
          i += 1;
        }
        fs.unlinkSync(defaultPath);
      } else if (fs.existsSync(regularPath)) {
        fs.unlinkSync(regularPath);
      }

      const currentAudioContent = obsAudioContent;
      const updatedAudioContent = { ...currentAudioContent };
      if (updatedAudioContent[key]) {
        delete updatedAudioContent[key][`take${takeNum}`];

        const hasAnyTakes = ['take1', 'take2', 'take3'].some((takeKey) => updatedAudioContent[key][takeKey]);
        if (!hasAnyTakes) {
          delete updatedAudioContent[key];
        }
      }
      setObsAudioContent(updatedAudioContent);

      setTrigger('');
      setNewBlob();

      if (take === `take${takeNum}`) {
        setCurrentUrl('');
      }

      refreshAudioData();
    } else {
      setTrigger('record');
    }
  };

  useEffect(() => {
    clearAudioState();
    if (audioEnabled) {
      fetchUrl();
    }
  }, [selectedParagraph, effectiveStoryId, audioEnabled]);

  // Return null if audio is disabled or not visible
  if (!isVisible || !audioEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <Player
        url={currentUrl || {}}
        blobUrl={newBlob}
        setBlobUrl={setNewBlob}
        startRecording={startRecording}
        stopRecording={stopRecording}
        pauseRecording={pauseRecording}
        resumeRecording={resumeRecording}
        take={take}
        setTake={setTake}
        changeDefault={(v) => changeDefault(v)}
        trigger={trigger}
        setTrigger={(v) => setTrigger(v)}
        setOpenModal={(v) => setModel(v)}
        location={recordingsPath || ''}
      />
      <ConfirmationModal
        openModal={model.openModel}
        setOpenModal={(open) => setModel((prev) => ({ ...prev, openModel: open }))}
        title={model.title}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={handleFunction}
      />
    </div>
  );
};

ObsAudioRecorder.propTypes = {
  isVisible: PropTypes.bool,
  onAudioUpdate: PropTypes.func,
  autoLoadAudio: PropTypes.bool,
};

export default ObsAudioRecorder;
