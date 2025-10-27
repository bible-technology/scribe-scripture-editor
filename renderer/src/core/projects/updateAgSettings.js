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

export const saveNavigationHistory = async (bookId, chapter, verse) => {
  logger.debug('updateAgSettings.js', 'In saveNavigationHistory');
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');

  try {
    const username = (await localforage.getItem('userProfile'))?.username;
    const projectName = await localforage.getItem('currentProject');
    const projectMeta = await localforage.getItem('projectmeta');
    const _projectname = await splitStringByLastOccurence(projectName, '_');

    // Find the settings file path and update projectmeta
    let settingsPath = '';
    let flavorType = '';
    Object.entries(projectMeta).forEach(([/* key */, _value]) => {
      Object.entries(_value).forEach(([/* key */, resources]) => {
        if (resources.identification.name.en === _projectname[0]) {
          // Get the flavor type
          flavorType = resources.type.flavorType.flavor.name;

          // Update projectmeta with navigationHistory based on flavor type
          if (flavorType === 'textTranslation') {
            if (!resources.project?.textTranslation) {
              resources.project.textTranslation = {};
            }
            resources.project.textTranslation.navigationHistory = [bookId, chapter, verse];
            logger.debug('updateAgSettings.js', 'Updated textTranslation navigationHistory:', [bookId, chapter, verse]);
          } else if (flavorType === 'audioTranslation') {
            if (!resources.project?.audioTranslation) {
              resources.project.audioTranslation = {};
            }
            resources.project.audioTranslation.navigationHistory = [bookId, chapter, verse];
            logger.debug('updateAgSettings.js', 'Updated audioTranslation navigationHistory:', [bookId, chapter, verse]);
          } else if (flavorType === 'videoTranslation') {
            if (!resources.project?.videoTranslation) {
              resources.project.videoTranslation = {};
            }
            resources.project.videoTranslation.navigationHistory = [bookId, chapter, verse];
            logger.debug('updateAgSettings.js', 'Updated videoTranslation navigationHistory:', [bookId, chapter, verse]);
          } else if (flavorType === 'x-juxtalinear') {
            if (!resources.project['x-juxtalinear']) {
              resources.project['x-juxtalinear'] = {};
            }
            resources.project['x-juxtalinear'].navigationHistory = [bookId, chapter, verse];
            logger.debug('updateAgSettings.js', 'Updated x-juxtalinear navigationHistory:', [bookId, chapter, verse]);
          }

          const result = Object.keys(resources.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
          settingsPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, result[0]);
        }
      });
    });

    // Save updated projectmeta to localforage
    await localforage.setItem('projectmeta', projectMeta);
    logger.debug('updateAgSettings.js', 'projectmeta updated in localforage with navigationHistory');

    // Also update the settings file on disk if exists
    if (settingsPath && fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

      if (flavorType === 'textTranslation') {
        if (!settings.project?.textTranslation) {
          logger.error('updateAgSettings.js', 'textTranslation object not found in settings');
          return;
        }
        settings.project.textTranslation.navigationHistory = [bookId, chapter, verse];
        logger.debug('updateAgSettings.js', 'navigationHistory updated in textTranslation settings file:', settings.project.textTranslation.navigationHistory);
      } else if (flavorType === 'audioTranslation') {
        if (!settings.project?.audioTranslation) {
          logger.error('updateAgSettings.js', 'audioTranslation object not found in settings');
          return;
        }
        settings.project.audioTranslation.navigationHistory = [bookId, chapter, verse];
        logger.debug('updateAgSettings.js', 'navigationHistory updated in audioTranslation settings file:', settings.project.audioTranslation.navigationHistory);
      } else if (flavorType === 'videoTranslation') {
        if (!settings.project?.videoTranslation) {
          logger.error('updateAgSettings.js', 'videoTranslation object not found in settings');
          return;
        }
        settings.project.videoTranslation.navigationHistory = [bookId, chapter, verse];
        logger.debug('updateAgSettings.js', 'navigationHistory updated in videoTranslation settings file:', settings.project.videoTranslation.navigationHistory);
      } else if (flavorType === 'x-juxtalinear') {
        if (!settings.project['x-juxtalinear']) {
          logger.error('updateAgSettings.js', 'x-juxtalinear object not found in settings');
          return;
        }
        settings.project['x-juxtalinear'].navigationHistory = [bookId, chapter, verse];
        logger.debug('updateAgSettings.js', 'navigationHistory updated in x-juxtalinear settings file:', settings.project.juxtaTranslation.navigationHistory);
      }

      await fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
      logger.debug('updateAgSettings.js', 'Settings file saved with navigationHistory for flavor:', flavorType);
    } else {
      logger.error('updateAgSettings.js', 'Settings file not found');
    }
  } catch (error) {
    logger.error('updateAgSettings.js', 'Error saving navigationHistory:', error);
  }
};
