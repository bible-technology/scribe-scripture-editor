import localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';

export const updateBurritoScope = async (projectName, metadata) => {
  try {
    logger.debug('updateBurritoScope.js', `In update metadata - ${projectName}`);
    const currentUser = await localForage.getItem('userProfile');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, 'projects');
    // Finally updating the scope in the metadata
    const filePath = path.join(file, projectName, 'metadata.json');
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(metadata));
      return true;
    }
    throw new Error(`failed to read metadata file - ${projectName}`);
  } catch (err) {
    logger.error('updateBurritoScope.js', `read metadata file successfully - ${projectName}`);
    throw new Error(err?.message || err);
  }
};
