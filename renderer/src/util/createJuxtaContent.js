/* eslint-disable no-async-promise-executor */
import moment from 'moment';
import md5 from 'md5';
import path from 'path';
import { environment } from '../../environment';
import * as logger from '../logger';
import packageInfo from '../../../package.json';

// const path = require('path');
// const md5 = require('md5');

const bookAvailable = (list, id) => list.some((obj) => obj.id === id);

export const createJuxtaContent = (
  username,
  project,
  versification,
  books,
  direction,
  id,
  importedFiles,
  copyright,
  currentBurrito,
  call,
  // projectType,
) => {
  logger.debug('createJuxtaContent.js', 'In Juxta text content creation');
  const newpath = localStorage.getItem('userPath');

  logger.debug('createJuxtaContent.js', `books == ${books.toString()}`);
  const ingredients = {};
  let ingredientsDirName = 'ingredients';
  if (call === 'edit') {
    ingredientsDirName = Object.keys(currentBurrito.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
    ingredientsDirName = ingredientsDirName[0].split(/[(\\)?(/)?]/gm).slice(0)[0];
  }
  const folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', `${project.projectName}_${id}`, ingredientsDirName);

  logger.debug('createJuxtaContent.js', `call == ${call}`);

  const fs = window.require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return new Promise(async (resolve) => {
    // eslint-disable-next-line import/no-dynamic-require
    await books.forEach((book) => {
      if (bookAvailable(importedFiles, book)) {
        logger.debug('createJuxtaContent.js', `${book} is been Imported`);
        const file = importedFiles.filter((obj) => (obj.id === book));
        fs.writeFileSync(path.join(folder, `${book}.json`), file[0].content, 'utf-8');
        const stats = fs.statSync(path.join(folder, `${book}.json`));
        ingredients[path.join('ingredients', `${book}.json`)] = {
          checksum: {
            md5: md5(file[0].content),
          },
          mimeType: 'application/json',
          size: stats.size,
          scope: {},
        };
        ingredients[path.join('ingredients', `${book}.json`)].scope[book] = [];
      }
    });
    if (call === 'edit' && currentBurrito?.copyright?.shortStatements && (copyright.licence).length <= 500) {
      logger.debug('createJuxtaContent.js', 'Won\'t create license.md file in ingredients and update the current shortStatements');
    } else {
      logger.debug('createJuxtaContent.js', 'Creating license.md file in ingredients');
      await fs.writeFileSync(path.join(folder, 'license.md'), copyright.licence);
      const copyrightStats = fs.statSync(path.join(folder, 'license.md'));
      ingredients[path.join('ingredients', 'license.md')] = {
        checksum: {
          md5: md5(copyright.licence),
        },
        mimeType: 'text/md',
        size: copyrightStats.size,
        role: 'x-licence',
      };
    }
    // scribe setting creation
    const settings = {
      version: environment.AG_SETTING_VERSION,
      project: {
        'x-juxtalinear': {
          scriptDirection: direction,
          starred: call === 'edit' ? currentBurrito.project['x-juxtalinear'].starred : false,
          isArchived: call === 'edit' ? currentBurrito.project['x-juxtalinear'].isArchived : false,
          description: project.description,
          copyright: copyright.title,
          lastSeen: moment().format(),
          refResources: call === 'edit' ? currentBurrito.project['x-juxtalinear'].refResources : [],
          bookMarks: call === 'edit' ? currentBurrito.project['x-juxtalinear'].bookMarks : [],
          font: '',
        },
      },
      sync: { services: { door43: [] } },
    };
    if (call === 'edit') {
      settings.sync = currentBurrito?.sync;
    }
    logger.debug('createJuxtaContent.js', `Creating ${environment.PROJECT_SETTING_FILE} file in content`);

    fs.writeFileSync(path.join(folder, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
    const stat = fs.statSync(path.join(folder, environment.PROJECT_SETTING_FILE));
    ingredients[path.join('ingredients', environment.PROJECT_SETTING_FILE)] = {
      checksum: {
        md5: md5(settings),
      },
      mimeType: 'application/json',
      size: stat.size,
      role: 'x-scribe',
    };
    logger.debug('createJuxtaContent.js', 'Returning the ingredients data');
    resolve(ingredients);
  });
};
