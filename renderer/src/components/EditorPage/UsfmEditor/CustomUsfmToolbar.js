import React, { useContext } from 'react';
import {
  UsfmToolbar, UsfmMarkers,
  //  withChapterSelection,
} from 'usfm-editor';
import { ReferenceContext } from '@/components/context/ReferenceContext';

const CustomUsfmToolbar = () => {
  const {
    state: {
      myEditorRef,
    },
  } = useContext(ReferenceContext);
  const toolbarSpecs = {
    'Section Header': {
      icon: 'S',
      cssClass: 's-toolbar-button',
      actionSpec: {
        buttonType: 'ParagraphButton',
        usfmMarker: UsfmMarkers.TITLES_HEADINGS_LABELS.s,
      },
    },
  };

  return (
    <div style={{ marginLeft: '-30px' }}>
      <UsfmToolbar
        editor={myEditorRef.current}
        toolbarSpecs={toolbarSpecs}
      />
    </div>
  );
};

export default CustomUsfmToolbar;
