//  convert TSV to line by line json
import * as logger from '../../../../logger';

export default async function tsvJSON(tsv) {
  const lines = tsv.split('\n');
  logger.debug('in TsvToJson.js : in convert function');
  const result = [];

  const headers = lines[0].split('\t');

  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentline = lines[i].split('\t');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }
  logger.debug('in TsvToJson.js : in convert function , Finished');
  return result;
}
