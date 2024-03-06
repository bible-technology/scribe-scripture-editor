import React, { useState } from 'react';

// import { setupIonicReact } from '@ionic/react'
// import { useTranslation } from 'react-i18next';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
// import '@ionic/react/css/core.css';

import { Layout } from './components/Layout';
import SentenceContextProvider from '@/components/context/SentenceContext';
// import { ISentence, IChunk } from './types';

// setupIonicReact();

// export const SentenceContext = createContext<ISentenceContext>({
//   fileName: '',
//   sentences: [],
//   originText: [],
//   itemArrays: [[]],
//   curIndex: 0,
//   setFileName: () => {},
//   setGlobalSentences: () => {},
//   setOriginText: () => {},
//   setGlobalTotalSentences: () => {},
//   setGlobalItemArrays: () => {},
//   setItemArrays: () => {},
//   setCurIndex: () => {},
// })

const JuxtalinearEditor: React.FC<any> = ({
  bookAvailable,
  setChapterNumber,
  setVerseNumber,
  bookChange,
  setBookChange,
}) => {
  const [fileName, setFileName] = useState('');
  const [sentences, setGlobalTotalSentences] = useState(
    new Array<ISentence>(),
  );
  const [originText, setOriginText] = useState<string[]>([])
  const [itemArrays, setItemArrays] = useState<
    IChunk[][]
  >([]);
  const [curIndex, setCurIndex] = useState(0);

  const setGlobalItemArrays = (index: number, itemArr: IChunk[]) => {
    const newItemArrays = [...itemArrays];
    newItemArrays[index] = itemArr;
    setItemArrays(newItemArrays);
  }

  const setGlobalSentences = (index: number, sentence: ISentence) => {
    const newSentences = [...sentences];
    newSentences[index] = sentence;
    setGlobalTotalSentences(newSentences);
  }

  return (
    <SentenceContextProvider
      value={{
        fileName,
        sentences,
        originText,
        itemArrays,
        curIndex,
        setFileName,
        setGlobalSentences,
        setOriginText,
        setGlobalTotalSentences,
        setGlobalItemArrays,
        setItemArrays,
        setCurIndex,
        setChapterNumber,
        setVerseNumber,
      }}
    >
      <Layout>
        <Home />
      </Layout>
    </SentenceContextProvider>
  );
};

export default JuxtalinearEditor;
