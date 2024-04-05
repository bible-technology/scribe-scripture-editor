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
import { readUsfm } from '@/components/Projects/utils/readUsfm';
import moment from 'moment';
import { v5 as uuidv5 } from 'uuid';
import { BookOpenIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { environment } from '../../../environment';
import LayoutIcon from '@/icons/basil/Outline/Interface/Layout.svg';
import BullhornIcon from '@/icons/basil/Outline/Communication/Bullhorn.svg';
import ImageIcon from '@/icons/basil/Outline/Files/Image.svg';
import { classNames } from '../../util/classNames';
import * as logger from '../../logger';
import ImportPopUp from './ImportPopUp';
import burrito from '../../lib/BurritoTemplate.json';
import localforage from 'localforage';
import packageInfo from '../../../../package.json';
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
  // Nicolas : if I wanna add a mode on the UI, I can call it here
  // NicolasEdits : added Juxta
  {
    name: 'Juxta',
    href: '##',
    icon: BookOpenIcon,
  },
];

function TargetLanguageTag(props) {
  const { children } = props;
  return (
    <div className="rounded-full px-3 py-1 bg-gray-200 text-xs uppercase font-semibold">{children}</div>
  );
}

// Nicolas : the dropdown I'm looking for
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
          className="flex justify-center items-center px-3 py-2 text-white
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
      importedBookCodes,
      importedFiles,
    },
    actions: {
      setLanguage,
      createProject,
      setNewProjectFields,
      setCanonSpecification,
      setImportedFiles,
      setImportedBookCodes,
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
  const [openModalJuxtaWrongSetOfBooks, setOpenModalJuxtaWrongSetOfBooks] = React.useState(false);
  const [userWantToDownloadJuxtas, setUserWantToDownloadJuxtas] = React.useState('');
  const [projectLangData, setProjectLangData] = React.useState({});
  const [openPopUp, setOpenPopUp] = React.useState(false);
  const [replaceWarning, setReplaceWarning] = React.useState(false);
  const [downloadingResources, setDownloadingResources] = React.useState(false);


  const [error, setError] = React.useState({
    projectName: {},
    abbr: {},
    description: {},
  });

  const [headerDropDown, setHeaderDropDown] = React.useState(solutions[0].name);
  const handleDropDown = (currentSelection) => {
    setHeaderDropDown(currentSelection);
  };

  function callReplace(value) {
    if (call === 'edit' && value === true) {
      setReplaceWarning(true);
    }
  }

  useEffect(() => {
    // TODO canonSpecification
    // console.log("canonSpecification ==",canonSpecification);
    // console.log("newProjectFields ==",newProjectFields);
  }, [canonSpecification, setCanonSpecification])

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

  async function userAcceptedToDownloadGreekJuxtas() {
    setUserWantToDownloadJuxtas("download");
  }

  async function importGreeksFromDoor43() {
    let pathFolderFiles = '';
    let user = '';
    let bookCodeList = [];
    const fs = window.require('fs');
    const path = require('path');
    const JSZip = require('jszip');
    const newpath = localStorage.getItem('userPath');
    await localforage.getItem('userProfile').then((usr) => user = usr);
    const folder = path.join(newpath, packageInfo.name, 'users', `${user?.username}`, 'resources');

    let alreadyExists = false;
    let downloadProjectName = '';
    fetch(`${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc&metadataType=sb&lang=el-x-koine&title=unfoldingWord®%20Greek%20New%20Testament&partialMatch=false&sort=released`)
      .then((res) => res.json())
      .then((myJson) => myJson.data.at(-1))
      .then(async (data) => {
        console.log(data);
        console.log("importedBookCodes ==",importedBookCodes);
        const existingResource = fs.readdirSync(folder, { withFileTypes: true });
        downloadProjectName = `${data?.name}_${data?.owner}_${data?.release?.tag_name}`;
        existingResource?.forEach((element) => {
          if (downloadProjectName === element.name) {
            alreadyExists = true;
            pathFolderFiles = path.join(folder, downloadProjectName)
            return;
          }
        });
        // if we already have the resources we get out of the function
        if(alreadyExists) return;

        // otherwise we download it
        try {
          logger.debug('NewProject.js', 'Download Started');
          setLoading(true);
          logger.debug('NewProject.js', 'In helps-resource download user fetch - ', user?.username);

          // download and unzip the content
          await fetch(data?.zipball_url)
            .then((res) => res.arrayBuffer())
            .then(async (blob) => {
              logger.debug('NewProject.js', 'In resource download - downloading zip content ');
              if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true });
              }
              // wririntg zip to local
              await fs.writeFileSync(path.join(folder, `${data?.name}.zip`), Buffer.from(blob));
              logger.debug('NewProject.js', 'In resource download - downloading zip content completed ');

              // extract zip
              logger.debug('NewProject.js', 'In resource download - Unzip downloaded resource');
              const filecontent = await fs.readFileSync(path.join(folder, `${data?.name}.zip`));
              const result = await JSZip.loadAsync(filecontent);
              const keys = Object.keys(result.files);

              // eslint-disable-next-line no-restricted-syntax
              for (const key of keys) {
                const item = result.files[key];
                if (item.dir) {
                  if(item.name.match('ugnt').length > 0) {
                    pathFolderFiles = path.join(folder, downloadProjectName);
                  }
                  fs.mkdirSync(path.join(folder, item.name), { recursive: true });
                } else {
                  // eslint-disable-next-line no-await-in-loop
                  const bufferContent = Buffer.from(await item.async('arraybuffer'));
                  fs.writeFileSync(path.join(folder, item.name), bufferContent);
                }
              }
              // let resourceMeta = {};
              await fetch(data.metadata_json_url)
                .then((res) => res.json())
                .then(async (data) => {
                    // adding offline true tag in  meta for identification
                    data.agOffline = true;
                    data.meta = data;
                    data.lastUpdatedAg = moment().format();
                    await fs.writeFileSync(path.join(folder, data?.name, 'metadata.json'), JSON.stringify(data));
                }).catch((err) => {
                    logger.debug('NewProject.js', 'failed to save yml metadata.json : ', err);
                });

              // finally remove zip and rename base folder to projectname_id
              logger.debug('NewProject.js', 'deleting zip file - rename project with project + id in scribe format');
              if (fs.existsSync(folder)) {
                fs.renameSync(path.join(folder, data?.name), path.join(folder, downloadProjectName));
                fs.unlinkSync(path.join(folder, `${data?.name}.zip`), (err) => {
                  if (err) {
                    logger.debug('NewProject.js', 'error in deleting zip');
                    throw new Error(`Removing Resource Zip Failed :  ${data?.name}.zip`);
                  }
                });
              }
            });
          logger.debug('NewProject.js', 'download completed');
          setLoading(false);
        } catch (err) {
          setLoading(false);
          throw err;
        }
      }).then(() => {
        const grammar = require('usfm-grammar');
        console.log('pathFolderFiles', pathFolderFiles);
        console.log('alreadyExists', alreadyExists);
        
        const files = importedFiles ? [...importedFiles] : [];
        const greekResources = fs.readdirSync(pathFolderFiles, { withFileTypes: true });
        console.log('greekResources ==', pathFolderFiles);
        let filePath = '';
        const re = new RegExp(/[A-Z\d]{3}/g);
        let matchedBookName;
        for(let greekUsfm of greekResources) {
          matchedBookName = greekUsfm.name.match(re);
          console.log('matchedBookName', matchedBookName);
          if(!matchedBookName || (matchedBookName[0] && importedBookCodes.includes(matchedBookName[0]))) {
            continue;
          }
          if(matchedBookName[0] && !canonSpecification.currentScope.includes(matchedBookName[0])) continue;

          filePath = path.join(pathFolderFiles, greekUsfm.name);
          const file = fs.readFileSync(filePath, 'utf8');
          const filename = greekUsfm.name;
          
          console.log('filePath == ', filePath);
          const fileExt = filename.split('.').pop()?.toLowerCase();
          console.log('fileExt == ', fileExt);
          if (fileExt === 'txt' || fileExt === 'usfm' || fileExt === 'text' || fileExt === 'sfm'
          || fileExt === undefined || fileExt === 'TXT' || fileExt === 'USFM' || fileExt === 'SFM') {
            const myUsfmParser = new grammar.USFMParser(file, grammar.LEVEL.RELAXED);
            const isJsonValid = myUsfmParser.validate();
            console.log('isJsonValid == ', isJsonValid);
            // if the USFM is valid
            if (isJsonValid) {
              console.log('before callReplace');
              callReplace(true);
              console.log('AFTER callReplace');
              logger.debug('NewProject.js', 'Valid USFM file.');
              // then we get the book code and we transform our data to our Juxta json file
              const jsonOutput = myUsfmParser.toJSON();
    
              // if the current file was NOT imported by the user, we create the juxta out of it
              if(importedBookCodes.includes(jsonOutput.book.bookCode)) continue;
              // if the current file is NOT in the canonSpecification set by the user, we don't do anything
              if(!canonSpecification.currentScope.includes(jsonOutput.book.bookCode)) continue;
    
              console.log('juxtaification of ', jsonOutput.book.bookCode);
              const juxtaJson = JSON.stringify(readUsfm(file, jsonOutput.book.bookCode));
              console.log('juxtaJson ', juxtaJson);
              files.push({ id: jsonOutput.book.bookCode, content: juxtaJson });
              console.log('my file');
              bookCodeList.push(jsonOutput.book.bookCode);
              console.log("bookCodeList",bookCodeList);
            }
          } else {
            logger.warn('NewProject.js', 'Invalid file.');
            setNotify('failure');
            // Nicolas : TODO translations
            setSnackText(`invalid file type : ${filePath}`);
            setOpenSnackBar(true);
          }
          matchedBookName = null;
        }
    
        setImportedBookCodes(bookCodeList);
        setImportedFiles(files);
      });
  }

  useEffect(() => {
    async function downloadAsynchronouslyTheBooks() {
      setDownloadingResources(true);
      // DO THE WORK HERE
      console.log("OKAY ACCEPTED");
      await importGreeksFromDoor43();
      logger.warn('NewProject.js', 'Calling createTheProject function');
      createTheProject(false);
      setUserWantToDownloadJuxtas('');
    }
    if(userWantToDownloadJuxtas === 'download' && !downloadingResources) {
      downloadAsynchronouslyTheBooks();
    }
  }, [userWantToDownloadJuxtas, setUserWantToDownloadJuxtas]);

  /**
   * Works only for 1-depth arrays
   * @param {Array} a 
   * @param {Array} b 
   * @returns {Boolean} true if the two arrays are equal
   */
  const compareArrays = (a, b) => a.length === b.length && a.every((element, index) => element === b[index]);

  const createTheProject = (update) => {
    logger.debug('NewProject.js', 'Creating new project.');
    // headerDropDown === projectType
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
  // Nicolas : the button that calls all the domino to create a project
  const validate = async () => {
    logger.debug('NewProject.js', 'Validating the fields.');
    setLoading(true);
    let create = true;
    let awaitForUserChoiceJuxta = false;
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
      
      if (create && !compareArrays(importedBookCodes, canonSpecification)) {
        create = false;
        setNotify('warning');
        setSnackText(t('Please no.'));
        setOpenModalJuxtaWrongSetOfBooks(true);
        awaitForUserChoiceJuxta = true;
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
        if(!awaitForUserChoiceJuxta) {
          logger.warn('NewProject.js', 'Calling createTheProject function');
          createTheProject(false);
        }
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

  function openImportPopUp() {
    setOpenPopUp(true);
  }

  function closeImportPopUp() {
    setOpenPopUp(false);
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

      // NicolasEdits : added Juxta
      case 'x-juxtalinear':
        setHeaderDropDown('Juxta');
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
      // header={BibleHeaderTagDropDown(headerDropDown, handleDropDown, call)}
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
            <div className="space-y-2 m-10">
              <span className="text-xs font-base mb-2 text-primary leading-4 tracking-wide  font-light">Project Type</span>
              {BibleHeaderTagDropDown(headerDropDown, handleDropDown, call)}
            </div>
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
                        className="w-40 h-10 my-5 bg-success leading-loose rounded shadow font-base text-white tracking-wide font-bold uppercase"
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
      <ConfirmationModal
        openModal={openModalJuxtaWrongSetOfBooks}
        title="modal-title-wrong-books-juxta-confirmation"
        setOpenModal={setOpenModalJuxtaWrongSetOfBooks}
        confirmMessage={'You\'ll have a big juxta here'}
        buttonName={t('btn-ok')}
        closeModal={userAcceptedToDownloadGreekJuxtas}
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
