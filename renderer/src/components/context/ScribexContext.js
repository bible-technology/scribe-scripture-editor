/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export const ScribexContext = React.createContext();

const ScribexContextProvider = ({
 children, editable = true, reference = false, font,
}) => {
  const initialState = {
    sequenceIds: [],
    sectionable: false,
    blockable: true,
    editable,
    preview: false,
    verbose: false,
    graftSequenceId: null,
    reference,
    font,
    caretPosition: 0,
    textToInsert: '',
    numberToInsert: '',
    selectedText: null,
  };

  const [state, setState] = useState(initialState);

  const setFont = useCallback((font) => {
    setState((prev) => ({ ...prev, font }));
  }, []);

  const setSectionable = useCallback((sectionable) => {
    setState((prev) => ({ ...prev, sectionable }));
  }, []);

  const setBlockable = useCallback((blockable) => {
    setState((prev) => ({ ...prev, blockable }));
  }, []);

  const setEditable = useCallback((editable) => {
    setState((prev) => ({ ...prev, editable }));
  }, []);

  const setPreview = useCallback((preview) => {
    setState((prev) => ({ ...prev, preview }));
  }, []);

  const setToggles = useCallback((toggles) => {
    setState((prev) => ({ ...prev, ...toggles }));
  }, []);

  const setSequenceIds = useCallback((sequenceIds) => {
    setState((prev) => ({ ...prev, sequenceIds }));
  }, []);

  const setGraftSequenceId = useCallback((graftSequenceId) => {
    setState((prev) => ({ ...prev, graftSequenceId }));
  }, []);

  const setCaretPosition = useCallback((caretPosition) => {
    setState((prev) => ({ ...prev, caretPosition }));
  }, []);

  const setTextToInsert = useCallback((textToInsert) => {
    setState((prev) => ({ ...prev, textToInsert }));
  }, []);

  const setNumberToInsert = useCallback((numberToInsert) => {
    console.log('setstaqte', { numberToInsert });
    setState((prev) => ({ ...prev, numberToInsert }));
  }, []);

  const setSelectedText = useCallback((selectedText) => {
    setState((prev) => ({ ...prev, selectedText }));
  }, []);

  const addSequenceId = useCallback(
    (_sequenceId) => {
      setSequenceIds([...state.sequenceIds, _sequenceId]);
    },
    [state.sequenceIds, setSequenceIds],
  );
  const actions = {
    setFont,
    setSectionable,
    setBlockable,
    setEditable,
    setPreview,
    setToggles,
    setSequenceIds,
    addSequenceId,
    setGraftSequenceId,
    setCaretPosition,
    setTextToInsert,
    setNumberToInsert,
    setSelectedText,
  };

  const context = {
    state,
    actions,
  };

  return <ScribexContext.Provider value={context}>{children}</ScribexContext.Provider>;
};
export default ScribexContextProvider;
ScribexContextProvider.propTypes = {
  children: PropTypes.node,
};
