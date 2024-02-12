interface IWorkspace {
  [key: string]: any
}

interface IOutput {
  [key: string]: Array<
    Array<{
      [key: string]: any
    }>
  >
  sentences: ISentence[]
}

interface IContext {
  sequences: any
}

interface ISource {
  content: string
  cv: string
  lemma: Array<string>
  morph: Array<string>
  occurence: number
  occurences: number
  strong: Array<string>
  id: string
  index?: number
}

interface ISentence {
  originalSource?: ISource[],
  chunks: {
    source: ISource[]
    gloss: string
  }[]
  sourceString: string
}

interface ISentenceContext {
  fileName: string
  sentences: ISentence[]
  originText: string[]
  itemArrays: IChunk[][]
  curIndex: number
  setFileName: (name: string) => void
  setGlobalSentences: (index: number, sentence: ISentence) => void
  setOriginText: (origin: string[]) => void
  setGlobalTotalSentences: (sentences: ISentence[]) => void
  setGlobalItemArrays: (index: number, itemArrays: IChunk[]) => void
  setItemArrays: (itemArrays: IChunk[][]) => void
  setCurIndex: (curIndex: number) => void
}

interface IChunk {
  chunk: {
    id: string
    content: string
    index?: number
  }[]
  gloss: string
}
