import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { updateVersion } from '@/core/burrito/updateTranslationSB';
import {
  readContent,
} from 'gitea-react-toolkit';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';
import packageInfo from '../../../../../package.json';

const md5 = require('md5');
const path = require('path');

async function readAndCreateIngredients(action, sbDataObject, ignoreFilesPaths, projectDir, projectName, id, auth, repo, userBranch, fs, firstTime) {
  logger.debug('SyncFromGiteaUtils.js', 'in read and write ingredients function');
  try {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in sbDataObject.ingredients) {
      action?.setSyncProgress((prev) => ({
        ...prev,
        completedFiles: prev.completedFiles + 1,
      }));
      if (!ignoreFilesPaths.includes(key)) {
        // eslint-disable-next-line no-await-in-loop
        const readResult = await readContent(
          {
            config: auth.config,
            owner: repo.owner.username,
            repo: repo.name,
            ref: firstTime ? userBranch?.name : `${userBranch?.name}-merge`,
            filepath: key,
          },
          // eslint-disable-next-line no-loop-func
          );
          if (readResult) {
            logger.debug('giteaUtils import.js', 'sending the data from Gitea with content');
            if (readResult !== null) {
              // eslint-disable-next-line no-await-in-loop
              const rep1 = await fetch(readResult.download_url);
              // eslint-disable-next-line no-await-in-loop
              const ingredient = await rep1.text();
              // eslint-disable-next-line no-await-in-loop
              await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, key), ingredient);
              logger.debug('SyncFromGiteaUtisl import.js', `Write File success ${key}`);
            } else {
              logger.debug('SyncFrom giteaUtils import.js', `Error in read ${key} from Server `);
              throw new Error(`Error in read ${key} from Server `);
            }
          }
      }
    }
} catch (err) {
    throw new Error(err?.message || err);
  }
}

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
    if (settings.version !== environment.AG_SETTING_VERSION) {
      // eslint-disable-next-line prefer-const
      let setting = settings;
      setting.version = environment.AG_SETTING_VERSION;
      setting.project[sbDataObject.type.flavorType.flavor.name].scriptDirection = settings.project[sbDataObject.type.flavorType.flavor.name]?.scriptDirection ? settings.project[sbDataObject.type.flavorType.flavor.name]?.scriptDirection : '';
      setting.project[sbDataObject.type.flavorType.flavor.name].starred = settings.project[sbDataObject.type.flavorType.flavor.name]?.starred ? settings.project[sbDataObject.type.flavorType.flavor.name]?.starred : false;
      setting.project[sbDataObject.type.flavorType.flavor.name].isArchived = settings.project[sbDataObject.type.flavorType.flavor.name]?.isArchived ? settings.project[sbDataObject.type.flavorType.flavor.name]?.isArchived : false;
      setting.project[sbDataObject.type.flavorType.flavor.name].versification = settings.project[sbDataObject.type.flavorType.flavor.name]?.versification ? settings.project[sbDataObject.type.flavorType.flavor.name]?.versification : 'ENG';
      setting.project[sbDataObject.type.flavorType.flavor.name].description = settings.project[sbDataObject.type.flavorType.flavor.name]?.description ? settings.project[sbDataObject.type.flavorType.flavor.name]?.description : '';
      setting.project[sbDataObject.type.flavorType.flavor.name].copyright = settings.project[sbDataObject.type.flavorType.flavor.name]?.copyright ? settings.project[sbDataObject.type.flavorType.flavor.name]?.copyright : { title: 'Custom' };
      setting.project[sbDataObject.type.flavorType.flavor.name].refResources = settings.project[sbDataObject.type.flavorType.flavor.name]?.refResources ? settings.project[sbDataObject.type.flavorType.flavor.name]?.refResources : [];
      setting.project[sbDataObject.type.flavorType.flavor.name].bookMarks = settings.project[sbDataObject.type.flavorType.flavor.name]?.bookMarks ? settings.project[sbDataObject.type.flavorType.flavor.name]?.bookMarks : [];
      // setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
      if (!setting.sync && !setting.sync?.services) {
        setting.sync = { services: { door43: [] } };
        } else {
          setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
        }
      settings = setting;
    }
    settings.project[sbDataObject.type.flavorType.flavor.name].lastSeen = moment().format();
    await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, dirName, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
  }
}

// import gitea project to local
export const importServerProject = async (updateBurrito, repo, sbData, auth, userBranch, action, currentUser, ignoreFilesPaths = [], firstTime = false) => {
  try {
    logger.debug('SyncFromGiteaUtils.js', 'Inside Import Project core');
    const fs = window.require('fs');
    const newpath = localStorage.getItem('userPath');
    let sbDataObject = { ...sbData };
    const projectDir = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects');
    fs.mkdirSync(projectDir, { recursive: true });
    // updating the created timestamp if not exist
    if (!sbData?.meta?.dateCreated && sbDataObject?.identification?.primary?.scribe) {
      const scribeId = Object.keys(sbDataObject?.identification?.primary?.scribe);
      sbDataObject.meta.dateCreated = sbDataObject?.identification?.primary?.scribe[scribeId[0]].timestamp;
    }
    let projectName = sbDataObject.identification?.name?.en;
    let id;
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
    }

    // generating unique key if not exist or get
    if (!id && sbDataObject?.identification?.primary) {
      Object.entries(sbDataObject?.identification?.primary).forEach(([key]) => {
      logger.debug('SyncFromGiteaUtils.js', 'Swapping data between primary and upstream');
      if (key !== 'scribe') {
        const identity = sbDataObject.identification.primary[key];
        sbDataObject.identification.upstream[key] = [identity];
        delete sbDataObject.identification.primary[key];
      }
      });
      logger.debug('SyncFromGiteaUtils.js', 'Creating a new key.');
      const key = currentUser + sbDataObject.identification.name.en + moment().format();
      id = uuidv5(key, environment.uuidToken);
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

    // get the directory name from ingredients list, fetch and create files
    if (sbDataObject?.ingredients) {
      const firstKey = Object.keys(sbDataObject?.ingredients)[0];
      const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
      const dirName = folderName[0];
      logger.debug('SyncFromGiteaUtils.js', 'Creating a directory if not exists.');
      fs.mkdirSync(path.join(projectDir, `${projectName}_${id}`, dirName), { recursive: true });

      // call for start upload files =-======== trigger action.syncProgress - already started
      // loop thorugh ingredients , fetch file and write to local
      await readAndCreateIngredients(action, sbDataObject, ignoreFilesPaths, projectDir, projectName, id, auth, repo, userBranch, fs, firstTime);
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
    }
  } catch (err) {
    logger.debug('SyncFromGiteaUtils.js', `error called in import server project : ${err}`);
    throw new Error(err?.message || err);
  }
};
