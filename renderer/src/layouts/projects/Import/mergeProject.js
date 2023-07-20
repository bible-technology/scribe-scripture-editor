import { readIngredients } from '@/core/reference/readIngredients';
import {
  checkInitialize,
  checkoutJsonFiles,
  checkoutToBranch,
  commitChanges,
  createBranch,
  listLocalBranches,
  mergeBranches,
} from '@/components/Sync/Isomorphic/utils';
import { readUserSettings } from '@/core/projects/userSettings';
import packageInfo from '../../../../../package.json';

const path = require('path');

// // fucntion for merge action on import projects
// export const mergeProject = async (sourcePath, currentUser) => {
//   try {
//     console.log('inside merge project');
//     const fs = window.require('fs');
//     const fse = window.require('fs-extra');
//     // read source metadata
//     let sourceMeta = await readIngredients({
//       filePath: path.join(sourcePath, 'metadata.json'),
//     });
//     sourceMeta = JSON.parse(sourceMeta);

//     console.log('1', { sourceMeta });

//     const projectId = Object.keys(sourceMeta.identification.primary[packageInfo.name])[0];
//     console.log('2');
//     const projectName = sourceMeta.identification.name.en;
//     const newpath = localStorage.getItem('userPath');
//     const targetPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', `${projectName}_${projectId}`);
//     const mainBranch = `${packageInfo.name}-main`;
//     let currentActiveBranch = mainBranch;
//     const mergeBranch = 'offlinemerge-scribe';
//     const author = { email: '', username: currentUser };

//     // check project initialized or not in backend
//     const checkInit = await checkInitialize(fs, targetPath, mainBranch);
//     console.log({ checkInit, targetPath });
//     if (!checkInit) {
//       // init , main branch will be create
//       // ????? ======================> door43 user name is needed here for USER config set
//       console.log('in init : ', currentUser);
//       const projectInitialized = await initProject(fs, targetPath, currentUser, mainBranch);
//       // need an empty commit which should not come the exiting data or JSON data
//       console.log('current Branch 1: ', await getCurrentBranch(fs, targetPath));
//       const commitJsonStatus = await commitJson(fs, targetPath, author, 'first commit for offline merge');
//       console.log({ commitJsonStatus });
//       if (!projectInitialized) {
//         throw new Error('Project Init failed');
//       }
//     } else {
//       // already init for offline merge or online sync : identify which branch need to choose
//       // user branch / scribe main
//       const localBranches = await listLocalBranches(fs, targetPath);
//       if (localBranches.length > 0) {
//         const userSettings = await readUserSettings();
//         if (localBranches.includes(`${userSettings.sync.services.door43[0].username}/scribe`)) {
//           currentActiveBranch = `${userSettings.sync.services.door43[0].username}/scribe`;
//           author.email = userSettings.sync.services.door43[0].token.user.email;
//           author.username = userSettings.sync.services.door43[0].username;
//         }
//       } else {
//         throw new Error('failed to read local branches');
//       }
//       console.log({ localBranches });
//     }
//     // common codes
//     // create merge/scribe branch
//     console.log('current Branch 2: ', await getCurrentBranch(fs, targetPath));
//     const createBranchStatus = await createBranch(fs, targetPath, mergeBranch);
//     console.log({ createBranchStatus });
//     console.log('current Branch 3: ', await getCurrentBranch(fs, targetPath));
//     // commit all existing changes in currentActiveBranch
//     const commitStatus = createBranchStatus && await commitChanges(fs, targetPath, author, 'commit changes for offline merge', true);
//     // checkout to merge branch
//     console.log({ commitStatus });
//     console.log('current Branch 4: ', await getCurrentBranch(fs, targetPath));
//     const checkoutStatus = commitStatus && await checkoutToBranch(fs, targetPath, mergeBranch);
//     // copy all data from source to target
//     console.log({ checkoutStatus });
//     console.log('current Branch 5: ', await getCurrentBranch(fs, targetPath));

