import { readIngredients } from '@/core/reference/readIngredients';
import {
  checkInitialize,
  checkoutJsonFiles,
  checkoutToBranch,
  commitChanges,
  createBranch,
  deleteTheBranch,
  listLocalBranches,
  mergeBranches,
} from '@/components/Sync/Isomorphic/utils';
import { readUserSettings } from '@/core/projects/userSettings';
import packageInfo from '../../../../../package.json';
import * as logger from '../../../logger';

const path = require('path');

export const mergeProject = async (sourcePath, currentUser, setConflictPopup, setModel) => {
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
        // delete offline branch if exist
        if (localBranches.includes(mergeBranch)) {
          await deleteTheBranch(fs, targetPath, mergeBranch);
        }
        const userSettings = await readUserSettings();
        if (localBranches.includes(`${userSettings?.sync?.services?.door43[0]?.username}/scribe`)) {
          currentActiveBranch = `${userSettings.sync.services.door43[0].username}/scribe`;
          author.email = userSettings.sync.services.door43[0].token.user.email;
          author.username = userSettings.sync.services.door43[0].username;
        }
      } else {
        throw new Error('failed to read local branches');
      }

      // create offine merge branch
      const createBranchStatus = await createBranch(fs, targetPath, mergeBranch);
      // commit all existing changes in currentActiveBranch
      const commitStatus = createBranchStatus && await commitChanges(fs, targetPath, author, 'commit existing changes in scribe-main');
      // checkout tot offline branch
      commitStatus && await checkoutToBranch(fs, targetPath, mergeBranch);
      await fse.copy(sourcePath, targetPath, { filter: (file) => path.extname(file) !== '.json' });
      setTimeout(async () => {
        // commit in offline-merge
        const mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
        // checkout main branchnst mergeCommitStatus = await commitChanges(fs, targetPath, author, 'commit New changes in offline-branch ');
        // checkout main branch
        const checkoutStatus2 = mergeCommitStatus && await checkoutToBranch(fs, targetPath, currentActiveBranch);
        // merge offline - main
        const mergeStatus = checkoutStatus2 && await mergeBranches(fs, targetPath, currentActiveBranch, mergeBranch);

        if (mergeStatus.status) {
          // Isomorphic git is doing an extra merge or logic cause deletion of the merged data at staging state
          await checkoutJsonFiles(fs, targetPath, currentActiveBranch);
        } else if (mergeStatus.status === false && mergeStatus?.data) {
          // conflcit section
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
    } else {
      // throw error notify non git porject . Proejcts < 0.5.0 or not synced projects
      setModel({
        openModel: true,
        title: 'Merge Not Supported',
        confirmMessage: `This project is not supported for Offline Merge Since the 
        project is from the previous version of Scribe (below 0.5.0). If you want to make this project compatable,
        Then create a new Project in the latest version of Scribe and Import all the files OR Sync the current project Online.`,
        // buttonName: 'Ok',
      });
    }
  } catch (err) {
    logger.error('mergeProject.js', `Error happended ${err}`);
  }
};
