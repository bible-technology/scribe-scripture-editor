import * as localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import { environment } from '../../../environment';
import {
 newPath, sbStorageList, IsElectron, sbStorageDownload,
} from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//   const supabaseStorage = require('../../../../supabase').supabaseStorage
//   const newPath = require('../../../../supabase').newPath
// }

const fetchProjectsMeta = async ({ currentUser }) => {
  if (isElectron()) {
    logger.debug('fetchProjectsMeta.js', 'In fetchProjectsMeta');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', currentUser, 'projects');
    fs.mkdirSync(projectsMetaPath, { recursive: true });
    const arrayItems = fs.readdirSync(projectsMetaPath);
    const burritos = [];
    return new Promise((resolve) => {
      arrayItems.forEach((dir) => {
        const stat = fs.lstatSync(path.join(projectsMetaPath, dir));
        if (stat.isDirectory() && fs.existsSync(path.join(projectsMetaPath, dir, 'metadata.json'))) {
          logger.debug('fetchProjectsMeta.js', 'Found burrito for the project');
          const data = fs.readFileSync(path.join(projectsMetaPath, dir, 'metadata.json'), 'utf8');
          const parseData = JSON.parse(data);
          let setting;
          const result = Object.keys(parseData.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
          if (result[0]) {
            setting = fs.readFileSync(path.join(projectsMetaPath, dir, result[0]), 'utf8');
          } else {
            logger.error('fetchProjectsMeta.js', 'Unable to find scribe-settings for the project');
          }
          if (setting) {
            logger.debug('fetchProjectsMeta.js', 'Found scribe-settings for the project, merging scribe-settings and burrito');
            burritos.push({ ...JSON.parse(setting), ...JSON.parse(data) });
          } else {
            logger.debug('fetchProjectsMeta.js', 'Unable to find scribe-settings for the project so pushing only burrito');
            burritos.push(JSON.parse(data));
          }
          // resolve({ projects: burritos });
        }
        fs.stat(path.join(projectsMetaPath, dir), (err) => {
          if (err) { throw err; }
        });
      });
      logger.debug('fetchProjectsMeta.js', 'Returning project list');
      resolve({ projects: burritos });
    });
  }
  if (!IsElectron) {
  const path = `${newPath}/${currentUser}/projects`;
  const { data: allProjects } = await sbStorageList(path);
  const projectPromises = allProjects?.map(async (proj) => {
    const projectName = proj.name;
    const { data, error } = await sbStorageDownload(`${path}/${projectName}/metadata.json`);

    if (error) {
      console.error('fetchProjectsMeta.js', error);
      return null;
    }

    const projectJson = JSON.parse(await data.text());

    let setting;
    const result = Object.keys(projectJson.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
    if (result[0]) {
      const { data: settingData } = await sbStorageDownload(`${path}/${projectName}/${result[0]}`);
      if (settingData) {
        setting = JSON.parse(await settingData.text());
      } else {
        console.error('ProjectList.js', 'Unable to find scribe-settings for the project');
      }
    }

    if (setting) {
      return { ...setting, ...projectJson };
    }
    return projectJson;
  });

  // Wrap the entire code in a Promise and return it.
  const projectMetaPromise = new Promise((resolve) => {
    Promise.all(projectPromises).then((projectsArray) => {
      const filteredProjects = projectsArray.filter((p) => p !== null);
      localforage.setItem('projectmeta', { projects: filteredProjects }).then(() => {
        resolve({ projects: filteredProjects });
      });
    });
  });

  // Return the Promise that resolves with the projects' metadata.
  return projectMetaPromise;
}
};
export default fetchProjectsMeta;
