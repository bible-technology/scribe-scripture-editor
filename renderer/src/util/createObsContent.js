/* eslint-disable no-async-promise-executor */
import moment from 'moment';
import { environment } from '../../environment';
import * as logger from '../logger';
import OBSData from '../lib/OBSData.json';
import OBSFront from '../lib/OBSfront.md';
import OBSBack from '../lib/OBSback.md';
import OBSLicense from '../lib/OBSLicense.md';
import JsonToMd from '../obsRcl/JsonToMd/JsonToMd';
import packageInfo from '../../../package.json';
import { newPath, sbStorageUpload } from '../../../supabase';

const path = require('path');
const md5 = require('md5');

const bookAvailable = (list, id) => list.some((obj) => obj.id === id);

export const createObsContent = (
  username,
  project,
  direction,
  id,
  currentBurrito,
  importedFiles,
  copyright,
  call,
) => {
  logger.debug('createObsContent.js', 'In OBS md content creation');

  return new Promise((resolve) => {
    const ingredients = {};
    const newpath = localStorage.getItem('userPath');
    let ingredientsDirName = 'ingredients';
    if (call === 'edit') {
      ingredientsDirName = Object.keys(currentBurrito.ingredients).filter((key) => key.includes(environment.PROJECT_SETTING_FILE));
      ingredientsDirName = ingredientsDirName[0].split(/[(\\)?(/)?]/gm).slice(0)[0];
    }
    const folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', `${project.projectName}_${id}`, ingredientsDirName);
    const fs = window.require('fs');

    logger.debug('createObsContent.js', 'Creating the story md files');
    // eslint-disable-next-line import/no-dynamic-require
    if (call === 'new') {
    OBSData.forEach(async (storyJson) => {
      const currentFileName = `${storyJson.storyId.toString().padStart(2, 0)}.md`;
      if (bookAvailable(importedFiles, currentFileName)) {
        logger.debug('createObsContent.js', `${currentFileName} is been Imported`);
        const file = importedFiles.filter((obj) => (obj.id === currentFileName));
        const fs = window.require('fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        fs.writeFileSync(path.join(folder, currentFileName), file[0].content, 'utf-8');
        const stats = fs.statSync(path.join(folder, currentFileName));
        ingredients[path.join('ingredients', currentFileName)] = {
          checksum: {
            md5: md5(file[0].content),
          },
          mimeType: 'text/markdown',
          size: stats.size,
          scope: storyJson.scope,
        };
        // ingredients[path.join('content', currentFileName)].scope[book] = [];
      } else {
        logger.debug('createObsContent.js', 'Creating the md file using RCL function JsonToMd');
        const file = JsonToMd(storyJson, '');
        const fs = window.require('fs');
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder, { recursive: true });
        }
        logger.debug('createObsContent.js', 'Writing File to the Content Directory');
        fs.writeFileSync(path.join(folder, currentFileName), file);
        const stats = fs.statSync(path.join(folder, currentFileName));
        ingredients[path.join('ingredients', currentFileName)] = {
          checksum: {
            md5: md5(file),
          },
          mimeType: 'text/markdown',
          size: stats.size,
          scope: storyJson.scope,
        };
        // ingredients[path.join('content', currentFileName)].scope[book] = [];
      }
    });
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    // OBS front and back files add to content
    logger.debug('createObsContent.js', 'Creating OBS front and back md file in content');
    // check front.md file in imported
    const fileFront = {};
    const fileBack = {};
    fileFront.files = importedFiles.filter((obj) => (obj.id === 'front.md'));
    fileBack.files = importedFiles.filter((obj) => (obj.id === 'back.md'));
    if (fileFront.files.length > 0) {
      fileFront.name = fileFront.files[0].id;
      fileFront.content = fileFront.files[0].content;
      logger.debug('createObsContent.js', `${fileFront.name} is been Imported`);
    } else {
      fileFront.name = 'front.md';
      fileFront.content = OBSFront;
      logger.debug('createObsContent.js', `${fileFront.name} default is created`);
    }
    fs.writeFileSync(path.join(folder, fileFront.name), fileFront.content);
    let obsstat = fs.statSync(path.join(folder, fileFront.name));
    ingredients[path.join('ingredients', fileFront.name)] = {
      checksum: {
        md5: md5(fileFront.content),
      },
      mimeType: 'text/markdown',
      size: obsstat.size,
      role: 'pubdata',
    };
    // back.md
    if (fileBack.files.length > 0) {
      fileBack.name = fileBack.files[0].id;
      fileBack.content = fileBack.files[0].content;
      logger.debug('createObsContent.js', `${fileBack.name} is been Imported`);
    } else {
      fileBack.name = 'back.md';
      fileBack.content = OBSBack;
      logger.debug('createObsContent.js', `${fileBack.name} default is created`);
    }
    fs.writeFileSync(path.join(folder, fileBack.name), fileBack.content);
    obsstat = fs.statSync(path.join(folder, fileBack.name));
    ingredients[path.join('ingredients', fileBack.name)] = {
      checksum: {
        md5: md5(fileBack.content),
      },
      mimeType: 'text/plain',
      size: obsstat.size,
      role: 'title',
    };
    // OBS License
    fs.writeFileSync(path.join(folder, 'LICENSE.md'), OBSLicense);
    obsstat = fs.statSync(path.join(folder, 'LICENSE.md'));
    ingredients[path.join('ingredients', 'LICENSE.md')] = {
      checksum: {
        md5: md5(OBSLicense),
      },
      mimeType: 'text/markdown',
      size: obsstat.size,
    };
  } else if (call === 'edit') {
    logger.debug('createObsContent.js', 'in Edit obs content files');
    importedFiles.forEach((file) => {
      if (file.id !== 'front.md' && file.id !== 'back.md') {
        logger.debug('createObsContent.js', `${file.id} is been Imported`);
        const currentStory = OBSData.filter((obj) => (
          (obj.storyId).toString().padStart(2, 0) === (file.id).split('.')[0]));
        const fs = window.require('fs');
        // if (!fs.existsSync(folder)) {
        //   fs.mkdirSync(folder, { recursive: true });
        // }
        fs.writeFileSync(path.join(folder, file.id), file.content, 'utf-8');
        const stats = fs.statSync(path.join(folder, file.id));
        ingredients[path.join('ingredients', file.id)] = {
          checksum: {
            md5: md5(file.content),
          },
          mimeType: 'text/markdown',
          size: stats.size,
          scope: currentStory[0].scope,
        };
      } else if (file.id === 'front.md' || file.id === 'back.md') {
        const mimeType = file.id === 'front.md' ? 'text/plain' : 'text/markdown';
        const role = file.id === 'front.md' ? 'title' : 'pubdata';
        fs.writeFileSync(path.join(folder, file.id), file.content);
        const obsstat = fs.statSync(path.join(folder, file.id));
        ingredients[path.join('ingredients', file.id)] = {
          checksum: {
            md5: md5(file.content),
          },
          mimeType,
          size: obsstat.size,
          role,
    };
      }
    });
  }
    // scribe setting creation
    const settings = {
      version: environment.AG_SETTING_VERSION,
      project: {
        textStories: {
          scriptDirection: direction,
          starred: call === 'edit' ? currentBurrito.project.textStories.starred : false,
          isArchived: call === 'edit' ? currentBurrito.project.textStories.isArchived : false,
          description: project.description,
          copyright: copyright.title,
          lastSeen: moment().format(),
          refResources: call === 'edit' ? currentBurrito.project.textStories.refResources : [],
          bookMarks: call === 'edit' ? currentBurrito.project.textStories.bookMarks : [],
        },
      },
      sync: { services: { door43: [] } },
    };
    if (call === 'edit') {
      settings.sync = currentBurrito?.sync;
    }
    logger.debug('createObsContent.js', `Creating ${environment.PROJECT_SETTING_FILE} file in content`);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
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

      resolve(ingredients);
  });
  };

  export const createWebObsContent = (
    username,
    project,
    direction,
    id,
    currentBurrito,
    importedFiles,
    copyright,
    call,
  ) => {
    console.log('createObsContent.js', 'In OBS md content creation');

    return new Promise(async (resolve) => {
      const ingredients = {};
      const supabasePath = `${newPath}/${username}/projects/${project.projectName}_${id}/ingredients`;

      const uploadFileToSupabase = async (filePath, fileContent) => {
        const { data: file, error } = await sbStorageUpload(filePath, new Blob([fileContent], { type: 'text/markdown' }), {
            upsert: true,
          });

        if (error) {
          console.error('Error uploading file to Supabase:', error);
          throw error;
        } else {
          console.log('File uploaded successfully to Supabase', file);
          const fileSize = file.size;
          return { file, fileSize };
        }
      };

      console.log('createObsContent.js', 'Creating the story md files');
      // eslint-disable-next-line import/no-dynamic-require
      if (call === 'new') {
        OBSData.forEach(async (storyJson) => {
          const currentFileName = `${storyJson.storyId.toString().padStart(2, 0)}.md`;
          if (bookAvailable(importedFiles, currentFileName)) {
            console.log('createObsContent.js', `${currentFileName} is been Imported`);
            const file = importedFiles.filter((obj) => (obj.id === currentFileName));
            const stats = await uploadFileToSupabase(`${supabasePath}/${currentFileName}`, file[0].content);
            ingredients[path.join('ingredients', currentFileName)] = {
              checksum: {
                md5: md5(file[0].content),
              },
              mimeType: 'text/markdown',
              size: stats.fileSize,
              scope: storyJson.scope,
            };
            // ingredients[path.join('content', currentFileName)].scope[book] = [];
          } else {
            console.log('createObsContent.js', 'Creating the md file using RCL function JsonToMd');
            const file = JsonToMd(storyJson, '');
            const stats = await uploadFileToSupabase(`${supabasePath}/${currentFileName}`, file);
            console.log('createObsContent.js', 'Writing File to the Content Directory');

            ingredients[path.join('ingredients', currentFileName)] = {
              checksum: {
                md5: md5(file),
              },
              mimeType: 'text/markdown',
              size: stats.fileSize,
              scope: storyJson.scope,
            };
          }
        });
        // OBS front and back files add to content
        console.log('createObsContent.js', 'Creating OBS front and back md file in content');
        // check front.md file in imported
        const fileFront = {};
        const fileBack = {};
        fileFront.files = importedFiles.filter((obj) => (obj.id === 'front.md'));
        fileBack.files = importedFiles.filter((obj) => (obj.id === 'back.md'));
        if (fileFront.files.length > 0) {
          fileFront.name = fileFront.files[0].id;
          fileFront.content = fileFront.files[0].content;
          console.log('createObsContent.js', `${fileFront.name} is been Imported`);
        } else {
          fileFront.name = 'front.md';
          fileFront.content = OBSFront;
          console.log('createObsContent.js', `${fileFront.name} default is created`);
        }
        // fs.writeFileSync(path.join(folder, fileFront.name), fileFront.content);
        // let obsstat = fs.statSync(path.join(folder, fileFront.name));
        let obsstat = await uploadFileToSupabase(`${supabasePath}/${fileFront.name}`, fileFront.content);
        ingredients[path.join('ingredients', fileFront.name)] = {
          checksum: {
            md5: md5(fileFront.content),
          },
          mimeType: 'text/markdown',
          size: obsstat.fileSize,
          role: 'pubdata',
        };
        // back.md
        if (fileBack.files.length > 0) {
          fileBack.name = fileBack.files[0].id;
          fileBack.content = fileBack.files[0].content;
          console.log('createObsContent.js', `${fileBack.name} is been Imported`);
        } else {
          fileBack.name = 'back.md';
          fileBack.content = OBSBack;
          console.log('createObsContent.js', `${fileBack.name} default is created`);
        }
        obsstat = await uploadFileToSupabase(`${supabasePath}/${fileBack.name}`, fileBack.content);
        ingredients[path.join('ingredients', fileBack.name)] = {
          checksum: {
            md5: md5(fileBack.content),
          },
          mimeType: 'text/plain',
          size: obsstat.fileSize,
          role: 'title',
        };

        obsstat = await uploadFileToSupabase(`${supabasePath}/LICENSE.md`, OBSLicense);
        ingredients[path.join('ingredients', 'LICENSE.md')] = {
          checksum: {
            md5: md5(OBSLicense),
          },
          mimeType: 'text/markdown',
          size: obsstat.fileSize,
        };
      } else if (call === 'edit') {
        console.log('createObsContent.js', 'in Edit obs content files');
        importedFiles.forEach(async (file) => {
          if (file.id !== 'front.md' && file.id !== 'back.md') {
            console.log('createObsContent.js', `${file.id} is been Imported`);
            const currentStory = OBSData.filter((obj) => (
              (obj.storyId).toString().padStart(2, 0) === (file.id).split('.')[0]));
            const stats = await uploadFileToSupabase(`${supabasePath}/${file.id}`, file.content);
            ingredients[path.join('ingredients', file.id)] = {
              checksum: {
                md5: md5(file.content),
              },
              mimeType: 'text/markdown',
              size: stats.fileSize,
              scope: currentStory[0].scope,
            };
          } else if (file.id === 'front.md' || file.id === 'back.md') {
            const mimeType = file.id === 'front.md' ? 'text/plain' : 'text/markdown';
            const role = file.id === 'front.md' ? 'title' : 'pubdata';
            const obsstat = await uploadFileToSupabase(`${supabasePath}/${file.id}`, file.content);
            ingredients[path.join('ingredients', file.id)] = {
              checksum: {
                md5: md5(file.content),
              },
              mimeType,
              size: obsstat.fileSize,
              role,
            };
          }
        });
      }
      // ag setting creation
      const settings = {
        version: environment.AG_SETTING_VERSION,
        project: {
          textStories: {
            scriptDirection: direction,
            starred: call === 'edit' ? currentBurrito.project.textStories.starred : false,
            isArchived: call === 'edit' ? currentBurrito.project.textStories.isArchived : false,
            description: project.description,
            copyright: copyright.title,
            lastSeen: moment().format(),
            refResources: call === 'edit' ? currentBurrito.project.textStories.refResources : [],
            bookMarks: call === 'edit' ? currentBurrito.project.textStories.bookMarks : [],
          },
        },
        sync: { services: { door43: [] } },
      };
      console.log('createObsContent.js', 'Creating ag-settings.json file in content');
      const stat = await uploadFileToSupabase(`${supabasePath}/${environment.PROJECT_SETTING_FILE}`, JSON.stringify(settings));
      ingredients[path.join('ingredients', environment.PROJECT_SETTING_FILE)] = {
        checksum: {
          md5: md5(settings),
        },
        mimeType: 'application/json',
        size: stat.fileSize,
        role: 'x-scribe',
      };
      console.log('createObsContent.js', 'Creating OBS content files completed', ingredients);
      resolve(ingredients);
    });
  };
