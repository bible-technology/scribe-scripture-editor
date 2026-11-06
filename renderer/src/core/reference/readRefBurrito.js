import * as logger from '../../logger';

export const readRefBurrito = async ({
  metaPath,
}) => {
  logger.debug('readRefBurrito.js', 'In readRefBurrito');
  const fs = window.require('fs');
  const path = require('path');
  return new Promise((resolve) => {
    try {
      if (fs.existsSync(metaPath)) {
        const fileContent = fs.readFileSync(
          path.join(metaPath),
          'utf8',
        );
        logger.debug('readIngreadients.js', 'Returning the metadata (burrito)');
        resolve(fileContent);
        return;
      }
    } catch (err) {
      logger.error('readRefBurrito.js', 'Error reading burrito:', err);
    }
    resolve(null);
  });
};
