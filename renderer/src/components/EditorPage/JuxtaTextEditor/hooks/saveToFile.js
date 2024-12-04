import localforage from 'localforage';
import writeToFile from '@/core/editor/writeToFile';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import packageInfo from '../../../../../../package.json';
import * as logger from '../../../../logger';

// function to save to file.
export const saveToFile = async (juxtaData, bookCode) => {
  logger.debug('saveToFile.js', `saving ${bookCode} to file`);
  try {
    const upperCaseBookCode = bookCode.toUpperCase();
    const userProfile = await localforage.getItem('userProfile');
    const userName = userProfile?.username;
    const projectName = await localforage.getItem('currentProject');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const metaPath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json');
    const metaData = JSON.parse(await readRefBurrito({ metaPath }));
    Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
      if (_ingredients.scope) {
        const _bookID = Object.entries(_ingredients.scope)[0][0];
        if (_bookID === upperCaseBookCode) {
          await writeToFile({
            username: userName,
            projectname: projectName,
            filename: key,
            data: juxtaData,
          });
        }
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    return console.log(err);
  }
};
