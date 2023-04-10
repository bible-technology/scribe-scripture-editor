import { useEffect, useState, useContext } from 'react';
import { useProskomma, useImport, useCatalog } from 'proskomma-react-hooks';
import { useDeepCompareEffect } from 'use-deep-compare';
import usePerf from '@/components/hooks/scribex/usePerf';
import htmlMap from '@/components/hooks/scribex/htmlmap';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ScribexContext } from '@/components/context/ScribexContext';
import ReferenceEditor from './ReferenceEditor';

export default function ReferenceScribex(props) {

  const { state, actions } = useContext(ScribexContext);
  const { verbose } = state;
  const { usfmData, bookAvailable, refName, bookId, scrollLock } = props;
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
      // bookId,
      selectedFont,
      fontSize,
      projectScriptureDir,
    },
  } = useContext(ReferenceContext);

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
    refName,
  });

  useEffect(() => {
    actions.setSequenceIds([]);
  }, [refName, bookId, scrollLock])

  const { htmlPerf } = perfState;
  useDeepCompareEffect(() => {
    if (htmlPerf && htmlPerf.mainSequenceId !== state.sequenceIds[0]) {
      actions.setSequenceIds([htmlPerf?.mainSequenceId]);
    }
  }, [htmlPerf, state.sequenceIds, perfState, refName]);
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
      <div
        style={{
          fontFamily: selectedFont || 'sans-serif',
          fontSize: `${fontSize}rem`,
          lineHeight: (fontSize > 1.3) ? 1.5 : '',
          direction: `${projectScriptureDir === 'RTL' ? 'rtl' : 'auto'}`,
        }}
      >
        <ReferenceEditor {..._props} />
      </div>
    </>
  );
}
