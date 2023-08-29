import localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';
import packageInfo from '../../../../package.json';
import { newPath, sbStorageDownload } from '../../../../supabase';
// if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
//     const supabaseStorage = require('../../../../supabase').supabaseStorage
//     const newPath = require('../../../../supabase').newPath
//   }

function isBackendProjectExist(ProjectDir) {
    const path = require('path');
    // Step1 : check the project Dir and Meta exist
    // step2 : exist return True
    return new Promise((resolve) => {
        // let checkStatus = false;
        localforage.getItem('userProfile').then(async (value) => {
            if (isElectron()) {
                const newpath = localStorage.getItem('userPath');
                const fs = window.require('fs');
                if (value?.username) {
                    const resourcePath = path.join(newpath, packageInfo.name, 'users', value.username, 'resources', ProjectDir);
                    // check for path exist or not and resolve true or false will work for pane 1 now add for other panes
                    if (fs.existsSync(resourcePath) && fs.existsSync(path.join(resourcePath, 'metadata.json'))) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            } else {
                const resourcePath = path.join(newPath, packageInfo.name, 'users', value.user.email, 'resources', ProjectDir);
                // check for path exist or not and resolve true or false will work for pane 1 now add for other panes
                const { data } = await sbStorageDownload(resourcePath);
                if (data) {
                    resolve(true);
                }
                resolve(false);
            }
        });
    });
}
export default isBackendProjectExist;
