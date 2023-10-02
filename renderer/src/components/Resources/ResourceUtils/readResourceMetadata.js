import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import * as localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';

const path = require('path');

export async function readResourceMetadata(projectsDir, resourcePath, setSubMenuItems, parseData, userOrCommon) {
  if (isElectron()) {
    const refs = await readRefMeta({ projectsDir });
    refs.forEach(async (ref) => {
      const metaPath = path.join(`${resourcePath}`, ref, 'metadata.json');
      const data = await readRefBurrito({ metaPath });
      if (data) {
        const burrito = {};
        burrito.projectDir = ref;
        burrito.value = JSON.parse(data);
      burrito.type = userOrCommon;
        parseData.push(burrito);
        await localforage.setItem('resources', parseData);
        setSubMenuItems(parseData);
      }
    });
  } else {
    const refs = await readRefMeta({ projectsDir });
    refs.forEach(async (ref) => {
      const metaPath = `${projectsDir}/${ref}/metadata.json`;
      const data = await readRefBurrito({ metaPath });
      if (data) {
        const burrito = {};
        burrito.projectDir = ref;
        burrito.value = data;
        parseData.push(burrito);
        await localforage.setItem('resources', parseData);
        setSubMenuItems(parseData);
      }
    });
  }
}
