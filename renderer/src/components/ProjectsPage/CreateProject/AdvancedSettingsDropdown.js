/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import { isElectron } from '@/core/handleElectron';
import CustomList from '@/components/Projects/CustomList';
import { OT, NT } from '../../../lib/CanonSpecification';
import { ProjectContext } from '../../context/ProjectContext';
import CustomCanonSpecification from './CustomCanonSpecification';
import LicencePopover from './LicencePopover';
import * as logger from '../../../logger';
import packageInfo from '../../../../../package.json';
import { newPath, sbStorageDownload } from '../../../../../supabase';

function BookNumberTag(props) {
  const { children } = props;
  const { t } = useTranslation();

  let numberOfBooks = t('label-books');

  if (children.toString() === '1') {
    numberOfBooks = t('label-book');
  }

  return (
    <div className="rounded-full px-2 py-1 bg-gray-200 text-xs uppercase font-semibold">
      <div className="flex">
        <span>
          {children}
          {' '}
          <span>
            {numberOfBooks}
          </span>
        </span>
      </div>
    </div>
  );
}
export default function AdvancedSettingsDropdown({ call, project, projectType }) {
  const {
    states: {
      canonSpecification,
      canonList,
      licenceList,
      versification,
      versificationScheme,
      copyright,
    },
    actions: {
      setVersificationScheme,
      setcanonSpecification,
      setCopyRight,
    },
  } = React.useContext(ProjectContext);
  const [isShow, setIsShow] = React.useState(true);
  const [bibleNav, setBibleNav] = React.useState(false);
  const [handleNav, setHandleNav] = React.useState();
  const [currentScope, setCurrentScope] = React.useState();
  const { t } = useTranslation();
  const handleClick = () => {
    setIsShow(!isShow);
  };
  const openBibleNav = (value) => {
    setHandleNav(value);
    setBibleNav(true);
  };
  function closeBooks() {
    setBibleNav(false);
  }

  const loadScope = (project) => {
    logger.debug('AdvancedSettingsDropdown.js', 'In loadScope for loading a exact scope from burrito');
    const vals = Object.keys(project.type.flavorType.currentScope).map((key) => key);
    if (vals.length === 66) {
      setcanonSpecification({ title: t('label-all'), currentScope: vals });
      setCurrentScope({ title: t('label-all'), currentScope: vals });
    } else if (vals.length === 39 && vals.every((val) => OT.includes(val))) {
      setcanonSpecification({ title: t('label-old-testament'), currentScope: vals });
      setCurrentScope({ title: t('label-old-testament'), currentScope: vals });
    } else if (vals.length === 27 && vals.every((val) => NT.includes(val))) {
      setcanonSpecification({ title: t('label-new-testament'), currentScope: vals });
      setCurrentScope({ title: t('label-new-testament'), currentScope: vals });
    } else {
      setcanonSpecification({ title: t('label-other'), currentScope: vals });
      setCurrentScope({ title: t('label-other'), currentScope: vals });
    }
  };
  // selectNew variable is used to track whether its a new selection or loading from the list
  const setALicense = (licenceTitle, selectNew) => {
    if (isElectron()) {
      let title = licenceTitle;
      let myLicence = {};
      const fs = window.require('fs');
      if ((title === 'Custom' || !title) && !selectNew) {
        myLicence.title = 'Custom';
        myLicence.locked = false;
        myLicence.id = 'Other';
        // To support the Projects of 0.3.0 version of burrito
        if (project.copyright?.fullStatementPlain) {
          myLicence.licence = project.copyright?.fullStatementPlain?.en;
        } else if (project.copyright?.shortStatements) {
          myLicence.licence = project.copyright?.shortStatements[0]?.statement;
        } else {
          const path = require('path');
          const newpath = localStorage.getItem('userPath');
          const id = Object.keys(project.identification.primary.scribe);
          localforage.getItem('userProfile').then((value) => {
            logger.debug('AdvancedSettingsDropdown.js', 'Fetching the current username');
            const folder = path.join(newpath, packageInfo.name, 'users', value?.username, 'projects', `${project.identification.name.en}_${id[0]}`, 'ingredients', 'license.md');
            if (fs.existsSync(folder)) {
              fs.readFile(folder, 'utf8', (err, data) => {
                myLicence.licence = data;
              });
            } else {
              const licensefile = require('../../../lib/license/Custom.md');
              // console.log(myLicence, licensefile.default);
              myLicence.licence = licensefile.default;
            }
          });
        }
      } else {
        // license names are being updated by a prefix 'CC' so to avoid error with previous versions
        // checking whether the prefix is available or not
        if (!title.match(/CC/g) && title !== 'Custom') {
          const str = `CC ${title}`;
          title = str.replace(/_/gm, '-');
        }
        myLicence = licenceList.find((item) => item.title === title);
        // eslint-disable-next-line import/no-dynamic-require
        const licensefile = require(`../../../lib/license/${title}.md`);
        myLicence.licence = licensefile.default;
      }
      setCopyRight(myLicence);
    } else {
      let title = licenceTitle;
      let myLicence = {};
      if ((title === 'Custom' || !title) && !selectNew) {
        myLicence.title = 'Custom';
        myLicence.locked = false;
        myLicence.id = 'Other';
        // To support the Projects of 0.3.0 version of burrito
        if (project.copyright?.fullStatementPlain) {
          myLicence.licence = project.copyright?.fullStatementPlain?.en;
        } else if (project.copyright?.shortStatements) {
          myLicence.licence = project.copyright?.shortStatements[0]?.statement;
        } else {
          const path = require('path');
          const id = Object.keys(project.identification.primary.scribe);
          localforage.getItem('userProfile').then(async (value) => {
            logger.debug('AdvancedSettingsDropdown.js', 'Fetching the current username');
            const folder = path.join(newPath, value?.user?.email, 'projects', `${project.identification.name.en}_${id[0]}`, 'ingredients', 'license.md');
            const { data } = await sbStorageDownload(folder);
            if (data) {
              myLicence.licence = data;
            } else {
              const licensefile = require('../../../lib/license/Custom.md');
              // console.log(myLicence, licensefile.default);
              myLicence.licence = licensefile.default;
            }
          });
        }
      } else {
        // license names are being updated by a prefix 'CC' so to avoid error with previous versions
        // checking whether the prefix is available or not
        if (!title.match(/CC/g) && title !== 'Custom') {
          const str = `CC ${title}`;
          title = str.replace(/_/gm, '-');
        }
        myLicence = licenceList.find((item) => item.title === title);
        // eslint-disable-next-line import/no-dynamic-require
        const licensefile = require(`../../../lib/license/${title}.md`);
        myLicence.licence = licensefile.default;
      }
      setCopyRight(myLicence);
    }
  };
  const loadLicence = () => {
    logger.debug('AdvancedSettingsDropdown.js', 'In loadLicence for loading the selected licence');
    switch (project.type.flavorType.flavor.name) {
      case 'textTranslation':
        setALicense(project.project?.textTranslation?.copyright, false);
        break;

      case 'textStories':
        setALicense(project.project?.textStories?.copyright, false);
        break;

      default:
        break;
    }
  };
  const selectCanon = (val) => {
    const value = val;
    if (call === 'edit' && value.title === 'Other') {
      if (canonSpecification.title === 'Other') {
        value.currentScope = canonSpecification.currentScope;
      } else {
        value.currentScope = currentScope.currentScope;
      }
    } else if (canonSpecification.title === 'Other' && value.title === 'Other') {
      value.currentScope = canonSpecification.currentScope;
    }
    setcanonSpecification(value);
    openBibleNav('edit');
  };
  useEffect(() => {
    if (call === 'edit') {
      loadScope(project);
      if (!isShow) {
        loadLicence(project);
        setVersificationScheme({ title: project?.project?.textTranslation?.versification ? project?.project?.textTranslation?.versification : 'ENG' });
      }
    }
    if (call === 'edit' && project.type.flavorType.flavor.name === 'textStories') {
      loadLicence(project);
    }
  }, [isShow]);

  return (
    <>
      <div>
        {projectType !== 'OBS'
          && (
            <button
              className="min-w-max flex justify-between items-center pt-3 shadow tracking-wider leading-none h-10 px-4 py-2 w-96 text-sm font-medium text-black bg-gray-100 rounded-sm hover:bg-gray-200 focus:outline-none"
              onClick={handleClick}
              type="button"
              id="open-advancesettings"
            >
              <h3>{t('btn-advance-settings')}</h3>
              {isShow
                ? (
                  <ChevronDownIcon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                )
                : (
                  <ChevronUpIcon
                    className="h-5 w-5 text-primary"
                    aria-hidden="true"
                  />
                )}
            </button>
          )}
        {!isShow && projectType !== 'OBS'
          && (
            <div>
              <div className="mt-8">
                <div className="flex gap-4">
                  <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">
                    {t('label-scope')}
                    <span className="text-error">*</span>
                  </h4>
                  <div>
                    <BookNumberTag>
                      {(canonSpecification?.currentScope)?.length}
                    </BookNumberTag>
                  </div>
                </div>

                {/* <div className="relative"> */}
                <div>
                  {/* <CustomList
                    selected={canonSpecification}
                    setSelected={setcanonSpecification}
                    options={canonList}
                    show
                  /> */}

                  <div className="py-5 flex flex-wrap lg:flex-nowrap gap-3 uppercase text-sm font-medium">
                    <div
                      className={canonSpecification.title === 'All Books' ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap' : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'}
                      onClick={() => selectCanon(canonList[0])}
                      role="button"
                      tabIndex="0"
                    >
                      {t('label-all')}
                    </div>
                    <div
                      className={canonSpecification.title === 'Old Testament (OT)' ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap' : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'}
                      onClick={() => selectCanon(canonList[1])}
                      role="button"
                      aria-label="old-testament"
                      tabIndex="0"
                    >
                      {`${t('label-old-testament')} (OT)`}
                    </div>
                    <div
                      className={canonSpecification.title === 'New Testament (NT)' ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap' : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'}
                      onClick={() => selectCanon(canonList[2])}
                      role="button"
                      aria-label="new-testament"
                      tabIndex="0"
                    >
                      {`${t('label-new-testament')} (NT)`}
                    </div>
                    <div
                      className={canonSpecification.title === 'Other' ? 'bg-primary hover:bg-secondary text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap' : 'bg-gray-200 hover:bg-primary hover:text-white px-3 py-1 rounded-full cursor-pointer whitespace-nowrap'}
                      onClick={() => selectCanon(canonList[3])}
                      role="button"
                      tabIndex="0"
                      aria-label="custom-book"
                    >
                      {t('label-custom')}
                    </div>
                  </div>
                  {/* <button
                    type="button"
                    className="mt-8 focus:outline-none bg-primary h-8 w-8
                    flex items-center justify-center rounded-full"
                    onClick={() => openBibleNav('edit')}
                  >
                    <PencilSquareIcon
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </button> */}
                  {/* </div> */}
                </div>
              </div>

              <h4 className="text-xs font-base mt-4 text-primary  tracking-wide leading-4  font-light">
                {t('label-versification-scheme')}
                <span className="text-error">*</span>
              </h4>
              <div className="mt-2">
                <CustomList selected={versificationScheme} setSelected={setVersificationScheme} options={versification} show={call === 'new'} />
              </div>

              <h4 className="text-xs font-base mt-4 text-primary  tracking-wide leading-4  font-light">
                {t('label-license')}
                <span className="text-error">*</span>
              </h4>
              <div className="flex gap-3 mt-2">
                <CustomList
                  selected={copyright}
                  setSelected={(value) => setALicense(value.title, true)}
                  options={licenceList}
                  show
                />
                <div className="w-8">
                  <LicencePopover call={call} />
                </div>
              </div>
            </div>
          )}
        {
          projectType === 'OBS' && (
            <>
              <h4 className="text-xs font-base mt-4 text-primary  tracking-wide leading-4  font-light">
                {t('modal-title-license')}
                <span className="text-error">*</span>
              </h4>
              <div className="flex gap-3 mt-2">
                <CustomList
                  selected={copyright}
                  setSelected={(value) => setALicense(value.title, true)}
                  options={licenceList}
                  show
                />
                <div className="w-8">
                  <LicencePopover call={call} />
                </div>
              </div>
            </>
          )
        }
      </div>
      {bibleNav && (
        <CustomCanonSpecification
          bibleNav={bibleNav}
          closeBibleNav={() => closeBooks()}
          handleNav={handleNav}
          project={project}
        />
      )}
    </>
  );
}
BookNumberTag.propTypes = {
  children: PropTypes.number,
};
AdvancedSettingsDropdown.propTypes = {
  call: PropTypes.string,
  project: PropTypes.object,
  projectType: PropTypes.string,
};
