import React, {
  useContext, useEffect, useLayoutEffect, useRef, useState
} from 'react';
import { HtmlPerfEditor } from '@xelah/type-perf-html';

import LoadingScreen from '@/components/Loading/LoadingScreen';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import { ScribexContext } from '@/components/context/ScribexContext';
import EmptyScreen from '@/components/Loading/EmptySrceen';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { functionMapping } from './utils/insertFunctionMap';

import RecursiveBlock from './RecursiveBlock';
// eslint-disable-next-line import/no-unresolved, import/extensions
import { useAutoSaveIndication } from '@/hooks2/useAutoSaveIndication';
import { onIntersection, scrollReference } from './utils/IntersectionObserver';
import xre from 'xregexp';

export default function Editor(props) {
  const {
    sequenceIds,
    isSaving,
    htmlPerf,
    sectionable,
    blockable,
    editable,
    preview,
    verbose,
    bookChange,
    setBookChange,
    addSequenceId,
    saveHtmlPerf,
    setGraftSequenceId,
    bookAvailable,
    setChapterNumber,
    setVerseNumber,
    triggerVerseInsert,
  } = props;

  const {
    state: {
      chapter, selectedFont, editorFontSize, projectScriptureDir,
    },
  } = useContext(ReferenceContext);

  const {
    states: { openSideBar, scrollLock },
    actions: { setOpenSideBar, setSideBarTab },
  } = useContext(ProjectContext);

  const {
    state: {
      caretPosition, insertType, selectedText, numberToInsert, textToInsert,
    },
    actions: {
      setCaretPosition, setSelectedText, setNumberToInsert, setTextToInsert, setInsertType,
    },
  } = useContext(ScribexContext);

  const sequenceId = sequenceIds.at(-1);
  const style = isSaving ? { cursor: 'progress' } : {};

  const handlers = {
    onBlockClick: ({ element }) => {
      const _sequenceId = element.dataset.target;
      const { tagName } = element;
      if (_sequenceId) {
        if (tagName === 'SPAN' && element.dataset.subtype === 'footnote') {
          setGraftSequenceId(_sequenceId);
          setOpenSideBar(!openSideBar);
          setSideBarTab('footnotes');
        }
        if (tagName === 'SPAN' && element.dataset.subtype === 'xref') {
          setGraftSequenceId(_sequenceId);
          setOpenSideBar(!openSideBar);
          setSideBarTab('xref');
        }
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

  // useEffect(() => {
  //   let incElems = document.getElementsByClassName('incorrect');
  //   console.log("incElems ==", incElems);
  //   console.log("decorators ==", decorators);
  //   if (incElems.length > 0) {
  //     for (let elem of incElems) {
  //       if (elem.getAttribute('listener') !== 'true') {
  //         elem.addEventListener('click', function (e) {
  //           e.target.setAttribute('listener', 'true');
  //         });
  //       }
  //     };
  //   }
  // }, [htmlPerf]);

  useEffect(() => { // temp fix to trigger rerender to cause onblcok trigger to save to file. Need to find a better way.
    if (insertType !== '') {
      insertType === 'insertVerseNumber' || insertType === 'insertChapterNumber'
        ? functionMapping[insertType].function({ caretPosition, numberToInsert })
        : functionMapping[insertType].function({ caretPosition, textToInsert, selectedText });
      setNumberToInsert('');
      setTextToInsert('');
      setInsertType('');
      setSelectedText(null);
      setCaretPosition(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerVerseInsert]);

  const isScrolling = useRef(false);
  useLayoutEffect(() => {
    const handleScroll = () => {
      isScrolling.current = true;
    };
    const handleScrollEnd = () => {
      isScrolling.current = false;
    };
    const editorDiv = document.getElementById('fulleditor');
    // Adding scroll and click event listeners
    editorDiv.addEventListener('scroll', handleScroll);
    editorDiv.addEventListener('click', handleScrollEnd);
    return () => {
      editorDiv.removeEventListener('scroll', handleScroll);
      editorDiv.removeEventListener('click', handleScrollEnd);
    };
  }, []);

  useAutoSaveIndication(isSaving);

  function onReferenceSelected({ chapter, verse }) {
    chapter && setChapterNumber(chapter);
    verse && setVerseNumber(verse);
    !scrollLock && scrollReference(chapter, verse);
  }

  function wrapWord(word) {
    return "<span class=\"incorrect\">" + word + "</span>";
  }

  function alreadyWrapped(str) {
    const re = new RegExp('<span class="incorrect">(.*?)</span>', 'gi');
    const arr = re.exec(str);
    if (arr && arr[0]) return true;
    return false
  }

  function getAWord() {
    if (!String.prototype.splice) {
      String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
      };
    }

    let sequenceIds = htmlPerf ? Object.keys(htmlPerf?.sequencesHtml) : [];

    // console.log('mur ==', htmlPerf?.sequencesHtml[sequenceIds[0]].substring(murIndex, murIndex + 'mur'.length));

    // let innerHtmlRegex = /<\/span>(.*?)<span/gi;
    // const re = new RegExp('</span>(.*?)<span', 'gi');
    // const re = xre('</span>(.*?)<span');
    const tabTemp = ["hello", "oui", "non", "nbsp", "amp"];
    if (htmlPerf != undefined && dict != undefined) {
      console.log("dict[1000]==", dict[1000]);
      const re = xre(`(?<!<[^>]*)(\\b(?!${dict.slice(0, 2000).join('\\b|')}\\b)(?!\\d+)\\w+\\b)`, 'gui');
      const emptySpans = xre(/<span class="incorrect">\s*<\/span>/gui);
      const words = xre.match(htmlPerf.sequencesHtml[sequenceIds[0]], re, "all");

      // console.log("inSpans", inSpans);
      // let cleanedRet = xre.replace(htmlPerf.sequencesHtml[sequenceIds[0]], emptySpans, "");
      let ret = xre.replace(htmlPerf.sequencesHtml[sequenceIds[0]], re, "<span class=\"incorrect\">$1</span>");
      // console.log('ret ==', ret);
      // let tempIndexof = htmlPerf.sequencesHtml[sequenceIds[0]].search('incorrect');
      htmlPerf.sequencesHtml[sequenceIds[0]] = ret;
      // let fullMatch = htmlPerf.sequencesHtml[sequenceIds[0]].substring(tempIndexof - 100, tempIndexof + 100);
      // console.log('fullMatch ==', fullMatch);
      // htmlPerf.sequencesHtml[sequenceIds[0]].replaceAll(re,)
      // let match, result = [];
      // while (match = xre.exec(htmlPerf.sequencesHtml[sequenceIds[0]], re), 0, 'sticky') {
      //   console.log('curr match ==', match);
      //   break;
      //   // result.push(match[1]);
      //   // pos = match.index + match[0].length;
      // }
      // console.log(result);
    }


    // const decorators = {
    //   embededHtml: [/<\/span>\\b(.*?)\\b<span/gi, "<span class=\"incorrect\">$1</span>"],
    // }
    // setDecorators({
    //   embededHtml: [/<\/span>.*?(.*?).*?<span/gi, "<span class=\"incorrect\">$1</span>"],
    // });
    // const matches = string.matchAll(regexp);
    // const matches = re.exec(htmlPerf?.sequencesHtml[sequenceIds[0]]);
    // let newWord, fullMatch, match;
    // let matches = [];
    // let tempIndexof = -1;
    // let indexInHtmlPerf;
    // let oneMatch;
    // let fullCopyHtml = htmlPerf?.sequencesHtml[sequenceIds[0]];
    // while (match = re.exec(htmlPerf?.sequencesHtml[sequenceIds[0]])) {
    //   newWord = match[0];
    //   indexInHtmlPerf = match.index;
    //   tempIndexof = newWord.search('\\bmur\\b');
    //   if (tempIndexof != -1) {
    //     console.log("match", match.index, "==", match);
    //     newWord = match[0].substring(tempIndexof, tempIndexof + 'mur'.length);
    //     fullMatch = match[0].substring(tempIndexof - 25, tempIndexof + 'mur'.length + 5);
    //     if (!alreadyWrapped(fullMatch) && htmlPerf != undefined) {
    //       console.log('indexInHtmlPerf, indexInHtmlPerf + \'mur\'.length ==', indexInHtmlPerf, indexInHtmlPerf + 'mur'.length);
    //       console.log('slice BEFORE ==', fullCopyHtml.slice(indexInHtmlPerf - 200, indexInHtmlPerf + 'mur'.length + 200));
    //       console.log('real slice ==', fullCopyHtml.slice(indexInHtmlPerf + tempIndexof, indexInHtmlPerf + tempIndexof + 'mur'.length));
    //       fullCopyHtml = fullCopyHtml.slice(0, indexInHtmlPerf + tempIndexof) + wrapWord(newWord) + fullCopyHtml.slice(indexInHtmlPerf + tempIndexof + 'mur'.length);
    //       console.log('slice AFTER ==', fullCopyHtml.slice(indexInHtmlPerf - 100, indexInHtmlPerf + 'mur'.length + 100));
    //       matches.push(newWord);
    //       htmlPerf.sequencesHtml[sequenceIds[0]] = fullCopyHtml;
    //       oneMatch = indexInHtmlPerf;
    //     }
    //   }
    // }

    // let murIndex = htmlPerf?.sequencesHtml[sequenceIds[0]].indexOf('mur');
    // console.log(dict['ABANDONNER']);
    // console.log('indexof(mur) ==', htmlPerf?.sequencesHtml[sequenceIds[0]].substring(murIndex, murIndex + 3));
    // array.map(m => m[1]);
    // const array = [...matches];

    // console.log("matches ==", array.map(m => m[1]));
    // console.log("matches ==", matches);

    // console.log(sequenceIds);
    // console.log('slice htmlPerf ==', htmlPerf?.sequencesHtml[sequenceIds[0]].slice(oneMatch - 100, oneMatch + 'mur'.length + 100));

  }

  const observer = new IntersectionObserver((entries) => onIntersection({
    scroll: isScrolling.current, setChapterNumber, scrollLock, entries, setVerseNumber,
  }), {
    root: document.querySelector('editor'),
    threshold: 0,
    rootMargin: '0% 0% -60% 0%',
  });

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
        htmlPerf, onHtmlPerf: saveHtmlPerf, sequenceIds, addSequenceId, onReferenceSelected, setCaretPosition, setSelectedText, scrollLock, ...__props,
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
  };

  return (
    <div
      id="fulleditor"
      style={{
        fontFamily: selectedFont || 'sans-serif',
        fontSize: `${editorFontSize}rem`,
        lineHeight: (editorFontSize > 1.3) ? 1.5 : '',
        direction: `${projectScriptureDir === 'RTL' ? 'rtl' : 'auto'}`,
      }}
      className="border-l-2 border-r-2 border-secondary pb-16 overflow-auto h-full scrollbars-width leading-8"
      spellCheck="false"
    >
      <div className="editor" id="editor" style={style}>
        {!bookAvailable && <EmptyScreen />}
        {bookAvailable && (!sequenceId || bookChange) && <LoadingScreen />}
        {bookAvailable && sequenceId && !bookChange && (
          <HtmlPerfEditor {..._props} />
        )}
      </div>
    </div>
  );
}
