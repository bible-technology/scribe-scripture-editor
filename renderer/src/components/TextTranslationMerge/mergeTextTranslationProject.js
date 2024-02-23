import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import packageInfo from '../../../../package.json';

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
        // move imported project to backup folder
        const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', currentUser, '.merge-usfm');

        if (!fs.existsSync(path.join(USFMMergeDirPath, `${incomingMeta.projectName}_${incomingMeta.id[0]}`))) {
          fs.mkdirSync(path.join(USFMMergeDirPath, `${incomingMeta.projectName}_${incomingMeta.id[0]}`), { recursive: true });
        }
        await fse.copy(incomingPath, path.join(USFMMergeDirPath, `${incomingMeta.projectName}_${incomingMeta.id[0]}`, 'incoming'));

        // TODO : CREATE A BACKUP in GIT - with a proper message of backup before merge and Timestamp (Idea is to manual git reset to commit based on timestamp)
        // conflcit section
        setConflictPopup({
          open: true,
          data: {
            projectType: 'textTranslation',
            files: conflictedIngFilePaths,
            incomingPath: path.join(USFMMergeDirPath, `${incomingMeta.projectName}_${incomingMeta.id[0]}`, 'incoming'),
            incomingMeta,
            currentMeta: updatedCurrentMeta,
            projectId: incomingMeta.id[0],
            projectName: incomingMeta.projectName,
            projectFullName: `${incomingMeta.projectName}_${incomingMeta.id[0]}`,
            currentUser,
          },
        });
      } else {
        // TODO : ADD A MESSGAGE HERE -nothing to merge
      }

      setProcessMerge(false);
    });

  // identify conflicted books
  // rest of the codes are in the current implementation ofr book wise chapter conflict
  //
  } catch (err) {
    setProcessMerge(false);
    console.error('Failue in MergeText Process : ', err);
  }
};
