/* eslint-disable react-hooks/exhaustive-deps */
import Player from '@/components/AudioRecorder/components/Player';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import {
  useContext, useEffect, useState, useCallback,
} from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { getDetails } from '../ObsEditor/utils/getDetails';

const MainPlayer = () => {
  const {
    state: {
      bookId,
      chapter,
      verse,
      audioContent,
      audioCurrentChapter,
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
  const fetchUrl = () => {
    Object.entries(audioContent).forEach(
      ([key]) => {
        if (audioContent[key].verseNumber === verse) {
          setCurrentUrl(audioContent[key]);
          setTrigger('url');
        }
      },
    );
  };

  const loadChapter = async () => {
    if (audioCurrentChapter) {
      const fs = window.require('fs');
      const path = require('path');
      // Fetching the Audios
      const chapters = await fs.readdirSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum));
      chapters.forEach((verse) => {
        const url = path.parse(verse).name;
        const verseNum = url.split('_');
        Object.entries(audioCurrentChapter.bookContent).forEach(
          ([key]) => {
            if (audioCurrentChapter.bookContent[key].chapterNumber === chapter) {
              Object.entries(audioCurrentChapter.bookContent[key].contents).forEach(
                ([v]) => {
                  if (audioCurrentChapter.bookContent[key].contents[v].verseNumber === verseNum[1]) {
                    // const url = 'https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3';
                    if (verseNum[2]) {
                      const take = `take${verseNum[2]}`;
                      // replace url with verse
                      audioCurrentChapter.bookContent[key].contents[v][take] = verse;
                      if (verseNum[3] === 'default') {
                        audioCurrentChapter.bookContent[key].contents[v].default = take;
                      }
                    }
                  }
                },
              );
            }
          },
        );
      });
      Object.entries(audioCurrentChapter.bookContent).forEach(
        ([key]) => {
          if (audioCurrentChapter.bookContent[key].chapterNumber === chapter) {
            // Storing the content in the ReferenceContext for the MainPlayer component
            setAudioContent(audioCurrentChapter.bookContent[key].contents);
            fetchUrl();
            setUpdateWave(!updateWave);
          }
        },
      );
    }
  };

  // Setting up the default audio from the takes
  const changeDefault = (value) => {
    const fs = window.require('fs');
    const path = require('path');
    let i = 1;
    // Checking whether the take has any audio
    if (audioCurrentChapter?.filePath && fs.existsSync(path.join(audioCurrentChapter?.filePath, audioCurrentChapter?.chapterNum, `${chapter}_${verse}_${value}.mp3`))) {
      while (i < 4) {
      // Looking for the existed default file so that we can easily rename both the files
        if (fs.existsSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}_default.mp3`))) {
        // Checking whether the user is trying to default the same default file, else rename both.
          if (i !== value) {
            fs.renameSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}_default.mp3`), path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}.mp3`));
            fs.renameSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${value}.mp3`), path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${value}_default.mp3`));
          }
        }
        i += 1;
      }
      // Finally loading the data back
      loadChapter();
    }
  };
  const saveAudio = (blob) => {
    getDetails()
      .then(({
        projectsDir, path,
      }) => {
        const fs = window.require('fs');
        const result = take.replace(/take/g, '');
        // Fetching the mp3 files
        const folderName = fs.readdirSync(path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase(), chapter));
        // Checking whether any takes are available for the selected verse
        const name = folderName.filter((w) => w.match(`^${chapter}_${verse}_`));
        let filePath;
        if (name.length > 0) {
        // While Re-recording replacing the file with same name
          if (fs.existsSync(path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase(), chapter, `${chapter}_${verse}_${result}_default.mp3`))) {
            filePath = path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase(), chapter, `${chapter}_${verse}_${result}_default.mp3`);
          } else {
            filePath = path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase(), chapter, `${chapter}_${verse}_${result}.mp3`);
          }
        } else {
          filePath = path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase(), chapter, `${chapter}_${verse}_${result}_default.mp3`);
        }

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        const fileReader = new FileReader();
        // eslint-disable-next-line func-names
        fileReader.onload = function () {
        // eslint-disable-next-line react/no-this-in-sfc
          fs.writeFile(filePath, Buffer.from(new Uint8Array(this.result)), (err) => {
            if (!err) {
              loadChapter();
            }
          });
        };
        fileReader.readAsArrayBuffer(blob);
      });
  };
  const playRecordingFeedback = useCallback(
    async (blobUrl, blob) => {
      setNewBlob(blobUrl);
      saveAudio(blob);
    },
    [bookId, chapter, verse, take, audioCurrentChapter],
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
      const fs = window.require('fs');
      const path = require('path');
      const result = take.replace(/take/g, '');
      let versePosition;
      // Fetching verse datails from the JSON
      Object.entries(audioCurrentChapter.bookContent[chapter - 1].contents).forEach(
        ([v]) => {
          if (audioCurrentChapter.bookContent[chapter - 1].contents[v].verseNumber === verse) {
            versePosition = v;
          }
        },
      );
      // Checking whether the user is trying to delete the default file.
      if (fs.existsSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${result}_default.mp3`))) {
        // Since user is deleting the default file, we need to change the default to some other takes if available
        let i = 1;
        while (i < 4) {
          if (i !== +result) {
            if (fs.existsSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}.mp3`))) {
              fs.renameSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}.mp3`), path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${i}_default.mp3`));
              delete audioCurrentChapter.bookContent[chapter - 1].contents[versePosition][take];
              fs.unlinkSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${result}_default.mp3`));
              delete audioCurrentChapter.bookContent[chapter - 1].contents[versePosition][take];
              i = 5;
            }
          }
          i += 1;
        }
        // Deleting the default one
        if (i !== 6) {
          fs.unlinkSync(path.join(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${result}_default.mp3`)));
          delete audioCurrentChapter.bookContent[chapter - 1].contents[versePosition][take];
          delete audioCurrentChapter.bookContent[chapter - 1].contents[versePosition].default;
        }
      } else {
        delete audioCurrentChapter.bookContent[chapter - 1].contents[versePosition][take];
        fs.unlinkSync(path.join(audioCurrentChapter.filePath, audioCurrentChapter.chapterNum, `${chapter}_${verse}_${result}.mp3`));
      }
      // Since we are not loading the entire component and updating the JSON data (audioContent), we need to update it manually.
      setAudioContent(audioCurrentChapter.bookContent[chapter - 1].contents);
      setTrigger();
      setUpdateWave(!updateWave);
      setNewBlob();
      loadChapter();
    } else {
      setTrigger('record');
    }
  };

  useEffect(() => {
    if (audioContent?.length > 0) {
      fetchUrl();
      setTrigger();
      setTake('take1');
      setNewBlob();
    }
  }, [audioContent, bookId, verse, chapter]);

  return (
    <>
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
    </>

  );
};
export default MainPlayer;
