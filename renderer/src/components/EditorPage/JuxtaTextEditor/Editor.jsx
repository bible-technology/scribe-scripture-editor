/* eslint-disable no-unused-vars */
import React, { useContext, useEffect } from 'react';

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
import JuxtAlignEditor from '@/components/EditorPage/JuxtAlignEditor'; // eslint-disable-line
import JuxtalinearEditor from '@/components/EditorPage/JuxtalinearEditor'; // eslint-disable-line

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
    bookAvailable,
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

  // const handlers = {
  //   onBlockClick: ({ element }) => {
  //     const _sequenceId = element.dataset.target;
  //     const { tagName } = element;
  //     if (_sequenceId) {
  //       if (tagName === 'SPAN' && element.dataset.subtype === 'footnote') {
  //         setGraftSequenceId(_sequenceId);
  //         setOpenSideBar(!openSideBar);
  //         setSideBarTab('footnotes');
  //       }
  //       if (tagName === 'SPAN' && element.dataset.subtype === 'xref') {
  //         setGraftSequenceId(_sequenceId);
  //         setOpenSideBar(!openSideBar);
  //         setSideBarTab('xref');
  //       }
  //     } else {
  //       setSideBarTab('');
  //       setGraftSequenceId(null);
  //     }
  //   },
  // };
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

  useAutoSaveIndication(isSaving);

  // function onReferenceSelected({ chapter, verse }) {
  //   chapter && setChapterNumber(chapter);
  //   verse && setVerseNumber(verse);
  // }

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
        {/* {!bookAvailable && <EmptyScreen />}
        {bookAvailable && (!sequenceId || bookChange) && <LoadingScreen />}
        {bookAvailable && sequenceId && !bookChange && (
        )} */}
        <JuxtalinearEditor {..._props} />
      </div>
    </div>
  );
}
