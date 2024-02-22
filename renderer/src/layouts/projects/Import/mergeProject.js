import { readIngredients } from '@/core/reference/readIngredients';
import {
  checkInitialize,
  checkoutJsonFiles,
  checkoutToBranch,
  commitChanges,
  createBranch,
  initProject,
  listLocalBranches,
  mergeBranches,
} from '@/components/Sync/Isomorphic/utils';
import { readUserSettings } from '@/core/projects/userSettings';
import packageInfo from '../../../../../package.json';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';
import { copyFilesTempToOrginal, createAllMdInDir } from './mergeObsUtils';

const path = require('path');

export const mergeProject = async (incomingPath, currentUser, setConflictPopup, setModel, setProcessMerge) => {
  // CURRENT MERGE IS ONLY FOR OBS

  // 1. setting up basic things needed for merging
  // 2. for support merge for all versions not taking base from current project, create new
  // 3. create a new dir called .merge-staging-area in common Dir . Dir path take from env file
  // 4. init git there
  // 5. create all content files 1-50 md , 66 usfm based on ingredinets
  //    as same as in new project creation from template
  // 6. commit all those changes there in merge-main
  // 7. create a branch merge-incoming from merge-main
  // 8. copy all 1-50 md or 66 usfm from app project to here in the branch
  // 9. commit all those in merge-main
  // 10. checkout to merge-incoming
  // 8. copy all 1-50 md or 66 usfm from incoming to here in the branch
  // 9. commit those in merge-incoming
  // 10. checkout to merge-main
  // 11. merge merge-incoming  branch to merge-main
  // 12. IF :  No conflcit --> copy all those files to ORG Project and replace there
  //     ELSE : Conflcit --> show conflcit resolver and do all in merge-main branch
  //      After finish all conflcits and finish copy files to ORG PROJECTS

  // Notes : when merge all files need to be in base commit , otherwsie we will not get the conflcit filename \
  // after merge.

  try {
    logger.debug('mergeProject.js', 'start merge projects with git and temp dir');
    // --> setting up basic things needed for merging
    const tempMergeMain = 'merge-main';
    const tempMergeIncoming = 'merge-incoming';
    const mainBranch = `${packageInfo.name}-main`;
    let currentActiveBranch = mainBranch;
    const fs = window.require('fs');
    const fse = window.require('fs-extra');
    // read incoming meta
    let incomingMeta = await readIngredients({
      filePath: path.join(incomingPath, 'metadata.json'),
    });
    incomingMeta = JSON.parse(incomingMeta);
    const projectId = Object.keys(
      incomingMeta.identification.primary[packageInfo.name],
    )[0];
    const projectName = incomingMeta.identification.name.en;
    const newpath = localStorage.getItem('userPath');
    const targetPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', `${projectName}_${projectId}`);
    const author = { email: '', username: currentUser };

    logger.debug('mergeProject.js', 'Read incoming meta done');

    // check git git inited and if yes get door43 sync user
    const checkInit = await checkInitialize(fs, targetPath, mainBranch);
    if (checkInit) {
      logger.debug('mergeProject.js', 'project initialised and check for current active branch');
      const localBranches = await listLocalBranches(fs, targetPath);
      if (localBranches.length > 0) {
        const userSettings = await readUserSettings();
        if (localBranches.includes(`${userSettings?.sync?.services?.door43[0]?.username}/scribe`)) {
            currentActiveBranch = `${userSettings.sync.services.door43[0].username}/scribe`;
            author.email = userSettings.sync.services.door43[0].token.user.email;
            author.username = userSettings.sync.services.door43[0].username;
          }
      }
    } else {
      // init git
      // create scribe main (current acive branch)
      logger.debug('mergeProject.js', 'project not init. init and creare branch');
      const projectInitialized = await initProject(fs, targetPath, currentUser, currentActiveBranch);
      // initial commit
      projectInitialized && await commitChanges(fs, targetPath, author, 'Initial Commit on Offline Merge');
    }

    // --> create a new dir for merge , Dir path take from env file
    const mergeDirPath = path.join(newpath, packageInfo.name, 'common', environment.MERGE_DIR_NAME);
    // delete mergeDir if exist
    const existMergePath = await fs.existsSync(mergeDirPath);
    if (existMergePath) {
      await fs.rmdirSync(mergeDirPath, { recursive: true }, (err) => {
        if (err) {
          throw new Error(`Merge Dir exist. Failed to remove :  ${err}`);
        }
        logger.debug('mergeProject.js', 'deleted temp dir . because existing');
      });
    }

    // create DIR and files in the directory
    // FOR OBS ONLY -> Add condition here to call usfm
    const contentCreated = await createAllMdInDir(mergeDirPath);
    logger.debug('mergeProject.js', 'created base file content in the temp Dir');
    //  init git
    const gitInitialized = contentCreated && await initProject(fs, mergeDirPath, currentUser, tempMergeMain);
    // commit base setup in main branch
    const commitedMain = gitInitialized && await commitChanges(fs, mergeDirPath, author, 'Base files commit in merge repo - main branch');
    // create new branch from main
    const createBranchIncomingStatus = commitedMain && await createBranch(fs, mergeDirPath, tempMergeIncoming);
    logger.debug('mergeProject.js', 'init temp git, commit base files');
    // copy all 1-50 md or 66 usfm from app project ingredients to merge main .
    // Now Not handling merge for front , back and license of story
    const firstKey = Object.keys(incomingMeta.ingredients)[0];
    const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
    const dirName = folderName[0];
    // copy files
    createBranchIncomingStatus && await fse.copy(
      path.join(targetPath, dirName),
      mergeDirPath,
      // { filter: (file) => path.extname(file) !== '.json' || !['LICENSE'].some((val) => file.includes(val)) },
      { filter: (file) => path.extname(file) !== '.json' },
    );
    // remove license,
    await fs.unlinkSync(path.join(mergeDirPath, 'LICENSE.md'));
    logger.debug('mergeProject.js', 'copy project data and delete License - done');
    // commit all in merge
    const commitMergeMain = createBranchIncomingStatus && await commitChanges(fs, mergeDirPath, author, 'commit app changes in mergemain');
    // checkout to mergeIncoming
    const checkoutIncomingStatus = commitMergeMain && await checkoutToBranch(fs, mergeDirPath, tempMergeIncoming);
    // copy all contents from incoming dir to incoming branch
    checkoutIncomingStatus && await fse.copy(
      path.join(incomingPath, dirName),
      mergeDirPath,
      { filter: (file) => (path.extname(file) !== '.json') },
    );

    // remove license
    await fs.unlinkSync(path.join(mergeDirPath, 'LICENSE.md'));
    logger.debug('mergeProject.js', 'commit main, checkout , copy file from incoming done');
    // commit all in merge
    const commitMergeIncoming = checkoutIncomingStatus && await commitChanges(fs, mergeDirPath, author, 'commit importing changes in mergeIncoming');
    // checkout to main
    const checkoutMainStatus = commitMergeIncoming && await checkoutToBranch(fs, mergeDirPath, tempMergeMain);
    // merge incoming - main
    logger.debug('mergeProject.js', 'commit temp branch 2, checkout temp-main done');
    const mergeStatus = checkoutMainStatus && await mergeBranches(fs, mergeDirPath, tempMergeMain, tempMergeIncoming);
    if (mergeStatus.status) {
      // Isomorphic git is doing an extra merge or logic cause deletion of the merged data at staging state
      await checkoutJsonFiles(fs, mergeDirPath, tempMergeMain);
      const conflictData = {
        data: {
          mergeDirPath,
          projectPath: targetPath,
          projectContentDirName: dirName,
          author,
        },
      };
      const finalCopy = await copyFilesTempToOrginal(conflictData);
      logger.debug('mergeProject.js', 'merge done - No conflcit', finalCopy);
    } else if (mergeStatus.status === false && mergeStatus?.data) {
      logger.debug('mergeProject.js', 'merge done - conflcit. Opening resolver window');
      // conflcit section
      setConflictPopup({
        open: true,
        data: {
          projectType: 'textStories',
          files: mergeStatus.data,
          mergeDirPath,
          projectPath: targetPath,
          projectContentDirName: dirName,
          incomingPath,
          incomingMeta,
          author,
          currentBranch: tempMergeMain,
          projectMainBranch: currentActiveBranch,
          currentUser,
          projectName: `${projectName}_${projectId}`,
        },
      });
    }
    setProcessMerge(false);
  } catch (err) {
    logger.error('mergeProject.js', `Error happended ${err}`);
    setProcessMerge(false);
  }
};
