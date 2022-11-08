/* eslint-disable no-nested-ternary */
import React, {
  useEffect, useRef, useState, Fragment, useContext,
} from 'react';
import PropTypes from 'prop-types';

import * as localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon, PlusCircleIcon } from '@heroicons/react/solid';
import { isElectron } from '@/core/handleElectron';
import { readRefMeta } from '@/core/reference/readRefMeta';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { writeCustomResources } from '@/core/reference/writeCustomResources';
import { readCustomResources } from '@/core/reference/readCustomResources';
import { SnackBar } from '@/components/SnackBar';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { SearchIcon, StarIcon } from '@heroicons/react/outline';
import DownloadSvg from '@/icons/basil/Outline/Files/Download.svg';
import ResourceOption from './ResourceOption';
import ImportResource from './ImportResource';
import * as logger from '../../../logger';
import DownloadResourcePopUp from './ResourceUtils/DownloadResourcePopUp';
import DownloadCreateSBforHelps from './ResourceUtils/DownloadCreateSBforHelps';
import CheckHelpsUpdatePopUp from './ResourceUtils/CheckHelpsUpdatePopUp';
import RemoveResource from './ResourceUtils/RemoveResource';

function createData(name, language, owner) {
  return {
    name, language, owner,
  };
}
const translationNotes = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'Es-419_gl'),
  createData('Hindi', 'hi', 'Door43-catalog'),
  createData('Bengali', 'bn', 'Door43-catalog'),
  createData('Malayalam', 'ml', 'Door43-catalog'),
  createData('Gujarati', 'gu', 'Door43-catalog'),
];
const translationWordLists = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'es-419_gl'),
];
const translationQuestions = [
  createData('English', 'en', 'Door43-catalog'),
  createData('Spanish', 'es-419', 'es-419_gl'),
];
const translationAcademys = [
  createData('English', 'en', 'Door43-catalog'),
];
const obsTranslationNotes = [
  createData('Spanish', 'es-419', 'Door43-catalog'),
  createData('English', 'en', 'Door43-catalog'),
];
const obsTranslationQuestions = [
  createData('Spanish', 'es-419', 'Door43-catalog'),
  createData('English', 'en', 'Door43-catalog'),
];

