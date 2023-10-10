/* eslint-disable no-unsafe-optional-chaining */
import moment from 'moment';
import { environment } from '../../environment';
import * as logger from '../logger';
import packageInfo from '../../../package.json';
import { newPath, sbStorageUpload } from '../../../supabase';

const grammar = require('usfm-grammar');
const path = require('path');
const md5 = require('md5');

const bookAvailable = (list, id) => list.some((obj) => obj.id === id);
export const createVersificationUSFM = (
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
  projectType,
) => {
  logger.debug('createVersificationUSFM.js', 'In createVersificationUSFM');
  const newpath = localStorage.getItem('userPath');
  let folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', `${project.projectName}_${id}`);
  let ingredientsDirName = 'ingredients';
  if (call === 'edit') {
    ingredientsDirName = Object.keys(currentBurrito.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
    ingredientsDirName = ingredientsDirName[0].split(/[(\\)?(/)?]/gm).slice(0)[0];
  }
  if (projectType === 'Audio') {
    folder = path.join(folder, 'text-1', call === 'edit' ? 'ingredients' : ingredientsDirName);
  } else {
    folder = path.join(folder, ingredientsDirName);
  }
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
        logger.debug('createVersificationUSFM.js', 'Creating the files with selected scheme');
        // eslint-disable-next-line import/no-dynamic-require
        const file = require(`../lib/versification/${scheme.file}`);
        await books.forEach((book) => {
          if (bookAvailable(importedFiles, book)) {
            logger.debug('createVersificationUSFM.js', `${book} is been Imported`);
            const file = importedFiles.filter((obj) => (obj.id === book));
            const fs = window.require('fs');
            if (!fs.existsSync(folder)) {
              fs.mkdirSync(folder, { recursive: true });
            }
            fs.writeFileSync(path.join(folder, `${book}.usfm`), file[0].content, 'utf-8');
            const stats = fs.statSync(path.join(folder, `${book}.usfm`));
            ingredients[path.join('ingredients', `${book}.usfm`)] = {
              checksum: {
                md5: md5(file[0].content),
              },
              mimeType: 'text/x-usfm',
              size: stats.size,
              scope: {},
            };
            ingredients[path.join('ingredients', `${book}.usfm`)].scope[book] = [];
          } else {
            const list = file.maxVerses;
            if (list[book]) {
              const chapters = [];
              (list[book]).forEach((verse, i) => {
                let contents = [{ p: null }];
                const verses = [];
                for (let i = 1; i <= parseInt(verse, 10); i += 1) {
                  verses.push({
                    verseNumber: i.toString(),
                    verseText: '',
                    contents: ['...'], // adding default text to verses to show the beginning of verse.
                  });
                }
                contents = contents.concat(verses);
                chapters.push({
                  chapterNumber: (i + 1).toString(),
                  contents,
                });
              });
              const usfm = {
                book: {
                  bookCode: book,
                  meta: [{ h: book }, [{ mt: [book] }]],
                },
                chapters,
              };
              const myJsonParser = new grammar.JSONParser(usfm);
              const isJsonValid = myJsonParser.validate();
              if (isJsonValid) {
                const reCreatedUsfm = myJsonParser.toUSFM();
                const fs = window.require('fs');
                if (!fs.existsSync(folder)) {
                  fs.mkdirSync(folder, { recursive: true });
                }
                logger.debug('createVersificationUSFM.js', `Creating the usfm file using scheme for ${book}`);
                fs.writeFileSync(path.join(folder, `${book}.usfm`), reCreatedUsfm);
                const stats = fs.statSync(path.join(folder, `${book}.usfm`));
                ingredients[path.join('ingredients', `${book}.usfm`)] = {
                  checksum: {
                    md5: md5(reCreatedUsfm),
                  },
                  mimeType: 'text/x-usfm',
                  size: stats.size,
                  scope: {},
                };
                ingredients[path.join('ingredients', `${book}.usfm`)].scope[book] = [];
              }
            }
          }
        });
        const fs = window.require('fs');
        logger.debug('createVersificationUSFM.js', 'Creating versification.json file in ingredients');
        await fs.writeFileSync(path.join(folder, 'versification.json'), JSON.stringify(file));
        const stats = fs.statSync(path.join(folder, 'versification.json'));
        ingredients[path.join('ingredients', 'versification.json')] = {
          checksum: {
            md5: md5(file),
          },
          mimeType: 'application/json',
          size: stats.size,
          role: 'x-versification',
        };
        if (call === 'edit' && currentBurrito?.copyright?.shortStatements && (copyright.licence).length <= 500) {
          logger.debug('createVersificationUSFM.js', 'Won\'t create license.md file in ingredients and update the current shortStatements');
        } else {
          logger.debug('createVersificationUSFM.js', 'Creating license.md file in ingredients');
          await fs.writeFileSync(path.join(folder, 'license.md'), copyright.licence);
          const copyrightStats = fs.statSync(path.join(folder, 'license.md'));
          ingredients[path.join('ingredients', 'license.md')] = {
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
            textTranslation: {
              scriptDirection: direction,
              starred: call === 'edit' ? currentBurrito.project?.textTranslation.starred : false,
              isArchived: call === 'edit' ? currentBurrito.project?.textTranslation.isArchived : false,
              versification,
              description: project.description,
              copyright: copyright.title,
              lastSeen: moment().format(),
              refResources: call === 'edit' ? currentBurrito.project?.textTranslation.refResources : [],
              bookMarks: call === 'edit' ? currentBurrito.project?.textTranslation.bookMarks : [],
            },
          },
          sync: { services: { door43: [] } },
        };
        if (call === 'edit') {
          settings.sync = currentBurrito?.sync;
        }
        logger.debug('createVersificationUSFM.js', `Creating ${environment.PROJECT_SETTING_FILE} file in ingredients`);
        await fs.writeFileSync(path.join(folder, environment.PROJECT_SETTING_FILE), JSON.stringify(settings));
        const stat = fs.statSync(path.join(folder, environment.PROJECT_SETTING_FILE));
        ingredients[path.join('ingredients', environment.PROJECT_SETTING_FILE)] = {
          checksum: {
            md5: md5(settings),
          },
          mimeType: 'application/json',
          size: stat.size,
          role: 'x-scribe',
        };
        logger.debug('createVersificationUSFM.js', 'Returning the ingredients data');
        resolve(ingredients);
      }
    });
  });
};

