import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext, useState } from 'react';
import dynamic from 'next/dynamic';
import ObsTextEditor from './ObsTextEditor';

const ObsAudioRecorder = dynamic(() => import('./ObsAudioRecorder'), { ssr: false });

const EditorPanel = ({ obsStory, storyUpdate, audioEnabled }) => {
  const {
    state: { storyId },
  } = useContext(ReferenceContext);

  const effectiveStoryId = storyId || (obsStory && obsStory[0] && obsStory[0].title.split('.')[0]);

  const [selectedParagraph, setSelectedParagraph] = useState(1);

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
        />
      </div>

      {audioEnabled && (
        <ObsAudioRecorder
          selectedParagraph={selectedParagraph}
          effectiveStoryId={effectiveStoryId}
          isVisible={audioEnabled}
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
