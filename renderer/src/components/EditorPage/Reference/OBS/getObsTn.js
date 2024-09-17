// Get OBS TN and TQ usign the APIs
import * as logger from '../../../../logger';
import ObsTsvToChapterLevelMd from './ObsTsvToChapterLevel';
import tsvJSON from './TsvToJson';

export const getObsTn = async (owner, repo, path, chapter, languageId, scrollLock, flavor) => {
  logger.debug('getObsTn.js', 'Fetch Tn content of OBS');
  const BaseUrl = 'https://git.door43.org/api/v1/repos/';
  const error = {};
  return new Promise((resolve) => {
    fetch(`${BaseUrl}${owner}/${repo}/contents`)
      .then((data) => data.json())
      .then(async (data) => {
        const file = [];
        if (!data?.message && data?.some((obj) => obj.name === 'content')) {
        // check for content dir in response and proceed with md fetch
          fetch(`${BaseUrl}${owner}/${repo}/contents/${path}`)
            .then((data) => data.json())
            .then((data) => {
              data?.forEach((content) => {
                fetch(content.download_url)
                  .then((tnNotes) => tnNotes.text())
                  .then((tnNote) => {
                    file.push({
                      name: (content.name).replace('.md', ''),
                      OccurrenceNote: tnNote,
                    });
                    // resolve(file);
                  }).finally(() => {
                    resolve(file);
                  });
              });
              error.status = false;
            }).catch((err) => {
              resolve([]);
              error.status = false;
              error.msg = err.message || err;
            });
        } else if (!data?.message && data?.some((obj) => obj.name?.endsWith('.tsv'))) {
        // check for obs tsv file
          const tsvObjArr = data.filter((obj) => obj.name.endsWith('.tsv'));
          if (tsvObjArr?.length === 1) {
            const tsvfetchResp = await fetch(tsvObjArr[0]?.download_url);
            if (tsvfetchResp.ok) {
              const tsvData = await tsvfetchResp.text();
              const obsTsvJson = tsvData && await tsvJSON(tsvData);
              await ObsTsvToChapterLevelMd(obsTsvJson, chapter, `${BaseUrl}${owner}/${languageId}_tw/contents`, repo, scrollLock, flavor).then((chapterTsvData) => {
                logger.debug('inside OBS TN online  TSV resource : generated chapter Md level occurencenot Array');
                error.status = false;
                resolve(chapterTsvData);
              });
            }
          }
        } else {
          logger.debug('Invalid URL , No content Directory or No Tsv file');
          error.status = true;
          error.msg = 'Invalid URL , No content Directory or Tsv file';
          resolve([]);
        }
      });
  });
};
