// parse obs story based on the story number
import JsonToMd from '../../../obsRcl/JsonToMd/JsonToMd';
import * as logger from '../../../logger';
import OBSData from '../../../lib/OBSData.json';

const path = require('path');

export async function parseObs(conflictData, selectedFileName) {
    // conflictData : {
    //     open: true,
    //     data: {
    //       files: mergeStatus.data,
    //       targetPath,
    //       sourcePath,
    //       sourceMeta,
    //       author,
    //       currentActiveBranch,
    //       currentUser,
    //       projectName
    //     },
    //   }

    // const username = conflictData.currentUser;
    // const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');

    // get internal folder name --> dir coming in file name
    // const firstKey = Object.keys(conflictData.sourceMeta.ingredients)[0];
    // const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
    // const contentDirName = folderName[0];

    const filePath = path.join(conflictData.data.targetPath, selectedFileName);

    if (fs.existsSync(filePath)) {
        const fileContent = await fs.readFileSync(filePath, 'utf8');
        if (fileContent) {
            const stories = [];
            // eslint-disable-next-line prefer-const
            let id = 1; let footer = false;
            // eslint-disable-next-line react/prop-types
            const allLines = fileContent.split(/\r\n|\n/);
            logger.debug('ObsEditor.js', 'Spliting the stories line by line and storing into an array.');
            // Reading line by line
            allLines.forEach((line) => {
              // To avoid the values after footer, we have added id=0
              if (line && id !== 0) {
                if (line.match(/^(\s)*#/gm)) {
                  // Fetching the header content
                  const hash = line.match(/# (.*)/);
                  stories.push({
                    id, title: hash[1],
                  });
                  id += 1;
                } else if (line.match(/^(\s)*_/gm) || footer === true) {
                  // Fetching the footer
                  const objIndex = stories.findIndex(((obj) => obj.id === id));
                  if (objIndex !== -1 && Object.prototype.hasOwnProperty.call(stories[objIndex], 'img')) {
                    stories[objIndex].text = '';
                    id += 1;
                  }
                  if (line.match(/_(.*)_/g) && footer === false) {
                    // single line footer
                    const underscore = line.match(/_(.*)_/);
                    stories.push({
                      id, end: underscore[1],
                    });
                    // Logically footer is the last line of the story
                    id = 0;
                  } else {
                    // To get multi-line footer (footer=true)
                    footer = true;
                    if (line.match(/^(\s)*_/gm)) {
                      // starting of footer
                      const underscore = line.match(/^(\s)*_(.*)/);
                      stories.push({
                        id, end: underscore[2],
                      });
                    } else if (line.match(/_$/gm)) {
                      // end of footer
                      const underscore = line.match(/(.*)_$/);
                      stories[id - 1].end = `${stories[id - 1].end}\n${underscore[1]}`;
                      // Logically footer is the last line of the story
                      id = 0;
                    } else {
                      // middle lines of footer if available
                      stories[id - 1].end = `${stories[id - 1].end}\n${line}`;
                    }
                  }
                } else if (line.match(/^(\s)*!/gm)) {
                  // Fetching the IMG url
                  const objIndex = stories.findIndex(((obj) => obj.id === id));
                  if (objIndex !== -1 && Object.prototype.hasOwnProperty.call(stories[objIndex], 'img')) {
                    stories[objIndex].text = '';
                    id += 1;
                  }
                  const imgUrl = line.match(/\((.*)\)/);
                  stories.push({
                    id, img: imgUrl[1],
                  });
                } else {
                  // Reading the content line by line
                  const objIndex = stories.findIndex(((obj) => obj.id === id));
                  if (objIndex !== -1) {
                    // Reading first line after img
                    stories[objIndex].text = line;
                    id += 1;
                  } else {
                    // Reading other lines and appending with previous line data
                    stories[id - 2].text = `${stories[id - 2].text}\n${line}`;
                  }
                }
              }
            });
            logger.debug('ObsEditor.js', 'Story for selected navigation is been set to the array for Editor');
            return stories;
          }
    }
}

export async function updateAndSaveStory(story, currentUser, projectName, targetPath, selectedFileName) {
  let title; let body = ''; let end;

  const path = require('path');
  const fs = window.require('fs');

    story.forEach((s) => {
      if (Object.prototype.hasOwnProperty.call(s, 'title')) {
        title = `# ${s.title}\n\n`;
      }
      if (Object.prototype.hasOwnProperty.call(s, 'end')) {
        const foot = ((s.end).trim());
        end = `_${foot}_`;
      }
      if (Object.prototype.hasOwnProperty.call(s, 'text')) {
        body += `![OBS Image](${s.img})\n\n${s.text}\n\n`;
      }
    });
    const storyStr = title + body + end;
    const filePath = path.join(targetPath, selectedFileName);
    await fs.writeFileSync(filePath, storyStr);

    logger.debug('parseObsStory.js', `Updated Story after resolve conflcit ${selectedFileName}`);
}

export async function createAllMdInDir(dirPath) {
  try {
    // function to create 50 md story in a dir
    logger.debug('mergeObsUtils.js', 'Inside createAllMd - create empty md in a dir');
    const fs = window.require('fs');
    await OBSData.forEach(async (storyJson) => {
      const currentFileName = `${storyJson.storyId.toString().padStart(2, 0)}.md`;
      const file = await JsonToMd(storyJson, '');
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        logger.debug('mergeObsUtils.js', 'Inside createAllMd - Dir is created');
        console.log('inside create Dir', { dirPath });
      }
      fs.writeFileSync(path.join(dirPath, currentFileName), file);
    });
    logger.debug('mergeObsUtils.js', 'Inside createAllMd - successfully created base files');
    return true;
  } catch (err) {
    logger.error('mergeObsUtils.js', `error in write files ${err}`);
    return false;
  }
}
