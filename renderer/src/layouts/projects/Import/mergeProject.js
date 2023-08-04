import { readIngredients } from '@/core/reference/readIngredients';
import {
  checkInitialize,
  checkoutJsonFiles,
  checkoutToBranch,
  commitChanges,
  createBranch,
  deleteTheBranch,
  initProject,
  listLocalBranches,
  mergeBranches,
} from '@/components/Sync/Isomorphic/utils';
import { readUserSettings } from '@/core/projects/userSettings';
import packageInfo from '../../../../../package.json';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';
import { createAllMdInDir } from './mergeObsUtils';

const path = require('path');

export const mergeProject = async (incomingPath, currentUser, setConflictPopup, setModel) => {
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

  try {
    // --> setting up basic things needed for merging
    const tempMergeMain = 'merge-main';
    const tempMergeIncoming = 'merge-incoming';
    const mainBranch = `${packageInfo.name}-main`;
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

    // --> create a new dir for merge , Dir path take from env file
    const mergeDirPath = path.join(newpath, packageInfo.name, 'common', environment.MERGE_DIR_NAME);
    console.log('merge dir path : ', mergeDirPath);
    // create DIR and files in the directory
    // FOR OBS ONLY -> Add condition here to call usfm
    const contentCreated = await createAllMdInDir(mergeDirPath);
    console.log('base content crated :', { contentCreated });
    //  init git
    const gitInitialized = contentCreated && await initProject(fs, mergeDirPath, currentUser, tempMergeMain);
    console.log('git inited : ', { gitInitialized });
    // commit base setup in main branch
    const commitedMain = gitInitialized && await commitChanges(fs, mergeDirPath, author, 'Base files commit in merge repo - main branch');
    console.log('base commit done ', { commitedMain });
    // create new branch from main
    const createBranchIncomingStatus = commitedMain && await createBranch(fs, mergeDirPath, tempMergeIncoming);
    console.log('incoming branch created', { createBranchIncomingStatus });
    // copy all 1-50 md or 66 usfm from app project ingredients to merge main .
    // Now Not handling merge for front , back and license of story
    const firstKey = Object.keys(incomingMeta.ingredients)[0];
    const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
    const dirName = folderName[0];
    console.log('ingred : ', { dirName });
    // copy files
    createBranchIncomingStatus && await fse.copy(
      path.join(targetPath, dirName),
      mergeDirPath,
      // { filter: (file) => path.extname(file) !== '.json' || !['LICENSE'].some((val) => file.includes(val)) },
      { filter: (file) => path.extname(file) !== '.json' },
    );
    console.log('finish copy in main to main', { createBranchIncomingStatus });
    // commit all in merge
    const commitMergeMain = createBranchIncomingStatus && await commitChanges(fs, mergeDirPath, author, 'commit app changes in mergemain');
    console.log('commit in merge main', { commitMergeMain });
    // checkout to mergeIncoming
    const checkoutIncomingStatus = commitMergeMain && await checkoutToBranch(fs, mergeDirPath, tempMergeIncoming);
    console.log('checkout to incoming', { checkoutIncomingStatus });
    // copy all contents from incoming dir to incoming branch
    checkoutIncomingStatus && await fse.copy(
      path.join(incomingPath, dirName),
      mergeDirPath,
      { filter: (file) => (path.extname(file) !== '.json') },
    );
    console.log('finish copy data from incoming to incoming =======');
    // commit all in merge
    const commitMergeIncoming = checkoutIncomingStatus && await commitChanges(fs, mergeDirPath, author, 'commit importing changes in mergeIncoming');
    // checkout to main
    console.log('commit on incoming', { commitMergeIncoming });
    const checkoutMainStatus = commitMergeIncoming && await checkoutToBranch(fs, mergeDirPath, tempMergeMain);
    // merge incoming - main
    console.log('checkout main from incoming', { checkoutMainStatus });
    const mergeStatus = checkoutMainStatus && await mergeBranches(fs, mergeDirPath, tempMergeMain, tempMergeIncoming);
    console.log('merge done', { mergeStatus });
    if (mergeStatus.status) {
      // Isomorphic git is doing an extra merge or logic cause deletion of the merged data at staging state
      await checkoutJsonFiles(fs, targetPath, tempMergeMain);
    } else if (mergeStatus.status === false && mergeStatus?.data) {
      console.log({ mergeStatus });
      // conflcit section
      // ============================> Conflict is not showing
      setConflictPopup({
        open: false,
        data: {
          files: mergeStatus.data,
          mergeDirPath,
          projectPath: targetPath,
          incomingPath,
          incomingMeta,
          author,
          currentBranch: tempMergeMain,
          projectMainBranch: mainBranch,
          currentUser,
          projectName: `${projectName}_${projectId}`,
        },
      });
    }
  } catch (err) {
    logger.error('mergeProject.js', `Error happended ${err}`);
  }
};

