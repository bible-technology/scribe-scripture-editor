/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { HtmlPerfEditor } from '@xelah/type-perf-html';

const getTarget = ({ content }) => {
  const div = document.createElement('div');
  div.innerHTML = content;

  const { target } = div.firstChild?.dataset || {};

  return target;
};

export default function ReferenceRecursiveBlock({
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
  ...props
}) {
  const checkReturnKeyPress = (event) => {
    if (event.key === 'Enter') {
      const activeTextArea = document.activeElement;
      if (activeTextArea.children.length > 1) {
        const lineBreak = activeTextArea.children[1]?.outerHTML;
        const newLine = lineBreak.replace(/<br\s*\/?>/gi, '&nbsp');
        activeTextArea.children[1].outerHTML = newLine;
      }
    }
  };

  let component;

  const editable = !!content.match(/data-type="paragraph"/);

  if (editable) {
    component = (
      <div
        role="textbox"
        contentEditable={contentEditable}
        onKeyUp={checkReturnKeyPress}
        {...props}
        tabIndex={0}
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
