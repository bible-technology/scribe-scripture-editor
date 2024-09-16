import * as localForage from 'localforage';
import { v5 as uuidv5 } from 'uuid';
import moment from 'moment';
import languages from '../../lib/lang/langNames.json';
import * as logger from '../../logger';
import { environment } from '../../../environment';
import { readUserSettings, saveUserSettings } from './userSettings';

export const getLanguageDirection = (languageCode) => {
  logger.debug('languageUtil.js', 'In getLanguageDirection for fetching the direction using language code');
  const scriptureDirection = languages.find((l) => l.lc === languageCode);
  return scriptureDirection?.ld;
};
export const getScriptureDirection = async (projectName) => {
  logger.debug('languageUtil.js', 'In getScriptureDirection for fetching the direction using language code from burrito');
  let languageCode;
  let scriptureDirection;
  // Fetching the resource details from the LocalForage
  await localForage.getItem('resources')
    .then((refs) => {
      logger.debug('languageUtil.js', 'In getScriptureDirection:- fetching burrito data');
      const projectDetails = refs.find((o) => o.projectDir === projectName);
      languageCode = projectDetails?.value?.languages[0]?.tag;
    });
  if (languageCode) {
    logger.debug('languageUtil.js', 'In getScriptureDirection:- fetching langauge code from burrito');
    scriptureDirection = getLanguageDirection(languageCode);
  }
  return scriptureDirection;
};

// check language code or language name exist in the array of object and return the status
export const checkLangNameAndCodeExist = async (languages, lang, langcode, langKey, codeKey) => {
  logger.debug('languageUtil.js', 'in check language and code exist');
  const check = { name: { status: false, message: '' }, code: { status: false, message: '' } };
  await languages.forEach((l) => {
    if (l[langKey].toLowerCase() === lang.toLowerCase()) {
      check.name = { status: true, message: 'Language Name is existing' };
    } if (l[codeKey] === langcode.toLowerCase()) {
      check.code = { status: true, message: 'Language Code is existing' };
    }
  });
  if (check) {
    return check;
  }
};

// check and create language in user settings if burrito language not exist in json / custom on import
export const checkAndAddLanguageToCustom = async (metaData, concatedLangs) => {
  try {
    logger.debug('languageUtil.js', 'add custom language from metaData to backend if not exising');
    const metaLangObj = metaData.languages[metaData.languages.length - 1];
    // check lang and code exist or not
    const result = await checkLangNameAndCodeExist(concatedLangs, metaLangObj.name.en, metaLangObj.tag, 'ang', 'lc');
    if (!result.name.status && !result.code.status) {
      // create language in for backend and UUID
      const key = metaLangObj.name.en + metaLangObj.tag + moment().format();
      const id = uuidv5(key, environment.uuidToken);
      const newLangObj = {
        title: metaLangObj.name.en,
        id,
        scriptDirection: metaLangObj.scriptDirection,
        langCode: metaLangObj.tag,
        custom: true,
      };
      // read user settings
      const userSettngsJson = await readUserSettings();
      // append new lang object in older format to backend
      if (userSettngsJson) {
        userSettngsJson.history.languages.push(newLangObj);
        // write file back
        await saveUserSettings(userSettngsJson);
        logger.debug('languageUtil.js', 'Language added succeessfully');
      }
    }
  } catch (err) {
    logger.debug('languageUtil.js', `error in adding language : ${err}`);
    throw new Error(err?.message || err);
  }
};
