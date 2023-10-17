/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import useSync from '../Sync/hooks/useSync';

export const SyncContext = createContext();

const SyncContextProvider = ({ children }) => {
  const { state, actions } = useSync();
  const context = {
    states: state,
    action: actions,
  };
  return (
    <SyncContext.Provider value={context}>
      {children}
    </SyncContext.Provider>
  );
};
export default SyncContextProvider;
SyncContextProvider.propTypes = {
  children: PropTypes.node,
};
