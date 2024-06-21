import * as localForage from 'localforage';
import { environment } from '../../../../../environment';
import * as logger from '../../../../logger';
import packageInfo from '../../../../../../package.json';
import { uploadToGitea } from '../../Scribe/SyncToGitea';

export async function getGiteaUsersList() {
  let usersList = [];
  const userData = await localForage.getItem('userProfile');
  const fs = window.require('fs');
  const path = require('path');
  const newpath = localStorage.getItem('userPath');
  const file = path.join(newpath, packageInfo.name, 'users', userData?.username, environment.USER_SETTING_FILE);
  if (await fs.existsSync(file)) {
    const data = await fs.readFileSync(file);
    logger.debug('EditorSyncUtils.js', 'Successfully read the data from file , user : ', userData?.username);
    const json = JSON.parse(data);
    usersList = json.sync?.services?.door43 || [];
  }
  return usersList;
}

export async function handleEditorSync(projectData, syncObj, notifyStatus, addNotification, setPullPopup, setSyncProgress) {
  logger.debug('EditorAutoSync.js', 'Inside auto sync Project : ');
  try {
    // change action object ------------?
    const authObj = syncObj?.token;
    const projectDataAg = { projectMeta: projectData };
    await uploadToGitea(projectDataAg, authObj, setSyncProgress, notifyStatus, addNotification, setPullPopup);
    logger.debug('EditorSyncUtils.js', 'Auto Sync finished create project and upload');
    return true;
  } catch (err) {
    logger.debug('EditorSyncUtils.js', `Error on Sync : ${err}`);
    throw new Error(err?.message || err);
  }
}
