/* eslint-disable no-unused-vars */
import React, { useState } from 'react';

import RectangleStackIcon from '@/icons/Xelah/RectangleStack.svg';
import ArrowDownOnSquareIcon from '@/icons/Xelah/ArrowDownOnSquare.svg';
import Bars2Icon from '@/icons/Xelah/Bars2.svg';
import Bars4Icon from '@/icons/Xelah/Bars4.svg';
import ArrowUturnLeftIcon from '@/icons/Xelah/ArrowUturnLeft.svg';
import ArrowUturnRightIcon from '@/icons/Xelah/ArrowUturnRight.svg';
import PencilIcon from '@/icons/Common/Pencil.svg';
import Copy from '@/icons/Xelah/Copy.svg';
import Paste from '@/icons/Xelah/Paste.svg';

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export default function Buttons(props) {
  const [sectionable, setSectionableState] = useState(false);
  const [blockable, setBlockableState] = useState(true);
  const [editable, setEditableState] = useState(true);
  const [preview, setPreviewState] = useState(false);
  const {
    bookCode,
    canUndo,
    canRedo,
    undo,
    redo,
    setSectionable,
    setBlockable,
    setEditable,
    setPreview,
    exportUsfm,
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
        onClick={onSectionable}
        title={sectionable ? 'Expand all Chapters' : 'Collapse Chapters'}
      />

      <PencilIcon
        aria-label="Pencil-Icon"
        className={classNames(
          editable ? 'fill-current' : '',
          'h-5 mr-2 w-5 text-white cursor-pointer',
        )}
        onClick={onEditable}
        title={editable ? 'Disable Edit' : 'Enable Edit'}
      />
      {blockable ? (
        <Bars2Icon
          aria-label="Article-Icon"
          className="h-5 mr-2 w-5 text-white cursor-pointer"
          onClick={onBlockable}
          title="Collapse blocks"
        />
      )
        : (
          <Bars4Icon
            aria-label="List-Icon"
            className="h-5 mr-2 w-5 text-white cursor-pointer"
            onClick={onBlockable}
            title="Split into blocks"
          />
        )}

      <button
        type="button"
        onClick={() => undo()}
        disabled={!canUndo}
        title="Redo"
      >
        <ArrowUturnLeftIcon
          aria-label="Redo-Icon"
          className="h-5 mr-2 w-5 text-white cursor-pointer"
        />
      </button>
      <button
        type="button"
        onClick={() => redo()}
        disabled={!canRedo}
        title="Redo"
      >
        <ArrowUturnRightIcon
          aria-label="Redo-Icon"
          className="h-5 mr-2 w-5 text-white cursor-pointer"
        />
      </button>

      <ArrowDownOnSquareIcon
        aria-label="Save-Icon"
        className="h-5 mr-2 w-5 text-white cursor-pointer"
        onClick={() => exportUsfm(bookCode)}
        title="Save"
      />
    </>
  );
}
