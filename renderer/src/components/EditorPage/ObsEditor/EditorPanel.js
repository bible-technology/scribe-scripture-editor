import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

const EditorPanel = ({ obsStory, storyUpdate }) => {
  const {
    state: {
      selectedFont,
      fontSize,
    },
    actions: {
      setSelectedStory,
    },
  } = useContext(ReferenceContext);
  const { states: { scrollLock } } = useContext(ProjectContext);
  const { t } = useTranslation();
  const handleChange = (e) => {
    const index = e.target.getAttribute('data-id');
    const value = e.target.value;
    const story = obsStory[index - 1];
    let newStory = {};
    if (Object.prototype.hasOwnProperty.call(story, 'title')) {
      newStory = {
        id: story.id,
        title: value,
      };
    } else if (Object.prototype.hasOwnProperty.call(story, 'text')) {
      newStory = {
        id: story.id,
        img: story.img,
        text: value,
      };
    } else if (Object.prototype.hasOwnProperty.call(story, 'end')) {
      newStory = {
        id: story.id,
        end: value,
      };
    }

    const newStories = obsStory.map((story) => (story.id !== newStory.id ? story : newStory));
    let newData = { ...obsStory };
    newData = newStories;
    storyUpdate(newData);
  };
  const avoidEnter = (e) => {
    // avoiding enter key for the Header
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      return false;
    }
  };
  return (
    <>
      {obsStory.map((story, index) => (
        <>
          {Object.prototype.hasOwnProperty.call(story, 'title')
            && (
              <div
                key={story.id}
              >
                <input
                  name={story.title}
                  onChange={handleChange}
                  onKeyDown={avoidEnter}
                  onClick={() => setSelectedStory(scrollLock === true ? 0 : story.id)}
                  value={story.title}
                  data-id={story.id}
                  className="flex-grow text-justify p-2 text-xl w-full border-0 border-b border-gray-200"
                  style={{
                    fontFamily: selectedFont || 'sans-serif',
                    fontSize: `${fontSize}rem`,
                  }}
                />
              </div>
            )}
          {Object.prototype.hasOwnProperty.call(story, 'text')
            && (
              <div
                className="flex items-center justify-center my-auto relative"
                key={story.id}
              >
                <span className="w-3 h-3 bg-gray-800 rounded-full flex justify-center text-xxs text-white items-center p-2 absolute left-1 top-1/2 transform -translate-y-1/2 ">
                  {index.toString().split('').map((num) => t(`n-${num}`))}
                </span>
                <textarea
                  name={story.text}
                  onChange={handleChange}
                  onClick={() => setSelectedStory(scrollLock === true ? 0 : story.id)}
                  value={story.text}
                  data-id={story.id}
                  className="flex-grow px-6 text-xs border-0 border-b border-gray-200 placeholder:flex placeholder:items-center placeholder:justify-center placeholder:absolute placeholder:left-1 placeholder:top-1/2 placeholder:transform placeholder-translate-y-1/2"
                  style={{
                    fontFamily: selectedFont || 'sans-serif',
                    fontSize: `${fontSize}rem`,
                    lineHeight: (fontSize > 1.3) ? 1.5 : '',
                    paddingTop: '1.5rem',
                  }}
                />
              </div>
            )}
          {Object.prototype.hasOwnProperty.call(story, 'end')
            && (
              <div
                key={story.id}
              >
                <input
                  name={story.end}
                  onChange={handleChange}
                  onClick={() => setSelectedStory(scrollLock === true ? 0 : story.id)}
                  value={story.end}
                  data-id={story.id}
                  className="flex-grow text-justify p-2 text-xl w-full border-0 border-b border-gray-200"
                  style={{
                    fontFamily: selectedFont || 'sans-serif',
                    fontSize: `${fontSize}rem`,
                    lineHeight: (fontSize > 1.3) ? 1.5 : '',
                  }}
                />
              </div>
            )}
        </>
      ))}
    </>
  );
};
export default EditorPanel;
EditorPanel.propTypes = {
  obsStory: PropTypes.array,
  storyUpdate: PropTypes.func,
};
