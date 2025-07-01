import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext, useEffect } from 'react';
import ObsTextEditor from './ObsTextEditor';
import { getDetails } from './utils/getDetails';

const EditorPanel = ({ obsStory, storyUpdate, audioEnabled }) => {
  const {
    state: {
      storyId,
      updateWave,
      obsAudioContent,
      selectedParagraph,
      effectiveStoryId,
    },
    actions: {
      setUpdateWave,
      setObsAudioContent,
      setSelectedParagraph,
      setRecordingsPath,
      setEffectiveStoryId,
    },
  } = useContext(ReferenceContext);

  const calculatedEffectiveStoryId = storyId || (obsStory && obsStory[0] && obsStory[0].title.split('.')[0]);
  useEffect(() => {
    if (calculatedEffectiveStoryId && calculatedEffectiveStoryId !== effectiveStoryId) {
      setEffectiveStoryId(calculatedEffectiveStoryId);
    }
  }, [calculatedEffectiveStoryId, effectiveStoryId, setEffectiveStoryId]);

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

  const refreshAudioData = () => {
    loadStoryAudio();
  };

  useEffect(() => {
    if (effectiveStoryId && audioEnabled) {
      loadStoryAudio();
    }
  }, [effectiveStoryId, audioEnabled]);

  useEffect(() => {
    if (audioEnabled) {
      window.refreshAudioData = refreshAudioData;
    }
    return () => {
      if (window.refreshAudioData) {
        delete window.refreshAudioData;
      }
    };
  }, [audioEnabled, effectiveStoryId]);

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
      <div className="flex-1 ">
        <ObsTextEditor
          obsStory={obsStory}
          storyUpdate={storyUpdate}
          selectedParagraph={selectedParagraph}
          onParagraphClick={handleParagraphClick}
          onTitleClick={handleTitleClick}
          onEndClick={handleEndClick}
          effectiveStoryId={effectiveStoryId}
          audioEnabled={audioEnabled}
          audioContent={obsAudioContent}
        />
      </div>
    </div>
  );
};

EditorPanel.propTypes = {
  obsStory: PropTypes.array.isRequired,
  storyUpdate: PropTypes.func.isRequired,
  audioEnabled: PropTypes.bool,
};

export default EditorPanel;
