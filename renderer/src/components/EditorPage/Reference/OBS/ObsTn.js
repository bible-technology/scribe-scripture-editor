/* eslint-disable react/prop-types */
import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import localForage from 'localforage';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { getObsTn } from './getObsTn';
import ObsResourceCard from './ObsResourceCard';
import * as logger from '../../../../logger';
import tsvJSON from './TsvToJson';
import ObsTsvToChapterLevelMd from './ObsTsvToChapterLevel';
import packageInfo from '../../../../../../package.json';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { SnackBar } from '@/components/SnackBar';

function ObsTnCard({
  resource,
  chapter,
  frame,
  languageId,
  classes,
  setQuote,
  selectedQuote,
  owner,
  resourceId,
  offlineResource,
  font,
  ...props
}) {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState([]);
  const [markdown, setMarkdown] = useState();
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();

  const {
    state: {
      selectedStory,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      scrollLock,
    },
  } = useContext(ProjectContext);
  useEffect(() => {
    if (selectedStory && scrollLock === false) {
      const i = items.findIndex((e) => (e.name)?.toString().padStart(2, '0') === (selectedStory - 1)?.toString().padStart(2, '0'));
      if (i > -1) {
        setIndex(i);
      } else {
        setIndex(-1);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStory]);
  useEffect(() => {
    if (items.length !== 0) {
      setMarkdown(items[index]?.OccurrenceNote ? items[index]?.OccurrenceNote : 'No Content Available for the selected Line');
    } else {
      setMarkdown('');
    }
  }, [items, index]);
  useEffect(() => {
    async function fetchData() {
      await getObsTn(owner, `${languageId}_${resourceId}`, `content/${chapter.toString().padStart(2, 0)}`, chapter, languageId, scrollLock)
      .then((data) => {
        setItems(data);
      });
    }
    async function fetchOfflineData() {
      try {
      localForage.getItem('userProfile').then(async (user) => {
          logger.debug('OfflineResourceFetch.js', 'reading offline obs-tn ', offlineResource.data?.projectDir);
          const fs = window.require('fs');
          const path = require('path');
          const newpath = localStorage.getItem('userPath');
          const currentUser = user?.username;
          const folder = path.join(newpath, packageInfo.name, 'users', `${currentUser}`, 'resources');
          const projectName = `${offlineResource.data?.value?.meta?.name}_${offlineResource.data?.value?.meta?.owner}_${offlineResource.data?.value?.meta?.release?.tag_name}`;
          if (fs.existsSync(path.join(folder, projectName))) {
              if (offlineResource.data?.value?.dublin_core?.format?.toLowerCase() === 'text/tsv') {
                logger.debug('inside OBS TN offline TSV resource');
                let tsvFileName = offlineResource.data?.value?.projects[0]?.path;
                let fullPathTsv = path.join(folder, projectName, tsvFileName);
                // sometimes people put the path of the content dir instead of the name of the tsv file
                if(!fs.existsSync(fullPathTsv) || fs.lstatSync(fullPathTsv).isDirectory()) {
                  tsvFileName = fs.readdirSync(path.join(folder, projectName)).filter(fn => fn.endsWith('.tsv'))[0];
                }
                if(tsvFileName && fs.existsSync(path.join(folder, projectName, tsvFileName)) && fs.lstatSync(path.join(folder, projectName, tsvFileName)).isFile()) {
                  const obsTsvData = await fs.readFileSync(path.join(folder, projectName, tsvFileName), 'utf8');
                  const obsTsvJson = obsTsvData && await tsvJSON(obsTsvData);
                  logger.debug('inside OBS TN offline TSV resource : created TSV JSON');
                  await ObsTsvToChapterLevelMd(obsTsvJson, chapter).then((chapterTsvData) => {
                    logger.debug('inside OBS TN offline TSV resource : generated chapter Md level occurencenot Array');
                    setItems(chapterTsvData);
                  });
                } else {
                  setNotify('failure');
                  // TODO translation
                  setSnackText('Impossible to read the data from the selected resource. Please contact the owner of the resource project.');
                  setOpenSnackBar(true);
                }
              } else {
                const contentDir = offlineResource.data?.value?.projects[0]?.path;
                const notesDir = path.join(folder, projectName, contentDir, chapter.toString().padStart(2, 0));
                const items = [];
                fs.readdir(notesDir, async (err, files) => {
                  if (err) {
                    logger.debug('OfflineResourceFetch.js', 'reading offline dir not found err :  ', err);
                    throw err;
                  }
                  // listing all files using forEach
                  await files.forEach(async (file) => {
                    const filecontent = await fs.readFileSync(path.join(notesDir, file), 'utf8');
                    items.push({ name: (file).replace('.md', ''), OccurrenceNote: filecontent });
                  });
                  if (items.length === files.length) {
                    logger.debug('OfflineResourceFetch.js', 'reading offline obs-tn finished ');
                    setItems(items);
                  }
                });
              }
            }
          });
        } catch (err) {
            logger.debug('err on fetch local : ', err);
            throw err;
        }
    }
    setItems([]);
    setIndex(0);
    if (offlineResource && !offlineResource.offline) {
      fetchData();
    } else if (offlineResource && offlineResource.offline) {
      fetchOfflineData();
    }
  }, [chapter, languageId, owner, resourceId, offlineResource, scrollLock]);

  return (
    markdown ? (
      <ObsResourceCard
        {...props}
        chapter={chapter}
        verse={frame}
        items={items}
        selectedQuote={selectedQuote}
        setQuote={setQuote}
        markdown={markdown}
        languageId={languageId}
        classes={classes}
        shouldSetQuoteOnClick
        index={index}
        setIndex={(v) => setIndex(v)}
        font={font}
      />
    ) : items[0] ? <LoadingScreen /> : (
      <>
        <EmptyScreen />
        <SnackBar
          openSnackBar={snackBar}
          snackText={snackText}
          setOpenSnackBar={setOpenSnackBar}
          setSnackText={setSnackText}
          error={notify}
        />
      </>)
  );
}

export default ObsTnCard;
