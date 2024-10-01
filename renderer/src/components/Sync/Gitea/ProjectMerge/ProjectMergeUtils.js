import { createFiletoServer } from '../../Scribe/SyncToGiteaUtils';
import * as logger from '../../../../logger';
import packageInfo from '../../../../../../package.json';

// upload project to a branch on exsting repo
export const uploadProjectToBranchRepoExist = async (selectedGiteaProject, ignoreFilesPaths = []) => {
  logger.debug('ProjectMErgeUtils.js', 'Upload project to tempory branch for merge');
  try {
    const {
      repo, branch, metaDataSB, localUsername, auth,
    } = selectedGiteaProject;
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const projectId = Object.keys(metaDataSB.identification.primary.scribe)[0];
    const projectName = metaDataSB.identification.name.en;
    // const projectCreated = metaDataSB.meta.dateCreated.split('T')[0];
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', localUsername, 'projects', `${projectName}_${projectId}`);
    const MetadataLocal = fs.readFileSync(path.join(projectsMetaPath, 'metadata.json'));
    const localSB = JSON.parse(MetadataLocal);
    if (!ignoreFilesPaths.includes('metadata.json')) {
      await createFiletoServer(JSON.stringify(MetadataLocal), 'metadata.json', `${branch.name}-merge`, repo.name, auth);
    }
    const ingredientsObj = localSB.ingredients;
    // eslint-disable-next-line no-restricted-syntax
    for (const key in ingredientsObj) {
      if (Object.prototype.hasOwnProperty.call(ingredientsObj, key)) {
        if (!ignoreFilesPaths.includes(key)) {
          const metadata1 = fs.readFileSync(path.join(projectsMetaPath, key), 'utf8');
          // eslint-disable-next-line no-await-in-loop
          await createFiletoServer(metadata1, key, `${branch.name}-merge`, repo.name, auth);
        }
      }
    }
    logger.debug('ProjectMErgeUtils.js', 'Upload project to tempory branch for merge finished');
    return true;
  } catch (err) {
    logger.debug('ProjectMErgeUtils.js', 'Upload project to tempory branch for merge Error', err);
    throw new Error(err);
  }
};

export const deleteCreatedMergeBranch = async (selectedGiteaProject, actions, GITEA_BASE_API_URL) => {
  logger.debug('ProjectMErgeUtils.js', 'IN delete created merge branch - local project ');
  const myHeaders = new Headers();
  myHeaders.append('Authorization', `Bearer ${selectedGiteaProject.auth.token.sha1}`);
  myHeaders.append('Content-Type', 'application/json');
  const requestOptions = {
    method: 'DELETE',
    headers: myHeaders,
    body: '',
    redirect: 'follow',
  };
  const urlDeleteBranch = `${GITEA_BASE_API_URL}/repos/${selectedGiteaProject?.repo?.owner?.username}/${selectedGiteaProject?.repo?.name}/branches/${selectedGiteaProject.branch.name}-merge`;
  fetch(urlDeleteBranch, requestOptions)
    .then((response) => response)
    .then((result) => {
      if (result.ok) {
        actions.setStepCount((prevStepCount) => prevStepCount + 1);
        logger.debug('ProjectMErgeUtils.js', 'Deleted Temp Branch Successfully');
      } else {
        throw new Error(result.statusText);
      }
    })
    .catch((error) => logger.debug('ProjectMErgeUtils.js', 'Project Temporary branch deletion Error - ', error));
};

export const backupLocalProject = async (selectedGiteaProject, actions) => {
  try {
    actions.setStepCount((prevStepCount) => prevStepCount + 1);
    const projectId = Object.keys(selectedGiteaProject?.metaDataSB?.identification.primary.scribe)[0];
    const projectName = selectedGiteaProject?.metaDataSB?.identification.name.en;
    logger.debug('ProjectMErgeUtils.js', 'Stated Backing up the project', projectName);
    const newpath = localStorage.getItem('userPath');
    const fse = window.require('fs-extra');
    const fs = window.require('fs');
    const path = require('path');
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', selectedGiteaProject?.localUsername, 'projects', `${projectName}_${projectId}`);
    const projectBackupPath = path.join(newpath, packageInfo.name, 'users', selectedGiteaProject?.localUsername, 'projects-backups');
    fs.mkdirSync(path.join(projectBackupPath), { recursive: true });
    logger.debug('ProjectMErgeUtils.js', 'Creating backup directory if not exists.');
    const backupProjectName = `${projectName}_${projectId}_${new Date().getTime()}`;
    actions.setBackupName(backupProjectName);
    await fse.copy(projectsMetaPath, path.join(projectBackupPath, backupProjectName));
    logger.debug('ProjectMErgeUtils.js', 'Finished Backing up the project', projectName);
    return backupProjectName;
  } catch (err) {
    throw new Error(err);
  }
};

export const undoMergeOrDeleteOldBackup = async (selectedGiteaProject, backupName, SYNC_BACKUP_COUNT, undo = false) => {
  logger.debug('ProjectMErgeUtils.js', 'in undo merge or delete old backup');
  const newpath = localStorage.getItem('userPath');
  const fs = window.require('fs');
  const path = require('path');
  const projectBackupPath = path.join(newpath, packageInfo.name, 'users', selectedGiteaProject?.localUsername, 'projects-backups');
  // Sorted files in directory on creation date
  const backupFileList = await fs.readdirSync(projectBackupPath);
  const files = backupFileList.filter((filename) => fs.statSync(`${projectBackupPath}/${filename}`).isDirectory());
  const backupFileListSorted = files.sort((a, b) => {
    const aStat = fs.statSync(`${projectBackupPath}/${a}`);
    const bStat = fs.statSync(`${projectBackupPath}/${b}`);
    return new Date(bStat.birthtime).getTime() - new Date(aStat.birthtime).getTime();
  });

  if (undo) {
    // replace backup with merged in project
    const fse = window.require('fs-extra');
    const projectId = Object.keys(selectedGiteaProject?.metaDataSB?.identification.primary.scribe)[0];
    const projectName = selectedGiteaProject?.metaDataSB?.identification.name.en;
    const projectsMetaPath = path.join(newpath, packageInfo.name, 'users', selectedGiteaProject?.localUsername, 'projects');
    fs.mkdirSync(path.join(projectsMetaPath, `${projectName}_${projectId}`), { recursive: true });
    logger.debug('ProjectMErgeUtils.js', 'Creating undo directory if not exists.');
    await fse.copy(path.join(projectBackupPath, backupName), path.join(projectsMetaPath, `${projectName}_${projectId}`));
    // delete the backup created
    await fs.rmdir(path.join(projectBackupPath, backupFileListSorted[0]), { recursive: true }, (err) => {
      if (err) {
        throw new Error(err);
      } else {
        logger.debug('ProjectMErgeUtils.js', 'Deleted');
      }
    });
  } else if (!undo) {
    // prune older backup / undo
    if (backupFileListSorted.length > SYNC_BACKUP_COUNT) {
      await fs.rmdir(path.join(projectBackupPath, backupFileListSorted.pop()), { recursive: true }, (err) => {
        if (err) {
          throw new Error(err);
        } else {
          logger.debug('ProjectMErgeUtils.js', 'Undo done ');
        }
      });
    }
  }
};
