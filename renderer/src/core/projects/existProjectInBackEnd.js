import localforage from 'localforage';
import packageInfo from '../../../../package.json';

function isBackendProjectExist(ProjectDir) {
  const path = require('path');
  // Step1 : check the project Dir and Meta exist
  // step2 : exist return True
  return new Promise((resolve) => {
    // let checkStatus = false;
    localforage.getItem('userProfile').then(async (value) => {
      const newpath = localStorage.getItem('userPath');
      const fs = window.require('fs');
      if (value?.username) {
        const resourcePath = path.join(newpath, packageInfo.name, 'users', value.username, 'resources', ProjectDir);
        // check for path exist or not and resolve true or false will work for pane 1 now add for other panes
        if (fs.existsSync(resourcePath) && fs.existsSync(path.join(resourcePath, 'metadata.json'))) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  });
}
export default isBackendProjectExist;
