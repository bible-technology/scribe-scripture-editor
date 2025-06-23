import PropTypes from 'prop-types';
import {
  useState, useCallback, useEffect,
} from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import Player from '@/components/AudioRecorder/components/Player';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { getDetails } from './utils/getDetails';

const ObsAudioRecorder = ({
  selectedParagraph,
  effectiveStoryId,
  isVisible = true,
  audioContent,
  recordingsPath,
  onAudioUpdate,
  onAudioContentUpdate,
}) => {
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

  const clearAudioState = () => {
    setNewBlob();
    setTrigger('');
    setTake('take1');
  };

  const fetchUrl = () => {
    const key = `story_${effectiveStoryId}_${parseInt(selectedParagraph, 10) - 1}`;

    if (audioContent[key]) {
      const audioData = audioContent[key];
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
    if (audioContent && Object.keys(audioContent).length > 0) {
      fetchUrl();
    }
  }, [audioContent, selectedParagraph, take, recordingsPath]);

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
      onAudioUpdate();
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
              onAudioUpdate();
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

      const updatedAudioContent = { ...audioContent };
      if (updatedAudioContent[key]) {
        delete updatedAudioContent[key][`take${takeNum}`];

        const hasAnyTakes = ['take1', 'take2', 'take3'].some((takeKey) => updatedAudioContent[key][takeKey]);
        if (!hasAnyTakes) {
          delete updatedAudioContent[key];
        }
      }
      onAudioContentUpdate(updatedAudioContent);

      setTrigger('');
      setNewBlob();

      if (take === `take${takeNum}`) {
        setCurrentUrl('');
      }

      onAudioUpdate();
    } else {
      setTrigger('record');
    }
  };

  useEffect(() => {
    clearAudioState();
  }, [selectedParagraph]);

  useEffect(() => {
    clearAudioState();
  }, [effectiveStoryId]);

  if (!isVisible) {
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
  selectedParagraph: PropTypes.number,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isVisible: PropTypes.bool,
  audioContent: PropTypes.object,
  recordingsPath: PropTypes.string,
  onAudioUpdate: PropTypes.func.isRequired,
  onAudioContentUpdate: PropTypes.func.isRequired,
};

export default ObsAudioRecorder;
