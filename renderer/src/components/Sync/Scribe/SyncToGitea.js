import * as localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import {
 addGitRemote, checkInitialize, checkoutJsonFiles, checkoutToBranch, commitChanges, createBranch, getRepoOwner, initProject, pullProject, pushTheChanges, pushToMain,
} from '../Isomorphic/utils';
import { createRepo, getRepoByOwner } from '../Isomorphic/api';
import { getOrPutLastSyncInAgSettings } from './SyncToGiteaUtils';
// upload project to gitea main function

export async function uploadToGitea(projectDataAg, auth, setSyncProgress, notifyStatus, addNotification, setPullPopup) {
  logger.debug('ToGiteaUtils.js', 'in uploadTOGitea');
  const projectData = projectDataAg.projectMeta;
  const projectId = Object.keys(projectData.identification.primary[packageInfo.name])[0];
  const projectName = projectData.identification.name.en;
  const repoName = `${projectData.languages[0].tag}-${projectData.type.flavorType.flavor.name}-${projectName.replace(/[\s+ -]/g, '_')}`;
  const mainBranch = `${packageInfo.name}-main`;
  const localBranch = `${auth?.user?.username}/${packageInfo.name}`;
  await localForage.getItem('userProfile').then(async (user) => {
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', user?.username, 'projects', `${projectName}_${projectId}`);
    // Create A REPO for the project
    try {
      // support for existing sync users - create scribe main with user branch content
      // await supportForExistingSyncUsers();
      // Check whether the project is git initiallized or not
      const checkInit = await checkInitialize(fs, projectsMetaPath);
      const repoOwner = await getRepoOwner(fs, projectsMetaPath);

      // check for repo exist or not
      const checkForRepo = await getRepoByOwner(repoOwner || auth.user.username, repoName);
      // const checkForRepo = await getRepoByOwner(auth?.user?.username, repoName);

      if (!checkInit || !checkForRepo?.id) {
        setSyncProgress((prev) => ({
        ...prev, syncStarted: true, syncType: 'syncTo', completedFiles: 1, totalFiles: 6,
        }));
        let projectInitialized;
        if (!checkInit) {
          projectInitialized = await initProject(fs, projectsMetaPath, auth.user.username, mainBranch);
        }
        if (projectInitialized || !checkForRepo?.id) {
          // common process for init but not synced / not inited
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          const created = await createRepo(repoName, auth.token.sha1);
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));

          if (created.id) {
            await addGitRemote(fs, projectsMetaPath, created.clone_url);
            setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
            const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
            if (commitStatus) {
              setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
              const pushMain = await pushTheChanges(fs, projectsMetaPath, mainBranch, auth.token.sha1);
              const createStatus = pushMain && await createBranch(fs, projectsMetaPath, localBranch);
              const checkoutStatus = createStatus && await checkoutToBranch(fs, projectsMetaPath, localBranch);
              checkoutStatus && await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
            }
          }
        }
      } else {
        setSyncProgress((prev) => ({
        ...prev, syncStarted: true, syncType: 'syncTo', completedFiles: 1, totalFiles: 3,
        }));
        // const repoOwner = await getRepoOwner(fs, projectsMetaPath);
        const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
        if (commitStatus) {
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
            // checkout json files
            await checkoutJsonFiles(fs, projectsMetaPath, localBranch);
          }
          // push changes to remote user branch from local user
          const pushResult = await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
          if (pushResult === false) {
            // Auth error / internet error
            logger.debug('ToGiteaUtils.js', 'Auth failed');
            throw new Error('Your token expired, do Login again!');
          }
          // pull from remote main to local main
          const pullStatus = pushResult && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
          // show conflict message if pull fail and inform user about backup
          if (pullStatus?.status === false) {
            if (pullStatus?.data.type === 'conflict') {
              const conflictHtmlText = `<div class="flex flex-col justify-center">
                  <div class="">
                    You have conflict in <span class="text-red-600">${pullStatus?.data?.data ? pullStatus?.data?.data : 'some files'}</span>
                    .Connect your administrator to resolve this conflcit.
                  </div>
                  <div class="text-center font-extrabold">OR</div>
                  <div class="">
                    You can do
                    <span class="font-bold">OFFLINE SYNC</span>
                    which will overwrite all unsynced changes with the data of Door43.
                  </div>
                  <div class='text-green-600 mt-2'>
                  Your changes are been secured on your branch in Door43.
                  </div>
                  </div>`;
              setPullPopup({
                title: 'Conflict',
                status: true,
                confirmMessage: conflictHtmlText,
              });
              throw new Error('Conflict Exist');
            } else {
              throw new Error(pullStatus?.data?.data[0]);
            }
          }
          // push merged changes to main origin
          const pushMain = pullStatus?.status && await pushToMain(fs, projectsMetaPath, localBranch, auth.token.sha1);
          pushMain && await getOrPutLastSyncInAgSettings('put', projectData, auth?.user?.username);
        }
      }
    } catch (err) {
      logger.debug('SyncToGitea.js', `Error on Sync create/update : ${err}`);
      notifyStatus('failure', `Sync failed : ${err?.message || err}`);
      await addNotification('Sync', err?.message || err, 'failure');
      throw new Error(err?.message || err);
    } finally {
      setSyncProgress((prev) => ({
        ...prev, syncStarted: false, syncType: null, completedFiles: 0, totalFiles: 0,
        }));
    }
  });
}
