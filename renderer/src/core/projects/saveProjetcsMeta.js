import moment from 'moment';
import * as localforage from 'localforage';
import { v5 as uuidv5 } from 'uuid';
import { checkInitialize, commitChanges, initProject } from '@/components/Sync/Isomorphic/utils';
import { factoryCreateContent } from '@/util/factoryCreateContent';
import { factoryCreateSB } from '@/util/factoryCreateSB';
import * as logger from '../../logger';
import { environment } from '../../../environment';
import packageInfo from '../../../../package.json';

const bookAvailable = (list, id) => list.some((obj) => obj === id);

// Add the new mode here
const flavors = {
  Translation: 'textTranslation',
  Audio: 'audioTranslation',
  OBS: 'textStories',
  Juxta: 'x-juxtalinear',
};

// function to check git init and commmit all files
export const checkGitandCommitFiles = async (fs, projectPath, author, currentUser) => {
  try {
    const mainBranch = `${packageInfo.name}-main`;
    const authorObj = (author?.username && author?.email) ? author : { email: '', username: currentUser };
    const checkInit = await checkInitialize(fs, projectPath);
    if (!checkInit) {
      const projectInitialized = await initProject(fs, projectPath, currentUser, mainBranch);
      const commited = projectInitialized && await commitChanges(fs, projectPath, authorObj, 'Initial Commit on Creation');
      if (!commited) {
        logger.error('saveProjectsMeta.js', 'Failed to commit changes');
        throw new Error('Failed to Init and commit Project');
      }
    } else {
      logger.error('saveProjectsMeta.js', 'Project Already Inited');
    }
  } catch (err) {
    logger.error('saveProjectsMeta.js', `Error init git and commit ${err}`);
    throw new Error(err?.message || err);
  }
};

