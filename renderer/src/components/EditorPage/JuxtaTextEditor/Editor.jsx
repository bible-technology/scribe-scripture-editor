/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from 'react';
import md5 from 'md5';

import LoadingScreen from '@/components/Loading/LoadingScreen';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ScribexContext } from '@/components/context/ScribexContext';
import EmptyScreen from '@/components/Loading/EmptySrceen';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { functionMapping } from './utils/insertFunctionMap';

// import RecursiveBlock from './RecursiveBlock';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { useAutoSaveIndication } from '@/hooks2/useAutoSaveIndication';
import { onIntersection } from './utils/IntersectionObserver';
import JuxtalinearEditor from '@/components/EditorPage/JuxtalinearEditor'; // eslint-disable-line
import SentenceContextProvider from '@/components/context/SentenceContext';
import { useReadJuxtaFile } from '@/components/EditorPage/JuxtaTextEditor/hooks/useReadJuxtaFile';
import { normalizeString } from '@/components/Projects/utils/updateJsonJuxta.js';
import { readUserSettings } from '@/core/projects/userSettings';

export default function Editor(props) {
  const {
    sequenceIds,
    isSaving,
    htmlPerf,
    // sectionable,
    // blockable,
    // editable,
    // preview,
    // verbose,
    bookChange,
    setBookChange,
    // addSequenceId,
    // saveHtmlPerf,
    // setGraftSequenceId,
    setChapterNumber,
    setVerseNumber,
    triggerVerseInsert,
    juxtaMode,
    setJuxtaMode,
  } = props;

  const {
    state: {
      chapter, selectedFont, fontSize, projectScriptureDir,
    },
  } = useContext(ReferenceContext);

  const { usfmData, bookAvailable, readFileName } = useReadJuxtaFile();
  const [jsonFileContent, setJsonFileContent] = useState(null);

  const [zoomLeftJuxtalign, setZoomLeftJuxtalign] = useState(24);
  const [zoomRightJuxtalign, setZoomRightJuxtalign] = useState(24);

  const {
    states: { openSideBar, scrollLock },
    actions: { setOpenSideBar, setSideBarTab },
  } = useContext(ProjectContext);

  const {
    state: {
      caretPosition, insertType, selectedText, numberToInsert, textToInsert,
    },
    actions: {
      setCaretPosition, setSelectedText, setNumberToInsert, setTextToInsert, setInsertType,
    },
  } = useContext(ScribexContext);

  const sequenceId = sequenceIds.at(-1);
  const style = isSaving ? { cursor: 'progress' } : {};

  const [fileName, setFileName] = useState('');
  const [helpAldearyOpenedOnce, setHelpAldearyOpenedOnce] = useState(false);
  const [sentences, setGlobalTotalSentences] = useState(
    new Array(),
  );
  const [originText, setOriginText] = useState([])
  const [itemArrays, setItemArrays] = useState([]);
  const [curIndex, setCurIndex] = useState(0);

  const [userSettingsJson, setUserSettingsJson] = useState(null);

  const setGlobalItemArrays = (index, itemArr) => {
    const newItemArrays = [...itemArrays];
    newItemArrays[index] = itemArr;
    setItemArrays(newItemArrays);
  }

  const setGlobalSentences = (index, sentence) => {
    const newSentences = [...sentences];
    newSentences[index] = sentence;
    setGlobalTotalSentences(newSentences);
  }

  useEffect(() => {
    setBookChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlPerf]);

  useEffect(() => { // temp fix to trigger rerender to cause onblcok trigger to save to file. Need to find a better way.
    if (insertType !== '') {
      insertType === 'insertVerseNumber' || insertType === 'insertChapterNumber'
        ? functionMapping[insertType].function({ caretPosition, numberToInsert })
        : functionMapping[insertType].function({ caretPosition, textToInsert, selectedText });
      setNumberToInsert('');
      setTextToInsert('');
      setInsertType('');
      setSelectedText(null);
      setCaretPosition(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerVerseInsert]);

  useEffect(() => {
    async function getUserSettings() {
      console.log("function Called!")
      if (!userSettingsJson) {
        console.log("userSettingsJson updated!")
        let tmpUsrSet = await readUserSettings();
        setHelpAldearyOpenedOnce(true);
        setUserSettingsJson(tmpUsrSet);
      }
    }
    console.log("useEffect!")
    getUserSettings();
  }, [helpAldearyOpenedOnce]);

  useAutoSaveIndication(isSaving);

  const remakeSentences = (stcs) => {
    let checksumSentences = '';
    let checksumChuncks = '';
    let currentCs = '';
    return stcs.map((stc) => {
      checksumChuncks = '';
      currentCs = '';
      const counts = {};
      const chunks = stc.chunks.filter(({ source }) => source[0]).map((chunk) => {
        const source = chunk.source.map((src) => {
          if (counts[src.content] === undefined) {
            counts[src.content] = 0;
          } else {
            counts[src.content] += 1;
          }
          return { ...src, index: counts[src.content] };
        });
        currentCs = md5(normalizeString(JSON.stringify(source) + chunk.gloss)) + '';
        checksumChuncks += currentCs;
        return {
          source,
          gloss: chunk.gloss,
          checksum: currentCs
        };
      });
      currentCs = md5(checksumChuncks) + '';
      checksumSentences += currentCs;
      return {
        originalSource: stc.originalSource,
        chunks,
        sourceString: stc.sourceString,
        checksum: checksumSentences
      };
    });
  };

  const getItems = (res = null) => {
    if (res !== null) {
      return res[0].chunks
        .map(({ source, gloss, checksum }, index) => {
          return {
            chunk: source
              .filter((s) => s)
              .map((s, n) => {
                return {
                  id: `item-${index * 1000 + n}`,
                  content: s.content,
                  index: s.index,
                };
              }),
            gloss,
            checksum,
          };
        })
        .filter(({ chunk }) => chunk.length);
    } else {
      return sentences[curIndex].chunks
        .map(({ source, gloss, checksum }, index) => {
          return {
            chunk: source
              .filter((s) => s)
              .map((s, n) => {
                return {
                  id: `item-${index * 1000 + n}`,
                  content: s.content,
                  index: s.index
                };
              }),
            gloss,
            checksum,
          };
        })
        .filter(({ chunk }) => chunk.length);
    }
  };

  const tryLoadSentences = () => {
    if (bookAvailable) {
      const resContent = JSON.parse(usfmData[0].data);
      setJsonFileContent(resContent);
      setFileName(readFileName);
      setCurIndex(curIndex);
      setGlobalTotalSentences(remakeSentences(resContent.sentences));
      setOriginText(resContent.sentences.map((sentence) => sentence.sourceString));
      if (resContent.sentences.length) {
        setItemArrays([getItems(resContent.sentences)]);
      }
    }
  }

  useEffect(() => {
    tryLoadSentences();
  }, [usfmData]);

  const observer = new IntersectionObserver((entries) => onIntersection({ setChapterNumber, scrollLock, entries }), {
    root: document.querySelector('editor'),
    threshold: 0,
    rootMargin: '0% 0% -60% 0%',
  });

  const watchNodes = document.querySelectorAll('.editor .chapter');
  const watchArr = Array.from(watchNodes);
  const reverseArray = watchArr.length > 0 ? watchArr.slice().reverse() : [];
  reverseArray.forEach((chapter) => { observer.observe(chapter); });

  // const _props = {
  //   htmlPerf,
  //   onHtmlPerf: saveHtmlPerf,
  //   chapterIndex: chapter,
  //   sequenceIds,
  //   addSequenceId,
  //   components: {
  //     block: (__props) => RecursiveBlock({
  //       htmlPerf, onHtmlPerf: saveHtmlPerf, sequenceIds, addSequenceId, onReferenceSelected, setCaretPosition, setSelectedText, ...__props,
  //     }),
  //   },
  //   options: {
  //     sectionable,
  //     blockable,
  //     editable,
  //     preview,
  //   },
  //   decorators: {},
  //   verbose,
  //   handlers,
  // };

  const _props = {
    bookAvailable,
    setChapterNumber,
    setVerseNumber,
    bookChange,
    setBookChange,
    juxtaMode,
  };

  return (
    <div
      style={{
        fontFamily: selectedFont || 'sans-serif',
        fontSize: `${fontSize}rem`,
        lineHeight: (fontSize > 1.3) ? 1.5 : '',
        direction: `${projectScriptureDir === 'RTL' ? 'rtl' : 'auto'}`,
      }}
      className="border-l-2 border-r-2 border-secondary pb-16 overflow-auto h-full scrollbars-width leading-8"
    >
      <div id="editor" style={style}>
        {!bookAvailable && <EmptyScreen />}
        {bookAvailable && sentences.length <= 0 && <LoadingScreen />}
        {bookAvailable && sentences.length > 0 && (
          <SentenceContextProvider
            value={{
              fileName,
              sentences,
              originText,
              itemArrays,
              curIndex,
              jsonFileContent,
              helpAldearyOpenedOnce,
              zoomLeftJuxtalign,
              zoomRightJuxtalign,
              userSettingsJson,
              setFileName,
              setGlobalSentences,
              setOriginText,
              setGlobalTotalSentences,
              setGlobalItemArrays,
              setItemArrays,
              setCurIndex,
              setChapterNumber,
              setVerseNumber,
              setJsonFileContent,
              setHelpAldearyOpenedOnce,
              setZoomLeftJuxtalign,
              setZoomRightJuxtalign,
              setUserSettingsJson,
              getItems,
            }}
          >
            <JuxtalinearEditor {..._props} />
          </SentenceContextProvider>
        )}
      </div>
    </div>
  );
}
