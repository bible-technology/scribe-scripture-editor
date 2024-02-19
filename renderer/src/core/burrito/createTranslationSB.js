import moment from 'moment';
import burrito from '../../lib/BurritoTemplate.json';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import { updateVersion } from './updateTranslationSB';

const createTranslationSB = (
username,
projectFields,
selectedScope,
language,
langCode,
direction,
copyright,
id,
project,
call,
update,
) => {
  logger.debug('createTranslationSB.js', 'In createTranslationSB');
  const localizedNames = {};
  return new Promise((resolve) => {
    let json = {};
    if (call === 'edit') {
      json = project;
      delete json.project;
      delete json.version;
      if (update) {
        json = updateVersion(json);
      }
    } else {
      json = burrito;
    }
    json.meta.generator.userName = username;
    json.meta.generator.softwareVersion = packageInfo.version;
    if (call !== 'edit') {
      json.meta.dateCreated = moment().format();
    }
    json.identification.primary = {
      scribe: {
        [id]: {
        revision: '1',
        timestamp: moment().format(),
        },
      },
    };
    json.languages[0].tag = langCode;
    json.languages[0].scriptDirection = direction?.toLowerCase();
    json.identification.name.en = projectFields.projectName;
    json.identification.abbreviation.en = projectFields.abbreviation;
    json.languages[0].name.en = language;
    if (call === 'edit' && project?.copyright?.shortStatements && (copyright.licence).length <= 500) {
      json.copyright.shortStatements[0].statement = copyright.licence;
    } else {
      json.copyright.licenses[0].ingredient = 'license.md';
    }
    selectedScope.forEach((scope) => {
      json.type.flavorType.currentScope[scope] = [];
      localizedNames[scope] = json.localizedNames[scope];
    });
    json.localizedNames = localizedNames;
    logger.debug('createTranslationSB.js', 'Created the Translation SB');
    resolve(json);
  });
};
export default createTranslationSB;
