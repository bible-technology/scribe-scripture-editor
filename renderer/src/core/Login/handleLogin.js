import * as localforage from 'localforage';
import { environment } from '../../../environment';
import { handleJson, handleJsonWeb } from './handleJson';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import { supabaseStorage } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const supabaseStorage = require('../../../../supabase').supabaseStorage
// }

export const createUser = (values, fs) => {
  logger.debug('handleLogin.js', 'In createUser to create a new user');
  const obj = {
    username: values.username.toLowerCase(),
    firstname: '',
    lastname: '',
    email: '',
    organization: '',
    selectedregion: '',
    lastSeen: new Date(),
    isArchived: false,
  };
  return handleJson(obj, fs).then(() => obj);
};

export const createWebUser = async (values) => {
  logger.debug('handleLogin.js', 'In createWebUser to create a new user');
  const obj = {
    email: values?.email,
    firstname: '',
    lastname: '',
    organization: '',
    selectedregion: '',
    lastSeen: new Date(),
    isArchived: false,
  };
  console.log('passed obj', { obj });
  return handleJsonWeb(obj).then(() => obj);
};
/**
 * It writes the users to a file.
 * @param users - [{
 */
export const writeToFile = (users) => {
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');
  const file = path.join(newpath, packageInfo.name, 'users', 'users.json');
  fs.writeFileSync(file, JSON.stringify(users), (err) => {
    if (err) {
      logger.debug('handleLogin.js', 'Error saving users to disk');
    }
  });
};

/**
 * It takes an array of users and a username and returns the user object if the username is found in
 * the array.
 * @param users - [{username: 'test', password: 'test', lastSeen: '2019-01-01'}]
 * @param values - {
 * @returns The user object.
 */
export const handleLogin = async (users, values) => {
  logger.debug('handleLogin.js', 'In handleLogin function');
  if (users) {
    const user = users.find((value) => value.username === values.username);
    if (user) {
      user.lastSeen = new Date();
      logger.debug('handleLogin.js', 'Found user');
      users.map((obj) => user.username === obj.username || obj);
      writeToFile(users);
      await localforage.setItem('users', users);
      return user;
    }
  }
  return null;
};

export const createSupabaseSettingJson = async (path) => {
  const json = {
    version: environment.AG_USER_SETTING_VERSION,
    history: {
      copyright: [{
        id: 'Other', title: 'Custom', licence: '', locked: false,
      }],
      languages: [],
      textTranslation: {
        canonSpecification: [{
          id: 4, title: 'Other', currentScope: [], locked: false,
        }],
      },
    },
    appLanguage: 'en',
    theme: 'light',
    userWorkspaceLocation: '',
    commonWorkspaceLocation: '',
    resources: {
      door43: {
        translationNotes: [],
        translationQuestions: [],
        translationWords: [],
        obsTranslationNotes: [],
      },
    },
    sync: { services: { door43: [] } },
  };
  const { data, error } = await supabaseStorage
    .upload(path, JSON.stringify(json), {
      cacheControl: '3600',
      upsert: true,
    });
  if (data) {
    console.log('success, ag-user.json', data);
  }
  console.log({ error });
};
