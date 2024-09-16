import * as localForage from 'localforage';
import {
  readContent,
} from 'gitea-react-toolkit';
import { validate } from '@/util/validate';
import { checkDuplicate } from '@/core/burrito/importBurrito';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';
import { importServerProject } from './SyncFromGiteaUtils';

export async function downloadFromGitea(repo, auth, setSyncProgress, notifyStatus, setSelectedGiteaProject, addNotification) {
  logger.debug('SyncFromGitea.js', 'in SyncFromGiea : onClick offline sync');
  try {
    const currentUser = await localForage.getItem('userProfile');
    const fetchBranch = await fetch(`${environment.GITEA_API_ENDPOINT}/repos/${repo.owner.username}/${repo.name}/branches`);
    const branchData = await fetchBranch.json();
    if (branchData) {
      const regex = /.+\/\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]).1/;
      const foundSyncBranch = branchData.find((value) => regex.test(value.name));
      if (foundSyncBranch) {
        logger.debug('SyncFromGitea.js', 'in SyncFromGiea : fetch content branch success');
        const readMetaData = await readContent(
          {
            config: auth.config,
            owner: auth.user.login,
            repo: repo.name,
            ref: foundSyncBranch?.name,
            filepath: 'metadata.json',
          },
        );
        const fetchMetaData = await fetch(readMetaData.download_url);
        const metaFile = await fetchMetaData.json();
        if (metaFile) {
          const sb = Buffer.from(metaFile.data);
          const metaDataSB = JSON.parse(sb);
          logger.debug('SyncFromGitea.js', 'in SyncFromGiea : fetch and parse metaData Success');
          // Validate the burrito
          const success = await validate('metadata', 'gitea/metadata.json', sb, metaDataSB.meta.version);
          // if success proceed else raise error
          if (success) {
            logger.debug('SyncFromGitea.js', 'in SyncFromGiea : metaData SB validated');
            setSyncProgress((prev) => ({
              ...prev,
              syncStarted: true,
              totalFiles: Object.keys(metaDataSB?.ingredients).length + 2,
              completedFiles: 1,
            }));
            // setProjectData
            setSelectedGiteaProject({
              repo,
              branch: foundSyncBranch,
              metaDataSB,
              localUsername: currentUser.username,
              auth,
              mergeStatus: false,
            });
            // check for project exising - true/ undefined
            const duplicate = await checkDuplicate(metaDataSB, currentUser?.username, 'projects');
            if (duplicate) {
              logger.debug('SyncFromGitea.js', 'in SyncFromGiea : project exist and merge action');
              // save all data and trigger merge
              setSelectedGiteaProject((prev) => ({ ...prev, mergeStatus: true }));
            } else {
            // import call
              logger.debug('SyncFromGitea.js', 'in SyncFromGiea : new project and import called');
              await importServerProject(false, repo, metaDataSB, auth, foundSyncBranch, { setSyncProgress, notifyStatus }, currentUser.username);
              await notifyStatus('success', 'Project Sync to scribe successfull');
              await addNotification('Sync', 'Project Sync Successfull', 'success');
            }
          } else {
            logger.debug('SyncFromGitea.js', 'Burrito Validation Failed');
            throw new Error('Burrito Validation Failed');
          }
        } else { throw new Error('Failed to read MetaData'); }
      } else {
        logger.debug('SyncFromGitea.js', 'Invalid Project , No Valid Branch');
        throw new Error('Invalid Project, No Valid Branch');
      }
    } else { throw new Error('branch not found'); }
  } catch (err) {
    logger.debug('SyncFromGitea.js', `In error : ${err}`);
    setSelectedGiteaProject({
      repo: null, branch: null, metaDataSB: null, localUsername: null, auth: null, mergeStatus: false,
    });
    notifyStatus('failure', `Sync Failed , ${err?.message || err}`);
    await addNotification('Sync', err?.message || err, 'failure');
  } finally {
    setSyncProgress({
      syncStarted: false,
      totalFiles: 0,
      completedFiles: 0,
    });
  }
}