export const createWebVersificationUSFM = async (
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
  projectType,
) => {
  // eslint-disable-next-line no-console
  console.debug('createVersificationUSFM.js', {
    username,
    project,
    versification,
    books,
    id,
    importedFiles,
    copyright,
    currentBurrito,
    call,
    projectType,
  });

  const uploadFileToSupabase = async (filePath, fileContent) => {
    // eslint-disable-next-line no-unused-vars
    const { data: file, error } = await sbStorageUpload(filePath, new Blob([fileContent], { type: 'text/plain' }), {
        upsert: true,
      });

    if (error) {
      throw error;
    }
  };

  let folder = path.join(newPath, username, 'projects', `${project.projectName}_${id}`);
  let ingredientsDirName = 'ingredients';
  if (call === 'edit') {
    ingredientsDirName = Object.keys(currentBurrito.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
    ingredientsDirName = ingredientsDirName[0].split(/[(\\)?(/)?]/gm).slice(0)[0];
  }
  if (projectType === 'Audio') {
    folder = path.join(folder, 'text-1', ingredientsDirName);
  } else {
    folder = path.join(folder, ingredientsDirName);
  }
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
        // eslint-disable-next-line import/no-dynamic-require
        const file = require(`../lib/versification/${scheme.file}`);
        await books.forEach(async (book) => {
          if (bookAvailable(importedFiles, book)) {
            const file = importedFiles.filter((obj) => (obj.id === book));
            uploadFileToSupabase(`${folder}/${book}.usfm`, file[0].content);
            ingredients[path.join('ingredients', `${book}.usfm`)] = {
              checksum: {
                md5: md5(file[0].content),
              },
              mimeType: 'text/x-usfm',
              // size: stats.size,
              scope: {},
            };
            ingredients[path.join('ingredients', `${book}.usfm`)].scope[book] = [];
          } else {
            const list = file.maxVerses;
            if (list[book]) {
              const chapters = [];
              (list[book]).forEach((verse, i) => {
                let contents = [{ p: null }];
                const verses = [];
                for (let i = 1; i <= parseInt(verse, 10); i += 1) {
                  verses.push({
                    verseNumber: i.toString(),
                    verseText: '',
                    contents: ['...'], // adding default text to verses to show the beginning of verse.
                  });
                }
                contents = contents.concat(verses);
                chapters.push({
                  chapterNumber: (i + 1).toString(),
                  contents,
                });
              });
              const usfm = {
                book: {
                  bookCode: book,
                  meta: [{ h: book }, [{ mt: [book] }]],
                },
                chapters,
              };
              const myJsonParser = new grammar.JSONParser(usfm);
              const isJsonValid = myJsonParser.validate();
              if (isJsonValid) {
                const reCreatedUsfm = myJsonParser.toUSFM();
                uploadFileToSupabase(`${folder}/${book}.usfm`, reCreatedUsfm);
                ingredients[path.join('ingredients', `${book}.usfm`)] = {
                  checksum: {
                    md5: md5(reCreatedUsfm),
                  },
                  mimeType: 'text/x-usfm',
                  // size: stats.size,
                  scope: {},
                };
                ingredients[path.join('ingredients', `${book}.usfm`)].scope[book] = [];
              }
            }
          }
        });
        await uploadFileToSupabase(`${folder}/versification.json`, JSON.stringify(file));
        ingredients[path.join('ingredients', 'versification.json')] = {
          checksum: {
            md5: md5(file),
          },
          mimeType: 'application/json',
          // size: stats.size,
          role: 'x-versification',
        };
        if (call === 'edit' && currentBurrito?.project?.textTranslation?.shortStatements && (currentBurrito?.project?.textTranslation?.shortStatements).length <= 500) {
          logger.debug('createVersificationUSFM.js', 'Won\'t create license.md file in ingredients and update the current shortStatements');
        } else {
          await uploadFileToSupabase(`${folder}/license.md`, currentBurrito?.project?.textTranslation?.shortStatements);
          ingredients[path.join('ingredients', 'license.md')] = {
            checksum: {
              md5: md5(file),
            },
            mimeType: 'text/md',
            // size: stats.size,
            role: 'x-licence',
          };
        }
        const settings = {
          version: environment.AG_SETTING_VERSION,
          project: {
            textTranslation: {
              scriptDirection: direction,
              starred: call === 'edit' ? currentBurrito.project?.textTranslation.starred : false,
              isArchived: call === 'edit' ? currentBurrito.project?.textTranslation.isArchived : false,
              versification,
              description: project.description,
              copyright: copyright.title,
              lastSeen: moment().format(),
              refResources: call === 'edit' ? currentBurrito.project?.textTranslation.refResources : [],
              bookMarks: call === 'edit' ? currentBurrito.project?.textTranslation.bookMarks : [],
            },
          },
          sync: { services: { door43: [] } },
        };
        if (call === 'edit') {
          settings.sync = currentBurrito?.sync;
        }
        await uploadFileToSupabase(`${folder}/${environment.PROJECT_SETTING_FILE}`, JSON.stringify(settings));
        ingredients[path.join('ingredients', environment.PROJECT_SETTING_FILE)] = {
          checksum: {
            md5: md5(settings),
          },
          mimeType: 'application/json',
          // size: stat.size,
          role: 'x-scribe',
        };
        resolve(ingredients);
      }
    });
  });
};
