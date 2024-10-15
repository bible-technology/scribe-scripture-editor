import USFMParser from 'sj-usfm-grammar';

let usfmParserInstance;
let usfmParserInitialized;

export async function initializeParser() {
  if (!usfmParserInstance) {
    if (!usfmParserInitialized) {
      usfmParserInitialized = await USFMParser.init();
    }
    await usfmParserInitialized;
    usfmParserInstance = new USFMParser();
  }
  return usfmParserInstance;
}

export async function convertUsfmToUsj(usfm) {
  if (!usfmParserInstance) {
    usfmParserInstance = await initializeParser();
  }
  try {
    const usj = usfmParserInstance.usfmToUsj(usfm);
    return { usj };
  } catch (e) {
    return { usj: { content: [] }, error: e };
  }
}

export async function convertUsjToUsfm(usj) {
  if (!usfmParserInstance) {
    usfmParserInstance = await initializeParser();
  }
  const usfm = usfmParserInstance.usjToUsfm(usj);
  return usfm;
}

initializeParser()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('USFM Parser initialized successfully');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error initializing USFM Parser:', err);
  });
