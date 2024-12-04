import * as localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import packageInfo from '../../../../../../package.json';
import * as logger from '../../../../logger';

export async function getDetails() {
  logger.debug('ObsEditor.js', 'In getDetails() for fetching the burrito file of current project');
  const userProfile = await localforage.getItem('userProfile');
  const currentProject = await localforage.getItem('currentProject');
  const newpath = localStorage.getItem('userPath');
  const path = require('path');

  const username = isElectron() ? userProfile?.username : userProfile?.user?.email;
  const projectsDir = path.join(newpath, packageInfo.name, 'users', username, 'projects', currentProject);
  const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', currentProject, 'metadata.json');

  return {
    projectName: currentProject, username, projectsDir, metaPath, path,
  };
}