// export const mergeProject = async (sourcePath, currentUser, setConflictPopup, setModel) => {
//   const mergeBranch = 'offlinemerge-scribe';
//   const fs = window.require('fs');
//   const fse = window.require('fs-extra');
//   // read source metadata
//   let sourceMeta = await readIngredients({
//     filePath: path.join(sourcePath, 'metadata.json'),
//   });
//   sourceMeta = JSON.parse(sourceMeta);

//   const projectId = Object.keys(
//     sourceMeta.identification.primary[packageInfo.name],
//   )[0];
//   const projectName = sourceMeta.identification.name.en;
//   const newpath = localStorage.getItem('userPath');
//   const targetPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', `${projectName}_${projectId}`);
//   const mainBranch = `${packageInfo.name}-main`;
//   let currentActiveBranch = mainBranch;
//   const author = { email: '', username: currentUser };

//   try {
//     // git check for init or not
//     const checkInit = await checkInitialize(fs, targetPath, mainBranch);
//     if (checkInit) {
//       // supported project
//       // already init for offline merge or online sync : identify which branch need to choose
//       // user branch / scribe main
//       const localBranches = await listLocalBranches(fs, targetPath);
//       if (localBranches.length > 0) {
//         // delete offline branch if exist
//         if (localBranches.includes(mergeBranch)) {
//           await deleteTheBranch(fs, targetPath, mergeBranch);
//         }
//         const userSettings = await readUserSettings();
//         if (localBranches.includes(`${userSettings?.sync?.services?.door43[0]?.username}/scribe`)) {
//           currentActiveBranch = `${userSettings.sync.services.door43[0].username}/scribe`;
//           author.email = userSettings.sync.services.door43[0].token.user.email;
//           author.username = userSettings.sync.services.door43[0].username;
//         }
//       } else {
//         throw new Error('failed to read local branches');
//       }

//       // create offine merge branch
//       const createBranchStatus = await createBranch(fs, targetPath, mergeBranch);
//       // commit all existing changes in currentActiveBranch
//       const commitStatus = createBranchStatus && await commitChanges(fs, targetPath, author, 'commit existing changes in scribe-main');
//       // checkout tot offline branch
//       commitStatus && await checkoutToBranch(fs, targetPath, mergeBranch);
//       await fse.copy(sourcePath, targetPath, { filter: (file) => path.extname(file) !== '.json' });
//       setTimeout(async () => {
//         // commit in offline-merge
//         const mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
//         // checkout main branchnst mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
//         // checkout main branch
//         const checkoutStatus2 = mergeCommitStatus && await checkoutToBranch(fs, targetPath, currentActiveBranch);
//         // merge offline - main
//         const mergeStatus = checkoutStatus2 && await mergeBranches(fs, targetPath, currentActiveBranch, mergeBranch);

//         if (mergeStatus.status) {
//           // Isomorphic git is doing an extra merge or logic cause deletion of the merged data at staging state
//           await checkoutJsonFiles(fs, targetPath, currentActiveBranch);
//         } else if (mergeStatus.status === false && mergeStatus?.data) {
//           // conflcit section
//           setConflictPopup({
//             open: true,
//             data: {
//               files: mergeStatus.data,
//               targetPath,
//               sourcePath,
//               sourceMeta,
//               author,
//               currentActiveBranch,
//               currentUser,
//               projectName: `${projectName}_${projectId}`,
//             },
//           });
//         }
//       }, '1000');
//     } else {
//       // throw error notify non git porject . Proejcts < 0.5.0 or not synced projects
//       setModel({
//         openModel: true,
//         title: 'Merge Not Supported',
//         confirmMessage: `This project is not supported for Offline Merge Since the
//         project is from the previous version of Scribe (below 0.5.0). If you want to make this project compatable,
//         Then create a new Project in the latest version of Scribe and Import all the files OR Sync the current project Online.`,
//         // buttonName: 'Ok',
//       });
//     }
//   } catch (err) {
//     logger.error('mergeProject.js', `Error happended ${err}`);
//   }
// };
