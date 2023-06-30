import { ReferenceContext } from '@/components/context/ReferenceContext';
import {
  useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '../../Loading/LoadingScreen';

const style = {
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};
const ReferenceObs = ({ stories }) => {
  const [isLoading, setIsLoading] = useState(true);
  const {
    state: {
      selectedStory,
      selectedFont,
      fontSize,
    },
    actions: {
      setSelectedStory,
    },
  } = useContext(ReferenceContext);

  const itemEls = useRef([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (stories === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    itemEls.current.length = 0;
    setSelectedStory(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories]);

  // scroll based on story part selection
  const addtoItemEls = (el, id) => {
    if (el && el !== null && !itemEls.current.some((obj) => obj.id === id)) {
      itemEls.current.push({ id, el });
    }
  };

  useEffect(() => {
    if (stories && selectedStory !== undefined) {
      const currentRef = itemEls.current.filter((obj) => obj.id === selectedStory)[0]?.el;
      if (currentRef) {
        currentRef.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }
    }
  }, [selectedStory, stories]);
  return (
    <div>
      {isLoading === false ? (
        <>
          {
            stories.map((story, index) => (
              <div
                key={story.id}
                className={`grid grid-cols-12 auto-cols-max gap-5 p-0  ${story.id === selectedStory && 'bg-light'} ${story.id % 2 ? 'bg-gray-50' : 'bg-white'}`}
                ref={(element) => addtoItemEls(element, story.id)}
              >
                {
                  Object.prototype.hasOwnProperty.call(story, 'title') && (
                    <p className="text-xl text-gray-600 col-span-12 text-center" style={style.bold}>
                      {story.title}
                    </p>
                  )
                }
                {Object.prototype.hasOwnProperty.call(story, 'text') && (
                  <>
                    <div className="col-span-4 relative h-full border-0">
                      <span className="w-4 h-4 bg-white border-gray-600 border-2 rounded-full flex justify-center text-xxs text-gray-600 items-center p-3 absolute top-8 left-1 z-50">
                        {index.toString().split('').map((num) => t(`n-${num}`))}
                      </span>
                      <img
                        className="w-full rounded-r-lg"
                        src={story.img}
                        alt=""
                      />
                    </div>
                    <p
                      className="col-span-8 text-xxs text-gray-600 text-justify py-2"
                      style={{
                        fontFamily: selectedFont || 'sans-serif',
                        fontSize: `${fontSize}rem`,
                        lineHeight: (fontSize > 1.3) ? 1.5 : '',
                      }}
                    >
                      {story.text}
                    </p>
                  </>
                )}
                {
                  Object.prototype.hasOwnProperty.call(story, 'end') && (
                    <p className="col-span-8 text-md text-gray-600" style={style.italic}>
                      {story.end}
                    </p>
                  )
                }
              </div>
            ))
          }
        </>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
};

ReferenceObs.propTypes = {
  stories: PropTypes.arrayOf(PropTypes.object),
};

export default ReferenceObs;
