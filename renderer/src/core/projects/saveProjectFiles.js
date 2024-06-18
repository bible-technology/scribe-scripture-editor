import packageInfo from '../../../../package.json';

const saveProjectsFiles = ({
    username,
    projectname,
    filenames,
}) => {
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);
    const path = require('path');
        fs.mkdirSync(path.join(newpath, packageInfo.name, 'users', username, 'projects', projectname), {
            recursive: true,
        });
        filenames.forEach((files) => {
            fs.closeSync(fs.openSync(path.join(newpath, packageInfo.name, 'users', username, 'projects', projectname, `${files}.usfm`), 'w'));
        });
};

export default saveProjectsFiles;
