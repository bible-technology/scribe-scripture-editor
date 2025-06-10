import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

// Simplified AudioIndicator - only shows when audio exists
const AudioIndicator = ({ storyId, effectiveStoryId, audioContent }) => {
  if (!audioContent || !effectiveStoryId) { return null; }

  const key = `story_${effectiveStoryId}_${storyId}`;
  const audioData = audioContent[key];
  const hasAudio = audioData && audioData.takes && Object.keys(audioData.takes).length > 0;

  if (!hasAudio) { return null; }

  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
      <SpeakerWaveIcon className="w-3 h-3" />
    </div>
  );
};

AudioIndicator.propTypes = {
  storyId: PropTypes.number.isRequired,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  audioContent: PropTypes.object,
};

const TextEditor = ({
  obsStory,
  storyUpdate,
  selectedParagraph,
  onParagraphClick,
  onTitleClick,
  onEndClick,
  effectiveStoryId,
  audioEnabled = false,
}) => {
  const {
    state: {
      selectedFont,
      editorFontSize,
      audioContent,
    },
    actions: {
      setSelectedStory,
    },
  } = useContext(ReferenceContext);

  const { states: { scrollLock } } = useContext(ProjectContext);
  const { t } = useTranslation();

  const handleChange = (e) => {
    const index = e.target.getAttribute('data-id');
    const value = e.target.value.replace(/\n|\r/g, '');
    const story = obsStory[index - 1];
    let newStory = {};

    if ('title' in story) {
      newStory = { id: story.id, title: value };
    } else if ('text' in story) {
      newStory = { id: story.id, img: story.img, text: value };
    } else if ('end' in story) {
      newStory = { id: story.id, end: value };
    }

    const updatedStories = obsStory.map((s) => (s.id !== newStory.id ? s : newStory));
    storyUpdate(updatedStories);
  };

  const avoidEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  const handleOnFocus = (status, e) => {
    const element = e.target;
    if (status) {
      adjustTextareaHeight(element);
    } else {
      element.style.height = '58px';
    }
  };

  const handleAutoHeight = (e) => {
    adjustTextareaHeight(e.target);
  };

  const handleParagraphClick = (storyItem) => {
    if ('text' in storyItem) {
      setSelectedStory(scrollLock ? 0 : storyItem.id);
      if (onParagraphClick) {
        onParagraphClick(storyItem);
      }
    }
  };

  const handleTitleClick = (storyItem) => {
    setSelectedStory(scrollLock ? 0 : storyItem.id);
    if (onTitleClick) {
      onTitleClick(storyItem);
    }
  };

  const handleEndClick = (storyItem) => {
    setSelectedStory(scrollLock ? 0 : storyItem.id);
    if (onEndClick) {
      onEndClick(storyItem);
    }
  };

  return (
    <div className="flex-1 overflow-auto pb-[100px]">
      {obsStory.map((story, index) => (
        <div key={story.id} className="flex m-4 p-1 rounded-md min-h-0">
          {'title' in story && (
            <>
              {audioEnabled && (
                <div className="flex items-center mr-2">
                  <AudioIndicator
                    storyId={story.id}
                    effectiveStoryId={effectiveStoryId}
                    audioContent={audioContent}
                  />
                </div>
              )}
              <textarea
                name={`title-${story.id}`}
                value={story.title}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onClick={() => handleTitleClick(story)}
                className={`flex-grow text-justify ml-2 p-2 text-xl border rounded-lg transition-all duration-200 ${
                  selectedParagraph === story.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                style={{ fontFamily: selectedFont || 'sans-serif', fontSize: `${editorFontSize}rem` }}
              />
            </>
          )}
          {'text' in story && (
            <>
             <div className="flex flex-col items-center mr-2">
              <span className="w-8 h-8 bg-gray-800 rounded-full flex justify-center text-sm text-white items-center font-medium shrink-0">
                {index.toString().split('').map((num) => t(`n-${num}`))}
              </span>
              {audioEnabled && (
                <div className="mt-1">
                  <AudioIndicator
                    storyId={story.id}
                    effectiveStoryId={effectiveStoryId}
                    audioContent={audioContent}
                  />
                </div>
              )}
              </div>
              <textarea
                name={`text-${story.id}`}
                value={story.text}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onClick={() => handleParagraphClick(story)}
                onFocus={(e) => handleOnFocus(true, e)}
                onBlur={(e) => handleOnFocus(false, e)}
                onInput={handleAutoHeight}
                className={`flex-grow text-justify ml-1 p-3 text-sm border rounded-lg transition-all duration-200 ${
                  selectedParagraph === story.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${editorFontSize}rem`,
                  lineHeight: editorFontSize > 1.3 ? 1.5 : '',
                }}
              />
            </>
          )}
          {'end' in story && (
            <>
              {audioEnabled && (
                <div className="flex items-center mr-2">
                  <AudioIndicator
                    storyId={story.id}
                    effectiveStoryId={effectiveStoryId}
                    audioContent={audioContent}
                  />
                </div>
              )}
              <textarea
                name={`end-${story.id}`}
                value={story.end}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onClick={() => handleEndClick(story)}
                className={`flex-grow text-justify ml-2 p-3 text-sm border rounded-lg transition-all duration-200 ${
                  selectedParagraph === story.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                }`}
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${editorFontSize}rem`,
                  lineHeight: editorFontSize > 1.3 ? 1.5 : '',
                }}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

TextEditor.propTypes = {
  obsStory: PropTypes.array.isRequired,
  storyUpdate: PropTypes.func.isRequired,
  selectedParagraph: PropTypes.number,
  onParagraphClick: PropTypes.func,
  onTitleClick: PropTypes.func,
  onEndClick: PropTypes.func,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  audioEnabled: PropTypes.bool,
};

export default TextEditor;
