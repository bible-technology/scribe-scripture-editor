import localforage from 'localforage';
import packageInfo from '../../../../package.json';
import { environment } from '../../../environment';

const path = require('path');

export async function readCustomResources({ resourceId }) {
  const fs = window.require('fs');
  const newpath = localStorage.getItem('userPath');
  let currentUser;
  await localforage.getItem('userProfile').then((value) => {
    currentUser = value.username;
  });
  const file = path.join(newpath, packageInfo.name, 'users', currentUser, environment.USER_SETTING_FILE);
  return new Promise((resolve) => {
    if (fs.existsSync(file)) {
      fs.readFile(file, (err, data) => {
        const agSettingsJson = JSON.parse(data);
        switch (resourceId) {
        case 'tn':
          (agSettingsJson?.resources.door43.translationNotes)?.forEach(async (url) => {
            const url2 = url.split('/')[3];
            const owner = [];
            const url1 = path.join(url, '/raw/branch/master/', 'manifest.yaml');
            const response = await fetch(url1);
            if (response.ok === true) {
              const data = await response.text();
              owner.push(data, url2);
              resolve(owner);
            }
          });
          break;
        case 'tq':
          (agSettingsJson?.resources.door43.translationQuestions)?.forEach(async (url) => {
            const url1 = path.join(url, '/raw/branch/master/', 'manifest.yaml');
            const url2 = url.split('/')[3];
            const owner = [];
            const response = await fetch(url1);
            if (response.ok === true) {
              const data = await response.text();
              owner.push(data, url2);
              return (owner);
            }
          });
          break;
        case 'twlm':
          (agSettingsJson?.resources.door43.translationWords)?.forEach(async (url) => {
            const url1 = path.join(url, '/raw/branch/master/', 'manifest.yaml');
            const url2 = url.split('/')[3];
            const owner = [];
            const response = await fetch(url1);
            if (response.ok === true) {
              const data = await response.text();
              owner.push(data, url2);
              resolve(owner);
            }
          });
          break;
        default:
          return null;
        }
      });
    }
  });
}
