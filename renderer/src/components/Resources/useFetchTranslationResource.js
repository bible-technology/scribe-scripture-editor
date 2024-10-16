/* eslint-disable no-undef */
import * as logger from '../../logger';
import { environment } from '../../../environment';

function createData(name, language, owner) {
  return {
    name, language, owner,
  };
}

export const fetchTranslationResource = async (urlpath, setResource, selectResource, selectedPreProd, snackBarAction, endPoint = 'gitea', setFilteredReposResourcelinks = null) => {
  logger.debug('ResourcesPopUp.js', `fetchTranslationResource :  ${selectResource}`);
  // const baseUrl = 'https://git.door43.org/api/catalog/v5/search?';
  // https://git.door43.org/api/v1/catalog/search?metadataType=rc
  // https://qa.door43.org/api/v1/repos/search?flavor=x-juxtalinear
  if (endPoint === 'gitea') {
    const baseUrl = `${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc&metadataType=sb`;
    let url = `${baseUrl}&subject=${urlpath}`;
    if (selectedPreProd) {
      url += '&stage=preprod';
    }
    if (urlpath) {
      const resourceData = [];
      try {
        const fetchedData = await fetch(url);
        const fetchedJson = await fetchedData.json();
        fetchedJson.data?.forEach(async (data) => {
          const createdData = createData(data?.language_title, data?.language, data?.owner);
          createdData.responseData = data;
          resourceData.push(createdData);
        });
        if (resourceData.length === fetchedJson.data?.length) {
          setResource(resourceData);
        }
      } catch (err) {
        snackBarAction?.setOpenSnackBar(true);
        snackBarAction?.setError('failure');
        snackBarAction?.setSnackText('Load Online resource Failed. Might be due to internet');
        logger.debug('ResourcesPopUp.js', `fetchTranslationResource Error ${selectResource} :  ${err}`);
      }
    }
  } else if (endPoint === 'github') {
    const baseUrl = `${environment.GITHUB_API_ENDPOINT}/orgs/Proskomma/repos?per_page=100`;
    const url = baseUrl;

    const resourceData = [];
    try {
      const fetchedData = await fetch(url);
      const fetchedJson = await fetchedData.json();

      // Filter repositories by topic (e.g., 'study-notes')
      let filteredRepos;
      let filteredReposResourcelinks;
      if (selectResource === 'tn') {
        filteredRepos = fetchedJson.filter((repo) => repo.topics.includes('burrito' && 'bcvnotes'));
      } else if (selectResource === 'tir') {
        filteredRepos = fetchedJson.filter((repo) => repo.topics.includes('burrito' && 'imagedict') || repo.topics.includes('burrito' && 'videolinks') );
        filteredReposResourcelinks = fetchedJson.filter((repo) => repo.topics.includes('burrito' && 'resourcelinks'));
      }

      let createdData;
      filteredRepos.forEach((repo) => {
        createdData = createData(repo?.name, repo?.language, repo?.owner?.login);
        createdData.responseData = repo;
        createdData.zipball_url = `${environment.GITHUB_SERVER}/Proskomma/${repo?.name}/archive/refs/heads/main.zip`;
        resourceData.push(createdData);
      });

      const resourceLinkData = [];
      if (setFilteredReposResourcelinks !== null) {
        filteredReposResourcelinks.forEach((repo) => {
          createdData = createData(repo?.name, repo?.language, repo?.owner?.login);
          createdData.responseData = repo;
          createdData.zipball_url = `${environment.GITHUB_SERVER}/Proskomma/${repo?.name}/archive/refs/heads/main.zip`;
          resourceLinkData.push(createdData);
        });
      }

      if (resourceData.length === filteredRepos.length) {
        setResource(resourceData);
      }

      if (resourceLinkData.length > 0) {
        setFilteredReposResourcelinks(resourceLinkData);
      }
    } catch (err) {
      snackBarAction?.setOpenSnackBar(true);
      snackBarAction?.setError('failure');
      snackBarAction?.setSnackText('Load Online resource Failed. Might be due to internet');
      logger.debug('ResourcesPopUp.js', `fetchTranslationResource Error ${selectResource} :  ${err}`);
    }
  }
};
