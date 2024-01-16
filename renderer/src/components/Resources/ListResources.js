/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/control-has-associated-label */
import {
  useEffect, useState, useContext,
} from 'react';
import { useTranslation } from 'react-i18next';
import CheckHelpsUpdatePopUp from '@/components/Resources/ResourceUtils/CheckHelpsUpdatePopUp';
import RemoveResource from '@/components/Resources/ResourceUtils/RemoveResource';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { ProjectContext } from '@/components/context/ProjectContext';
import * as logger from '../../logger';
import LoadingScreen from '../Loading/LoadingScreen';

import DownloadCreateSBforHelps from './ResourceUtils/DownloadCreateSBforHelps';
import { fetchTranslationResource } from './useFetchTranslationResource';
import readLocalResources from './useReadLocalResources';
import handleChangeQuery from './useHandleChangeQuery';

export const ListResources = ({
  loading,
  setLoading,
  filteredResources,
  downloading,
  selectResource,
  handleRowSelect,
  currentDownloading,
  setCurrentDownloading,
  setOpenSnackBar,
  setError,
  setSnackText,
  setDownloading,
  selectedPreProd,
  subMenuItems,
  setSubMenuItems,
  setCurrentFullResources,
  setFilteredResources,
  setfilteredBibleObsAudio,
}) => {
  const {
    states: {
      username,
    },
  } = useContext(ProjectContext);

  // For loading Static data
  // function createData(name, language, owner) {
  //   return {
  //     name, language, owner,
  //   };
  // }
  // const translationWordLists = [
  //   createData('English', 'en', 'Door43-catalog'),
  //   createData('Spanish', 'es-419', 'es-419_gl'),
  // ];

  const { t } = useTranslation();
  const [translationWordList, settranslationWordList] = useState([]);
  const [translationNote, setTranslationNote] = useState([]);
  // Nicolas : added juxtalinear useState
  // const [juxtalinear, setJuxtalinear] = useState([]);
  const [translationQuestion, setTranslationQuestion] = useState([]);
  const [translationWord, settranslationWord] = useState([]);
  const [translationAcademy, setTranslationAcademy] = useState([]);
  const [obsTranslationNote, setObsTranslationNote] = useState([]);
  const [obsTranslationQuestion, setObsTranslationQuestion] = useState([]);
  const [obsTranslationWordList, setObsTranslationWordList] = useState([]);
  const [renderApp, setRenderApp] = useState(false);
  const handleDownloadHelpsResources = async (event, reference, offlineResource) => {
    if (!downloading) {
      try {
        logger.debug('ResourcesPopUp.js', 'Helps Download started');
        setCurrentDownloading(reference);
        await DownloadCreateSBforHelps(reference?.responseData, setDownloading, false, offlineResource);
        setCurrentDownloading(null);
        setOpenSnackBar(true);
        setError('success');
        setRenderApp(true);
        setSnackText('Resource Download Finished');
      } catch (err) {
        logger.debug('ResourcesPopUp.js', 'Error Downlaod ', err);
        setOpenSnackBar(true);
        setError('failure');
        setSnackText(err?.message);
      }
    } else {
      setOpenSnackBar(true);
      setError('warning');
      setSnackText('Download in progress');
    }
  };
  const snackBarAction = {
    setOpenSnackBar,
    setError,
    setSnackText,
  };
  useEffect(() => {
    (async () => {
      setLoading(true);
      logger.debug('ResourcesPopUp.js', `get available selected resources ${selectResource}`);
      switch (selectResource) {
        // Nicolas : add a case here to list juxta in popup menu
        // case 'jxl':
        //   await fetchTranslationResource('Juxtalinear', setJuxtalinear, selectResource, selectedPreProd, snackBarAction);
        //   break;
        case 'tn':
          await fetchTranslationResource('TSV Translation Notes', setTranslationNote, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'tw':
          await fetchTranslationResource('Translation Words', settranslationWord, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'twlm':
          await fetchTranslationResource('TSV Translation Words Links', settranslationWordList, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'tq':
          await fetchTranslationResource('Translation Questions', setTranslationQuestion, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'obs-tn':
          await fetchTranslationResource('OBS Translation Notes&subject=tsv obs Translation notes', setObsTranslationNote, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'obs-tq':
          await fetchTranslationResource('OBS Translation Questions', setObsTranslationQuestion, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'obs-twlm':
          await fetchTranslationResource('TSV OBS Translation Words Links', setObsTranslationWordList, selectResource, selectedPreProd, snackBarAction);
          break;
        case 'ta':
          await fetchTranslationResource('Translation Academy', setTranslationAcademy, selectResource, selectedPreProd, snackBarAction);
          break;
        default:
          break;
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectResource, selectedPreProd]);

  useEffect(() => {
    const getCurrentOnlineOfflineHelpsResources = (selectResource) => {
      const resources = [
        // Nicolas : add another resource Juxtalinear
        // { id: 'jxl', title: "Juxtalinear", resource: juxtalinear },
        { id: 'tn', title: t('label-resource-tn'), resource: translationNote },
        { id: 'twlm', title: t('label-resource-twl'), resource: translationWordList },
        { id: 'tw', title: t('label-resource-twlm'), resource: translationWord },
        { id: 'tq', title: t('label-resource-tq'), resource: translationQuestion },
        { id: 'ta', title: t('label-resource-ta'), resource: translationAcademy },
        { id: 'obs-tn', title: t('label-resource-obs-tn'), resource: obsTranslationNote },
        { id: 'obs-tq', title: t('label-resource-obs-tq'), resource: obsTranslationQuestion },
        { id: 'obs-twlm', title: t('label-resource-obs-twl'), resource: obsTranslationWordList }];
      const reference = resources.find((r) => r.id === selectResource);
      const offlineResource = subMenuItems ? subMenuItems?.filter((item) => item?.value?.agOffline && item?.value?.dublin_core?.identifier === selectResource) : [];
      return { reference, offlineResource };
    };
    const data = getCurrentOnlineOfflineHelpsResources(selectResource);
    setCurrentFullResources(data);
    handleChangeQuery('', data, selectResource, setFilteredResources, subMenuItems, setfilteredBibleObsAudio);
  }, [selectResource, loading, subMenuItems, selectedPreProd]);

  useEffect(() => { // LOADS locally available
    readLocalResources(username, setSubMenuItems);
    if (renderApp === true) {
      setRenderApp(false);
    }
  }, [renderApp]);

  return (
    <div className="h-full">
      {selectResource
        && loading ? <LoadingScreen />
        : selectResource && Object.keys(filteredResources).length > 0 && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th colSpan={2} className="px-5 py-3 font-bold text-gray-700 uppercase tracking-wider">
                  {t('label-name')}
                </th>
                <th className="px-5 py-3 font-bold text-gray-700 uppercase tracking-wider">
                  {t('label-language')}
                </th>
                <th colSpan={3} />
              </tr>
            </thead>
            <tbody>
              {/* offline resources head */}
              {filteredResources?.offlineResource?.length > 0 && (
                <tr className="bg-gray-100 border-y-2">
                  <td colSpan="6" className="p-2 text-gray-900 font-bold">
                    Downloaded Resources
                  </td>
                </tr>
              )}
              {/* offline resources body */}
              {filteredResources?.offlineResource?.length > 0 && filteredResources?.offlineResource?.map((resource) => (
                <tr className={`${resource?.value?.meta?.stage === 'preprod' && 'bg-yellow-200'} hover:bg-primary hover:text-white`} id={resource?.projectDir} key={resource.value.meta.id + resource.value.meta.language}>
                  <td colSpan={2} className="p-2">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(
                        e,
                        resource?.value?.meta?.language,
                        `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`,
                        resource?.value?.meta?.owner,
                        resource?.value?.meta?.subject,
                        '',
                        resource,
                      )}
                      role="button"
                      tabIndex="0"
                    >
                      {resource?.value?.meta?.name}
                      <span className="text-xxs lowercase text-gray-800 px-2 py-1 mx-1 bg-gray-200 rounded-full">
                        {resource?.value?.meta?.owner}
                      </span>
                      {resource?.value?.localUploadedHelp && (
                      <span className="text-xxs text-gray-800 px-2 py-1 mx-1 bg-green-200 rounded-full">
                        Uploaded
                      </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 uppercase">
                    <div
                      // className="focus:outline-none"
                      onClick={(e) => handleRowSelect(
                        e,
                        resource?.value?.meta?.language,
                        `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`,
                        resource?.value?.meta?.owner,
                        resource?.value?.meta?.subject,
                        '',
                        resource,
                      )}
                      role="button"
                      tabIndex="0"
                    >
                      {resource?.value?.meta?.language}
                    </div>
                  </td>
                  <td className="p-2 text-gray-600">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(
                      e,
                      resource?.value?.meta?.language,
                      `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`,
                      resource?.value?.meta?.owner,
                      resource?.value?.meta?.subject,
                      '',
                      resource,
                      )}
                      role="button"
                      tabIndex="0"
                    >
                      {resource?.value?.meta && !resource?.value?.localUploadedHelp && `${(resource.value.meta.released).split('T')[0]}`}
                    </div>
                  </td>
                  <td className="p-2 text-gray-600">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(
                        e,
                        resource?.value?.meta?.language,
                        `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`,
                        resource?.value?.meta?.owner,
                        resource?.value?.meta?.subject,
                        '',
                        resource,
                      )}
                      role="button"
                      tabIndex="0"
                    >
                      {resource?.value?.meta?.release.tag_name}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex justify-center items-center gap-4">
                      <div className="text-xxs text-gray-400">
                        {resource?.value?.lastUpdatedAg?.split('T')[0]}
                      </div>
                      <div className="flex justify-center items-center gap-4">
                        {!resource?.value?.localUploadedHelp && (
                        <CheckHelpsUpdatePopUp resource={resource} selectResource={selectResource} />
                      )}
                        <RemoveResource
                          resource={resource}
                          selectResource={selectResource}
                          setRenderApp={setRenderApp}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              <tr className="bg-gray-100 border-y-2">
                <td colSpan="6" className="p-2 text-gray-900 font-bold">
                  {t('label-online-resources')}
                </td>
              </tr>

              {/* online resources section  */}
              {filteredResources?.onlineResource?.resource?.length > 0 && filteredResources?.onlineResource?.resource?.map((notes) => (
                <tr className={`${notes?.responseData?.stage === 'preprod' && 'bg-yellow-200'} hover:bg-primary hover:text-white group`} id={notes.name} key={notes.name + notes.owner}>
                  <td colSpan={2} className="p-2">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(e, notes.language, `${filteredResources?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                      role="button"
                      tabIndex="0"
                    >
                      {notes.name}
                      <span className="text-xxs lowercase text-gray-800 px-2 py-1 mx-1 bg-gray-200 rounded-full">
                        {notes.owner}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 uppercase">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(e, notes.language, `${filteredResources?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                      role="button"
                      tabIndex="0"
                    >
                      {notes.language}
                    </div>
                  </td>
                  <td className="p-2">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(e, notes.language, `${filteredResources?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                      role="button"
                      tabIndex="0"
                    >
                      {notes?.responseData && `${(notes.responseData.released).split('T')[0]}`}
                    </div>
                  </td>
                  <td className="p-2">
                    <div
                      className="focus:outline-none"
                      onClick={(e) => handleRowSelect(e, notes.language, `${filteredResources?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                      role="button"
                      tabIndex="0"
                    >
                      {notes?.responseData?.release.tag_name}
                    </div>
                  </td>
                  <td className="p-2">
                    {(filteredResources?.onlineResource?.id !== 'twlm' && filteredResources?.onlineResource?.id !== 'obs-twlm') && (
                      <div
                        className="cursor-pointer focus:outline-none flex justify-center items-center"
                        role="button"
                        tabIndex={0}
                        title={t('tooltip-download')}
                        onClick={(e) => handleDownloadHelpsResources(e, notes, filteredResources?.offlineResource)}
                      >
                        {downloading && currentDownloading?.responseData?.id === notes?.responseData?.id ? (
                          <div className="w-5 h-5 text-primary group-hover:text-white">
                            <LoadingScreen />
                          </div>
                        ) : (
                          <div
                            className="text-xs flex w-6 h-6 items-center gap-2 bg-gray-700 text-white group-hover:bg-white group-hover:text-gray-700 cursor-pointer p-1 rounded-full"
                          >
                            <ArrowDownTrayIcon
                              className="w-5 h-5"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        )}
    </div>
  );
};