export const saveProjectsMeta = async (projectMetaObj) => {
  logger.debug('saveProjectsMeta.js', 'In saveProjectsMeta');
  const newpath = localStorage.getItem('userPath');
  const status = [];
  const fs = window.require('fs');
  const path = require('path');
  let currentUser;
  await localforage.getItem('userProfile').then((value) => {
    logger.debug('saveProjectsMeta.js', 'Fetching the current username');
    currentUser = value?.username;
  });
  fs.mkdirSync(path.join(newpath, packageInfo.name, 'users', currentUser, 'projects'), {
    recursive: true,
  });
  const projectDir = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects');
  let projectNameExists = false;
  let checkCanon = false;
  const folderList = fs.readdirSync(projectDir);
  // handle spaces
  // trim the leading spaces
  projectMetaObj.newProjectFields.projectName = projectMetaObj.newProjectFields.projectName.trim().replace(/(^_+)?(_+$)?/gm, '');
  folderList.forEach((folder) => {
    const splittedArr = folder.split('_');
    splittedArr.pop();
    const name = splittedArr.join('_');
    const existingName = name && name.toLowerCase().replace(/\s+/g, '_');
    const formatedName = projectMetaObj.newProjectFields.projectName?.toLowerCase().replace(/\s+/g, '_');
    if ((formatedName === existingName) && projectMetaObj.call === 'new') {
      // read meta and check the flavors is same or not
      const readDuplicateMeta = fs.readFileSync(path.join(projectDir, folder, 'metadata.json'));
      const currentduplicateMeta = JSON.parse(readDuplicateMeta);
      const duplicatePrjFlavor = currentduplicateMeta?.type?.flavorType?.flavor?.name;
      const currentFlavorType = projectMetaObj.projectType;
      // checking for duplicates
      if (flavors[currentFlavorType] === duplicatePrjFlavor) {
        projectNameExists = true;
        logger.warn('saveProjectsMeta.js', 'Project Name already exists');
        status.push({ type: 'warning', value: 'projectname exists, check you archived or projects tab. NOTE : Project name is case-insenstive. Space and underscore will be treated as same.' });
      }
    }
  });

  /**
   * the factory function that creates a project
   * @param {string} type one of ["Translation", "OBS", "Audio", "Juxta"]
   * @param {boolean} doChecks
   */
  const burritoChecksAndCreation = async (type, doChecks) => {
    logger.debug('saveProjectsMeta.js', `In Burrito Checks And Creation for ${type}`);

    if (doChecks) {
      projectMetaObj.importedFiles.forEach((file) => {
        if (!bookAvailable(projectMetaObj.canonSpecification.currentScope, file.id)) {
          checkCanon = true;
          logger.warn('saveProjectsMeta.js', `${file.id} is not added in Canon Specification or scope`);
          status.push({ type: 'warning', value: `${file.id} is not added in Canon Specification` });
        }
      });
    }

    if (checkCanon === false) {
      let id;
      let scope;

      // getting id and maybe scope
      if (projectMetaObj.call === 'new') {
        logger.debug('saveProjectsMeta.js', 'Creating a key for the Project');
        const key = currentUser + projectMetaObj.newProjectFields.projectName + moment().format();
        id = uuidv5(key, environment.uuidToken);
        scope = projectMetaObj?.canonSpecification?.currentScope;
      } else {
        logger.debug('saveProjectsMeta.js', 'Fetching the key from the existing Project');
        // from existing metadata
        scope = (projectMetaObj.canonSpecification.currentScope)
          .filter((x) => !(Object.keys(projectMetaObj.project.type.flavorType.currentScope)).includes(x));
        id = Object.keys(projectMetaObj.project?.identification?.primary?.scribe);
        projectMetaObj.importedFiles.forEach((file) => {
          scope.push(file.id);
        });
      }

      // create content/versification
      logger.debug('saveProjectsMeta.js', `In burritoChecksAndCreation : processing projectMetaObj.projectType : ${projectMetaObj.projectType}`);
      const ingredient = await factoryCreateContent({
        username: currentUser,
        project: projectMetaObj.newProjectFields,
        versification: projectMetaObj.versificationScheme,
        books: scope,
        direction: projectMetaObj.language.ld,
        id,
        importedFiles: projectMetaObj.importedFiles,
        copyright: projectMetaObj.copyright,
        currentBurrito: projectMetaObj.project,
        call: projectMetaObj.call,
        projectType: projectMetaObj.projectType,
        projectTypeToUse: type,
      });

      // then create SB
      const burritoFile = await factoryCreateSB({
        projectTypeToUse: projectMetaObj.projectType,
        username: currentUser,
        projectFields: projectMetaObj.newProjectFields,
        selectedScope: scope,
        language: projectMetaObj.language.ang,
        langCode: projectMetaObj.language.lc,
        direction: projectMetaObj.language.ld,
        copyright: projectMetaObj.copyright,
        id,
        project: projectMetaObj.project,
        call: projectMetaObj.call,
        update: projectMetaObj.update,
      });

      if (projectMetaObj.call === 'edit') {
        burritoFile.ingredients = { ...projectMetaObj.project.ingredients, ...ingredient };
        burritoFile?.sync && delete burritoFile.sync;
      } else {
        burritoFile.ingredients = ingredient;
      }
      logger.debug('saveProjectsMeta.js', 'Creating a burritoFile file.');

      await fs.writeFileSync(path.join(
        projectDir,
        `${projectMetaObj.newProjectFields.projectName}_${id}`,
        'metadata.json',
      ), JSON.stringify(burritoFile));

      // then maybe make a SB usfm
      if (type === 'Audio') {
        // Adding text USFM to audio project
        if ((projectMetaObj.importedFiles).length !== 0) {
          const newScope = [];
          projectMetaObj.importedFiles.forEach((file) => {
            newScope.push(file.id);
          });
          // ingredient has the list of created files in the form of SB Ingredients
          logger.debug('saveProjectsMeta.js', 'Calling creatVersification for generating USFM files.');
          await factoryCreateContent({
            username: currentUser,
            project: projectMetaObj.newProjectFields,
            versification: projectMetaObj.versificationScheme,
            books: newScope,
            direction: projectMetaObj.language.ld,
            id,
            importedFiles: projectMetaObj.importedFiles,
            copyright: projectMetaObj.copyright,
            currentBurrito: projectMetaObj.project,
            call: projectMetaObj.call,
            projectType: projectMetaObj.projectType,
            projectTypeToUse: 'Translation',
          }).then(async (ingredient) => {
            logger.debug('saveProjectsMeta.js', 'Calling createTranslationSB for creating burrito.');
            await factoryCreateSB({
              projectTypeToUse: 'Translation',
              username: currentUser,
              projectFields: projectMetaObj.newProjectFields,
              selectedScope: scope,
              language: projectMetaObj.language.ang,
              langCode: projectMetaObj.language.lc,
              direction: projectMetaObj.language.ld,
              copyright: projectMetaObj.copyright,
              id,
              project: projectMetaObj.project,
              call: projectMetaObj.call,
              update: projectMetaObj.update,
            })

              .then(async (burrito) => {
                if (projectMetaObj.call === 'edit') {
                  burrito.ingredients = { ...projectMetaObj.project.ingredients, ...ingredient };
                  burrito?.sync && delete burrito.sync;
                } else {
                  burrito.ingredients = ingredient;
                }
                logger.debug('saveProjectsMeta.js', 'Creating a burrito file.');
                await fs.writeFileSync(path.join(
                  projectDir,
                  `${projectMetaObj.newProjectFields.projectName}_${id}`,
                  'text-1',
                  'metadata.json',
                ), JSON.stringify(burrito));
              });
          });
        }
      }

      // then init git for the Project
      const projectGitPath = path.join(projectDir, `${projectMetaObj.newProjectFields.projectName}_${id}`);
      await checkGitandCommitFiles(fs, projectGitPath, null, currentUser);

      // finally push git
      logger.debug('saveProjectsMeta.js', projectMetaObj.call === 'new' ? 'New project created successfully.' : 'Updated the Changes.');
      status.push({ type: 'success', value: (projectMetaObj.call === 'new' ? 'New project created' : 'Updated the changes') });
    }
  };

  // Switch Project Creation
  if (projectNameExists === false || projectMetaObj.call === 'edit') {
    await burritoChecksAndCreation(
      projectMetaObj.projectType,
      (projectMetaObj.projectType === 'Translation' || projectMetaObj.projectType === 'Juxta'),
    );
  } else {
    logger.warn('saveProjectsMeta.js', 'Project already exists');
    status.push({ type: 'error', value: 'Project already exists' });
  }
  return status;
};