//     checkoutStatus && await fse.copy(sourcePath, targetPath, { filter: (file) => path.extname(file) !== '.json' });
//     console.log('current Branch 6: ', await getCurrentBranch(fs, targetPath));
//     // commit new changes in merge branch
//     const mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit changes for offline merge in merge branch');
//     console.log({ mergeCommitStatus });
//     // checkout to active branch
//     const checkoutStatus2 = mergeCommitStatus && await checkoutToBranch(fs, targetPath, currentActiveBranch);
//     console.log({ checkoutStatus2 });
//     console.log('current Branch 6: ', await getCurrentBranch(fs, targetPath));
//     // local merge from mergeBranch -> Current Active Branch
//     const mergeStatus = checkoutStatus2 && await mergeBranches(fs, targetPath, currentActiveBranch, mergeBranch);
//     console.log({ mergeStatus });
//     if (mergeStatus?.status === true) {
//       // if true and merge succes
//       console.log('true :', { mergeStatus });
//     } else if (mergeStatus?.status === false) {
//       // conflict
//       console.log('conflcit :', { mergeStatus });
//     } else {
//       // unknown error
//       throw new Error(mergeStatus);
//     }
//   } catch (err) {
//     console.log('some error happended On Offline Merge : ', err);
//   }

//   // // read source ingredients
//   // let sourceMeta = await readIngredients({
//   //   filePath: path.join(folderPath, 'metadata.json'),
//   // });
//   // sourceMeta = JSON.parse(sourceMeta);
//   // const firstKey = Object.keys(sourceMeta.ingredients)[0];
//   // const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
//   // const dirName = folderName[0];
//   // console.log(sourceMeta);
//   // // eslint-disable-next-line no-restricted-syntax
//   // for (const item in sourceMeta.ingredients) {
//   //   // eslint-disable-next-line no-loop-func
//   //   if (Object.hasOwn(sourceMeta.ingredients, item) && (['md', 'usfm'].some((s) => item.endsWith(s)))) {
//   //     console.log(item);
//   // }
//   // }

//   // ------------------------------------------- logics -------------------

//   // get md/jsons list
//   // git logics
//   // replace

//   // check for git init
//   // YES : get dcs name from settings
//   // if no dcs name - > use scribe-main as main branch

//   // NO : init git
//   //  create scribe-main
//   //

//   // common ->
//   // create a new branch from above detected branch -> offlinemerge/scribe
//   // commit all changes to detectedbranch
//   // checkout to offlinemerge/scribe
//   // replace all md/usfm files in the offlinemergebranch
//   // commit changes
//   // checkout to detectedbranch
//   // merge from offline -> detectedbranch

//   // conflict :

//   // No Conflcit :
// };

