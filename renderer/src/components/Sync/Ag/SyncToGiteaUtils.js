import {
    readContent, createRepository, createContent, updateContent,
  } from 'gitea-react-toolkit';
import moment from 'moment';
import * as localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import { environment } from '../../../../environment';

// create branch from a base branch
export const handleCreateBranch = async (basebranch, newBranch, auth, repo) => {
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${auth.token.sha1}`);
  myHeaders.append('Content-Type', 'application/json');
  const payload = {
    new_branch_name: newBranch,
    old_branch_name: basebranch,
  };
  const createBranchResp = await fetch(`${environment.GITEA_API_ENDPOINT}/repos/${repo.owner.username}/${repo.name}/branches`, {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(payload),
  });
  const createdBranchData = await createBranchResp.json();
  return [createBranchResp, createdBranchData];
};

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
      ).then(async (result) => {
        logger.debug('Dropzone.js', 'call to create repo from Gitea');
        // caling create branch for making a duplicate branch of master with only readME and
        // it is for handling the pull conflicts (to avoid compare with master )
        console.log({ result });
        await handleCreateBranch('master', 'collab-dont-touch', auth, result);
        resolve(result);
      }).catch((err) => {
        logger.debug('Dropzone.js', 'call to create repo from Gitea Error : ', err);
        resolve(err);
      });
    });
  };

// upload file to gitea
export const createFiletoServer = async (fileContent, filePath, branch, repo, auth) => {
    try {
      await createContent({
        config: auth.config,
        owner: repo.owner.username,
        repo: repo.name,
        // repo: repoName,
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
      console.log('error', err);
      throw new Error(err?.message || err);
    }
  };

// update file in gitea
export const updateFiletoServer = async (fileContent, filePath, branch, repo, auth) => {
  try {
    const readResult = await readContent(
      {
        config: auth.config,
        owner: repo.owner.username,
        repo: repo.name.toLowerCase(),
        ref: branch.replace(/ /g, '_'),
        filepath: filePath,
      },
      );
      if (readResult === null) {
        // throw new Error('can not read repo');
        // Unable to find the branch or file so creating new.
        // merge? base branch :"master"
        // merge-> create merge1
        // create the new branch - master ---> copied
        const baseBranch = branch.includes('-merge');
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${auth.token.sha1}`);
        myHeaders.append('Content-Type', 'application/json');
        const payload = {
          new_branch_name: branch,
          old_branch_name: baseBranch ? 'collab-dont-touch' : 'master',
          // old_branch_name: 'collab-dont-touch',
        };
        const createBranchResp = await fetch(`${environment.GITEA_API_ENDPOINT}/repos/${repo.owner.username}/${repo.name}/branches`, {
          method: 'POST',
          headers: myHeaders,
          body: JSON.stringify(payload),
        });
        // const responsejson = await createBranchResp.json();
        // if (baseBranch) {
        //   const payload = {
        //     new_branch_name: `${branch}1`,
        //     old_branch_name: branch.replace('-merge', ''),
        //   };
        //   await fetch(`${environment.GITEA_API_ENDPOINT}/repos/${repo.owner.username}/${repo.name}/branches`, {
        //     method: 'POST',
        //     headers: myHeaders,
        //     body: JSON.stringify(payload),
        //   });
        // }
        console.log(createBranchResp);
        // if (createBranchResp.ok || createBranchResp.status === 409 && baseBranch===false) {
        if (baseBranch === true) {
          console.log('inisde first file update ----------');
          // await updateFiletoServer(fileContent, filePath, branch, repo, auth);
          await createFiletoServer(fileContent, filePath, branch, repo, auth);
        } else if (baseBranch === false) {
          await updateFiletoServer(fileContent, filePath, branch, repo, auth);
        } else {
          throw new Error('Unable to Create the Branch');
        }
      } else {
        const fileupdateResponse = await updateContent({
          config: auth.config,
          owner: repo.owner.username,
          repo: repo.name.toLowerCase(),
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
        console.log({ fileupdateResponse, filePath });
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
        return [lastSyncedObj, settings.sync.services.door43];
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
          const existUser = settings.sync?.services?.door43?.filter((user) => user.username.toLowerCase() === syncUsername.toLowerCase());
          if (existUser?.length > 0) {
            settings.sync?.services?.door43?.forEach((element) => {
              if (element?.username === syncUsername) {
                element.lastSynced = moment().format();
              }
            });
          } else {
            settings.sync.services.door43.push(
              {
                username: syncUsername,
                dateCreated: moment().format(),
                lastSynced: moment().format(),
              },
            );
          }
        }

        logger.debug('SyncToGiteaUtils.js', 'Upadting the scribe settings with sync data');
        await fs.writeFileSync(settingsPath, JSON.stringify(settings));
      }
    }
  } else {
    throw new Error('unknown Operation');
  }
};
