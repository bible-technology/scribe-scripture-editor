import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  ComputerDesktopIcon,

} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import SideBar from './SideBar';
import TopMenuBar from './TopMenuBar';
import ImportProjectPopUp from './ImportProjectPopUp';
import ConflictResolverUI from './Import/ConflictResolverUI';

export default function ProjectsLayout(props) {
  const {
    children,
    title,
    archive,
    header,
    isTwoCol,
    isImport,
    colOne,
    colTwo,
    showArchived,
    setShowArchived,
  } = props;

  const [openPopUp, setOpenPopUp] = useState(false);

  const [conflictPopup, setConflictPopup] = useState({
    open: false,
    data: undefined,
  });

  const { t } = useTranslation();
  function openImportPopUp() {
    setOpenPopUp(true);
  }

  function closeImportPopUp() {
    setOpenPopUp(false);
  }
  function toggleArchive() {
    setShowArchived((value) => !value);
  }

  return (
    <div className="flex overflow-auto scrollbars-width absolute w-full h-full">

      <SideBar />

      <div className="w-full">

        <TopMenuBar />

        {title && (
          <header className="bg-white shadow">
            {!isTwoCol
              ? (
                <div className="mx-auto py-4 px-4 sm:px-4 lg:px-6 border-primary border-b-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <h1 aria-label="projects" className="text-xl font-bold text-gray-900 uppercase tracking-wider">{showArchived ? t('label-archived-prj') : title}</h1>
                      {header}
                    </div>
                  </div>
                  <div className="ml-auto flex">
                    {isImport && !showArchived
                      && (
                        <>
                          <button
                            aria-label="import"
                            type="button"
                            className="flex text-white ml-5 font-bold text-xs px-3 py-2 rounded-full
                                    leading-3 tracking-wider uppercase bg-primary items-center"
                            onClick={openImportPopUp}
                          >
                            <ArrowDownTrayIcon className="h-4 mr-2 text-white" />
                            {t('btn-import')}
                          </button>
                          <ImportProjectPopUp open={openPopUp} closePopUp={closeImportPopUp} setConflictPopup={setConflictPopup} />
                        </>
                      )}

                    {conflictPopup.open
                      && (
                        <div className="fixed z-50 ">
                          <ConflictResolverUI conflictData={conflictPopup} setConflictPopup={setConflictPopup} />
                        </div>
                      )}

                    {/* Archived projects button */}
                    {archive === 'enable' && (
                      <div>
                        <button
                          className={`flex text-white ml-5 font-bold text-xs px-3 py-2 rounded-full
                                    leading-3 tracking-wider uppercase ${showArchived ? 'bg-primary' : 'bg-red-600'} items-center`}
                          type="button"
                          onClick={toggleArchive}
                        >

                          {showArchived ? (
                            <>
                              <ComputerDesktopIcon className="h-4 mr-2 text-white" />
                              <span>{t('label-active')}</span>
                            </>
                          ) : (
                            <>
                              <ArchiveBoxIcon className="h-4 mr-2 text-white" />
                              <span>{t('label-archived')}</span>
                            </>
                          )}
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              )
              : (
                <div className="mx-auto px-4 sm:px-4 lg:px-6 border-primary border-b-4 grid grid-cols-2 gap-2">
                  <div className="flex flex-row py-4 items-center">
                    <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wider">{title}</h1>
                    {colOne}
                  </div>
                  <div className="flex items-end">
                    {colTwo}
                  </div>
                </div>
              )}

          </header>
        )}

        {children}

      </div>

    </div>

  );
}

ProjectsLayout.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string.isRequired,
  archive: PropTypes.string,
  header: PropTypes.element,
  isTwoCol: PropTypes.bool,
  isImport: PropTypes.bool,
  colOne: PropTypes.element,
  colTwo: PropTypes.element,
  showArchived: PropTypes.bool,
  setShowArchived: PropTypes.func,
};
