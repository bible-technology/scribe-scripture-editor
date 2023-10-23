import React, { useContext, useEffect, useState } from 'react';
import { HtmlPerfEditor } from '@xelah/type-perf-html';

import LoadingScreen from '@/components/Loading/LoadingScreen';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import {
  insertVerseNumber, insertChapterNumber, insertFootnote, insertXRef, insertHeading,
} from '@/util/cursorUtils';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { useAutoSaveIndication } from '@/hooks2/useAutoSaveIndication';
import RecursiveBlock from './RecursiveBlock';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { useIntersectionObserver } from './hooks/useIntersectionObserver';

export default function Editor(props) {
  const {
    sequenceIds,
    isSaving,
    htmlPerf,
    sectionable,
    blockable,
    editable,
    preview,
    verbose,
    bookChange,
    setBookChange,
    addSequenceId,
    saveHtmlPerf,
    setGraftSequenceId,
    bookAvailable,
    setChapterNumber,
    setVerseNumber,
    triggerVerseInsert,
    newVerChapNumber,
    insertVerseRChapter,
    selectedText,
    setSelectedText,
  } = props;

  const [caretPosition, setCaretPosition] = useState();
  const {
    state: {
      chapter, selectedFont, fontSize, projectScriptureDir,
    },
  } = useContext(ReferenceContext);

  const {
    states: { openSideBar, scrollLock },
    actions: { setOpenSideBar, setSideBarTab },
  } = useContext(ProjectContext);

  const sequenceId = sequenceIds.at(-1);
  const style = isSaving ? { cursor: 'progress' } : {};

  const handlers = {
    onBlockClick: ({ element }) => {
      const _sequenceId = element.dataset.target;
      const { tagName } = element;
      if (_sequenceId) {
        if (tagName === 'SPAN' && element.dataset.subtype === 'footnote') {
          setGraftSequenceId(_sequenceId);
          setOpenSideBar(!openSideBar);
          setSideBarTab('footnotes');
        }
        if (tagName === 'SPAN' && element.dataset.subtype === 'xref') {
          setGraftSequenceId(_sequenceId);
          setOpenSideBar(!openSideBar);
          setSideBarTab('xref');
        }
      } else {
        setSideBarTab('');
        setGraftSequenceId(null);
      }
    },
  };
  useEffect(() => {
    setBookChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlPerf]);

  useAutoSaveIndication(isSaving);

  function onReferenceSelected({ chapter, verse }) {
    chapter && setChapterNumber(chapter);
    verse && setVerseNumber(verse);
  }

  useEffect(() => {
    if (insertVerseRChapter === 'Verse') {
      insertVerseNumber(caretPosition, newVerChapNumber);
    }
    if (insertVerseRChapter === 'Chapter') {
      insertChapterNumber(caretPosition, newVerChapNumber);
    }
    if (insertVerseRChapter === 'Footnote') {
      insertFootnote(caretPosition, newVerChapNumber, selectedText);
    }
    if (insertVerseRChapter === 'Cross Reference') {
      insertXRef(caretPosition, newVerChapNumber, selectedText);
    }
    if (insertVerseRChapter === 'Section Heading') {
      insertHeading(caretPosition, newVerChapNumber, selectedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerVerseInsert]);

  // hook for autoscrolling to the current chapter
  useIntersectionObserver(scrollLock, setChapterNumber);

  const _props = {
    htmlPerf,
    onHtmlPerf: saveHtmlPerf,
    chapterIndex: chapter,
    sequenceIds,
    addSequenceId,
    components: {
      block: (__props) => RecursiveBlock({
        htmlPerf, onHtmlPerf: saveHtmlPerf, sequenceIds, addSequenceId, onReferenceSelected, setCaretPosition, setSelectedText, ...__props,
      }),
    },
    options: {
      sectionable,
      blockable,
      editable,
      preview,
    },
    decorators: {},
    verbose,
    handlers,
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
      <div className="editor" id="editor" style={style}>
        {!bookAvailable && <EmptyScreen />}
        {bookAvailable && (!sequenceId || bookChange) && <LoadingScreen />}
        {bookAvailable && sequenceId && !bookChange && (
          <HtmlPerfEditor {..._props} />
        )}
      </div>
    </div>
  );
}
