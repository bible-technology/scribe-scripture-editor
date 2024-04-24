import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import packageInfo from '../../../../package.json';
import { commitChanges } from '../Sync/Isomorphic/utils';

export const mergeTextTranslationProject = async (incomingPath, currentUser, setConflictPopup, setProcessMerge, incomingMeta) => {
  try {
    // update the metadata of current md5 --- updateTranslationSB (src/core/burrito/)
    const fse = window.require('fs-extra');
    const fs = window.require('fs');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');

    await updateTranslationSB(currentUser, { name: incomingMeta.projectName, id: incomingMeta.id }, false).then(async (updatedCurrentMeta) => {
      console.log({ updatedCurrentMeta });
      // compare md5s of incoming and current ingredients
      const incomingIngredients = incomingMeta.ingredientsObj;
      const currentIngredients = updatedCurrentMeta.ingredients;
      const conflictedIngFilePaths = [];

      Object.entries(incomingIngredients).forEach(([key, val]) => {
        if (val.scope) {
          // if scope then its is usfm
          const bookId = Object.keys(val.scope)[0];
          console.log('bookId : ', bookId);
          const currentMd5 = currentIngredients[key]?.checksum?.md5;
          const incomingMd5 = val.checksum.md5;
          if (currentMd5 && incomingMd5) {
            if (currentMd5 !== incomingMd5) {
              console.log('MD5s xxxxxxxxxxxxxx : ', { bookId, currentMd5, incomingMd5 }, currentMd5 === incomingIngredients);
              conflictedIngFilePaths.push(key);
            }
          } else {
            // error no book in incoming
            throw new Error('Can not proceed Merge, Project have scope difference.');
          }
        }
      });

      console.log('conflict', { conflictedIngFilePaths });
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
          const commitAuthor = { name: 'scribeInternal', email: 'scribe@bridgeconn.com' };
          const backupMessage = `Scribe Internal Commit Before Text Merge Start : ${projectDirName}  : ${new Date()}`;
          await commitChanges(fs, sourceProjectPath, commitAuthor, backupMessage, true);
        } else {
          isNewProjectMerge = false;
          // read existing meta of incoming instead of using the new because the merge is inprogress
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
        console.log('No Conflict =================>');
        return 'noConflict';
      }

      setProcessMerge(false);
    });

  // identify conflicted books
  // rest of the codes are in the current implementation ofr book wise chapter conflict
  //
  } catch (err) {
    setProcessMerge(false);
    console.error('Failue in MergeText Process : ', err);
    throw new Error(err);
  }
};
