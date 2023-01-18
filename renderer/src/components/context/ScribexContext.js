/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

export const ScribexContext = React.createContext();

const ScribexContextProvider = ({ children , editable = true}) => {
  const initialState = {
    sequenceIds: [],
    sectionable: false,
    blockable: true,
    editable,
    preview: false,
    verbose: false,
    graftSequenceId: null,
  };

  const [state, setState] = useState(initialState);

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

  const addSequenceId = useCallback(
    (_sequenceId) => {
      setSequenceIds([...state.sequenceIds, _sequenceId]);
    },
    [state.sequenceIds, setSequenceIds],
  );
  const actions = {
    setSectionable,
    setBlockable,
    setEditable,
    setPreview,
    setToggles,
    setSequenceIds,
    addSequenceId,
    setGraftSequenceId,
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
