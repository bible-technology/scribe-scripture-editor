import moment from 'moment';
import { environment } from '../../environment';
import * as logger from '../logger';
import packageInfo from '../../../package.json';

const path = require('path');
const md5 = require('md5');

export const createAudioVersification = (
  username,
  project,
  versification,
  id,
  copyright,
  currentBurrito,
  call,
) => {
  logger.debug('createAudioVersification.js', 'In createAudioVersification');
  const newpath = localStorage.getItem('userPath');
  const folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', `${project.projectName}_${id}`, 'audio', 'ingredients');
  const schemes = [
    { name: 'eng', file: 'eng.json' },
    { name: 'lxx', file: 'lxx.json' },
    { name: 'org', file: 'org.json' },
    { name: 'rsc', file: 'rsc.json' },
    { name: 'rso', file: 'rso.json' },
    { name: 'vul', file: 'vul.json' },
  ];
  const ingredients = {};
  return new Promise((resolve) => {
    schemes.forEach(async (scheme) => {
      if (versification.toLowerCase() === scheme.name) {
        logger.debug('createAudioVersification.js', 'Creating the files with selected scheme');
        // eslint-disable-next-line import/no-dynamic-require
        const file = require(`../lib/versification/${scheme.file}`);
        const fs = window.require('graceful-fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        logger.debug('createAudioVersification.js', 'Creating versification.json file in ingredients');
        await fs.writeFileSync(path.join(folder, 'versification.json'), JSON.stringify(file));
        const stats = fs.statSync(path.join(folder, 'versification.json'));
        ingredients[path.join('audio', 'ingredients', 'versification.json')] = {
          checksum: {
            md5: md5(file),
          },
          mimeType: 'application/json',
          size: stats.size,
          role: 'x-versification',
        };
        if (call === 'edit' && currentBurrito?.copyright?.shortStatements && (copyright.licence).length <= 500) {
          logger.debug('createAudioVersification.js', 'Won\'t create license.md file in ingredients and update the current shortStatements');
        } else {
          logger.debug('createAudioVersification.js', 'Creating license.md file in ingredients');
          await fs.writeFileSync(path.join(folder, 'license.md'), copyright.licence);
          const copyrightStats = fs.statSync(path.join(folder, 'license.md'));
          ingredients[path.join('audio', 'ingredients', 'license.md')] = {
            checksum: {
              md5: md5(file),
            },
            mimeType: 'text/md',
            size: copyrightStats.size,
            role: 'x-licence',
          };
        }
        const settings = {
          version: environment.AG_SETTING_VERSION,
          project: {
            audioTranslation: {
              // scriptDirection: direction,
              starred: call === 'edit' ? currentBurrito.project.audioTranslation.starred : false,
              isArchived: call === 'edit' ? currentBurrito.project.audioTranslation.isArchived : false,
              versification,
              description: project.description,
              copyright: copyright.title,
              lastSeen: moment().format(),
              refResources: call === 'edit' ? currentBurrito.project.audioTranslation.refResources : [],
              bookMarks: call === 'edit' ? currentBurrito.project.audioTranslation.bookMarks : [],
              font: '',
              fontSize: 1,
            },
          },
          sync: { services: { door43: [] } },
        };
        if (call === 'edit') {
          settings.sync = currentBurrito?.sync;
        }
        logger.debug('createAudioVersification.js', `Creating ${environment.PROJECT_SETTING_FILE} file in ingredients`);
        await fs.writeFileSync(path.join(folder, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
        const stat = fs.statSync(path.join(folder, environment.PROJECT_SETTING_FILE));
        ingredients[path.join('audio', 'ingredients', environment.PROJECT_SETTING_FILE)] = {
          checksum: {
            md5: md5(settings),
          },
          mimeType: 'application/json',
          size: stat.size,
          role: 'x-scribe',
        };
        logger.debug('createAudioVersification.js', 'Returning the ingredients data');
        resolve(ingredients);
      }
    });
  });
};
