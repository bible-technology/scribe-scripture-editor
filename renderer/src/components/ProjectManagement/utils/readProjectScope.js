import localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';

function isDirEmpty(dirname, fs) {
  return fs.promises.readdir(dirname).then((files) => files.length > 0);
}

const getDirectories = (readdirSync, source) => readdirSync(source, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

// This function returns the Object of books & chapters which has atleast 1 audio file in it.
export const getScope = (project) => {
  const path = require('path');
  const scope = {};
  const { readdirSync } = window.require('fs');
  const fs = window.require('fs');
  const list = getDirectories(readdirSync, project);
  list.forEach((book) => {
    const chapters = getDirectories(readdirSync, path.join(project, book));
    const chapterFilter = [];
    chapters.forEach((chapter) => {
      // Finding non empty directories/chapters
      isDirEmpty(path.join(project, book, chapter), fs).then((value) => {
        if (value === true) {
          chapterFilter.push(chapter);
        }
      });
    });
    scope[book] = chapterFilter;
  });
  return scope;
};
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
        const project = path.join(file, projectName, 'audio', 'ingredients');
        const backendScope = getScope(project);
        const json = await JSON.parse(metadataFile);
        return { metadata: json, scope: backendScope };
      }
      throw new Error(`failed to read settings file - ${projectName}`);
    }
    throw new Error(`failed to read metadata file - ${projectName}`);
  } catch (err) {
        logger.error('metadataFile.js', `read metadata file successfully - ${projectName}`);
      throw new Error(err?.message || err);
  }
};
