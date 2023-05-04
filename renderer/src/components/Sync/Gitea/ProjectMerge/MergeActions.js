import * as logger from '../../../../logger';
import { environment } from '../../../../../environment';
import { uploadProjectToBranchRepoExist } from './ProjectMergeUtils';

export async function tryMergeProjects(selectedGiteaProject, ignoreFilesPaths, actions) {
  let uploadResp = false;
  try {
    logger.debug('MergeActions.js', 'Try Merge Project started');
    // uplaod local project to merge branch
    console.log('work till here - 1 try merge start');
    uploadResp = await uploadProjectToBranchRepoExist(selectedGiteaProject, ignoreFilesPaths);
    if (uploadResp) {
      logger.debug('MergeActions.js', 'Try Merge Project - Local project upload success, send PR');
      // local project uploaded successfully and send PR
      actions.setStepCount((prevStepCount) => prevStepCount + 1);
      const urlPr = `${environment.GITEA_API_ENDPOINT}/repos/${selectedGiteaProject?.repo?.owner?.username}/${selectedGiteaProject?.repo?.name}/pulls`;
      const myHeaders = new Headers();
      myHeaders.append('Authorization', `Bearer ${selectedGiteaProject.auth.token.sha1}`);
      myHeaders.append('Content-Type', 'application/json');
      const payloadPr = JSON.stringify({
        base: `${selectedGiteaProject.branch.name}-merge`,
        head: selectedGiteaProject.branch.name,
        title: `Merge ${selectedGiteaProject.branch.name} to ${selectedGiteaProject.branch.name}-merge`,
      });
      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: payloadPr,
        redirect: 'follow',
      };
      const fetchResult = await fetch(urlPr, requestOptions);
      const result = await fetchResult.json();
      if (fetchResult.ok) {
        if (result.mergeable) {
          // mergeable
          logger.debug('MergeActions.js', 'PR success - continue Merge operations');
          actions.setStepCount((prevStepCount) => prevStepCount + 1);
          const mergePayload = JSON.stringify({
            Do: 'merge',
            delete_branch_after_merge: false,
            });
          requestOptions.body = mergePayload;
          const urlMerge = `${environment.GITEA_API_ENDPOINT}/repos/${selectedGiteaProject?.repo?.owner?.username}/${selectedGiteaProject?.repo?.name}/pulls/${result.number}/merge`;
          const mergeResult = await fetch(urlMerge, requestOptions);

          if (mergeResult.status === 200) {
            logger.debug('MergeActions.js', 'Successfully Merged');
            // returnData = { status: 'success', message: 'Merge Success' };
            return { status: 'success', message: 'Merge Success' };
          } if (mergeResult.status === 405) {
            logger.debug('MergeActions.js', 'Can not merge - nothing to merge or error ', mergeResult.resposne.statusText);
            throw new Error(mergeResult.resposne.statusText);
          } if (mergeResult.status === 404) {
            logger.debug('MergeActions.js', 'File not found on server ', mergeResult.resposne.statusText);
            throw new Error(mergeResult.resposne.statusText);
          }
        } else {
          // merge is not possible - conflict , Display Conflict Message
          let htmlPart = '<div></div>';
          const fetchConflict = await fetch(result.html_url);
          const resultDiff = await fetchConflict.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(resultDiff, 'text/html');
          htmlPart = doc.getElementsByClassName('merge-section');
          return { status: 'failure', message: 'Conflict Exist - Can not perform Merge , Need to fix manually', conflictHtml: htmlPart[0].innerHTML };
        }
      } else {
        throw new Error(result?.resposne?.statusText);
      }
    }
  } catch (err) {
      logger.debug('MergeActions.js', `failed Merge Action ${err}`);
      throw new Error(err?.message || err);
  }
}
