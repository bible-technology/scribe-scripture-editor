import * as logger from '../logger';

const Ajv = require('ajv');
const schemaIndex030 = require('../../vendor/scripture-burrito/v0.3.0/schema');
const schemaIndex031 = require('../../vendor/scripture-burrito/v0.3.1/schema');
const schemaIndex100rc1 = require('../../vendor/scripture-burrito/v1.0.0-rc1/schema');
const schemaIndex100 = require('../../vendor/scripture-burrito/v1.0.0/schema');

export const validate = (schemaName, fn, data, version) => {
  console.log(schemaName, fn, data, version);
  let schemaIndex;
  switch (version) {
    case '0.3.0':
      schemaIndex = schemaIndex030;
      break;
    case '0.3.1':
      schemaIndex = schemaIndex031;
      break;
    case '1.0.0-rc1':
      schemaIndex = schemaIndex100rc1;
      break;
    case '1.0.0-rc2':
      schemaIndex = schemaIndex100;
      break;
    default:
      schemaIndex = schemaIndex100;
      break;
  }
  const ajv = new Ajv({ schemas: schemaIndex.schemas });
  logger.debug('validate.js', 'In validate for validation the burrito');
  const validator = ajv.getSchema(schemaIndex.schemaIds[schemaName]);

  if (validator(JSON.parse(data))) {
    logger.debug('validate.js', `Successfully validated the burrito, Location:${fn}`);
    return true;
  }
  logger.error('validate.js', `Burrito failed the validation ${JSON.stringify(validator?.errors)}, Location:${fn}`);
  return false;
};
