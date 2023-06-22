import * as localForage from 'localforage';
import {
  readContent,
} from 'gitea-react-toolkit';
import { validate } from '@/util/validate';
import { checkDuplicate } from '@/core/burrito/importBurrito';
import * as logger from '../../../logger';
import { importServerProject } from './SyncFromGiteaUtils';

export async function downloadFromGitea(repo, auth, setSyncProgress, notifyStatus, setSelectedGiteaProject, addNotification, branch, setPullPopup, setPullData) {
  logger.debug('SyncFromGitea.js', 'in SyncFromGiea : onClick offline sync');
  try {
    const currentUser = await localForage.getItem('userProfile');
    logger.debug('SyncFromGitea.js', 'in SyncFromGiea : fetch metadata content from branch');
    setSyncProgress((prev) => ({
      ...prev,
      syncStarted: true,
      totalFiles: 6,
      completedFiles: 1,
    }));
    const readMetaData = await readContent(
      {
      config: auth.config,
      owner: repo.owner.username,
      repo: repo.name,
      ref: branch,
      filepath: 'metadata.json',
      },
    );
    const fetchMetaData = await fetch(readMetaData.download_url);
    const metaFile = await fetchMetaData.json();
    if (metaFile) {
      console.log('inside meta if ');
      // const sb = Buffer.from(metaFile.data);
      let metaDataSB = metaFile;
      // convert if type == bufer --> for old user support
      if (metaFile?.type === 'Buffer') {
        const sb = Buffer.from(metaFile.data);
        metaDataSB = JSON.parse(sb);
      }
      logger.debug('SyncFromGitea.js', 'in SyncFromGiea : fetch and parse metaData Success');
      // Validate the burrito
      const success = await validate('metadata', 'gitea/metadata.json', JSON.stringify(metaDataSB), metaDataSB.meta.version);
      console.log('success : ', { success });
      // if success proceed else raise error
      if (success) {
        logger.debug('SyncFromGitea.js', 'in SyncFromGiea : metaData SB validated');
        // setProjectData
        setSyncProgress((prev) => ({
          ...prev,
          completedFiles: prev.completedFiles + 1,
        }));
        setSelectedGiteaProject({
          repo,
          branch,
          metaDataSB,
          localUsername: currentUser.username,
          auth,
          mergeStatus: false,
        });
        // check for project exising - true/ undefined
        const duplicate = await checkDuplicate(metaDataSB, currentUser?.username, 'projects');
        console.log({ duplicate });
        logger.debug('SyncFromGitea.js', 'in SyncFromGiea : new project and import called');
        const status = await importServerProject(false, repo, metaDataSB, auth, branch, { setSyncProgress, notifyStatus }, currentUser.username, duplicate, setPullPopup, setPullData);
        console.log('after import server', { status });
        if (status) {
          await notifyStatus('success', 'Project Sync to scribe successfull');
          await addNotification('Sync', 'Project Sync Successfull', 'success');
        }
      } else {
        logger.debug('SyncFromGitea.js', 'Burrito Validation Failed');
        throw new Error('Burrito Validation Failed');
      }
    } else { throw new Error('Failed to read MetaData'); }
  } catch (err) {
    logger.debug('SyncFromGitea.js', `In error : ${err?.message || err} unable to find Burrito File`);
    setSelectedGiteaProject({
      repo: null, branch: null, metaDataSB: null, localUsername: null, auth: null, mergeStatus: false,
    });
    notifyStatus('failure', `Sync Failed , Unable to find Burrito File in ${branch} branch`);
    await addNotification('Sync', `${err?.message || err} unable to find Burrito File`, 'failure');
  } finally {
    setSyncProgress({
        syncStarted: false,
        totalFiles: 0,
        completedFiles: 0,
    });
  }
}
