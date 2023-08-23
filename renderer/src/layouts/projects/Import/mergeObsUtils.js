// parse obs story based on the story number
import { commitChanges } from '@/components/Sync/Isomorphic/utils';
import JsonToMd from '../../../obsRcl/JsonToMd/JsonToMd';
import * as logger from '../../../logger';
// import OBSData from '../../../lib/OBSData.json';
import OBSData from '../../../lib/OBSDataForMerge.json';
import OBSFront from '../../../lib/OBSfront.md';
import OBSBack from '../../../lib/OBSback.md';

const path = require('path');

export async function parseObs(conflictData, selectedFileName) {
    const fs = window.require('fs');

    const filePath = path.join(conflictData.data.mergeDirPath, selectedFileName);

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

            // parse handling HEADER and Footer Conflicts
            let headerConflcit = false;
            let footerConflcit = false;
            let footerConflcitFoundIndex;

            if (allLines[0].startsWith('<<<<<')) {
              headerConflcit = true;
            }

            allLines.forEach((line, index) => {
              // To avoid the values after footer, we have added id=0
              if (line && id !== 0 && footerConflcit === false) {
                if (headerConflcit) {
                  // handling header with conflcit
                  const objIndex = stories.findIndex(((obj) => obj.id === id));
                  const splitData = line.split('#');
                  if (objIndex === -1) {
                    // object first time push
                    stories.push({
                      id, title: splitData.length > 1 ? splitData[1] : splitData[0],
                    });
                  } else {
                    // Reading other header total 5 lines and appending with previous line data
                    stories[objIndex].title = `${stories[objIndex].title}\n${splitData.length > 1 ? splitData[1] : splitData[0]}`;
                  }
                  // reset header conflcit after 5 lines
                  if (index === 4) {
                    headerConflcit = false;
                    id += 1;
                  }

                // } else if (footerConflcit && !headerConflcit && line.startsWith('<<<<<') && allLines[index + 1].startsWith('_')) {
                } else if (line.startsWith('<<<<<') && allLines[index + 1].startsWith('_')) {
                  // footer coflcit found from this line onwards pass execution to else
                  footerConflcitFoundIndex = index;
                  footerConflcit = true;
                } else if (line.match(/^(\s)*#/gm)) {
                  // Fetching the header content - No conflict
                  const hash = line.match(/# (.*)/);
                  stories.push({
                    id, title: hash[1],
                  });
                  id += 1;
                } else if (line.match(/^(\s)*_/gm) || footer === true) {
                  // Fetching the footer - NO Conflict
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
            logger.debug('mergeObsUtils.js', 'Story for selected navigation is been set to the array for Editor');

            // Handle conflcit in footer -- brark the loop when footer conflcit found
            if (allLines && footerConflcit && footerConflcitFoundIndex) {
                logger.debug('mergeObsUtils.js', 'conflcit for footer section. Handling');
                // handle footer with conflcit
                const footerConflcitArr = allLines.slice(footerConflcitFoundIndex, allLines.length);
                // add text field in last section -> normaly handled in footer section
                if (!('text' in stories[stories.length - 1])) {
                  stories[stories.length - 1].text = '';
                }
                // manipulate text
                const footerConflcitStr = footerConflcitArr.join('').replace('_', '\n_').replace('=======', '\n=======\n').replace('>>>>>>>', '\n>>>>>>>')
                      .replaceAll('_', '');
                stories.push({
                  id: stories.length + 1,
                  end: footerConflcitStr,
                });
                footerConflcit = false;
                footerConflcitFoundIndex = undefined;
            }
            return stories;
          }
    }
}

export async function updateAndSaveStory(story, currentUser, projectName, mergeDirPath, selectedFileName) {
  let title; let body = ''; let end;

  const path = require('path');
  const fs = window.require('fs');

    story.forEach((s) => {
      if (Object.prototype.hasOwnProperty.call(s, 'title')) {
        title = `# ${s.title.trim()}\n\n`;
      }
      if (Object.prototype.hasOwnProperty.call(s, 'end')) {
        const foot = ((s.end).trim());
        end = `_${foot}_`;
      }
      if (Object.prototype.hasOwnProperty.call(s, 'text')) {
        body += `![OBS Image](${s.img})\n\n${s.text.trim()}\n\n`;
      }
    });
    const storyStr = title + body + end;
    const filePath = path.join(mergeDirPath, selectedFileName);
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
      }
      fs.writeFileSync(path.join(dirPath, currentFileName), file);
    });
    // write front
    fs.writeFileSync(path.join(dirPath, 'front.md'), OBSFront);
    // write back
    fs.writeFileSync(path.join(dirPath, 'back.md'), OBSBack);
    logger.debug('mergeObsUtils.js', 'Inside createAllMd - successfully created base files');
    return true;
  } catch (err) {
    logger.error('mergeObsUtils.js', `error in write files ${err}`);
    return false;
  }
}

export async function copyFilesTempToOrginal(conflictData) {
  try {
    const path = require('path');
    const fs = window.require('fs');
    const fse = window.require('fs-extra');

    // copy all md from merge main to project main
    await fse.copy(
      conflictData.data.mergeDirPath,
      path.join(conflictData.data.projectPath, conflictData.data.projectContentDirName),
    );
    // remove .git dir from the copied files
    await fs.rmdirSync(path.join(conflictData.data.projectPath, conflictData.data.projectContentDirName, '.git'), { recursive: true }, (err) => {
      if (err) {
        throw new Error(`Failed to remove .git from projects ingredients :  ${err}`);
      }
    });
    // commit changes in project Dir
    await commitChanges(fs, conflictData.data.projectPath, conflictData.data.author, 'commit conflcit resolved');
    // delete tempDir
    await fs.rmdirSync(conflictData.data.mergeDirPath, { recursive: true }, (err) => {
      if (err) {
        throw new Error(`Merge Dir exist. Failed to remove :  ${err}`);
      }
    });
    return true;
  } catch (err) {
    return false;
  }
}
