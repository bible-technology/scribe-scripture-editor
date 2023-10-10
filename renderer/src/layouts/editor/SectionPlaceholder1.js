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
import { core } from '@/components/EditorPage/ObsEditor/core';
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

const SectionPlaceholder1 = ({ editor }) => {
  // const supportedBooks = null;
  const sectionPlaceholderNum = '1';
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const { addNotification } = useAddNotification();

  const [referenceColumnOneData1, setReferenceColumnOneData1] = useState({
    languageId: '',
    selectedResource: '',
    refName: '',
    header: '',
    owner: '',
    offlineResource: { offline: false },
  });
  const [referenceColumnOneData2, setReferenceColumnOneData2] = useState({
    languageId: '',
    selectedResource: '',
    refName: '',
    header: '',
    owner: '',
    offlineResource: { offline: false },
  });
  const [loadResource1, setLoadResource1] = useState(false);
  const [loadResource2, setLoadResource2] = useState(false);
  const {
    state: {
      layout,
      openResource1,
      openResource2,
      bookId,
      chapter,
      verse,
      obsNavigation,
      resetResourceOnDeleteOffline,
      font1,
      font2,
    },
    actions: {
      setRow,
      setLayout,
      setOpenResource1,
      setOpenResource2,
      setFont1,
      setFont2,
      // applyBooksFilter,
      setResetResourceOnDeleteOffline,
    },
  } = useContext(ReferenceContext);

  const {
    states: {
      scrollLock,
    },
  } = useContext(ProjectContext);

  const [sectionNum, setSectionNum] = useState(0);
  const [hideAddition, setHideAddition] = useState(true);
  const [removingSection, setRemovingSection] = useState();
  const [addingSection, setAddingSection] = useState();
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
      if (sectionNum === 0) {
        setSectionNum(1);
      }
    }
    if (sectionNum === 2) {
      setHideAddition(false);
    } else {
      setHideAddition(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, sectionNum]);

  useEffect(() => {
    if (resetResourceOnDeleteOffline?.referenceColumnOneData1Reset || removingSection === '1') {
      logger.debug('SectionPlaceholder1.js', 'delete resource for pane C0R0');
      setReferenceColumnOneData1((prev) => ({
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
        referenceColumnOneData1Reset: false,
      }
      ));
      setRemovingSection('1');
      setLoadResource1(false);
    }
    if (resetResourceOnDeleteOffline?.referenceColumnOneData2Reset || removingSection === '2') {
      logger.debug('SectionPlaceholder1.js', 'delete resource for pane C0R1');
      setReferenceColumnOneData2((prev) => ({
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
        referenceColumnOneData2Reset: false,
      }
      ));
      setRemovingSection('2');
      setLoadResource2(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetResourceOnDeleteOffline?.referenceColumnOneData1Reset, resetResourceOnDeleteOffline?.referenceColumnOneData2Reset,
    removingSection]);

  const getReferenceHistoryOnLoad = async () => new Promise((resolve) => {
    fetchSettingsResourceHistory(
      setRemovingSection,
      setReferenceColumnOneData1,
      setReferenceColumnOneData2,
      referenceColumnOneData1,
      referenceColumnOneData2,
      setLayout,
      setLoadResource1,
      setLoadResource2,
      setOpenResource1,
      setOpenResource2,
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
      logger.debug('SectionPlaceholder1.js', 'Getting Resources Reference on Load');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call useEffect on Save reference (call on new resource / new pane)
  useEffect(() => {
    logger.debug('SectionPlaceholder1.js', 'in Save reference C0');
    (async () => {
      saveSettingsResourceHistory(
        sectionNum,
        openResource1,
        openResource2,
        layout,
        referenceColumnOneData1,
        referenceColumnOneData2,
        addingSection,
        removingSection,
        setAddingSection,
        setRemovingSection,
        sectionPlaceholderNum,
        setReferenceColumnOneData1,
        setReferenceColumnOneData2,
        setOpenResource1,
        setOpenResource2,
      );
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openResource1, openResource2, referenceColumnOneData1?.languageId, referenceColumnOneData1.refName,
    referenceColumnOneData1?.selectedResource, referenceColumnOneData2?.languageId, referenceColumnOneData2?.refName,
    referenceColumnOneData2?.selectedResource, sectionNum, layout,
    referenceColumnOneData2?.owner, removingSection, addingSection, referenceColumnOneData2?.offlineResource,
    referenceColumnOneData1?.offlineResource, resetResourceOnDeleteOffline?.referenceColumnOneData1Reset,
    resetResourceOnDeleteOffline?.referenceColumnOneData2Reset, referenceColumnOneData2, referenceColumnOneData1]);

  // referenceColumnOneData2 referenceColumnOneData1
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
    // Set OBS stories
    const readObs = async () => {
      // if (isElectron()) {
      localforage.getItem('userProfile').then(async (user) => {
        if (_obsNavigation1 && referenceColumnOneData1.refName && referenceColumnOneData1.selectedResource === 'obs') {
          const fs = window.require('fs');
          setStories1(core(fs, _obsNavigation1, referenceColumnOneData1.refName, user.username));
        }
        if (_obsNavigation2 && referenceColumnOneData2.refName && referenceColumnOneData2.selectedResource === 'obs') {
          const fs = window.require('fs');
          setStories2(core(fs, _obsNavigation2, referenceColumnOneData1.refName, user.username));
        }
      });
      // }
    };
    readObs();
  }, [_obsNavigation1, _obsNavigation2, referenceColumnOneData1, referenceColumnOneData2]);

  return (
    <>
      {(layout > 0 && layout <= 2) && (
        <>
          {(openResource1 === false || openResource2 === false) && (
            <div className={`bg-white rounded-md grid gap-2 ${editor === 'audioTranslation' ? 'md:max-h-[64vh] lg:max-h-[70vh]' : 'h-editor'} overflow-x-auto`}>
              {openResource1 === false && (
                <EditorSection
                  row="1"
                  CustomNavigation={(referenceColumnOneData1.selectedResource).lastIndexOf('obs', 0) === 0 ? ObsNavigation1 : CustomNavigation1}
                  hideAddition={hideAddition}
                  sectionNum={sectionNum}
                  setSectionNum={setSectionNum}
                  title={referenceColumnOneData1.refName}
                  selectedResource={referenceColumnOneData1.selectedResource}
                  languageId={referenceColumnOneData1.languageId}
                  referenceResources={referenceColumnOneData1}
                  setReferenceResources={setReferenceColumnOneData1}
                  setLoadResource={setLoadResource1}
                  loadResource={loadResource1}
                  openResource={openResource1}
                  setOpenResource1={setOpenResource1}
                  setOpenResource2={setOpenResource2}
                  setRemovingSection={setRemovingSection}
                  setAddingSection={setAddingSection}
                  font={font1}
                  setFont={setFont1}
                >
                  {
                    (loadResource1 === true)
                    && ((referenceColumnOneData1.selectedResource === 'bible' && (
                      <>
                        {referenceColumnOneData1?.languageId
                          && (
                            <ScribexContextProvider editable={false} reference>
                              <ReferenceBibleX
                                languageId={referenceColumnOneData1.languageId}
                                refName={referenceColumnOneData1.refName}
                                bookId={_bookId1}
                                chapter={_chapter1}
                                verse={_verse1}
                                font={font1}
                              />
                            </ScribexContextProvider>
                          )}
                      </>
                    )) || (referenceColumnOneData1.selectedResource === 'obs' && (
                      <>
                        {referenceColumnOneData1?.languageId
                          && (
                            <ReferenceObs
                              stories={stories1}
                            />
                          )}
                      </>
                    )) || (referenceColumnOneData1.selectedResource === 'audio' && (
                      <ReferenceAudio
                        languageId={referenceColumnOneData1.languageId}
                        refName={referenceColumnOneData1.refName}
                        bookId={_bookId1}
                        chapter={_chapter1}
                        verse={_verse1}
                      />
                    )) || (
                    <TranslationHelps
                      selectedResource={referenceColumnOneData1.selectedResource}
                      languageId={referenceColumnOneData1.languageId}
                      owner={referenceColumnOneData1.owner}
                      bookId={_bookId1}
                      chapter={_chapter1}
                      verse={_verse1}
                      story={_obsNavigation1}
                      offlineResource={referenceColumnOneData1.offlineResource}
                    />
                      )
                    )
                  }
                </EditorSection>
              )}
              {openResource2 === false && (
                <EditorSection
                  row="2"
                  hideAddition={hideAddition}
                  sectionNum={sectionNum}
                  setSectionNum={setSectionNum}
                  title={referenceColumnOneData2.refName}
                  selectedResource={referenceColumnOneData2.selectedResource}
                  languageId={referenceColumnOneData2.languageId}
                  referenceResources={referenceColumnOneData2}
                  setReferenceResources={setReferenceColumnOneData2}
                  setLoadResource={setLoadResource2}
                  loadResource={loadResource2}
                  openResource={openResource2}
                  setOpenResource1={setOpenResource1}
                  setOpenResource2={setOpenResource2}
                  CustomNavigation={(referenceColumnOneData2.selectedResource).lastIndexOf('obs', 0) === 0 ? ObsNavigation2 : CustomNavigation2}
                  setRemovingSection={setRemovingSection}
                  setAddingSection={setAddingSection}
                  font={font2}
                  setFont={setFont2}
                >
                  {
                    (loadResource2 === true)
                    && ((referenceColumnOneData2.selectedResource === 'bible' && (
                      <>
                        {referenceColumnOneData2?.languageId
                          && (
                            <ScribexContextProvider editable={false} reference>
                              <ReferenceBibleX
                                languageId={referenceColumnOneData2.languageId}
                                refName={referenceColumnOneData2.refName}
                                bookId={_bookId2}
                                chapter={_chapter2}
                                verse={_verse2}
                                font={font2}
                              />
                            </ScribexContextProvider>
                          )}
                      </>
                    )) || (referenceColumnOneData2.selectedResource === 'obs' && (
                      <>
                        {referenceColumnOneData2?.languageId
                          && (
                            <ReferenceObs
                              stories={stories2}
                            />
                          )}
                      </>
                    )) || (referenceColumnOneData2.selectedResource === 'audio' && (
                      <ReferenceAudio
                        languageId={referenceColumnOneData2.languageId}
                        refName={referenceColumnOneData2.refName}
                        bookId={_bookId1}
                        chapter={_chapter1}
                        verse={_verse1}
                      />
                    )) || (
                    <TranslationHelps
                      selectedResource={referenceColumnOneData2.selectedResource}
                      languageId={referenceColumnOneData2.languageId}
                      owner={referenceColumnOneData2.owner}
                      bookId={_bookId2}
                      chapter={_chapter2}
                      verse={_verse2}
                      story={_obsNavigation2}
                      offlineResource={referenceColumnOneData2.offlineResource}
                    />
                      )
                    )
                  }
                </EditorSection>
              )}
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
export default SectionPlaceholder1;

SectionPlaceholder1.propTypes = {
  editor: PropTypes.string,
};
