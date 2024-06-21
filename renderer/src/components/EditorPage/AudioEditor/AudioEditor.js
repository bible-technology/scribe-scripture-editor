/* eslint-disable no-nested-ternary */
import { useState, useEffect, useContext } from 'react';
import Editor from '@/modules/editor/Editor';
import PropTypes from 'prop-types';
import { isElectron } from '@/core/handleElectron';
import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { readFile } from '@/core/editor/readFile';
import EditorPage from '@/components/AudioRecorder/components/EditorPage';
import { SnackBar } from '@/components/SnackBar';
import { useTranslation } from 'react-i18next';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { getDetails } from '../ObsEditor/utils/getDetails';

const grammar = require('usfm-grammar');

const AudioEditor = ({ editor }) => {
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [displyScreen, setDisplayScreen] = useState(false);
  const { t } = useTranslation();
  const {
    state: {
      bookId,
      chapter,
      verse,
      isLoading,
      audioContent,
      audioPath,
      selectedFont,
      editorFontSize,
      // eslint-disable-next-line no-unused-vars
      updateWave, // updateWave is used to update the waveform in the Editor after recording audio
    }, actions: {
      onChangeVerse,
      setIsLoading,
      setAudioContent,
      setAudioCurrentChapter,
      setAudioPath,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    if (isElectron()) {
      setIsLoading(true);
      setDisplayScreen(false);
      setAudioCurrentChapter();
      setAudioPath();
      getDetails()
      .then(({
        projectName, username, projectsDir, metaPath,
        }) => {
        readRefMeta({
          projectsDir,
        }).then((refs) => {
          // setIsLoading(true);
          refs.forEach(() => {
            readRefBurrito({
              metaPath,
            }).then((data) => {
              if (data) {
                const _data = JSON.parse(data);
                const _books = [];
                Object.entries(_data.type.flavorType.currentScope).forEach(
                  async ([key]) => {
                    if (key === bookId.toUpperCase()) {
                      _books.push(bookId.toUpperCase());
                      const fs = require('graceful-fs');
                      const path = require('path');
                      let bookContent = [];
                      const exists = fs.existsSync(path.join(projectsDir, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`));
                      // The project has any textTranslation data or not
                      if (exists) {
                        const usfm = fs.readFileSync(path.join(projectsDir, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`), 'utf8');
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
                        await readFile({
                          projectname: projectName,
                          filename: 'audio/ingredients/versification.json',
                          username,
                        }).then((value) => {
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
                        });
                      }

                      if (!fs.existsSync(path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase()))) {
                        fs.mkdirSync(path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase()));
                      }
                      // Getting the list of folders
                      const folders = fs.readdirSync(path.join(projectsDir, 'audio', 'ingredients'));
                      folders.forEach((folder) => {
                        // Checking whether the audio is available for the selected book
                        const re = new RegExp(bookId, 'gi');
                        const arr = folder.match(re);
                        if (arr) {
                          const filePath = path.join(projectsDir, 'audio', 'ingredients', arr[0]);
                          if (!fs.existsSync(path.join(filePath, chapter))) {
                            fs.mkdirSync(path.join(filePath, chapter));
                          }
                          const folderName = fs.readdirSync(filePath);
                          folderName.forEach((chapterNum) => {
                            if (chapterNum === chapter) {
                              // Setting the bookContent to use it for updating the frontend data after every record,defaulting etc... without loading whole page
                              setAudioCurrentChapter({ bookContent, filePath, chapterNum });
                              const chapters = fs.readdirSync(path.join(filePath, chapterNum));
                              chapters.forEach((verse) => {
                                const url = path.parse(verse).name;
                                const verseNum = url.split('_');
                                Object.entries(bookContent).forEach(
                                  ([key]) => {
                                    if (bookContent[key].chapterNumber === chapter) {
                                      Object.entries(bookContent[key].contents).forEach(
                                        ([v]) => {
                                          if (bookContent[key].contents[v].verseNumber === verseNum[1]) {
                                            // const url = 'https://www.mfiles.co.uk/mp3-downloads/brahms-st-anthony-chorale-theme-two-pianos.mp3';
                                            if (verseNum[2]) {
                                              const take = `take${verseNum[2]}`;
                                              // Replacing url with verse, url is used for development purpose
                                              bookContent[key].contents[v][take] = verse;
                                              if (verseNum[3] === 'default') {
                                                bookContent[key].contents[v].default = take;
                                              }
                                            } else {
                                              // If found only one audio for the verse then making that audio as default one.
                                              // replace url with `${chapter}_${verseNum[1]}_1_default.mp3`
                                              bookContent[key].contents[v].take1 = `${chapter}_${verseNum[1]}_1_default.mp3`;
                                              bookContent[key].contents[v].default = 'take1';
                                              fs.renameSync(path.join(filePath, chapterNum, verse), path.join(filePath, chapterNum, `${chapter}_${verseNum[1]}_1_default.mp3`));
                                            }
                                          }
                                        },
                                      );
                                    }
                                  },
                                );
                              });
                              setAudioPath(path.join(filePath, chapterNum));
                            }
                          });
                        }
                        // Should only display the content if it has text or audio or both text and audio
                        if (arr || exists) {
                          Object.entries(bookContent).forEach(
                            ([key]) => {
                              if (bookContent[key].chapterNumber === chapter) {
                                // Storing the content in the ReferenceContext for the MainPlayer component
                                setAudioContent(bookContent[key].contents);
                              }
                            },
                          );
                          setIsLoading(false);
                          setOpenSnackBar(true);
                          setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName: projectName }));
                          setNotify('success');
                          setDisplayScreen(false);
                        } else {
                          setDisplayScreen(true);
                        }
                      });
                    }
                  },
                );
                if (_books.includes(bookId.toUpperCase()) === false) {
                  setAudioContent();
                  setDisplayScreen(true);
                }
              }
            });
          });
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, chapter]);
  return (
    <Editor callFrom="textTranslation" editor={editor}>
      {((isLoading || !audioContent) && displyScreen) && <EmptyScreen />}
      {isLoading && !displyScreen && <LoadingScreen /> }
      {audioContent && isLoading === false
      && (
      <EditorPage
        content={audioContent}
        onChangeVerse={onChangeVerse}
        verse={verse}
        location={audioPath}
        updateWave={updateWave}
        fontSize={editorFontSize}
        selectedFont={selectedFont}
      />
)}
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
    </Editor>
  );
 };
 export default AudioEditor;

 AudioEditor.propTypes = {
  editor: PropTypes.string,
};
