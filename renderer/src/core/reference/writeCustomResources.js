import localforage from 'localforage';
import packageInfo from '../../../../package.json';
import { environment } from '../../../environment';

const path = require('path');

export async function writeCustomResources({ resourceUrl }) {
    const fs = require('graceful-fs');
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
                switch (resourceUrl.key) {
                    case 'tn':
                      if (agSettingsJson?.resources.door43.translationNotes.includes(resourceUrl.url) === false) {
                          agSettingsJson?.resources.door43.translationNotes.push({ name: resourceUrl.resourceName, url: resourceUrl.url });
                      }
                      break;
                    case 'tq':
                    if (agSettingsJson?.resources.door43.translationQuestions.includes(resourceUrl.url) === false) {
                        agSettingsJson?.resources.door43.translationQuestions.push({ name: resourceUrl.resourceName, url: resourceUrl.url });
                    }
                      break;
                    case 'twlm':
                    if (agSettingsJson?.resources.door43.translationWords.includes(resourceUrl.url) === false) {
                        agSettingsJson?.resources.door43.translationWords.push({ name: resourceUrl.resourceName, url: resourceUrl.url });
                    }
                      break;
                    case 'ta':
                      if (!(agSettingsJson?.resources.door43.translationAcademys)) {
                        agSettingsJson.resources.door43.translationAcademys = [];
                      }
                      if (agSettingsJson?.resources.door43.translationAcademys.includes(resourceUrl.url) === false) {
                          agSettingsJson?.resources.door43.translationAcademys.push({ name: resourceUrl.resourceName, url: resourceUrl.url });
                      }
                        break;
                    case 'obs-tn':
                      if (!(agSettingsJson?.resources.door43.obsTranslationNotes)) {
                        agSettingsJson.resources.door43.obsTranslationNotes = [];
                      }
                      if (agSettingsJson?.resources.door43.obsTranslationNotes.includes(resourceUrl.url) === false) {
                          agSettingsJson?.resources.door43.obsTranslationNotes.push({ name: resourceUrl.resourceName, url: resourceUrl.url });
                      }
                      break;
                    default:
                      return null;
                  }
                  fs.writeFileSync(file, JSON.stringify(agSettingsJson));
                  resolve(agSettingsJson);
            });
      }
  });
}