export const mergeProject = async (sourcePath, currentUser, setConflictPopup) => {
  const mergeBranch = 'offlinemerge-scribe';
  const fs = window.require('fs');
  const fse = window.require('fs-extra');
  // read source metadata
  let sourceMeta = await readIngredients({
    filePath: path.join(sourcePath, 'metadata.json'),
  });
  sourceMeta = JSON.parse(sourceMeta);

  const projectId = Object.keys(
    sourceMeta.identification.primary[packageInfo.name],
  )[0];
  const projectName = sourceMeta.identification.name.en;
  const newpath = localStorage.getItem('userPath');
  const targetPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', `${projectName}_${projectId}`);
  const mainBranch = `${packageInfo.name}-main`;
  let currentActiveBranch = mainBranch;
  const author = { email: '', username: currentUser };
  try {
    // git check for init or not
    const checkInit = await checkInitialize(fs, targetPath, mainBranch);
    if (checkInit) {
      // supported project
      // already init for offline merge or online sync : identify which branch need to choose
      // user branch / scribe main
      const localBranches = await listLocalBranches(fs, targetPath);
      if (localBranches.length > 0) {
        const userSettings = await readUserSettings();
        if (localBranches.includes(`${userSettings?.sync?.services?.door43[0]?.username}/scribe`)) {
          currentActiveBranch = `${userSettings.sync.services.door43[0].username}/scribe`;
          author.email = userSettings.sync.services.door43[0].token.user.email;
          author.username = userSettings.sync.services.door43[0].username;
        }
      } else {
        throw new Error('failed to read local branches');
      }

      // // create offine merge branch
      // const createBranchStatus = await createBranch(fs, targetPath, mergeBranch);
      // console.log({ createBranchStatus });
      // // commit all existing changes in currentActiveBranch
      // const commitStatus = createBranchStatus && await commitChanges(fs, targetPath, author, 'commit existing changes in scribe-main');
      // console.log({ commitStatus });
      // // checkout tot offline branch
      // const checkoutStatus = commitStatus && await checkoutToBranch(fs, targetPath, mergeBranch);
      // console.log({ checkoutStatus });
      // // replace files
      // checkoutStatus && fse.copy(sourcePath, targetPath, { filter: (file) => path.extname(file) !== '.json' }, async (err) => {
      //   if (!err) {
      //     console.log('after copy success');
      //     // commit in offline-merge
      //     const mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
      //     console.log({ mergeCommitStatus });
      //     // checkout main branchnst mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
      //     console.log({ mergeCommitStatus });
      //     // checkout main branch
      //     const checkoutStatus2 = mergeCommitStatus && await checkoutToBranch(fs, targetPath, currentActiveBranch);
      //     console.log({ checkoutStatus2 });
      //     // merge offline - main
      //     const mergeStatus = checkoutStatus2 && await mergeBranches(fs, targetPath, currentActiveBranch, mergeBranch);
      //     console.log({ mergeStatus });
      //     if (mergeStatus.status) {
      //       const checkoutFilesStatus = await checkoutJsonFiles(fs, targetPath, currentActiveBranch);
      //       console.log({ checkoutFilesStatus });
      //     }
      //     }
      // });

      // ------------------------------------------ code with delay -------------------------------
      // create offine merge branch
      const createBranchStatus = await createBranch(fs, targetPath, mergeBranch);
      console.log({ createBranchStatus });
      // commit all existing changes in currentActiveBranch
      const commitStatus = createBranchStatus && await commitChanges(fs, targetPath, author, 'commit existing changes in scribe-main');
      console.log({ commitStatus });
      // checkout tot offline branch
      const checkoutStatus = commitStatus && await checkoutToBranch(fs, targetPath, mergeBranch);
      console.log({ checkoutStatus });
      // replace files
      checkoutStatus && fse.copy(sourcePath, targetPath, { filter: (file) => path.extname(file) !== '.json' }, async (err) => {
        if (!err) {
          setTimeout(async () => {
            console.log('after copy success');
            // commit in offline-merge
            const mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
            console.log({ mergeCommitStatus });
            // checkout main branchnst mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
            console.log({ mergeCommitStatus });
            // checkout main branch
            const checkoutStatus2 = mergeCommitStatus && await checkoutToBranch(fs, targetPath, currentActiveBranch);
            console.log({ checkoutStatus2 });
            // merge offline - main
            const mergeStatus = checkoutStatus2 && await mergeBranches(fs, targetPath, currentActiveBranch, mergeBranch);
            console.log({ mergeStatus });
            if (mergeStatus.status) {
              const checkoutFilesStatus = await checkoutJsonFiles(fs, targetPath, currentActiveBranch);
              console.log({ checkoutFilesStatus });
            } else if (mergeStatus.status === false && mergeStatus?.data) {
              // conflcit section
              console.log('in conflict section -------------------------- ');
              setConflictPopup({
                open: true,
                data: {
                  files: mergeStatus.data,
                  targetPath,
                  sourcePath,
                  sourceMeta,
                  author,
                  currentActiveBranch,
                  currentUser,
                  projectName: `${projectName}_${projectId}`,
                },
              });
            }
          }, '1000');
        }
      });
    } else {
      // throw error notify non git porject
    }
  } catch (err) {
    console.log('Error happended : ', err);
  } finally {
    // delete offline merge branch in all cases on finally
    // await deleteTheBranch(fs, targetPath, mergeBranch);
  }
};
