/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import {
  RectangleStackIcon,
  PencilIcon,
  ArrowDownOnSquareIcon,
  Bars2Icon,
  Bars4Icon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,

} from '@heroicons/react/24/outline';

import { ArrowClockwise, ArrowCounterClockwise } from 'phosphor-react';

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function Buttons(props) {
  const [sectionable, setSectionableState] = useState(false);
  const [blockable, setBlockableState] = useState(true);
  const [editable, setEditableState] = useState(true);
  const [preview, setPreviewState] = useState(false);
  const {
    bookCode,
    undo,
    redo,
    setSectionable,
    setBlockable,
    setEditable,
    setPreview,
    exportUsfm,
    setTriggerVerseInsert,
  } = props;

  const onSectionable = () => {
    setSectionableState(!sectionable);
    setSectionable(!sectionable);
  };
  const onBlockable = () => {
    setBlockableState(!blockable);
    setBlockable(!blockable);
  };
  const onEditable = () => {
    setEditableState(!editable);
    setEditable(!editable);
  };
  const onPreview = () => {
    setPreviewState(!preview);
    setPreview(!preview);
  };

  return (
    <>
      <RectangleStackIcon
        aria-label="Collection-Icon"
        className={classNames(
          sectionable ? 'fill-current' : '',
          'h-5 mr-2 w-5 text-white cursor-pointer',
        )}
        aria-hidden="true"
        onClick={onSectionable}
        title={sectionable ? 'Expand all Chapters' : 'Collapse Chapters'}
      />

      <PencilIcon
        aria-label="Pencil-Icon"
        className={classNames(
          editable ? 'fill-current' : '',
          'h-5 mr-2 w-5 text-white cursor-pointer',
        )}
        aria-hidden="true"
        onClick={onEditable}
        title={editable ? 'Disable Edit' : 'Enable Edit'}
      />
      {blockable ? (
        <Bars2Icon
          aria-label="Article-Icon"
          className="h-5 mr-2 w-5 text-white cursor-pointer"
          aria-hidden="true"
          onClick={onBlockable}
          title="Collapse blocks"
        />
      )
        : (
          <Bars4Icon
            aria-label="List-Icon"
            className="h-5 mr-2 w-5 text-white cursor-pointer"
            aria-hidden="true"
            onClick={onBlockable}
            title="Split into blocks"
          />
        )}

      <ArrowUturnLeftIcon
        aria-label="Undo-Icon"
        className="h-5 mr-2 w-5 text-white cursor-pointer"
        aria-hidden="true"
        onClick={() => undo()}
        title="Undo"
      />
      <ArrowUturnRightIcon
        aria-label="Redo-Icon"
        className="h-5 mr-2 w-5 text-white cursor-pointer"
        aria-hidden="true"
        onClick={() => redo()}
        title="Redo"
      />
      <ArrowDownOnSquareIcon
        aria-label="Save-Icon"
        className="h-5 mr-2 w-5 text-white cursor-pointer"
        aria-hidden="true"
        onClick={() => exportUsfm(bookCode)}
        title="Save"
      />
    </>
  );
}
