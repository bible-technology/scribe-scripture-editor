import { isElectron } from '@/core/handleElectron';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import {
    IsElectron, newPath, sbStorageDownload, sbStorageUpdate, sbStorageUpload,
} from '../../../../supabase';

const writeToFile = async ({
    username,
    projectname,
    filename,
    data,
}) => {
    if (isElectron()) {
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
    }
    console.log({
        username, projectname, filename, data,
    });
    if (!IsElectron) {
		const filePath = `${newPath}/${username}/projects/${projectname}/${filename}`;
		const { data: projectsPath, error } = await sbStorageDownload(filePath);
		if (projectsPath) {
			// appending to an existing file
			console.log('writeToFile.js', 'Appending to the existing file');
			sbStorageUpdate({ path: filePath, payload: data });
		} else {
			// Creating new file if nothing present
			console.log('writeToFile.js', 'Creating new file to write');
			sbStorageUpload(filePath, data);
		}
		if (error) {
			console.log(error);
		}
	}
};

export default writeToFile;
