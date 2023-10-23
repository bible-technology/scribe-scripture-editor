/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { HtmlPerfEditor } from '@xelah/type-perf-html';
import { getCurrentCursorPosition } from '@/util/cursorUtils';
import { getCurrentVerse, getCurrentChapter } from '@/components/EditorPage/TextEditor/utils/getReferences';

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
  ...props
}) {
  const [currentVerse, setCurrentVerse] = useState(null);

  const updateCursorPosition = () => {
    const cursorPosition = getCurrentCursorPosition('editor');
    setCaretPosition(cursorPosition);
  };

  const checkReturnKeyPress = (event) => {
    const activeTextArea = document.activeElement;
    if (event.key === 'Enter') {
      if (activeTextArea.children.length > 1) {
        const lineBreak = activeTextArea.children[1]?.outerHTML;
        activeTextArea.children[1].outerHTML = lineBreak.replace(/<br\s*\/?>/gi, '&nbsp');
      }
    }
    // BACKSPACE DISABLE
    if (event.keyCode === 8) {
      const range = document.getSelection().getRangeAt(0);
      const selectedNode = range.startContainer;
      const prevNode = selectedNode.previousSibling;
      if (prevNode && prevNode.dataset.attsNumber !== currentVerse) {
        event.preventDefault();
      }
      prevNode ? setCurrentVerse(prevNode.dataset.attsNumber) : {};
    }
    updateCursorPosition();
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
      const verse = getCurrentVerse(selectedNode);
      const chapter = getCurrentChapter(selectedNode);
      onReferenceSelected({ bookId, chapter, verse });
    }
    updateCursorPosition();
    handleSelection();
  };

  let component;

  const editable = !!content.match(/data-type="paragraph"/);

  if (editable) {
    component = (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className="editor-paragraph"
        contentEditable={contentEditable}
        onKeyDown={checkReturnKeyPress}
        onMouseUp={checkCurrentVerse}
        onMouseDown={updateCursorPosition}
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
