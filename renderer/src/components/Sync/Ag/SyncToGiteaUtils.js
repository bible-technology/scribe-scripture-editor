import {
    readContent, createRepository, createContent, updateContent,
  } from 'gitea-react-toolkit';
import moment from 'moment';
import * as localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import { environment } from '../../../../environment';

// create repo for new project sync
export const handleCreateRepo = async (repoName, auth, description) => {
    const settings = {
      name: repoName,
      description: description || `${repoName}`,
      private: false,
    };
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      createRepository(
        {
          config: auth.config,
          repo: settings?.name,
          settings,
        },
      ).then((result) => {
        logger.debug('Dropzone.js', 'call to create repo from Gitea');
        resolve(result);
      }).catch((err) => {
        logger.debug('Dropzone.js', 'call to create repo from Gitea Error : ', err);
        resolve(err);
      });
    });
  };

// upload file to gitea
export const createFiletoServer = async (fileContent, filePath, branch, repoName, auth) => {
    try {
      console.log({
 fileContent, filePath, branch, repoName, auth,
});
      await createContent({
        config: auth.config,
        owner: auth.user.login,
        // repo: repo.name,
        repo: repoName,
        branch: branch.replace(/ /g, '_'), // removing space to avoid error
        filepath: filePath,
        content: fileContent,
        message: `commit ${filePath}`,
        author: {
          email: auth.user.email,
          username: auth.user.username,
        },
      });
    } catch (err) {
      console.log({ err });
      throw new Error(err?.message || err);
    }
  };

// update file in gitea
export const updateFiletoServer = async (fileContent, filePath, branch, repoName, auth) => {
  try {
    const readResult = await readContent(
      {
        config: auth.config,
        owner: auth.user.login,
        repo: repoName.toLowerCase(),
        ref: branch.replace(/ /g, '_'),
        filepath: filePath,
      },
      );
      console.log({ readResult, branch, auth });
      if (readResult === null) {
        // throw new Error('can not read repo');
        // Unable to find the branch or file so creating new.

        // create the new branch - master ---> copied
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${auth.token.sha1}`);
        myHeaders.append('Content-Type', 'application/json');
        const payload = {
          new_branch_name: branch,
          old_branch_name: 'master',
        };
        const createBranchResp = await fetch(`${environment.GITEA_API_ENDPOINT}/repos/${auth.user.username}/${repoName}/branches`, {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify(payload),
        });
        // const response = await createBranchResp.json();

        if (createBranchResp.ok) {
          console.log('inisde first file update ----------');
          await updateFiletoServer(fileContent, filePath, branch, repoName, auth);
        } else {
          throw new Error('Unable to Create the Branch');
        }

        // await createFiletoServer(fileContent, filePath, branch, repoName, auth);
      } else {
        await updateContent({
          config: auth.config,
          owner: auth.user.login,
          repo: repoName.toLowerCase(),
          branch: branch.replace(/ /g, '_'),
          filepath: readResult.path,
          content: fileContent,
          message: `updated ${filePath}`,
          author: {
            email: auth.user.email,
            username: auth.user.username,
          },
          sha: readResult.sha,
          // eslint-disable-next-line no-unused-vars
        });
      }
  } catch (err) {
    throw new Error(err?.message || err);
  }
};

// sync profile updation
export const createSyncProfile = async (auth) => {
  const fs = window.require('fs');
  const path = require('path');
  await localForage.getItem('userProfile').then(async (user) => {
    const currentUser = user?.username;
    const newpath = localStorage.getItem('userPath');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser, environment.USER_SETTING_FILE);
    if (fs.existsSync(file)) {
      await fs.readFile(file, async (err, data) => {
        if (err) {
          logger.error('SyncToGiteaUtils.js', 'Failed to read the data from file');
        } else {
        logger.debug('SyncToGiteaUtils.js', 'Successfully read the data from file');
        const json = JSON.parse(data);
        if (!json.sync && !json.sync?.services) {
          // first time sync
          json.sync = {
            services: {
              door43: [
                {
                  token: '',
                  expired: false,
                  default: false,
                  username: auth?.user?.username,
                  dateCreated: moment().format(),
                  dateModified: null,
                },
              ],
            },
          };
        } else if (!json.sync?.services?.door43?.some((element) => element.username === auth?.user?.username)) {
            // user not in list create new entry
            json.sync?.services?.door43?.push(
              {
                token: '',
                expired: false,
                default: false,
                username: auth?.user?.username,
                dateCreated: moment().format(),
                dateModified: null,
              },
            );
          }
        // add token to file on login - used in editor sync
        // eslint-disable-next-line array-callback-return
        json.sync?.services?.door43?.filter((element) => {
            if (element.username === auth?.user?.username) {
              element.expired = false;
              element.dateModified = moment().format();
              element.token = {
                config: auth.config,
                token: auth.token,
                user: {
                  email: auth.user.email,
                  username: auth.user.username,
                  login: auth.user.login,
                  id: auth.user.id,
                },
              };
            }
          });
        logger.debug('GiteaFileBrowser.js', 'Upadting the settings in existing file');
        await fs.writeFileSync(file, JSON.stringify(json));
      }
      });
    }
  });
};

// get or update last sync details in scribe settings
export const getOrPutLastSyncInAgSettings = async (method, projectMeta, syncUsername) => {
  if (method === 'get' || method === 'put') {
    let currentUser = await localForage.getItem('userProfile');
    currentUser = currentUser?.username;
    const fs = window.require('fs');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const id = Object.keys(projectMeta?.identification?.primary?.scribe);
    const projectName = `${projectMeta?.identification?.name?.en}_${id}`;
    // eslint-disable-next-line array-callback-return
    const settingsIngredientsPath = Object.keys(projectMeta?.ingredients).filter((path) => {
      if (path.includes(environment.PROJECT_SETTING_FILE)) {
        return path;
      }
    });
    if (settingsIngredientsPath) {
      const settingsPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', projectName, settingsIngredientsPath[0]);

      let settings = await fs.readFileSync(settingsPath);
      settings = JSON.parse(settings);
      if (method.toLowerCase() === 'get') {
        let lastSyncedObj;
        settings?.sync?.services?.door43.forEach((element, indx) => {
          if (indx === 0) {
            lastSyncedObj = element;
          } else if (element.lastSynced > lastSyncedObj.lastSynced) {
              lastSyncedObj = element;
            }
        });
        return lastSyncedObj;
      }
      if (method.toLowerCase() === 'put') {
        if (!settings.sync && !settings.sync?.services) {
          // first time sync - no sync in settings old projects
          settings.sync = {
            services: {
              door43: [
                {
                  username: syncUsername,
                  dateCreated: moment().format(),
                  lastSynced: moment().format(),
                },
              ],
            },
          };
        } else if (settings?.sync?.services?.door43.length === 0) {
          // first time sync - not data
          settings.sync.services.door43.push(
            {
              username: syncUsername,
              dateCreated: moment().format(),
              lastSynced: moment().format(),
            },
          );
        } else {
          // eslint-disable-next-line array-callback-return
        settings.sync?.services?.door43?.forEach((element) => {
          if (element?.username === syncUsername) {
            element.lastSynced = moment().format();
          } else {
            settings.sync.services.door43.push(
              {
                username: syncUsername,
                dateCreated: moment().format(),
                lastSynced: moment().format(),
              },
            );
          }
        });
        }

        logger.debug('SyncToGiteaUtils.js', 'Upadting the scribe settings with sync data');
        await fs.writeFileSync(settingsPath, JSON.stringify(settings));
      }
    }
  } else {
    throw new Error('unknown Operation');
  }
};
