/* eslint-disable no-nested-ternary */
import React, {
 useContext, useEffect, useState, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import {
  createBasicUsfmEditor, withChapterPaging,
 } from 'usfm-editor';
import { useTranslation } from 'react-i18next';
import * as localforage from 'localforage';
import moment from 'moment';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { readIngredients } from '@/core/reference/readIngredients';
import { ProjectContext } from '@/components/context/ProjectContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { SnackBar } from '@/components/SnackBar';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { isElectron } from '../../../../core/handleElectron';
import packageInfo from '../../../../../../package.json';
// General scroll to element function

const ReferenceBible = ({
 languageId,
  refName,
  chapter,
  verse,
  bookId,
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
  // const regExp = /\(([^)]+)\)/;
  const [usfmInput, setUsfmInput] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [displyScreen, setDisplayScreen] = useState(false);
  const { t } = useTranslation();

  const CustomEditor = useMemo(
    () => (withChapterPaging(createBasicUsfmEditor())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usfmInput],
  );

  const timeout = (ms) => {
    setIsLoading(true);
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  useEffect(() => {
    if (isElectron() && refName) {
      setIsLoading(true);
      setDisplayScreen(false);
      setUsfmInput();
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      localforage.getItem('resources')
      .then((refs) => {
        refs.forEach((ref) => {
          setIsLoading(true);
          const _books = [];
          setDisplayScreen(false);
          if (ref?.value && ref?.value?.languages && ref?.value?.languages[0]?.name?.en === languageId) {
            Object.entries(ref.value.ingredients).forEach(
              ([key, _ingredients]) => {
                if (_ingredients.scope) {
                  const _bookID = Object.entries(_ingredients.scope)[0][0];
                  _books.push(_bookID);
                  if (_bookID.split('-').pop() === bookId.toUpperCase() && refName !== null) {
                    const filePath = path.join(newpath, packageInfo.name, 'users', username, 'resources', refName, key);
                    readIngredients({
                      filePath,
                    }).then((res) => {
                      timeout(2000).then(() => {
                        setUsfmInput(res);
                      }).finally(() => {
                        setIsLoading(false);
                        setOpenSnackBar(true);
                        setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName }));
                        setNotify('success');
                        setDisplayScreen(false);
                      });
                      setRefernceLoading({
                        status: true,
                        text: t('dynamic-msg-load-ref-bible-success'),
                      });
                      setCounter(4);
                    });

                    const commonResourcePath = path.join(newpath, packageInfo.name, 'common', 'resources', refName, key);
                    readIngredients({
                      filePath: commonResourcePath,
                    }).then((res) => {
                      timeout(2000).then(() => {
                        setUsfmInput(res);
                      }).finally(() => {
                        setIsLoading(false);
                        setOpenSnackBar(true);
                        setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName }));
                        setNotify('success');
                        setDisplayScreen(false);
                      });
                      setRefernceLoading({
                        status: true,
                        text: t('dynamic-msg-load-ref-bible-success'),
                      });
                      setCounter(4);
                    });
                    // .then(() => {
                    //     localforage.getItem('notification').then((value) => {
                    //         const temp = [...value];
                    //         if (temp.length !== 0) {
                    //           temp.push({
                    //             title: 'Resources',
                    //             text: `successfully loaded ${refName} files`,
                    //             type: 'success',
                    //             time: moment().format(),
                    //             hidden: true,
                    //         });
                    //           setNotifications(temp);
                    //           setActiveNotificationCount(activeNotificationCount + 1);
                    //         }
                    //       });
                    // });
                  }
                }
                if (_ingredients.scope === undefined) {
                  if (_books.includes(bookId.toUpperCase()) === false) {
                    setDisplayScreen(true);
                  }
                }
                // console.log(key, value),
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
              title: t('label-resource'),
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
  }, [bookId, languageId, refName]);

    // seting book scope for navigation
    // localforage.getItem('refBibleBurrito')
    //   .then((refs) => {
    //     refs.forEach((ref) => {
    //       if (ref.languages[0].tag === regExp.exec(languageId)[1]) {
    //         const scope = [];
    //         Object.entries((ref.type.flavorType.currentScope)).forEach(
    //             ([key]) => {
    //               scope.push(key);
    //               console.log(scope);
    //             },
    //             );
    //           }
    //         });
    //       });

  return (
    <span>
      {usfmInput && (
          isLoading === false ? (
            <CustomEditor
              usfmString={usfmInput}
              key={usfmInput}
              readOnly
              goToVerse={{
                chapter: parseInt(chapter, 10),
                verse: parseInt(verse, 10),
                key: Date.now(),
            }}
            />
          ) : (
            displyScreen === true ? (
              <EmptyScreen />
            ) : (<LoadingScreen />)
          )
        )}
      {usfmInput === undefined && (
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

export default ReferenceBible;

ReferenceBible.propTypes = {
  languageId: PropTypes.string,
  refName: PropTypes.string,
  chapter: PropTypes.string,
  verse: PropTypes.string,
  bookId: PropTypes.string,
};
