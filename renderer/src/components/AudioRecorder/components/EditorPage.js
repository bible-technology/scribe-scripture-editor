import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import VerseContextMenu from '@/components/EditorPage/AudioEditor/VerseContextMenu.jsx';

const AudioWaveform = dynamic(() => import('./WaveForm'), { ssr: false });

const EditorPage = ({
  content, onChangeVerse, verse, location, updateWave, fontSize, selectedFont, chapter, onJoinVerse, onDisjoinVerse,
}) => {
  const path = require('path');
  const [waveUpdate, setWaveUpdate] = useState(false);

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    verse: null,
    isFirstVerse: false,
    isJoinedVerse: false,
  });

  const selectVerse = (value) => {
    // For opening and closing the verse tab
    // if (selectedverse === value) {
    //   setSelectedVerse(0);
    // } else {
    // setSelectedVerse(value);
    onChangeVerse(value.toString(), verse);
  };

  const handleContextMenu = (e, verseItem, index) => {
    e.preventDefault();
    e.stopPropagation();

    const isFirst = index === 0;
    const isJoined = verseItem.verseNumber && verseItem.verseNumber.includes('-');

    if (isFirst && !isJoined) {
      return;
    }

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      verse: verseItem,
      isFirstVerse: isFirst,
      isJoinedVerse: isJoined,
    });
  };
  const handleCloseContextMenu = () => {
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      verse: null,
      isFirstVerse: false,
      isJoinedVerse: false,
    });
  };

  // To update the wave after deleting the default take (Re-render this component)
  useEffect(() => {
    if (updateWave) {
      setWaveUpdate(!waveUpdate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateWave]);
  return (
    <div className="bg-white rounded-md overflow-hidden">
      {content?.map((mainChunk, index) => {
        const isActive = (() => {
          const current = Number(verse);
          const num = mainChunk.verseNumber;

          if (num && typeof num === 'string' && num.includes('-')) {
            const [start, end] = num.split('-').map(Number);
            return current >= start && current <= end;
          }

          return num === verse.toString();
        })();

        const isJoinedVerse = mainChunk.verseNumber && mainChunk.verseNumber.includes('-');

        return (
          mainChunk.verseNumber
          && (
            <div
              role="button"
              id={`ch${chapter}v${mainChunk.verseNumber}`}
              aria-label="select verse"
              tabIndex={0}
              key={mainChunk.verseNumber}
              className={`relative ${isActive ? 'bg-light' : 'bg-gray-100'} m-3 px-3 py-4 justify-center items-center
              border border-gray-200 rounded-lg hover:bg-light cursor-pointer`}
              onClick={() => selectVerse(mainChunk.verseNumber, mainChunk.verseText)}
              onContextMenu={(e) => handleContextMenu(e, mainChunk, index)}
            >
              <div className="flex w-full group-hover:text-white">
                <div
                  className={`
                    flex items-center justify-center 
                    w-10 h-8 mr-2 rounded-full text-sm text-white
                    ${isJoinedVerse ? 'bg-amber-600' : 'bg-primary'}
                  `}
                >
                  {mainChunk.verseNumber}
                </div>
                <p
                  className={`
                    m-0 w-full text-sm 
                    ${isJoinedVerse ? 'text-amber-900 font-medium' : 'text-gray-500'}
                  `}
                  style={{
                    fontFamily: selectedFont || 'sans-serif',
                    fontSize: `${fontSize}rem`,
                    lineHeight: (fontSize > 1.3) ? 1.5 : '',
                  }}
                >
                  {mainChunk.verseText || ''}
                </p>

                {/* <button
              type="button"
              className="flex items-center justify-center bg-dark hover:bg-primary w-24 h-8 ml-2 px-3 rounded-full text-white"
            >
              <SpeakerphoneIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              <ArrowNarrowRightIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              <ChatBubbleBottomCenterTextIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
            </button> */}
              </div>

              <div className="mt-2">
                <AudioWaveform
                  height={24}
                  waveColor="#333333"
                  // url={mainChunk[mainChunk.default]} for development
                  url={location && (mainChunk[mainChunk.default] ? path.join(location, mainChunk[mainChunk.default]) : '')}
                  show={false}
                  interaction={false}
                  setAudioPlayBack={() => { }}
                />
              </div>
              {/* <div className="bg-white mt-5 border border-gray-200 rounded-lg relative">
            <span
              className="p-1 px-2 h-6 align-baseline bg-primary text-white inline-block
                            text-xxs uppercase tracking-wider rounded-br-lg absolute top-0 left-0"
            >
              Automatic Speech to text
              suggestion
            </span>
            <textarea className="p-2 mt-7 m-0 w-full text-sm text-gray-600 border-0 focus:ring-0">
              {mainChunk.text}
            </textarea>
          </div> */}
              {/* <div className="flex mt-2">
            <button
              type="button"
              className="flex p-1 px-2 items-center justify-center bg-error  rounded-lg text-xxs font-bold text-white uppercase tracking-wider"
            >
              <XMarkIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              Discard
            </button>
            <button
              type="button"
              className="flex ml-2 p-1 px-2 items-center justify-center bg-success rounded-lg text-xxs font-bold text-white uppercase tracking-wider"
            >
              <CheckIcon
                className="w-4 h-4 mr-1"
                aria-hidden="true"
              />
              Accept
            </button>
          </div> */}
            </div>
          )
        );
      })}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* {verses.map((story, index) => ( */}
        {/* <div
          key={verse.verseNumber}
          className={classNames(
                index === 0
                  || index === 1
                  ? 'bg-primary'
                  : 'bg-gray-50',
                'relative group grid grid-cols-1 content-between m-3 border border-gray-100 justify-center items-center rounded-lg hover:bg-primary cursor-pointer',
              )}
        >
          <div
            className={classNames(
                  index === 0
                    || index === 1
                    ? 'text-white'
                    : 'text-gray-500',
                  'px-3 py-4 relative flex w-full text-sm group-hover:text-white',
                )}
          >
            <div className="hidden group-hover:flex items-center justify-center bg-secondary/60 duration-300 absolute left-0 top-0 bottom-0 right-0 z-10 text-center rounded-t-lg">
              <PencilIcon
                className="w-6 h-6 mr-1"
                aria-hidden="true"
              />
            </div>

            <div className="flex items-center justify-center bg-dark w-6 h-6 mr-2 rounded-full text-xxs text-white">
              {1 + index}
            </div>
            <p className="m-0 w-full">
              {story.text || ''}
            </p>
          </div>
          <div className="flex justify-between px-3 my-4 content-between">
            <div className="flex items-center">
              <button
                type="button"
                className="flex p-1 px-2 items-center justify-center bg-white border border-gray-200 rounded-full text-xxs font-bold text-primary uppercase tracking-wider"
              >
                <ChatIcon
                  className="w-4 h-4 mr-1"
                  aria-hidden="true"
                />
                23
              </button>
              {(index === 0
                    || index
                      === 1) && (
                      <button
                        type="button"
                        className="flex p-1 px-2 ml-2 items-center justify-center bg-success rounded-full text-xxs font-bold text-white uppercase tracking-wider"
                      >
                        Merge
                      </button>
                  )}
            </div>

            <div className="flex w-full items-center justify-end">
              <div className="flex items-center justify-center bg-dark w-6 h-6 mr-2 rounded-full text-xxs font-bold text-white uppercase">
                a
              </div>
              <div className="flex items-center justify-center bg-gray-200 border border-gray-300 w-6 h-6 mr-2 rounded-full text-xxs font-bold text-gray-500 uppercase">
                b
              </div>
              <div className="flex items-center justify-center bg-gray-200 border border-gray-300 w-6 h-6 mr-2 rounded-full text-xxs font-bold text-gray-500 uppercase">
                c
              </div>
            </div>
          </div>
          <div className="px-3 pb-4">
            <AudioWaveform
              height={18}
              waveColor={
                    index
                      === 0
                    || index === 1
                      ? '#fff'
                      : '#999'
                  }
              btnColor={
                    index
                      === 0
                    || index === 1
                      ? 'text-light'
                      : 'text-gray-300'
                  }
            />
          </div>
        </div> */}
        {/*  ))} */}
      </div>
      <VerseContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        verse={contextMenu.verse}
        isFirstVerse={contextMenu.isFirstVerse}
        isJoinedVerse={contextMenu.isJoinedVerse}
        onJoinVerse={onJoinVerse}
        onDisjoinVerse={onDisjoinVerse}
        onClose={handleCloseContextMenu}
      />
    </div>
  );
};
export default EditorPage;
EditorPage.propTypes = {
  content: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onChangeVerse: PropTypes.any,
  verse: PropTypes.string,
  location: PropTypes.string,
  chapter: PropTypes.string,
  onJoinVerse: PropTypes.func,
  onDisjoinVerse: PropTypes.func,
};
