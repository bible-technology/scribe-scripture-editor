/* eslint-disable no-return-assign */
import { SofriaRenderFromProskomma } from 'proskomma-json-tools';
import { Proskomma } from 'proskomma-core';
import md5 from 'md5';
import xre from 'xregexp';

/**
 * Reads and processes a USFM file using Proskomma.
 *
 * @param {string} srcUsfm The USFM source text to be processed.
 * @returns The processed sentences from the USFM file.
 */
export const readUsfm = (srcUsfm, bookCode) => {
  const pk = new Proskomma();
  pk.importDocument({ lang: 'grc', abbr: 'ugnt' }, 'usfm', srcUsfm);

  const actions = {
    startDocument: [
      {
        description: 'Set up workspace',
        test: () => true,
        action: ({ workspace, output }) => {
          output.sentences = [];
          workspace.currentSentence = [];
          workspace.currentAtts = null;
          workspace.chapter = null;
          workspace.verses = null;
          workspace.occurrences = {};
          workspace.currentSentenceString = '';
        },
      },
    ],
    startChapter: [
      {
        description: 'chapter',
        test: () => true,
        action: ({ context, workspace }) => {
          const element = context.sequences[0].element;
          workspace.chapter = element.atts.number;
        },
      },
    ],
    startVerses: [
      {
        description: 'verses',
        test: () => true,
        action: ({ context, workspace }) => {
          const element = context.sequences[0].element;
          workspace.verses = element.atts.number;
        },
      },
    ],
    endChapter: [
      {
        description: 'End chapter',
        test: () => true,
        action: ({ workspace }) => {
          workspace.chapter = null;
        },
      },
    ],
    endVerses: [
      {
        description: 'End verses',
        test: () => true,
        action: ({ workspace, output }) => {
          workspace.currentSentence
            .filter((w) => !w.occurrences)
            .forEach((w) => (w.occurrences = workspace.occurrences[w.lemma]));
          output.sentences
            .map((s) => {
              s.checksum = md5(JSON.stringify(s.chunks));
              return s.chunks.map(
                (sc) => sc.source.map((scw) => scw),
              );
            })
            .forEach((s) => s?.filter((w) => !w.occurrences)
                .forEach((w) => (w.occurrences = workspace.occurrences[w.lemma])));
          workspace.verses = null;
          workspace.occurrences = {};
        },
      },
    ],
    startWrapper: [
      {
        description: 'Get atts',
        test: ({ context }) => context.sequences[0].element.subType === 'usfm:w',
        action: ({ context, workspace }) => {
          const element = context.sequences[0].element;
          workspace.currentAtts = element.atts;
        },
      },
    ],
    endWrapper: [
      {
        description: 'Clear atts',
        test: ({ context }) => context.sequences[0].element.subType === 'usfm:w',
        action: ({ workspace }) => {
          workspace.currentAtts = null;
        },
      },
    ],
    text: [
      {
        description: 'Process text including end of sentence detection',
        test: () => true,
        action: ({ workspace, context, output }) => {
          const element = context.sequences[0].element;
          workspace.currentSentenceString += element.text;
          const re = xre('[\u05c3]'); // hebrew line parsing
          const regText = xre.match(element.text, re, 'all');
          if (
            element.text.includes('.')
            || element.text.includes('?')
            || element.text.includes('!')
            || regText.length > 0
          ) {
            if (workspace.currentSentence.length > 0) {
              output.sentences.push({
                originalSource: workspace.currentSentence,
                chunks: [
                  {
                    checksum: md5(workspace.currentSentence),
                    source: workspace.currentSentence,
                    gloss: '',
                  },
                ],
                sourceString: workspace.currentSentenceString,
              });
              workspace.currentSentence = [];
              workspace.currentSentenceString = '';
            }
          } else if (
            !element.text.includes(',')
            && !element.text.includes(';')
            && element.text.trim().length > 0
            && workspace.currentAtts
          ) {
            if (!workspace.occurrences[workspace.currentAtts.lemma]) {
              workspace.occurrences[workspace.currentAtts.lemma] = 0;
            }
            workspace.occurrences[workspace.currentAtts.lemma] += 1;
            workspace.currentSentence.push({
              content: element.text,
              lemma: workspace.currentAtts.lemma,
              strong: workspace.currentAtts.strong,
              morph: workspace.currentAtts['x-morph'],
              cv: `${workspace.chapter}:${workspace.verses}`,
              occurrence: workspace.occurrences[workspace.currentAtts.lemma],
            });
          }
        },
      },
    ],
    endDocument: [
      {
        description: 'Postprocess sentences',
        test: () => true,
        action: () => {},
      },
    ],
  };

  const output = { checksum: '', bookCode, sentences: [] };
  const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions });
  const docId = pk.gqlQuerySync('{documents {id}}').data.documents[0].id;
  cl.renderDocument({ docId, config: {}, output });

  output.checksum = md5(JSON.stringify(output.sentences));
  return output;
};
