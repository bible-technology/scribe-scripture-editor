import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import * as localforage from 'localforage';
import { isElectron } from '@/core/handleElectron';

const path = require('path');

export async function readResourceMetadata(projectsDir, resourcePath, setSubMenuItems, parseData, userOrCommon) {
  const refs = (await readRefMeta({ projectsDir })) || [];
  if (isElectron()) {
    for (let i = 0; i < refs.length; i += 1) {
      const ref = refs[i];
      const metaPath = path.join(`${resourcePath}`, ref, 'metadata.json');
      // eslint-disable-next-line no-await-in-loop
      const data = await readRefBurrito({ metaPath });
      if (data) {
        try {
          const burrito = {};
          burrito.projectDir = ref;
          burrito.value = JSON.parse(data);
          burrito.type = userOrCommon;
          parseData.push(burrito);
        } catch (e) {
          // ignore corrupted json
        }
      }
    }
  } else {
    for (let i = 0; i < refs.length; i += 1) {
      const ref = refs[i];
      const metaPath = `${projectsDir}/${ref}/metadata.json`;
      // eslint-disable-next-line no-await-in-loop
      const data = await readRefBurrito({ metaPath });
      if (data) {
        const burrito = {};
        burrito.projectDir = ref;
        burrito.value = data;
        burrito.type = userOrCommon;
        parseData.push(burrito);
      }
    }
  }
  await localforage.setItem('resources', parseData);
  setSubMenuItems([...parseData]);
}
