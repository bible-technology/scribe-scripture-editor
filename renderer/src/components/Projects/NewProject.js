import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import ProjectsLayout from '@/layouts/projects/Layout';
import AdvancedSettingsDropdown from '@/components/ProjectsPage/CreateProject/AdvancedSettingsDropdown';
import { ProjectContext } from '@/components/context/ProjectContext';
import TargetLanguagePopover from '@/components/ProjectsPage/CreateProject/TargetLanguagePopover';
import PopoverProjectType from '@/layouts/editor/PopoverProjectType';
import { SnackBar } from '@/components/SnackBar';
import useValidator from '@/components/hooks/useValidator';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import CustomMultiComboBox from '@/components/Resources/ResourceUtils/CustomMultiComboBox';
import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { environment } from '../../../environment';
import LayoutIcon from '@/icons/basil/Outline/Interface/Layout.svg';
import BullhornIcon from '@/icons/basil/Outline/Communication/Bullhorn.svg';
import ImageIcon from '@/icons/basil/Outline/Files/Image.svg';
import { classNames } from '../../util/classNames';
import * as logger from '../../logger';
import ImportPopUp from './ImportPopUp';
import burrito from '../../lib/BurritoTemplete.json';
// eslint-disable-next-line no-unused-vars
const solutions = [
  {
    name: 'Translation',
    href: '##',
    icon: LayoutIcon,
  },
  {
    name: 'Audio',
    href: '##',
    icon: BullhornIcon,
  },
  // {
  //   name: 'MT',
  //   href: '##',
  //   icon: ProcessorIcon,
  // },
  {
    name: 'OBS',
    href: '##',
    icon: ImageIcon,
  },
];

function TargetLanguageTag(props) {
  const { children } = props;
  return (
    <div className="rounded-full px-3 py-1 bg-gray-200 text-xs uppercase font-semibold">{children}</div>
  );
}

function BibleHeaderTagDropDown(headerDropDown, handleDropDown, call) {
  return (
    call === 'new'
    ? (
      <PopoverProjectType
        items={solutions}
        handleDropDown={handleDropDown}
      >
        <button
          type="button"
          aria-label="open-popover"
          className="flex justify-center items-center px-3 py-2 text-white ml-5
          font-bold text-xs rounded-full leading-3 tracking-wider uppercase bg-primary"
        >
          {/* <div className="">{headerDropDown}</div> */}
          <div className="">{headerDropDown === 'Translation' ? `Bible ${headerDropDown}` : headerDropDown}</div>
          <ChevronDownIcon
            className="w-5 h-5 ml-2"
            aria-hidden="true"
          />
        </button>
      </PopoverProjectType>
    )
    : (
      <button
        type="button"
        className="flex justify-center items-center px-3 py-2 text-white ml-5
          font-bold text-xs rounded-full leading-3 tracking-wider uppercase bg-primary"
      >
        <div className="">{headerDropDown === 'Translation' ? `Bible ${headerDropDown}` : headerDropDown}</div>
      </button>
    )

  );
}

