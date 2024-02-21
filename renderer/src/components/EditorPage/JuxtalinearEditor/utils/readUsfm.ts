// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Proskomma } = require("proskomma-core")
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { SofriaRenderFromProskomma } = require("proskomma-json-tools");

// TODO : transferer cette fonction vers 
// => renderer/src/components/EditorPage/JuxtaTextEditor/hooks/useReadJuxtaFile.js 
// and call it into "renderer/src/components/Projects/ImportPopUp.js" line 178
export const readUsfm = (srcUsfm: string | undefined) => {
  const pk = new Proskomma()
  pk.importDocument({ lang: "grc", abbr: "ugnt" }, "usfm", srcUsfm)

  const actions = {
    startDocument: [
      {
        description: "Set up workspace",
        test: () => true,
        action: ({
          workspace,
          output,
        }: {
          workspace: IWorkspace
          output: IOutput
        }) => {
          output.sentences = []
          workspace.currentSentence = []
          workspace.currentAtts = null
          workspace.chapter = null
          workspace.verses = null
          workspace.occurrences = {}
          workspace.currentSentenceString = ""
        },
      },
    ],
    startChapter: [
      {
        description: "chapter",
        test: () => true,
        action: ({
          context,
          workspace,
        }: {
          context: IContext
          workspace: IWorkspace
        }) => {
          const element = context.sequences[0].element
          workspace.chapter = element.atts.number
        },
      },
    ],
    startVerses: [
      {
        description: "verses",
        test: () => true,
        action: ({
          context,
          workspace,
        }: {
          context: IContext
          workspace: IWorkspace
        }) => {
          const element = context.sequences[0].element
          workspace.verses = element.atts.number
        },
      },
    ],
    endChapter: [
      {
        description: "End chapter",
        test: () => true,
        action: ({ workspace }: { workspace: IWorkspace }) => {
          workspace.chapter = null
        },
      },
    ],
    endVerses: [
      {
        description: "End verses",
        test: () => true,
        action: ({
          workspace,
          output,
        }: {
          workspace: IWorkspace
          output: IOutput
        }) => {
          workspace.currentSentence
            .filter((w: IWorkspace) => !w.occurrences)
            .forEach(
              (w: IWorkspace) =>
                (w.occurrences = workspace.occurrences[w.lemma])
            )
          output.sentences
            .map((s: ISentence) =>
              s.chunks.map(
                // over each sentence chunk
                (sc) =>
                  sc.source.map(
                    // over each word object in a sentence chunk
                    (scw) => scw
                  )
              )
            )
            .forEach((s) =>
              s
                ?.filter((w: IWorkspace) => !w.occurrences)
                .forEach(
                  (w: IWorkspace) =>
                    (w.occurrences = workspace.occurrences[w.lemma])
                )
            )
          workspace.verses = null
          workspace.occurrences = {}
        },
      },
    ],
    startWrapper: [
      {
        description: "Get atts",
        test: ({ context }: { context: IContext }) =>
          context.sequences[0].element.subType === "usfm:w",
        action: ({
          context,
          workspace,
        }: {
          context: IContext
          workspace: IWorkspace
        }) => {
          const element = context.sequences[0].element
          workspace.currentAtts = element.atts
        },
      },
    ],
    endWrapper: [
      {
        description: "Clear atts",
        test: ({ context }: { context: IContext }) =>
          context.sequences[0].element.subType === "usfm:w",
        action: ({ workspace }: { workspace: IWorkspace }) => {
          workspace.currentAtts = null
        },
      },
    ],
    text: [
      {
        description: "Process text including end of sentence detection",
        test: () => true,
        action: ({
          workspace,
          context,
        }: {
          workspace: IWorkspace
          context: IContext
        }) => {
          const element = context.sequences[0].element
          workspace.currentSentenceString += element.text
          if (
            element.text.includes(".") ||
            element.text.includes("?") ||
            element.text.includes("!")
          ) {
            if (workspace.currentSentence.length > 0) {
              output.sentences.push({
                originalSource : workspace.currentSentence,
                chunks: [
                  {
                    checksum: "teoizjf",
                    source: workspace.currentSentence,
                    gloss: "",
                  },
                ],
                sourceString: workspace.currentSentenceString,
              })
              workspace.currentSentence = []
              workspace.currentSentenceString = ""
            }
          } else if (
            !element.text.includes(",") &&
            !element.text.includes(";") &&
            element.text.trim().length > 0 &&
            workspace.currentAtts
          ) {
            if (!workspace.occurrences[workspace.currentAtts.lemma]) {
              workspace.occurrences[workspace.currentAtts.lemma] = 0
            }
            workspace.occurrences[workspace.currentAtts.lemma]++
            workspace.currentSentence.push({
              content: element.text,
              lemma: workspace.currentAtts.lemma,
              strong: workspace.currentAtts.strong,
              morph: workspace.currentAtts["x-morph"],
              cv: `${workspace.chapter}:${workspace.verses}`,
              occurrence: workspace.occurrences[workspace.currentAtts.lemma],
            })
          }
        },
      },
    ],
    endDocument: [
      {
        description: "Postprocess sentences",
        test: () => true,
        action: () => {},
      },
    ],
  }

  const output: IOutput = { sentences: [] }
  const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions })
  const docId = pk.gqlQuerySync("{documents {id}}").data.documents[0].id
  cl.renderDocument({ docId, config: {}, output })
  // console.log(output.sentences)
  return output.sentences
}
