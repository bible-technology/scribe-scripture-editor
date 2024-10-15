import { useEffect, useState } from 'react';
import localforage from 'localforage';
import { readRefBurrito } from '../../../../core/reference/readRefBurrito';
import { readFile } from '../../../../core/editor/readFile';
import packageInfo from '../../../../../../package.json';
import { handleCache } from '../cacheUtils';

export const useReadUsfmFile = (bookId) => {
  const [usfmData, setUsfmData] = useState([]);
  const [bookAvailable, setbookAvailable] = useState(false);
  const [usfmString, setUsfmString] = useState('');
  const [cachedData, setCachedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [booksInProject, setBooksInProject] = useState([]);

  useEffect(() => {
    async function readLocalFile() {
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
        const projectCachePath = path.join(newpath, packageInfo.name, 'users', userName, 'project_cache', projectName);
        const fileCacheMapPath = path.join(projectCachePath, 'fileCacheMap.json');
        const filePath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'ingredients', `${bookId?.toUpperCase()}.usfm`);
        if (currentBook) {
          const fileData = await readFile({ projectname: projectName, filename: currentBook.fileName, username: userName });
          const cachedData = await handleCache(filePath, fileData, projectCachePath, fileCacheMapPath);
          const books = [{
            selectors: { org: 'unfoldingWord', lang: 'en', abbr: 'ult' },
            bookCode: currentBook.bookId?.toLowerCase(),
            data: fileData,
          }];
          setUsfmData(books);
          setbookAvailable(true);
          setUsfmString(fileData);
          setCachedData(cachedData);
        } else {
          setUsfmData([]);
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
    usfmData, bookAvailable, usfmString, bookId, cachedData, loading, booksInProject,
  };
};

export async function getCachePaths(bookId) {
  const path = require('path');
  const userProfile = await localforage.getItem('userProfile');
  const projectName = await localforage.getItem('currentProject');
  const newPath = await localforage.getItem('userPath');
  const userName = userProfile?.username;
  const projectCachePath = path.join(newPath, packageInfo.name, 'users', userName, 'project_cache', projectName);
  const fileCacheMapPath = path.join(projectCachePath, 'fileCacheMap.json');
  const filePath = path.join(newPath, packageInfo.name, 'users', userName, 'projects', projectName, 'ingredients', `${bookId?.toUpperCase()}.usfm`);
  return { filePath, projectCachePath, fileCacheMapPath };
}
