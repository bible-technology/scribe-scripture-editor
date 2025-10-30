import PropTypes from 'prop-types';
import Editor from '@/modules/editor/Editor';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import { readFile } from '@/core/editor/readFile';
import { isElectron } from '@/core/handleElectron';
import { useState, useEffect, useContext } from 'react';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { readRefMeta } from '@/core/reference/readRefMeta';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import VideoPlayer from '@/components/EditorPage/VideoEditor/VideoPlayer';
import { getDetails } from '../ObsEditor/utils/getDetails';
import * as logger from '../../../logger';

const grammar = require('usfm-grammar');

const VideoEditor = ({ editor }) => {
  const { t } = useTranslation();
  const [notify, setNotify] = useState();
  const [snackText, setSnackText] = useState('');
  const [snackBar, setOpenSnackBar] = useState(false);
  const [displyScreen, setDisplayScreen] = useState(false);
  const [model, setModel] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
    action: '',
    actionData: {},
  });
  const modelClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
      action: '',
      actionData: {},
    });
  };
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
      updateWave,
    }, actions: {
      onChangeVerse,
      setIsLoading,
      setAudioContent,
      setAudioCurrentChapter,
      setAudioPath,
    },
  } = useContext(ReferenceContext);

  const executeDeleteVideo = (verseNumber, videoFileName) => {
    try {
      const fs = window.require('fs');
      const path = require('path');
      const videoPath = path.join(audioPath, videoFileName);

      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        logger.info('Video file deleted:', videoPath);
      }
      const updatedContent = audioContent.map((item) => {
        if (item.verseNumber === verseNumber) {
          const updated = { ...item };
          delete updated.take1;
          delete updated[updated.default];
          updated.default = '';
          return updated;
        }
        return item;
      });

      setAudioContent(updatedContent);
      setNotify('success');
      setSnackText(t('msg-video-deleted-success') || 'Video deleted successfully');
      setOpenSnackBar(true);
    } catch (err) {
      setNotify('failure');
      setSnackText(t('msg-video-delete-failed') || 'Failed to delete video. Please try again.');
      logger.error('Error deleting video file:', err);
      setOpenSnackBar(true);
      return false;
    }
  };

  const handleModalConfirm = () => {
    if (model.action === 'deleteVideo') {
      executeDeleteVideo(model.actionData.verseNumber, model.actionData.videoFileName);
    } else if (model.action === 'reRecordVideo') {
      try {
        const fs = window.require('fs');
        if (fs.existsSync(model.actionData.filePath)) {
          fs.unlinkSync(model.actionData.filePath);
          logger.info('Deleted existing video for re-recording');
        }
      } catch (err) {
        setNotify('failure');
        setSnackText('Failed to delete existing video');
        logger.error('Error deleting existing video file:', err);
        setOpenSnackBar(true);
      }
    }
    modelClose();
  };

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
                      if (key === bookId.toUpperCase() && _data.type.flavorType.currentScope[key].includes(chapter.toString())) {
                        _books.push(bookId.toUpperCase());
                        const fs = window.require('fs');
                        const path = require('path');
                        let bookContent = [];
                        const exists = fs.existsSync(path.join(projectsDir, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`));
                        if (exists) {
                          const usfm = fs.readFileSync(path.join(projectsDir, 'text-1', 'ingredients', `${bookId.toUpperCase()}.usfm`), 'utf8');
                          const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
                          const isJsonValid = myUsfmParser.validate();
                          if (isJsonValid) {
                            const jsonOutput = myUsfmParser.toJSON();
                            bookContent = jsonOutput.chapters;
                          } else {
                            setNotify('failure');
                            setSnackText(t('dynamic-msg-invalid-usfm-file'));
                            setOpenSnackBar(true);
                          }
                        } else {
                          await readFile({
                            projectname: projectName,
                            filename: path.join('video', 'ingredients', 'versification.json'),
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

                        if (!fs.existsSync(path.join(projectsDir, 'video', 'ingredients', bookId.toUpperCase()))) {
                          fs.mkdirSync(path.join(projectsDir, 'video', 'ingredients', bookId.toUpperCase()));
                        }
                        const folders = fs.readdirSync(path.join(projectsDir, 'video', 'ingredients'));
                        folders.forEach((folder) => {
                          const re = new RegExp(bookId, 'gi');
                          const arr = folder.match(re);
                          if (arr) {
                            const filePath = path.join(projectsDir, 'video', 'ingredients', arr[0]);
                            if (!fs.existsSync(path.join(filePath, chapter.toString()))) {
                              fs.mkdirSync(path.join(filePath, chapter.toString()));
                            }
                            const folderName = fs.readdirSync(filePath);
                            folderName.forEach((chapterNum) => {
                              if (chapterNum === chapter) {
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
                                              if (verseNum[2]) {
                                                const take = `take${verseNum[2]}`;
                                                bookContent[key].contents[v][take] = verse;
                                                if (verseNum[3] === 'default') {
                                                  bookContent[key].contents[v].default = take;
                                                }
                                              } else {
                                                bookContent[key].contents[v].take1 = `${chapter}_${verseNum[1]}_1_default.mp4`;
                                                bookContent[key].contents[v].default = 'take1';
                                                fs.renameSync(path.join(filePath, chapterNum, verse), path.join(filePath, chapterNum, `${chapter}_${verseNum[1]}_1_default.mp4`));
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
                          if (arr || exists) {
                            Object.entries(bookContent).forEach(
                              ([key]) => {
                                if (bookContent[key].chapterNumber === chapter.toString()) {
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
  }, [bookId, chapter]);
  return (
    <Editor callFrom="textTranslation" editor={editor}>
      {((isLoading || !audioContent) && displyScreen) && <EmptyScreen call="video" />}
      {isLoading && !displyScreen && <LoadingScreen />}
      {audioContent && isLoading === false
        && (
          <VideoPlayer
            content={audioContent}
            onChangeVerse={onChangeVerse}
            verse={verse}
            location={audioPath}
            updateWave={updateWave}
            fontSize={editorFontSize}
            selectedFont={selectedFont}
            setOpenModal={setModel}
            onDeleteVideo={executeDeleteVideo}
            chapter={chapter}
            bookId={bookId}
          />
        )}
      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modelClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => handleModalConfirm()}
      />
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
export default VideoEditor;

VideoEditor.propTypes = {
  editor: PropTypes.string,
};
