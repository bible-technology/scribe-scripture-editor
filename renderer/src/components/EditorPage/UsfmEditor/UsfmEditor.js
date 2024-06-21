/* eslint-disable react-hooks/exhaustive-deps */
import React, {
  useContext,
  useEffect,
  // useRef,
  useState,
  useMemo,
  useCallback,
  useLayoutEffect,
} from 'react';
import * as localforage from 'localforage';
import {
  createBasicUsfmEditor,
  withChapterPaging,
  //  withChapterSelection,
} from 'usfm-editor';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import Editor from '@/modules/editor/Editor';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import SaveIndicator from '@/components/Loading/SaveIndicator';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { readRefMeta } from '../../../core/reference/readRefMeta';
import { readRefBurrito } from '../../../core/reference/readRefBurrito';
import { readFile } from '../../../core/editor/readFile';
// import writeToParse from '../../../core/editor/writeToParse';
import { isElectron } from '../../../core/handleElectron';
import writeToFile from '../../../core/editor/writeToFile';
import packageInfo from '../../../../../package.json';
import { environment } from '../../../../environment';
// import InputSelector from './InputSelector';
// import fetchFromParse from '../../../core/editor/fetchFromParse';
// import findBookFromParse from '../../../core/editor/findBookFromParse';

const UsfmEditor = () => {
  // const intervalRef = useRef();
  const [usfmInput, setUsfmInput] = useState();
  const [usfmData, setUsfmData] = useState();
  const [readOnly] = useState(false);

  const [displyScreen, setDisplayScreen] = useState(false);
  // const [activeTyping, setActiveTyping] = useState(false);
  // const [identification, setIdentification] = useState();
  // const [goToVersePropValue, setGoToVersePropValue] = useState({});
  // const projectName = 'Spanish Pro';
  const supportedBooks = null; // if empty array or null then all books available
  const { t } = useTranslation();
  const {
    states: {
      scrollLock,
    },
    actions: {
      setEditorSave,
    },
  } = useContext(ProjectContext);

  const {
    state: {
      bookId,
      chapter,
      verse,
      myEditorRef,
      isLoading,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
      setIsLoading,
      goToChapter,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    applyBooksFilter(supportedBooks);
  }, [applyBooksFilter, supportedBooks]);

  const CustomEditor = useMemo(
    () => ((withChapterPaging(createBasicUsfmEditor()))),
    [usfmInput],
  );

  const timeout = (ms) => {
    setIsLoading(true);
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  // const goToChapter = () => (
  //     {
  //       chapter: parseInt(chapter, 10),
  //       verse: parseInt(verse, 10),
  //     }
  // );

  // const saveToParse = async () => {
  //   try {
  //     const usfm = await localforage.getItem('editorData');
  //     writeToParse({
  //       username, projectName, usfmData: usfm, scope: _bookId.toUpperCase(), write: true,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // handle on active state change
  // useEffect(() => {
  //   if (activeTyping) {
  //     intervalRef.current = setInterval(() => {
  //       saveToParse();
  //       setActiveTyping(false);
  //     }, 5000);
  //   } else {
  //     clearInterval(intervalRef.current);
  //   }
  // }, [activeTyping]);

  // handle unmount
  // useEffect(() => {
  //   localStorage.setItem('_tabhistory', 'Editor');
  //   const intervalId = intervalRef.current;
  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, []);

  const handleInputChange = useCallback((usfm) => {
    setUsfmInput(usfm);
  }, [usfmInput]);

  // reference tabs navigation

  const handleVersChange = useCallback((val) => {
      if (val && scrollLock === false) {
        // onChangeChapter(val.chapter.toString());
        onChangeVerse(val.verseStart.toString(), verse);
      }
    }, [onChangeChapter, onChangeVerse]);

  // const onIdentificationChange = useCallback(
  //   (id) => {
  //     const identification = typeof id === 'string' ? JSON.parse(id) : id;
  //     setIdentification(identification);
  //     // onChangeBook((identification.id).toLowerCase());
  //   },
  //   [bookId],
  // );

  useEffect(() => {
    if (scrollLock === false) {
      onChangeBook(bookId.toLowerCase());
      onChangeChapter(chapter.toLowerCase());
    }
  }, []);

  useEffect(() => {
    if (!isElectron()) {
      // findBookFromParse({
      //   username, projectName, scope: _bookId.toUpperCase(),
      // }).then((scopefiles) => {
      //   scopefiles.forEach((file) => {
      //     if (file === _bookId.toUpperCase()) {
      //       fetchFromParse({
      //         username, projectName, scope: _bookId.toUpperCase(),
      //       }).then(async (data) => {
      //         if (data) {
      //           localforage.setItem('editorData', data).then(
      //             () => localforage.getItem('editorData'),
      //           ).then(() => {
      //             handleInputChange(data);
      //           }).catch((err) => {
      //             // we got an error
      //             throw err;
      //           });
      //         }
      //       });
      //     } else {
      //       handleInputChange(undefined);
      //     }
      //   });
      // });
    } else {
      setUsfmInput();
      setUsfmData();
      setDisplayScreen(false);
      setIsLoading(true);
      localforage.getItem('userProfile').then((value) => {
        const username = value?.username;
        localforage.getItem('currentProject').then((projectName) => {
          const path = require('path');
          const newpath = localStorage.getItem('userPath');
          const projectsDir = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName);
          const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'metadata.json');
          readRefMeta({
            projectsDir,
          }).then((refs) => {
            setIsLoading(true);
            refs.forEach(() => {
              readRefBurrito({
                metaPath,
              }).then((data) => {
                if (data) {
                  const _data = JSON.parse(data);
                  const _books = [];
                  let flag = false;
                  Object.entries(_data.ingredients).forEach(
                    ([key, _ingredients]) => {
                      if (_ingredients?.scope) {
                        const _bookID = Object.entries(_ingredients.scope)[0][0];
                        _books.push(_bookID);
                        if (_bookID === bookId.toUpperCase()) {
                          readFile({
                            projectname: projectName,
                            filename: key,
                            username,
                          }).then((data) => {
                            if (data) {
                                timeout(2000).then(() => {
                                  localforage.getItem('navigationHistory').then((book) => {
                                    if (book) {
                                      onChangeBook(book[0]);
                                    }
                                    return book;
                                    }).then((book) => {
                                      onChangeChapter(book[1]);
                                      if (book[0].toUpperCase() !== bookId.toUpperCase()) {
                                        setDisplayScreen(true);
                                      } else {
                                        flag = true;
                                        handleInputChange(data);
                                      }
                                    });
                                }).finally(() => {
                                  setIsLoading(false);
                                  setDisplayScreen(false);
                                });
                            }
                          });
                        }

                        // console.log(Object.entries(_ingredients.scope));
                      }
                      // console.log(key, value),
                    },
                  );
                  if (_books.includes(bookId.toUpperCase()) === false && flag === false) {
                    setDisplayScreen(true);
                    setIsLoading(false);
                  }
                }
              });
            });
          });
        });
      });
    }
  }, [bookId]);

  // useEffect(() => {
  //   if (!isElectron()) {
      // fetchFromParse({
      //   username, projectName, scope: _bookId.toUpperCase(),
      // }).then((data) => {
      //   if (data) {
      //     localforage.setItem('editorData', data).then(
      //       () => localforage.getItem('editorData'),
      //     ).then(() => {
      //       handleInputChange(data);
      //     }).catch((err) => {
      //       // we got an error
      //       throw err;
      //     });
      //   }
      // });
    // } else {
    //   setDisplayScreen(false);
    //   timeout(1000).then(() => {
    //       localforage.getItem('navigationHistory').then((book) => {
    //         if (book) {
    //         onChangeBook(book[0]);
    //         onChangeChapter(book[1]);
    //         console.log(book[0],
    //           book[1]);
    //         }
    //       });
    //   }).then(() => {
    //   localforage.getItem('userProfile').then((value) => {
    //     const username = value?.username;
    //     localforage.getItem('currentProject').then((projectName) => {
    //     readRefMeta({
    //       projectname: projectName,
    //       username,
    //     }).then((refs) => {
    //       refs.forEach((ref) => {
    //         readRefBurrito({
    //           projectname: projectName,
    //           filename: ref,
    //           username,
    //         }).then((data) => {
    //           if (data) {
    //             const _data = JSON.parse(data);
    //             Object.entries(_data.ingredients).forEach(
    //               ([key, _ingredients]) => {
    //                 if (_ingredients.scope) {
    //                   const _bookID = Object.entries(_ingredients.scope)[0][0];
    //                   if (_bookID === bookId.toUpperCase()) {
    //                     readFile({
    //                       projectname: projectName,
    //                       filename: key,
    //                       username,
    //                     }).then((data) => {
    //                       console.log('>>>>>>', data);
    //                       if (data) {
    //                         handleInputChange(data);
    //                         setDisplayScreen(false);
    //                       } else {
    //                         setDisplayScreen(true);
    //                       }
    //                     });
    //                   }
    //                 }
    //               },
    //             );
    //           }
    //         });
    //       });
    //     });
    //     });
    //   });
    // });
    // }
  // }, []);

  const autoSaveIndication = () => {
    setEditorSave(<SaveIndicator />);
    setTimeout(() => {
      setEditorSave(t('label-saved'));
  }, 1000);
  };

  const handleEditorChange = (usfm) => {
    if (isElectron()) {
      localforage.getItem('userProfile').then((value) => {
        const username = value?.username;
        localforage.getItem('currentProject').then((projectName) => {
          const path = require('path');
          const fs = window.require('fs');
          const newpath = localStorage.getItem('userPath');
          const projectsDir = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName);
          const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'metadata.json');
          readRefMeta({
            projectsDir,
          }).then((refs) => {
            refs.forEach(() => {
              readRefBurrito({
                metaPath,
              }).then((data) => {
                if (data) {
                  const setting = fs.readFileSync(path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'ingredients', environment.PROJECT_SETTING_FILE), 'utf8');
                  const settings = JSON.parse(setting);
                  settings.project.textTranslation.lastSeen = moment().format();
                  fs.writeFileSync(path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'ingredients', environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
                  const _data = JSON.parse(data);
                  Object.entries(_data.ingredients).forEach(
                    ([key, _ingredients]) => {
                      if (_ingredients.scope) {
                        const _bookID = Object.entries(_ingredients.scope)[0][0];
                        if (_bookID === bookId.toUpperCase()) {
                          const arrayOfLines = usfm.split('\n');
                          const splitLine = arrayOfLines[0].split(/ +/);
                          if (splitLine[0] === '\\id') {
                              const id = splitLine[1];
                              if (id.toUpperCase() === bookId.toUpperCase()) {
                                setTimeout(() => {
                                    writeToFile({
                                      username,
                                      projectname: projectName,
                                      filename: key,
                                      data: usfm,
                                    });
                                    setUsfmData(usfm);
                                    autoSaveIndication();
                                }, 2000);
                              }
                            }
                        }
                      }
                      // console.log(key, value),
                    },
                  );
                }
              });
            });
          });
        });
      });
    }
    // else {
    //   localforage.setItem('editorData', usfm).then(
    //     () => localforage.getItem('editorData'),
    //   ).then(() => {
    //     setActiveTyping(true);
    //   }).catch((err) => {
    //     // we got an error
    //     throw err;
    //   });
    // }
  };
  useLayoutEffect(() => {
    handleInputChange(usfmData);
  }, [isLoading]);
  // useEffect(() => {
  //   setGoToVersePropValue({
  //     chapter: parseInt(chapter, 10),
  //     verse: parseInt(verse, 10),
  //     key: Date.now(),
  //   });
  // }, []);

  return (
    <Editor callFrom="textTranslation">
      <>
        {((isLoading || !usfmInput) && displyScreen) && <EmptyScreen />}
        {isLoading && !displyScreen && <LoadingScreen /> }
        {usfmInput && !displyScreen && !isLoading && (
        <CustomEditor
          ref={myEditorRef}
          usfmString={usfmInput}
          key={usfmInput}
          onChange={handleEditorChange}
          onVerseChange={handleVersChange}
          readOnly={readOnly}
          goToVerse={goToChapter()}
        />
          )}
      </>
    </Editor>
  );
};

export default UsfmEditor;
