# [Autographa](https://www.autographa.org/)
> Class component will be enhanced to functional components with react hooks
> Component Styling will be done with react material UI (makestyles, usestyles...)
## Phase 1 
*  [ ] Basic DB setup with refernceDB, translationDB and lookupsDB
> files need to be added are : data_provider.js and Db_util
*  [ ] Adding preloaded reference bibles (JSON) & also verify, ref_config and add bible [Silhouette](https://en.wikipedia.org/wiki/Silhouette)
*  [ ] Update App.js File with db Setup on mount except react-intl and call the higher order component such as NavBar.js 
*  [ ] Create a Refernce directroy and make core function with all the setup for reference content(refer nav bar for refercence content db update and design of html content)
>  files need to be added:
> reference/core/setup
> AutographaStore.js
* [ ] Create a refernce panel with material UI makestyles and paper
> file: ReferencePanel.JS
* [ ] Create a refernceSelector with menulist using materialUI and functionality to change reference accordingly
> file: ReferenceSelector.js
* [ ] Make an navBar (AppBar) using materialUI with all the icons placed exactly as the previous UI.

## Phase 2
* [ ] Create Independent component such as About, Loader Component, Search, Report Comp with props
> files: About.js, Loader.js, Search.js
> Report/ImportReport.js
* [ ] Create Translation Component by setting up core DB setup and update
> Files: core/setup.js
* [ ] Create an editable Translation Panel with the UI and basic fuctionality (highlighting)
> File: TranslationPanel.js
* [ ] Create Statistic Componet that links to Translation panel with props or StoreContext
> file: Statistics.js
* [ ] Make a translation settings and translation Import Component and connect it with usfm_to_json file with all the functionality for import and display and also connect with settings icon in the appBar and tabs of material
> files: TranslationSettings.js, TranslationImport, USFM to JSON etc..
* [ ] Create a Joint verse context menu as an independent component with functionality that connects to translation panel through storeContext.
> file: JointVerse.js
* [ ] Create ReferenceSettinngTab and ReferenceImport and connect to usfm_to_Json with all db update functionality and file reading. And also connect the same to Setting icon as a tab container.
> files: ReferenceSettinngTab, ReferenceImport
* [ ] Connect both the Import with ImportReport Component by passing props or useContext

## Phase 3
* [ ] Create Footer Component with layout functionality and font slider and save translation function
> file: Footer.js
* [ ] Connect the componets with corresponding icons and call accordingly each componets in navbar
* [ ] Add component booknameEditor, BookChapterNavigator with all corresponding functionality and also diff checker component
> file: BookChapterNavigator.js, DiffChecker, BookNameEditor
* [ ] Create Download Component with all supp component(usfm export, 1col html, 2colhtml) and its supporting core files like Json to html and its design
> USFM, 1-HTML, 2-HTML, Export Html, Export CSS etc
* [ ] Create and add translation Help component with language selector
* [ ] Adding sync feature with corresponding helper files and UI
    * [ ] Paratext sync 
    * [ ] Gitea component
* [ ] Making app language Component and pass id and proprs for all the translations and update parent app.js file accordingly  