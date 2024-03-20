export interface ReferenceState {
  owner: string;
  languageId: string;
  selectedResource: string;
  server: string;
  branch: string;
  markdown: string;
  anchorEl: any;
  refName: string;
  currentScope: any[];
  openResource1: boolean;
  openResource2: boolean;
  openResource3: boolean;
  openResource4: boolean;
  openResourcePopUp: boolean;
  selectedFont: string;
  font1: string;
  font2: string;
  font3: string;
  font4: string;
  fontSize: number;
  layout: number;
  row: number;
  referenceLoading: {
    status: boolean;
    text: string;
  };
  counter: number;
  bookmarksVerses: any[];
  myEditorRef: any;
  closeNavigation: boolean;
  projectScriptureDir: string | undefined;
  isLoading: boolean;
  folderPath: string | undefined;
  openImportResourcePopUp: boolean;
  obsNavigation: string;
  selectedStory: any;
  taNavigationPath: {
    option: string;
    path: string;
  };
  audioContent: any;
  audioPath: string | undefined;
  updateWave: boolean;
  audioCurrentChapter: any;
  resetResourceOnDeleteOffline: {
    referenceColumnOneData1Reset: boolean;
    referenceColumnOneData2Reset: boolean;
    referenceColumnTwoData1Reset: boolean;
    referenceColumnTwoData2Reset: boolean;
  };
  loadData: boolean;
}

export interface ReferenceActions {
  setOwner: (owner: string) => void;
  setLanguageId: (languageId: string) => void;
  SetSelectedResource: (selectedResource: string) => void;
  setServer: (server: string) => void;
  setBranch: (branch: string) => void;
  setMarkdown: (markdown: string) => void;
  setAnchorEl: (anchorEl: any) => void;
  setRefName: (refName: string) => void;
  setCurrentScope: (currentScope: any[]) => void;
  setOpenResource1: (open: boolean) => void;
  setOpenResource2: (open: boolean) => void;
  setOpenResource3: (open: boolean) => void;
  setOpenResource4: (open: boolean) => void;
  setOpenResourcePopUp: (open: boolean) => void;
  setSelectedFont: (font: string) => void;
  setFont1: (font: string) => void;
  setFont2: (font: string) => void;
  setFont3: (font: string) => void;
  setFont4: (font: string) => void;
  setFontsize: (size: number) => void;
  setLayout: (layout: number) => void;
  setRow: (row: number) => void;
  setReferenceLoading: (loading: { status: boolean; text: string }) => void;
  setCounter: (counter: number) => void;
  setBookmarksVerses: (verses: any[]) => void;
  setCloseNavigation: (close: boolean) => void;
  setProjectScriptureDir: (dir: string | undefined) => void;
  setIsLoading: (loading: boolean) => void;
  setFolderPath: (path: string | undefined) => void;
  setOpenImportResourcePopUp: (open: boolean) => void;
  setObsNavigation: (navigation: string) => void;
  setSelectedStory: (story: any) => void;
  setTaNavigationPath: (path: { option: string; path: string }) => void;
  setAudioContent: (content: any) => void;
  setAudioCurrentChapter: (chapter: any) => void;
  setAudioPath: (path: string | undefined) => void;
  setResetResourceOnDeleteOffline: (reset: {
    referenceColumnOneData1Reset: boolean;
    referenceColumnOneData2Reset: boolean;
    referenceColumnTwoData1Reset: boolean;
    referenceColumnTwoData2Reset: boolean;
  }) => void;
  setUpdateWave: (update: boolean) => void;
  setLoadData: (load: boolean) => void;
}


export interface ReferenceContextType {
  state: ReferenceState;
  actions: ReferenceActions;
}
