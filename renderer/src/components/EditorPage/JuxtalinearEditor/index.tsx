import React, { useState, useContext, createContext, useEffect } from "react";
// import { ISentence, IChunk } from './types';

import Editor from '@/modules/editor/Editor';
import { setupIonicReact } from "@ionic/react"
import { useTranslation } from 'react-i18next';
import Home from "./pages/Home";
import { readBlobAsync } from '@/components/EditorPage/ObsEditor/core';

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"

/* Optional CSS utils that can be commented out */
// import "@ionic/react/css/padding.css"
// import "@ionic/react/css/float-elements.css"
// import "@ionic/react/css/text-alignment.css"
// import "@ionic/react/css/text-transformation.css"
// import "@ionic/react/css/flex-utils.css"
// import "@ionic/react/css/display.css"

/* Theme variables */
// import "./theme/variables.css"
import { Layout } from "./components/Layout"

setupIonicReact()

export const SentenceContext = createContext<ISentenceContext>({
  fileName: "",
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
})

const JuxtalinearEditor: React.FC = () => {
  const [fileName, setFileName] = useState("");
  const [sentences, setGlobalTotalSentences] = useState(
    new Array<ISentence>()
  )
  const [originText, setOriginText] = useState<string[]>([])
  const [itemArrays, setItemArrays] = useState<
    IChunk[][]
  >([])
  const [curIndex, setCurIndex] = useState(0)

  const setGlobalItemArrays = (index: number, itemArr: IChunk[]) => {
    const newItemArrays = [...itemArrays]
    newItemArrays[index] = itemArr
    setItemArrays(newItemArrays)
  }

  const setGlobalSentences = (index: number, sentence: ISentence) => {
    const newSentences = [...sentences]
    newSentences[index] = sentence
    setGlobalTotalSentences(newSentences)
  }

  return (
    <SentenceContext.Provider
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
      }}
    >
      <Layout>
          <Home />
      </Layout>
    </SentenceContext.Provider>
  );
}

export default JuxtalinearEditor
