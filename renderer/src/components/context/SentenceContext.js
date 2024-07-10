import React from 'react';
import PropTypes from 'prop-types';

export const SentenceContext = React.createContext();

const SentenceContextProvider = ({ children, value }) => {
  const context = value;

  return (
    <SentenceContext.Provider value={context}>
      {children}
    </SentenceContext.Provider>
  );
};
export default SentenceContextProvider;
SentenceContextProvider.propTypes = {
  children: PropTypes.node,
};
