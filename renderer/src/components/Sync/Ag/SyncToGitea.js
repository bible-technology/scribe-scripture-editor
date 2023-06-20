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
          // if (!pullStatus) {
          //   // show message
          //   const conflictData = await remoteMerge(fs, projectsMetaPath, localBranch, auth.token.sha1);
          //   console.log(conflictData);
          //   throw new Error('Conflict Exist');
          // }
          // checkout ----- to user branch
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
// else {
//   setSyncProgress((prev) => ({
//   ...prev, syncStarted: true, completedFiles: 1, totalFiles: 3,
//   }));
//   // const repoOwner = await getRepoOwner(fs, projectsMetaPath);
//   // let commitStatus;
//   // if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
//   //   commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added force from scribe for collabarator', true);
//   //   console.log('1--------- IF ');
//   // } else {
//   //   commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
//   //   console.log('1--------- ELSE ');
//   // }
//   const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
//   console.log('1---------');
//   console.log({ commitStatus });
//   if (commitStatus) {
//     setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
//     // push changes to remote main branch from local user branch
//     const pushResult = await pushToMain(fs, projectsMetaPath, localBranch, auth.token.sha1);
//     console.log('2------------');
//     console.log({ pushResult });
//     // pull origin main to local user branch
//     // const pullStatus = await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
//     // force commit to user branch
//     const commitForce = pushResult && await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added force from scribe for collabarator', true);
//     // test manual chekout to user
//     const checkStatus1 = commitForce && await checkoutToBranch(fs, projectsMetaPath, mainBranch);
//     console.log(' 2.5 checkout to user------------', checkStatus1);
//     const deleteStatus = checkStatus1 && await deleteTheBranch(fs, projectsMetaPath, localBranch);
//     // pull from remote main to local main
//     const pullStatus = deleteStatus && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, mainBranch);
//     // checkout ----- to user branch
//     console.log('3------------');
//     // change this pull with FETCH AND MERGE - remote/origin -> local
//     // const pullStatus = await remoteMerge(fs, projectsMetaPath, mainBranch, localBranch, auth.token.sha1);
//     // merge changes local user - main
//     // const mergeStatus = pullStatus && await mergeBranches(fs, projectsMetaPath, mainBranch, localBranch);
//     console.log('4------------');
//     // push merged changes to main origin
//     // const pushMain = mergeStatus && await pushTheChanges(fs, projectsMetaPath, mainBranch, auth.token.sha1);
//     const createStatus = pullStatus && await createBranch(fs, projectsMetaPath, localBranch);
//     console.log('5------------');

//     // test manual chekout to user
//     const checkStatus2 = createStatus && await checkoutToBranch(fs, projectsMetaPath, localBranch);
//     console.log(' 5.5 checkout to user------------', checkStatus2);

//     // pull latest from origin main to local branch
//     // const pullStatus2 = checkStatus2 && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
//     // console.log('6------------');
//     // if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
//     //   // force commit the ignored files (json) to remote user branch
//     //   await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Forcely added scribe files', true);
//     //   console.log('7------------');
//     // }
//     // push changes to remote user from local user
//     // const pushUser = pullStatus2 && await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
//     console.log('8------------');
//     // console.log({ pushUser });
//     setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
//   }
// }

// last working logic collabarator side 15/06/23

//   // code or collabarator -----------------------------------
//   console.log('in collabarator mode ------>');
//   const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
//   console.log('1---------');
//   console.log({ commitStatus });
//   if (commitStatus) {
//     setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
//     // push changes to remote user branch from local user
//     const pushResult = await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
//     console.log('2------------');
//     console.log({ pushResult });
//     // pull origin main to local user branch
//     // const pullStatus = await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
//     const commitStatus1 = pushResult && await commitJson(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added force from scribe for collabarator', true);

//     // test manual chekout to user
//     const checkStatus1 = commitStatus1 && await checkoutToBranch(fs, projectsMetaPath, mainBranch);
//     console.log(' 2.5 checkout to user------------', checkStatus1);

//     // pull from remote main to local main
//     const pullStatus = checkStatus1 && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, mainBranch);
//     // checkout ----- to user branch
//     console.log('3------------');
//     // change this pull with FETCH AND MERGE - remote/origin -> local
//     // const pullStatus = await remoteMerge(fs, projectsMetaPath, mainBranch, localBranch, auth.token.sha1);
//     // read metadata and settings json --------------------------------
//     const metadataFile = pullStatus && await readJsonFiles('metadata');
//     const firstKey = Object.keys(metadataFile.ingredients)[0];
//     const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
//     const dirName = folderName[0];
//     const settingsFile = pullStatus && await readJsonFiles('appsettings', dirName);

//     console.log('------------JSON READ SUCESS------', { metadataFile, settingsFile });

//     // merge changes local user - main
//     const mergeStatus = pullStatus && await mergeBranches(fs, projectsMetaPath, mainBranch, localBranch);
//     console.log('4------------');

//     // write files back JSON
//     // if (mergeStatus) {
//     await saveJsonFiles(metadataFile, 'metadata');
//     await saveJsonFiles(settingsFile, 'appsettings', dirName);
//     console.log('write json sucess ---------');
//     // }

//     console.log('write done ------------');

//     // may need a commit force
//     if (!mergeStatus) {
//       await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'merge failed - force commit for settings', true);
//       // await commitJson(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'merge failed - force commit for settings', true);
//       console.log('merge conflict commit done ----- ------------');
//     }
//     // const commitStatus2 = pushResult && await commitJson(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added force from scribe for collabarator', true);

//     // push merged changes to main origin
//     const pushMain = await pushTheChanges(fs, projectsMetaPath, mainBranch, auth.token.sha1);
//     console.log('5------------');

//     // delete local branch
//     const deleteStatus = pushMain && await deleteTheBranch(fs, projectsMetaPath, localBranch);
//     // create local branch
//     const createStatus = deleteStatus && await createBranch(fs, projectsMetaPath, localBranch);
//     // test manual chekout to user
//     const checkStatus2 = createStatus && await checkoutToBranch(fs, projectsMetaPath, localBranch);
//     console.log(' 5.5 checkout to user------------', checkStatus2);
//     console.log('ALL DONE-------------------------');

//     // // pull latest from origin main to local branch
//     // const pullStatus2 = checkStatus2 && await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
//     // console.log('6------------');
//     // if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
//     //   // force commit the ignored files (json) to remote user branch
//     //   await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Forcely added scribe files', true);
//     //   console.log('7------------');
//     // }
//     // // push changes to remote user from local user
//     // const pushUser = pullStatus2 && await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
//     // console.log('8------------');
//     // console.log({ pushUser });
//     // setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
//   }
// }
