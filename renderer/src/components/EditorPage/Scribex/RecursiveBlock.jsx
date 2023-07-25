/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { HtmlPerfEditor } from '@xelah/type-perf-html'
import { getCurrentVerse, getCurrentChapter } from './getReferences'
import { getCurrentCursorPosition } from '@/util/cursorUtils';

const getTarget = ({ content }) => {
  const div = document.createElement("div");
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
  const [currentVerse, setCurrentVerse] = useState(null)
  useEffect(() => {
    if (verbose) console.log("Block: Mount/First Render", index);
    return () => {

      if (verbose) console.log("Block: UnMount/Destroyed", index);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkReturnKeyPress = (event) => {
    let activeTextArea = document.activeElement;
    if (event.key === "Enter") {
      if (activeTextArea.children.length > 1) {
        const lineBreak = activeTextArea.children[1]?.outerHTML;
        activeTextArea.children[1].outerHTML = lineBreak.replace(/<br\s*\/?>/gi, "&nbsp");
      }
    }
    //BACKSPACE DISABLE
    if (event.keyCode == 8) {
      const range = document.getSelection().getRangeAt(0)
      const selectedNode = range.startContainer
      const prevNode = selectedNode.previousSibling;
      if (prevNode && prevNode.dataset.attsNumber !== currentVerse) {
        event.preventDefault();
      }
      prevNode ? setCurrentVerse(prevNode.dataset.attsNumber) : {};
    }
    updateCursorPosition();
  };

  function handleSelection() {
    let selectedText = "";
    if (window.getSelection) {
      selectedText = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
      selectedText = document.selection.createRange().text;
    }
    if (selectedText) {
      setSelectedText(selectedText);
    }
  }

  const checkCurrentVerse = () => {
    if (document.getSelection().rangeCount >= 1 && onReferenceSelected) {
      const range = document.getSelection().getRangeAt(0)
      // console.log({ range })
      const selectedNode = range.startContainer
      // console.log({ selectedNode })
      const verse = getCurrentVerse(selectedNode)
      const chapter = getCurrentChapter(selectedNode)
      // if (onReferenceSelected) {
      onReferenceSelected({ bookId, chapter, verse })
      // }
    }
    updateCursorPosition()
    handleSelection();
  }

  const updateCursorPosition = () => {
    let cursorPosition = getCurrentCursorPosition('editor');
    setCaretPosition(cursorPosition)
  }
  let component;

  let editable = !!content.match(/data-type="paragraph"/);

  if (editable) {
    component = (
      <div
        className='editor-paragraph'
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
      };
      component = <HtmlPerfEditor {..._props} />;
    }
    component ||= <div {...props} contentEditable={false} />;
  }

  return <>{component}</>;
}
