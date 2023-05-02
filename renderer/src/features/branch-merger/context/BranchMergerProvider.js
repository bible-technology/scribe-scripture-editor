import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import useBranchMerger from '../hooks/useBranchMerger';

export const BranchMergerContext = createContext();

const BranchMergerProvider = ({ children, server, owner, repo, userBranch, tokenid }) => {
  const {state,actions} = useBranchMerger({server, owner, repo, userBranch, tokenid})
  return (
    <BranchMergerContext.Provider value={{state,actions}}>
      {children}
    </BranchMergerContext.Provider>
  );
};

BranchMergerProvider.propTypes = {
  children: PropTypes.element,
  server: PropTypes.string,
  owner: PropTypes.string,
  repo: PropTypes.string,
  userBranch: PropTypes.string,
  tokenid: PropTypes.string,
};

export default BranchMergerProvider;
