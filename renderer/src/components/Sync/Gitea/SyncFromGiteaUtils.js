import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { updateVersion } from '@/core/burrito/updateTranslationSB';
import { checkImportDuplicate } from '@/core/burrito/importBurrito';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';
import packageInfo from '../../../../../package.json';
import {
  checkGitStatus,
 checkoutJsonFiles,
 checkoutToBranch, cloneTheProject, createBranch, createGitIgnore, getRepoOwner, pullProject, setUserConfig,
} from '../Isomorphic/utils';
import { createRemoteBranch } from '../Isomorphic/api';

const md5 = require('md5');
const path = require('path');

async function checkIngredientsMd5Values(sbDataObject, projectDir, projectName, id, fs) {
  logger.debug('SyncFromGiteaUtils.js', 'Inside md5 value update functions');
  // check md5 values
  Object.entries(sbDataObject?.ingredients).forEach(([key, value]) => {
    logger.debug('SyncFromGiteaUtils', 'Fetching keys from ingredients.');
    const content = fs.readFileSync(path.join(projectDir, `${projectName}_${id}`, key), 'utf8');
    const checksum = md5(content);
    if (checksum !== value.checksum.md5) {
      logger.debug('SyncFromGiteaUtils', 'Updating the checksum.');
    }
    const stats = fs.statSync(path.join(projectDir, `${projectName}_${id}`, key));
    if (stats.size !== value.size) {
      logger.debug('SyncFromGiteaUtils', 'Updating the size.');
    }
    sbDataObject.ingredients[key].checksum.md5 = checksum;
    sbDataObject.ingredients[key].size = stats.size;
  });
}

async function createOrUpdateAgSettings(sbDataObject, currentUser, projectName, id, dirName, projectDir, fs) {
  logger.debug('SyncFromGiteaUtils.js', 'Inside create/update, write scribe settings');
  // scribe settings file
  sbDataObject.meta.generator.userName = currentUser;
  if (!fs.existsSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE))) {
    logger.debug(`SyncFromGiteaUtils', 'Creating ${environment.PROJECT_SETTING_FILE} file`);
    const settings = {
      version: environment.AG_SETTING_VERSION,
      project: {
        [sbDataObject.type.flavorType.flavor.name]: {
          scriptDirection: 'LTR',
          starred: false,
          isArchived: false,
          versification: '',
          description: '',
          copyright: '',
          lastSeen: moment().format(),
          refResources: [],
          bookMarks: [],
          font: '',
        },
      },
      sync: { services: { door43: [] } },
    };
    logger.debug('SyncFromGiteaUtils', `Creating the ${environment.PROJECT_SETTING_FILE} file.`);
    await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
    const stat = fs.statSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE));
    sbDataObject.ingredients[path.join(dirName, environment.PROJECT_SETTING_FILE)] = {
      checksum: {
        md5: md5(settings),
      },
      mimeType: 'application/json',
      size: stat.size,
      role: `x-${packageInfo.name}`,
    };
  } else {
    logger.debug('SyncFromGiteaUtils', `Updating ${environment.PROJECT_SETTING_FILE} file`);
    const scribe = fs.readFileSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE));
    let settings = JSON.parse(scribe);
    const sbFlavName = sbDataObject.type.flavorType.flavor.name;
    if (settings.version !== environment.AG_SETTING_VERSION) {
      // eslint-disable-next-line prefer-const
      let setting = settings;
      setting.version = environment.AG_SETTING_VERSION;
      setting.project[sbFlavName].scriptDirection = settings.project[sbFlavName]?.scriptDirection ? settings.project[sbFlavName]?.scriptDirection : '';
      setting.project[sbFlavName].starred = settings.project[sbFlavName]?.starred ? settings.project[sbFlavName]?.starred : false;
      setting.project[sbFlavName].isArchived = settings.project[sbFlavName]?.isArchived ? settings.project[sbFlavName]?.isArchived : false;
      setting.project[sbFlavName].versification = settings.project[sbFlavName]?.versification ? settings.project[sbFlavName]?.versification : 'ENG';
      setting.project[sbFlavName].description = settings.project[sbFlavName]?.description ? settings.project[sbFlavName]?.description : '';
      setting.project[sbFlavName].copyright = settings.project[sbFlavName]?.copyright ? settings.project[sbFlavName]?.copyright : { title: 'Custom' };
      setting.project[sbFlavName].refResources = settings.project[sbFlavName]?.refResources ? settings.project[sbFlavName]?.refResources : [];
      setting.project[sbFlavName].bookMarks = settings.project[sbFlavName]?.bookMarks ? settings.project[sbFlavName]?.bookMarks : [];
      // setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
      if (!setting.sync && !setting.sync?.services) {
        setting.sync = { services: { door43: [] } };
      } else {
        setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
      }
      if (!setting.font) {
        setting.project[sbFlavName].font = '';
      } else {
        setting.project[sbFlavName].font = (setting.project[sbFlavName].font) ? (setting.project[sbFlavName].font) : '';
      }
      settings = setting;
    }
    settings.project[sbFlavName].lastSeen = moment().format();
    await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
  }
}

