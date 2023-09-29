import localforage from 'localforage';
// import { readRefMeta } from '../../../core/reference/readRefMeta';
import { isElectron } from '@/core/handleElectron';
import { readRefBurrito } from '../../../core/reference/readRefBurrito';
import writeToFile from '../../../core/editor/writeToFile';
import packageInfo from '../../../../../package.json';
import { newPath } from '../../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const newPath = require('../../../../../supabase').newPath
// }
// function to save to file.
export const saveToFile = async (usfmText, bookCode) => {
  try {
    const userProfile = await localforage.getItem('userProfile');
    const userName = isElectron() ? userProfile?.username : userProfile?.user?.email;
    const projectName = await localforage.getItem('currentProject');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    // const projectsDir = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName);
    const metaPath = isElectron() ? path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json') : `${newPath}/${userName}/projects/${projectName}/metadata.json`;
    // const refs = await readRefMeta({ projectsDir })
    const metaData = JSON.parse(await readRefBurrito({ metaPath }));
    Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
      if (_ingredients.scope) {
        const _bookID = Object.entries(_ingredients.scope)[0][0];
        if (_bookID === bookCode) {
          // setTimeout(() => {
          await writeToFile({
            username: userName,
            projectname: projectName,
            filename: key,
            data: usfmText,
          });
          // }, 2000);
        }
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    return console.log(err);
  }
};
