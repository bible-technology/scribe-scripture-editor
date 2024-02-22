/* eslint-disable no-undef */
import * as logger from '../../logger';
import { environment } from '../../../environment';

function createData(name, language, owner) {
  return {
    name, language, owner,
  };
}
export const fetchTranslationResource = async (urlpath, setResource, selectResource, selectedPreProd, snackBarAction) => {
  logger.debug('ResourcesPopUp.js', `fetchTranslationResource :  ${selectResource}`);
  // const baseUrl = 'https://git.door43.org/api/catalog/v5/search?';
  // https://git.door43.org/api/v1/catalog/search?metadataType=rc
  // https://qa.door43.org/api/v1/repos/search?flavor=x-juxtalinear
  const baseUrl = `${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc&metadataType=sb`;
  let url = `${baseUrl}subject=${urlpath}`;
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
};
