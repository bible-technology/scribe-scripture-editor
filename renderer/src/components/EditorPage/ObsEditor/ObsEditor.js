import {
  useState, useEffect, useContext, useCallback,
} from 'react';
import localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import { readFile } from '@/core/editor/readFile';
import Editor from '@/modules/editor/Editor';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import writeToFile from '@/core/editor/writeToFile';
import { saveReferenceResource } from '@/core/projects/updateAgSettings';
import moment from 'moment';
import { splitStringByLastOccurance } from '@/util/splitStringByLastMarker';
import EditorPanel from './EditorPanel';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import { newPath } from '../../../../../supabase';

export const getDetails = () => new Promise((resolve) => {
  logger.debug('ObsEditor.js', 'In getDetails() for fetching the burrito file of current project');
  localforage.getItem('userProfile').then((value) => {
    const username = value?.username;
    localforage.getItem('currentProject').then((projectName) => {
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      const projectsDir = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName);
      const metaPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectName, 'metadata.json');
      resolve({
        projectName, username, projectsDir, metaPath, path,
      });
    });
  });
});

export const getWebDetails = () => new Promise((resolve) => {
  localforage.getItem('userProfile').then((value) => {
    const username = value?.user?.email;
    localforage.getItem('currentProject').then((projectName) => {
      const path = require('path');
      const projectsDir = `${newPath}/${username}/projects/${projectName}`;
      const metaPath = `${newPath}/${username}/projects/${projectName}/metadata.json`;
      resolve({
        projectName, username, projectsDir, metaPath, path,
      });
    });
  });
});

function checkDetailsFunc() {
  if (isElectron()) {
    return getDetails();
  }
  return getWebDetails();
}

const ObsEditor = () => {
  const [mdData, setMdData] = useState();
  const [directoryName, setDirectoryName] = useState();
  const { state: { obsNavigation, loadData }, actions: { setLoadData } } = useContext(ReferenceContext);

  const updateStory = (story) => {
    logger.debug('ObsEditor.js', 'In updateStory for upadting the story to the backend md file');
    setMdData(story);
    let title; let body = ''; let end;
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
    checkDetailsFunc().then((value) => {
      const bookID = obsNavigation.toString().padStart(2, 0);
      writeToFile({
        username: value.username,
        projectname: value.projectName,
        filename: isElectron() ? (value.path).join(directoryName, `${bookID}.md`) : `${directoryName}/${bookID}.md`,
        data: storyStr,
      });
    });
  };
  // this function is used to fetch the content from the given story number
  const readContent = useCallback(() => {
    setLoadData(false);
    checkDetailsFunc()
      .then(({
        projectName, username, projectsDir, metaPath, path,
      }) => {
        readRefMeta({
          projectsDir,
        }).then((refs) => {
          // setIsLoading(true);
          refs.forEach(() => {
            readRefBurrito({
              metaPath,
            }).then(async (data) => {
              if (data) {
                const _data = isElectron() ? JSON.parse(data) : data;
                Object.entries(_data.ingredients).forEach(
                  ([key]) => {
                    const folderName = key.split(/[(\\)?(/)?]/gm).slice(0);
                    const dirName = folderName[0];
                    setDirectoryName(dirName);
                    // Fetching data from projectmeta and updating the navigation and lastSeen back
                    localforage.getItem('currentProject').then(async (projectName) => {
                      const _projectname = await splitStringByLastOccurance(projectName, '_');
                      // const _projectname = projectName?.split('_');
                      localforage.getItem('projectmeta').then((value) => {
                        Object.entries(value).forEach(
                          ([, _value]) => {
                            Object.entries(_value).forEach(
                              ([, resources]) => {
                                if (resources.identification.name.en === _projectname[0]) {
                                  resources.project[resources.type.flavorType.flavor.name].navigation = obsNavigation;
                                  resources.project[resources.type.flavorType.flavor.name].lastSeen = moment().format();
                                }
                              },
                            );
                          },
                        );
                        localforage.setItem('projectmeta', value);
                        // This func will update the scribe-setting.json file
                        saveReferenceResource();
                      });
                    });
                    logger.debug('ObsEditor.js', 'Reading the md file for selected OBS story');
                    const bookID = obsNavigation?.toString().padStart(2, 0);
                    if (key === path.join(dirName, `${bookID}.md`)) {
                      readFile({
                        projectname: projectName,
                        filename: key,
                        username,
                      }).then((data) => {
                        if (data) {
                          const stories = [];
                          // eslint-disable-next-line prefer-const
                          let id = 1; let footer = false;
                          // eslint-disable-next-line react/prop-types
                          const allLines = data.split(/\r\n|\n/);
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
                          setMdData(stories);
                        }
                      });
                    }
                  },
                );
              }
            });
          });
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obsNavigation]);

  useEffect(() => {
    readContent();
  }, [readContent]);

  useEffect(() => {
    if (loadData === true) {
      readContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData]);

  return (
    <Editor callFrom="obs">
      {mdData
        && <EditorPanel obsStory={mdData} storyUpdate={updateStory} />}
    </Editor>
  );
};
export default ObsEditor;
