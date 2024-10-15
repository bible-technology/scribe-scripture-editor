import { getCachePaths } from './hooks/useReadUsfmFile';
import { convertUsjToUsfm } from './conversionUtils';
import { updateCache } from './cacheUtils';
import { saveToFile } from './hooks/saveToFile';

export async function updateCacheNSaveFile(usj, bookId) {
  const usfm = await convertUsjToUsfm(usj);
  const { filePath, projectCachePath, fileCacheMapPath } = await getCachePaths(bookId);
  updateCache(filePath, usj, usfm, fileCacheMapPath, projectCachePath);
  if (usfm) {
    await saveToFile(usfm, bookId);
    // eslint-disable-next-line no-console
    console.log('updated usfm file saved');
  }
}
