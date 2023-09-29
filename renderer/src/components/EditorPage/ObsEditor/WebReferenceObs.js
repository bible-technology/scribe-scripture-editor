'use client';

import { ReferenceContext } from '@/components/context/ReferenceContext';
import {
 useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { checkandDownloadObsImages } from '@/components/Resources/DownloadObsImages/checkandDownloadObsImages';
// import useNetwork from '@/components/hooks/useNetowrk';
import LoadingScreen from '../../Loading/LoadingScreen';
import ObsImage from './ObsImage';

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
  const [networkState, setNetworkState] = useState({ online: true });
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
// const networkState = useNetwork();

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
      setNetworkState({ online: window?.navigator?.onLine });
      const currentRef = itemEls.current.filter((obj) => obj.id === selectedStory)[0]?.el;
      if (currentRef) {
        currentRef.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    }
  }, [selectedStory, stories]);

  useEffect(() => {
    (async () => {
      if (window?.navigator?.onLine) {
        await checkandDownloadObsImages(window?.navigator?.onLine);
      }
      // else {
      //   console.log('No internet connection');
      // }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      { isLoading === false ? (
        <div>
          {
            stories?.map((story, index) => (
              <div
                key={story.id}
                className={`flex gap-5 mb-5 items-center justify-center ${story.id === selectedStory && 'bg-light'}`}
                ref={(element) => addtoItemEls(element, story.id)}
              >
                {
                  Object.prototype.hasOwnProperty.call(story, 'title') && (
                  <p className="text-xl text-gray-600" style={style.bold}>
                    {story.title}
                  </p>
                  )
                }
                {Object.prototype.hasOwnProperty.call(story, 'text') && (
                <>
                  <span className="w-5 h-5 bg-gray-800 rounded-full flex justify-center text-sm text-white items-center p-3 ">
                    {/* {index} */}
                    {index.toString().split('').map((num) => t(`n-${num}`))}
                  </span>
                  {/* <img className="w-1/4 rounded-lg" src={story.img} alt="" /> */}
                  <ObsImage story={story} online={networkState.online} />
                  <p
                    className="text-sm text-gray-600 text-justify"
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
                  <p className="text-md text-gray-600" style={style.italic}>
                    {story.end}
                  </p>
                  )
                }
              </div>
            ))
          }
        </div>
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
