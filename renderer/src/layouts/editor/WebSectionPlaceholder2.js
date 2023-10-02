'use client';

/* eslint-disable react/jsx-no-useless-fragment */
import dynamic from 'next/dynamic';
import { useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import PropTypes from 'prop-types';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import EditorSection from '@/layouts/editor/EditorSection';
import { ProjectContext } from '@/components/context/ProjectContext';
import CustomNavigation from '@/components/EditorPage/Navigation/CustomNavigation';
import NavigationObs from '@/components/EditorPage/ObsEditor/NavigationObs';
import ReferenceObs from '@/components/EditorPage/ObsEditor/ReferenceObs';
import { webCore } from '@/components/EditorPage/ObsEditor/core';
import ReferenceAudio from '@/components/EditorPage/Reference/Audio/ReferenceAudio';
import { SnackBar } from '@/components/SnackBar';
import useAddNotification from '@/components/hooks/useAddNotification';
import { fetchSettingsResourceHistory } from '@/core/editor/fetchSettingsResourceHistory';
import { saveSettingsResourceHistory } from '@/core/editor/saveSettingsResourceHistory';
import ReferenceBibleX from '@/components/EditorPage/Reference/ReferenceBible/ReferenceBibleX';
import ScribexContextProvider from '@/components/context/ScribexContext';
import * as logger from '../../logger';

const TranslationHelps = dynamic(
  () => import('@/components/EditorPage/Reference/TranslationHelps'),
  { ssr: false },
);

const SectionPlaceholder2 = ({ editor }) => {
  const sectionPlaceholderNum = '2';
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const { addNotification } = useAddNotification();
  const supportedBooks = null;
  const [referenceColumnTwoData1, setReferenceColumnTwoData1] = useState({
    languageId: '',
    selectedResource: '',
    refName: '',
    header: '',
    owner: '',
    offlineResource: { offline: false },
  });
  const [referenceColumnTwoData2, setReferenceColumnTwoData2] = useState({
    languageId: '',
    selectedResource: '',
    refName: '',
    header: '',
    owner: '',
    offlineResource: { offline: false },
  });
  const [loadResource3, setLoadResource3] = useState(false);
  const [loadResource4, setLoadResource4] = useState(false);
  const [removingSection, setRemovingSection] = useState();
  const [addingSection, setAddingSection] = useState();
  const {
    state: {
      layout,
      openResource1,
      openResource2,
      openResource3,
      openResource4,
      bookId,
      chapter,
      verse,
      obsNavigation,
      resetResourceOnDeleteOffline,
      font3,
      font4,
    },
    actions: {
      setRow,
      setOpenResource3,
      setOpenResource4,
      applyBooksFilter,
      setLayout,
      setResetResourceOnDeleteOffline,
      setFont3,
      setFont4,
    },
  } = useContext(ReferenceContext);
  const {
    states: {
      scrollLock,
    },
  } = useContext(ProjectContext);
  const [sectionNum, setSectionNum] = useState(0);
  const [hideAddition, setHideAddition] = useState(true);
  const [naviagation1, setNavigation1] = useState({
    bookId,
    chapter,
    verse,
  });

  const [naviagation2, setNavigation2] = useState({
    bookId,
    chapter,
    verse,
  });

  const _bookId1 = scrollLock === false ? bookId : naviagation1.bookId;
  const _chapter1 = scrollLock === false ? chapter : naviagation1.chapter;
  const _verse1 = scrollLock === false ? verse : naviagation1.verse;

  const _bookId2 = scrollLock === false ? bookId : naviagation2.bookId;
  const _chapter2 = scrollLock === false ? chapter : naviagation2.chapter;
  const _verse2 = scrollLock === false ? verse : naviagation2.verse;

  useEffect(() => {
    if (layout > 0 && layout <= 2) {
      setRow(0);
      if (sectionNum === 0) { setSectionNum(1); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  useEffect(() => {
    applyBooksFilter(supportedBooks);
  }, [applyBooksFilter, supportedBooks]);

  // reset panes on delete offline contents
  useEffect(() => {
    if (resetResourceOnDeleteOffline?.referenceColumnTwoData1Reset || removingSection === '3') {
      setReferenceColumnTwoData1((prev) => ({
        ...prev,
        languageId: '',
        selectedResource: '',
        refName: '',
        header: '',
        owner: '',
        offlineResource: { offline: false },
      }
      ));
      setResetResourceOnDeleteOffline((prev) => ({
        ...prev,
        referenceColumnTwoData1Reset: false,
      }
      ));
      setLoadResource3(false);
    }
    if (resetResourceOnDeleteOffline?.referenceColumnTwoData2Reset || removingSection === '4') {
      setReferenceColumnTwoData2((prev) => ({
        ...prev,
        languageId: '',
        selectedResource: '',
        refName: '',
        header: '',
        owner: '',
        offlineResource: { offline: false },
      }
      ));
      setResetResourceOnDeleteOffline((prev) => ({
        ...prev,
        referenceColumnTwoData2Reset: false,
      }
      ));
      setLoadResource4(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetResourceOnDeleteOffline?.referenceColumnTwoData1Reset, resetResourceOnDeleteOffline?.referenceColumnTwoData2Reset,
    removingSection]);

  const getReferenceHistoryOnLoad = async () => new Promise((resolve) => {
    fetchSettingsResourceHistory(
      setRemovingSection,
      setReferenceColumnTwoData1,
      setReferenceColumnTwoData2,
      referenceColumnTwoData1,
      referenceColumnTwoData2,
      setLayout,
      setLoadResource3,
      setLoadResource4,
      setOpenResource3,
      setOpenResource4,
      setSectionNum,
      setNotify,
      setSnackText,
      setOpenSnackBar,
      addNotification,
      sectionPlaceholderNum,
    ).then(() => {
      resolve();
    });
  });

  // call useEffect on Load resource
  useEffect(() => {
    getReferenceHistoryOnLoad().then(() => {
      logger.debug('SectionPlaceholder2.js', 'Getting Resources Reference on Load');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sectionNum === 2) {
      setHideAddition(false);
    } else {
      setHideAddition(true);
    }
    if (openResource1 === true && openResource2 === true
      && openResource3 === true && openResource4 === true) {
      if (layout === 1) {
        setLayout(0);
      }
    }
  }, [layout, openResource1, openResource2, openResource3, openResource4, sectionNum, setLayout]);

  // call useEffect on Save reference (call on new resource / new pane)
  useEffect(() => {
    (async () => {
      saveSettingsResourceHistory(
        sectionNum,
        openResource3,
        openResource4,
        layout,
        referenceColumnTwoData1,
        referenceColumnTwoData2,
        addingSection,
        removingSection,
        setAddingSection,
        setRemovingSection,
        sectionPlaceholderNum,
        setReferenceColumnTwoData1,
        setReferenceColumnTwoData2,
        setOpenResource3,
        setOpenResource4,
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openResource3, openResource4, referenceColumnTwoData1?.languageId,
    referenceColumnTwoData1.refName, referenceColumnTwoData1?.selectedResource, referenceColumnTwoData2?.languageId,
    referenceColumnTwoData2?.refName, referenceColumnTwoData2?.selectedResource, sectionNum, layout,
    referenceColumnTwoData1?.owner, referenceColumnTwoData2?.owner, removingSection, addingSection,
    referenceColumnTwoData1.offlineResource, referenceColumnTwoData2.offlineResource,
    resetResourceOnDeleteOffline?.referenceColumnTwoData1Reset, resetResourceOnDeleteOffline?.referenceColumnTwoData2Reset,
  ]);

  // referenceColumnTwoData1, referenceColumnTwoData2 openResource1, openResource2,
  const CustomNavigation1 = (
    <CustomNavigation
      setNavigation={setNavigation1}
      initialBook={bookId}
      initialChapter={chapter}
      initialVerse={verse}
    />
  );

  const CustomNavigation2 = (
    <CustomNavigation
      setNavigation={setNavigation2}
      initialBook={bookId}
      initialChapter={chapter}
      initialVerse={verse}
    />
  );
  const [obsNavigation1, setObsNavigation1] = useState(1);
  const [obsNavigation2, setObsNavigation2] = useState(1);
  const [stories1, setStories1] = useState();
  const [stories2, setStories2] = useState();
  const _obsNavigation1 = scrollLock === false ? obsNavigation : obsNavigation1;
  const _obsNavigation2 = scrollLock === false ? obsNavigation : obsNavigation2;
  const ObsNavigation1 = (
    <NavigationObs
      onChangeNumber={(value) => setObsNavigation1(value)}
      number={obsNavigation1}
    />
  );
  const ObsNavigation2 = (
    <NavigationObs
      onChangeNumber={(value) => setObsNavigation2(value)}
      number={obsNavigation2}
    />
  );
  useEffect(() => {
    async function fetchStories() {
      const user = await localforage.getItem('userProfile');
      if (_obsNavigation1 && referenceColumnTwoData1.refName && referenceColumnTwoData1.selectedResource === 'obs') {
        setStories1(await webCore(_obsNavigation1, referenceColumnTwoData1.refName, user?.user?.email));
      }
      if (_obsNavigation2 && referenceColumnTwoData2.refName && referenceColumnTwoData2.selectedResource === 'obs') {
        setStories2(await webCore(_obsNavigation2, referenceColumnTwoData2.refName, user?.user?.email));
      }
    }
    fetchStories();
  }, [_obsNavigation1, _obsNavigation2, referenceColumnTwoData1, referenceColumnTwoData2]);
  return (
    <>
      {((openResource1 === true && openResource2 === true)
        ? (layout >= 1 && layout <= 2) : (layout > 1 && layout <= 2)) && (
          <>
            {(openResource3 === false || openResource4 === false) && (
              <div className={`bg-white rounded-md grid gap-2 ${editor === 'audioTranslation' ? 'md:max-h-[64vh] lg:max-h-[70vh]' : 'h-editor'} overflow-x-auto`}>
                <EditorSection
                  row="3"
                  hideAddition={hideAddition}
                  sectionNum={sectionNum}
                  setSectionNum={setSectionNum}
                  title={referenceColumnTwoData1.refName}
                  selectedResource={referenceColumnTwoData1.selectedResource}
                  languageId={referenceColumnTwoData1.languageId}
                  referenceResources={referenceColumnTwoData1}
                  setReferenceResources={setReferenceColumnTwoData1}
                  setLoadResource={setLoadResource3}
                  loadResource={loadResource3}
                  openResource={openResource3}
                  setOpenResource3={setOpenResource3}
                  setOpenResource4={setOpenResource4}
                  CustomNavigation={(referenceColumnTwoData1.selectedResource).lastIndexOf('obs', 0) === 0 ? ObsNavigation1 : CustomNavigation1}
                  setRemovingSection={setRemovingSection}
                  setAddingSection={setAddingSection}
                  font={font3}
                  setFont={setFont3}
                >
                  {
                    (loadResource3 === true)
                    && ((referenceColumnTwoData1.selectedResource === 'bible' && (
                      <>
                        {referenceColumnTwoData1?.languageId
                          && (
                            <ScribexContextProvider editable={false} reference>
                              <ReferenceBibleX
                                languageId={referenceColumnTwoData1.languageId}
                                refName={referenceColumnTwoData1.refName}
                                bookId={_bookId1}
                                chapter={_chapter1}
                                verse={_verse1}
                                font={font3}
                              />
                            </ScribexContextProvider>
                          )}
                      </>
                    )) || (referenceColumnTwoData1.selectedResource === 'obs' && (
                      <>
                        {referenceColumnTwoData1?.languageId
                          && (
                            <ReferenceObs
                              stories={stories1}
                            />
                          )}
                      </>
                    )) || (referenceColumnTwoData1.selectedResource === 'audio' && (
                      <ReferenceAudio
                        languageId={referenceColumnTwoData1.languageId}
                        refName={referenceColumnTwoData1.refName}
                        bookId={_bookId1}
                        chapter={_chapter1}
                        verse={_verse1}
                      />
                    )) || (
                    <TranslationHelps
                      selectedResource={referenceColumnTwoData1.selectedResource}
                      languageId={referenceColumnTwoData1.languageId}
                      owner={referenceColumnTwoData1.owner}
                      bookId={_bookId1}
                      chapter={_chapter1}
                      verse={_verse1}
                      story={_obsNavigation1}
                      offlineResource={referenceColumnTwoData1.offlineResource}
                    />
                      )
                    )
                  }
                </EditorSection>
                <EditorSection
                  row="4"
                  hideAddition={hideAddition}
                  sectionNum={sectionNum}
                  setSectionNum={setSectionNum}
                  title={referenceColumnTwoData2.refName}
                  selectedResource={referenceColumnTwoData2.selectedResource}
                  languageId={referenceColumnTwoData2.languageId}
                  referenceResources={referenceColumnTwoData2}
                  setReferenceResources={setReferenceColumnTwoData2}
                  setLoadResource={setLoadResource4}
                  loadResource={loadResource4}
                  openResource={openResource4}
                  setOpenResource3={setOpenResource3}
                  setOpenResource4={setOpenResource4}
                  CustomNavigation={(referenceColumnTwoData2.selectedResource).lastIndexOf('obs', 0) === 0 ? ObsNavigation2 : CustomNavigation2}
                  setRemovingSection={setRemovingSection}
                  setAddingSection={setAddingSection}
                  font={font4}
                  setFont={setFont4}
                >
                  {
                    (loadResource4 === true)
                    && ((referenceColumnTwoData2.selectedResource === 'bible' && (
                      <>
                        {referenceColumnTwoData2?.languageId
                          && (
                            <ScribexContextProvider editable={false} reference>
                              <ReferenceBibleX
                                languageId={referenceColumnTwoData2.languageId}
                                refName={referenceColumnTwoData2.refName}
                                bookId={_bookId2}
                                chapter={_chapter2}
                                verse={_verse2}
                                font={font4}
                              />
                            </ScribexContextProvider>
                          )}
                      </>
                    )) || (referenceColumnTwoData2.selectedResource === 'obs' && (
                      <>
                        {referenceColumnTwoData2?.languageId
                          && (
                            <ReferenceObs
                              stories={stories2}
                            />
                          )}
                      </>
                    )) || (referenceColumnTwoData2.selectedResource === 'audio' && (
                      <ReferenceAudio
                        languageId={referenceColumnTwoData2.languageId}
                        refName={referenceColumnTwoData2.refName}
                        bookId={_bookId1}
                        chapter={_chapter1}
                        verse={_verse1}
                      />
                    )) || (
                    <TranslationHelps
                      selectedResource={referenceColumnTwoData2.selectedResource}
                      languageId={referenceColumnTwoData2.languageId}
                      owner={referenceColumnTwoData2.owner}
                      bookId={_bookId2}
                      chapter={_chapter2}
                      verse={_verse2}
                      story={_obsNavigation2}
                      offlineResource={referenceColumnTwoData2.offlineResource}
                    />
                      )
                    )
                  }
                </EditorSection>
              </div>
            )}
          </>
        )}
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
    </>
  );
};
export default SectionPlaceholder2;

SectionPlaceholder2.propTypes = {
  editor: PropTypes.string,
};
