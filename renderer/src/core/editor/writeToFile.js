import * as logger from '../../logger';
import packageInfo from '../../../../package.json';

const writeToFile = async ({
  username,
  projectname,
  filename,
  data,
}) => {
  const fs = window.require('fs');
  const path = require('path');
  const newpath = localStorage.getItem('userPath');
  const projectsPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectname, filename);
  if (fs.existsSync(projectsPath)) {
    // appending to an existing file
    logger.debug('writeToFile.js', 'Appending to the existing file');
    fs.writeFileSync(projectsPath, data);
  } else {
    // Creating new file if nothing present
    logger.debug('writeToFile.js', 'Creating new file to write');
    fs.writeFileSync(projectsPath, data);
  }
};

export default writeToFile;
