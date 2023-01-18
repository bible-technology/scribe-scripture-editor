/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HtmlPerfEditor } from '@xelah/type-perf-html';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import SaveIndicator from '@/components/Loading/SaveIndicator';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EmptyScreen from '@/components/Loading/EmptySrceen';

export default function Editor(props) {
  const {
    sequenceIds,
    isSaving,
    isLoading,
    htmlPerf,
    sectionable,
    blockable,
    editable,
    preview,
    verbose,
    bookName,
    bookChange,
    setBookChange,
    addSequenceId,
    saveHtmlPerf,
    setGraftSequenceId,
    bookAvailable,
  } = props;

  const {
    state: { chapter },
  } = useContext(ReferenceContext);

  const { t } = useTranslation();

  const {
    states: { openSideBar },
    actions: { setOpenSideBar, setSideBarTab },
  } = useContext(ProjectContext);
  const sequenceId = sequenceIds.at(-1);
  const style = isSaving ? { cursor: 'progress' } : {};
  const bookChanged = sequenceId === htmlPerf?.mainSequenceId;
  const handlers = {
    onBlockClick: ({ content: _content, element }) => {
      const _sequenceId = element.dataset.target;
      const { tagName } = element;
      const isInline = tagName === 'SPAN';
      if (_sequenceId) {
        setGraftSequenceId(_sequenceId);
        setOpenSideBar(!openSideBar);
        setSideBarTab('footnotes');
      } else {
        setSideBarTab('');
        setGraftSequenceId(null);
      }
    },
  };
  useEffect(() => {
    setBookChange(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [htmlPerf]);

  const {
    actions: { setEditorSave },
  } = useContext(ProjectContext);

  const autoSaveIndication = () => {
    setEditorSave(<SaveIndicator />);
    setTimeout(() => {
      setEditorSave(t('label-saved'));
    }, 1000);
  };
  useEffect(() => {
    if (isSaving) {
      autoSaveIndication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving]);

  const _props = {
    htmlPerf,
    onHtmlPerf: saveHtmlPerf,
    chapterIndex: chapter,
    sequenceIds,
    addSequenceId,
    options: {
      sectionable,
      blockable,
      editable,
      preview,
    },
    decorators: {},
    verbose,
    handlers,
    autoSaveIndication,
  };
  return (
    <div className="editor" style={style}>
      {!bookAvailable && <EmptyScreen />}
      {bookAvailable && (!sequenceId || bookChange) && <LoadingScreen />}
      {bookAvailable && sequenceId && !bookChange && (
        <HtmlPerfEditor {..._props} />
      )}
    </div>
  );
}
