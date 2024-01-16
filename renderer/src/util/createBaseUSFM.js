// function to create base USFM file based on provided scope and versification scheme
import * as logger from '../logger';

const grammar = require('usfm-grammar');

export async function createMergeBaseUSFMwithScope(incomingMeta, projectOrgPath) {
  logger.debug('createBaseUSFMwithScope.js', 'In createBaseUSFMwithScope');
  const fs = window.require('fs');
  const path = require('path');
  const currentScope = Object.keys(incomingMeta.type.flavorType.currentScope);

  // read versification json file from backend - ingredients/versification.json
  const versificationData = fs.readFileSync(path.join(projectOrgPath, 'ingredients/versification.json'));
  const versificationJson = JSON.parse(versificationData);

  return new Promise((resolve) => {
    const scopeUsfms = {};
    currentScope.forEach((scope) => {
      const list = versificationJson.maxVerses;
      if (list[scope]) {
        const chapters = [];
        (list[scope]).forEach((verse, i) => {
          let contents = [{ p: null }];
          const verses = [];
          for (let i = 1; i <= parseInt(verse, 10); i += 1) {
            verses.push({
              verseNumber: i.toString(),
              verseText: '',
              contents: ['...'], // adding default text to verses to show the beginning of verse.
            });
          }
          contents = contents.concat(verses);
          chapters.push({
            chapterNumber: (i + 1).toString(),
            contents,
          });
        });
        const usfm = {
          book: {
            bookCode: scope,
            meta: [{ h: scope }, [{ mt: [scope] }]],
          },
          chapters,
        };
        const myJsonParser = new grammar.JSONParser(usfm);
        const isJsonValid = myJsonParser.validate();
        if (isJsonValid) {
          const reCreatedUsfm = myJsonParser.toUSFM();
          scopeUsfms[scope] = reCreatedUsfm;

          if (Object.keys(scopeUsfms).length === currentScope.length) {
            resolve(scopeUsfms);
          }
        }
      }
    });
  });
}
