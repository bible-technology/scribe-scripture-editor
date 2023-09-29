/* eslint-disable no-async-promise-executor */
import { readBlobAsync } from '@/components/EditorPage/ObsEditor/core';
import packageInfo from '../../../../package.json';
import { newPath, sbStorageDownload } from '../../../../supabase';
import { isElectron } from '../handleElectron';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//     const supabaseStorage = require('../../../../supabase').supabaseStorage
//     const newPath = require('../../../../supabase').newPath
//   }
export const readFile = async ({
    username,
    projectname,
    filename,
}) => {
    if (isElectron()) {
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
    }
    const projectsPath = `${newPath}/${username}/projects/${projectname}/${filename}`;
    return new Promise(async (resolve) => {
        const { data: fileContent, error } = await sbStorageDownload(projectsPath);
        if (error) {
            console.error('readWebFile function error', error);
        }
        const parsedData = readBlobAsync(fileContent);
        resolve(parsedData);
    });
};
