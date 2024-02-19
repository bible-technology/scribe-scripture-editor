/* eslint-disable max-len */
import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { environment } from '../../../environment';
import * as logger from '../../logger';
import { validate } from '../../util/validate';
import { updateVersion } from './updateTranslationSB';
import packageInfo from '../../../../package.json';
import { checkAndAddLanguageToCustom } from '../projects/languageUtil';

const md5 = require('md5');
const path = require('path');

export const checkImportDuplicate = async (folderList, projectName, metadata, projectDir, fs) => {
  // To avoid the duplication of exising project on re-importing
  // Checking project name, key and Id with the existing project's upstream
  let upstreamObj; let incomingId; let incomingKey; let primaryId;
  await folderList.forEach((folder) => {
    if (folder.split('_')[0].toLowerCase() === projectName.toLowerCase()) {
      const sb = fs.readFileSync(path.join(projectDir, folder, 'metadata.json'));
      const metadataExisting = JSON.parse(sb);
      incomingKey = Object.keys(metadata.identification.primary)[0];
      incomingId = Object.keys(metadata.identification.primary[incomingKey])[0];
      upstreamObj = metadataExisting.identification.upstream;
      primaryId = Object.keys(metadataExisting.identification.primary.scribe)[0];
    }
  });
  return {
    incomingId, incomingKey, upstreamObj, primaryId,
  };
};

