import packageInfo from '../../../../package.json';

const metaFileReplace = ({ userData }) => {
  const newpath = localStorage.getItem('userPath');
  const status = [];
  const fs = window.require('fs');
  const path = require('path');
  const json = JSON.stringify(userData);
  const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', 'username', 'projects', 'projects.json');
  if (fs.existsSync(projectsMetaPath)) {
    fs.writeFileSync(path.join(
      newpath,
      packageInfo.name,
      'users',
      'username',
      'projects',
      'projects.json',
    ), json);
  }
  return (status.push({ type: 'success', value: 'new project created' }));
};

export default metaFileReplace;
