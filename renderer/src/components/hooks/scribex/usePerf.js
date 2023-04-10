/* eslint-disable no-unused-vars */
import { useState, useTransition } from 'react';
import {
  useDeepCompareCallback,
  useDeepCompareEffect,
  useDeepCompareMemo,
} from 'use-deep-compare';
import isEqual from 'lodash.isequal';
import EpiteleteHtml from 'epitelete-html';
import { saveToFile } from './saveToFile';

export default function usePerf({
  proskomma,
  ready,
  docSetId,
  bookCode,
  verbose,
  htmlMap,
  refName,
}) {
  const [isSaving, startSaving] = useTransition();
  const [htmlPerf, setHtmlPerf] = useState();
  const [usfmText, setUsfmText] = useState();

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
    if (epiteleteHtml) {
      epiteleteHtml.readHtml(bookCode, { cloning: false }, htmlMap).then((_htmlPerf) => {
        // remove htmlMap for default classes
        setHtmlPerf(_htmlPerf);
      });
    }
  }, [epiteleteHtml, bookCode]);

  // exports perf to usfm and writes to file.
  const exportUsfm = async (bookCode) => {
    const usfmString = await epiteleteHtml?.readUsfm(bookCode);
    setUsfmText(usfmString);
    saveToFile(usfmString, bookCode);
  };

  const saveHtmlPerf = useDeepCompareCallback(
    (_htmlPerf, { sequenceId }) => {
      // (_htmlPerf, { sequenceId, sequenceHtml }) => {
      // _perfHtml.sequencesHtml[sequenceId] = sequenceHtml;

      if (!isEqual(htmlPerf, _htmlPerf)) { setHtmlPerf(_htmlPerf); }

      startSaving(async () => {
        // const startSaving = async () => {
        const newHtmlPerf = await epiteleteHtml?.writeHtml(
          bookCode,
          sequenceId,
          _htmlPerf,
        );
        // if (verbose) { console.log({ info: 'Saved sequenceId', bookCode, sequenceId }); }

        if (!isEqual(htmlPerf, newHtmlPerf)) { setHtmlPerf(newHtmlPerf); }
        exportUsfm(bookCode);
      });
      // startSaving();
    },
    [htmlPerf, bookCode],
  );

  const undo = async () => {
    const newPerfHtml = await epiteleteHtml?.undoHtml(bookCode);
    setHtmlPerf(newPerfHtml);
  };

  const redo = async () => {
    const newPerfHtml = await epiteleteHtml?.redoHtml(bookCode);
    setHtmlPerf(newPerfHtml);
  };

  const canUndo = (epiteleteHtml?.canUndo && epiteleteHtml?.canUndo(bookCode)) || false;
  const canRedo = (epiteleteHtml?.canRedo && epiteleteHtml?.canRedo(bookCode)) || false;

  const state = {
    bookCode,
    htmlPerf,
    canUndo,
    canRedo,
    isSaving,
    usfmText,
  };

  const actions = {
    saveHtmlPerf,
    exportUsfm,
    undo,
    redo,
  };

  return { state, actions };
}