export const updateSettingsFiles = async (fs, sbDataObject1, projectDir, projectName, id, currentUser, updateBurrito, action) => {
  try {
    let sbDataObject = sbDataObject1;
    const firstKey = Object.keys(sbDataObject?.ingredients)[0];
    const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
    const dirName = folderName[0];
    logger.debug('SyncFromGiteaUtils.js', 'Creating a directory if not exists.');
    // fs.mkdirSync(path.join(projectDir, `${projectName}_${id}`, dirName), { recursive: true });

    // call for start upload files =-======== trigger action.syncProgress - already started
    // loop thorugh ingredients , fetch file and write to local
    // check and update Md5 of created files
    await checkIngredientsMd5Values(sbDataObject, projectDir, projectName, id, fs);
    // scribe-Settings File create / Update
    await createOrUpdateAgSettings(sbDataObject, currentUser, projectName, id, dirName, projectDir, fs);

    // update copyright
    if (sbDataObject.copyright.fullStatementPlain) {
      const newLicence1 = (sbDataObject.copyright.fullStatementPlain.en).replace(/\\n/gm, '\n');
      const newLicence = newLicence1?.replace(/\\r/gm, '\r');
      const licence = newLicence?.replace(/'/gm, '"');
      await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, dirName, 'license.md'), licence);
      const copyrightStats = fs.statSync(path.join(projectDir, `${projectName}_${id}`, dirName, 'license.md'));
      sbDataObject.copyright.licenses = [{ ingredient: 'license.md' }];
      sbDataObject.ingredients[path.join(dirName, 'license.md')] = {
        checksum: {
          md5: md5(sbDataObject.copyright.fullStatementPlain.en),
        },
        mimeType: 'text/md',
        size: copyrightStats.size,
        role: 'x-licence',
      };
      delete sbDataObject.copyright.fullStatementPlain;
      delete sbDataObject.copyright.publicDomain;
    }
    //   burrito update
    if (updateBurrito) {
        logger.debug('importBurrito.js', 'Updating the burrito version');
        sbDataObject = await updateVersion(sbDataObject);
    }
    await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, 'metadata.json'), JSON.stringify(sbDataObject));
    logger.debug('importBurrito.js', 'Creating the metadata.json Burrito file.');
    // action?.setUploadstart(false);
    action?.setSyncProgress((prev) => ({
      ...prev,
      completedFiles: prev.completedFiles + 1,
    }));
    logger.debug('SyncFromGiteaUtils.js', 'Finished Importing project from Gitea to Scribe');
  } catch (err) {
    throw new Error(err?.message || err);
  }
};

export const cloneAndSetProject = async (fs, gitprojectDir, repo, userBranch, auth, checkoutBranch) => {
  const cloned = await cloneTheProject(fs, gitprojectDir, repo.clone_url, userBranch, auth.token.sha1);
  // create an extra branch scribe-main, when sync from an old sync -project where
  // branch name is in the below regex matching format
  const regex = /.+\/\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]).1$/;
  if (regex.test(userBranch)) {
    // create a branch named scribe-main in remote
    await createRemoteBranch(auth, repo, userBranch, 'scribe-main');
  }
  // add config for this user
  const configStatus = cloned && await setUserConfig(fs, gitprojectDir, auth.user.username);
  // create user branch and checkout
  configStatus && await createBranch(fs, gitprojectDir, checkoutBranch);
  const checkoutStatus = await checkoutToBranch(fs, gitprojectDir, checkoutBranch);
  // create gitignore file for for collabarators
  const repoOwner = await getRepoOwner(fs, gitprojectDir);
  if ((auth.user.username).toLowerCase() !== repoOwner.toLowerCase()) {
    await createGitIgnore(fs, gitprojectDir);
  }
  return checkoutStatus;
};

