import { useEffect, useState } from 'react';
import localforage from 'localforage';
import { readRefBurrito } from '../../../../core/reference/readRefBurrito';
import { readFile } from '../../../../core/editor/readFile';
import packageInfo from '../../../../../../package.json';

export const useReadUsfmFile = (bookId) => {
  const [bookAvailable, setbookAvailable] = useState(false);
  const [usfmString, setUsfmString] = useState('');
  const [loading, setLoading] = useState(true);
  const [booksInProject, setBooksInProject] = useState([]);
  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    async function readLocalFile() {
      if (!bookId) {
        return;
      }
      setLoading(true);
      try {
        const userProfile = await localforage.getItem('userProfile');
        const userName = userProfile?.username;
        const projectName = await localforage.getItem('currentProject');
        const path = require('path');
        const newpath = localStorage.getItem('userPath');
        const metaPath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json');
        const metaData = JSON.parse(await readRefBurrito({ metaPath }));
        const _books = [];
        Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
          if (_ingredients.scope) {
            const _bookID = Object.entries(_ingredients.scope)[0][0];
            const bookObj = { bookId: _bookID, fileName: key };
            _books.push(bookObj);
          }
        });
        setBooksInProject(_books.map((bookObj) => bookObj.bookId.toLowerCase()));
        const [currentBook] = _books.filter((bookObj) => bookObj.bookId === bookId?.toUpperCase());
        const _filePath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'ingredients', `${bookId?.toUpperCase()}.usfm`);
        setFilePath(_filePath);
        if (currentBook !== undefined) {
          const fileData = await readFile({ projectname: projectName, filename: currentBook.fileName, username: userName });

          setbookAvailable(true);
          setUsfmString(fileData);
        } else {
          setbookAvailable(false);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        // eslint-disable-next-line no-console
        return console.log(err);
      }
    }
    readLocalFile();
  }, [bookId]);
  return {
    bookAvailable,
    usfmString,
    bookId,
    loading,
    booksInProject,
    filePath,
  };
};
