import { isElectron } from '@/core/handleElectron';

export const readRefMeta = async ({
  projectsDir,
}) => {
  if (isElectron()) {
    const fs = window.require('fs');
    const path = require('path');
    return new Promise((resolve) => {
      try {
        if (fs.existsSync(projectsDir)) {
          const files = fs.readdirSync(projectsDir);
          const _files = [];
          // read dir to find references bundles
          files.forEach((file) => {
            try {
              const stat = fs.lstatSync(path.join(projectsDir, file));
              if (stat.isDirectory() === true) {
                _files.push(file);
              }
            } catch (err) {
              // ignore files that cannot be stated
            }
          });
          resolve(_files);
          return;
        }
      } catch (err) {
        // ignore read error
      }
      resolve([]);
    });
  }
  return [];
};
