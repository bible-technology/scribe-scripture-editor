# [Autographa](https://www.autographa.org/)

## IndexJS

### AppJS

    Higher order component with all child components pageJS from existing Autographa code

### Audio Component

#### Components

    AutographaStore is a mobx component

##### AutograhaStore

##### About

    Information about Autographa and version details

##### Footer

    Footer contains fontslider, 1x,2x,3x layout

##### Loader

    Loader is astate less component with styling

##### Search

    Find and replace Function stand alone component with set of sub compoennts

##### Reports

    Detail report of imported files ref, translation, paratext import with UI

-   ImportReport

##### AppLanguage

##### Download

    USFM and html export
        Before refactor
        1colHTML, 2colHTML functionality in nav bar
        export_css and export_html in util
        After refactor
        Placed inside the download folder
        With 1colHTML, 2colHTML, export_css and export_html

-   USFM
-   1-HTML
-   2-HTML
-   export_css
-   export_html

##### Navbar

    Navbar splited into BookChapter, DiffChecker and its functionalities.
    Reference setting, ref import and ReferenceMenuList are moved to reference folder
    with existing ReferencePanel and ReferenceContent

-   BookChapterNavigator
-   DiffChecker
-   BookNameEditor

##### Content

-   Refernece - ReferencePanel
    -   ReferenceImport
    -   ReferenceSettings
    -   ReferenceSelector
    -   core
        -   setup
-   Translation - TranslationPanel
    -   TranslationSettings
    -   TranslationImport
    -   Statistics
    -   JointVerse
    -   core
        -   setup

---

    Translation

TranslationSettings, TranslationImport, UpdateTranslationContent and save translation funtion
are moved from navbar to translation folder

##### Sync

    Sync
        Paratext
      Sign-in form splited from settings component to sync
        helpers functionalities eg: paratextAdapter moved from helper folder to sync
        Ahref component helps to handle external links

-   Signin
-   Ahref
-   List
-   Search
-   Create
-   List
-   Paratext - Adapter
-   Door43

##### TranslationHelps

    Translation Helps will be a moved from appjs to a standalone component

-   LanguageMenu

## Core

    For pouchdb setup for lookup, ref and target.

-   db - data_provider
    -   DbUtil
-   convert
    -   json_to_usfm
    -   usfm_to_json
    -   usfm_import
-   constants
-   FormatNumber

## lib

-   bible
    -   arb_vdt
    -   eng_ult
    -   eng_ust
    -   hin_irv
-   bible_Silhouette
-   language_code
-   refs_config
-   Translations (App Language translations JS fies)

## StoreContext

    StoreContext to keep all global states and functions

-   loadStates
-   Save

## Public

-   electron
-   electronWindow
-   index.html
-   loader
-   splash
