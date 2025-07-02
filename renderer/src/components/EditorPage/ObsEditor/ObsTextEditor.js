import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

const AudioIndicator = ({ storyId, effectiveStoryId }) => {
  const {
    state: { obsAudioContent },
  } = useContext(ReferenceContext);

  const currentAudioContent = obsAudioContent;

  if (!currentAudioContent || !effectiveStoryId) {
    return null;
  }

  const newStoryId = storyId - 1;
  const key = `story_${effectiveStoryId}_${newStoryId}`;
  const audioData = currentAudioContent[key];

  const hasAudio = audioData && (
    audioData.take1
    || audioData.take2
    || audioData.take3
    || (audioData.takes
     && Object.keys(audioData.takes).length > 0
     && Object.values(audioData.takes).some((take) => take && take.fileName))
  );

  if (!hasAudio) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
      <SpeakerWaveIcon className="w-3 h-3" />
    </div>
  );
};

AudioIndicator.propTypes = {
  storyId: PropTypes.number.isRequired,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const ObsTextEditor = ({
  obsStory,
  storyUpdate,
  onParagraphClick,
  onTitleClick,
  onEndClick,
  effectiveStoryId,
  audioEnabled,
}) => {
  const {
    state: {
      selectedFont,
      editorFontSize,
    },
    actions: {
      setSelectedStory,
    },
  } = useContext(ReferenceContext);

  const { states: { scrollLock } } = useContext(ProjectContext);
  const { t } = useTranslation();
  const textareaRefs = useRef({});

  const adjustTextareaHeight = (element) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

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

    setTimeout(() => {
      adjustTextareaHeight(e.target);
    }, 0);
  };

  const avoidEnter = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleAutoHeight = (e) => {
    adjustTextareaHeight(e.target);
  };

  useEffect(() => {
    Object.values(textareaRefs.current).forEach((textarea) => {
      if (textarea) {
        adjustTextareaHeight(textarea);
      }
    });
  }, [obsStory]);

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
    <div className="flex-1 overflow-auto ">
      {obsStory.map((story, index) => (
        <div key={story.id}>
          {'title' in story && (
            <div className="flex m-4 p-1 rounded-md min-h-0">
              {audioEnabled && (
                <div className="flex items-center mr-2">
                  <AudioIndicator
                    storyId={story.id}
                    effectiveStoryId={effectiveStoryId}
                  />
                </div>
              )}
              <textarea
                // eslint-disable-next-line no-return-assign
                ref={(el) => textareaRefs.current[`title-${story.id}`] = el}
                name={story.title}
                value={story.title}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onInput={handleAutoHeight}
                readOnly={audioEnabled}
                onClick={() => handleTitleClick(story)}
                className="flex-grow text-justify ml-2 p-2 text-xl"
                style={{ fontFamily: selectedFont || 'sans-serif', fontSize: `${editorFontSize}rem`, resize: 'none' }}
              />
            </div>
          )}
          {'text' in story && (
            <div className="flex m-4 p-1 rounded-md">
              <div className="flex flex-col items-center">
                <span className="w-5 h-5 bg-gray-800 rounded-full flex justify-center text-sm text-white items-center p-3">
                  {index.toString().split('').map((num) => t(`n-${num}`))}
                </span>
                {audioEnabled && (
                  <div className="mt-1">
                    <AudioIndicator
                      storyId={story.id}
                      effectiveStoryId={effectiveStoryId}
                    />
                  </div>
                )}
              </div>
              <textarea
                // eslint-disable-next-line no-return-assign
                ref={(el) => textareaRefs.current[`text-${story.id}`] = el}
                name={story.text}
                value={story.text}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onInput={handleAutoHeight}
                readOnly={audioEnabled}
                onClick={() => handleParagraphClick(story)}
                className="flex-grow text-justify ml-2 p-2 text-sm"
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${editorFontSize}rem`,
                  lineHeight: editorFontSize > 1.3 ? 1.5 : '',
                  resize: 'none',
                }}
              />
            </div>
          )}
          {'end' in story && (
            <div className="flex m-4 p-1 rounded-md min-h-0">
              {audioEnabled && (
                <div className="flex items-center mr-2">
                  <AudioIndicator
                    storyId={story.id}
                    effectiveStoryId={effectiveStoryId}
                  />
                </div>
              )}
              <textarea
                // eslint-disable-next-line no-return-assign
                ref={(el) => textareaRefs.current[`end-${story.id}`] = el}
                name={story.end}
                value={story.end}
                data-id={story.id}
                onChange={handleChange}
                onKeyDown={avoidEnter}
                onInput={handleAutoHeight}
                readOnly={audioEnabled}
                onClick={() => handleEndClick(story)}
                className="flex-grow text-justify ml-2 p-2 text-sm"
                style={{
                  fontFamily: selectedFont || 'sans-serif',
                  fontSize: `${editorFontSize}rem`,
                  lineHeight: editorFontSize > 1.3 ? 1.5 : '',
                  resize: 'none',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

ObsTextEditor.propTypes = {
  obsStory: PropTypes.array.isRequired,
  storyUpdate: PropTypes.func.isRequired,
  onParagraphClick: PropTypes.func,
  onTitleClick: PropTypes.func,
  onEndClick: PropTypes.func,
  effectiveStoryId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  audioEnabled: PropTypes.bool,
};

export default ObsTextEditor;
