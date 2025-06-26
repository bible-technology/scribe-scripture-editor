// import { useEffect, useState } from 'react';
// import localforage from 'localforage';
// import { readRefBurrito } from '../../../../core/reference/readRefBurrito';
// import { readFile } from '../../../../core/editor/readFile';
// import packageInfo from '../../../../../../package.json';
// // import { handleCache } from '../cacheUtils';

// export const useReadUsfmFile = (bookId) => {
//   const [usfmData, setUsfmData] = useState([]);
//   const [bookAvailable, setbookAvailable] = useState(false);
//   const [usfmString, setUsfmString] = useState('');
//   // const [cachedData, setCachedData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [booksInProject, setBooksInProject] = useState([]);
//   const [filePath, setFilePath] = useState('');

//   useEffect(() => {
//     async function readLocalFile() {
//       setLoading(true);
//       try {
//         const userProfile = await localforage.getItem('userProfile');
//         const userName = userProfile?.username;
//         const projectName = await localforage.getItem('currentProject');
//         const path = require('path');
//         const newpath = localStorage.getItem('userPath');
//         const metaPath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json');
//         const metaData = JSON.parse(await readRefBurrito({ metaPath }));
//         const _books = [];
//         Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
//           if (_ingredients.scope) {
//             const _bookID = Object.entries(_ingredients.scope)[0][0];
//             const bookObj = { bookId: _bookID, fileName: key };
//             _books.push(bookObj);
//           }
//         });
//         setBooksInProject(_books.map((bookObj) => bookObj.bookId.toLowerCase()));
//         const [currentBook] = _books.filter((bookObj) => bookObj.bookId === bookId?.toUpperCase());
//         // const projectCachePath = path.join(newpath, packageInfo.name, 'users', userName, 'project_cache', projectName);
//         // const fileCacheMapPath = path.join(projectCachePath, 'fileCacheMap.json');
//         const _filePath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'ingredients', `${bookId?.toUpperCase()}.usfm`);
//         // console.log(_filePath, 'hello ');
//         setFilePath(_filePath);
//         if (currentBook) {
//           const fileData = await readFile({ projectname: projectName, filename: currentBook.fileName, username: userName });
//           // const cachedData = await handleCache(filePath, fileData, projectCachePath, fileCacheMapPath);
//           const books = [{
//             selectors: { org: 'unfoldingWord', lang: 'en', abbr: 'ult' },
//             bookCode: currentBook.bookId?.toLowerCase(),
//             data: fileData,
//           }];
//           setUsfmData(books);
//           setbookAvailable(true);
//           setUsfmString(fileData);
//           // setCachedData(cachedData);
//         } else {
//           setUsfmData([]);
//           setbookAvailable(false);
//         }
//         setLoading(false);
//       } catch (err) {
//         setLoading(false);
//         // eslint-disable-next-line no-console
//         return console.log(err);
//       }
//     }
//     readLocalFile();
//   }, [bookId]);
//   return {
//     usfmData,
//     bookAvailable,
//     usfmString,
//     bookId,
//     //  cachedData,
//     loading,
//     booksInProject,
//     filePath,
//   };
// };

// // export async function getCachePaths(bookId) {
// //   const path = require('path');
// //   const userProfile = await localforage.getItem('userProfile');
// //   const projectName = await localforage.getItem('currentProject');
// //   const newPath = await localforage.getItem('userPath');
// //   const userName = userProfile?.username;
// //   const projectCachePath = path.join(newPath, packageInfo.name, 'users', userName, 'project_cache', projectName);
// //   const fileCacheMapPath = path.join(projectCachePath, 'fileCacheMap.json');
// //   const filePath = path.join(newPath, packageInfo.name, 'users', userName, 'projects', projectName, 'ingredients', `${bookId?.toUpperCase()}.usfm`);
// //   return { filePath, projectCachePath, fileCacheMapPath };
// // }
import { useEffect, useState } from 'react';
import localforage from 'localforage';
import { readRefBurrito } from '../../../../core/reference/readRefBurrito';
import { readFile } from '../../../../core/editor/readFile';
import packageInfo from '../../../../../../package.json';

export const useReadUsfmFile = (bookId) => {
  const [usfmData, setUsfmData] = useState([]);
  const [bookAvailable, setbookAvailable] = useState(false);
  const [usfmString, setUsfmString] = useState('');
  const [loading, setLoading] = useState(true);
  const [booksInProject, setBooksInProject] = useState([]);
  const [filePath, setFilePath] = useState('');

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
        Object.entries(metaData.ingredients).forEach(([key, _ingredients]) => {
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

        if (currentBook) {
          // --- START: MODIFIED LOGIC TO CHECK FOR BACKUP ---

          const backupKey = `usfm-editor-backup-${_filePath}`;
          const backupData = localStorage.getItem(backupKey);
          let fileData;

          // Check if a backup exists in local storage
          if (backupData) {
            // If a backup is found, prompt the user.
            // eslint-disable-next-line no-alert
            const userWantsToRestore = window.confirm('You have unsaved changes for this file. Do you want to restore them?');

            if (userWantsToRestore) {
              // User clicked "OK" - load the data from local storage
              // console.log('Restoring unsaved changes from local storage.');
              fileData = backupData;
            } else {
              // User clicked "Cancel" - load the original file and remove the backup
              // console.log('Discarding unsaved changes and loading original file.');
              fileData = await readFile({ projectname: projectName, filename: currentBook.fileName, username: userName });
              localStorage.removeItem(backupKey); // Clean up the old backup
            }
          } else {
            // No backup found, so just load the file as normal.
            fileData = await readFile({ projectname: projectName, filename: currentBook.fileName, username: userName });
          }

          // --- END: MODIFIED LOGIC ---

          const books = [{
            selectors: { org: 'unfoldingWord', lang: 'en', abbr: 'ult' },
            bookCode: currentBook.bookId?.toLowerCase(),
            data: fileData, // Use the fileData determined by the logic above
          }];

          setUsfmData(books);
          setbookAvailable(true);
          setUsfmString(fileData); // Use the fileData determined by the logic above
        } else {
          setUsfmData([]);
          setbookAvailable(false);
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        // eslint-disable-next-line no-console
        console.error('Error in useReadUsfmFile:', err);
      }
    }
    readLocalFile();
  }, [bookId]); // The hook will re-run when bookId changes

  return {
    usfmData,
    bookAvailable,
    usfmString,
    bookId,
    loading,
    booksInProject,
    filePath,
  };
};
