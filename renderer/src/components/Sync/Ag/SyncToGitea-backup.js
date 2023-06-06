import * as localForage from 'localforage';
import * as logger from '../../../logger';
import {
 handleCreateRepo, createFiletoServer, updateFiletoServer, getOrPutLastSyncInAgSettings,
} from './SyncToGiteaUtils';
import packageInfo from '../../../../../package.json';

// upload project to gitea main function
export async function uploadToGitea(projectDataAg, auth, setSyncProgress, notifyStatus, addNotification) {
    logger.debug('ToGiteaUtils.js', 'in uploadTOGitea');
    const projectData = projectDataAg.projectMeta;
    const projectId = Object.keys(projectData.identification.primary[packageInfo.name])[0];
    const projectName = projectData.identification.name.en;
    const ingredientsObj = projectData.ingredients;
    const projectCreated = projectData.meta.dateCreated.split('T')[0];
    const repoName = `${packageInfo.name}-${projectData.languages[0].tag}-${projectData.type.flavorType.flavor.name}-${projectName.replace(/[\s+ -]/g, '_')}`;

    localForage.getItem('userProfile').then(async (user) => {
      const newpath = localStorage.getItem('userPath');
      const fs = window.require('fs');
      const path = require('path');
      const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', user?.username, 'projects', `${projectName}_${projectId}`);
      setSyncProgress((prev) => (
        {
          ...prev,
          totalFiles: Object.keys(ingredientsObj).length,
        }
      ));
      // Create A REPO for the project
      try {
        const createResult = await handleCreateRepo(repoName.toLowerCase(), auth);
        if (createResult.id) {
          logger.debug('SyncToGitea.js', 'repo created success : starting sync');
          setSyncProgress((prev) => ({
            ...prev,
            syncStarted: true,
          }));
          // read metadata
          const Metadata = await fs.readFileSync(path.join(projectsMetaPath, 'metadata.json'));
          await createFiletoServer(JSON.stringify(Metadata), 'metadata.json', `${user?.username}/${projectCreated}.1`, createResult.name, auth);
          logger.debug('SyncToGitea.js', 'read and uploaded metaData to repo');
          // Read ingredients
          /* eslint-disable no-await-in-loop */
          /* eslint-disable no-restricted-syntax */
          for (const key in ingredientsObj) {
            if (Object.prototype.hasOwnProperty.call(ingredientsObj, key)) {
              setSyncProgress((prev) => ({
                ...prev,
                completedFiles: prev.completedFiles + 1,
              }));
              // setTotalUploadedAg((prev) => prev + 1);
              const Metadata1 = fs.readFileSync(path.join(projectsMetaPath, key), 'utf8');
              await createFiletoServer(Metadata1, key, `${user?.username}/${projectCreated}.1`, createResult.name, auth);
              logger.debug('SyncToGitea.js', `Read and uploaded ${key} to repo`);
            }
          }
          // update the scribe-settings - sync
          await getOrPutLastSyncInAgSettings('put', projectData, auth?.user?.username);
          notifyStatus('success', 'Sync completed successfully !!');
          await addNotification('Sync', 'Project Sync Successfull', 'success');
          logger.debug('SyncToGitea.js', 'sync successfull - first time');
        } else if (createResult.message.includes('409')) {
          logger.debug('SyncToGitea.js', 'repo exist update section : 409 error');
          setSyncProgress((prev) => ({
            ...prev,
            syncStarted: true,
          }));
          const metadataContent = fs.readFileSync(path.join(projectsMetaPath, 'metadata.json'));
          await updateFiletoServer(JSON.stringify(metadataContent), 'metadata.json', `${user?.username}/${projectCreated}.1`, repoName, auth);
          logger.debug('SyncToGitea.js', 'read and updated metaData to repo');
          // Read ingredients and update
          for (const key in ingredientsObj) {
            if (Object.prototype.hasOwnProperty.call(ingredientsObj, key)) {
              setSyncProgress((prev) => ({
                ...prev,
                completedFiles: prev.completedFiles + 1,
              }));
              const metadata1 = await fs.readFileSync(path.join(projectsMetaPath, key), 'utf8');
              // setTotalUploadedAg((prev) => prev + 1);
              await updateFiletoServer(metadata1, key, `${user?.username}/${projectCreated}.1`, repoName, auth);
              logger.debug('SyncToGitea.js', `Read and updated ${key} to repo`);
            }
          }
          // update the scribe-settings - sync update
          await getOrPutLastSyncInAgSettings('put', projectData, auth?.user?.username);
          logger.debug('SyncToGitea.js', 'Updated last Sync data');
          notifyStatus('success', 'Sync completed successfully !!');
          await addNotification('Sync', 'Project Sync Successfull', 'success');
          logger.debug('SyncToGitea.js', 'sync successfull - update sync');
        } else {
          logger.debug('SyncToGitea.js', 'create/update not success on sync : ', createResult.message);
          notifyStatus('failure', 'Something went wrong, sync failed, check internet');
          logger.debug('SyncToGitea.js', 'sync failed - may be due to internet');
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
