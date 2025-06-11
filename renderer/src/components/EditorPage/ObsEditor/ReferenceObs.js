import { ReferenceContext } from '@/components/context/ReferenceContext';
import {
  useContext, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import { getScriptureDirection } from '@/core/projects/languageUtil';
import { useTranslation } from 'react-i18next';
import { checkandDownloadObsImages } from '@/components/Resources/DownloadObsImages/checkandDownloadObsImages';
import dynamic from 'next/dynamic';
import { error as logError } from '../../../logger';
import LoadingScreen from '../../Loading/LoadingScreen';
import ObsImage from './ObsImage';

const AudioWaveform = dynamic(() => import('../../AudioRecorder/components/WaveForm'), { ssr: false });
const style = {
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
};

const ReferenceObs = ({
  stories, storyAudioPath, font, title, fontSize,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState('ltr');
  const [networkState, setNetworkState] = useState({ online: true });
  const [audioContent, setAudioContent] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);

  const {
    state: {
      selectedStory,
    },
    actions: {
      setSelectedStory,
    },
  } = useContext(ReferenceContext);

  const itemEls = useRef([]);
  const { t } = useTranslation();

  // Get story ID from the first story if available
  const effectiveStoryId = stories && stories[0] && stories[0].title ? stories[0].title.split('.')[0] : null;

  // Cross-platform path helper
  const joinPath = (...parts) => {
    const path = window.require('path');
    return path.join(...parts);
  };

  // Load metadata function
  const loadMetadata = async (folder) => {
    try {
      const fs = window.require('fs');
      const metadataPath = joinPath(folder, 'metadata.json');

      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        return metadata;
      }
    } catch (error) {
      logError('Error loading metadata:', error);
    }
    return null;
  };

  // Load story audio function - using storyAudioPath prop
  const loadStoryAudio = async () => {
    try {
      if (!effectiveStoryId || !storyAudioPath) {
        setAudioEnabled(false);
        return;
      }

      const fs = window.require('fs');

      // Check if the base audio path exists
      if (!fs.existsSync(storyAudioPath)) {
        setAudioEnabled(false);
        return;
      }

      // Build the audio path: storyAudioPath/ingredients/audio
      const audioFolder = joinPath(storyAudioPath, 'ingredients', 'audio');

      if (!fs.existsSync(audioFolder)) {
        setAudioEnabled(false);
        return;
      }

      // Get the specific story folder
      const storyFolder = joinPath(audioFolder, effectiveStoryId.toString());

      if (!fs.existsSync(storyFolder)) {
        setAudioEnabled(false);
        return;
      }

      const metadata = await loadMetadata(storyFolder);
      const files = fs.readdirSync(storyFolder).filter((file) => file.endsWith('.mp3'));

      if (files.length === 0) {
        setAudioEnabled(false);
        return;
      }

      const updatedContent = {};

      // Process files and create structure
      files.forEach((file) => {
        const path = window.require('path');
        const name = path.parse(file).name;
        const parts = name.split('_');

        // Parse filename: {storyNum}_{para}_{take}_default or {storyNum}_{para}_{take}
        if (parts.length >= 3) {
          const [storyNum, paraNum, takeNum, ...rest] = parts;
          const isDefault = rest.includes('default');

          const key = `story_${storyNum}_${paraNum}`;
          const fullFilePath = joinPath(storyFolder, file);

          // Create file URL for cross-platform compatibility
          const fileUrl = `file://${fullFilePath.replace(/\\/g, '/')}`;

          if (!updatedContent[key]) {
            updatedContent[key] = {
              paragraph: paraNum,
              storyNumber: storyNum,
              verseNumber: paraNum,
              takes: {},
              defaultTake: '1',
              filePath: storyFolder,
              audioPath: '',
            };
          }

          // Store take information
          updatedContent[key].takes[takeNum] = {
            fileName: file,
            filePath: fullFilePath,
            url: fileUrl,
            isDefault,
          };

          // Set default based on filename or isDefault flag
          if (isDefault) {
            updatedContent[key].defaultTake = takeNum;
            updatedContent[key].audioPath = fullFilePath;
          }

          // For backward compatibility, also store as takeX format
          updatedContent[key][`take${takeNum}`] = file;
        }
      });

      // Ensure default is set for each paragraph and set audioPath
      Object.keys(updatedContent).forEach((key) => {
        if (!updatedContent[key].audioPath) {
          let defaultTake = updatedContent[key].defaultTake;

          // Check metadata for default take
          if (metadata && metadata.paragraphs) {
            const paraNum = updatedContent[key].paragraph;
            if (metadata.paragraphs[paraNum] && metadata.paragraphs[paraNum].defaultTake) {
              defaultTake = metadata.paragraphs[paraNum].defaultTake;
              updatedContent[key].defaultTake = defaultTake;
            }
          }

          // If still no default, use first available take
          if (!updatedContent[key].takes[defaultTake]) {
            const takeKeys = Object.keys(updatedContent[key].takes).sort();
            if (takeKeys.length > 0) {
              defaultTake = takeKeys[0];
              updatedContent[key].defaultTake = defaultTake;
            }
          }

          // Set audioPath to default take
          if (updatedContent[key].takes[defaultTake]) {
            updatedContent[key].audioPath = updatedContent[key].takes[defaultTake].filePath;
          }
        }
      });
      setAudioContent(updatedContent);
      setAudioEnabled(Object.keys(updatedContent).length > 0);
    } catch (error) {
      logError('Error loading story audio:', error);
      setAudioEnabled(false);
    }
  };

  // Handle story click
  const handleStoryClick = (story) => {
    setSelectedStory(story.id);
  };

  // Get audio path for AudioWaveform
  const getAudioPath = (storyId) => {
    const newStoryId = storyId - 1;
    const key = `story_${effectiveStoryId}_${newStoryId}`;
    const audioData = audioContent[key];

    if (audioData && audioData.audioPath) {
      return audioData.audioPath;
    }

    // Fallback: try to get from default take
    if (audioData && audioData.takes && audioData.defaultTake) {
      const defaultTakeData = audioData.takes[audioData.defaultTake];
      if (defaultTakeData && defaultTakeData.filePath) {
        return defaultTakeData.filePath;
      }
    }

    return '';
  };

  const hasAudioForStory = (storyId) => {
    const newStoryId = storyId - 1;
    const key = `story_${effectiveStoryId}_${newStoryId}`;
    const audioData = audioContent[key];
    const hasAudio = audioData && (audioData.audioPath || (audioData.takes && Object.keys(audioData.takes).length > 0));
    return hasAudio;
  };
  useEffect(() => {
    if (stories === undefined) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
    itemEls.current.length = 0;
    setSelectedStory(1);

    // get the direction
    if (title) {
      getScriptureDirection(title).then((dir) => {
        if (dir && dir.toLowerCase() === 'rtl') {
          setDirection(dir);
        }
      });
    }

    // Load audio when stories and storyAudioPath are available
    if (stories && effectiveStoryId && storyAudioPath) {
      loadStoryAudio();
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stories, title, effectiveStoryId, storyAudioPath]);

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
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex flex-col h-full pb-[100px]">
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        { isLoading === false ? (
          <div>
            {
              stories?.map((story, index) => (
                <div
                  key={story.id}
                  className={`flex flex-col gap-3 mb-5 p-4 cursor-pointer transition-colors duration-200 ${
                    story.id === selectedStory && 'bg-light'
                  } ${direction === 'rtl' ? 'pl-4' : 'pr-4'}`}
                  ref={(element) => addtoItemEls(element, story.id)}
                  onClick={() => handleStoryClick(story)}
                >
                  {/* Title Section */}
                  {
                    Object.prototype.hasOwnProperty.call(story, 'title') && (
                      <div className="w-full">
                        <p className="text-xl text-gray-600 w-full text-center" style={style.bold}>
                          {story.title}
                        </p>
                        {audioEnabled && hasAudioForStory(story.id) && (
                          <div className="mt-2">
                            <AudioWaveform
                              height={24}
                              waveColor="#333333"
                              url={getAudioPath(story.id)}
                              show
                              setAudioPlayBack={() => {}}
                            />
                          </div>
                        )}
                      </div>
                    )
                  }
                  {/* Text Section */}
                  {Object.prototype.hasOwnProperty.call(story, 'text') && (
                    <div className="flex gap-5 items-start">
                      <span className="w-5 h-5 bg-gray-800 rounded-full flex justify-center text-sm text-white items-center p-3 shrink-0">
                        {index.toString().split('').map((num) => t(`n-${num}`))}
                      </span>
                      <ObsImage story={story} online={networkState.online} />
                      <div className="w-full flex flex-col">
                        <p
                          className="text-sm text-gray-600 text-justify w-full break-words overflow-hidden"
                          style={{
                            fontFamily: font || 'sans-serif',
                            fontSize: `${fontSize}rem`,
                            lineHeight: (fontSize > 1.3) ? 1.5 : '',
                          }}
                        >
                          {story.text}
                        </p>
                        {audioEnabled && hasAudioForStory(story.id) && (
                          <div className="mt-2">
                            <AudioWaveform
                              height={24}
                              waveColor="#333333"
                              url={getAudioPath(story.id)}
                              show
                              setAudioPlayBack={() => {}}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* End Section */}
                  {
                    Object.prototype.hasOwnProperty.call(story, 'end') && (
                      <div className="w-full">
                        <p className="text-md text-gray-600" style={style.italic}>
                          {story.end}
                        </p>
                        {audioEnabled && hasAudioForStory(story.id) && (
                          <div className="mt-2">
                            <AudioWaveform
                              height={24}
                              waveColor="#333333"
                              url={getAudioPath(story.id)}
                              show
                              setAudioPlayBack={() => {}}
                            />
                          </div>
                        )}
                      </div>
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
    </div>
  );
};

ReferenceObs.propTypes = {
  stories: PropTypes.arrayOf(PropTypes.object),
  storyAudioPath: PropTypes.string,
  font: PropTypes.string,
  title: PropTypes.string,
  fontSize: PropTypes.number,
};

ReferenceObs.defaultProps = {
  font: 'sans-serif',
  fontSize: 1,
  storyAudioPath: '',
};

export default ReferenceObs;
