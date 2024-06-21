import * as logger from '../../logger';

export const readIngredients = async ({
  filePath,
}) => {
  logger.debug('readIngreadients.js', 'In readIngredients');
  const fs = window.require('fs');
  const path = require('path');
  return new Promise((resolve) => {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(
        path.join(filePath),
        'utf8',
      );
      logger.debug('readIngreadients.js', 'Returning the file content');
      resolve((fileContent));
    } else { resolve((false)); }
  });
};
