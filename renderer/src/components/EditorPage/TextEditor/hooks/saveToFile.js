import localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import writeToFile from '@/core/editor/writeToFile';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import packageInfo from '../../../../../../package.json';

// function to save to file.
export const saveToFile = async (usfmText, bookCode) => {
  try {
    const userProfile = await localforage.getItem('userProfile');
    const userName = isElectron() ? userProfile?.username : userProfile?.user?.email;
    const projectName = await localforage.getItem('currentProject');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const metaPath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json');
    const metaData = JSON.parse(await readRefBurrito({ metaPath }));
    Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
      if (_ingredients.scope) {
        const _bookID = Object.entries(_ingredients.scope)[0][0];
        if (_bookID.toUpperCase() === bookCode.toUpperCase()) {
          await writeToFile({
            username: userName,
            projectname: projectName,
            filename: key,
            data: usfmText,
          });
        }
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    return console.log(err);
  }
};
