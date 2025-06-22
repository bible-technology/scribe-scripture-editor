import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ObsTextEditor from './ObsTextEditor';
import { getDetails } from './utils/getDetails';

const ObsAudioRecorder = dynamic(() => import('./ObsAudioRecorder'), { ssr: false });

const EditorPanel = ({ obsStory, storyUpdate, audioEnabled }) => {
  const {
    state: { storyId, updateWave },
    actions: { setUpdateWave },
  } = useContext(ReferenceContext);

  const effectiveStoryId = storyId || (obsStory && obsStory[0] && obsStory[0].title.split('.')[0]);
  const [selectedParagraph, setSelectedParagraph] = useState(1);
  const [audioContent, setAudioContent] = useState({});
  const [recordingsPath, setRecordingsPath] = useState('');

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
        setAudioContent({});
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

      setAudioContent(updatedContent);
      setUpdateWave(!updateWave);
    }
  };

  const refreshAudioData = () => {
    loadStoryAudio();
  };

  useEffect(() => {
    if (effectiveStoryId && audioEnabled) {
      loadStoryAudio();
    }
  }, [effectiveStoryId, audioEnabled]);

  const handleParagraphClick = (storyItem) => {
    if ('text' in storyItem) {
      setSelectedParagraph(storyItem.id);
    }
  };

  const handleTitleClick = (storyItem) => {
    setSelectedParagraph(storyItem.id);
  };

  const handleEndClick = (storyItem) => {
    setSelectedParagraph(storyItem.id);
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className={`flex-1 ${audioEnabled ? 'pb-20' : ''}`}>
        <ObsTextEditor
          obsStory={obsStory}
          storyUpdate={storyUpdate}
          selectedParagraph={selectedParagraph}
          onParagraphClick={handleParagraphClick}
          onTitleClick={handleTitleClick}
          onEndClick={handleEndClick}
          effectiveStoryId={effectiveStoryId}
          audioEnabled={audioEnabled}
          audioContent={audioContent}
        />
      </div>
      {audioEnabled && (
        <ObsAudioRecorder
          selectedParagraph={selectedParagraph}
          effectiveStoryId={effectiveStoryId}
          isVisible={audioEnabled}
          audioContent={audioContent}
          recordingsPath={recordingsPath}
          onAudioUpdate={refreshAudioData}
        />
      )}
    </div>
  );
};

EditorPanel.propTypes = {
  obsStory: PropTypes.array.isRequired,
  storyUpdate: PropTypes.func.isRequired,
  audioEnabled: PropTypes.bool,
};

export default EditorPanel;
