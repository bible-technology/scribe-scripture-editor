import { isElectron } from '@/core/handleElectron';
import { environment } from '../../../../environment';
import packageInfo from '../../../../../package.json';
import OBSData from '../../../lib/OBSData.json';
import {
  createDirectory, sbStorageList, sbStorageUpload, sbStorageDownload,
} from '../../../../../supabase';

const downloadImageAndSave = async (url, savePath, fs) => {
  const response = await fetch(url, { mode: 'no-cors' });
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (blob.type.includes('image')) {
    await fs.createWriteStream(savePath).write(buffer);
  }
};

async function downloadImageAndSaveSupabase(url) {
  try {
    const response = await fetch(url, {
      mode: 'no-cors',
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.src = imageUrl;
    document.body.appendChild(img);
    const { error } = await sbStorageUpload(`${packageInfo.name}/common/${environment.OBS_IMAGE_DIR}`, blob);
    if (error) {
         // eslint-disable-next-line no-console
      console.log('error uploading images to supabase', { error });
      throw error;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
  }
}

export const checkandDownloadObsImages = async () => {
  // check for the folder and images
  // const imageCdnBaseUrl = 'https://cdn.door43.org/obs/jpg/360px/';
  if (isElectron()) {
    const fs = window.require('fs');
    const path = require('path');
    const newpath = localStorage.getItem('userPath');
    const obsImagePath = path.join(newpath, packageInfo.name, 'common', environment.OBS_IMAGE_DIR);
    const exist = await fs.existsSync(obsImagePath);
    if (!exist) {
      await fs.mkdirSync(obsImagePath, { recursive: true });
    }
    const filesInDir = await fs.readdirSync(obsImagePath);
    Object.values(OBSData).forEach(async (storyObj) => {
      Object.values(storyObj.story).forEach(async (story) => {
        let fileName = story.url.split('/');
        fileName = fileName[fileName.length - 1];
        if (!filesInDir.includes(fileName)) {
          const filePath = path.join(obsImagePath, fileName);
          await downloadImageAndSave(story.url, filePath, fs);
        }
      });
    });
  } else {
    const obsImagePath = `${packageInfo.name}/common/${environment.OBS_IMAGE_DIR}`;
    const { data: exist } = await sbStorageList(obsImagePath);
    if (!exist) {
      await createDirectory({ path: obsImagePath });
    }
    const { data: filesInDir } = await sbStorageDownload(obsImagePath);
    Object.values(OBSData).forEach(async (storyObj) => {
      Object.values(storyObj.story).forEach(async (story) => {
        let fileName = story.url.split('/');
        fileName = fileName[fileName.length - 1];
        if (filesInDir === null) {
          const filePath = `${obsImagePath}/${fileName}`;
          await downloadImageAndSaveSupabase(story.url, filePath);
        }
      });
    });
  }
};
