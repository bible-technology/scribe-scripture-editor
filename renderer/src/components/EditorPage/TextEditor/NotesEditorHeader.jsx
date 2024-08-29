import React from 'react';

const NotesEditorHeader = ({ onClose }) => (
  <div className="relative min-h-[33px] flex flex-col bg-secondary rounded-t-md overflow-hidden">
    <div
      aria-label="editor-pane"
      className="min-h-[33px] flex items-center justify-between px-1 py-1 text-white text-xxs uppercase tracking-wider font-bold leading-3"
    >
      <div className="flex-1" />
      <div>Notes Editor</div>
      <div className="flex-1 flex justify-end">
        <button
          type="button"
          aria-label="Close editor"
          className="rounded bg-primary p-1 text-white transition duration-300 hover:bg-orange-600"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

export default NotesEditorHeader;
