/* eslint-disable no-unused-vars */
/* eslint-disable no-nested-ternary */
import React, {
  useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import * as localforage from 'localforage';
import moment from 'moment';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { SnackBar } from '@/components/SnackBar';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import ReferenceSelector from '@/components/AudioRecorder/components/ReferenceSelector';
import { isElectron } from '../../../../core/handleElectron';
import packageInfo from '../../../../../../package.json';

const grammar = require('usfm-grammar');

const ReferenceAudio = ({
  languageId,
  refName,
  chapter,
  verse,
  bookId,
  font,
  fontSize,
}) => {
  const {
    actions: {
      setRefernceLoading,
      setCounter,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      username,
    },
  } = useContext(ProjectContext);
  const {
    // states: {
    //   // activeNotificationCount,
    // },
    action: {
      setNotifications,
      // setActiveNotificationCount,
    },
  } = useContext(AutographaContext);

  const [bookData, setBookData] = useState();
  const [mp3Path, setMp3Path] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [displyScreen, setDisplayScreen] = useState(false);
  const { t } = useTranslation();

  const timeout = (ms) => {
    setIsLoading(true);
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  useEffect(() => {
    if (isElectron() && refName) {
      setIsLoading(true);
      setDisplayScreen(false);
      setBookData();
      const fs = window.require('fs');
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      // Fetching the reference list
      localforage.getItem('resources')
      .then((refs) => {
        refs.forEach((ref) => {
          setIsLoading(true);
          const _books = [];
          setDisplayScreen(false);
          // Fetching the selected reference project
          if (ref?.value?.identification?.name?.en === refName) {
            Object.entries(ref.value.type.flavorType.currentScope).forEach(
              ([_bookID, _ingredients]) => {
              _books.push(_bookID);
              // Selected book is available in Project or not
              if (_bookID === bookId.toUpperCase() && refName !== null) {
                const folderPath = path.join(newpath, packageInfo.name, 'users', username, 'resources', refName);
                let bookContent = [];
                const exist = fs.existsSync(path.join(folderPath, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`));
                // The project has any textTranslation data or not
                if (exist) {
                  const usfm = fs.readFileSync(path.join(folderPath, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`), 'utf8');
                  const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
                  const isJsonValid = myUsfmParser.validate();
                  if (isJsonValid) {
                    const jsonOutput = myUsfmParser.toJSON();
                    // Storing the chapters data in a array
                    bookContent = jsonOutput.chapters;
                  } else {
                    setNotify('failure');
                    setSnackText(t('dynamic-msg-invalid-usfm-file'));
                    setOpenSnackBar(true);
                  }
                } else {
                  // Since this project doesn't have text data, we will create a JSON using the versification scheme
                  const value = fs.readFileSync(path.join(folderPath, 'audio', 'ingredients', 'versification.json'), 'utf8');
                  if (value) {
                    const file = JSON.parse(value);
                    const list = file.maxVerses;
                    if (list[bookId.toUpperCase()]) {
                      (list[bookId.toUpperCase()]).forEach((verse, c) => {
                        let contents = [];
                        const verses = [];
                        for (let v = 1; v <= parseInt(verse, 10); v += 1) {
                            verses.push({
                              verseNumber: v.toString(),
                              verseText: '',
                              audio: '',
                            });
                        }
                        contents = contents.concat(verses);
                        bookContent.push({
                          chapterNumber: (c + 1).toString(),
                          contents,
                        });
                      });
                    }
                  }
                }
                // Getting the list of folders
                const folders = fs.readdirSync(path.join(folderPath, 'audio', 'ingredients'));
                folders.forEach((folder) => {
                  // Checking whether the audio is available for the selected book
                  const re = new RegExp(bookId, 'gi');
                  const arr = folder.match(re);
                  if (arr) {
                    const filePath = path.join(folderPath, 'audio', 'ingredients', arr[0]);
                    const folderName = fs.readdirSync(filePath);
                    folderName.forEach((chapterNum) => {
                      if (chapterNum === chapter) {
                        const chapters = fs.readdirSync(path.join(filePath, chapterNum));
                        chapters.forEach((verse) => {
                          // const regex = new RegExp(`${chapter}_(d+)(.*)`, 'g');
                          const url = path.parse(verse).name;
                          const verseNum = url.split('_');
                          Object.entries(bookContent).forEach(
                            ([key]) => {
                              if (bookContent[key].chapterNumber === chapter) {
                                Object.entries(bookContent[key].contents).forEach(
                                  ([v]) => {
                                    if (bookContent[key].contents[v].verseNumber === verseNum[1]) {
                                      // Below 2 lines are for development purpose
                                      // const url = 'https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3';
                                      // bookContent[key].contents[v].audio = url;
                                      bookContent[key].contents[v].audio = verse;
                                    }
                                  },
                                );
                              }
                            },
                          );
                        });
                        setMp3Path(path.join(filePath, chapterNum));
                      }
                    });
                  }
                  // Should only display the content if it has text or audio or both text and audio
                  if (arr || exist) {
                    Object.entries(bookContent).forEach(
                      ([key]) => {
                        if (bookContent[key].chapterNumber === chapter) {
                          setBookData(bookContent[key].contents);
                        }
                      },
                    );
                    setIsLoading(false);
                    setOpenSnackBar(true);
                    setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName }));
                    setNotify('success');
                    setDisplayScreen(false);
                  }
                });
              }

              if (_ingredients.scope === undefined) {
                if (_books.includes(bookId.toUpperCase()) === false) {
                  setDisplayScreen(true);
                }
              }
              },
            );
          } else {
            timeout(3000).then(() => {
              setDisplayScreen(true);
            });
          }
        });
      }).catch((err) => {
        // we got an error
          setOpenSnackBar(true);
          setSnackText(t('dynamic-msg-load-ref-bible-snack-fail', { refName }));
          setNotify('failure');
        localforage.getItem('notification').then((value) => {
          const temp = [...value];
          temp.push({
              title: t('label-resources'),
              text: t('dynamic-msg-load-ref-bible-snack-fail', { refName }),
              type: 'failure',
              time: moment().format(),
              hidden: true,
          });
          setNotifications(temp);
        });
        throw err;
      }).finally(() => {
        setIsLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, refName, chapter]);

  return (
    <span>
      {bookData && (
          isLoading === false ? (
            <ReferenceSelector
              data={bookData}
              versepath={mp3Path}
              verse={verse}
              font={font}
              fontSize={fontSize}
            //   goToVerse={{
            //     chapter: parseInt(chapter, 10),
            //     verse: parseInt(verse, 10),
            //     key: Date.now(),
            // }}
            />
          ) : (
            displyScreen === true ? (
              <EmptyScreen />
            ) : (<LoadingScreen />)
          )
        )}
      {bookData === undefined && (
          displyScreen === true ? (
            <EmptyScreen />
          )
          : <LoadingScreen />
        )}
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
    </span>
  );
};

export default ReferenceAudio;

ReferenceAudio.propTypes = {
  languageId: PropTypes.string,
  refName: PropTypes.string,
  chapter: PropTypes.string,
  verse: PropTypes.string,
  bookId: PropTypes.string,
};
