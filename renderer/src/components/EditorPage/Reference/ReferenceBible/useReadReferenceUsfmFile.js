import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import localforage from 'localforage';
import moment from 'moment';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { AutographaContext } from '@/components/context/AutographaContext';
import { readIngredients } from '@/core/reference/readIngredients';

//  hook to fetch usfmfile from system drive
export const useReadReferenceUsfmFile = ({
  bookId,
  refName,
  languageId,
  username,
  scrollLock,
  setIsLoading,
  setOpenSnackBar,
  setSnackText,
  setNotify,
  setDisplayScreen,
}) => {
  const [usfmData, setUsfmData] = useState([]);
  const [bookAvailable, setBookAvailable] = useState(false);

  const {
    actions: {
      setRefernceLoading,
      setCounter,
    },
  } = useContext(ReferenceContext);

  const {
    action: {
      setNotifications,
    },
  } = useContext(AutographaContext);
  const { t } = useTranslation();

  useEffect(() => {
    setUsfmData([]);
    setBookAvailable(true);
  }, [refName, scrollLock]);

  useEffect(() => {
    async function readLocalFile() {
      try {
        setIsLoading(true);
        setDisplayScreen(false);
        const path = require('path');
        const newpath = localStorage.getItem('userPath');
        const localForageResources = await localforage.getItem('resources');
        const chosenResource = localForageResources.find((resource) => resource.projectDir === refName);
        if (chosenResource?.value && chosenResource?.value?.languages && chosenResource?.value?.languages[0]?.name?.en === languageId) {
          const _books = [];
          Object.entries(chosenResource.value.ingredients).forEach(
            async ([key, ingredient]) => {
              if (ingredient.scope) {
                const _bookID = Object.entries(ingredient.scope)[0][0];
                _books.push(_bookID);
                if (Object.keys(ingredient.scope)[0].toLowerCase() === bookId.toLowerCase()) {
                  if (chosenResource.type === 'user') {
                    const filePath = path.join(newpath, 'autographa', 'users', username, 'resources', refName, key);
                    const fileIngredients = await readIngredients({ filePath });
                    const books = [{
                      selectors: { org: refName, lang: 'en', abbr: 'ult' },
                      bookCode: bookId.toLowerCase(),
                      data: fileIngredients,
                    }];
                    setBookAvailable(true);
                    setUsfmData(books);
                    setIsLoading(false);
                    setOpenSnackBar(true);
                    setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName }));
                    setNotify('success');
                    setDisplayScreen(false);
                    setRefernceLoading({
                      status: true,
                      text: t('dynamic-msg-load-ref-bible-success'),
                    });
                    setCounter(4);
                  } else if (chosenResource.type === 'common') {
                    const commonResourcePath = path.join(newpath, 'autographa', 'common', 'resources', refName, key);
                    const commonResourceIngredients = await readIngredients({ filePath: commonResourcePath });
                    const books = [{
                      selectors: { org: refName, lang: 'en', abbr: 'ult' },
                      bookCode: bookId.toLowerCase(),
                      data: commonResourceIngredients,
                    }];
                    setBookAvailable(true);
                    setUsfmData(books);
                    setIsLoading(false);
                    setOpenSnackBar(true);
                    setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName }));
                    setNotify('success');
                    setDisplayScreen(false);
                    setRefernceLoading({
                      status: true,
                      text: t('dynamic-msg-load-ref-bible-success'),
                    });
                    setCounter(4);
                  } else {
                    setUsfmData([]);
                    setBookAvailable(false);
                    setIsLoading(false);
                  }
                }
              }
              if (ingredient.scope === undefined) {
                if (_books.includes(bookId.toUpperCase()) === false) {
                  setDisplayScreen(true);
                }
              }
            },
          );
        }
      } catch (err) {
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
        return console.log(err);
      }
    }
    readLocalFile();
  }, [bookId, refName, scrollLock]);
  return { usfmData, bookAvailable };
};
