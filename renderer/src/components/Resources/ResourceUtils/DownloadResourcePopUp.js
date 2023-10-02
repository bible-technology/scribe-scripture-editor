/* eslint-disable react/no-danger */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import localForage from 'localforage';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { AutographaContext } from '@/components/context/AutographaContext';
import { InformationCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { isElectron } from '@/core/handleElectron';
import CustomMultiComboBox from './CustomMultiComboBox';
import langJson from '../../../lib/lang/langNames.json';
import { handleDownloadResources, handleDownloadWebResources } from './createDownloadedResourceSB';
import * as logger from '../../../logger';
import { environment } from '../../../../environment';

const subjectTypeArray = {
  bible: [
    { id: 2, name: 'Bible' },
    // { id: 1, name: 'Aligned Bible' },
    // { id: 3, name: 'Hebrew Old Testament' },
    // { id: 4, name: 'Greek New Testament' },
  ],
  obs: [
    { id: 1, name: 'Open Bible Stories' },
  ],
};

function DownloadResourcePopUp({ selectResource, isOpenDonwloadPopUp, setIsOpenDonwloadPopUp }) {
  logger.debug('DownloadResourcePopUp.js', 'in download resource pop up');
  const { t } = useTranslation();
  const [snackBar, setOpenSnackBar] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [loadFilterDiv, setLoadFilterDiv] = useState(false);
  const [snackText, setSnackText] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [notify, setNotify] = useState();
  const [resourceData, setresourceData] = useState([]);
  const [selectedLangFilter, setSelectedLangFilter] = useState([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState([]);
  const [selectedPreProd, setSelectedPreProd] = useState(false);
  // resource Download
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [totalDownload, setTotalDownload] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [downloadCount, setDownloadCount] = useState(0);

  const {
    // states: { resourceDownload },
    action: {
      setNotifications,
      // setResourceDownload,
    },
  } = React.useContext(AutographaContext);

  const addNewNotification = async (title, text, type) => {
    localForage.getItem('notification').then((value) => {
      const temp = [...value];
      temp.push({
        title,
        text,
        type,
        time: moment().format(),
        hidden: true,
      });
      setNotifications(temp);
    });
  };

  const fetchResource = async (filter) => {
    logger.debug('DownloadResourcePopUp.js', 'fetching resource as per filter applied');
    setLoading(true);
    // subject = bible and lang = en - if not custom filter or initial loading
    // const baseUrl = 'https://git.door43.org/api/catalog/v5/search';
    const baseUrl = `${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc`;
    let url = '';
    if (filter) {
      url = `${baseUrl}`;
      if (selectedLangFilter.length > 0) {
        selectedLangFilter.forEach((row) => {
          url += `&lang=${row?.lc ? row?.lc : row?.code}`;
        });
      }
      if (selectedTypeFilter.length > 0) {
        selectedTypeFilter.forEach((row) => {
          url += `&subject=${row.name}`;
        });
      } else {
        // nothing selected default will be bible || obs
        switch (selectResource) {
          case 'bible':
            url += '&subject=Bible';
            break;
          case 'obs':
            url += `&subject=${subjectTypeArray.obs[0].name}`;
            break;
          default:
            break;
        }
      }
    } else {
      // initial load
      switch (selectResource) {
        case 'bible':
          url = `${baseUrl}&subject=Bible&lang=en`;
          break;
        case 'obs':
          url = `${baseUrl}&subject=${subjectTypeArray.obs[0].name}&lang=en`;
          break;
        default:
          break;
      }
    }
    // pre-release items
    if (selectedPreProd) {
      url += '&stage=preprod';
    }
    // url = 'https://git.door43.org/api/catalog/v5/search?subject=Aligned%20Bible&subject=Bible&lang=en&lang=ml&lang=hi';
    const temp_resource = {};
    selectedLangFilter.forEach((langObj) => {
      temp_resource[langObj.lc] = [];
    });
    // fetch request abort
    const controller = new AbortController();
    const signal = controller.signal;
    try {
      const fetchedData = await fetch(url, { signal }).catch((err) => {
        if (err?.message === 'Failed to fetch') {
          throw new Error('Something went wrong');
        } else {
          throw new Error(err);
        }
      });
      const fetchedDataJson = await fetchedData.json();
      logger.debug('DownloadResourcePopUp.js', 'generating language based resources after fetch');
      fetchedDataJson.data.forEach((element) => {
        element.isChecked = false;
        if (element.language in temp_resource) {
          temp_resource[element.language].push(element);
        } else {
          temp_resource[element.language] = [element];
        }
      });
      setresourceData(temp_resource);
      setLoading(false);
    } catch (err) {
      logger.debug('DownloadResourcePopUp.js', 'Error on fetch content : ', err);
      setLoading(false);
      setOpenSnackBar(true);
      setNotify('failure');
      setSnackText(`${err.message || err} , Error might be due to NO/ too Slow Internet`);
      controller.abort();
    }
  };

  const handleClearFilter = () => {
    logger.debug('DownloadResourcePopUp.js', 'In clear filter');
    setSelectedLangFilter([]);
    setSelectedTypeFilter([]);
    setSelectedPreProd(false);
  };

  const handleSaveFilter = async () => {
    logger.debug('DownloadResourcePopUp.js', 'save filter and call fetch');
    if (!downloadStarted) {
      // setLoadFilterDiv(!loadFilterDiv);
      if (selectedLangFilter.length > 0 || selectedTypeFilter.length > 0) {
        await fetchResource(true);
      } else {
        setOpenSnackBar(true);
        setNotify('warning');
        setSnackText('No filter applied, please select filter');
      }
    } else {
      setOpenSnackBar(true);
      setNotify('warning');
      setSnackText('Please Wait, Download in progrss');
    }
  };

  const handleRemoveAccordion = (langCode) => {
    const resourceDataFiltered = [];
    // eslint-disable-next-line array-callback-return
    Object.keys(resourceData).filter((element) => {
      if (element.toLowerCase() !== langCode.toLowerCase()) {
        resourceDataFiltered[element] = resourceData[element];
      }
    });
    setresourceData(resourceDataFiltered);
  };

  const handleDownload = async (obj) => {
    const temp_resource = resourceData;
    if (obj.selection === 'full') {
      // eslint-disable-next-line array-callback-return
      temp_resource[obj.id].map((row) => {
        row.isChecked = true;
      });
    } else if (obj.selection === 'single') {
      // eslint-disable-next-line array-callback-return
      temp_resource[obj.parent].filter((row) => {
        if (row.id === obj.id) {
          row.isChecked = true;
        }
      });
    }
    setresourceData((current) => ({
      ...current,
      ...temp_resource,
    }));

    logger.debug('DownloadResourcePopUp.js', 'in handle download - call for download selected');
    // check total count to download
    const selectedResourceCount = Object.keys(resourceData).reduce((acc, key) => {
      const checkedData = resourceData[key].filter((data) => data.isChecked);
      return acc + checkedData.length;
    }, 0);
    try {
      if (selectedResourceCount > 0) {
        if (downloadStarted) {
          // console.log('downlaod in progress');
          throw new Error('Download in progress, please wait');
        }
        setTotalDownload(selectedResourceCount);
        logger.debug('DownloadResourcePopUp.js', 'In resource download all resource loop');
        // console.log('resource download started ---', selectedResourceCount);
        setDownloadStarted(true);
        const action = { setDownloadCount };
        isElectron() ? await handleDownloadResources(resourceData, selectResource, action) : await handleDownloadWebResources(resourceData, selectResource, action)
          .then(async (resolveResp) => {
            if (selectedResourceCount === resolveResp?.existing) {
              setOpenSnackBar(true);
              setNotify('Warning');
              setSnackText('Existing Resource');
            } else if (resolveResp?.existing === 0) {
              setOpenSnackBar(true);
              setNotify('success');
              setSnackText(`All ${selectedResourceCount} Resource Downloaded Succesfully`);
            } else {
              setOpenSnackBar(true);
              setNotify('success');
              setSnackText(`Downloaded ${selectedResourceCount - resolveResp.existing} Resource Downloaded Succesfully
          , ${resolveResp.existing} Resources are existing`);
            }
            await addNewNotification(
              'Resource Download',
              `Total Resources : ${selectedResourceCount} \n
            Existing Resources : ${resolveResp.existing} \n
            Downloaded Resources : ${selectedResourceCount - resolveResp.existing} `,
              'success',
            );
            // setDownloadCount((prev) => prev + 1);
          }).catch((err) => {
            setDownloadStarted(false);
            setTotalDownload(0);
            throw new Error(`Resource download Failed :  ${err}`);
          });
        // console.log('DOWNLOAD FINISHED');
        setDownloadStarted(false);
        setTotalDownload(0);
        setDownloadCount(0);
        logger.debug('DownloadResourcePopUp.js', 'Completed Download all resource selected');
      } else {
        logger.debug('DownloadResourcePopUp.js', 'No resource selected to download - warning');
        setOpenSnackBar(true);
        setNotify('warning');
        setSnackText('please select Resource to Download');
        // console.log('please select Resource to Download');
      }
    } catch (err) {
      setOpenSnackBar(true);
      setNotify('failure');
      setSnackText(`Error : ${err?.message || err}`);
    }
  };

  useEffect(() => {
    logger.debug('DownloadResourcePopUp.js', 'in useEffect initial load of resource');
    fetchResource(false);
    // setLoading(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const classes = useStyles();

  const removeLanguage = (idx) => {
    selectedLangFilter.splice(idx, 1);
    setSelectedLangFilter([...selectedLangFilter]);
  };

  return (
    <>
      <div className="text-sm flex flex-col gap-4 border-b border-gray-300 pb-4 mb-4">
        <div class="flex items-center gap-4">
          <label htmlFor="filter-lang" className="font-bold w-24">{t('label-lang')}</label>
          <CustomMultiComboBox
            selectedList={selectedLangFilter}
            setSelectedList={setSelectedLangFilter}
            customData={langJson.filter((lang) => lang?.ang.trim() !== '')}
            // customData={langJson}
            filterParams="ang"
            multiSelect
            dropArrow
          />
          <button type="button" className="" title={t('msg-min-three-letter')}>
            <InformationCircleIcon
              className="h-5 w-5 mr-5"
              aria-hidden="true"
            />
          </button>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {selectedLangFilter.map((language, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center gap-2 px-3 py-1 bg-gray-200 rounded-full"
              >
                <p>{language.ang}</p>
                <button type="button" onClick={() => removeLanguage(idx)}>
                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <label htmlFor="filter-type" className="font-bold w-24">{t('label-type')}</label>
          <CustomMultiComboBox
            selectedList={selectedTypeFilter}
            setSelectedList={setSelectedTypeFilter}
            customData={selectResource === 'bible' ? subjectTypeArray.bible : subjectTypeArray.obs}
            multiSelect
          />
        </div>

        <div class="flex items-center gap-4">
          <label htmlFor="pre-prod" className="font-bold w-24">{t('label-pre-release')}</label>
          <input
            id="pre-prod"
            name="pre-prod"
            type="checkbox"
            checked={selectedPreProd}
            onChange={(e) => setSelectedPreProd(e.target.checked)}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            className="bg-error leading-loose rounded shadow text-xs px-2 font-base text-white tracking-wide uppercase"
            onClick={handleClearFilter}
          >
            {t('btn-clear')}
          </button>
          <button
            type="button"
            className="bg-success leading-loose rounded shadow text-xs px-2 font-base text-white tracking-wide uppercase"
            onClick={handleSaveFilter}
          >
            {t('label-save-filter')}
          </button>
        </div>
      </div>

      {loading ? <LoadingScreen />
        : downloadStarted
          ? (
            <div className="flex justify-evenly items-center text-sm font-medium text-center">
              <LoadingScreen />
              <div className="p-1">

                <span className="ml-2">
                  {totalDownload}
                </span>
              </div>
            </div>
          )
          : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th className="p-2 font-bold text-gray-700 uppercase tracking-wider w-8" />
                  <th className="p-2 font-bold text-gray-700 uppercase tracking-wider">
                    {t('label-resource')}
                  </th>
                  <th className="p-2 font-bold text-gray-700 uppercase tracking-wider">
                    {t('label-subject')}
                  </th>
                  <th className="p-2 font-bold text-gray-700 uppercase tracking-wider">
                    {t('label-organization')}
                  </th>
                  <th className="p-2 font-bold text-gray-70'0 uppercase tracking-wider">
                    {t('label-version')}
                    /
                    {t('label-release')}
                  </th>
                  <th className="p-2 font-bold text-gray-700 uppercase tracking-wider" />
                </tr>
              </thead>
              <tbody>
                {Object.keys(resourceData).map((element) => (
                  <>
                    <tr>
                      <td className="p-2 bg-primary-50 rounded-l-lg font-bold" colSpan={5}>
                        <h4 className={`${resourceData[element].length > 0 ? '' : ' text-red-600'} `}>
                          {`(${element}) ${resourceData[element].length > 0 ? resourceData[element][0].language_title : t('label-no-content-available')} `}
                        </h4>
                      </td>
                      <td className="p-2 bg-primary-50 rounded-r-lg">
                        <div className="flex items-center justify-center gap-4">
                          {/* disable all download together - added because earlier have checkboxs to select multi resources */}
                          {/* <button
                            className="text-xs flex w-6 h-6 items-center gap-2 bg-gray-700 text-white cursor-pointer p-1 rounded-full"
                            type="button"
                            title="download"
                            onClick={() => handleDownload({ selection: 'full', id: element })}
                          >
                            <ArrowDownTrayIcon
                              className="w-4 h-4"
                            />
                          </button> */}
                          <div className="flex w-6 h-6 items-center gap-2 bg-red-200 text-red-600 cursor-pointer p-1 rounded-full">
                            <XMarkIcon
                              className="h-4 w-4 transform transition duration-200 hover:scale-[1.5]"
                              onClick={() => handleRemoveAccordion(element)}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>

                    {resourceData[element].length > 0 ? (
                      resourceData[element]?.map((row) => (
                        <tr className={`${row.stage === 'preprod' && 'bg-yellow-200'} hover:bg-primary hover:text-white group`}>
                          <td className="w-8 p-2" />
                          <td className="p-2">{row.name}</td>
                          <td className="p-2">{row.subject}</td>
                          <td className="p-2">{row.owner}</td>
                          <td className="p-2">
                            {`${(row.released).split('T')[0]} (${row.release.tag_name})`}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center justify-center gap-4">
                              <button
                                className="text-xs flex w-6 h-6 items-center gap-2 bg-gray-700 text-white group-hover:bg-white group-hover:text-gray-700 cursor-pointer p-1 rounded-full"
                                type="button"
                                title={t('tooltip-download')}
                                onClick={() => handleDownload({ selection: 'single', id: row.id, parent: element })}
                              >
                                <ArrowDownTrayIcon
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center ">
                          <div className="flex flex-col items-center gap-1 mt-3">

                            {/* <div>This content is unavailable for this language</div>
                            <div>
                              You can Import Own
                              {' '}
                              <span className="font-medium">Scripture Burrito</span>
                              {' '}
                              Resources through
                              <span className="font-medium"> Collection </span>
                              tab.
                            </div>
                            <div>
                              Learn more about creating Scripture Burrito projects with Scribe. Refer Scribe Docs.
                            </div> */}

                            <div dangerouslySetInnerHTML={{ __html: t('msg-no-resource-for-bible-obs-download') }} />
                          </div>

                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>

            </table>
          )}

      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />

    </>
  );
}

DownloadResourcePopUp.propTypes = {
  selectResource: PropTypes.string,
  isOpenDonwloadPopUp: PropTypes.bool,
  setIsOpenDonwloadPopUp: PropTypes.func,
};

export default DownloadResourcePopUp;