// import gitea project to local
export const importServerProject = async (updateBurrito, repo, sbData, auth, userBranch, action, currentUser, duplicate, setPullPopup, setPullData, t = undefined) => {
  try {
    logger.debug('SyncFromGiteaUtils.js', 'Inside Import Project core');
    const fs = window.require('fs');
    const newpath = localStorage.getItem('userPath');
    const sbDataObject = { ...sbData };
    const projectDir = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects');
    fs.mkdirSync(projectDir, { recursive: true });
    // updating the created timestamp if not exist
    if (!sbData?.meta?.dateCreated && sbDataObject?.identification?.primary?.scribe) {
      const scribeId = Object.keys(sbDataObject?.identification?.primary?.scribe);
      sbDataObject.meta.dateCreated = sbDataObject?.identification?.primary?.scribe[scribeId[0]].timestamp;
    }
    let projectName = sbDataObject.identification?.name?.en;
    let id; let foundId = false;
    logger.debug('SyncFromGiteaUtils.js', 'Checking for scribe primary key');
    // getting unique project ID
    if (sbDataObject?.identification?.primary?.scribe !== undefined) {
      Object.entries(sbDataObject.identification?.primary?.scribe).forEach(([key]) => {
      logger.debug('SyncFromGiteaUtils.js', 'Fetching the key from burrito.');
      id = key;
      });
    } else if (sbDataObject?.identification?.upstream?.scribe !== undefined) {
      Object.entries(sbDataObject.identification.primary).forEach(([key]) => {
      logger.debug('SyncFromGiteaUtils.js', 'Swapping data between primary and upstream');
      const identity = sbDataObject.identification.primary[key];
      sbDataObject.identification.upstream[key] = [identity];
      delete sbDataObject.identification.primary[key];
      delete sbDataObject.idAuthorities;
      });
      sbDataObject.idAuthorities = {
      scribe: {
          id: 'http://www.autographa.org',
          name: {
          en: 'Scribe application',
          },
      },
      };
      const list = sbDataObject.identification?.upstream?.scribe;
      logger.debug('SyncFromGiteaUtils.js', 'Fetching the latest key from list.');
      // eslint-disable-next-line max-len
      const latest = list.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
      Object.entries(latest).forEach(([key]) => {
      logger.debug('SyncFromGiteaUtils.js', 'Fetching the latest key from burrito.');
      id = key;
      });
      if (list.length > 1) {
        (sbDataObject.identification.upstream.scribe).forEach((e, i) => {
          if (e === latest) {
            (sbDataObject.identification?.upstream?.scribe)?.splice(i, 1);
          }
        });
      } else {
        delete sbDataObject.identification?.upstream?.scribe;
      }
      sbDataObject.identification.primary.scribe = latest;
    } else {
      // if Id is undefined - trying to get id, if project already exist
      const folderList = await fs.readdirSync(projectDir);
      await checkImportDuplicate(folderList, projectName, sbDataObject, projectDir, fs)
      .then((upstreamValue) => {
        // The ID of the existing project, using it for over wriitting it.
        if (upstreamValue.primaryId) {
          id = upstreamValue.primaryId;
          foundId = true;
        }
      });
    }

    // generating unique key if not exist or get
    if (!id || foundId === true) {
      Object.entries(sbDataObject.identification.primary).forEach(([key]) => {
        logger.debug('SyncFromGiteaUtils.js', 'Swapping data between primary and upstream');
        if (key !== 'scribe') {
          const identity = sbDataObject.identification.primary[key];
          sbDataObject.identification.upstream = {};
          sbDataObject.identification.upstream[key] = [identity];
          delete sbDataObject.identification.primary[key];
        }
      });
      if (!id) {
        logger.debug('SyncFromGiteaUtils.js', 'Creating a new key.');
        const key = currentUser + sbDataObject.identification.name.en + moment().format();
        id = uuidv5(key, environment.uuidToken);
      }
      sbDataObject.identification.primary.scribe = {
        [id]: {
        revision: '0',
        timestamp: moment().format(),
        },
      };
    }
    if (!projectName) {
      logger.debug('SyncFromGiteaUtils.js', 'Taking folder name as Project Name');
      projectName = ((repo.name.split('-').pop()).replace(/_/g, ' '));
    }

    action.setSyncProgress((prev) => ({
      ...prev,
      completedFiles: prev.completedFiles + 1,
    }));

    // pull or clone section
    let pullContinue = false;
    const gitprojectDir = path.join(projectDir, `${projectName}_${id}`);
    const checkoutBranch = `${auth.user.username}/${packageInfo.name}`;
    let fetchedRepo;
    // setting common data for clone / pull with overwrite etc.
    setPullData({
      sbDataObject,
      projectDir,
      gitprojectDir,
      projectName,
      id,
      currentUser,
      updateBurrito,
      action,
      userBranch,
      checkoutBranch,
      fs,
      repo,
      auth,
    });
    // for support old sync (till 0.3.2)
    const regex = /.+\/\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01]).1$/;
    if (regex.test(userBranch)) {
      const oldSyncMessage = `<div class="flex flex-col justify-center">
      <div class="">
        We detected you are trying to sync a project from older version of sync.
        <span class="text-red-600">Please check you have synced all the changes of this project from the older version sync.</span>
      </div>
      <div class="mt-2">
        You can click
        <span class="font-bold text-green-600">Accepted</span>, which will overwrite all your local changes with the data of selected branch.
      </div>
      </div>`;
      setPullPopup({
        title: 'Sync the Changes',
        status: true,
        confirmMessage: oldSyncMessage,
        buttonName: t ? t('label-accepted') : 'Accepted',
      });
      return false;
    }
    // offline sync from old user
    // not exist direct clone and create remote scribe-main
    // if duplicate show warning and continue call delete and clone with scribe main create in remote

    if (duplicate) {
      // check status
      pullContinue = await checkGitStatus(fs, gitprojectDir);
      if (!pullContinue) {
        // warning
        setPullPopup({
          title: 'Overwrite un synced Changes',
          status: true,
          confirmMessage: 'You have un synced changes in the project. This action will overwrite un synced changes',
          buttonName: 'continue',
          type: 'overwrite',
        });
        action.setSyncProgress((prev) => ({
          ...prev,
          completedFiles: prev.completedFiles + 1,
        }));
        return false;
      }
        action.setSyncProgress((prev) => ({
          ...prev,
          completedFiles: prev.completedFiles + 1,
        }));
        const checkoutFIles = await checkoutJsonFiles(fs, gitprojectDir, checkoutBranch);
        const pullStatus = checkoutFIles && await pullProject(fs, gitprojectDir, userBranch, auth.token.sha1, checkoutBranch);
        if (!pullStatus?.status) {
          // show warning again to overwrite
          const conflictHtmlText = `<div class="flex flex-col justify-center">
                <div class="">
                  You have conflict in <span class="text-red-600">${pullStatus?.data?.data ? pullStatus?.data?.data : 'some files'}.</span>
                  Connect your administrator to resolve this conflcit.
                </div>
                <div class="text-center font-extrabold">OR</div>
                <div class="">
                  You can click
                  <span class="font-bold">OVERWRITE</span>
                  which will overwrite all unsynced changes with the data of Door43.
                </div>
                </div>`;
              setPullPopup({
                title: 'Conflict',
                status: true,
                confirmMessage: conflictHtmlText,
                buttonName: 'over-write',
                // type: 'overwrite',
              });
        }
        fetchedRepo = pullStatus?.status;
    } else {
      const checkoutStatus = await cloneAndSetProject(fs, gitprojectDir, repo, userBranch, auth, checkoutBranch);
      fetchedRepo = checkoutStatus;
      action.setSyncProgress((prev) => ({
        ...prev,
        completedFiles: prev.completedFiles + 1,
      }));
    }

    if (sbDataObject?.ingredients && fetchedRepo) {
      await updateSettingsFiles(fs, sbDataObject, projectDir, projectName, id, currentUser, updateBurrito, action);
      action.setSyncProgress((prev) => ({
        ...prev,
        completedFiles: prev.completedFiles + 1,
      }));
    } else if (!fetchedRepo && pullContinue) {
      logger.debug('SyncFromGiteaUtils.js', 'Offline Sync failed');
      // throw new Error('Offline Sync failed');
      return false;
    }
    return true;

    // get the directory name from ingredients list, fetch and create files
  } catch (err) {
    logger.debug('SyncFromGiteaUtils.js', `error called in import server project : ${err}`);
    throw new Error(err?.message || err);
  }
};
