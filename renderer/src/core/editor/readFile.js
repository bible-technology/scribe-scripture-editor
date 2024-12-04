import packageInfo from '../../../../package.json';

export const readFile = async ({
  username,
  projectname,
  filename,
}) => {
  const fs = window.require('fs');
  const path = require('path');
  const newpath = localStorage.getItem('userPath');
  const projectsPath = path.join(newpath, packageInfo.name, 'users', username, 'projects', projectname, filename);
  return new Promise((resolve) => {
    if (fs.existsSync(projectsPath)) {
      const fileContent = fs.readFileSync(
        path.join(projectsPath),
        'utf8',
      );
      resolve(fileContent);
    }
  });
};