export const checkDuplicate = async (metadata, currentUser, resource) => {
  logger.debug('importBurrito.js', 'In checkDuplicate');
  const fs = window.require('fs');
  const projectName = metadata.identification?.name?.en;
  let existingProject;
  let id;
  const newpath = localStorage.getItem('userPath');
  const projectDir = path.join(newpath, packageInfo.name, 'users', currentUser, resource);
  const folderList = fs.readdirSync(projectDir);
  logger.debug('importBurrito.js', 'Checking for scribe key in burrito');
  if (metadata.identification.primary.scribe !== undefined) {
    Object.entries(metadata.identification?.primary?.scribe).forEach(([key]) => {
      logger.debug('importBurrito.js', 'Fetching the key from Primary.');
      id = key;
    });
  } else if (metadata.identification?.upstream?.scribe !== undefined) {
    const list = metadata.identification?.upstream?.scribe;
    logger.debug('importBurrito.js', 'Fetching the latest key from upstream list.');
    const latest = list.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
    Object.entries(latest).forEach(([key]) => {
      logger.debug('importBurrito.js', 'Fetching the latest key from upstream.');
      id = key;
    });
  }
  // if ID and project name is available
  if (id && projectName) {
    await folderList.forEach((folder) => {
      if (folder === `${projectName}_${id}`) {
        logger.debug('importBurrito.js', 'Project already exists.');
        existingProject = true;
      }
    });
  } else if (projectName && resource === 'projects') {
    // if not get id but project name - to avoid duplicate import
    await checkImportDuplicate(folderList, projectName, metadata, projectDir, fs)
    .then((upstreamValue) => {
      if (upstreamValue.incomingKey && Object.keys(upstreamValue.upstreamObj).includes(upstreamValue.incomingKey)
      && (Object.keys(upstreamValue.upstreamObj[upstreamValue.incomingKey][0])).includes(upstreamValue.incomingId)) {
        logger.debug('importBurrito.js', 'Project already exists.');
        existingProject = true;
      }
    });
  }
  if (existingProject === true) {
    logger.debug('importBurrito.js', 'Project already exists.');
  } else {
    logger.debug('importBurrito.js', 'This is a New Project.');
  }
  return existingProject;
};
export const viewBurrito = async (filePath, currentUser, resource) => {
  logger.debug('importBurrito.js', 'Inside viewBurrito');
  const fs = window.require('fs');
  const result = {};
  if (fs.existsSync(path.join(filePath, 'metadata.json'))) {
    logger.debug('importBurrito.js', 'Project has Burrito file metadata.json.');
    result.fileExist = true;
    let sb = fs.readFileSync(path.join(filePath, 'metadata.json'));
    const metadata = JSON.parse(sb);
    // Fixing the issue of previous version of AG. The dateCreated was left empty and it will fail the validation.
    if (!metadata?.meta?.dateCreated) {
      const agId = Object.keys(metadata?.identification?.primary?.scribe);
      metadata.meta.dateCreated = metadata?.identification?.primary?.scribe[agId[0]].timestamp;
      sb = JSON.stringify(metadata);
    }
    const success = await validate('metadata', path.join(filePath, 'metadata.json'), sb, metadata.meta.version);
    if (success || metadata.type?.flavorType?.flavor?.name === 'audioTranslation') {
      result.validate = true;
      logger.debug('importBurrito.js', 'Burrito file validated successfully');
      result.projectName = metadata.identification?.name?.en;
      result.version = metadata.meta.version;
      result.burritoType = `${metadata.type?.flavorType?.name} / ${metadata.type?.flavorType?.flavor?.name}`;
      result.ingredients = Object.keys(metadata.ingredients).map((key) => key);
      result.primaryKey = metadata.identification.primary;
      result.publicDomain = metadata.copyright?.publicDomain;
      result.language = metadata.languages.map((lang) => lang.name.en);
      const duplicate = await checkDuplicate(metadata, currentUser, resource);
      result.duplicate = duplicate;
    } else {
      result.validate = false;
      if (metadata.meta.version < environment.AG_MINIMUM_BURRITO_VERSION) {
        result.version = metadata.meta.version;
        logger.error('importBurrito.js', `Expected burrito version ${environment.AG_MINIMUM_BURRITO_VERSION} or more instead of ${metadata.meta.version}`);
      } else {
        logger.error('importBurrito.js', 'Invalid burrito file (metadata.json).');
      }
    }
  } else {
    logger.warn('importBurrito.js', 'Unable to find burrito file (metadata.json).');
    result.fileExist = false;
  }
  return result;
};
const updateAudioDir = async (dir, path, fs, status) => {
  // dir - dir path till project name
  const AdmZip = window.require('adm-zip');
  const metadata = fs.readFileSync(path.join(dir, 'metadata.json'));
  const buritto = JSON.parse(metadata);
  const result = Object.keys(buritto.ingredients).filter((key) => key.includes('ag_internal_audio.zip'));
  // if Full project Import
  if (result.length > 0) {
    const zip = new AdmZip(path.join(dir, 'audio', 'ingredients', 'ag_internal_audio.zip'));
    zip.extractAllTo(path.join(dir, 'audio', 'ingredients'), true);
    fs.unlinkSync(path.join(dir, 'audio', 'ingredients', 'ag_internal_audio.zip'));
    const renames = Object.keys(buritto.ingredients);
    await renames?.forEach((rename) => {
      if (!rename.includes('ag_internal_audio.zip')) {
        buritto.ingredients[rename.replace(rename, path.join('audio', rename))] = buritto.ingredients[rename];
      }
      delete buritto.ingredients[rename];
    });
    await fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(buritto));
    // other than full project (verse wise)
  } else {
    const renames = Object.keys(buritto.ingredients);
    const audioExtensions = ['.mp3', '.wav'];
    await renames?.forEach((rename) => {
      if (!rename.match(/audio[/\\]/g)) {
        // check for ingredient have audio on start if not add audio/ on first
        buritto.ingredients[rename.replace(rename, path.join('audio', rename))] = buritto.ingredients[rename];
        delete buritto.ingredients[rename];
      }
      // rename audio files with default
      if (audioExtensions.some((ext) => rename.toLowerCase().includes(ext))) {
        // eslint-disable-next-line array-callback-return
        const extension = audioExtensions.filter((ext) => {
          if (rename.toLocaleLowerCase().includes(ext)) { return ext; }
        });
        if (extension.length > 0) {
          const nameWithDefault = rename.replace(extension[0], `_1_default${extension[0]}`);
          fs.rename(path.join(dir, 'audio', rename), path.join(dir, 'audio', nameWithDefault), (err) => {
            if (err) {
              logger.error('importBurrito.js', `Audio Rename - ${err}`);
              status.push({ type: 'error', value: 'Invalid burrito file (metadata.json). or default audio failed' });
            }
          });
        }
      }
    });
    await fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(buritto));
  }
};

const checkTheProjectIsAudioChapterLevel = async (metadata) => {
  const chapterPathRegex = /^[0-9]{1,3}\.(mp3|wav)/gm;
  const chapterLevel = Object.keys(metadata.ingredients).some((path) => {
    const pathArr = path.split('/');
    const fileName = pathArr[pathArr.length - 1];
    return chapterPathRegex.test(fileName);
});
  return chapterLevel;
};

