import { isElectron } from '@/core/handleElectron';

export const readRefMeta = async ({
  projectsDir,
}) => {
  if (isElectron()) {
    const fs = window.require('fs');
    const path = require('path');
    return new Promise((resolve) => {
      if (fs.existsSync(projectsDir)) {
        const files = fs.readdirSync(projectsDir);
        const _files = [];
        // read dir to find references bundles
        files.forEach((file) => {
          const stat = fs.lstatSync(path.join(projectsDir, file));
          if (stat.isDirectory() === true) {
            _files.push(file);
            resolve(_files);
          }
        });
      }
    });
  }
};
