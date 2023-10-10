import * as localForage from 'localforage';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import {
  createDirectory, sbStorageDownload, sbStorageUpload, supabaseStorage,
} from '../../../../supabase';

const path = require('path');

// const newpath = localStorage.getItem('userPath');
let error;
const uniqueUser = (users, username) => users.some((user) => user.username === username);

/**
 * Reads a file from the user's computer and stores it in localForage.
 */
export const loadUsers = async () => {
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');
  const file = path.join(newpath, packageInfo.name, 'users', 'users.json');
  if (fs.existsSync(file)) {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        logger.error('handleJson.js', 'Failed to read the data from file');
      } else {
        logger.debug('handleJson.js', 'Successfully read the data from file');
        // Add users to localForage:
        localForage.setItem('users', JSON.parse(data), (errLoc) => {
          if (errLoc) {
            logger.error('handleJson.js', 'Failed to load users list to LocalStorage');
          }
          logger.debug('handleJson.js', 'Added users list to LocalStorage');
        });
      }
    });
  }
};

/**
 * It creates a new user and adds it to a JSON file.
 * </code>
 * @param values - {
 * @param fs - is the filesystem module
 * @returns a promise.
 */
export const handleJson = async (values, fs) => {
  const newpath = localStorage.getItem('userPath');
  logger.debug('handleJson.js', 'Inside handleJson');
  //   console.log('global', global.path);
  fs.mkdirSync(path.join(newpath, packageInfo.name, 'users'), {
    recursive: true,
  });
  const file = path.join(newpath, packageInfo.name, 'users', 'users.json');
  error = { userExist: false, fetchFile: false };
  if (fs.existsSync(file)) {
    return new Promise((resolve) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          logger.error('handleJson.js', 'Failed to read the data from file');
          error.fetchFile = true;
          resolve(error);
        } else {
          logger.debug('handleJson.js', 'Successfully read the data from file');
          const json = JSON.parse(data);
          if (uniqueUser(json, values.username)) {
            error.userExist = true;
            resolve(error);
          } else {
            json.push(values);
            try {
              fs.writeFileSync(file, JSON.stringify(json));
              logger.debug('handleJson.js', 'Successfully added new user to the existing list in file');
              fs.mkdirSync(path.join(newpath, packageInfo.name, 'users', values.username, 'projects'), {
                recursive: true,
              });
              logger.debug('handleJson.js', 'Successfully created directories for new user');
              // Add new user to localForage:
              localForage.setItem('users', json, (errLoc) => {
                if (errLoc) {
                  logger.error('handleJson.js', 'Failed to add new user to existing list');
                }
                logger.debug('handleJson.js', 'Added new user to existing list');
              });
              resolve(error);
            } catch (errCatch) {
              logger.error('handleJson.js', 'Failed to add new user to the file');
              resolve(error);
            }
          }
        }
      });
    });
  }
  const array = [];
  array.push(values);
  try {
    fs.writeFileSync(file, JSON.stringify(array));
    logger.debug('handleJson.js', 'Successfully created and written to the file');
    // Add new user to localForage:
    localForage.setItem('users', array, (err) => {
      if (err) {
        logger.error('handleJson.js', 'Failed to Create a file and add user to LocalForage');
      }
      logger.debug('handleJson.js', 'Created a file and added user to LocalForage');
    });
    logger.debug('handleJson.js', 'Exiting from handleJson');
    return error;
  } catch (err) {
    logger.error('handleJson.js', 'Failed to create and write to the file');
    error.fetchFile = true;
    return error;
  }
};

export const handleJsonWeb = async (values) => {
  // const supabaseStorage = require('../../../../supabase').supabaseStorage
  // const createDirectory = require('../../../../supabase').createDirectory
  const newpath = `${packageInfo.name}/users`;
  error = { userExist: false, fetchFile: false };

  if (await supabaseStorage().list().then((result) => result.error)) {
    console.error('handleJson.js', 'Failed to access the storage');
    error.fetchFile = true;
    return error;
  }

  if (await sbStorageDownload(`${newpath}/users.json`).then((result) => result.error)) {
    const array = [];
    array.push(values);
    try {
      await sbStorageUpload(`${newpath}/users.json`, JSON.stringify(array), {
        cacheControl: '3600',
        upsert: true,
      });

      // Add new user to localForage:
      localForage.setItem('users', array, (err) => {
        if (err) {
          console.error('handleJson.js', 'Failed to Create a file and add user to LocalForage');
        }
      });
      return error;
    } catch (err) {
      error.fetchFile = true;
      return error;
    }
  } else {
    const { data, error } = await sbStorageDownload(`${newpath}/users.json`);
    if (error) {
      error.fetchFile = true;
      return error;
    }

    const json = JSON.parse(await data.text());
    if (uniqueUser(json, values.email)) {
      error.userExist = true;
      return error;
    }
    json.push(values);
    try {
      // eslint-disable-next-line no-unused-vars
      const { data: newUser } = await sbStorageUpload(`${newpath}/users.json`, JSON.stringify(json), {
        cacheControl: '3600',
        upsert: true,
      });

      await createDirectory({ path: `${newpath}/${values.email}/projects` });

      // Add new user to localForage:
      localForage.setItem('users', json, (errLoc) => {
        if (errLoc) {
          console.error('handleJson.js', 'Failed to add new user to existing list');
        }
      });
      return error;
    } catch (errCatch) {
      console.error('handleJson.js', 'Failed to add new user to the file');
      return error;
    }
  }
};
