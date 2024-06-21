/* eslint-disable no-async-promise-executor */
import { isElectron } from '@/core/handleElectron';
import { sbStorageDownload } from '../../../../supabase';
import * as logger from '../../logger';

export const readRefBurrito = async ({
    metaPath,
}) => {
    if (isElectron()) {
        logger.debug('readRefBurrito.js', 'In readRefBurrito');
        const fs = require('graceful-fs');
        const path = require('path');
        return new Promise((resolve) => {
            if (fs.existsSync(metaPath)) {
                const fileContent = fs.readFileSync(
                    path.join(metaPath),
                    'utf8',
                );
                logger.debug('readIngreadients.js', 'Returning the metadata (burrito)');
                resolve((fileContent));
            }
        });
    }
    return new Promise(async (resolve) => {
        const { data: files, error } = await sbStorageDownload(metaPath);
        if (error) {
             // eslint-disable-next-line no-console
            console.error('Error fetching files:', error);
            return;
        }
        const _files = JSON.parse(await files.text());
        resolve(_files);
    });
};
