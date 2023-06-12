import * as localForage from 'localforage';
import { environment } from 'environment';
import * as logger from '../../../logger';
import { handleCreateRepo } from './SyncToGiteaUtils';
import packageInfo from '../../../../../package.json';
import {
 addGitRemote, checkInitialize, checkoutToBranch, commitChanges, createBranch, getRepoOwner, ignorFiles, initProject, mergeBranches, pullProject, pushTheChanges,
} from '../Isomorphic/utils';
import { createRepo } from '../Isomorphic/api';
// upload project to gitea main function
export async function uploadToGitea(projectDataAg, auth, setSyncProgress, notifyStatus, addNotification) {
  logger.debug('ToGiteaUtils.js', 'in uploadTOGitea');
  const projectData = projectDataAg.projectMeta;
  const projectId = Object.keys(projectData.identification.primary[packageInfo.name])[0];
  const projectName = projectData.identification.name.en;
  // const ingredientsObj = projectData.ingredients;
  // const projectCreated = projectData.meta.dateCreated.split('T')[0];
  const repoName = `${projectData.languages[0].tag}-${projectData.type.flavorType.flavor.name}-${projectName.replace(/[\s+ -]/g, '_')}`;
  // const repo = { name: `${projectData.languages[0].tag}-${projectData.type.flavorType.flavor.name}-${projectName.replace(/[\s+ -]/g, '_')}`, owner: { username: dcsOwners.length > 0 ? dcsOwners[0].username : auth.user.username } };
  // const branch = `${auth?.user?.username}/${packageInfo.name}`;
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
        const commitStatus = await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Added from scribe');
        console.log({ commitStatus });
        if (commitStatus) {
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
          // push changes to remote user branch from local user
          const pushResult = await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
          console.log({ pushResult });
          // pull origin main to local user branch
          const pullStatus = await pullProject(fs, projectsMetaPath, mainBranch, auth.token.sha1, localBranch);
          // merge changes local user - main
          const mergeStatus = pullStatus && await mergeBranches(fs, projectsMetaPath, mainBranch, localBranch);
          // push merged changes to main origin
          const pushMain = mergeStatus && await pushTheChanges(fs, projectsMetaPath, mainBranch, auth.token.sha1);
          const repoOwner = await getRepoOwner(fs, projectsMetaPath);
          // if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
          //   // force commit the ignored files (json) to remote user branch
          //   await commitChanges(fs, projectsMetaPath, { email: auth.user.email, username: auth.user.username }, 'Forcely added scribe files', true);
          // }
          // push changes to remote user from local user
          const pushUser = pushMain && await pushTheChanges(fs, projectsMetaPath, localBranch, auth.token.sha1);
          console.log({ pushUser });
          setSyncProgress((prev) => ({ ...prev, completedFiles: prev.completedFiles + 1 }));
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
