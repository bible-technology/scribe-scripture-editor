import * as localForage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import { environment } from '../../../environment';
import { loadUsers } from '../Login/handleJson';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import {
  newPath, sbStorageList, sbStorageDownload, sbStorageUpload,
} from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const supabaseStorage = require('../../../../supabase').supabaseStorage
//   const newPath = require('../../../../supabase').newPath
// }

export const getorPutAppLangage = async (method, currentUser, appLang) => {
  if (isElectron()) {
    logger.error('handleProfile.js', 'In updateAppLang, for updating the App language Selection');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    let file;
    if (currentUser) {
      file = path.join(newpath, packageInfo.name, 'users', currentUser, environment.USER_SETTING_FILE);
    } else {
      throw new Error('Not getting current logged user');
    }
    try {
      if (fs.existsSync(file)) {
        const data = await fs.readFileSync(file);
        const json = JSON.parse(data);
        if (method.toLowerCase() === 'get') {
          return json.appLanguage;
        } if (method.toLowerCase() === 'put') {
          // save lang code
          json.appLanguage = appLang.code;
          logger.debug('handleProfile.js', 'Updating the app lang details in existing file');
          await fs.writeFileSync(file, JSON.stringify(json));
        }
      }
    } catch (err) {
      logger.error('handleProfile.js', 'Failed to read the data from file');
      throw new Error(err?.message || err);
    }
  }
  let file;
  if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
    if (currentUser) {
      file = `${newPath}/${currentUser}/${environment.USER_SETTING_FILE}`;
      const { data: settingsFile, error } = await sbStorageList(file);
      if (settingsFile) {
        const { data } = await sbStorageDownload(file);
        const settings = JSON.parse(await data.text());
        if (method.toLowerCase() === 'get') {
          return settings.appLanguage;
        } if (method.toLowerCase() === 'put') {
          // save lang code
          settings.appLanguage = appLang.code;
          await sbStorageUpload(file, JSON.stringify(settings));
        }
      }
      if (error) {
        throw new Error(error?.message || error);
      }
    }
  }
};

const updateJson = async (userdata) => {
  logger.error('handleProfile.js', 'In UpdateJson, for updating the current user details');
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');
  const file = path.join(newpath, packageInfo.name, 'users', 'users.json');
  const status = [];
  try {
    const data = fs.readFileSync(file);
    const json = JSON.parse(data);
    json.forEach((user) => {
      if (user.username === userdata.username) {
        const keys = Object.keys(user);
        keys.forEach((key) => {
          user[key] = userdata[key];
        });
      }
    });
    logger.debug('handleProfile.js', 'Updating the user details in existing file');
    fs.writeFileSync(file, JSON.stringify(json));
    status.push({ type: 'success', value: 'Updated the Profile.' });
    logger.debug('handleProfile.js', 'Loading new users list from file');
    loadUsers();
  } catch {
    logger.error('handleProfile.js', 'Failed to read the data from file');
    status.push({ type: 'error', value: 'Failed to read the data from file.' });
  }
  return status[0];
};
const updateOffline = async (data, appLang) => {
  logger.debug('handleProfile.js', 'In updateOffline');
  const status = [];
  await localForage.getItem('userProfile')
    .then(async (userdata) => {
      const keys = Object.keys(data);
      keys.forEach((key) => {
        userdata[key] = data[key];
      });
      logger.debug('handleProfile.js', 'Updating profile data in localForage');
      localForage.setItem('userProfile', userdata);
      // call app lang update in user json
      await getorPutAppLangage('put', userdata?.username, appLang);
      // update user details in users list
      const value = updateJson(userdata);
      value.then((val) => {
        status.push(val);
      });
    });
  return status;
};
export const saveProfile = async (values, appLang) => {
  logger.debug('handleProfile.js', 'In saveProfile');
  const status = [];
  await localForage.getItem('appMode')
    .then(async (mode) => {
      if (mode === 'offline') {
        const value = await updateOffline(values, appLang);
        status.push(value[0]);
      }
    });
  return status;
};
