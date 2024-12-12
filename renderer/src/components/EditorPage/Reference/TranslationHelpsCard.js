import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  useContent,
} from 'translation-helps-rcl';
import localForage from 'localforage';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import ReferenceCard from './ReferenceCard';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import TabSelector from './TabSelector';

const tnTabHeads = [
  { id: 1, title: 'Book Overview' },
  { id: 2, title: 'Chapter Overview' },
  { id: 3, title: 'Verse Note' },
];

export default function TranslationHelpsCard({
  title,
  verse,
  server,
  owner,
  branch,
  chapter,
  filePath,
  setQuote,
  projectId,
  languageId,
  resourceId,
  selectedQuote,
  viewMode,
  offlineResource,
  font,
  fontSize,
}) {
  const [offlineItems, setOfflineItems] = useState([]);
  const [offlineItemsDisable, setOfflineItemsDisable] = useState(false);
  const [offlineMarkdown, setOfflineMarkdown] = useState('');
  const [resetTrigger, setResetTrigger] = useState(false);

  const [currentTnTab, setCurrentTnTab] = useState(2);

  const [currentChapterVerse, setCurrentChapterVerse] = useState({ verse, chapter });

  // eslint-disable-next-line prefer-const
  let items = [];
  let markdown = '';
  let isLoading;
  try {
    const tmpRes = useContent({
      verse: currentChapterVerse.verse,
      chapter: currentChapterVerse.chapter,
      projectId,
      branch,
      languageId,
      resourceId,
      filePath,
      owner,
      // server:"https://api.github.com",
      server,
      readyToFetch: true,
    });
    items = tmpRes.items;
    markdown = tmpRes.markdown;
    isLoading = tmpRes.isLoading;
  } catch (e) {
    logger.debug('TranslationHelpsCard.js', 'Error setting up in useContent');
  }

  useEffect(() => {
    if (currentTnTab === 1) {
      setCurrentChapterVerse({ chapter, verse: 'intro' });
    } else if (currentTnTab === 0) {
      setCurrentChapterVerse({ verse: 'intro', chapter: 'front' });
    } else {
      setCurrentChapterVerse({ verse, chapter });
    }
  }, [currentTnTab, verse, chapter]);

  useEffect(() => {
    if (offlineResource && offlineResource.offline) {
      // read tn tsv contents and pass to items
      try {
        setOfflineMarkdown('');
        setOfflineItems('');
        let isBurrito = false;
        localForage.getItem('userProfile').then(async (user) => {
          logger.debug('TranslationHelpsCard.js', `reading offline helps ${offlineResource.data?.projectDir}`);
          const fs = window.require('fs');
          const path = require('path');
          const newpath = localStorage.getItem('userPath');
          const currentUser = user?.username;
          const folder = path.join(newpath, packageInfo.name, 'users', `${currentUser}`, 'resources');
          let projectName = `${offlineResource?.data?.value?.meta?.name}_${offlineResource?.data?.value?.meta?.owner}_${offlineResource?.data?.value?.meta?.release?.tag_name}`;
          if (!offlineResource?.data?.value?.meta?.name) {
            isBurrito = true;
            projectName = offlineResource?.data?.projectDir;
          }
          // projectName = `${offlineResource?.data?.value?.meta?.name}_${offlineResource?.data?.value?.meta?.owner}_${offlineResource?.data?.value?.meta?.release?.tag_name}`;
          // switch resources
          switch (resourceId) {
          case 'tn':
            if (fs.existsSync(path.join(folder, projectName))) {
              // eslint-disable-next-line array-callback-return
              const currentFile = offlineResource?.data?.value?.projects.filter((item) => {
                if (item?.identifier.toLowerCase() === projectId.toLowerCase()) {
                  return item;
                }
              });

              if (currentFile?.length > 0) {
                const filecontent = await fs.readFileSync(path.join(folder, projectName, currentFile[0].path), 'utf8');
                // convert tsv to json
                const headerArr = filecontent.split('\n')[0].split('\t');
                let noteName;
                let indexOfNote;
                if (headerArr.indexOf('Note') > 0) {
                  indexOfNote = headerArr.indexOf('Note');
                  noteName = headerArr[indexOfNote];
                } else if (headerArr.indexOf('OccurrenceNote')) {
                  indexOfNote = headerArr.indexOf('OccurrenceNote');
                  noteName = headerArr[indexOfNote];
                }

                let bvcType = true;
                if (headerArr.includes('Reference') && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value))) {
                  bvcType = false;
                }

                const json = filecontent.split('\n')
                  .map((file) => {
                    if (bvcType) {
                      const [Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote] = file.split('\t');
                      return {
                        Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote,
                      };
                    }
                    const Book = projectId;
                    const [ref, ID] = file.split('\t');
                    const Chapter = ref.split(':')[0];
                    const Verse = ref.split(':')[1];
                    return {
                      Book, Chapter, Verse, ID, [noteName]: file.split('\t')[indexOfNote],
                    };
                  }).filter((data) => data.Chapter === currentChapterVerse.chapter && data.Verse === currentChapterVerse.verse);
                setOfflineItemsDisable(false);
                setOfflineItems(json);
              } else {
                setOfflineMarkdown({ error: true, data: 'No Content Available' });
              }
            }
            break;
          case 'x-bcvnotes':
            // console.log("yep", folder, 'and projectName ==', projectName);
            if (fs.existsSync(path.join(folder, projectName))) {
              // eslint-disable-next-line array-callback-return
              let currentFile;
              if (isBurrito) {
                const asArray = Object.entries(offlineResource?.data?.value?.ingredients);
                // currentFile = asArray.filter(([key, value]) => {
                //   if (key.toLocaleLowerCase().indexOf(projectId.toLowerCase()) !== -1) {
                //     console.log("key ==", key);
                //     console.log("value ==", value);
                //     return value;
                //   }
                //   return [];
                // })[0];
                // eslint-disable-next-line
                for (const [key, value] of asArray) {
                  if (key.toLocaleLowerCase().indexOf(projectId.toLowerCase()) !== -1) {
                    currentFile = key;
                    break;
                  }
                }
              } else {
                currentFile = offlineResource?.data?.value?.projects.filter((item) => {
                  if (item?.identifier.toLowerCase() === projectId.toLowerCase()) {
                    return item;
                  }
                  return null;
                });
              }
              if (currentFile?.length > 0) {
                // const filecontent = await fs.readFileSync(path.join(folder, projectName, currentFile[0].path), 'utf8');
                const filecontent = await fs.readFileSync(path.join(folder, projectName, isBurrito ? currentFile : currentFile[0].path), 'utf8');
                // convert tsv to json
                const headerArr = filecontent.split('\n')[0].split('\t');
                let noteName;
                let indexOfNote;
                if (headerArr.indexOf('Note') > 0) {
                  indexOfNote = headerArr.indexOf('Note');
                  noteName = headerArr[indexOfNote];
                } else if (headerArr.indexOf('OccurrenceNote')) {
                  indexOfNote = headerArr.indexOf('OccurrenceNote');
                  noteName = headerArr[indexOfNote];
                }

                let bvcType = true;
                if (headerArr.includes('Reference') && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value))) {
                  bvcType = false;
                }

                const json = filecontent.split('\n')
                  .map((line) => {
                    if (bvcType) {
                      const [Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote] = line.split('\t');
                      return {
                        Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote,
                      };
                    }
                    const Book = projectId;
                    const [ref, ID] = line.split('\t');
                    const Chapter = ref.split(':')[0];
                    const Verse = ref.split(':')[1];
                    return {
                      Book, Chapter, Verse, ID, [noteName]: line.split('\t')[indexOfNote],
                    };
                  }).filter((data) => data.Chapter === `${currentChapterVerse.chapter }` && data.Verse === `${currentChapterVerse.verse }`);
                setOfflineItemsDisable(false);
                setOfflineItems(json);
              }
            }
            break;

          case 'tq':
            if (fs.existsSync(path.join(folder, projectName))) {
              // eslint-disable-next-line array-callback-return
              const currentFile = offlineResource?.data?.value?.projects.filter((item) => {
                if (item?.identifier.toLowerCase() === projectId.toLowerCase()) {
                  return item;
                }
              });

              if (currentFile.length && currentFile[0].path?.includes('.tsv')) {
                const filecontent = await fs.readFileSync(path.join(folder, projectName, currentFile[0].path), 'utf8');
                // convert tsv to json
                const headerArr = filecontent.split('\n')[0].split('\t');
                const questionIndex = headerArr.indexOf('Question');
                const responseIndex = headerArr.indexOf('Response');

                let bvcType = true;
                if (headerArr.includes('Reference') && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value))) {
                  bvcType = false;
                }

                const joinedVerses = [];
                const verseObjArr = filecontent.split('\n')
                  .map((file) => {
                    if (bvcType) {
                      const [Book, Chapter, Verse, ID, Question, Response] = file.split('\t');
                      return {
                        Book, Chapter, Verse, ID, Question, Response,
                      };
                    }
                    const Book = projectId;
                    const [ref, ID] = file.split('\t');
                    const Chapter = ref.split(':')[0];
                    const Verse = ref.split(':')[1];
                    if (Verse) {
                      const splitVerse = Verse?.split('-');
                      if (splitVerse.length > 1) {
                        const start = parseInt(splitVerse[0], 10);
                        const end = parseInt(splitVerse[1], 10);
                        for (let i = start; i <= end; i++) {
                          joinedVerses.push({
                            Book, Chapter, Verse: i.toString(), ID, Question: file.split('\t')[questionIndex], Response: file.split('\t')[responseIndex],
                          });
                        }
                        return { Chapter: -1, Verse: -1 };
                      }
                    }
                    return {
                      Book, Chapter, Verse, ID, Question: file.split('\t')[questionIndex], Response: file.split('\t')[responseIndex],
                    };
                  });
                const finalJson = [...verseObjArr, ...joinedVerses];
                const json = finalJson.filter((data) => data.Chapter === chapter && data.Verse === verse);

                setOfflineItemsDisable(false);
                setOfflineItems(json);
              } else {
                // this is for MD
                // eslint-disable-next-line array-callback-return
                offlineResource?.data?.value?.projects.filter(async (project) => {
                  if (project.identifier.toLowerCase() === projectId.toLowerCase()) {
                    const contentDir = path.join(folder, projectName, project.path, chapter.toString().padStart(2, 0));
                    if (fs.existsSync(path.join(contentDir, `${verse.toString().padStart(2, 0)}.md`))) {
                      const filecontent = fs.readFileSync(path.join(contentDir, `${verse.toString().padStart(2, 0)}.md`), 'utf8');
                      // console.log('content : ', { filecontent });
                      setOfflineItemsDisable(true);
                      setOfflineMarkdown(filecontent);
                    } else {
                      setOfflineMarkdown({ error: true, data: 'No Content Available' });
                    }
                  }
                });
              }
            }
            break;

          case 'ta':
            setOfflineMarkdown('');
            if (filePath && projectId && fs.existsSync(path.join(folder, projectName, projectId, filePath))) {
              const filecontent = fs.readFileSync(path.join(folder, projectName, projectId, filePath), 'utf8');
              setOfflineItemsDisable(true);
              setOfflineMarkdown(filecontent);
            } else {
              setOfflineMarkdown({ error: true, data: 'No Content Available' });
            }
            break;

          case 'tw':
            // console.log('filepath : ', { filePath });
            setOfflineMarkdown('');
            if (filePath && fs.existsSync(path.join(folder, projectName, 'bible', filePath))) {
              const filecontent = fs.readFileSync(path.join(folder, projectName, 'bible', filePath), 'utf8');
              setOfflineItemsDisable(true);
              setOfflineMarkdown(filecontent);
            } else {
              setOfflineMarkdown({ error: true, data: 'No Content Available' });
            }
            break;

          default:
            break;
          }
        });
      } catch (err) {
        logger.debug('TranslationHelpsCard.js', `reading offline helps Error : ${err} `);
      }
    }
    // reset index
    setResetTrigger(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verse, chapter, languageId, resourceId, owner, offlineResource, projectId, items, filePath]);

  items = !offlineItemsDisable && offlineResource?.offline ? offlineItems : items;
  markdown = offlineResource?.offline ? offlineMarkdown : markdown;

  if ((resourceId === 'tn' || resourceId === 'x-bcvnotes') && items) {
    if (items[0]?.Note) {
      items[0].Note = (items[0].Note).replace(/(<br>|\\n)/gm, '\n');
    }
    if (items[0]?.OccurrenceNote) {
      items[0].OccurrenceNote = (items[0].OccurrenceNote).replace(/(<br>|\\n)/gm, '\n');
    }
  }

  return (
    <>
      {(resourceId === 'tn' || resourceId === 'x-bcvnotes') && (<TabSelector currentTab={currentTnTab} setCurrentTab={setCurrentTnTab} tabData={tnTabHeads} />)}
      {(markdown || items) ? (
        <ReferenceCard
          resourceId={resourceId}
          items={items}
          filters={['OccurrenceNote']}
          markdown={markdown}
          isLoading={isLoading}
          languageId={languageId}
          title={title}
          viewMode={viewMode}
          selectedQuote={selectedQuote}
          setQuote={setQuote}
          font={font}
          fontSize={fontSize}
          setResetTrigger={setResetTrigger}
          resetTrigger={resetTrigger}
        />
      )
        : <LoadingScreen />}
    </>

  );
}

TranslationHelpsCard.propTypes = {
  viewMode: PropTypes.string,
  title: PropTypes.string.isRequired,
  chapter: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  verse: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  server: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
  languageId: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,
  setQuote: PropTypes.func,
  selectedQuote: PropTypes.string,
  filePath: PropTypes.string,
  offlineResource: PropTypes.object,
};
