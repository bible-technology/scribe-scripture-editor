/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import localForage from 'localforage';
import moment from 'moment';
import { isElectron } from '@/core/handleElectron';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import {
    createDirectory, newPath, sbStorageRemove, sbStorageList, sbStorageDownload,
} from '../../../../../supabase';

const JSZip = require('jszip');

const DownloadCreateSBforHelps = async (projectResource, setLoading, update = false, offlineResource = false) => {
    if (isElectron()) {
        try {
            logger.debug('DownloadCreateSBforHelps.js', 'Download Started');
            setLoading(true);
            await localForage.getItem('userProfile').then(async (user) => {
                logger.debug('DownloadCreateSBforHelps.js', 'In helps-resource download user fetch - ', user?.username);
                const fs = window.require('fs');
const gracefulFs = require('graceful-fs');
gracefulFs.gracefulify(fs);
                const path = require('path');
                const newpath = localStorage.getItem('userPath');
                const folder = path.join(newpath, packageInfo.name, 'users', `${user?.username}`, 'resources');
                // const currentUser = user?.username;
                // const key = currentUser + projectResource.name + projectResource.owner + moment().format();
                // const id = uuidv5(key, environment.uuidToken);
                // check for existing resources
                const existingResource = fs.readdirSync(folder, { withFileTypes: true });
                const downloadProjectName = `${projectResource?.name}_${projectResource?.owner}_${projectResource?.release?.tag_name}`;
                existingResource?.forEach((element) => {
                    if (downloadProjectName === element.name) {
                        throw new Error('Resource Already Exist');
                    }
                });

                // check if resource already exist in offline
                if (!update && offlineResource) {
                    // eslint-disable-next-line array-callback-return
                    const resourceExist = offlineResource.filter((offline) => {
                        if (offline?.projectDir === `${projectResource?.name}_${projectResource?.owner}_${projectResource?.release?.tag_name}`) {
                            return offline;
                        }
                    });
                    if (resourceExist.length > 0) {
                        throw new Error('Resource Already Exist');
                        // eslint-disable-next-line no-throw-literal
                        // throw 'Resource Already Exist';
                    }
                }

                // eslint-disable-next-line no-async-promise-executor
                // return new Promise(async (resolve) => {
                // const json = {};
                // download and unzip the content
                await fetch(projectResource?.zipball_url)
                    .then((res) => res.arrayBuffer())
                    .then(async (blob) => {
                        logger.debug('DownloadCreateSBforHelps.js', 'In resource download - downloading zip content ');
                        if (!fs.existsSync(folder)) {
                            fs.mkdirSync(folder, { recursive: true });
                        }
                        // wririntg zip to local
                        await fs.writeFileSync(path.join(folder, `${projectResource?.name}.zip`), Buffer.from(blob));
                        logger.debug('DownloadCreateSBforHelps.js', 'In resource download - downloading zip content completed ');

                        // extract zip
                        logger.debug('DownloadCreateSBforHelps.js', 'In resource download - Unzip downloaded resource');
                        const filecontent = await fs.readFileSync(path.join(folder, `${projectResource?.name}.zip`));
                        const result = await JSZip.loadAsync(filecontent);
                        const keys = Object.keys(result.files);

                        // eslint-disable-next-line no-restricted-syntax
                        for (const key of keys) {
                            const item = result.files[key];
                            if (item.dir) {
                                fs.mkdirSync(path.join(folder, item.name), { recursive: true });
                            } else {
                                // eslint-disable-next-line no-await-in-loop
                                const bufferContent = Buffer.from(await item.async('arraybuffer'));
                                fs.writeFileSync(path.join(folder, item.name), bufferContent);
                            }
                        }
                        // let resourceMeta = {};
                        await fetch(projectResource.metadata_json_url)
                            .then((res) => res.json())
                            .then(async (data) => {
                                // adding offline true tag in  meta for identification
                                data.agOffline = true;
                                data.meta = projectResource;
                                data.lastUpdatedAg = moment().format();
                                await fs.writeFileSync(path.join(folder, projectResource?.name, 'metadata.json'), JSON.stringify(data));
                            }).catch((err) => {
                                logger.debug('DownloadCreateSBforHelps.js', 'failed to save yml metadata.json : ', err);
                            });

                        // finally remove zip and rename base folder to projectname_id
                        logger.debug('DownloadCreateSBforHelps.js', 'deleting zip file - rename project with project + id in scribe format');
                        if (fs.existsSync(folder)) {
                            fs.renameSync(path.join(folder, projectResource?.name), path.join(folder, `${projectResource?.name}_${projectResource?.owner}_${projectResource?.release?.tag_name}`));
                            fs.unlinkSync(path.join(folder, `${projectResource?.name}.zip`), (err) => {
                                if (err) {
                                    logger.debug('DownloadCreateSBforHelps.js', 'error in deleting zip');
                                    throw new Error(`Removing Resource Zip Failed :  ${projectResource?.name}.zip`);
                                }
                            });
                            if (update && update?.status) {
                                // if updation delete old resource
                                try {
                                    fs.rmSync(path.join(folder, `${projectResource?.name}_${projectResource?.owner}_${update?.prevVersion}`), { recursive: true });
                                    update && update?.setIsOpen(false);
                                } catch (err) {
                                    logger.debug('DownloadCreateSBforHelps.js', 'error in deleting prev resource');
                                    setLoading(false);
                                    throw new Error(`Removing Previous Resource Failed :  ${projectResource?.name}_${projectResource?.owner}_${update?.prevVersion}`);
                                }
                            }
                        }
                    });
                logger.debug('DownloadCreateSBforHelps.js', 'download completed');
                setLoading(false);
            });
        } catch (err) {
            setLoading(false);
            throw err;
        }
    } else {
        const userProfile = await localForage.getItem('userProfile');
        const username = userProfile?.user?.email;
        try {
            setLoading(true);
            const folder = `${newPath}/${username}/resources`;
            const { data: existingResource } = await sbStorageDownload(folder);
            const downloadProjectName = `${projectResource?.name}_${projectResource?.owner}_${projectResource?.release?.tag_name}`;
            existingResource?.forEach((element) => {
                if (downloadProjectName === element.name) {
                    throw new Error('Resource Already Exist');
                }
            });

            await fetch(projectResource?.zipball_url).then((res) => res.arrayBuffer()).then(async (blob) => {
                const { data: folderExist } = await sbStorageList(folder);
                if (!folderExist) {
                    await createDirectory({ path: folder });
                }
                // writing zip to local
                await createDirectory({ path: `${folder}/${projectResource?.name}.zip}`, payload: Buffer.from(blob) });

                // extract zip
                const { data: filecontent, error: fileContentError } = await sbStorageDownload(`${folder}/${projectResource?.name}.zip}`);
                if (fileContentError) {
                    // eslint-disable-next-line no-console
                    console.log('Failed to download zip file', fileContentError);
                }

                const result = await JSZip.loadAsync(filecontent);
                const keys = Object.keys(result.files);

                for (const key of keys) {
                    const item = result.files[key];
                    if (item.dir) {
                        await createDirectory({ path: `${folder}/${item.name}` });
                    } else {
                        const bufferContent = Buffer.from(await item.async('arraybuffer'));
                        await createDirectory({ path: `${folder}/${item.name}`, payload: bufferContent });
                    }
                }

                await fetch(projectResource.metadata_json_url).then((res) => res.json()).then(async (data) => {
                    data.agOffline = true;
                    data.meta = projectResource;
                    data.lastUpdatedAg = moment().format();
                    await createDirectory({ path: `${folder}/${projectResource?.name}/metadata.json`, payload: JSON.stringify(data) });
                }).catch((err) => {
                    // eslint-disable-next-line no-console
                    console.log('DownloadCreateSBforHelps.js', 'failed to save yml metadata.json : ', err);
                });

                // finally remove zip and rename base folder to projectname_id
                if (folderExist) {
                    if (update && update?.status) {
                        // if updation delete old resource
                        try {
                            sbStorageRemove(`folder/${projectResource?.name}_${projectResource?.owner}_${update?.prevVersion}`);
                            update && update?.setIsOpen(false);
                        } catch (err) {
                            logger.debug('DownloadCreateSBforHelps.js', 'error in deleting prev resource');
                            setLoading(false);
                            throw new Error(`Removing Previous Resource Failed :  ${projectResource?.name}_${projectResource?.owner}_${update?.prevVersion}`);
                        }
                    }
                }
            });
        } catch (error) {
            setLoading(false);
        }
    }
};

export default DownloadCreateSBforHelps;
