/* eslint-disable no-continue */
import PropTypes from 'prop-types';
import {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import {
  useContent,
} from 'translation-helps-rcl';
import localForage from 'localforage';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import * as localforage from 'localforage';
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
  const isOfflineMode = offlineResource?.offline;

  // Memoize current chapter/verse to prevent object recreation
  const currentChapterVerse = useMemo(() => {
    if (currentTnTab === 1) {
      return { chapter, verse: 'intro' };
    } if (currentTnTab === 0) {
      return { verse: 'intro', chapter: 'front' };
    }
    return { verse, chapter };
  }, [currentTnTab, verse, chapter]);

  // Memoize useContent parameters to prevent unnecessary re-renders
  const contentParams = useMemo(() => ({
    verse: currentChapterVerse.verse,
    chapter: currentChapterVerse.chapter,
    projectId,
    branch,
    languageId,
    resourceId,
    filePath,
    owner,
    server,
    readyToFetch: !isOfflineMode, // Only fetch when NOT in offline mode
  }), [
    currentChapterVerse.verse,
    currentChapterVerse.chapter,
    projectId,
    branch,
    languageId,
    resourceId,
    filePath,
    owner,
    server,
    isOfflineMode,
  ]);

  // Always call useContent hook (moved before useCallback)
  let contentResult = { items: [], markdown: '', isLoading: false };
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contentResult = useContent(contentParams);
  } catch (e) {
    logger.debug('TranslationHelpsCard.js', 'Error setting up in useContent');
  }

  // Extract values from contentResult, but only use them if not in offline mode
  const items = isOfflineMode ? [] : contentResult.items;
  const markdown = isOfflineMode ? '' : contentResult.markdown;
  const isLoading = isOfflineMode ? false : contentResult.isLoading;

  // Memoize offline resource processing function
  const processOfflineResource = useCallback(async () => {
    if (!isOfflineMode) { return; }

    try {
      setOfflineMarkdown('');
      setOfflineItems([]);
      let isBurrito = false;
      const user = await localForage.getItem('userProfile');
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

      // switch resources
      switch (resourceId) {
      case 'tn':
        if (fs.existsSync(path.join(folder, projectName))) {
          const currentFile = offlineResource?.data?.value?.projects.find(
            (item) => item?.identifier.toLowerCase() === projectId.toLowerCase(),
          );

          if (currentFile) {
            const filecontent = await fs.readFileSync(path.join(folder, projectName, currentFile.path), 'utf8');
            const lines = filecontent.split('\n');
            const headerArr = lines[0].split('\t');
            let noteName;
            let indexOfNote;
            if (headerArr.indexOf('Note') > 0) {
              indexOfNote = headerArr.indexOf('Note');
              noteName = headerArr[indexOfNote];
            } else if (headerArr.indexOf('OccurrenceNote') > -1) {
              indexOfNote = headerArr.indexOf('OccurrenceNote');
              noteName = headerArr[indexOfNote];
            }

            let bvcType = true;
            if (headerArr.includes('Reference') && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value))) {
              bvcType = false;
            }

            const targetChapter = currentChapterVerse.chapter.toString();
            const targetVerse = currentChapterVerse.verse.toString();
            const json = [];

            // Process lines efficiently with early filtering
            for (let i = 1; i < lines.length; i++) {
              const file = lines[i];
              if (!file.trim()) { continue; }

              if (!bvcType) {
                // Quick pre-filter for non-bvcType
                if (!file.includes(`${targetChapter}:${targetVerse}`)) {
                  continue;
                }
              }

              if (bvcType) {
                const parts = file.split('\t');
                if (parts.length < 9) { continue; }

                const [Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote] = parts;
                // Early check - only process if chapter/verse match
                if (Chapter !== targetChapter || Verse !== targetVerse) {
                  continue;
                }

                json.push({
                  Book, Chapter, Verse, ID, SupportReference, OrigQuote, Occurrence, GLQuote, OccurrenceNote,
                });
              } else {
                const parts = file.split('\t');
                const [ref, ID] = parts;
                if (!ref || !ref.includes(':')) {
                  continue;
                }

                const [Chapter, Verse] = ref.split(':');
                if (Chapter === targetChapter && Verse === targetVerse) {
                  json.push({
                    Book: projectId,
                    Chapter,
                    Verse,
                    ID,
                    [noteName]: parts[indexOfNote],
                  });
                }
              }
            }

            setOfflineItemsDisable(false);
            setOfflineItems(json);
          } else {
            setOfflineMarkdown({ error: true, data: 'No Content Available' });
          }
        }
        break;
      case 'x-bcvnotes':
        if (fs.existsSync(path.join(folder, projectName))) {
          // eslint-disable-next-line array-callback-return
          let currentFile;
          if (isBurrito) {
            const asArray = Object.entries(offlineResource?.data?.value?.ingredients);
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
          const currentProject = offlineResource?.data?.value?.projects.find((item) => item?.identifier.toLowerCase() === projectId.toLowerCase());
          if (!currentProject) {
            break;
          }
          if (currentProject.path?.includes('.tsv')) {
            const filePath = path.join(folder, projectName, currentProject.path);
            const filecontent = await fs.readFileSync(filePath, 'utf8');
            const lines = filecontent.split('\n');
            const headerArr = lines[0].split('\t');
            const questionIndex = headerArr.indexOf('Question');
            const responseIndex = headerArr.indexOf('Response');
            const bvcType = !(headerArr.includes('Reference')
              && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value)));
            const targetChapter = currentChapterVerse.chapter.toString();
            const targetVerse = currentChapterVerse.verse.toString();
            const matchingVerses = [];

            // Lines starting from index 1
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i];
              if (!line.trim()) { continue; }
              const columns = line.split('\t');
              if (bvcType) {
                const [Book, Chapter, Verse, ID, Question, Response] = columns;
                // Exit if this verse doesn't match
                if (Chapter === targetChapter && Verse === targetVerse) {
                  matchingVerses.push({
                    Book, Chapter, Verse, ID, Question, Response,
                  });
                }
              } else {
                const Book = projectId;
                const [ref, ID] = columns;
                if (!ref) { continue; }
                const refParts = ref.split(':');
                const Chapter = refParts[0];
                const Verse = refParts[1];
                if (!Verse) { continue; }
                // Handle joint verse
                if (Verse.includes('-')) {
                  const [startStr, endStr] = Verse.split('-');
                  const start = parseInt(startStr, 10);
                  const end = parseInt(endStr, 10);

                  // Joint verse
                  const targetVerseNum = parseInt(targetVerse, 10);
                  if (Chapter === targetChapter
                      && targetVerseNum >= start && targetVerseNum <= end) {
                    matchingVerses.push({
                      Book,
                      Chapter,
                      Verse: targetVerse,
                      ID,
                      Question: columns[questionIndex],
                      Response: columns[responseIndex],
                    });
                  }
                } else if (Chapter === targetChapter && Verse === targetVerse) {
                  matchingVerses.push({
                    Book,
                    Chapter,
                    Verse,
                    ID,
                    Question: columns[questionIndex],
                    Response: columns[responseIndex],
                  });
                }
              }
            }

            setOfflineItemsDisable(false);
            setOfflineItems(matchingVerses);
          } else {
            // Handle MD files
            const contentDir = path.join(
              folder,
              projectName,
              currentProject.path,
              chapter.toString().padStart(2, '0'),
            );
            const mdFilePath = path.join(contentDir, `${verse.toString().padStart(2, '0')}.md`);

            if (fs.existsSync(mdFilePath)) {
              const filecontent = fs.readFileSync(mdFilePath, 'utf8');
              setOfflineItemsDisable(true);
              setOfflineMarkdown(filecontent);
            } else {
              setOfflineMarkdown({ error: true, data: 'No Content Available' });
            }
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
        setOfflineMarkdown('');
        if (filePath && fs.existsSync(path.join(folder, projectName, 'bible', filePath))) {
          const filecontent = fs.readFileSync(path.join(folder, projectName, 'bible', filePath), 'utf8');
          setOfflineItemsDisable(true);
          setOfflineMarkdown(filecontent);
        } else {
          setOfflineMarkdown({ error: true, data: 'No Content Available' });
        }
        break;

      case 'twl':
        if (fs.existsSync(path.join(folder, projectName))) {
          const currentFile = offlineResource?.data?.value?.projects.find(
            (item) => item?.identifier.toLowerCase() === projectId.toLowerCase(),
          );

          if (currentFile) {
            const filecontent = await fs.readFileSync(path.join(folder, projectName, currentFile.path), 'utf8');
            const lines = filecontent.split('\n');
            const headerArr = lines[0].split('\t');
            let noteName;
            let indexOfNote;
            if (headerArr.indexOf('TWLink') > 0) {
              indexOfNote = headerArr.indexOf('TWLink');
              noteName = headerArr[indexOfNote];
            }

            let bvcType = true;
            if (headerArr.includes('Reference') && headerArr.every((value) => !['Book', 'Verse', 'Chapter'].includes(value))) {
              bvcType = false;
            }

            const targetChapter = currentChapterVerse.chapter.toString();
            const targetVerse = currentChapterVerse.verse.toString();
            const json = [];

            // Process lines efficiently with early filtering
            for (let i = 1; i < lines.length; i++) {
              const file = lines[i];
              if (!file.trim()) { continue; }

              let parsedData;
              if (bvcType) {
                const [Book, Chapter, Verse, ID, OrigWords, Occurrence, TWLink] = file.split('\t');
                // Early check - skip if not matching chapter/verse
                if (Chapter !== targetChapter || Verse !== targetVerse) {
                  continue;
                }
                parsedData = {
                  Book, Chapter, Verse, ID, OrigWords, Occurrence, TWLink,
                };
              } else {
                const [ref, ID] = file.split('\t');
                if (!ref || !ref.includes(':')) { continue; }

                const Chapter = ref.split(':')[0];
                const Verse = ref.split(':')[1];

                // Early check - skip if not matching chapter/verse
                if (Chapter !== targetChapter || Verse !== targetVerse) {
                  continue;
                }

                parsedData = {
                  Book: projectId,
                  Chapter,
                  Verse,
                  ID,
                  [noteName]: file.split('\t')[indexOfNote],
                };
              }
              json.push(parsedData);
            }

            const twLinksPromises = json.map(async (item) => {
              const startIndex = item.TWLink.indexOf('dict/');
              let trimmedString = '';
              if (startIndex !== -1) {
                trimmedString = item.TWLink.substring(startIndex + 'dict/'.length);
              }
              const parts = trimmedString.split('/');
              const resources = await localforage.getItem('resources');
              const tW_project = `${offlineResource?.data?.value?.meta?.language}_tw_${offlineResource?.data?.value?.meta?.owner}`;
              const projectName = resources.find((item) => (item.projectDir).toLowerCase().includes(tW_project.toLowerCase()));
              const wordLink = path.join(...parts);
              if (fs.existsSync(path.join(folder, projectName.projectDir, `${wordLink}.md`))) {
                const filecontent = fs.readFileSync(path.join(folder, projectName.projectDir, `${wordLink}.md`), 'utf8');
                item.markdown = filecontent;
                return item;
              }
            });
            const twLinks = await Promise.all(twLinksPromises);
            setOfflineItemsDisable(true);
            setOfflineItems(twLinks);
          } else {
            setOfflineMarkdown({ error: true, data: 'No Content Available' });
          }
        }
        break;

      default:
        break;
      }
    } catch (err) {
      logger.debug('TranslationHelpsCard.js', `reading offline helps Error : ${err} `);
    }
  }, [
    isOfflineMode,
    offlineResource,
    resourceId,
    projectId,
    currentChapterVerse,
    filePath,
  ]);

  // Effect for processing offline resources
  useEffect(() => {
    if (isOfflineMode) {
      processOfflineResource();
    }
    setResetTrigger(true);
  }, [isOfflineMode, processOfflineResource]);

  // Memoize final items and markdown to prevent unnecessary re-renders
  const finalItems = useMemo(() => {
    const result = isOfflineMode ? offlineItems : items;

    // Process items for tn and x-bcvnotes
    if ((resourceId === 'tn' || resourceId === 'x-bcvnotes') && result && result[0]) {
      const processedResult = [...result];
      if (processedResult[0]?.Note) {
        processedResult[0].Note = processedResult[0].Note.replace(/(<br>|\\n)/gm, '\n');
      }
      if (processedResult[0]?.OccurrenceNote) {
        processedResult[0].OccurrenceNote = processedResult[0].OccurrenceNote.replace(/(<br>|\\n)/gm, '\n');
      }
      return processedResult;
    }

    return result;
  }, [items, offlineItems, offlineItemsDisable, isOfflineMode, resourceId]);

  const finalMarkdown = useMemo(
    () => (isOfflineMode ? offlineMarkdown : markdown),
    [isOfflineMode, offlineMarkdown, markdown],
  );

  return (
    <>
      {(resourceId === 'tn' || resourceId === 'x-bcvnotes') && (
        <TabSelector
          currentTab={currentTnTab}
          setCurrentTab={setCurrentTnTab}
          tabData={tnTabHeads}
        />
      )}
      {(finalMarkdown || finalItems) ? (
        <ReferenceCard
          resourceId={resourceId}
          items={finalItems}
          filters={['OccurrenceNote']}
          markdown={finalMarkdown}
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
      ) : (
        <LoadingScreen />
      )}
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
