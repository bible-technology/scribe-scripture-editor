/* eslint-disable react/jsx-no-useless-fragment */
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import ResourcesPopUp from '@/components/Resources/ResourcesPopUp';
import { readRefBurrito } from 'src/core/reference/readRefBurrito.js';
import { readFile } from 'src/core/editor/readFile';
import ChecksContent from '@/components/EditorPage/TextEditor/ChecksContent';
import { classNames } from '@/util/classNames';
import TaNavigation from '@/components/EditorPage/Reference/TA/TaNavigation';
import TwNavigation from '@/components/EditorPage/Reference/TW/TwNavigation';
import { getScriptureDirection } from '@/core/projects/languageUtil';
import MenuDropdown from '@/components/MenuDropdown/MenuDropdown';
import AdjustmentsVerticalIcon from '@/icons/Common/AdjustmentsVertical.svg';
import XMarkIcon from '@/icons/Common/XMark.svg';
import SquaresPlusIcon from '@/icons/Common/SquaresPlus.svg';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from './ConfirmationModal';
import * as logger from '../../logger';
import packageInfo from '../../../../package.json';
import localforage from 'localforage';
// import checker from 'perf-checks';
import { getAvailableChecks, checks } from 'bible-checker';
// import { Proskomma } from 'proskomma-core';
import CheckSelector from './CheckSelector';
// import { convertUsfmToUsj } from '@/components/EditorPage/TextEditor/conversionUtils.js';
// import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker.tsx';

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
  const [contentChecks, setContentChecks] = useState({});
  const [choosingSourceLang, setChoosingSourceLang] = useState(false);
  const [referenceSourceLang, setReferenceSourceLang] = useState({});
  const [referenceSourceData, setReferenceSourceData] = useState(null);
  // const [highlightedtext, setHighlightedtext] = useState(null);
  const [recipe, setRecipe] = useState(getAvailableChecks());
  const { t } = useTranslation();

  const markers = [
    's#', 'mt#', 'mte#', 'ms#', 'mr', 'sr', 'r', 'rq', 'rq*', 'd', 'sp', 'sd#'
  ];

  const query = markers
    .map(marker => {
      if (marker.endsWith('#')) {
        return `.para[data-marker^="${marker.slice(0, -1)}"]`;
      }
      return `.para[data-marker="${marker}"]`;
    })
    .join(', ');

  const {
    state: {
      layout,
      bookId,
      bookList,
      chapter,
      openResource1,
      openResource2,
      openResource3,
      openResource4,
    },
    actions: {
      setLayout,
      onChangeChapter,
      onChangeVerse,
      setIsLoading,
    },
  } = useContext(ReferenceContext);
  // const {
  //   state: {
  //     bookId,
  //     bookList,
  //     bookName,
  //     chapter,
  //     verse,
  //     chapterList,
  //     verseList,
  //     languageId,
  //     //  closeNavigation,
  //   }, actions: {
  //     onChangeBook,
  //     onChangeChapter,
  //     onChangeVerse,
  //     applyBooksFilter,
  //     setCloseNavigation,
  //   },
  // } = useContext(ReferenceContext);
  const {
    states: { scrollLock, selectedProjectMeta },
    actions: { setOpenSideBar },
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
    setChoosingSourceLang(false);
    setOpenResourcePopUp(true);
    setLoadResource(true);
  };

  const showResourcesPanelFromChecks = () => {
    setChoosingSourceLang(true);
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

  /**
   * Highlights the text of a specific verse in the document and scrolls to it.
   * Highlights only the content of the verse, not the verse number.
   * Removes the highlight after 5 seconds.
   * 
   * @param {number} chapter - The chapter number.
   * @param {number} verse - The verse number.
   */
  function highlightVerse(chapter, verse) {
    // Construct the ID of the target verse element
    const verseId = `ch${chapter}v${verse}`;

    // Find the verse number element by ID
    const verseElement = document.getElementById(verseId);

    if (verseElement) {
      // Find the parent paragraph containing the verse text
      const paragraph = verseElement.closest('p');

      if (paragraph) {
        // Get all text nodes in the paragraph following the verse number
        const range = document.createRange();
        const startNode = verseElement.nextSibling;
        const endNode = findEndNode(paragraph, chapter, verse);

        // Define the range for highlighting
        if (startNode && endNode) {
          range.setStartAfter(verseElement);
          range.setEndBefore(endNode);

          // Wrap the range in a highlight span
          const highlightSpan = document.createElement('span');
          highlightSpan.className = 'highlight';
          range.surroundContents(highlightSpan);

          // Scroll the highlighted text into view
          // highlightSpan.scrollIntoView({
          //   behavior: 'smooth',
          //   block: 'center'
          // });

          // Remove the highlight after 5 seconds
          setTimeout(() => {
            highlightSpan.replaceWith(...highlightSpan.childNodes);
          }, 5000);

          return paragraph;
        }
      }
    } else {
      console.warn(`Verse with ID "${verseId}" not found.`);
    }

    return null;
  }

  /**
  * Finds the end node of the text for the current verse by searching for the next verse or chapter marker.
  * 
  * @param {HTMLElement} paragraph - The paragraph containing the verse text.
  * @param {number} chapter - The current chapter number.
  * @param {number} verse - The current verse number.
  * @returns {Node} The node where the current verse ends.
  */
  function findEndNode(paragraph, chapter, verse) {
    const children = Array.from(paragraph.children);
    let foundCurrent = false;

    for (const child of children) {
      if (child.id === `ch${chapter}v${verse}`) {
        foundCurrent = true;
      } else if (foundCurrent && (child.classList.contains('mark') || child.classList.contains('chapter'))) {
        return child;
      }
    }

    return paragraph.lastChild; // If no next marker is found, return the last node in the paragraph
  }

  /**
   * Scrolls to the specified chapter and verse in the document.
   * Highlights the verse content for clarity.
   *
   * @param {string} chapter - The chapter number to locate.
   * @param {string} verse - The verse number to locate.
   * @param {string} matchText - Text to match and highlight (optional).
   * @param {boolean} missing - Whether the verse is missing (optional).
   */
  function scrollToChapterVerse(chapter, verse, matchText = '', missing = false) {
    // Find the chapter element
    const chapterElement = document.querySelector(`.chapter[data-number="${chapter}"]`);
    if (!chapterElement) {
      console.error(`Chapter ${chapter} not found.`);
      return;
    }

    let currentElement = chapterElement.nextElementSibling;
    let verseElement = null;
    let lastVerseElement = null;
    let lastChapterElement = null;
    let nestedVerse = null;

    while (currentElement) {
      if (currentElement.matches(query)) {
        currentElement = currentElement.nextElementSibling;
        continue;
      }
      // If the element itself matches the verse, select it
      if (currentElement.matches(`.chapter[data-number="${parseInt(chapter) + 1}"]`)) {
        lastChapterElement = chapterElement;
        break;
      }
      if (currentElement.matches(`.verse[data-number="${verse}"]`)) {
        verseElement = currentElement;
        break;
      }

      nestedVerse = currentElement.querySelector(`.verse[data-number="${verse}"]`);
      if (nestedVerse) {
        verseElement = nestedVerse;
        break;
        // } else {
        //   nestedVerse = currentElement.querySelector(`.verse[data-number="${verse - 1}"]`);
        //   if (nestedVerse) {
        //     lastVerseElement = nestedVerse;
        //     break;
        //   }
      }

      // Move to the next sibling
      currentElement = currentElement.nextElementSibling;
    }

    if (!verseElement) {
      console.error(`Verse ${verse} in chapter ${chapter} not found.`);
      if (!lastVerseElement && !lastChapterElement) {
        return;
      } else {
        verseElement = lastVerseElement;
      }
    }

    if (lastChapterElement) {
      console.warn(`Verse ${verse} in chapter ${chapter} not found. Scrolling to the chapter instead.`);
      // chapterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      chapterElement.classList.add('highlight-chapter');
      setTimeout(() => chapterElement.classList.remove('highlight-chapter'), 5000);
      return chapterElement;
    }

    // Collect all elements after the verse number until the next verse
    const elementsToHighlight = [];
    // let sibling = verseElement.nextElementSibling;
    let isNextVerse = false;
    let isCorrectVerse = false;
    while (!isNextVerse) {
      if (currentElement.matches(query)) {
        currentElement = currentElement.nextElementSibling;
        continue;
      }
      let children = currentElement.childNodes;
      for (const child of children) {
        if (child.matches(`.verse[data-number="${verse}"]`)) {
          isCorrectVerse = true;
          continue;
        }

        // Stop at the next verse marker
        if (isCorrectVerse && (child.matches(`.verse`) || child.matches(`.chapter`))) {
          isNextVerse = true;
          break;
        }

        if (isCorrectVerse && child.hasAttribute('data-lexical-text') && child.getAttribute('data-lexical-text') === 'true') {
          elementsToHighlight.push(child);
        }
      }
      currentElement = currentElement.nextElementSibling;
    }

    // Highlight all elements
    elementsToHighlight.forEach((element) => {
      element.style.backgroundColor = 'orange';
      element.style.transition = 'background-color 0.3s ease';
    });

    // Remove highlight after 5 seconds
    setTimeout(() => {
      elementsToHighlight.forEach((element) => {
        element.style.backgroundColor = 'transparent';
      });
    }, 5000);

    // Scroll the first element into view
    if (elementsToHighlight.length > 0) {
      // elementsToHighlight[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return elementsToHighlight[0];
    }

  }

  const onReferenceClick = async (source_ref, source_chapter, source_verse, text = '') => {
    let ref = null;
    if (source_ref) {
      ref = source_ref;
    }
    if (source_chapter && source_verse) {
      ref = `${source_chapter}:${source_verse}`;
    }
    if (!source_chapter && source_verse) {
      ref = source_verse;
    }

    // let repeated = text.includes('repeated words');

    // if(repeated) {
    //   let repeatedWords = text.split(':')[1].split(',').map((w) => w.trim());
    //   console.log("text", repeatedWords);
    // }

    let clicked_chapter = ref.split(':')[0];
    let clicked_verse = ref.split(':')[1];
    if (chapter !== clicked_chapter) {
      onChangeChapter(clicked_chapter);
    }
    onChangeVerse(clicked_verse);
    const elementToScrollTo = [];

    elementToScrollTo.push(highlightVerse(clicked_chapter, clicked_verse));
    elementToScrollTo.push(scrollToChapterVerse(clicked_chapter, clicked_verse));

    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    for(const elem of elementToScrollTo) {
      if(elem) {
        elem.scrollIntoView({ top: elem.offsetTop, behavior: "auto", block: 'center' });
        await delay(500);
      }
    }
  }

  const doChecks = async () => {
    const fse = window.require('fs-extra');
    const path = window.require('path');

    // const usfmContent = { usfm: "\\id MRK" };
    const userProfile = await localforage.getItem('userProfile');
    const userName = userProfile?.username;
    const projectName = await localforage.getItem('currentProject');
    const newpath = localStorage.getItem('userPath');
    const metaPath = path.join(newpath, packageInfo.name, 'users', userName, 'projects', projectName, 'metadata.json');
    const metaData = JSON.parse(await readRefBurrito({ metaPath }));
    
    const _books = [];
    Object.entries(metaData.ingredients).forEach(async ([key, _ingredients]) => {
      if (_ingredients.scope) {
        const _bookID = Object.entries(_ingredients.scope)[0][0];
        const bookObj = { bookId: _bookID, fileName: key };
        _books.push(bookObj);
      }
    });
    const [currentBook] = _books.filter((bookObj) => bookObj.bookId === bookId?.toUpperCase());
    if (currentBook) {
      let response = null;
      const USJ = localStorage.getItem('usj');
      // console.log("SOURCE ==",JSON.parse(referenceSourceData));
      // console.log("TARGET ==",JSON.parse(USJ));

      if (referenceSourceData) {
        response = await checks(referenceSourceData, USJ, recipe);
      } else {
        response = await checks(USJ, USJ, recipe);
      }
      if (response) {
        setContentChecks(response.checks);
      }
    }
  }

  useEffect(() => {
    // Since we are adding reference resources from different places we have inconsistant data.
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
                  type="button"
                  className="px-2"
                  onClick={() => {
                    referenceResources.selectedResource = 'checks';
                    setLoadResource(true);
                    setReferenceResources(referenceResources);
                    doChecks();
                  }}
                >
                  <Cog8ToothIcon className="h-5 w-5 text-dark" />
                </button>
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

        {loadResource === false && referenceResources.selectedResource !== 'checks' ? (
          <div className="w-full h-full flex items-center justify-center prose-sm p-4 text-xl">
            <div className="text-center">
              <div className="p-5 text-xs uppercase pb-4">
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
            {selectedProjectMeta?.type?.flavorType?.flavor?.name == 'textTranslation' &&
              (<div className="text-center">
                <div className="p-5 text-xs uppercase pb-4">
                  {"Open checks"}
                </div>
                <button
                  type="button"
                  className="p-4 bg-gray-200 rounded-lg ring-offset-1"
                  onClick={() => {
                    let copyRefResources = referenceResources;
                    referenceResources.selectedResource = 'checks';
                    setLoadResource(true);
                    setReferenceResources(referenceResources);
                    doChecks();
                  }}
                >
                  <Cog8ToothIcon
                    aria-label="close-lock"
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </div>)}
          </div>
        ) : referenceResources.selectedResource !== 'checks' ? (
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
        ) : (
          <>
            <CheckSelector
              showResourcesPanel={showResourcesPanelFromChecks}
              recipe={recipe}
              setRecipe={setRecipe}
              referenceResources={referenceSourceLang}
              setReferenceSourceData={setReferenceSourceData}
              openResourcePopUp={openResourcePopUp}
              bookId={bookId}
            />
            <ChecksContent
              content={contentChecks}
              updateContent={doChecks}
              onReferenceClick={onReferenceClick}
              recipe={recipe}
            />
          </>
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
              choosingSourceLang={choosingSourceLang}
              setReferenceSourceLang={setReferenceSourceLang}
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