const ResourcesPopUp = ({
  header,
  // languageId,
  openResourcePopUp,
  setOpenResourcePopUp,
  selectedResource,
  setReferenceResources,
}) => {
  const cancelButtonRef = useRef(null);
  const [subMenuItems, setSubMenuItems] = useState();
  const [title, setTitle] = useState(header);
  const [selectResource, setSelectResource] = useState(selectedResource);
  const [showInput, setShowInput] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');
  // const [translationNote, setTranslationNote] = useState(translationNotes);
  // const [translationQuestion, setTranslationQuestion] = useState(translationQuestions);
  const [translationWordList, settranslationWordList] = useState(translationWordLists);
  // const [translationAcademy, setTranslationAcademy] = useState(translationAcademys);
  const [translationNote, setTranslationNote] = useState([]);
  const [translationQuestion, setTranslationQuestion] = useState([]);
  const [translationWord, settranslationWord] = useState([]);
  const [translationAcademy, setTranslationAcademy] = useState([]);
  const [obsTranslationNote, setObsTranslationNote] = useState([]);
  const [obsTranslationQuestion, setObsTranslationQuestion] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dowloading, setDownloading] = useState(false);
  const [currentDownloading, setCurrentDownloading] = useState(null);
  const [resourceIconClick, setResourceIconClick] = useState(false);

  const [filteredResorces, setFilteredResources] = useState({});
  const [filteredBibleObsAudio, setfilteredBibleObsAudioAudio] = useState([]);
  const [currentFullResorces, setCurrentFUllResorces] = useState([]);
  const [selectedPreProd, setSelectedPreProd] = React.useState(false);

  const { t } = useTranslation();
  const {
    states: {
      username,
    },
  } = useContext(ProjectContext);

  const {
    state: {
      openImportResourcePopUp,
    },
    actions: {
      openResourceDialog,
      setOpenImportResourcePopUp,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    if (isElectron()) {
      const fs = window.require('fs');
      const path = require('path');
      const newpath = localStorage.getItem('userPath');
      fs.mkdirSync(path.join(newpath, 'autographa', 'users', username, 'resources'), {
        recursive: true,
      });
      const projectsDir = path.join(newpath, 'autographa', 'users', username, 'resources');
      const parseData = [];
      readRefMeta({
        projectsDir,
      }).then((refs) => {
        refs.forEach((ref) => {
          const metaPath = path.join(newpath, 'autographa', 'users', username, 'resources', ref, 'metadata.json');
          readRefBurrito({
            metaPath,
          }).then((data) => {
            if (data) {
              const burrito = {};
              burrito.projectDir = ref;
              burrito.value = JSON.parse(data);
              parseData.push(burrito);
              localforage.setItem('resources', parseData).then(
                () => localforage.getItem('resources'),
              ).then((res) => {
                setSubMenuItems(res);
              }).catch((err) => {
                // we got an error
                throw err;
              });
            }
          });
        });
      });

      fs.mkdirSync(path.join(newpath, 'autographa', 'common', 'resources'), {
        recursive: true,
      });
      const commonResourceDir = path.join(newpath, 'autographa', 'common', 'resources');

      readRefMeta({
        projectsDir: commonResourceDir,
      }).then((refs) => {
        refs.forEach((ref) => {
          const metaPath = path.join(newpath, 'autographa', 'common', 'resources', ref, 'metadata.json');
          readRefBurrito({
            metaPath,
          }).then((data) => {
            if (data) {
              const burrito = {};
              burrito.projectDir = ref;
              burrito.value = JSON.parse(data);
              parseData.push(burrito);
              localforage.setItem('resources', parseData).then(
                () => localforage.getItem('resources'),
              ).then((res) => {
                setSubMenuItems(res);
              }).catch((err) => {
                // we got an error
                throw err;
              });
            }
          });
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeSection = () => {
    setOpenResourcePopUp(false);
    setTranslationNote('');
    setTranslationQuestion('');
    settranslationWordList('');
    settranslationWord('');
    setTranslationAcademy('');
  };

  const handleRowSelect = (e, row, name, owner, flavorname, offline = false) => {
    const offlineResource = offline
    ? { offline: true, data: offline }
    : { offline: false };
    setReferenceResources({
      selectedResource: selectResource,
      languageId: row,
      refName: name,
      header: title,
      owner,
      offlineResource,
      flavor: flavorname,
    });
    // setOwner(owner);
    removeSection();
  };

  const [isOpenDonwloadPopUp, setIsOpenDonwloadPopUp] = useState(false);

  const openResourceDialogBox = () => {
    // if (selectResource === 'bible') {
    //   logger.debug('DownloadResourcePopUp.js', 'Calling bible resource pop up');
    //   setIsOpenDonwloadPopUp(true);
    // } else {
    //   setOpenImportResourcePopUp(true);
    //   openResourceDialog();
    // }
    if (selectResource === 'bible' || selectResource === 'obs') {
        logger.debug('DownloadResourcePopUp.js', 'Calling bible resource pop up');
        setIsOpenDonwloadPopUp(true);
      }
  };

  function closeImportPopUp() {
    setOpenImportResourcePopUp(false);
  }

  function handleCustomInput(url, key, resourceName) {
    logger.debug('ResourcePopUp.js', 'Open handleCustomInput function to add write custom resource url');
    const resourceId = url.split('/');
    if (((resourceId[resourceId.length - 1].split('_')[1]) === (key === 'twlm' ? 'tw' : key)) && url && resourceName) {
      removeSection();
      writeCustomResources({ resourceUrl: { key, url, resourceName } }).then(() => {
        setOpenSnackBar(true);
        setError('success');
        setSnackText(t('dynamic-msg-resource-added'));
        setOpenResourcePopUp(true);
        setInputUrl('');
        setResourceName('');
        setSelectResource(key);
      });
      setShowInput(false);
    } else {
      logger.error('ResourcePopUp.js', 'Error in adding custom resource url');
      setOpenSnackBar(true);
      setInputUrl('');
      setResourceName('');
      setError('failure');
      setShowInput(false);
      setSnackText(t('dynamic-msg-resource-unable-fetch-url'));
    }
  }

  useEffect(() => {
    readCustomResources({ resourceId: 'tq', translationData: translationQuestion });
    readCustomResources({ resourceId: 'twlm', translationData: translationWordList });
    readCustomResources({ resourceId: 'tw', translationData: translationWord });
    readCustomResources({ resourceId: 'tn', translationData: translationNote });
    readCustomResources({ resourceId: 'ta', translationData: translationAcademy });
    readCustomResources({ resourceId: 'obs-tn', translationData: obsTranslationNote });
    readCustomResources({ resourceId: 'obs-tq', translationData: obsTranslationQuestion });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInput]);

  const fetchTranslationResource = async (urlpath, setResource) => {
    logger.debug('ResourcesPopUp.js', `fetchTranslationResource :  ${selectResource}`);
    const baseUrl = 'https://git.door43.org/api/catalog/v5/search?';
    let url = `${baseUrl}subject=${urlpath}`;
    if (selectedPreProd) {
      url += '&stage=preprod';
    }
    if (urlpath) {
      const resourceData = [];
      await fetch(url)
      .then((res) => res.json())
      .then((response) => {
        response.data.forEach(async (data) => {
          const createdData = createData(data?.language_title, data?.language, data?.owner);
          createdData.responseData = data;
          resourceData.push(createdData);
        });
        if (resourceData.length === response.data.length) {
          setResource(resourceData);
        }
      }).catch((err) => {
        setOpenSnackBar(true);
        setError('failure');
        setSnackText('Load Online resource Failed. Might be due to internet');
        logger.debug('ResourcesPopUp.js', `fetchTranslationResource Error ${selectResource} :  ${err}`);
      });
    }
  };

  const handleDownloadHelpsResources = async (event, reference, offlineResource) => {
    if (!dowloading) {
      try {
        logger.debug('ResourcesPopUp.js', 'Helps Download started');
        // console.log('clicked download : ', reference);
        // set Current downloading
        setCurrentDownloading(reference);
        await DownloadCreateSBforHelps(reference?.responseData, setDownloading, false, offlineResource)
        .then(() => {
          setCurrentDownloading(null);
          setOpenSnackBar(true);
          setError('success');
          setSnackText('Resource Download Finished');
          });
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

  const getCurrentOnlineOfflineHelpsResurces = (selectResource) => {
    const resources = [
      { id: 'tn', title: t('label-resource-tn'), resource: translationNote },
      { id: 'twlm', title: t('label-resource-twl'), resource: translationWordList },
      { id: 'tw', title: t('label-resource-twlm'), resource: translationWord },
      { id: 'tq', title: t('label-resource-tq'), resource: translationQuestion },
      { id: 'ta', title: t('label-resource-ta'), resource: translationAcademy },
      { id: 'obs-tn', title: t('label-resource-obs-tn'), resource: obsTranslationNote },
      { id: 'obs-tq', title: t('label-resource-obs-tq'), resource: obsTranslationQuestion }];
    const reference = resources.find((r) => r.id === selectResource);
    const offlineResource = subMenuItems ? subMenuItems?.filter((item) => item?.value?.agOffline && item?.value?.dublin_core?.identifier === selectResource) : [];
    return { reference, offlineResource };
  };

  const handleChangeQuery = (query, resourceData) => {
    const filtered = { offlineResource: [], onlineResource: { ...resourceData?.reference } || {} };
    if (['tn', 'tw', 'tq', 'ta', 'obs-tn', 'obs-tq', 'twlm'].includes(selectResource.toLowerCase())) {
      if (query?.length > 0) {
        filtered.offlineResource = resourceData?.offlineResource?.filter((data) => {
            const meta = data?.value?.meta;
            // const searchFields = [meta?.language, meta?.language_title, meta?.name, meta?.full_name, meta?.owner].map((v) => v.toLowerCase());
            const searchFields = ['language', 'language_title', 'name', 'full_name', 'owner'].map((v) => v.toLowerCase());
            return searchFields.some((key) => meta[key].toLowerCase().includes(query.toLowerCase()));
        });
        // filtered.onlineResource = resourceData?.reference;
        filtered.onlineResource.resource = [];
        resourceData?.reference?.resource?.forEach((data) => {
          // const searchFields = [data?.language, data?.name, data?.owner].map((v) => v.toLowerCase());
          const searchFields = ['language', 'name', 'owner'].map((v) => v.toLowerCase());
          if (searchFields.some((key) => data[key].toLowerCase().includes(query.toLowerCase()))) {
            filtered?.onlineResource?.resource?.push(data);
          }
        });
        setFilteredResources(filtered);
      } else {
        filtered.offlineResource = resourceData?.offlineResource;
        filtered.onlineResource = resourceData?.reference;
        setFilteredResources(filtered);
      }
    } else if (selectResource === 'bible') {
      const bibleArr = subMenuItems?.filter((ref) => ref?.value?.type?.flavorType?.flavor?.name === 'textTranslation');
      if (query?.length > 0) {
        // eslint-disable-next-line array-callback-return
        const bibleFilter = bibleArr?.filter((item) => {
          if (item?.projectDir.toLowerCase().includes(query.toLowerCase())
          || item?.value?.identification?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.tag?.toLowerCase().includes(query.toLowerCase())) {
            return item;
          }
        });
        setfilteredBibleObsAudioAudio(bibleFilter);
      } else {
        setfilteredBibleObsAudioAudio(bibleArr);
      }
    } else if (selectResource === 'obs') {
      const obsArr = subMenuItems?.filter((ref) => ref?.value?.type?.flavorType?.flavor?.name === 'textStories');
      if (query?.length > 0) {
        // eslint-disable-next-line array-callback-return
        const obsFilter = obsArr.filter((item) => {
          if (item?.projectDir.toLowerCase().includes(query.toLowerCase())
          || item?.value?.identification?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.tag?.toLowerCase().includes(query.toLowerCase())) {
            return item;
          }
        });
        setfilteredBibleObsAudioAudio(obsFilter);
      } else {
        setfilteredBibleObsAudioAudio(obsArr);
      }
    } else if (selectResource === 'audio') {
      const audioArr = subMenuItems?.filter((ref) => ref?.value?.type?.flavorType?.flavor?.name === 'audioTranslation');
      if (query?.length > 0) {
        // eslint-disable-next-line array-callback-return
        const audioFilter = audioArr.filter((item) => {
          if (item?.projectDir.toLowerCase().includes(query.toLowerCase())
          || item?.value?.identification?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.name?.en?.toLowerCase().includes(query.toLowerCase())
          || item?.value?.languages[0]?.tag?.toLowerCase().includes(query.toLowerCase())) {
            return item;
          }
        });
        setfilteredBibleObsAudioAudio(audioFilter);
      } else {
        setfilteredBibleObsAudioAudio(audioArr);
      }
    }
  };

  useEffect(() => {
    (async () => {
      // console.log('resource : ', selectResource);
      logger.debug('ResourcesPopUp.js', `get available selected resources ${selectResource}`);
      setLoading(true);
      switch (selectResource) {
        case 'tn':
            await fetchTranslationResource('TSV Translation Notes', setTranslationNote);
            // console.log('get content : ', translationNote);
          break;
        case 'tw':
          await fetchTranslationResource('Translation Words', settranslationWord);
          // console.log('get content : ', translationWordList);
          break;
        case 'tq':
          await fetchTranslationResource('Translation Questions', setTranslationQuestion);
          // console.log('get content : ', translationQuestion);
        break;
        case 'obs-tn':
          await fetchTranslationResource('OBS Translation Notes', setObsTranslationNote);
          // console.log('get content : ', obsTranslationNote);
        break;
        case 'obs-tq':
          await fetchTranslationResource('OBS Translation Questions', setObsTranslationQuestion);
          // console.log('get content : ', obsTranslationQuestion);
        break;
        case 'ta':
          await fetchTranslationResource('Translation Academy', setTranslationAcademy);
          // console.log('get content : ', translationAcademy);
        break;

          default:
            break;
          }
        setLoading(false);
      })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectResource, selectedPreProd]);

  useEffect(() => {
    const data = getCurrentOnlineOfflineHelpsResurces(selectResource);
    setCurrentFUllResorces(data);
    handleChangeQuery('', data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectResource, loading, subMenuItems, selectedPreProd]);

  const callResource = (resource) => {
    logger.debug('ResourcesPopUp.js', 'Displaying resource table');
    // console.log('selected resource ==== : ', resource);
    return (
      resource
      && loading ? <LoadingScreen />
      : resource && Object.keys(filteredResorces).length > 0 && (
        <tbody className="bg-white ">
          {/* offline resources head */}
          {filteredResorces?.offlineResource?.length > 0 && (
            <tr className="">
              <td colSpan="3" className="p-4 text-sm text-gray-900 font-bold">
                {' '}
                Downloaded Resources
                {' '}
                <hr />
              </td>
            </tr>
          )}
          {/* offline resources body */}
          {filteredResorces?.offlineResource?.length > 0 && filteredResorces?.offlineResource?.map((resource) => (
            <tr className={`${resource?.value?.meta?.stage === 'preprod' && 'bg-yellow-200'} hover:bg-gray-200 `} id={resource?.projectDir} key={resource.value.meta.id + resource.value.meta.language}>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(
                  e,
                  resource?.value?.meta?.language,
                  `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`,
                  resource?.value?.meta?.owner,
                  resource?.value?.meta?.subject,
                  resource,
                  )}
                  role="button"
                  tabIndex="0"
                >
                  {`${resource?.value?.meta?.name} (${resource?.value?.meta?.owner})`}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, resource?.value?.meta?.language, `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`, resource?.value?.meta?.owner, resource?.value?.meta?.subject, resource)}
                  role="button"
                  tabIndex="0"
                >
                  {resource?.value?.meta?.language}
                </div>
              </td>
              <td className="p-4 text-xs text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, resource?.value?.meta?.language, `${resource?.value?.meta?.subject} ${resource?.value?.meta?.language_title}`, resource?.value?.meta?.owner, resource?.value?.meta?.subject, resource)}
                  role="button"
                  tabIndex="0"
                >
                  {resource?.value?.meta && `${(resource.value.meta.released).split('T')[0]} (${resource?.value?.meta?.release.tag_name})`}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600 ">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-row">
                    <CheckHelpsUpdatePopUp resource={resource} selectResource={selectResource} />
                    <RemoveResource resource={resource} selectResource={selectResource} closeResourceWindow={removeSection} />
                  </div>
                  <div className="text-[9px] mt-2 text-black">
                    <span>{resource?.value?.lastUpdatedAg?.split('T')[0]}</span>
                  </div>
                </div>
              </td>
            </tr>
          ))}

          <tr>
            <td colSpan={4}>
              {' '}
              <hr className="border-4 rounded-md" />
            </td>
          </tr>

          {/* online resources section  */}
          {filteredResorces?.onlineResource?.resource?.length > 0 && filteredResorces?.onlineResource?.resource?.map((notes) => (
            <tr className={`${notes?.responseData?.stage === 'preprod' && 'bg-yellow-200'} hover:bg-gray-200 `} id={notes.name} key={notes.name + notes.owner}>
              <td className="px-5 py-3 hidden">
                <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, notes.language, `${filteredResorces?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                  role="button"
                  tabIndex="0"
                >
                  {`${notes.name} (${notes.owner})`}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, notes.language, `${filteredResorces?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                  role="button"
                  tabIndex="0"
                >
                  {notes.language}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                <div
                  className="focus:outline-none"
                  onClick={(e) => handleRowSelect(e, notes.language, `${filteredResorces?.onlineResource?.title} ${notes.name}`, notes.owner, '')}
                  role="button"
                  tabIndex="0"
                >
                  {notes?.responseData && `${(notes.responseData.released).split('T')[0]} (${notes?.responseData?.release.tag_name})`}
                </div>
              </td>
              <td className="p-4 text-sm text-gray-600">
                {filteredResorces?.onlineResource?.id !== 'twlm' && (
                <div
                  className="text-xs cursor-pointer focus:outline-none"
                  role="button"
                  tabIndex={0}
                  title="download"
                  onClick={(e) => handleDownloadHelpsResources(e, notes, filteredResorces?.offlineResource)}
                >
                  {dowloading && currentDownloading?.responseData?.id === notes?.responseData?.id ? (
                    <div className="">
                      <LoadingScreen />
                    </div>
                  ) : (
                    <DownloadSvg
                      fill="currentColor"
                      className="w-6 h-6"
                    />
                  )}
                </div>
                )}
              </td>
            </tr>
        ))}
        </tbody>
      )
    );
  };

  const importResources = (resource) => {
    if (showInput) {
      return (
        <div className="bg-white grid grid-cols-4 gap-2 p-4 text-sm text-left tracking-wide">
          <div className="flex gap-5 col-span-2">
            <div>
              <input
                type="text"
                name={t('label-resource-name')}
                id=""
                value={resourceName}
                placeholder={t('placeholder-resource-name')}
                onChange={(e) => setResourceName(e.target.value)}
                className="bg-white w-52 ml-2 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
              />
            </div>
            <div>
              <input
                type="text"
                name={t('label-location')}
                id=""
                value={inputUrl}
                placeholder={t('placeholder-door43-url')}
                onChange={(e) => setInputUrl(e.target.value)}
                className="bg-white w-52 ml-2 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
              />
            </div>
            <div>
              <button
                type="button"
                onClick={() => handleCustomInput(inputUrl, resource, resourceName)}
                title={t('btn-load-tn')}
                className="py-2 m-1 px-6 bg-primary rounded shadow text-white uppercase text-xs tracking-widest font-semibold"
              >
                {t('btn-import')}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <button type="button" className="flex gap-6 mx-5 absolute bottom-5 right-0 justify-end z-10 outline-none">
        {/* <PlusCircleIcon title={t('label-upload')} className="h-10 w-10 m-5 text-primary" onClick={() => setShowInput(true)} aria-hidden="true" /> */}
      </button>
    );
  };

  return (
    <>
      <Transition
        show={openResourcePopUp}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={openResourcePopUp}
          onClose={removeSection}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">
            <div className="w-8/12 h-4/6 items-center justify-center m-auto z-50 shadow overflow-hidden rounded">
              <div className="h-full flex relative rounded shadow overflow-hidden bg-white">
                <button
                  aria-label="close-resources"
                  type="button"
                  onClick={removeSection}
                  className="p-3 focus:outline-none bg-secondary absolute z-10 b top-0 right-0"
                >
                  <XIcon className="h-4 w-4 text-white" />
                </button>
                <div>
                  <div aria-label="resources-title" className="uppercase bg-secondary text-white p-3 text-xs tracking-widest leading-snug rounded-tl text-center">
                    {t('label-resource')}
                  </div>
                  <div style={{ width: 'max-content' }} className="relative bg-gray-100 px-3 py-3 h-full overflow-auto scrollbars-width">
                    <div className="grid grid-rows-5 py-5 gap-4">
                      <ResourceOption
                        imageUrl="/illustrations/bible-icon.svg"
                        id="bible"
                        text={t('label-resource-bible')}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dictionary-icon.svg"
                        id="tn"
                        text={t('label-resource-tn')}
                        translationData={translationNotes}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/image-icon.svg"
                        id="twlm"
                        text={t('label-resource-twl')}
                        translationData={translationWordLists}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/image-icon.svg"
                        id="tw"
                        text={t('label-resource-twlm')}
                        translationData={translationWordLists}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dialogue-icon.svg"
                        id="tq"
                        text={t('label-resource-tq')}
                        translationData={translationQuestions}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/bible-icon.svg"
                        id="ta"
                        text={t('label-resource-ta')}
                        translationData={translationAcademys}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/image-icon.svg"
                        id="obs"
                        text={t('label-resource-obs')}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dictionary-icon.svg"
                        id="obs-tn"
                        text={t('label-resource-obs-tn')}
                        translationData={obsTranslationNotes}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/illustrations/dialogue-icon.svg"
                        id="obs-tq"
                        text={t('label-resource-obs-tq')}
                        translationData={obsTranslationQuestions}
                        readCustomResources={readCustomResources}
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      <ResourceOption
                        imageUrl="/icons/basil/Outline/Media/Microphone.svg"
                        id="audio"
                        text="Audio"
                        selectResource={selectResource}
                        setSelectResource={setSelectResource}
                        setTitle={setTitle}
                        setSubMenuItems={setSubMenuItems}
                        setShowInput={setShowInput}
                      />
                      {/* <ResourceOption
                      imageUrl="/illustrations/location-icon.svg"
                      id="map"
                      text="Map"
                      setSelectResource={setSelectResource}
                      setTitle={setTitle}
                      setSubMenuItems={setSubMenuItems}
                    />
                    <ResourceOption
                      imageUrl="/illustrations/dialogue-icon.svg"
                      id="cmtry"
                      text="Commentary"
                      setSelectResource={setSelectResource}
                      setTitle={setTitle}
                      setSubMenuItems={setSubMenuItems}
                    /> */}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full ">
                  <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center">
                    <div className="flex">
                      <SearchIcon className="h-4 w-4 absolute ml-3 my-[6px] text-primary" />
                      <input
                        data-testid="search"
                        type="search"
                        name="search_box"
                        id="search_box"
                        autoComplete="given-name"
                        placeholder={t('label-search')}
                        onChange={(e) => handleChangeQuery(e.target.value, currentFullResorces)}
                        className="pl-8  bg-gray-100 text-black w-1/2 block rounded-full shadow-sm sm:text-xs focus:border-primary border-gray-300 h-7"
                      />
                      {(selectResource !== 'obs' && selectResource !== 'bible' && selectResource !== 'twlm' && selectResource !== 'audio')
                      && (
                      <div className="flex items-center ml-[7vw]">
                        <input
                          className="mr-2"
                          type="checkbox"
                          id="pre-prod"
                          checked={selectedPreProd}
                          onChange={(e) => setSelectedPreProd(e.target.checked)}
                        />
                        <label htmlFor="pre-prod">Prerelease</label>
                      </div>
                      )}
                    </div>
                  </div>

                  {loading
                  ? (
                    <div className="relative w-full h-full max-h-sm scrollbars-width overflow-auto ">
                      <LoadingScreen />
                    </div>
                    )
                  : (
                    <div className="relative w-full max-h-sm min-h-[90%] scrollbars-width overflow-auto pb-10 ">
                      <table className="border-separate border-spacing-0 w-full ">
                        <thead className="bg-white">
                          <tr className="text-sm text-left">
                            <th className="px-5 py-3 font-medium text-gray-300 hidden">
                              <StarIcon className="h-5 w-5" aria-hidden="true" />
                            </th>
                            <th className="px-5 py-3.5 font-bold w-9/12 text-gray-700 uppercase tracking-wider">
                              {t('label-name')}
                            </th>
                            <th className="px-5 py-3.5 font-bold w-3/12 text-gray-700 uppercase tracking-wider">
                              {t('label-language')}
                            </th>
                          </tr>
                        </thead>

                        {selectResource === 'bible' ? (
                          <tbody className="bg-white">
                            {filteredBibleObsAudio?.length > 0 && (
                          filteredBibleObsAudio.map((ref) => (ref?.value?.type?.flavorType?.flavor?.name === 'textTranslation'
                          && (
                            <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>
                              <td className="px-5 py-3 hidden">
                                <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                <div
                                  className="focus:outline-none"
                                  onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                  role="button"
                                  tabIndex="0"
                                >
                                  {ref.value.identification.name.en}
                                  {' '}
                                  (
                                  {ref.projectDir}
                                  )
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                <div
                                  className="focus:outline-none"
                                  onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                  )}
                                  role="button"
                                  tabIndex="0"
                                >
                                  {ref.value.languages[0].name.en}
                                </div>
                              </td>
                              <td className="p-4 text-xs text-gray-600">
                                <div
                                  className="focus:outline-none"
                                  onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                  role="button"
                                  tabIndex="0"
                                >
                                  {ref?.value?.resourceMeta && `${(ref.value.resourceMeta.released).split('T')[0]} (${ref?.value?.resourceMeta?.release.tag_name})`}
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600 ">
                                <div className="flex flex-col gap-1">
                                  <div className="flex">
                                    {ref?.value?.resourceMeta?.released
                                  && (
                                    <CheckHelpsUpdatePopUp resource={ref} selectResource={selectResource} />
                                    )}
                                    <RemoveResource resource={ref} selectResource={selectResource} closeResourceWindow={removeSection} />
                                  </div>
                                  <div className="text-[9px] mt-2 text-black">
                                    <span>{ref?.value?.resourceMeta && ref?.value?.resourceMeta?.lastUpdatedAg.split('T')[0]}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )
                          ))
                        )}
                          </tbody>
                    ) : selectResource !== 'obs' && selectResource !== 'audio' && callResource(selectResource)}
                        {selectResource === 'obs' && (
                          <tbody className="bg-white">
                            {filteredBibleObsAudio?.length > 0 && (
                          filteredBibleObsAudio.map((ref) => (ref?.value?.type?.flavorType?.flavor?.name === 'textStories'
                          && (
                          <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>
                            <td className="px-5 py-3 hidden">
                              <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.identification.name.en}
                                {' '}
                                (
                                {ref.projectDir}
                                )
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.languages[0].name.en}
                              </div>
                            </td>
                            <td className="p-4 text-xs text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref?.value?.resourceMeta && `${(ref.value.resourceMeta.released).split('T')[0]} (${ref?.value?.resourceMeta?.release.tag_name})`}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 ">
                              <div className="flex flex-col gap-1">
                                <div className="flex">
                                  {ref?.value?.resourceMeta?.released
                                  && (
                                    <CheckHelpsUpdatePopUp resource={ref} selectResource={selectResource} />
                                    )}
                                  <RemoveResource resource={ref} selectResource={selectResource} closeResourceWindow={removeSection} />
                                </div>
                                <div className="text-[9px] mt-2 text-black">
                                  <span>{ref?.value?.resourceMeta && ref?.value?.resourceMeta?.lastUpdatedAg.split('T')[0]}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                          )
                          ))
                        )}
                          </tbody>
                    ) }
                        {selectResource === 'audio' && (
                        <tbody className="bg-white">
                          {filteredBibleObsAudio?.length > 0 && (
                          filteredBibleObsAudio.map((ref) => (ref?.value?.type?.flavorType?.flavor?.name === 'audioTranslation'
                          && (
                          <tr className="hover:bg-gray-200" key={ref.value.identification.name.en + ref.projectDir}>
                            <td className="px-5 py-3 hidden">
                              <StarIcon className="h-5 w-5 text-gray-300" aria-hidden="true" />
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.name,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.identification.name.en}
                                {' '}
                                (
                                {ref.projectDir}
                                )
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              <div
                                className="focus:outline-none"
                                onClick={(e) => handleRowSelect(
                                    e,
                                    ref.value.languages[0].name.en,
                                    ref.projectDir,
                                    '',
                                    ref.value.type.flavorType.flavor.name,
                                    )}
                                role="button"
                                tabIndex="0"
                              >
                                {ref.value.languages[0].name.en}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 ">
                              <div className="flex flex-col gap-1">
                                <div className="flex">
                                  {ref?.value?.resourceMeta?.released
                                  && (
                                    <CheckHelpsUpdatePopUp resource={ref} selectResource={selectResource} />
                                    )}
                                  {/* <RemoveResource resource={ref} selectResource={selectResource} closeResourceWindow={removeSection}  /> */}
                                </div>
                                <div className="text-[9px] mt-2 text-black">
                                  <span>{ref?.value?.resourceMeta && ref?.value?.resourceMeta?.lastUpdatedAg.split('T')[0]}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                          )
                          ))
                        )}
                        </tbody>
                    ) }
                      </table>

                      {selectResource === 'bible' || selectResource === 'obs' || selectResource === 'audio' ? (
                        <button type="button" className="flex gap-6 mx-5 absolute bottom-0 right-0 justify-end z-10 outline-none">
                          {resourceIconClick
                              && (
                              <div className="flex-col absolute bottom-14 right-7 justify-end text-white">
                                {selectResource !== 'audio'
                                && (
                                  <button
                                    type="button"
                                    className="bg-primary  mb-2 w-44 p-1 border-none rounded-md hover:bg-secondary"
                                    tabIndex={-3}
                                    onClick={() => { openResourceDialogBox(); setResourceIconClick(!resourceIconClick); }}
                                  >
                                    Resource Collections
                                  </button>
                                  )}
                                <button
                                  type="button"
                                  className="bg-primary  mb-2 w-44 p-1 border-none rounded-md hover:bg-secondary"
                                  tabIndex={-2}
                                  onClick={() => { setOpenImportResourcePopUp(true); openResourceDialog(); setResourceIconClick(!resourceIconClick); }}
                                >
                                  Custom Resource
                                </button>
                              </div>
                            )}
                          <PlusCircleIcon className="h-10 w-10 m-5 text-primary" onClick={() => setResourceIconClick(!resourceIconClick)} />
                          { (selectResource === 'bible' || selectResource === 'obs' || selectResource === 'audio')
                          && (
                          <ImportResource
                            open={openImportResourcePopUp}
                            closePopUp={closeImportPopUp}
                            openPopUp={setOpenImportResourcePopUp}
                            setOpenResourcePopUp={setOpenResourcePopUp}
                            setLoading={setLoading}
                          />
                          ) }
                        </button>
                  ) : importResources(selectResource)}

                      {isOpenDonwloadPopUp
                  && (
                  <DownloadResourcePopUp
                    selectResource={selectResource}
                    isOpenDonwloadPopUp={isOpenDonwloadPopUp}
                    setIsOpenDonwloadPopUp={setIsOpenDonwloadPopUp}
                  />
                  )}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </Dialog>
      </Transition>

      <SnackBar
        openSnackBar={openSnackBar}
        setOpenSnackBar={setOpenSnackBar}
        snackText={snackText}
        setSnackText={setSnackText}
        error={error}
      />
    </>
  );
};

export default ResourcesPopUp;

ResourcesPopUp.propTypes = {
  header: PropTypes.string,
  openResourcePopUp: PropTypes.bool,
  setOpenResourcePopUp: PropTypes.func,
  selectedResource: PropTypes.string,
  setReferenceResources: PropTypes.func,

};
