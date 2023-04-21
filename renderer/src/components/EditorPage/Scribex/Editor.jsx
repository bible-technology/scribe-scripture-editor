/* eslint-disable no-unused-vars */
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HtmlPerfEditor } from '@xelah/type-perf-html';

import LoadingScreen from '@/components/Loading/LoadingScreen';
import SaveIndicator from '@/components/Loading/SaveIndicator';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { insertVerseNumber, insertChapterNumber, insertFootnote } from '@/util/cursorUtils';
import RecursiveBlock from './RecursiveBlock';
// import ContextWrapper from './ContextWrapper';

export default function Editor(props) {
  const {
    chapterNumber,
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
    setChapterNumber,
    setVerseNumber,
    triggerVerseInsert,
    newVerChapNumber,
    insertVerseRChapter,
    reference,
  } = props;

  const [caretPosition, setCaretPosition] = useState();
  const {
    state: { chapter },
  } = useContext(ReferenceContext);
  const { t } = useTranslation();

  const {
    states: { openSideBar, scrollLock },
    actions: { setOpenSideBar, setSideBarTab },
  } = useContext(ProjectContext);

  const [chapters, setChapters] = useState();
  const sequenceId = sequenceIds.at(-1);
  const style = isSaving ? { cursor: 'progress' } : {};
  const handlers = {
    onBlockClick: ({ content: _content, element }) => {
      const _sequenceId = element.dataset.target;
      const { tagName } = element;
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

  function onReferenceSelected({ bookId, chapter, verse }) {
    chapter && setChapterNumber(chapter);
    verse && setVerseNumber(verse);
  }

  useEffect(() => {
    if (insertVerseRChapter === 'Verse') {
      insertVerseNumber(caretPosition, newVerChapNumber);
    }
    if (insertVerseRChapter === 'Chapter') {
      insertChapterNumber(caretPosition, newVerChapNumber);
    }
    if (insertVerseRChapter === 'Footnote') {
      insertFootnote(caretPosition, newVerChapNumber);
    }
  }, [triggerVerseInsert]);

  const scrollReference = (chapterNumber) => {
    const refEditors = document.getElementsByClassName('ref-editor');
    refEditors.length > 0 && Array.prototype.filter.call(refEditors, (refEditor) => {
      const editorInView = refEditor.querySelector(`#ch-${chapterNumber}`);
      if (editorInView) {
        editorInView.scrollIntoView();
        editorInView.classList.add('scroll-mt-10');
      }
    });
  };

  const onIntersection = (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        console.log({ entry })
        setChapterNumber(entry.target.dataset.attsNumber);
        scrollLock === false ? scrollReference(entry.target.dataset.attsNumber) : {};
      }
    }
  };

  const options = {
    root: document.querySelector('editor'),
    threshold: 0,
    rootMargin: '0% 0% -60% 0%',
  };
  const observer = new IntersectionObserver(onIntersection, options);

  const watchNodes = document.querySelectorAll('.editor .chapter');
  const watchArr = Array.from(watchNodes);
  const reverseArray = watchArr.length > 0 ? watchArr.slice().reverse() : [];
  reverseArray.forEach((chapter) => { observer.observe(chapter); });

  const _props = {
    htmlPerf,
    onHtmlPerf: saveHtmlPerf,
    chapterIndex: chapter,
    sequenceIds,
    addSequenceId,
    components: {
      block: (__props) => RecursiveBlock({
        htmlPerf, onHtmlPerf: saveHtmlPerf, sequenceIds, addSequenceId, onReferenceSelected, setCaretPosition, ...__props,
      }),
    },
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
    <div className="editor" id="editor" style={style}>
      {!bookAvailable && <EmptyScreen />}
      {bookAvailable && (!sequenceId || bookChange) && <LoadingScreen />}
      {bookAvailable && sequenceId && !bookChange && (
        <HtmlPerfEditor {..._props} />
      )}
    </div>
  );
}
