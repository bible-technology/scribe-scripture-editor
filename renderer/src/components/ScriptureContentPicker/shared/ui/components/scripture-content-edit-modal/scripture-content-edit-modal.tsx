import React, { useState, useContext, useEffect, useCallback } from 'react';

import {
  ScriptureContentSrcType,
  ScriptureContentMetaExcludeTypeInfo,
  ScriptureContentType,
} from '../../../../ScriptureContentPickerInterfaces';
import styles from './scripture-content-edit-modal.module.css';
import Modal from 'react-modal';
import {
  ContentContext,
  ScriptureSourceContext,
} from '../../contexts/scripture-content-picker-context';
import {
  windowsPathValidation,
  linuxPathValidation,
} from '../../../utils';
import MultipleInput from '../multiple-input/multiple-input';

/* eslint-disable-next-line */
export interface ScriptureContentEditModalProps {
  initialState: ScriptureContentMetaExcludeTypeInfo;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export function ScriptureContentEditModal({
  initialState,
  isOpen,
  setIsOpen,
}: ScriptureContentEditModalProps) {
  const contentType = useContext(ContentContext)
    .contentType as ScriptureContentType;
  const { addContent } = useContext(ScriptureSourceContext);
  const [scriptureContent, setScriptureContent] =
    useState<ScriptureContentMetaExcludeTypeInfo>(initialState);

  const srcRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setScriptureContent(initialState);
  }, [initialState]);

  const closeModal = () => {
    setIsOpen(false);
  }

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (event.target.name === 'type') {
      setScriptureContent((prev) => ({
        ...prev,
        src: {
          type: event.target.value as ScriptureContentSrcType,
        },
      }));
    } else if (event.target.name === 'source') {
      setScriptureContent((prev: ScriptureContentMetaExcludeTypeInfo) => {
        return {
          ...prev,
          src: {
            type: prev.src.type as ScriptureContentSrcType,
            path: prev.src.type === 'fs' ? event.target.value : undefined,
            url: prev.src.type === 'url' ? event.target.value : undefined,
          },
        };
      });
      if (scriptureContent.src.type === 'fs') {
        const winPathValid = windowsPathValidation(event.target.value);
        const linuxPathValid = linuxPathValidation(event.target.value);
        if (!winPathValid && !linuxPathValid)
          srcRef.current?.setCustomValidity('Please fill correct path!');
        else srcRef.current?.setCustomValidity('');
      }

      if (scriptureContent.src.type === 'url') {
        const httpRegex =
          // eslint-disable-next-line no-useless-escape
          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
        if (!httpRegex.test(event.target.value))
          srcRef.current?.setCustomValidity('Please fill correct url!');
        else srcRef.current?.setCustomValidity('');
      }

      srcRef.current?.reportValidity();
    } else {
      setScriptureContent((prev) => ({
        ...prev,
        [event.target.name]: event.target.value,
      }));
    }
  }

  const handleAddNewBook = useCallback((book: string) => {
    setScriptureContent((prev) => {
      return {
        ...prev,
        books: [...prev.books.filter((item) => item !== book), book],
      };
    });
  }, []);

  const handleDeleteBook = useCallback((book: string) => {
    setScriptureContent((prev) => {
      return {
        ...prev,
        books: [...prev.books.filter((item) => item !== book)],
      };
    });
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    addContent &&
      addContent({ ...scriptureContent, contentType }, initialState);
    setScriptureContent(initialState);
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add content"
      ariaHideApp={false}
    >
      <form onSubmit={handleSubmit}>
        <div className={styles['form_content_wrap']}>
          <div className={styles['form_content_inputs']}>
            <div>
              <div>
                <label>Local Label:</label>
              </div>
              <div>
                <input
                  type="text"
                  name="localLabel"
                  required
                  value={scriptureContent.localLabel}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>Description:</label>
              </div>
              <div>
                <textarea
                  name="description"
                  rows={3}
                  value={scriptureContent.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>Books:</label>
              </div>
              <div>
                <MultipleInput placeholder='Add More Books' states={scriptureContent.books} onAddState={handleAddNewBook} onDeleteState={handleDeleteBook} />
              </div>
            </div>
            <div>
              <div>
                <label>Language:</label>
              </div>
              <div>
                <input
                  type="text"
                  name="language"
                  required
                  value={scriptureContent.language}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <div>
                <label>SourceType:</label>
              </div>
              <div>
                <select
                  name="type"
                  value={scriptureContent.src.type}
                  onChange={handleChange}
                >
                  <option value="fs">FS</option>
                  <option value="url">URL</option>
                </select>
              </div>
            </div>
            <div>
              <div>
                <label>Source:</label>
              </div>
              <div>
                <input
                  type="text"
                  name="source"
                  ref={srcRef}
                  required
                  value={
                    (scriptureContent.src.type === 'fs'
                      ? scriptureContent.src.path
                      : scriptureContent.src.url) || ''
                  }
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className={styles['form_content_btn-wrap']}>
            <button type="submit">
              {initialState.localLabel === '' ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default ScriptureContentEditModal;
