import localforage from 'localforage';
import packageInfo from '../../../package.json';

export const getProjectPath = async () => {
  try {
    const path = window.require('path');
    const currentProject = await localforage.getItem('currentProject');

    if (!currentProject) { return null; }

    const userPath = localStorage.getItem('userPath');
    const userProfile = await localforage.getItem('userProfile');

    if (!userPath || !userProfile) { return null; }

    const projectPath = path.join(
      userPath,
      packageInfo.name,
      'users',
      userProfile.username,
      'projects',
      currentProject,
    );

    return projectPath;
  } catch (error) {
    return null;
  }
};
