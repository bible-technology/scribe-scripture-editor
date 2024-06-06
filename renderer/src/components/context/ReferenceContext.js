/* eslint-disable react/jsx-no-constructed-context-values */
import { useBibleReference } from 'bible-reference-rcl';
import React, {
  useState, createContext, useRef, useEffect,
} from 'react';
import PropTypes from 'prop-types';

import * as localforage from 'localforage';
import { splitStringByLastOccurance } from '@/util/splitStringByLastMarker';
import { saveReferenceResource } from '@/core/projects/updateAgSettings';
import { isElectron } from '../../core/handleElectron';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';

export const ReferenceContext = createContext({});

export default function ReferenceContextProvider({ children }) {
  const initialBook = '1ti';
  const initialChapter = '1';
  const initialVerse = '1';
  const [owner, setOwner] = useState('Door43-catalog'); // "es-419_gl"
  const [languageId, setLanguageId] = useState('en');
  const [selectedResource, SetSelectedResource] = useState('tn');
  const [server, setServer] = useState('https://git.door43.org');
  const [branch, setBranch] = useState('master');
  const [markdown, setMarkdown] = useState('markdown');
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [refName, setRefName] = React.useState('null');
  const [currentScope, setCurrentScope] = React.useState([]);
  const [openResource1, setOpenResource1] = React.useState(false);
  const [openResource2, setOpenResource2] = React.useState(true);
  const [openResource3, setOpenResource3] = React.useState(true);
  const [openResource4, setOpenResource4] = React.useState(true);
  const [openResourcePopUp, setOpenResourcePopUp] = React.useState(false);
  const [selectedFont, setSelectedFont] = React.useState('sans-serif');
  const [font1, setFont1] = useState('sans-serif');
  const [font2, setFont2] = useState('sans-serif');
  const [font3, setFont3] = useState('sans-serif');
  const [font4, setFont4] = useState('sans-serif');
  const [editorFontSize, setEditorFontSize] = React.useState(1);
  const [fontSize1, setFontsize1] = React.useState(1);
  const [fontSize2, setFontsize2] = React.useState(1);
  const [fontSize3, setFontsize3] = React.useState(1);
  const [fontSize4, setFontsize4] = React.useState(1);
  const [layout, setLayout] = useState(0);
  const [row, setRow] = useState(0);
  const [refernceLoading, setRefernceLoading] = useState({
    status: false,
    text: '',
  });
  const [counter, setCounter] = useState(7);
  const [bookmarksVerses, setBookmarksVerses] = useState([]);
  const myEditorRef = useRef();
  const [closeNavigation, setCloseNavigation] = useState(false);
  const [projectScriptureDir, setProjectScriptureDir] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [folderPath, setFolderPath] = React.useState();
  const [openImportResourcePopUp, setOpenImportResourcePopUp] = useState(false);
  const [obsNavigation, setObsNavigation] = useState('1');
  const [selectedStory, setSelectedStory] = useState();
  const [taNavigationPath, setTaNavigationPath] = useState({
    option: '',
    path: '',
  });
  const [audioContent, setAudioContent] = useState();
  const [audioPath, setAudioPath] = useState();
  const [updateWave, setUpdateWave] = useState(false);
  // Trigger the function after every recording and default change
  const [audioCurrentChapter, setAudioCurrentChapter] = useState();
  const [resetResourceOnDeleteOffline, setResetResourceOnDeleteOffline] = useState({
    referenceColumnOneData1Reset: false,
    referenceColumnOneData2Reset: false,
    referenceColumnTwoData1Reset: false,
    referenceColumnTwoData2Reset: false,
  });
  // Trigger for updating the data after cloud sync from Editor pane
  const [loadData, setLoadData] = useState(false);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const openResourceDialog = async () => {
    if (isElectron()) {
      logger.debug('ImportResource.js', 'Inside openResourceDialog');
      const options = { properties: ['openDirectory'] };
      const { dialog } = window.require('@electron/remote');
      const chosenFolder = await dialog.showOpenDialog(options);
      setFolderPath(chosenFolder.filePaths[0]);
    }
  };
  const handleSelectedFont = async (font) => {
    if (isElectron()) {
      saveReferenceResource(font);
      setSelectedFont(font);
    }
  };

  // define functon to change editor font size and call saveReference
  const handleEditorFontSize = async (currentFontSize) => {
    if (isElectron()) {
      setEditorFontSize(currentFontSize);
      // INFO : implement a debounce for this call if needed
      saveReferenceResource(selectedFont, currentFontSize);
    }
  };

  useEffect(() => {
    localforage.getItem('currentProject').then(async (projectName) => {
      if (projectName) {
        // const _projectname = projectName?.split('_');
        const _projectname = await splitStringByLastOccurance(projectName, '_');
        localforage.getItem('projectmeta').then((val) => {
          Object?.entries(val).forEach(
            ([, _value]) => {
              Object?.entries(_value).forEach(
                ([, resources]) => {
                  const id = Object.keys(resources.identification.primary[packageInfo.name]);
                  if (id[0] === _projectname[1]) {
                    switch (resources.type.flavorType.flavor.name) {
                      case 'textTranslation':
                        setBookmarksVerses(resources.project?.textTranslation.bookMarks);
                        setProjectScriptureDir(resources.project?.textTranslation?.scriptDirection?.toUpperCase());
                        setSelectedFont(resources.project?.textTranslation?.font);
                        setEditorFontSize(resources.project?.textTranslation?.fontSize || 1);
                        break;
                      case 'textStories':
                        setBookmarksVerses(resources.project?.textStories.bookMarks);
                        setProjectScriptureDir(resources.project?.textStories?.scriptDirection?.toUpperCase());
                        setObsNavigation(resources.project?.textStories.navigation ? resources.project?.textStories.navigation : '1');
                        setSelectedFont(resources.project?.textStories?.font);
                        setEditorFontSize(resources.project?.textStories?.fontSize);
                        break;
                      case 'audioTranslation':
                        setBookmarksVerses(resources.project?.audioTranslation.bookMarks);
                        setProjectScriptureDir(resources.project?.audioTranslation?.scriptDirection?.toUpperCase());
                        setSelectedFont(resources.project?.audioTranslation?.font);
                        setEditorFontSize(resources.project?.audioTranslation?.fontSize || 1);
                        break;
                      default:
                        break;
                    }
                  }
                },
              );
            },
          );
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    state: {
      chapter,
      verse,
      bookList,
      chapterList,
      verseList,
      bookName,
      bookId,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
    },
  } = useBibleReference(
    {
      initialBook,
      initialChapter,
      initialVerse,
    },
  );
  useEffect(() => {
    const getNavigationHistory = async () => {
      const navHistory = await localforage.getItem('navigationHistory');
      if (navHistory) {
        onChangeBook(navHistory[0], bookId);
        onChangeChapter(navHistory[1], chapter);
      }
    };
    getNavigationHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    state: {
      chapter,
      verse,
      bookList,
      chapterList,
      verseList,
      bookName,
      bookId,
      languageId,
      server,
      branch,
      owner,
      markdown,
      selectedResource,
      anchorEl,
      refName,
      currentScope,
      openResource1,
      openResource2,
      openResource3,
      openResource4,
      openResourcePopUp,
      selectedFont,
      font1,
      font2,
      font3,
      font4,
      fontSize1,
      fontSize2,
      fontSize3,
      fontSize4,
      editorFontSize,
      layout,
      row,
      refernceLoading,
      counter,
      bookmarksVerses,
      myEditorRef,
      closeNavigation,
      projectScriptureDir,
      isLoading,
      folderPath,
      openImportResourcePopUp,
      obsNavigation,
      selectedStory,
      taNavigationPath,
      audioContent,
      audioCurrentChapter,
      audioPath,
      resetResourceOnDeleteOffline,
      updateWave,
      loadData,
    },
    actions: {
      setLanguageId,
      setBranch,
      setServer,
      setOwner,
      setMarkdown,
      SetSelectedResource,
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
      handleEditorFontSize,
      setAnchorEl,
      handleClick,
      setRefName,
      setCurrentScope,
      setOpenResource1,
      setOpenResource2,
      setOpenResource3,
      setOpenResource4,
      setOpenResourcePopUp,
      setSelectedFont,
      handleSelectedFont,
      setFont1,
      setFont2,
      setFont3,
      setFont4,
      setEditorFontSize,
      setFontsize1,
      setFontsize2,
      setFontsize3,
      setFontsize4,
      setLayout,
      setRow,
      setRefernceLoading,
      setCounter,
      setBookmarksVerses,
      setCloseNavigation,
      setProjectScriptureDir,
      setIsLoading,
      setFolderPath,
      setOpenImportResourcePopUp,
      openResourceDialog,
      setObsNavigation,
      setSelectedStory,
      setTaNavigationPath,
      setAudioContent,
      setAudioCurrentChapter,
      setAudioPath,
      setResetResourceOnDeleteOffline,
      setUpdateWave,
      setLoadData,
    },
  };
  // const goToChapter = (chapternum, versenum) => (
  //   {
  //     chapter: parseInt(chapternum || chapter, 10),
  //     verse: parseInt(versenum || verse, 10),
  //   }
  // );

  return (
    <ReferenceContext.Provider value={value}>
      {children}
    </ReferenceContext.Provider>
  );
}
ReferenceContextProvider.propTypes = {
  children: PropTypes.any,
};
