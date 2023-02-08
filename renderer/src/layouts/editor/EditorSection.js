/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import {
  SquaresPlusIcon, XMarkIcon, AdjustmentsVerticalIcon,
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import ResourcesPopUp from '@/components/Resources/ResourcesPopUp';
import { classNames } from '@/util/classNames';
import TaNavigation from '@/components/EditorPage/Reference/TA/TaNavigation';
import TwNavigation from '@/components/EditorPage/Reference/TW/TwNavigation';
import { getScriptureDirection } from '@/core/projects/languageUtil';
import ConfirmationModal from './ConfirmationModal';
import * as logger from '../../logger';

export default function EditorSection({
  title,
  selectedResource,
  referenceResources,
  setReferenceResources,
  children,
  languageId,
  row,
  setLoadResource,
  loadResource,
  openResource,
  setOpenResource1,
  setOpenResource2,
  setOpenResource3,
  setOpenResource4,
  sectionNum,
  setSectionNum,
  hideAddition,
  CustomNavigation,
  setRemovingSection,
  setAddingSection,
}) {
  const [openResourcePopUp, setOpenResourcePopUp] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [projectScriptureDir, setProjectScriptureDir] = useState();
  const { t } = useTranslation();
  const {
    state: {
      fontSize,
      layout,
      openResource1,
      openResource2,
      openResource3,
      openResource4,
    },
    actions: {
      setLayout,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      scrollLock,
      selectedProjectMeta,
    },
  } = useContext(ProjectContext);

  function removeResource() {
    setOpenModal(true);
  }

  const removeSection = () => {
    setRemovingSection(row);
    switch (row) {
      case '1':
        setOpenResource1(true);
        break;
      case '2':
        setOpenResource2(true);
        break;
      case '3':
        setOpenResource3(true);
        break;
      case '4':
        setOpenResource4(true);
        break;
      default:
        break;
    }
    if (sectionNum > 0) {
      setSectionNum(sectionNum - 1);
    }
  };

  function confirmRemove() {
    removeSection();
  }

  useEffect(() => {
    if (openResource1 === true && openResource2 === true) {
      if (layout > 1) { setLayout(1); }
    }
    if (openResource3 === true && openResource4 === true) {
      if (layout > 1) { setLayout(1); }
      //  else if (layout === 1) { setLayout(0); }
    }
    // if ((openResource1 === false || openResource2 === false) && (openResource3 === false || openResource4 === false)) {
    //   setLayout(2);
    // }
    if (openResource1 === true && openResource2 === true
      && openResource3 === true && openResource4 === true) {
      if (layout === 1) {
        setLayout(0);
      }
    }
  });

  const showResourcesPanel = () => {
    setOpenResourcePopUp(true);
    setLoadResource(true);
  };

  useEffect(() => {
    if (!title) {
      setLoadResource(false);
    } else {
      setLoadResource(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openResourcePopUp, title]);

  const addRow = () => {
    if (sectionNum >= 0 && sectionNum < 2) {
      setSectionNum(sectionNum + 1);
      if (layout < 2 && layout >= 0) {
        setSectionNum(sectionNum + 1);
      }
    }
    setAddingSection(row);
    switch (row) {
      case '1':
        setOpenResource2(false);
        break;
      case '2':
        setOpenResource1(false);
        break;
      case '3':
        setOpenResource4(false);
        break;
      case '4':
        setOpenResource3(false);
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    // Since we are adding reference resources from different places the data we have are inconsistant.
    // Looking for flavor from the flavours because flavor is only available for scripture and gloss(obs), not for Translation resources
    const flavours = ['obs', 'bible', 'audio'];
    if (referenceResources.offlineResource.offline === false && title && flavours.includes(referenceResources.selectedResource)) {
      logger.debug('EditorSection.js', 'Fetching language direction of this downloaded resource');
      // offline=false->resources are added directly using collection Tab, offline=true-> resources added from door43
      // Fetching the language code from burrito file to get the direction
      getScriptureDirection(title)
      .then((dir) => {
        logger.debug('EditorSection.js', 'Setting language direction');
        setProjectScriptureDir(dir);
      });
    } else {
      // Setting language direction to null for Translation Helps
      logger.debug('EditorSection.js', 'Setting language direction to null for Translation Helps');
      setProjectScriptureDir();
    }
  }, [referenceResources, title]);
  return (
    <>
      <div aria-label="resources-panel" className={classNames(openResource ? 'hidden' : '', 'relative first:mt-0 pb-12 border bg-white border-gray-200 rounded shadow-sm overflow-hidden group')}>
        <div className="bg-gray-200 rounded-t text-center text-gray-600 relative overflow-hidden">
          {openResourcePopUp
            && (
              <div className="fixed z-50 ">
                <ResourcesPopUp
                  column={row}
                  header={title}
                  languageId={languageId}
                  selectedResource={selectedResource}
                  setReferenceResources={setReferenceResources}
                  openResourcePopUp={openResourcePopUp}
                  setOpenResourcePopUp={setOpenResourcePopUp}
                  selectedProjectMeta={selectedProjectMeta}
                  referenceResources={referenceResources}
                />

              </div>
            )}

          <div className="bg-gray-200 rounded-t overflow-hidden">
            <div className="flex">
              {selectedResource === 'ta' || selectedResource === 'tw' ? (
                <div className="h-12 flex">
                  {selectedResource === 'ta' ? (
                    <TaNavigation
                      languageId={languageId}
                      referenceResources={referenceResources}
                    />
                  ) : (
                    <TwNavigation
                      languageId={languageId}
                      referenceResources={referenceResources}
                      setReferenceResources={setReferenceResources}
                    />
                  )}

                  <div className="relative lg:left-72 sm:left-48 sm:ml-2.5 top-4 text-xxs uppercase tracking-wider font-bold leading-3 truncate">
                    {title}
                  </div>
                </div>
              ) : (
                <>
                  {scrollLock ? (
                    <>
                      {CustomNavigation}
                      <div className="mx-4 flex justify-center items-center text-xxs uppercase tracking-wider font-bold leading-3 truncate">
                        {title}
                      </div>
                    </>
                  )
                    : (
                      <div className="flex">
                        <div className="py-2 uppercase tracking-wider text-xs font-semibold">
                          <div className="ml-4 h-4 flex justify-center items-center text-xxs uppercase tracking-wider font-bold leading-3 truncate">
                            {title}
                          </div>
                        </div>
                      </div>
                    )}
                </>
              )}
              <div className="flex bg-gray-300 absolute h-full -right-0 rounded-tr invisible group-hover:visible ">
                <button
                  aria-label="resources-selector"
                  type="button"
                  title={t('tooltip-editor-resource-selector')}
                  onClick={showResourcesPanel}
                  className="px-2"
                >
                  <AdjustmentsVerticalIcon
                    className="h-5 w-5 text-dark"
                  />
                </button>
                <button
                  type="button"
                  title={t('tooltip-editor-remove-section')}
                  onClick={removeResource}
                  className="px-2"
                >
                  <XMarkIcon
                    className="h-5 w-5 text-dark"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{ fontFamily: 'sans-serif', fontSize: `${fontSize}rem`, direction: `${projectScriptureDir?.toUpperCase() === 'RTL' ? 'rtl' : 'ltr'}` }}
          className="h-full overflow-auto scrollbars-width leading-8"
        >
          {
            (loadResource === false)
              ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xs uppercase pb-4">{t('label-editor-load-module')}</div>
                    <button
                      type="button"
                      className="p-4 bg-gray-200 rounded-lg ring-offset-1"
                      onClick={showResourcesPanel}
                    >
                      <SquaresPlusIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
              : children
          }
          {hideAddition && (
            <button
              type="button"
              title={t('tooltip-editor-add-section')}
              onClick={addRow}
              className="absolute p-2 bg-primary rounded bottom-0 -right-0 invisible group-hover:visible"
            >
              <SquaresPlusIcon
                className="h-6 w-6 text-white"
                aria-hidden="true"
              />
            </button>
          )}
        </div>

      </div>
      <ConfirmationModal
        openModal={openModal}
        title={t('modal-title-remove-resource')}
        setOpenModal={setOpenModal}
        confirmMessage="Are you sure you want to remove this resource?"
        buttonName={t('btn-remove')}
        closeModal={confirmRemove}
      />
    </>
  );
}

EditorSection.propTypes = {
  title: PropTypes.string,
  children: PropTypes.any,
  selectedResource: PropTypes.string,
  referenceResources: PropTypes.object,
  setReferenceResources: PropTypes.func,
  row: PropTypes.string,
  languageId: PropTypes.string,
  setLoadResource: PropTypes.func,
  loadResource: PropTypes.bool,
  openResource: PropTypes.bool,
  setOpenResource1: PropTypes.func,
  setOpenResource2: PropTypes.func,
  setOpenResource3: PropTypes.func,
  setOpenResource4: PropTypes.func,
  sectionNum: PropTypes.number,
  setSectionNum: PropTypes.func,
  hideAddition: PropTypes.bool,
  CustomNavigation: PropTypes.object,
  setRemovingSection: PropTypes.func,
  setAddingSection: PropTypes.func,
};