// Core Function Handle Burrito Import for all type of Projects
const importBurrito = async (filePath, currentUser, updateBurritoVersion, concatedLangs = []) => {
  logger.debug('importBurrito.js', 'Inside importBurrito');
  const fs = window.require('fs');
  const fse = window.require('fs-extra');
  const status = [];
  const newpath = localStorage.getItem('userPath');
  const projectDir = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects');
  fs.mkdirSync(projectDir, { recursive: true });
  // Importing the project
  if (fs.existsSync(path.join(filePath, 'metadata.json'))) {
    logger.debug('importBurrito.js', 'Project has Burrito file metadata.json.');
    let sb = fs.readFileSync(path.join(filePath, 'metadata.json'));
    let metadata = JSON.parse(sb);
    // check if its an audio import and not the import burrito is for chapter level export
    if (metadata.type?.flavorType?.flavor?.name === 'audioTranslation') {
      const chapterLevel = await checkTheProjectIsAudioChapterLevel(metadata);
      if (chapterLevel) {
        logger.error('importBurrito.js', 'Import not supported for chapter level audio projects');
        status.push({ type: 'error', value: 'Import not supported for chapter level audio projects' });
        return status;
      }
    }
    // Fixing the issue of previous version of AG. The dateCreated was left empty and it will fail the validation.
    if (!metadata?.meta?.dateCreated) {
      const agId = Object.keys(metadata?.identification?.primary?.scribe);
      metadata.meta.dateCreated = metadata?.identification?.primary?.scribe[agId[0]].timestamp;
      sb = JSON.stringify(metadata);
    }
    const success = validate('metadata', path.join(filePath, 'metadata.json'), sb, metadata.meta.version);
    // after validate burrito for other than Audio
    if (success || metadata.type?.flavorType?.flavor?.name === 'audioTranslation') {
      logger.debug('importBurrito.js', 'Burrito file validated successfully or Audio Project');
      let projectName = metadata.identification?.name?.en;
      let id; let foundId = false;
      logger.debug('importBurrito.js', 'Checking for scribe primary key');
      if (metadata.identification.primary?.scribe !== undefined) {
        Object.entries(metadata.identification?.primary?.scribe).forEach(([key]) => {
          logger.debug('importBurrito.js', 'Fetching the key from burrito.');
          id = key;
        });
      } else if (metadata.identification.upstream?.scribe !== undefined) {
        Object.entries(metadata.identification.primary).forEach(([key]) => {
          logger.debug('importBurrito.js', 'Swapping data between primary and upstream');
          const identity = metadata.identification.primary[key];
          metadata.identification.upstream[key] = [identity];
          delete metadata.identification.primary[key];
          delete metadata.idAuthorities;
        });
        metadata.idAuthorities = {
          scribe: {
            id: 'http://www.scribe.bible',
            name: {
              en: 'Scribe application',
            },
          },
        };
        const list = metadata.identification?.upstream?.scribe;
        logger.debug('importBurrito.js', 'Fetching the latest key from list.');
        // eslint-disable-next-line max-len
        const latest = list.reduce((a, b) => (new Date(a.timestamp) > new Date(b.timestamp) ? a : b));
        Object.entries(latest).forEach(([key]) => {
          logger.debug('importBurrito.js', 'Fetching the latest key from burrito.');
          id = key;
        });
        if (list.length > 1) {
          (metadata.identification.upstream.scribe).forEach((e, i) => {
            if (e === latest) {
              (metadata.identification?.upstream?.scribe)?.splice(i, 1);
            }
          });
        } else {
          delete metadata.identification?.upstream?.scribe;
        }
        metadata.identification.primary.scribe = latest;
      } else {
        // if Id is undefined - trying to get id, if project already exist
        const folderList = await fs.readdirSync(projectDir);
        await checkImportDuplicate(folderList, projectName, metadata, projectDir, fs)
        .then((upstreamValue) => {
          // The ID of the existing project, using it for over wriitting it.
          if (upstreamValue.primaryId) {
            id = upstreamValue.primaryId;
            foundId = true;
          }
        });
      }

      if (!id || foundId === true) {
        Object.entries(metadata.identification.primary).forEach(([key]) => {
          logger.debug('importBurrito.js', 'Swapping data between primary and upstream');
          if (key !== 'scribe') {
            const identity = metadata.identification.primary[key];
            metadata.identification.upstream = {};
            metadata.identification.upstream[key] = [identity];
            delete metadata.identification.primary[key];
          }
        });
        if (!id) {
          logger.debug('importBurrito.js', 'Creating a new key.');
          const key = currentUser + metadata.identification.name.en + moment().format();
          id = uuidv5(key, environment.uuidToken);
        }
        metadata.identification.primary.scribe = {
          [id]: {
          revision: '0',
          timestamp: moment().format(),
          },
        };
      }
      if (!projectName) {
        logger.debug('importBurrito.js', 'Taking folder name as Project Name');
        // path.basename is not working for windows
        // projectName = path.basename(filePath);
        projectName = (filePath.split(/[(\\)?(/)?]/gm)).pop();
      }
      const firstKey = Object.keys(metadata.ingredients)[0];
      const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
      let dirName = folderName[0];
      let audioDir;
      // Checking the Flavor, because the Audio project should have 'audio' folder
      // Check whether the selected project has 'audio' folder or not
      if (metadata.type?.flavorType?.flavor?.name === 'audioTranslation' && !fs.existsSync(path.join(filePath, 'audio'))) {
        audioDir = path.join(projectDir, `${projectName}_${id}`, 'audio');
      } else {
        audioDir = path.join(projectDir, `${projectName}_${id}`);
        if (fs.existsSync(path.join(filePath, 'audio'))) { dirName = path.join(dirName, 'ingredients'); }
      }
      fs.mkdirSync(path.join(audioDir, dirName), { recursive: true });
      logger.debug('importBurrito.js', 'Creating a directory if not exists.');
      // audioDir = projectPath + audio for audio || projectPath for other
      // copy from source (filePath) to target (audioDir) and update meta
      await fse.copy(filePath, audioDir)
      .then(() => {
        // check rename add default
        Object.entries(metadata.ingredients).forEach(([key, value]) => {
          logger.debug('importBurrito.js', 'Fetching keys from ingredients.');
          const content = fs.readFileSync(path.join(audioDir, key), 'utf8');
          const checksum = md5(content);
          if (checksum !== value.checksum.md5) {
            logger.debug('importBurrito.js', 'Updating the checksum.');
          }
          const stats = fs.statSync(path.join(filePath, key));
          if (stats.size !== value.size) {
            logger.debug('importBurrito.js', 'Updating the size.');
          }
          metadata.ingredients[key].checksum.md5 = checksum;
          metadata.ingredients[key].size = stats.size;
        });
      })
      .catch((err) => logger.error('importBurrito.js', `${err}`));
      metadata.meta.generator.softwareName = 'Scribe';
      metadata.meta.generator.userName = currentUser;
      if (!fs.existsSync(path.join(filePath, dirName, environment.PROJECT_SETTING_FILE))) {
        logger.debug('importBurrito.js', `Creating ${environment.PROJECT_SETTING_FILE} file`);
        const settings = {
          version: environment.AG_SETTING_VERSION,
          project: {
            [metadata.type.flavorType.flavor.name]: {
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
        logger.debug('importBurrito.js', `Creating the ${environment.PROJECT_SETTING_FILE} file.`);
        await fs.writeFileSync(path.join(audioDir, dirName, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
        const stat = fs.statSync(path.join(audioDir, dirName, environment.PROJECT_SETTING_FILE));
        metadata.ingredients[path.join(dirName, environment.PROJECT_SETTING_FILE)] = {
          checksum: {
            md5: md5(settings),
          },
          mimeType: 'application/json',
          size: stat.size,
          role: 'x-scribe',
        };
      } else {
        logger.debug('importBurrito.js', `Updating ${environment.PROJECT_SETTING_FILE} file`);
        const scribe = fs.readFileSync(path.join(audioDir, dirName, environment.PROJECT_SETTING_FILE));
        let settings = JSON.parse(scribe);
        if (settings.version !== environment.AG_SETTING_VERSION) {
          // eslint-disable-next-line prefer-const
          let setting = settings;
          setting.version = environment.AG_SETTING_VERSION;
          setting.project[metadata.type.flavorType.flavor.name].scriptDirection = settings.project[metadata.type.flavorType.flavor.name]?.scriptDirection ? settings.project[metadata.type.flavorType.flavor.name]?.scriptDirection : '';
          setting.project[metadata.type.flavorType.flavor.name].starred = settings.project[metadata.type.flavorType.flavor.name]?.starred ? settings.project[metadata.type.flavorType.flavor.name]?.starred : false;
          setting.project[metadata.type.flavorType.flavor.name].isArchived = settings.project[metadata.type.flavorType.flavor.name]?.isArchived ? settings.project[metadata.type.flavorType.flavor.name]?.isArchived : false;
          setting.project[metadata.type.flavorType.flavor.name].versification = settings.project[metadata.type.flavorType.flavor.name]?.versification ? settings.project[metadata.type.flavorType.flavor.name]?.versification : 'ENG';
          setting.project[metadata.type.flavorType.flavor.name].description = settings.project[metadata.type.flavorType.flavor.name]?.description ? settings.project[metadata.type.flavorType.flavor.name]?.description : '';
          setting.project[metadata.type.flavorType.flavor.name].copyright = settings.project[metadata.type.flavorType.flavor.name]?.copyright ? settings.project[metadata.type.flavorType.flavor.name]?.copyright : { title: 'Custom' };
          setting.project[metadata.type.flavorType.flavor.name].refResources = settings.project[metadata.type.flavorType.flavor.name]?.refResources ? settings.project[metadata.type.flavorType.flavor.name]?.refResources : [];
          setting.project[metadata.type.flavorType.flavor.name].bookMarks = settings.project[metadata.type.flavorType.flavor.name]?.bookMarks ? settings.project[metadata.type.flavorType.flavor.name]?.bookMarks : [];
          // setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
          if (!setting.sync && !setting.sync?.services) {
            setting.sync = { services: { door43: [] } };
          } else {
            setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
          }
          if (!setting.project[metadata.type.flavorType.flavor.name].font) {
            setting.project[metadata.type.flavorType.flavor.name].font = '';
          } else {
            setting.font = (setting.project[metadata.type.flavorType.flavor.name].font) ? (setting.project[metadata.type.flavorType.flavor.name].font) : '';
          }
          settings = setting;
        }
        settings.project[metadata.type.flavorType.flavor.name].lastSeen = moment().format();
        await fs.writeFileSync(path.join(audioDir, dirName, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
      }
      if (metadata.copyright?.fullStatementPlain) {
        const newLicence1 = (metadata.copyright.fullStatementPlain.en).replace(/\\n/gm, '\n');
        const newLicence = newLicence1?.replace(/\\r/gm, '\r');
        const licence = newLicence?.replace(/'/gm, '"');
        await fs.writeFileSync(path.join(audioDir, dirName, 'license.md'), licence);
        const copyrightStats = fs.statSync(path.join(audioDir, dirName, 'license.md'));
        metadata.copyright.licenses = [{ ingredient: 'license.md' }];
        metadata.ingredients[path.join(dirName, 'license.md')] = {
          checksum: {
            md5: md5(metadata.copyright.fullStatementPlain.en),
          },
          mimeType: 'text/md',
          size: copyrightStats.size,
          role: 'x-licence',
        };
        delete metadata.copyright.fullStatementPlain;
        delete metadata.copyright.publicDomain;
      }
      if (updateBurritoVersion) {
        logger.debug('importBurrito.js', 'Updating the burrito version');
        metadata = updateVersion(metadata);
      }
      await fs.writeFileSync(path.join(projectDir, `${projectName}_${id}`, 'metadata.json'), JSON.stringify(metadata));
      logger.debug('importBurrito.js', 'Creating the metadata.json Burrito file.');
      // if audio project call function , otherwise finished import
      if (metadata.type?.flavorType?.flavor?.name === 'audioTranslation') {
        const proDir = path.join(projectDir, `${projectName}_${id}`);
        if (fs.existsSync(path.join(proDir, 'audio', 'metadata.json'))) {
          fs.unlinkSync(path.join(proDir, 'audio', 'metadata.json'));
        }
        updateAudioDir(proDir, path, fs, status);
      }
      // Check and create project Language if not exist in lang json / user custom list
      await checkAndAddLanguageToCustom(metadata, concatedLangs);
      status.push({ type: 'success', value: 'Project Imported Successfully' });
    } else {
      logger.error('importBurrito.js', 'Invalid burrito file (metadata.json).');
      status.push({ type: 'error', value: 'Invalid burrito file (metadata.json).' });
    }
  } else {
    logger.warn('importBurrito.js', 'Unable to find burrito file (metadata.json).');
    status.push({ type: 'error', value: 'Unable to find burrito file (metadata.json).' });
  }
  return status;
};
export default importBurrito;
