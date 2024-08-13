import localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';

export const readProjectScope = async (projectName) => {
  try {
    logger.debug('readProjectScope.js', `In read metadata - ${projectName}`);
    const currentUser = await localForage.getItem('userProfile');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, 'projects');

    const filePath = path.join(file, projectName, 'metadata.json');

    if (fs.existsSync(filePath)) {
      const metadataFile = await fs.readFileSync(filePath, 'utf-8');
      if (metadataFile) {
        logger.debug('metadataFile.js', `read metadata file successfully - ${projectName}`);
        const json = await JSON.parse(metadataFile);
        return json;
      }
      throw new Error(`failed to read settings file - ${projectName}`);
    }
    throw new Error(`failed to read metadata file - ${projectName}`);
  } catch (err) {
        logger.error('metadataFile.js', `read metadata file successfully - ${projectName}`);
      throw new Error(err?.message || err);
  }
};
