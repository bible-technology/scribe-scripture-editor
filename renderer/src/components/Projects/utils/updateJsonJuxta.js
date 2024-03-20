import md5 from 'md5';

export const normalizeString = (str) => str.replace(/(\r\n|\n|\r| )/gm, '');

/**
 * Transform an old json juxta format to the newest version.
 *
 * @param {string} srcJson The JSON source juxta to be processed.
 * @returns The processed sentences from the JSON file.
 */
export const updateJsonJuxta = (jsonString, bookCode) => {
  const srcJson = JSON.parse(jsonString);
  // check if it's the last version.
  // if it's good, we simply return the json
  if (typeof srcJson === 'object' && !srcJson[0] && typeof srcJson.bookCode === 'string' && srcJson.checksum) {
    return srcJson;
  }
  if (!/^[A-Z\d]{3}$/.test(bookCode)) {
    return { error: `Expected a Paratext-style book code, eg 'TIT' or '1CO', not '${bookCode}'` };
  }
  let checksumSentences = '';
  let checksumChuncks = '';
  let currentCs = '';

  // else : we update it
  const newSentences = srcJson.map((stc) => {
    checksumChuncks = '';
    currentCs = '';
    const chunks = stc.chunks.filter(({ source }) => source[0]).map((chunk) => {
      currentCs = md5(normalizeString(JSON.stringify(chunk.source) + chunk.gloss));
      checksumChuncks += currentCs;
      return {
        source: chunk.source,
        gloss: chunk.gloss,
        checksum: currentCs,
      };
    });
    currentCs = md5(checksumChuncks);
    checksumSentences += currentCs;
    return {
      originalSource: stc.originalSource ?? {},
      chunks,
      sourceString: stc.sourceString,
      checksum: currentCs,
    };
  });
  const output = { checksum: md5(checksumSentences), bookCode, sentences: newSentences };
  return output;
};
