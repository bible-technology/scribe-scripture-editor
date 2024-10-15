import * as path from 'path';
import * as crypto from 'crypto';
import { convertUsfmToUsj } from './conversionUtils';

let fs;

function initFS() {
  if (typeof window !== 'undefined' && window.require) {
    fs = window.require('fs');
  }
}
initFS();

export function getMd5Hash(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

export function getCacheFilePath(hash, projectCachePath) {
  return path.join(projectCachePath, `${hash}.json`);
}

export function isCacheValid(hash, projectCachePath) {
  if (!fs) { return false; }
  const cacheFilePath = getCacheFilePath(hash, projectCachePath);
  return fs.existsSync(cacheFilePath);
}

export function readCache(hash, projectCachePath) {
  if (!fs) { throw new Error('File system not available'); }
  const cacheFilePath = path.join(projectCachePath, `${hash}.json`);
  return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
}

export function writeCache(hash, data, projectCachePath) {
  if (!fs) {
    // eslint-disable-next-line no-console
    console.error('File system not available');
    return;
  }
  const cacheFilePath = getCacheFilePath(hash, projectCachePath);
  fs.writeFileSync(cacheFilePath, JSON.stringify(data), 'utf8');
}

export function deleteOldCacheFile(hash, projectCachePath) {
  const cacheFilePath = getCacheFilePath(hash, projectCachePath);
  if (fs.existsSync(cacheFilePath)) {
    fs.unlinkSync(cacheFilePath);
  }
}

export function getCacheMapFromFile(fileCacheMapPath) {
  if (fileCacheMapPath) {
    try {
      if (fs.existsSync(fileCacheMapPath)) {
        const fileContent = fs.readFileSync(fileCacheMapPath, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error reading cache file:', error);
    }
  }

  return {};
}

export function updateCacheMapToFile(fileCacheMapPath, filePath, hash) {
  if (fileCacheMapPath) {
    const cacheMap = getCacheMapFromFile(fileCacheMapPath);
    cacheMap[filePath] = hash;
    try {
      fs.mkdirSync(path.dirname(fileCacheMapPath), { recursive: true });
      fs.writeFileSync(fileCacheMapPath, JSON.stringify(cacheMap));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error writing cache file:', error);
    }
  }
}

export async function handleCache(filePath, usfmContent, projectCachePath, fileCacheMapPath) {
  const newHash = getMd5Hash(usfmContent);
  const fileCacheMap = getCacheMapFromFile(fileCacheMapPath);
  const oldHash = fileCacheMap[filePath];

  async function processAndCacheUSJ() {
    const { usj, error } = await convertUsfmToUsj(usfmContent);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error parsing USFM', error);
      return { error };
    }
    writeCache(newHash, usj, projectCachePath);
    updateCacheMapToFile(fileCacheMapPath, filePath, newHash);
    return { usj };
  }

  if (!oldHash) {
    // eslint-disable-next-line no-console
    console.log('No existing hash found. Creating new cache entry.');
    return processAndCacheUSJ();
  }

  if (isCacheValid(oldHash, projectCachePath) && oldHash === newHash) {
    // eslint-disable-next-line no-console
    console.log('Cache hit');
    return { usj: await readCache(oldHash, projectCachePath) };
  }
  // eslint-disable-next-line no-console
  console.log('Cache miss or content changed');
  deleteOldCacheFile(oldHash, projectCachePath);
  return processAndCacheUSJ();
}

export async function updateCache(filePath, usj, usfm, fileCacheMapPath, projectCachePath) {
  const newHash = getMd5Hash(usfm);
  const fileCacheMap = getCacheMapFromFile(fileCacheMapPath);
  const oldHash = fileCacheMap[filePath];

  if (oldHash && isCacheValid(oldHash, projectCachePath) && oldHash === newHash) {
    writeCache(oldHash, usj, projectCachePath);
  } else {
    if (oldHash) {
      deleteOldCacheFile(oldHash, projectCachePath);
    }
    writeCache(newHash, usj, projectCachePath);
    updateCacheMapToFile(fileCacheMapPath, filePath, newHash);
  }
}
