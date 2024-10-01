import * as localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import { environment } from '../../../../environment';
import { sbStorageDownload } from '../../../../../supabase';

const useEditProject = () => {
  const path = require('path');
  const getDirNameFromMetadata = (metadata) => {
    const firstKey = Object.keys(metadata.ingredients)[0];
    const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0, -1);
    let dirName = '';
    folderName.forEach((folder) => {
      dirName = path.join(dirName, folder);
    });
    return dirName;
  };

  const loadProjectData = async (project) => {
    try {
      let folder;
      let data;
      let settings;

      const userProfile = await localforage.getItem('userProfile');

      if (isElectron()) {
        const fs = window.require('fs');
        const newpath = localStorage.getItem('userPath');
        folder = path.join(newpath, packageInfo.name, 'users', userProfile.username, 'projects', `${project.name}_${project.id[0]}`);
        data = fs.readFileSync(path.join(folder, 'metadata.json'), 'utf-8');
        const dirName = getDirNameFromMetadata(JSON.parse(data));
        settings = fs.readFileSync(path.join(folder, dirName, environment.PROJECT_SETTING_FILE), 'utf-8');
      } else {
        folder = path.join('scribe', 'users', userProfile.user.email, 'projects', `${project.name}_${project.id[0]}`);
        data = (await sbStorageDownload(path.join(folder, 'metadata.json'))).data;
        const dirName = getDirNameFromMetadata(JSON.parse(await data.text()));
        settings = (await sbStorageDownload(path.join(folder, dirName, environment.PROJECT_SETTING_FILE), 'utf-8')).data;
      }

      const metadata = JSON.parse(data instanceof Blob ? await data.text() : data);
      const agSetting = JSON.parse(settings instanceof Blob ? await settings.text() : settings);

      logger.debug('ProjectList.js', 'Loading current project metadata');

      return { ...metadata, ...agSetting };
    } catch (e) {
      logger.debug(e);
    }
  };

  const editProject = async (project, setCurrentProject, setCallEditProject) => {
    const metadata = await loadProjectData(project);
    setCurrentProject(metadata);
    setCallEditProject(true);
  };

  return { editProject };
};

export default useEditProject;
