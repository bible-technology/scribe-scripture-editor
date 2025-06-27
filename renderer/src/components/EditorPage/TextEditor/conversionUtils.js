import { USFMParser, Validator } from 'usfm-grammar-web';

let usfmParserInstance;
let usfmParserInitialized;
let validatorInstance;
let validatorInitialized;

export async function initializeParser(usfm = null, usj = null) {
  if (!usfmParserInitialized) {
    usfmParserInitialized = await USFMParser.init(
      'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0/tree-sitter-usfm.wasm',
      'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0/tree-sitter.wasm',
    );
  }
  await usfmParserInitialized;
  if (usfm) {
    usfmParserInstance = new USFMParser(usfm);
  } else if (usj) {
    usfmParserInstance = new USFMParser(null, usj);
  }
  return usfmParserInstance;
}

export async function initializeValidator() {
  if (!validatorInitialized) {
    validatorInitialized = await Validator.init(
      'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-beta.16/tree-sitter-usfm.wasm',
      'https://cdn.jsdelivr.net/npm/usfm-grammar-web@3.0.0-beta.16/tree-sitter.wasm',
    );
  }
  await validatorInitialized;
  validatorInstance = new Validator();
  return validatorInstance;
}
export async function convertUsfmToUsj(usfm) {
  usfmParserInstance = await initializeParser(usfm, null);
  try {
    const usj = usfmParserInstance.toUSJ();
    console.log('converting', { usj });
    return { usj };
  } catch (e) {
    return { usj: { content: [] }, error: e };
  }
}

export async function convertUsjToUsfm(usj) {
  usfmParserInstance = await initializeParser(null, usj);
  // }
  const usfm = usfmParserInstance.usfm;
  return usfm;
}

export async function validateUsfm(usfm) {
  validatorInstance = await initializeValidator();

  try {
    let isValid = validatorInstance.isValidUSFM(usfm);
    if (isValid) {
      return { isValid, validUSFM: usfm };
    }
    const validUSFM = validatorInstance.autoFixUSFM(usfm);
    isValid = validatorInstance.isValidUSFM(validUSFM);
    return { isValid, validUSFM };
  } catch (e) {
    return { isValid: false, error: e };
  }
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

initializeValidator().then(() => {
  // eslint-disable-next-line no-console
  console.log('USFM Validator initialized successfully');
}).catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error initializing USFM Validator:', err);
});
