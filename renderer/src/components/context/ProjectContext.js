/* eslint-disable react/jsx-no-constructed-context-values */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as localforage from 'localforage';
import { splitStringByLastOccurance } from '@/util/splitStringByLastMarker';
import { isElectron } from '../../core/handleElectron';
import * as logger from '../../logger';
import { saveProjectsMeta, saveSupabaseProjectsMeta } from '../../core/projects/saveProjetcsMeta';
import { environment } from '../../../environment';
import staicLangJson from '../../lib/lang/langNames.json';
import packageInfo from '../../../../package.json';

import {
  newPath, sbStorageList, sbStorageUpload, sbStorageDownload,
} from '../../../../supabase';

const path = require('path');
const advanceSettings = require('../../lib/AdvanceSettings.json');

export const ProjectContext = React.createContext();

const ProjectContextProvider = ({ children }) => {
  const [editorSave, setEditorSave] = useState('');
  const [drawer, setDrawer] = useState(false);
  const [scrollLock, setScrollLock] = useState(false);
  const [sideTabTitle, setSideTabTitle] = useState('New');
  const [languages, setLanguages] = useState(staicLangJson);
  const [language, setLanguage] = useState({});
  const [customLanguages, setCustomLanguages] = useState([]);

  const [licenceList, setLicenseList] = useState(advanceSettings.copyright);
  const [copyright, setCopyRight] = useState(advanceSettings.copyright[0]);
  const [canonList, setCanonList] = useState(
    advanceSettings.canonSpecification,
  );
  const [canonSpecification, setcanonSpecification] = useState(
    advanceSettings.canonSpecification[0],
  );
  const [versification] = useState(advanceSettings.versification);
  const [versificationScheme, setVersificationScheme] = useState(
    advanceSettings.versification[0],
  );
  const [openSideBar, setOpenSideBar] = useState(false);
  const [newProjectFields, setNewProjectFields] = useState({
    projectName: '',
    description: '',
    abbreviation: '',
  });
  const [username, setUsername] = useState();
  const [selectedProject, setSelectedProject] = useState();
  const [selectedProjectMeta, setSelectedProjectMeta] = useState();
  const [importedFiles, setImportedFiles] = useState([]);
  const [sideBarTab, setSideBarTab] = useState('');

  const handleProjectFields = (prop) => (event) => {
    setNewProjectFields({ ...newProjectFields, [prop]: event.target.value });
  };

  const uniqueId = (list, id) => list.some((obj) => obj.id === id);

  const createSettingJson = (fs, file) => {
    logger.debug('ProjectContext.js', 'Loading data from AdvanceSetting.json file');
    setCanonList(advanceSettings.canonSpecification);
    setLicenseList((advanceSettings.copyright).push({
      id: 'Other', title: 'Custom', licence: '', locked: false,
    }));
    // setLanguages([advanceSettings.languages]);
    const json = {
      version: environment.AG_USER_SETTING_VERSION,
      history: {
        copyright: [{
          id: 'Other', title: 'Custom', licence: '', locked: false,
        }],
        languages: [],
        textTranslation: {
          canonSpecification: [{
            id: 4, title: 'Other', currentScope: [], locked: false,
          }],
        },
      },
      appLanguage: 'en',
      theme: 'light',
      userWorkspaceLocation: '',
      commonWorkspaceLocation: '',
      resources: {
        door43: {
          translationNotes: [],
          translationQuestions: [],
          translationWords: [],
          obsTranslationNotes: [],
        },
      },
      sync: { services: { door43: [] } },
    };
    logger.debug('ProjectContext.js', `Creating a ${environment.USER_SETTING_FILE} file`);
    if (!fs.existsSync(file.replace(environment.USER_SETTING_FILE, ''))) {
      fs.mkdirSync(file.replace(environment.USER_SETTING_FILE, ''));
    }
    fs.writeFileSync(file, JSON.stringify(json));
  };
  const createWebSettingJson = (file) => {
    logger.debug('ProjectContext.js', 'Loading data from AdvanceSetting.json file');
    setCanonList(advanceSettings.canonSpecification);
    setLicenseList((advanceSettings.copyright).push({
      id: 'Other', title: 'Custom', licence: '', locked: false,
    }));
    // setLanguages([advanceSettings.languages]);
    const json = {
      version: environment.AG_USER_SETTING_VERSION,
      history: {
        copyright: [{
          id: 'Other', title: 'Custom', licence: '', locked: false,
        }],
        languages: [],
        textTranslation: {
          canonSpecification: [{
            id: 4, title: 'Other', currentScope: [], locked: false,
          }],
        },
      },
      appLanguage: 'en',
      theme: 'light',
      userWorkspaceLocation: '',
      commonWorkspaceLocation: '',
      resources: {
        door43: {
          translationNotes: [],
          translationQuestions: [],
          translationWords: [],
          obsTranslationNotes: [],
        },
      },
      sync: { services: { door43: [] } },
    };
    const data = sbStorageList(file);
    if (data.length === 0) {
       sbStorageUpload(file, JSON.stringify(json), {
        cacheControl: '3600',
        upsert: false,
      });
    }
  };
  const concatLanguages = async (json, staicLangJson) => {
    logger.debug('ProjectContext.js', 'In concat languages');
    const userlanguages = [];
    json.history?.languages?.forEach((userLang) => {
      const obj = {};
      obj.id = userLang?.id || null;
      obj.ang = userLang.title;
      obj.ld = userLang.scriptDirection;
      obj.custom = userLang?.custom || true;
      obj.lc = userLang?.langCode || '';
      userlanguages.push(obj);
    });
    const concatedLang = userlanguages.length > 0
      ? (staicLangJson)
        .concat(userlanguages)
      : staicLangJson;
    return { concatedLang, userlanguages };
  };

  const loadSettings = async () => {
    logger.debug('ProjectContext.js', 'In loadSettings');
    const newpath = await localStorage.getItem('userPath');
    let currentUser;
    await localforage.getItem('userProfile').then((value) => {
      currentUser = value?.username;
      setUsername(currentUser);
    });
    if (!currentUser) {
      logger.error('ProjectContext.js', 'Unable to find current user');
      return;
    }
    const fs = window.require('fs');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser, environment.USER_SETTING_FILE);
    if (fs.existsSync(file)) {
      const agUserSettings = await fs.readFileSync(file);
      if (agUserSettings) {
        logger.debug('ProjectContext.js', 'Successfully read the data from file');
        const json = JSON.parse(agUserSettings);

        if (json.version === environment.AG_USER_SETTING_VERSION) {
          // Checking whether any custom copyright id available (as expected else will
          // create a new one) or not
          if (json.history?.copyright) {
            if (json.history?.copyright?.licence) {
              setLicenseList((advanceSettings.copyright)
                .concat(json.history?.copyright));
            } else {
              const newObj = (advanceSettings.copyright).filter((item) => item.Id !== 'Other');
              newObj.push({
                id: 'Other', title: 'Custom', licence: '', locked: false,
              });
              setLicenseList(newObj);
            }
          } else {
            setLicenseList(advanceSettings.copyright);
          }
          setCanonList(json.history?.textTranslation.canonSpecification
            ? (advanceSettings.canonSpecification)
              .concat(json.history?.textTranslation.canonSpecification)
            : advanceSettings.canonSpecification);
          // concat static and custom languages
          const langFilter = await concatLanguages(json, staicLangJson);
          const filteredLang = langFilter.concatedLang.filter((lang) => lang?.ang.trim() !== '');
          setLanguages([...filteredLang]);
          setCustomLanguages(langFilter.userlanguages);
        } else {
          createSettingJson(fs, file);
        }
      }
    } else {
      createSettingJson(fs, file);
    }
  };

  const loadWebSettings = async () => {
    let currentUser;
    await localforage.getItem('userProfile').then((value) => {
      currentUser = value.user.email;
      setUsername(value.user.email);
    });
    if (!currentUser) {
      // eslint-disable-next-line no-console
      console.error('ProjectContext.js', 'Unable to find current user');
    }

    const file = `${newPath}/${currentUser}/${environment.USER_SETTING_FILE}`;
    const { data: agUserSettings, error } = await sbStorageDownload(file);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('ProjectContext.js', 'Failed to read the data from file');
    }
    const json = JSON.parse(await agUserSettings.text());
    if (json.version === environment.AG_USER_SETTING_VERSION) {
      if (json.history?.copyright) {
        if (json.history?.copyright?.licence) {
          setLicenseList((advanceSettings.copyright)
            .concat(json.history?.copyright));
        } else {
          const newObj = (advanceSettings.copyright).filter((item) => item.Id !== 'Other');
          newObj.push({
            id: 'Other', title: 'Custom', licence: '', locked: false,
          });
          setLicenseList(newObj);
        }
      } else {
        setLicenseList(advanceSettings.copyright);
      }
      setCanonList(json.history?.textTranslation.canonSpecification
        ? (advanceSettings.canonSpecification)
          .concat(json.history?.textTranslation.canonSpecification)
        : advanceSettings.canonSpecification);
      // concat static and custom languages
      const langFilter = await concatLanguages(json, staicLangJson);
      const filteredLang = langFilter.concatedLang.filter((lang) => lang?.ang.trim() !== '');
      setLanguages([...filteredLang]);
      setCustomLanguages(langFilter.userlanguages);
    } else {
      createWebSettingJson(file);
    }
  };
  // Json for storing advance settings
  const updateJson = async (currentSettings) => {
    logger.debug('ProjectContext.js', 'In updateJson');
    const newpath = await localStorage.getItem('userPath');
    let currentUser;
    await localforage.getItem('userProfile').then((value) => {
      currentUser = value.username;
      setUsername(value.username);
    });
    const fs = window.require('fs');
    const file = path.join(newpath, packageInfo.name, 'users', currentUser, environment.USER_SETTING_FILE);
    if (fs.existsSync(file)) {
      const agUserSettings = await fs.readFileSync(file);
      if (agUserSettings) {
        logger.debug('ProjectContext.js', 'Successfully read the data from file');
        const json = JSON.parse(agUserSettings);
        // eslint-disable-next-line no-nested-ternary
        const currentSetting = (currentSettings === 'copyright' ? copyright
          : (currentSettings === 'languages' ? {
            title: language.ang,
            id: language.id,
            scriptDirection: language.ld,
            langCode: language.lc,
            custom: true,
          }
            : canonSpecification));
        if (currentSettings === 'canonSpecification') {
          (json.history?.textTranslation[currentSettings])?.push(currentSetting);
        } else if (json.history[currentSettings]
          && uniqueId(json.history[currentSettings], currentSetting.id)) {
          (json.history[currentSettings]).forEach((setting) => {
            if (setting.id === currentSetting.id) {
              const keys = Object.keys(setting);
              keys.forEach((key) => {
                setting[key] = currentSetting[key];
              });
            }
          });
        } else {
          // updating the canon or pushing new language
          (json.history[currentSettings]).push(currentSetting);
        }
        json.version = environment.AG_USER_SETTING_VERSION;
        json.sync.services.door43 = json?.sync?.services?.door43 ? json?.sync?.services?.door43 : [];
        logger.debug('ProjectContext.js', 'Upadting the settings in existing file');
        await fs.writeFileSync(file, JSON.stringify(json));
        logger.debug('ProjectContext.js', 'Loading new settings from file');
        await loadSettings();
      } else {
        logger.error('ProjectContext.js', 'Failed to read the data from file');
      }
    }
  };

    const updateWebJson = async (currentSettings) => {
      let currentUser;
      await localforage.getItem('userProfile').then((value) => {
        currentUser = value.user.email;
        setUsername(value.user.email);
      });
      const file = `${newPath}/${currentUser}/${environment.USER_SETTING_FILE}`;
      const { data } = await sbStorageDownload(file);
      if (data) {
        const json = JSON.parse(await data.text());
        // eslint-disable-next-line no-nested-ternary
        const currentSetting = (currentSettings === 'copyright' ? copyright
          : (currentSettings === 'languages' ? {
            title: language.ang,
            id: language.id,
            scriptDirection: language.ld,
            langCode: language.lc,
            custom: true,
          }
            : canonSpecification));
        if (currentSettings === 'canonSpecification') {
          (json.history?.textTranslation[currentSettings])?.push(currentSetting);
        } else if (json.history[currentSettings]
          && uniqueId(json.history[currentSettings], currentSetting.id)) {
          (json.history[currentSettings]).forEach((setting) => {
            if (setting.id === currentSetting.id) {
              const keys = Object.keys(setting);
              keys.forEach((key) => {
                setting[key] = currentSetting[key];
              });
            }
          });
        } else {
          // updating the canon or pushing new language
          (json.history[currentSettings]).push(currentSetting);
        }
        json.version = environment.AG_USER_SETTING_VERSION;
        json.sync.services.door43 = json?.sync?.services?.door43 ? json?.sync?.services?.door43 : [];
        await sbStorageUpload(file, JSON.stringify(json));
        await loadWebSettings();
      } else {
        // eslint-disable-next-line no-console
        console.error('ProjectContext.js', 'Failed to read the data from file');
      }
    };

  // common functions for create projects
  const createProjectCommonUtils = async () => {
    logger.debug('ProjectContext.js', 'In createProject common utils');
    if (language?.id) {
      // /check lang exist in backend and check any field value changed
      if (uniqueId(customLanguages, language.id)) {
        customLanguages.forEach(async (lang) => {
          if (lang.id === language.id) {
            if (lang.ang !== language.ang
              || lang.ld !== language.ld || lang.lc !== language.lc) {
              isElectron() ? await updateJson('languages') : await updateWebJson('languages');
            }
          }
        });
      } else {
        // add language to custom
        isElectron() ? await updateJson('languages') : await updateWebJson('languages');
      }
    }
    // Update Custom licence into current list.
    if (copyright.title === 'Custom') {
      isElectron() ? await updateJson('copyright') : await updateWebJson('copyright');
    } else {
      const myLicence = Array.isArray(licenceList) ? licenceList.find((item) => item.title === copyright.title) : [];
      // eslint-disable-next-line import/no-dynamic-require
      const licensefile = require(`../../lib/license/${copyright.title}.md`);
      myLicence.licence = licensefile.default;
      setCopyRight(myLicence);
    }
  };

  // common functions for create projects
  const createProjectTranslationUtils = async () => {
    logger.debug('ProjectContext.js', 'In createProject Translation utils');
    // Update Custom canon into current list.
    if (canonSpecification.title === 'Other') {
      isElectron() ? await updateJson('canonSpecification') : await updateWebJson('canonSpecification');
    }
  };

  const createProject = async (call, project, update, projectType) => {
    logger.debug('ProjectContext.js', 'In createProject');
    await createProjectCommonUtils();
    // common props pass for all project type
    const projectMetaObj = {
      newProjectFields,
      language,
      copyright,
      importedFiles,
      call,
      project,
      update,
      projectType,
    };
    if (projectType !== 'OBS') {
      createProjectTranslationUtils();
      const temp_obj = {
        versificationScheme: versificationScheme.title,
        canonSpecification,
      };
      Object.assign(projectMetaObj, temp_obj);
    }
    logger.debug('ProjectContext.js', 'Calling saveProjectsMeta with required props');
    const status = isElectron() ? await saveProjectsMeta(projectMetaObj) : await saveSupabaseProjectsMeta(projectMetaObj);
    return status;
  };

  const createSupabaseProject = async (call, project, update, projectType) => {
    createProjectCommonUtils();
    // common props pass for all project type
    const projectMetaObj = {
      newProjectFields,
      language,
      copyright,
      importedFiles,
      call,
      project,
      update,
      projectType,
    };
    if (projectType !== 'OBS') {
      createProjectTranslationUtils();
      const temp_obj = {
        versificationScheme: versificationScheme.title,
        canonSpecification,
      };
      Object.assign(projectMetaObj, temp_obj);
    }
    logger.debug('ProjectContext.js', 'Calling saveSupabaseProjectsMeta with required props');
    const status = saveSupabaseProjectsMeta(projectMetaObj);
    return status;
  };
  const resetProjectStates = () => {
    const initialState = {
      language: '',
      projectName: '',
      scriptDirection: 'LTR',
    };
    setNewProjectFields({ ...initialState });
    setCopyRight();
    setcanonSpecification('OT');
    setVersificationScheme('kjv');
  };

  React.useEffect(() => {
    if (isElectron()) {
      loadSettings();
      localforage.getItem('userProfile').then((value) => {
        setUsername(value?.username);
      });
      localforage.getItem('currentProject').then((projectName) => {
        setSelectedProject(projectName);
        // setProjectMeta in a var
        localforage.getItem('projectmeta').then((projectMeta) => {
          setSelectedProject(projectName);
          // setProjectMeta in a var
          projectMeta?.projects.forEach((meta) => {
            const currentprojectId = Object.keys(meta.identification.primary[packageInfo.name])[0];
            const currentprojectName = meta.identification.name.en;
            splitStringByLastOccurance(projectName, '_').then((arr) => {
              if (arr.length > 0 && arr[0].toLowerCase() === currentprojectName.toLowerCase()
                && arr[1].toLowerCase() === currentprojectId.toLocaleLowerCase()) {
                setSelectedProjectMeta(meta);
              }
            });
          });
        });
      });
    } else if (!process.env.NEXT_PUBLIC_IS_ELECTRON) {
      loadWebSettings();
      localforage.getItem('userProfile').then((value) => {
        setUsername(value?.user?.email);
      });
      localforage.getItem('currentProject').then((projectName) => {
        setSelectedProject(projectName);
        // setProjectMeta in a var
        localforage.getItem('projectmeta').then((projectMeta) => {
          setSelectedProject(projectName);
          // setProjectMeta in a var
          projectMeta?.projects.forEach((meta) => {
            const currentprojectId = Object.keys(meta.identification.primary[packageInfo.name])[0];
            const currentprojectName = meta.identification.name.en;
            splitStringByLastOccurance(projectName, '_').then((arr) => {
              if (arr.length > 0 && arr[0].toLowerCase() === currentprojectName.toLowerCase()
                && arr[1].toLowerCase() === currentprojectId.toLocaleLowerCase()) {
                setSelectedProjectMeta(meta);
              }
            });
          });
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const context = {
    states: {
      newProjectFields,
      drawer,
      copyright,
      canonSpecification,
      versification,
      versificationScheme,
      sideTabTitle,
      selectedProject,
      canonList,
      licenceList,
      languages,
      language,
      scrollLock,
      username,
      openSideBar,
      editorSave,
      sideBarTab,
      selectedProjectMeta,
    },
    actions: {
      setDrawer,
      setCopyRight,
      setcanonSpecification,
      setVersificationScheme,
      handleProjectFields,
      resetProjectStates,
      setSideTabTitle,
      setSelectedProject,
      createProject,
      createSupabaseProject,
      setLanguage,
      setScrollLock,
      setUsername,
      setOpenSideBar,
      setNewProjectFields,
      setImportedFiles,
      setLanguages,
      setEditorSave,
      setSideBarTab,
      setSelectedProjectMeta,
    },
  };

  return (
    <ProjectContext.Provider value={context}>
      {children}
    </ProjectContext.Provider>
  );
};
export default ProjectContextProvider;
ProjectContextProvider.propTypes = {
  children: PropTypes.node,
};