export default function NewProject({ call, project, closeEdit }) {
  const {
    states: {
      newProjectFields,
      languages,
      language,
      canonSpecification,
    },
    actions: {
      setLanguage,
      createProject,
      setNewProjectFields,
    },
  } = React.useContext(ProjectContext);
  const { t } = useTranslation();
  const { action: { validateField, isLengthValidated, isTextValidated } } = useValidator();
  const router = useRouter();
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [metadata, setMetadata] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [projectLangData, setProjectLangData] = React.useState({});
  const [error, setError] = React.useState({
    projectName: {},
    abbr: {},
    description: {},
  });

  const [headerDropDown, setHeaderDropDown] = React.useState(solutions[0].name);
  const handleDropDown = (currentSelection) => {
    setHeaderDropDown(currentSelection);
  };

  function getAbbreviation(text) {
    if (typeof text !== 'string' || !text) {
      return '';
    }
    const abbr = [];
    const splitText = text.trim().split(' ');
    splitText.forEach((t) => {
      abbr.push(t.charAt(0));
    });
    return abbr.join('').toUpperCase();
  }

  const handleProjectName = (e) => {
    const abbreviation = getAbbreviation(e.target.value);
    setNewProjectFields({ ...newProjectFields, projectName: e.target.value, abbreviation });
  };

  const setEditLanguage = async (value) => {
    // check the language already in the list or set a new one which create on save project
    if (value.ang) {
      const editLang = languages.filter((l) => l.ang?.toLowerCase() === value.ang?.toLowerCase());
      if (editLang.length > 0) {
        setLanguage(editLang[0]);
      } else {
        const key = value.ang + +moment().format();
        const id = uuidv5(key, environment.uuidToken);
        setLanguage(
          {
            id,
            ang: value.ang,
            ld: value?.ld || 'LTR',
            lc: value?.lc,
            custom: true,
          },
        );
      }
    }
  };

  const createTheProject = (update) => {
    logger.debug('NewProject.js', 'Creating new project.');
    const value = createProject(call, metadata, update, headerDropDown);
    value.then((status) => {
      logger.debug('NewProject.js', status[0].value);
      setLoading(false);
      setNotify(status[0].type);
      setSnackText(status[0].value);
      setOpenSnackBar(true);
      if (status[0].type === 'success') {
        if (call === 'edit') {
          closeEdit();
        } else {
          router.push('/projects');
        }
      }
    });
  };
  const validate = async () => {
    logger.debug('NewProject.js', 'Validating the fields.');
    setLoading(true);
    let create = true;
    if (newProjectFields.projectName && newProjectFields.abbreviation) {
      logger.debug('NewProject.js', 'Validating all the fields.');
      const checkName = await validateField([isLengthValidated(newProjectFields.projectName, { minLen: 5, maxLen: 40 }), isTextValidated(newProjectFields.projectName, 'nonSpecChar')]);
      if (checkName[0].isValid === false || checkName[1].isValid === false) {
        logger.warn('NewProject.js', 'Validation failed for Project Name.');
        create = false;
      }
      const checkAbbr = await validateField([isLengthValidated(newProjectFields.abbreviation, { minLen: 1, maxLen: 10 }), isTextValidated(newProjectFields.abbreviation, 'nonSpecChar')]);
      if (checkAbbr[0].isValid === false || checkAbbr[1].isValid === false) {
        logger.warn('NewProject.js', 'Validation failed for Abbreviation.');
        create = false;
      }
      // eslint-disable-next-line max-len
      const checkDesc = await validateField([isLengthValidated(newProjectFields.description, { minLen: 0, maxLen: 400 })]);
      if (checkDesc[0].isValid === false) {
        logger.warn('NewProject.js', 'Validation failed for Description.');
        create = false;
      }
      // custom scope section error
      if (create && (!canonSpecification || !canonSpecification?.currentScope || canonSpecification?.currentScope?.length === 0)) {
        create = false;
        logger.warn('NewProject.js', 'Validation Failed - canon scope not selected');
        setNotify('warning');
        setSnackText(t('Scope is not selected or scope is empty. Please add scope.'));
        setOpenSnackBar(true);
      }
      setError({
        ...error, projectName: checkName, abbr: checkAbbr, description: checkDesc,
      });
    } else {
      create = false;
      logger.warn('NewProject.js', 'Validation Failed - Fill all the required fields.');
      setNotify('warning');
      setSnackText(t('dynamic-msg-fill-all-fields'));
      setOpenSnackBar(true);
    }
    if (create === true) {
      // Checking whether the burrito is of latest version
      logger.warn('NewProject.js', 'Checking whether the burrito is of latest version.');
      if (call === 'edit' && burrito?.meta?.version !== metadata?.meta?.version) {
        setOpenModal(true);
        setLoading(false);
      } else {
        logger.warn('NewProject.js', 'Calling createTheProject function');
        createTheProject(false);
      }
    } else {
      setLoading(false);
    }
  };
  const updateBurritoVersion = () => {
    setOpenModal(false);
    logger.warn('NewProject.js', 'Calling createTheProject function with burrito update');
    createTheProject(true);
  };
  const [openPopUp, setOpenPopUp] = React.useState(false);
  const [replaceWarning, setReplaceWarning] = React.useState(false);

  function openImportPopUp() {
    setOpenPopUp(true);
  }

  function closeImportPopUp() {
    setOpenPopUp(false);
  }
  function callReplace(value) {
    if (call === 'edit' && value === true) {
      setReplaceWarning(true);
    }
  }
  const loadData = async (project) => {
    logger.debug('NewProject.js', 'In loadData for loading current project details in Edit page');
    setNewProjectFields({
      projectName: project.identification.name.en,
      abbreviation: project.identification.abbreviation.en,
      description: project.project[project.type.flavorType.flavor.name].description,
    });
    setProjectLangData({
      ang: project.languages[0].name.en,
      ld: project.project[project.type.flavorType.flavor.name].scriptDirection,
      lc: project.languages[0]?.tag ? project.languages[0].tag : project.languages[0].name.en.substring(0, 3),
    });
    setMetadata(project);
    // set dropdown to the project type
    switch (project.type.flavorType.flavor.name) {
      case 'textTranslation':
        setHeaderDropDown('Translation');
        break;

      case 'textStories':
        setHeaderDropDown('OBS');
        break;

      case 'audioTranslation':
        setHeaderDropDown('Audio');
        break;

      default:
        break;
    }
  };
  useEffect(() => {
    setEditLanguage(projectLangData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages.length, projectLangData]);

  useEffect(() => {
    if (call === 'edit') {
      loadData(project);
    } else if (call === 'new') {
      // set englsh as default lang
      const defaulLang = languages.filter((lang) => lang.lc === 'en');
      setLanguage(defaulLang[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);
  return (
    <ProjectsLayout
      title={call === 'new' ? t('new-project-page') : t('edit-project')}
      header={BibleHeaderTagDropDown(headerDropDown, handleDropDown, call)}
    >
      {loading === true
        ? (
          <div className="h-full items-center justify-center flex">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          )
        : (
          <div className="rounded-md border shadow-sm mt-4 ml-5 mr-5 mb-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 m-10 gap-5">

              <div className="lg:col-span-1">
                <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">
                  {t('label-project-name')}
                  <span className="text-error">*</span>
                </h4>
                <input
                  type="text"
                  name="project_name"
                  id="project_name"
                  value={newProjectFields.projectName}
                  onChange={(e) => {
                    handleProjectName(e);
                  }}
                  disabled={call !== 'new'}
                  className={classNames(call !== 'new' ? 'bg-gray-200' : '', 'w-48 lg:w-full rounded shadow-sm sm:text-sm focus:border-primary border-gray-300')}
                />
                <span className="text-error">{error.projectName[0]?.message || error.projectName[1]?.message}</span>
                <h4 className="mt-5 text-xs font-base mb-2 text-primary leading-4 tracking-wide  font-light">{t('label-description')}</h4>
                <textarea
                  type="text"
                  name="Description"
                  id="project_description"
                  value={newProjectFields.description}
                  onChange={(e) => {
                    setNewProjectFields({ ...newProjectFields, description: e.target.value });
                  }}
                  className="bg-white w-48 lg:w-full h-28  block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                />
                <span className="text-error">{error.description[0]?.message}</span>
              </div>

              <div className="lg:col-span-2">
                <div className="flex gap-5">
                  <div>
                    <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">
                      {t('label-abbreviation')}
                      <span className="text-error">*</span>
                    </h4>
                    <input
                      type="text"
                      name="version_abbreviated"
                      id="version_abbreviated"
                      value={newProjectFields.abbreviation}
                      onChange={(e) => {
                        setNewProjectFields({ ...newProjectFields, abbreviation: e.target.value });
                      }}
                      className="bg-white w-24 block rounded  sm:text-sm focus:border-primary border-gray-300"
                    />
                    <span className="text-error">{error.abbr[0]?.message || error.abbr[1]?.message}</span>
                  </div>
                </div>
                <div className="flex gap-5 mt-5 items-center">
                  <div>
                    <div className="flex gap-4 items-center mb-2">
                      <h4 className="text-xs font-base  text-primary  tracking-wide leading-4  font-light">
                        {t('label-target-language')}
                        <span className="text-error">*</span>
                      </h4>
                      {headerDropDown !== 'Audio'
                        && (
                          <div>
                            <TargetLanguageTag>
                              {language.ld ? language.ld : 'LTR'}
                            </TargetLanguageTag>
                          </div>
                        )}
                    </div>
                    <CustomMultiComboBox
                      selectedList={[language]}
                      setSelectedList={setLanguage}
                      customData={languages}
                      filterParams="ang"
                      dropArrow
                      showLangCode={{ show: true, langkey: 'lc' }}
                    />
                  </div>
                  <button type="button" className="mt-6 -ml-2" title={t('msg-min-three-letter')}>
                    <InformationCircleIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                  <div className="mt-5">
                    <TargetLanguagePopover projectType={headerDropDown} />
                  </div>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className="rounded-full px-3 py-1 bg-primary hover:bg-black
                      text-white text-xs uppercase font-semibold"
                    onClick={openImportPopUp}
                  >
                    {t('btn-import-books')}
                  </button>
                  <ImportPopUp open={openPopUp} closePopUp={closeImportPopUp} projectType={headerDropDown} replaceConformation={callReplace} />
                </div>
              </div>

              <div>
                <AdvancedSettingsDropdown call={call} project={project} projectType={headerDropDown} />
                {call === 'new'
                  ? (
                    <div>
                      <button
                        type="button"
                        aria-label="create"
                        className="w-40 h-10 my-5 bg-success leading-loose rounded shadow text-xs font-base text-white tracking-wide font-light uppercase"
                        onClick={() => validate()}
                      >
                        {t('btn-create-project')}
                      </button>
                    </div>
                  )
                  : (
                    <div className="p-3 flex gap-5 justify-end">
                      <button
                        type="button"
                        aria-label="cancel-edit-project"
                        className="w-40 h-10  bg-error leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                        onClick={() => closeEdit()}
                      >
                        {t('btn-cancel')}
                      </button>
                      <button
                        type="button"
                        aria-label="save-edit-project"
                        className="w-40 h-10  bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                        onClick={() => validate()}
                      >
                        {t('btn-save')}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
      )}
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
      <ConfirmationModal
        openModal={openModal}
        title="modal-title-update-burrito"
        setOpenModal={setOpenModal}
        confirmMessage={t('dynamic-msg-update-burrito-version', { version1: metadata?.meta?.version, version2: burrito?.meta?.version })}
        buttonName={t('btn-update')}
        closeModal={() => updateBurritoVersion()}
      />
      <ConfirmationModal
        openModal={replaceWarning}
        title="Do Not Replace Existing Content"
        setOpenModal={setReplaceWarning}
        confirmMessage="This action will replace if the existing contents, Press OK to Avoid or CANCEL to continue edit with replace"
        buttonName={t('btn-ok')}
        closeModal={closeEdit}
      />
    </ProjectsLayout>
  );
}

TargetLanguageTag.propTypes = {
  children: PropTypes.string,
};

NewProject.propTypes = {
  call: PropTypes.string,
  project: PropTypes.object,
  closeEdit: PropTypes.func,
};
