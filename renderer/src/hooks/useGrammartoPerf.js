import React, { useEffect, useState } from 'react';
import { useProskomma, useImport, useCatalog } from 'proskomma-react-hooks';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import EpiteleteHtml from 'epitelete-html';
import usePerf from '../components/EditorPage/TextEditor/hooks/usePerf';
import htmlMap from '../components/EditorPage/TextEditor/hooks/htmlmap';

export const useGrammartoPerf = (perfArr = [], selectedBook = '') => {
  let selectedDocument;
  let refName;

  console.log({ perfArr });

  const { proskomma, stateId, newStateId } = useProskomma({ verbose: false });

  console.log({ proskomma, stateId, newStateId });

  const { done } = useImport({
    proskomma,
    stateId,
    newStateId,
    documents: perfArr,
  });

  console.log({ done });

  const { catalog } = useCatalog({ proskomma, stateId, verbose: false });
  const { id: docSetId, documents } = (done && catalog.docSets[0]) || {}; // why documents no getting -----------------------

  console.log(' ----------------- ------------ >', { catalog, docSetId, documents });

  if (done) {
    selectedDocument = documents?.find(
      (doc) => {
        console.log('finidng book code ===> ', doc.bookCode, selectedBook);
        return doc.bookCode === selectedBook;
      },
    );
  }

  console.log({ selectedDocument });

  const { bookCode, h: bookName } = selectedDocument || {};
  const ready = (docSetId && bookCode) || false;

  console.log({ bookCode, ready });

  const epiteleteHtml = useDeepCompareMemo(
    () => ready
      && new EpiteleteHtml({
        proskomma,
        docSetId,
        htmlMap,
        options: { historySize: 100 },
      }),
    [proskomma, ready, docSetId, refName],
  );

  useDeepCompareEffect(() => {
    console.log('Triggering useDeepCompareEffect ==========> ');
    if (epiteleteHtml) {
      console.log('Insde useDeepCompareEffect ......................', bookCode);
      const fs = window.require('fs');
      epiteleteHtml.readHtml(bookCode, { cloning: false }, htmlMap).then(async (_htmlPerf) => {
        console.log('INSIDE READ HTML =============> ', _htmlPerf);
        const usfmPerfString = await epiteleteHtml?.readUsfm(bookCode);
        await fs.writeFileSync('testedUSFMTIT.usfm', usfmPerfString);
        console.log(' ============> ', usfmPerfString);
        // remove htmlMap for default classes
      });
    }
  }, [epiteleteHtml, bookCode]);
};
