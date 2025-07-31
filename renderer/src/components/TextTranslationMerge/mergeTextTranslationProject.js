import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import { readUserSettings } from '@/core/projects/userSettings';
import packageInfo from '../../../../package.json';
import { commitChanges } from '../Sync/Isomorphic/utils';
import * as logger from '../../logger';

export const mergeTextTranslationProject = async (incomingPath, currentUser, setConflictPopup, setProcessMerge, incomingMeta, triggerSnackBar, startOver = false) => {
  try {
    // update the metadata of current md5 --- updateTranslationSB (src/core/burrito/)
    const fse = window.require('fs-extra');
    const fs = window.require('fs');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const userSettings = await readUserSettings();
    let commitAuthor = { name: currentUser, email: '' };

    if (userSettings?.sync?.services?.door43?.length > 0) {
      const door43User = userSettings.sync.services.door43[0];
      commitAuthor = {
        name: door43User.username || currentUser,
        email: door43User.token?.user?.email || '',
      };
    }

    await updateTranslationSB(currentUser, { name: incomingMeta.projectName, id: incomingMeta.id }, false).then(async (updatedCurrentMeta) => {
      // compare md5s of incoming and current ingredients
      const incomingIngredients = incomingMeta.ingredientsObj;
      const currentIngredients = updatedCurrentMeta.ingredients;
      const conflictedIngFilePaths = [];

      Object.entries(incomingIngredients).forEach(([key, val]) => {
        if (val.scope) {
          // if scope then its is usfm
          const currentMd5 = currentIngredients[key]?.checksum?.md5;
          const incomingMd5 = val.checksum.md5;
          if (currentMd5 && incomingMd5) {
            if (currentMd5 !== incomingMd5) {
              conflictedIngFilePaths.push(key);
            }
          } else {
            // error no book in incoming
            throw new Error('Can not proceed Merge, Project have scope difference.');
          }
        }
      });

      if (conflictedIngFilePaths.length > 0) {
        /**
         *  Check the current Project is new or inprogres
         * Check the current ProjectName in => ./merge/ProjectName
         * move imported project to backup folder
         * create a GIT Backup before start merge : Create a COMMIT with Proper Msg and Timestamp
         * TODO: Idea is to manual git reset to commit based on timestamp
        */
        const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', currentUser, '.merge-usfm');
        const projectDirName = `${incomingMeta.projectName}_${incomingMeta.id[0]}`;
        const sourceProjectPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects', projectDirName);
        let existingIncomingMeta;
        let isNewProjectMerge = true;
        if (!fs.existsSync(path.join(USFMMergeDirPath, projectDirName))) {
          fs.mkdirSync(path.join(USFMMergeDirPath, projectDirName), { recursive: true });
          await fse.copy(incomingPath, path.join(USFMMergeDirPath, projectDirName, 'incoming'));
          // commit existing changes before merge start
          const backupMessage = `Scribe Internal Commit Before Text Merge Start : ${projectDirName}  : ${new Date()} , startOver : ${startOver}`;
          await commitChanges(fs, sourceProjectPath, commitAuthor, backupMessage, true);
        } else {
          isNewProjectMerge = false;
          // read existing meta of incoming instead of using the new because the merge is
          if (fs.existsSync(path.join(path.join(USFMMergeDirPath, projectDirName, 'incoming', 'metadata.json')))) {
            existingIncomingMeta = fs.readFileSync(path.join(path.join(USFMMergeDirPath, projectDirName, 'incoming', 'metadata.json')), 'utf-8');
            existingIncomingMeta = JSON.parse(existingIncomingMeta);
          } else {
            throw new Error('Can not proceed Merge, Unable to find the metadata for imported Project');
          }
        }

        // conflcit section - set values and open conflict window
        setConflictPopup({
          open: true,
          data: {
            projectType: 'textTranslation',
            files: conflictedIngFilePaths,
            incomingPath: path.join(USFMMergeDirPath, projectDirName, 'incoming'),
            incomingMeta: isNewProjectMerge ? incomingMeta : existingIncomingMeta,
            currentMeta: updatedCurrentMeta,
            projectId: incomingMeta.id[0],
            author: commitAuthor,
            projectName: incomingMeta.projectName,
            projectFullName: projectDirName,
            sourceProjectPath,
            projectMergePath: path.join(USFMMergeDirPath, projectDirName),
            currentUser,
            isNewProjectMerge,
          },
        });
      } else {
        setProcessMerge(false);
        triggerSnackBar('success', 'No Conflict Found');
      }

      setProcessMerge(false);
    });

  // identify conflicted books
  // rest of the codes are in the current implementation ofr book wise chapter conflict
  } catch (err) {
    setProcessMerge(false);
    logger.error('Failue in MergeText Process : ', err);
    throw new Error(err);
  }
};
