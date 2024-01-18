/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { HtmlPerfEditor } from '@xelah/type-perf-html';
import { getCurrentCursorPosition, pasteTextAtCursorPosition } from '@/util/cursorUtils';
import {
  getCurrentVerse, getCurrentChapter, hightlightRefVerse,
} from '@/components/EditorPage/TextEditor/utils/getReferences';
import { on } from 'ws';

const getTarget = ({ content }) => {
  const div = document.createElement('div');
  div.innerHTML = content;

  const { target } = div.firstChild?.dataset || {};

  return target;
};

export default function RecursiveBlock({
  htmlPerf,
  onHtmlPerf,
  sequenceIds,
  addSequenceId,
  options,
  content,
  style,
  contentEditable,
  index,
  verbose,
  setFootNote,
  bookId,
  onReferenceSelected,
  setCaretPosition,
  setSelectedText,
  scrollLock,
  ...props
}) {
  const [currentVerse, setCurrentVerse] = useState(null);

  const updateCursorPosition = () => {
    const cursorPosition = getCurrentCursorPosition('editor');
    setCaretPosition(cursorPosition);
  };

  function handleSelection() {
    let selectedText = '';
    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== 'Control') {
      selectedText = document.selection.createRange().text;
    }
    if (selectedText) {
      setSelectedText(selectedText);
    }
  }
  const checkCurrentVerse = () => {
    if (document.getSelection().rangeCount >= 1 && onReferenceSelected) {
      const range = document.getSelection().getRangeAt(0);
      const selectedNode = range.startContainer;
      const { verse } = getCurrentVerse(selectedNode);
      const chapter = getCurrentChapter(selectedNode);
      onReferenceSelected({ bookId, chapter, verse });
      !scrollLock && hightlightRefVerse(chapter, verse);
    }
    updateCursorPosition();
    handleSelection();
  };

  const keyStrokeHandler = (event) => {
    const activeTextArea = document.activeElement;
    // Replace line break with space
    if (event.key === 'Enter') {
      if (activeTextArea.children.length > 1) {
        const lineBreak = activeTextArea.children[1]?.outerHTML;
        activeTextArea.children[1].outerHTML = lineBreak.replace(/<br\s*\/?>/gi, '&nbsp');
      }
    }
    // Disable backspace if the previous node is not the same verse
    if (event.keyCode === 8) {
      const range = document.getSelection().getRangeAt(0);
      const selectedNode = range.startContainer;
      const prevNode = selectedNode.previousSibling;
      if (prevNode && prevNode.dataset.attsNumber !== currentVerse) {
        event.preventDefault();
      }
      prevNode ? setCurrentVerse(prevNode.dataset.attsNumber) : {};
    }
    if ([37, 38, 39, 40].includes(event.keyCode)) {
      checkCurrentVerse();
      updateCursorPosition();
    }
  };

  function onPasteHandler(event) {
    const cursorPosition = getCurrentCursorPosition('editor');
    const paste = (event.clipboardData || window.clipboardData).getData('text');
    pasteTextAtCursorPosition({ cursorPosition, textToInsert: paste });
  }

  let component;

  const editable = !!content.match(/data-type="paragraph"/);

  if (editable) {
    component = (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className="editor-paragraph"
        contentEditable={contentEditable}
        onKeyDown={keyStrokeHandler}
        onMouseUp={checkCurrentVerse}
        onMouseDown={updateCursorPosition}
        onPaste={(event) => { event.preventDefault(); onPasteHandler(event); }}
        {...props}
      />
    );
  }
  if (!editable) {
    const sequenceId = getTarget({ content });

    if (sequenceId && !options.preview) {
      const _props = {
        sequenceIds: [...sequenceIds, sequenceId],
        addSequenceId,
        htmlPerf,
        onHtmlPerf,
        onInput: props?.onInput,
        options,
      };
      component = <HtmlPerfEditor {..._props} />;
    }
    component ||= <div {...props} contentEditable={false} />;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{component}</>;
}
