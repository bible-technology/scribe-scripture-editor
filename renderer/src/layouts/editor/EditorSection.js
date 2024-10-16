/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import ResourcesPopUp from '@/components/Resources/ResourcesPopUp';
import { classNames } from '@/util/classNames';
import TaNavigation from '@/components/EditorPage/Reference/TA/TaNavigation';
import TwNavigation from '@/components/EditorPage/Reference/TW/TwNavigation';
import { getScriptureDirection } from '@/core/projects/languageUtil';
import MenuDropdown from '@/components/MenuDropdown/MenuDropdown';
import AdjustmentsVerticalIcon from '@/icons/Common/AdjustmentsVertical.svg';
import XMarkIcon from '@/icons/Common/XMark.svg';
import SquaresPlusIcon from '@/icons/Common/SquaresPlus.svg';
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
  isNextRowOpen,
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
  font,
  setFont,
  fontSize,
  setFontsize,
}) {
  const [openResourcePopUp, setOpenResourcePopUp] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [projectScriptureDir, setProjectScriptureDir] = useState();
  const { t } = useTranslation();
  const {
    state: {
      layout,
      openResource1,
      openResource2,
      openResource3,
      openResource4,
    },
    actions: { setLayout },
  } = useContext(ReferenceContext);
  const {
    states: { scrollLock, selectedProjectMeta },
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
      if (layout > 1) {
        setLayout(1);
      }
    }
    if (openResource3 === true && openResource4 === true) {
      if (layout > 1) {
        setLayout(1);
      }
      //  else if (layout === 1) { setLayout(0); }
    }
    // if ((openResource1 === false || openResource2 === false) && (openResource3 === false || openResource4 === false)) {
    //   setLayout(2);
    // }
    if (
      openResource1 === true
      && openResource2 === true
      && openResource3 === true
      && openResource4 === true
    ) {
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

  const handleFontSize = (status) => {
    if (status === 'dec' && fontSize > 0.70) {
      setFontsize(fontSize - 0.2);
    }
    if (status === 'inc' && fontSize < 2) {
      setFontsize(fontSize + 0.2);
    }
  };

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
    // Looking for flavor from the flavors because flavor is only available for scripture and gloss(obs), not for Translation resources
    const flavors = ['obs', 'bible', 'audio'];
    if (
      referenceResources.offlineResource.offline === false
      && title
      && flavors.includes(referenceResources.selectedResource)
    ) {
      logger.debug(
        'EditorSection.js',
        'Fetching language direction of this downloaded resource',
      );
      // offline=false->resources are added directly using collection Tab, offline=true-> resources added from door43
      // Fetching the language code from burrito file to get the direction
      getScriptureDirection(title).then((dir) => {
        logger.debug('EditorSection.js', 'Setting language direction');
        setProjectScriptureDir(dir);
      });
    } else {
      // Setting language direction to null for Translation Helps
      logger.debug(
        'EditorSection.js',
        'Setting language direction to null for Translation Helps',
      );
      setProjectScriptureDir();
    }
  }, [referenceResources, title]);

  return (
    <>
      <div // div 1
        aria-label="resources-panel"
        className={classNames(
          openResource ? 'hidden' : '',
          isNextRowOpen ? 'h-editor' : 'h-reference',
          'flex flex-col relative first:mt-0 border bg-white border-grey-600 rounded shadow-sm group  overflow-hidden',
        )}
      >
        <div
          className="bg-gray-200 rounded-t text-center text-gray-600 relative"
          aria-label="resources-panel"
        >
          <div className="bg-gray-200 rounded-t ">
            <div className="flex">
              {selectedResource === 'ta'
                || selectedResource === 'tw' ? (
                  <div className="h-12 flex">
                    {selectedResource === 'ta' ? (
                      <TaNavigation
                        languageId={languageId}
                        referenceResources={
                          referenceResources
                        }
                      />
                    ) : (
                      <TwNavigation
                        languageId={languageId}
                        referenceResources={
                          referenceResources
                        }
                        setReferenceResources={
                          setReferenceResources
                        }
                      />
                    )}

                    <div
                      className="relative lg:left-72 sm:left-48 sm:ml-2.5 top-4 text-xxs uppercase tracking-wider font-bold leading-3 truncate"
                      title={title}
                    >
                      {title}
                    </div>
                  </div>
                ) : (
                  <>
                    {scrollLock && title ? (
                      <>
                        {CustomNavigation}
                        <div
                          title={title}
                          className="ml-4 flex justify-center items-center text-xxs uppercase tracking-wider font-bold leading-3 truncate"
                        >
                          {title}
                        </div>
                      </>
                    ) : (
                      <div className="flex">
                        <div className="py-2 uppercase tracking-wider text-xs font-semibold">
                          <div
                            title={title}
                            className="ml-4 h-4 flex justify-center items-center text-xxs uppercase tracking-wider font-bold leading-3 truncate"
                          >
                            {title}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              <div className="flex bg-gray-300 absolute h-full -right-0 rounded-tr  group-hover:visible  pl-2 items-center">

                <button
                  type="button"
                  className="inline-flex items-center justify-center border rounded-md shadow-sm
                  text-xs h-fit py-1
                  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-300 focus:ring-gray-300"
                >
                  <div
                    aria-label="decrease-font"
                    onClick={() => { handleFontSize('dec'); }}
                    role="button"
                    tabIndex="0"
                    title={t('tooltip-editor-font-dec')}
                    className="h-5 w-5 hover:text-black font-bold border-r border-gray-200 text-center flex items-center pl-1.5 "
                  >
                    {t('label-editor-font-char')}
                  </div>
                  <div
                    aria-label="increase-font"
                    className="h-5 w-5 hover:text-black font-bold text-lg text-center flex items-center pl-1"
                    onClick={() => { handleFontSize('inc'); }}
                    role="button"
                    title={t('tooltip-editor-font-inc')}
                    tabIndex="0"
                  >
                    {t('label-editor-font-char')}
                  </div>
                </button>

                <MenuDropdown
                  selectedFont={font || 'sans-serif'}
                  setSelectedFont={setFont}
                  showIcon={false}
                />
                <button
                  aria-label="resources-selector"
                  type="button"
                  title={t(
                    'tooltip-editor-resource-selector',
                  )}
                  onClick={showResourcesPanel}
                  className="px-2"
                >
                  <AdjustmentsVerticalIcon className="h-5 w-5 text-dark" />
                </button>
                <button
                  type="button"
                  title={t('tooltip-editor-remove-section')}
                  onClick={removeResource}
                  className="px-2"
                >
                  <XMarkIcon className="h-5 w-5 text-dark" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loadResource === false ? (
          <div className="w-full h-full  flex  items-center justify-center prose-sm p-4 text-xl">
            <div className="text-center">
              <div className="text-xs uppercase pb-4">
                {t('label-editor-load-module')}
              </div>
              <button
                type="button"
                className="p-4 bg-gray-200 rounded-lg ring-offset-1"
                onClick={showResourcesPanel}
              >
                <SquaresPlusIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: `${fontSize}rem`,
              direction: `${projectScriptureDir?.toUpperCase() === 'RTL'
                ? 'rtl'
                : 'ltr'
              }`,
            }}
            className="prose-sm p-1 text-xl h-full overflow-auto scrollbars-width"
          >
            {children}
          </div>
        )}

        {/* //div 12 */}
        {openResourcePopUp && (
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
            />
          </div>
        )}
        {/* //div 13 */}
        {hideAddition && (
          <div className=" invisible group-hover:visible">
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
          </div>
        )}
        <ConfirmationModal
          openModal={openModal}
          title={t('modal-title-remove-resource')}
          setOpenModal={setOpenModal}
          confirmMessage="Are you sure you want to remove this resource?"
          buttonName={t('btn-remove')}
          closeModal={confirmRemove}
        />
      </div>
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
