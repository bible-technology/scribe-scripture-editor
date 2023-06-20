import * as localForage from 'localforage';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import {
 addGitRemote, checkInitialize, checkoutJsonFiles, checkoutToBranch, commitChanges, createBranch, getRepoOwner, initProject, pullProject, pushTheChanges, pushToMain,
} from '../Isomorphic/utils';
import { createRepo } from '../Isomorphic/api';
// upload project to gitea main function

export async function uploadToGitea(projectDataAg, auth, setSyncProgress, notifyStatus, addNotification, setPullPopup) {
  logger.debug('ToGiteaUtils.js', 'in uploadTOGitea');
  const projectData = projectDataAg.projectMeta;
  const projectId = Object.keys(projectData.identification.primary[packageInfo.name])[0];
  const projectName = projectData.identification.name.en;
  const repoName = `${projectData.languages[0].tag}-${projectData.type.flavorType.flavor.name}-${projectName.replace(/[\s+ -]/g, '_')}`;
  const mainBranch = `${packageInfo.name}-main`;
  const localBranch = `${auth?.user?.username}/${packageInfo.name}`;
  localForage.getItem('userProfile').then(async (user) => {
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', user?.username, 'projects', `${projectName}_${projectId}`);
    // Create A REPO for the project
    try {
      // support for existing sync users - create scribe main with user branch content
      // await supportForExistingSyncUsers();
      // Check whether the project is git initiallized or not
      let remoteStatus = true;
      console.log(projectsMetaPath, { mainBranch });
      const checkInit = await checkInitialize(fs, projectsMetaPath);
      console.log(checkInit);
      if (!checkInit) {
        setSyncProgress((prev) => ({
        ...prev, syncStarted: true, completedFiles: 1, totalFiles: 6,
        }));
        remoteStatus = false;
        const projectInitialized = await initProject(fs, projectsMetaPath, auth.user.username, mainBranch);
        console.log(projectInitialized);
        if (projectInitialized) {
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          console.log(repoName, auth.token.sha1);
          const created = await createRepo(repoName, auth.token.sha1);
          // const created = await handleCreateRepo(repoName, auth, repoName);
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          console.log(created);
          if (created.id) {
            remoteStatus = await addGitRemote(fs, projectsMetaPath, created.clone_url);
            // remoteStatus = remoteStatus && await pullProject(fs, projectsMetaPath, 'master', auth.token.sha1);
            console.log({ remoteStatus });
            setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
            const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
            console.log({ commitStatus });
            if (commitStatus) {
              setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
              const pushMain = await pushTheChanges(fs, projectsMetaPath, mainBranch, auth.token.sha1);
              const createStatus = pushMain && await createBranch(fs, projectsMetaPath, localBranch);
              const checkoutStatus = createStatus && await checkoutToBranch(fs, projectsMetaPath, localBranch);
              const pushUser = checkoutStatus && await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
              console.log({ pushUser });
              console.log({ createStatus }, { checkoutStatus });
            }
          }
        }
      } else {
        setSyncProgress((prev) => ({
        ...prev, syncStarted: true, completedFiles: 1, totalFiles: 3,
        }));
        const repoOwner = await getRepoOwner(fs, projectsMetaPath);
        // code or collabarator -----------------------------------
        console.log('in collabarator mode ------>');
        const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
        console.log('1---------');
        console.log({ commitStatus });
        if (commitStatus) {
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
            // checkout json files
            const checkoutFIles = await checkoutJsonFiles(fs, projectsMetaPath, localBranch);
            console.log({ checkoutFIles });
          }
          // push changes to remote user branch from local user
          const pushResult = await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
          console.log('2------------');
          console.log({ pushResult });
          // pull from remote main to local main
          const pullStatus = pushResult && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
          // show conflict message if pull fail and inform user about backup
          console.log('2.5------------', { pullStatus });
          if (pullStatus?.status === false) {
            if (pullStatus?.data.type === 'conflict') {
              const conflictHtmlText = `<div class="flex flex-col justify-center">
                  <div class="text-center">
                    You have conflict in <span class="text-red-600">${pullStatus.data.data}.</span>
                    Connect your administrator to resolve this conflcit.
                  </div>
                  <div class="text-center font-extrabold">OR</div>
                  <div class="text-center">
                    You can do
                    <span class="font-bold">OFFLINE SYNC</span>
                    which will overwrite all unsynced changes with the data of Door43.
                  </div>
                  </div>`;
              console.log('in conflcit error ............');
              setPullPopup({
                title: 'Conflict',
                status: true,
                confirmMessage: conflictHtmlText,
                // buttonName: 'ok',
                // type: 'overwrite',
              });
              throw new Error('Conflict Exist');
            } else {
              throw new Error(pullStatus?.data?.data[0]);
            }
          }
          console.log('3------------', { pullStatus });
          // push merged changes to main origin
          const pushMain = pullStatus?.status && await pushToMain(fs, projectsMetaPath, localBranch, auth.token.sha1);
          console.log('4------------', { pushMain });
          console.log('ALL DONE-------------------------');
        }
      }
    } catch (err) {
      logger.debug('SyncToGitea.js', `Error on Sync create/update : ${err}`);
      notifyStatus('failure', `Sync failed : ${err}`);
      await addNotification('Sync', err?.message || err, 'failure');
    } finally {
      setSyncProgress({
        syncStarted: false,
        totalFiles: 0,
        completedFiles: 0,
      });
    }
  });
}
