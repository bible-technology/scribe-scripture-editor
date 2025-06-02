/* eslint-disable no-unused-vars */
import React, {
  useRef, useState, useContext, Fragment,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import ResourcesSidebar from '@/components/Resources/ResourcesSideBar';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import ResourceTabPane from '@/components/Resources/ResourceTabPane';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { ListResources } from '@/components/Resources/ListResources';
import { SnackBar } from '@/components/SnackBar';
import SearchBar from '@/components/Resources/SearchBar';
import * as logger from '../../logger';

export default function ResourcesPopUp(
  {
    openResourcePopUp,
    setOpenResourcePopUp,
    selectedResource,
    setReferenceResources,
    header,
    selectedProjectMeta,
    referenceResources,
    choosingSourceLang,
    setReferenceSourceLang
  },
) {
  const cancelButtonRef = useRef(null);
  const [subMenuItems, setSubMenuItems] = useState();
  const [title, setTitle] = useState(header);
  const [selectResource, setSelectResource] = useState(selectedResource);
  const [showInput, setShowInput] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentDownloading, setCurrentDownloading] = useState(null);
  const [filteredResources, setFilteredResources] = useState({});
  const [filteredReposResourcelinks, setFilteredReposResourcelinks] = useState({});
  const [filteredBibleObsAudio, setfilteredBibleObsAudio] = useState([]);
  const [currentFullResources, setCurrentFullResources] = useState([]);
  const [selectedPreProd, setSelectedPreProd] = useState(false);

  const { t } = useTranslation();

  const removeSection = () => {
    setOpenResourcePopUp(false);
  };

  const {
    state: {
      openImportResourcePopUp,
    },
    actions: {
      openResourceDialog,
      setOpenImportResourcePopUp,
    },
  } = useContext(ReferenceContext);

  // New state to store the selected source
  const [searchSource, setSearchSource] = useState('gitea');

  const handleRowSelect = (e, row, name, owner, flavorname, userOrCommon, offline = false) => {
    const offlineResource = offline
      ? { offline: true, data: offline }
      : { offline: false };
    if (choosingSourceLang) {
      setReferenceSourceLang({
        selectedResource: selectResource,
        languageId: row,
        refName: name,
        header: title,
        owner,
        offlineResource,
        flavor: flavorname,
        ownership: userOrCommon,
      });
    } else {
      setReferenceResources({
        selectedResource: selectResource,
        languageId: row,
        refName: name,
        header: title,
        owner,
        offlineResource,
        flavor: flavorname,
        ownership: userOrCommon,
      });
    }
    removeSection();
  };

  function closeImportPopUp() {
    setOpenImportResourcePopUp(false);
  }

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
          <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto">
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 ">
              <h1 className="text-white font-bold text-sm">{t('label-resource')}</h1>
              <div aria-label="resources-search" className="pt-1.5 pb-[6.5px] bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
              <button
                type="button"
                className="bg-primary absolute h-full rounded-tr-lg right-0 text-white"
                onClick={removeSection}
              >
                <XMarkIcon className="mx-3 h-5 w-5" />
              </button>
            </div>
            <div className="flex border bg-white">
              <ResourcesSidebar selectResource={selectResource} setSelectResource={setSelectResource} setShowInput={setShowInput} setTitle={setTitle} selectedProjectMeta={selectedProjectMeta} choosingSourceLang={choosingSourceLang} />
              <div className="h-[85vh] w-full overflow-x-scroll bg-gray-50 items-center p-3 justify-between">
                {selectResource !== 'local-helps' && (
                  <div className="flex items-center justify-between space-x-3 mb-4">
                    {(selectResource === 'tn' || selectResource === 'tir') && (
                      <div className="flex ml-4 bg-gray-200 p-1 rounded-md">
                        <button
                          type="button"
                          className={`flex w-full items-center gap-1 px-3 py-2 rounded-md cursor-pointer ${searchSource === 'gitea' ? 'bg-primary text-white' : 'bg-transparent'}`}
                          onClick={() => setSearchSource('gitea')}
                        >
                          {t('Door43')}
                        </button>
                        <button
                          type="button"
                          className={`flex w-full items-center gap-1 px-3 py-2 rounded-md cursor-pointer ${searchSource === 'github' ? 'bg-primary text-white' : 'bg-transparent'}`}
                          onClick={() => setSearchSource('github')}
                        >
                          {t('GitHub')}
                        </button>
                      </div>
                    )}
                    <SearchBar
                      currentFullResources={currentFullResources}
                      selectResource={selectResource}
                      setFilteredResources={setFilteredResources}
                      subMenuItems={subMenuItems}
                      setfilteredBibleObsAudio={setfilteredBibleObsAudio}
                      selectedPreProd={selectedPreProd}
                      setSelectedPreProd={setSelectedPreProd}
                      // searchSource={searchSource} {/* Pass the selected source */}
                    />
                  </div>
                )}

                {(selectResource === 'obs' || selectResource === 'audio' || selectResource === 'bible' || selectResource === 'local-helps')
                  ? (
                    <ResourceTabPane
                      selectResource={selectResource}
                      filteredBibleObsAudio={filteredBibleObsAudio}
                      removeSection={removeSection}
                      loading={loading}
                      handleRowSelect={handleRowSelect}
                      openImportResourcePopUp={openImportResourcePopUp}
                      closeImportPopUp={closeImportPopUp}
                      setOpenImportResourcePopUp={setOpenImportResourcePopUp}
                      setOpenResourcePopUp={setOpenResourcePopUp}
                      setLoading={setLoading}
                      openResourceDialog={openResourceDialog}
                      subMenuItems={subMenuItems}
                      setSubMenuItems={setSubMenuItems}
                      setfilteredBibleObsAudio={setfilteredBibleObsAudio}
                      referenceResources={referenceResources}
                    />
                  )
                  : (
                    <ListResources
                      selectResource={selectResource}
                      loading={loading}
                      filteredResources={filteredResources}
                      filteredReposResourcelinks={filteredReposResourcelinks}
                      downloading={downloading}
                      removeSection={removeSection}
                      handleRowSelect={handleRowSelect}
                      currentDownloading={currentDownloading}
                      setCurrentDownloading={setCurrentDownloading}
                      setOpenSnackBar={setOpenSnackBar}
                      setError={setError}
                      setSnackText={setSnackText}
                      setDownloading={setDownloading}
                      selectedPreProd={selectedPreProd}
                      subMenuItems={subMenuItems}
                      setCurrentFullResources={setCurrentFullResources}
                      setFilteredResources={setFilteredResources}
                      setFilteredReposResourcelinks={setFilteredReposResourcelinks}
                      setLoading={setLoading}
                      setSubMenuItems={setSubMenuItems}
                      endPoint={searchSource}
                      choosingSourceLang={choosingSourceLang}
                    />
                  )}
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
}
