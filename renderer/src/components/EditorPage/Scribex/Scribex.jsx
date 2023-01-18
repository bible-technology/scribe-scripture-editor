import { useEffect, useState, useContext } from 'react';
import { useProskomma, useImport, useCatalog } from 'proskomma-react-hooks';
import { useDeepCompareEffect } from 'use-deep-compare';
import { LockClosedIcon, BookmarkIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import BibleNavigationX from '@/modules/biblenavigation/BibleNavigationX';
import usePerf from '@/components/hooks/scribex/usePerf';
import htmlMap from '@/components/hooks/scribex/htmlmap';
import { ScribexContext } from '@/components/context/ScribexContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EditorSideBar from '@/modules/editorsidebar/EditorSideBar';
import Buttons from './Buttons';
import Editor from './Editor';

export default function Scribex(props) {
  const { state, actions } = useContext(ScribexContext);
  const { verbose } = state;
  const { usfmData, bookAvailable } = props;
  const [selectedBook, setSelectedBook] = useState();
  const [bookChange, setBookChange] = useState(false);
  let selectedDocument;

  const { proskomma, stateId, newStateId } = useProskomma({ verbose });
  const { done } = useImport({
    proskomma,
    stateId,
    newStateId,
    documents: usfmData,
  });
  const {
    state: {
      bookId,
      selectedFont,
      fontSize,
      projectScriptureDir,

    },
  } = useContext(ReferenceContext);
  const {
    states: {
      scrollLock,
    },
    actions: {
      setScrollLock,
    },
  } = useContext(ProjectContext);

  const {
    states: { openSideBar },
    actions: { setOpenSideBar },
  } = useContext(ProjectContext);

  function closeSideBar(open) {
    setOpenSideBar(open);
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
    isLoading,
    bookName,
    bookChange,
    bookAvailable,
    setBookChange,
  };
  return (
    <>
      <EditorSideBar
        isOpen={openSideBar}
        closeSideBar={closeSideBar}
        footnoteProps={_props}
      />
      <div className="flex flex-col bg-white border-b-2 border-secondary h-editor rounded-md shadow scrollbar-width">
        <div className="flex flex-wrap items-center mt-1 justify-between bg-secondary ">
          {/* <div className="bg-white border-b-2 border-secondary rounded-md shadow h-editor overflow-hidden">
        <div className="flex items-center justify-between bg-secondary rounded-t-md overflow-hidden sticky top-0 left-0 right-0"> */}
          <BibleNavigationX />
          <div
            aria-label="editor-pane"
            className="h-4 flex flex-1 justify-center text-white text-xxs uppercase tracking-wider font-bold leading-3 truncate"
          >
            Editor
          </div>
          <div className="flex items-center">
            <Buttons {..._props} />
          </div>
          <div
            title="navigation lock/unlock"
            className="flex items-center"
          >
            <div>
              {scrollLock === true ? (
                <LockOpenIcon
                  aria-label="open-lock"
                  className="h-5 mr-2 w-5 text-white cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setScrollLock(!scrollLock)}
                />) : (<LockClosedIcon
                  aria-label="close-lock"
                  className="h-5 mr-2 w-5 text-white cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setScrollLock(!scrollLock)}
                />)}
            </div>
            <div
              role="button"
              tabIndex="0"
              title="bookmark"
              className="mx-1 px-2 focus:outline-none border-r-2 border-l-2 border-white border-opacity-10"
            >
              <BookmarkIcon
                className="h-5 mr-2 w-5 text-white cursor-pointer"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: selectedFont || 'sans-serif',
            fontSize: `${fontSize}rem`,
            lineHeight: (fontSize > 1.3) ? 1.5 : '',
            direction: `${projectScriptureDir === 'RTL' ? 'rtl' : 'auto'}`,
          }}
          className="border-l-2 border-r-2 border-secondary pb-16 prose-sm max-w-none overflow-auto h-full scrollbars-width"
        >
          <Editor {..._props} />
        </div>
      </div>
    </>
  );
}
