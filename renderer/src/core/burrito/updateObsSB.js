import moment from 'moment';
import * as logger from '../../logger';
import burrito from '../../lib/OBSTemplete.json';
import packageInfo from '../../../../package.json';

const path = require('path');
const md5 = require('md5');

export const updateVersion = (metadata) => {
  // Upadting the burrito version from 0.3.0 to 1.0.0
  logger.debug('updateObsSB.js', 'In updateVersion for updating the burrito version.');
  const sb = metadata;
  sb.format = 'scripture burrito';
  sb.meta.version = burrito.meta.version;

  if (sb.copyright.fullStatementPlain) {
    sb.copyright.licenses = [{ ingredient: '' }];
    delete sb.copyright.fullStatementPlain;
    delete sb.copyright.publicDomain;
  }
  if (!sb.meta.defaultLocale) {
    sb.meta.defaultLocale = sb.meta.defaultLanguage;
    delete sb.meta.defaultLanguage;
  }

  // delete sb.type.flavorType.canonSpec;
  // delete sb.type.flavorType.canonType;
  return sb;
};

const updateObsSB = async (username, project, updateBurrito) => new Promise((resolve) => {
  logger.debug('updateObsSB.js', 'In updateObsSB for updating the burrito.');
  const newpath = localStorage.getItem('userPath');
  const folder = path.join(newpath, packageInfo.name, 'users', username, 'projects', `${project.name}_${project.id[0]}`);
  const fs = window.require('graceful-fs');
  const sb = fs.readFileSync(path.join(folder, 'metadata.json'));
  let metadata = JSON.parse(sb);
  // eslint-disable-next-line no-unused-vars
  let updated = false;
  metadata.meta.generator.softwareVersion = packageInfo.version;
  if (!metadata.meta.dateCreated) {
    metadata.meta.dateCreated = moment().format();
  }
  logger.debug('updateObsSB.js', 'Updating the details of ingredients.');
  // eslint-disable-next-line no-unused-vars
  Object.entries(metadata.ingredients).forEach(([key, value]) => {
    const contentmd = fs.readFileSync(path.join(folder, key), 'utf8');
    const checksum = md5(contentmd);
    const stats = fs.statSync(path.join(folder, key));
    if (metadata.ingredients[key].checksum.md5 === checksum) {
      updated = true;
    }
    metadata.ingredients[key].checksum.md5 = checksum;
    metadata.ingredients[key].size = stats.size;
  });
  if (updated === true) {
    Object.entries(metadata.identification?.primary?.scribe).forEach(([key]) => {
      logger.debug('importBurrito.js', 'Fetching the key from burrito.');
      const rev = metadata.identification.primary.scribe[key].revision;
      metadata.identification.primary.scribe[key].revision = (parseInt(rev, 10) + 1).toString();
    });
  }
  if (metadata.copyright.fullStatementPlain) {
    const newLicence1 = (metadata.copyright.fullStatementPlain.en).replace(/\\n/gm, '\n');
    const newLicence = newLicence1?.replace(/\\r/gm, '\r');
    const licence = newLicence?.replace(/'/gm, '"');
    const firstKey = Object.keys(metadata.ingredients)[0];
    const folderName = firstKey.split(/[(\\)?(/)?]/gm).slice(0);
    const dirName = folderName[0];
    fs.writeFileSync(path.join(folder, dirName, 'license.md'), licence);
    const copyrightStats = fs.statSync(path.join(folder, dirName, 'license.md'));
    metadata.copyright.licenses = [{ ingredient: 'license.md' }];
    metadata.ingredients[path.join(dirName, 'license.md')] = {
      checksum: {
        md5: md5(metadata.copyright.fullStatementPlain.en),
      },
      mimeType: 'text/md',
      size: copyrightStats.size,
      role: 'x-licence',
    };
    delete metadata.copyright.fullStatementPlain;
    delete metadata.copyright.publicDomain;
  }
  if (updateBurrito) {
    logger.debug('updateObsSB.js', 'Updating the burrito version');
    metadata = updateVersion(metadata);
  }
  try {
    logger.debug('updateObsSB.js', 'Updating the metadata.json (burrito) file.');
    fs.writeFileSync(path.join(folder, 'metadata.json'), JSON.stringify(metadata));
    resolve(true);
  } catch {
    logger.error('updateObsSB.js', 'Failed to update the metadata.json (burrito) file.');
    resolve(false);
  }
});
export default updateObsSB;
