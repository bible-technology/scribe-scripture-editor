import localForage from 'localforage';
import * as logger from '../../logger';
import { environment } from '../../../environment';
import packageInfo from '../../../../package.json';

export const readUserSettings = async () => {
    try {
    logger.debug('userSettings.js', 'In readUserSettings');
    const currentUser = await localForage.getItem('userProfile');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, environment.USER_SETTING_FILE);

    if (fs.existsSync(file)) {
        const userSettings = await fs.readFileSync(file);
        if (userSettings) {
            logger.debug('userSettings.js', 'read user setings file successfully');
            const json = await JSON.parse(userSettings);
            return json;
        }
        throw new Error('failed to read user settings file');
    }
    } catch (err) {
        throw new Error(err?.message || err);
    }
};

// read usersetings, metadata, appsettings
export const readJsonFiles = async (fileType, dirName = 'ingredients') => {
    try {
        logger.debug('userSettings.js', 'In readSettings');
        const currentUser = await localForage.getItem('userProfile');
        const newpath = localStorage.getItem('userPath');
        const fs = window.require('fs');
        const path = require('path');
        const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, 'projects');
        let filePath;
        const currentProject = await localForage.getItem('currentProject');
        switch (fileType) {
            case 'metadata':
                filePath = path.join(file, currentProject, 'metadata.json');
                break;
            case 'appsettings':
                filePath = path.join(file, currentProject, dirName, environment.PROJECT_SETTING_FILE);
                break;
            case 'usersettings':
                filePath = path.join(file, environment.USER_SETTING_FILE);
                break;
            default:
                break;
            }

        if (fs.existsSync(filePath)) {
            const settingsFile = await fs.readFileSync(filePath);
            if (settingsFile) {
                logger.debug('settingsFile.js', 'read setings file successfully');
                const json = await JSON.parse(settingsFile);
                return json;
            }
            throw new Error(`failed to read settings file - ${fileType}`);
        }
        throw new Error(`failed to read settings file - ${fileType}`);
    } catch (err) {
        throw new Error(err?.message || err);
    }
};

// save usersetings, metadata, appsettings => expecting json data
export const saveJsonFiles = async (data, fileType, dirName = 'ingredients') => {
    try {
        logger.debug('userSettings.js', 'In saveUserSettings');
        const currentUser = await localForage.getItem('userProfile');
        const newpath = localStorage.getItem('userPath');
        const fs = window.require('fs');
        const path = require('path');
        const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, 'projects');
        let filePath;
        const currentProject = await localForage.getItem('currentProject');
        switch (fileType) {
            case 'metadata':
                filePath = path.join(file, currentProject, 'metadata.json');
                break;
            case 'appsettings':
                filePath = path.join(file, currentProject, dirName, environment.PROJECT_SETTING_FILE);
                break;
            case 'usersettings':
                filePath = path.join(file, environment.USER_SETTING_FILE);
                break;
            default:
                break;
        }
    await fs.writeFileSync(filePath, JSON.stringify(data));
    } catch (err) {
        throw new Error(err?.message || err);
    }
};

export const saveUserSettings = async (userSettingsJson) => {
    try {
    logger.debug('userSettings.js', 'In saveUserSettings');
    const currentUser = await localForage.getItem('userProfile');
    const newpath = localStorage.getItem('userPath');
    const fs = window.require('fs');
    const path = require('path');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, environment.USER_SETTING_FILE);
    await fs.writeFileSync(file, JSON.stringify(userSettingsJson));
    } catch (err) {
        throw new Error(err?.message || err);
    }
};

// this will read usfm file based on path name / bookname (eg : ingredients/MAT.usfm)
export const readUsfmFile = async (filename, projectName) => {
    try {
        logger.debug('userSettings.js', 'In readUsfm file');
        const currentUser = await localForage.getItem('userProfile');
        const newpath = localStorage.getItem('userPath');
        const fs = window.require('fs');
        const path = require('path');
        const file = path.join(newpath, packageInfo.name, 'users', currentUser.username, 'projects', projectName, filename);
        if (fs.existsSync(file)) {
            const usfm = await fs.readFileSync(file, 'utf-8');
            if (usfm) {
                logger.debug('userSettings.js', 'read usfm file successfully');
                return usfm;
            }

            throw new Error('failed to read usfm  file');
        }
    } catch (err) {
        throw new Error(err?.message || err);
    }
};
