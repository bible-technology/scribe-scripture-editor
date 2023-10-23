import {
  useEffect, useState, useContext, Fragment,
} from 'react';
import { useProskomma, useImport, useCatalog } from 'proskomma-react-hooks';
import { useDeepCompareEffect } from 'use-deep-compare';
import { ScribexContext } from '@/components/context/ScribexContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EditorSideBar from '@/modules/editorsidebar/EditorSideBar';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import htmlMap from './hooks/htmlmap';
import usePerf from './hooks/usePerf';
import EditorMenuBar from './EditorMenuBar';
import Editor from './Editor';

export default function TextEditor() {
  const { state, actions } = useContext(ScribexContext);
  const { verbose } = state;
  // const { usfmData, bookAvailable } = props;
  const [selectedBook, setSelectedBook] = useState();
  const [bookChange, setBookChange] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(1);
  const [verseNumber, setVerseNumber] = useState(1);
  const [triggerVerseInsert, setTriggerVerseInsert] = useState(false);
  const [newVerChapNumber, setInsertNumber] = useState('');
  const [insertVerseRChapter, setInsertVerseRChapter] = useState('');
  const [selectedText, setSelectedText] = useState();

  const { usfmData, bookAvailable } = useReadUsfmFile();

  const {
    state: {
      bookId,
    },
    actions: { setSelectedFont },
  } = useContext(ReferenceContext);

  const {
    states: { openSideBar },
    actions: { setOpenSideBar },
  } = useContext(ProjectContext);

  let selectedDocument;

  const { proskomma, stateId, newStateId } = useProskomma({ verbose });
  const { done } = useImport({
    proskomma,
    stateId,
    newStateId,
    documents: usfmData,
  });

  function closeSideBar(status) {
    setOpenSideBar(status);
  }

  useEffect(() => {
    setSelectedBook(bookId.toUpperCase());
    setBookChange(true);
  }, [bookId]);

  const { catalog } = useCatalog({ proskomma, stateId, verbose });
  const { id: docSetId, documents } = (done && catalog.docSets[0]) || {};
  if (done) {
    selectedDocument = documents?.find(
      (doc) => doc.bookCode === selectedBook,
    );
  }

  const { bookCode, h: bookName } = selectedDocument || {};
  const ready = (docSetId && bookCode) || false;
  const isLoading = !done || !ready;
  const { state: perfState, actions: perfActions } = usePerf({
    proskomma,
    ready,
    docSetId,
    bookCode,
    verbose,
    htmlMap,
  });
  const { htmlPerf } = perfState;

  useDeepCompareEffect(() => {
    if (htmlPerf && htmlPerf.mainSequenceId !== state.sequenceIds[0]) {
      actions.setSequenceIds([htmlPerf?.mainSequenceId]);
    }
  }, [htmlPerf, state.sequenceIds, perfState]);

  const _props = {
    ...state,
    ...perfState,
    ...actions,
    ...perfActions,
    triggerVerseInsert,
    chapterNumber,
    verseNumber,
    isLoading,
    bookName,
    bookChange,
    bookAvailable,
    setBookChange,
    setChapterNumber,
    setVerseNumber,
    newVerChapNumber,
    insertVerseRChapter,
    selectedText,
    setSelectedText,
    setTriggerVerseInsert,
    setSelectedFont,
    setInsertNumber,
    setInsertVerseRChapter,
  };
  return (
    <>
      <EditorSideBar
        isOpen={openSideBar}
        closeSideBar={closeSideBar}
        graftProps={_props}
      />
      <div className="flex flex-col bg-white border-b-2 border-secondary h-editor rounded-md shadow scrollbar-width">
        <EditorMenuBar {..._props} />
        <Editor {..._props} />
      </div>
    </>
  );
}
