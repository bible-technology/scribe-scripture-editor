import localforage from 'localforage';
import { splitStringByLastOccurence } from '@/util/splitStringByLastMarker';
import * as logger from '../../logger';
import { environment } from '../../../environment';
import packageInfo from '../../../../package.json';

export const updateAgSettings = async (username, projectName, data, font, fontSize = 1) => {
  logger.debug('updateAgSettings.js', 'In updateAgSettings');
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');
  const result = Object.keys(data.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
  const folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, result[0]);
  const settings = await fs.readFileSync(folder, 'utf8');
  const setting = JSON.parse(settings);
  if (setting.version !== environment.AG_SETTING_VERSION) {
    setting.version = environment.AG_SETTING_VERSION;
    if (!setting.sync && !setting.sync?.services) {
      setting.sync = { services: { door43: [] } };
    } else {
      setting.sync.services.door43 = setting?.sync?.services?.door43 ? setting?.sync?.services?.door43 : [];
    }
    if (!setting.project[data.type.flavorType.flavor.name].font) {
      setting.project[data.type.flavorType.flavor.name].font = font || '';
    }
    if (!setting.project[data.type.flavorType.flavor.name].fontSize) {
      setting.project[data.type.flavorType.flavor.name].fontSize = fontSize || 1;
    }
  }
  const savedFont = JSON.stringify(setting.project[data.type.flavorType.flavor.name].font);
  const savedFontSize = JSON.stringify(setting.project[data.type.flavorType.flavor.name].fontSize);
  setting.project[data.type.flavorType.flavor.name] = data.project[data.type.flavorType.flavor.name];
  setting.project[data.type.flavorType.flavor.name].font = font || JSON.parse(savedFont);
  setting.project[data.type.flavorType.flavor.name].fontSize = fontSize || JSON.parse(savedFontSize);
  logger.debug('updateAgSettings.js', `Updating the ${environment.PROJECT_SETTING_FILE}`);
  await fs.writeFileSync(folder, JSON.stringify(setting));
};

export const saveReferenceResource = (font = '', fontSize = 1) => {
  logger.debug('updateAgSettings.js', 'In saveReferenceResource for saving the reference data');
  localforage.getItem('currentProject').then(async (projectName) => {
    const _projectname = await splitStringByLastOccurence(projectName, '_');
    // const _projectname = projectName?.split('_');
    localforage.getItem('projectmeta').then((projectmeta) => {
      Object.entries(projectmeta).forEach(
        ([, _value]) => {
          Object.entries(_value).forEach(
            ([, resources]) => {
              const id = Object.keys(resources.identification.primary[packageInfo.name]);
              if (id[0] === _projectname[1]) {
                localforage.getItem('userProfile').then(async (userProfile) => {
                  await updateAgSettings(userProfile?.username, projectName, resources, font, fontSize);
                });
              }
            },
          );
        },
      );
    });
  });
};
