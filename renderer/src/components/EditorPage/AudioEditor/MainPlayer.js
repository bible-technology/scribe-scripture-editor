/* eslint-disable react-hooks/exhaustive-deps */
import Player from '@/components/AudioRecorder/components/Player';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import {
  useContext, useEffect, useState, useCallback,
} from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { getDetails } from '../ObsEditor/utils/getDetails';
import * as logger from '../../../logger';

const MainPlayer = () => {
  const {
    state: {
      bookId,
      chapter,
      verse,
      audioContent,
      audioPath,
      updateWave,
    }, actions: {
      setAudioContent,
      setUpdateWave,
    },
  } = useContext(ReferenceContext);
  const [currentUrl, setCurrentUrl] = useState('');
  // currentUrl is an object with full details of the verse with takes etc
  // newBlob is used for storing recorded blobURL, to play instantly after the re-record and delete-record to avoid the caching issue of play()
  const [newBlob, setNewBlob] = useState();
  const [take, setTake] = useState('take1');
  const [trigger, setTrigger] = useState('');
  const [model, setModel] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  const modelClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };
  const findCurrentVerse = useCallback(() => {
    if (!audioContent || !Array.isArray(audioContent)) { return null; }

    return audioContent.find((v) => {
      if (v.verseNumber === verse) { return true; }

      if (v.verseNumber && v.verseNumber.includes('-')) {
        const [start, end] = v.verseNumber.split('-').map(Number);
        const verseNum = Number(verse);
        if (!Number.isNaN(verseNum) && verseNum >= start && verseNum <= end) {
          return true;
        }
      }

      if (v.joinedVerses && Array.isArray(v.joinedVerses)) {
        return v.joinedVerses.some((jv) => jv.toString() === verse);
      }

      return false;
    });
  }, [audioContent, verse]);

  const fetchUrl = useCallback(() => {
    const currentVerse = findCurrentVerse();
    if (currentVerse) {
      setCurrentUrl(currentVerse);
      setTrigger('url');
    } else {
      setCurrentUrl({});
    }
  }, [findCurrentVerse]);

  const loadChapter = async () => {
    if (!audioPath || !audioContent) {
      return;
    }

    try {
      const fs = window.require('fs');
      const path = require('path');

      if (!fs.existsSync(audioPath)) {
        return;
      }

      const audioFiles = fs.readdirSync(audioPath);

      const updatedContent = audioContent.map((verse) => ({ ...verse }));

      audioFiles.forEach((fileName) => {
        const parsed = path.parse(fileName);
        const parts = parsed.name.split('_');

        if (parts.length >= 2) {
          const fileChapter = parts[0];
          const fileVerseNumber = parts[1];
          const fileTakeNumber = parts[2];
          const isDefault = parts[3] === 'default';

          if (fileChapter === chapter.toString()) {
            const verseIndex = updatedContent.findIndex((v) => {
              if (v.verseNumber === fileVerseNumber) { return true; }

              if (v.joinedVerses && Array.isArray(v.joinedVerses)) {
                const fileNum = parseInt(fileVerseNumber, 10);
                if (!Number.isNaN(fileNum) && v.joinedVerses.includes(fileNum)) {
                  return true;
                }
              }

              if (v.verseNumber && v.verseNumber.includes('-')) {
                const [start, end] = v.verseNumber.split('-').map(Number);
                if (fileVerseNumber.includes('-')) {
                  const [fileStart, fileEnd] = fileVerseNumber.split('-').map(Number);
                  return start === fileStart && end === fileEnd;
                }
                const fileNum = Number(fileVerseNumber);
                if (!Number.isNaN(fileNum) && fileNum >= start && fileNum <= end) {
                  return true;
                }
              }

              return false;
            });

            if (verseIndex !== -1) {
              if (fileTakeNumber) {
                const takeKey = `take${fileTakeNumber}`;
                updatedContent[verseIndex][takeKey] = fileName;
                if (isDefault) {
                  updatedContent[verseIndex].default = takeKey;
                }
              }
            }
          }
        }
      });

      setAudioContent(updatedContent);
    } catch (error) {
      logger.error('Error loading chapter:', error);
    }
  };

  // Setting up the default audio from the takes
  const changeDefault = (value) => {
    if (!audioPath) { return; }

    const fs = window.require('fs');
    const path = require('path');

    const currentVerse = findCurrentVerse();
    if (!currentVerse) {
      logger.warn('Current verse not found');
      return;
    }

    const verseNum = currentVerse.verseNumber;

    if (!fs.existsSync(path.join(audioPath, `${chapter}_${verseNum}_${value}.mp3`))) {
      logger.warn(`Take ${value} does not exist`);
      return;
    }

    try {
      let i = 1;
      while (i < 4) {
        const defaultFilePath = path.join(audioPath, `${chapter}_${verseNum}_${i}_default.mp3`);
        if (fs.existsSync(defaultFilePath)) {
          if (i !== value) {
            fs.renameSync(
              defaultFilePath,
              path.join(audioPath, `${chapter}_${verseNum}_${i}.mp3`),
            );
            fs.renameSync(
              path.join(audioPath, `${chapter}_${verseNum}_${value}.mp3`),
              path.join(audioPath, `${chapter}_${verseNum}_${value}_default.mp3`),
            );
          }
          break;
        }
        i += 1;
      }
      // Finally loading the data back
      loadChapter();
    } catch (error) {
      logger.error('Error changing default take:', error);
    }
  };

  const saveAudio = (blob) => new Promise((resolve, reject) => {
    getDetails().then(({ projectsDir, path }) => {
      const fs = window.require('fs');

      const currentVerse = findCurrentVerse();
      if (!currentVerse) {
        logger.error('Cannot save audio - verse not found');
        reject(new Error('Verse not found'));
        return;
      }

      const verseNum = currentVerse.verseNumber;
      const result = take.replace(/take/g, '');

      const audioFolder = path.join(
        projectsDir,
        'audio',
        'ingredients',
        bookId.toUpperCase(),
        chapter.toString(),
      );

      const folderName = fs.readdirSync(audioFolder);
      const existingTakes = folderName.filter((w) => w.match(`^${chapter}_${verseNum.replace(/[-]/g, '\\-')}_`));

      let filePath;
      const defaultPath = path.join(audioFolder, `${chapter}_${verseNum}_${result}_default.mp3`);
      const regularPath = path.join(audioFolder, `${chapter}_${verseNum}_${result}.mp3`);

      if (existingTakes.length > 0) {
        filePath = fs.existsSync(defaultPath) ? defaultPath : regularPath;
      } else {
        filePath = defaultPath;
      }

      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        fs.writeFile(filePath, Buffer.from(new Uint8Array(event.target.result)), (err) => {
          if (!err) {
            logger.debug(`✓ Audio saved: ${path.basename(filePath)}`);
            loadChapter().then(() => {
              resolve();
            });
          } else {
            logger.error('Error saving audio file:', err);
            reject(err);
          }
        });
      };
      fileReader.onerror = () => reject(new Error('FileReader error'));
      fileReader.readAsArrayBuffer(blob);
    }).catch(reject);
  });

  const playRecordingFeedback = useCallback(
    async (blobUrl, blob) => {
      setNewBlob(blobUrl);
      await saveAudio(blob);

      setTimeout(() => {
        fetchUrl();
      }, 100);
    },
    [bookId, chapter, verse, take, audioPath, fetchUrl],
  );
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useReactMediaRecorder({
    audio: true,
    onStop: playRecordingFeedback,
    blobPropertyBag: { type: 'audio/mp3' },
  });
  const handleFunction = () => {
    // We have used trigger to identify whether the call is from DeleteAudio or Re-record
    if (trigger === 'delete') {
      if (!audioPath) { return; }

      const fs = window.require('fs');
      const path = require('path');

      const currentVerse = findCurrentVerse();
      if (!currentVerse) {
        logger.error('Cannot delete - verse not found');
        return;
      }

      const verseNum = currentVerse.verseNumber;
      const result = take.replace(/take/g, '');

      try {
        const defaultFilePath = path.join(audioPath, `${chapter}_${verseNum}_${result}_default.mp3`);
        const regularFilePath = path.join(audioPath, `${chapter}_${verseNum}_${result}.mp3`);

        if (fs.existsSync(defaultFilePath)) {
          let newDefaultSet = false;
          let newDefaultTake = null;
          for (let i = 1; i < 4; i++) {
            if (i !== +result) {
              const altFilePath = path.join(audioPath, `${chapter}_${verseNum}_${i}.mp3`);
              if (fs.existsSync(altFilePath)) {
                fs.renameSync(
                  altFilePath,
                  path.join(audioPath, `${chapter}_${verseNum}_${i}_default.mp3`),
                );
                newDefaultSet = true;
                newDefaultTake = `take${i}`;
                logger.debug(`Set take${i} as new default after deleting ${take}`);
                break;
              }
            }
          }

          // Delete the old default
          fs.unlinkSync(defaultFilePath);

          setAudioContent((prevContent) => prevContent.map((v) => {
            if (v.verseNumber === currentVerse.verseNumber) {
              const updated = { ...v };
              delete updated[take];
              if (newDefaultSet && newDefaultTake) {
                updated.default = newDefaultTake;
              } else {
                delete updated.default;
              }
              return updated;
            }
            return v;
          }));
        } else if (fs.existsSync(regularFilePath)) {
          // Delete non-default take
          fs.unlinkSync(regularFilePath);

          setAudioContent((prevContent) => prevContent.map((v) => {
            if (v.verseNumber === currentVerse.verseNumber) {
              const updated = { ...v };
              delete updated[take];
              return updated;
            }
            return v;
          }));
        }

        setTrigger();
        setUpdateWave(!updateWave);
        setNewBlob();
      } catch (error) {
        logger.error('Error deleting audio:', error);
      }
    } else {
      setTrigger('record');
    }
  };

  useEffect(() => {
    if (audioContent?.length > 0) {
      fetchUrl();
    }
  }, [audioContent, bookId, verse, chapter, fetchUrl]);

  // Reset state when verse/chapter changes
  useEffect(() => {
    setTrigger();
    setTake('take1');
    setNewBlob();
  }, [verse, chapter, bookId]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <Player
        url={currentUrl || {}}
        blobUrl={newBlob}
        setBlobUrl={setNewBlob}
        startRecording={startRecording}
        stopRecording={stopRecording}
        pauseRecording={pauseRecording}
        resumeRecording={resumeRecording}
        take={take}
        setTake={setTake}
        changeDefault={(v) => changeDefault(v)}
        trigger={trigger}
        setTrigger={(v) => setTrigger(v)}
        setOpenModal={(v) => setModel(v)}
        location={audioPath || ''}
      />
      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modelClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => handleFunction()}
      />
    </div>

  );
};
export default MainPlayer;
