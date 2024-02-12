import React from 'react';

const SentenceContext = React.createContext({
  fileName: '',
  sentences: [],
  originText: [],
  itemArrays: [[]],
  curIndex: 0,
  setFileName: () => {},
  setGlobalSentences: () => {},
  setOriginText: () => {},
  setGlobalTotalSentences: () => {},
  setGlobalItemArrays: () => {},
  setItemArrays: () => {},
  setCurIndex: () => {},
});

export default SentenceContext;
