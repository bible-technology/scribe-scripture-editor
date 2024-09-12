import { useState, useContext } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './scripture-content-list-item.module.css';

import { Tag } from '../tag/tag';
import { Spinner } from '../spinner/spinner';
import DeleteIcon from './delete-icon';
import EditIcon from './edit-icon';

import type {
  ScriptureContentMetaExcludeTypeInfo,
  ScriptureContentType,
} from '../../../../ScriptureContentPickerInterfaces';

import { ScriptureContentEditModal } from '../scripture-content-edit-modal/scripture-content-edit-modal';
import { ScriptureContentConfirmModal } from '../scripture-content-confirm-modal/scripture-content-confirm-modal';
import {
  ContentContext,
  ScriptureSourceContext,
  ComponentTypeContext,
} from '../../contexts/scripture-content-picker-context';

import { useScriptureReader } from '../../hooks/scripture-reader-hook';
import React from 'react';

export interface ScriptureContentListItemProps {
  content: ScriptureContentMetaExcludeTypeInfo;
}

export function ScriptureContentListItem({
  content,
}: ScriptureContentListItemProps) {
  const { contentType } = useContext(ContentContext);
  const { removeContent } = useContext(ScriptureSourceContext);
  const componentType = useContext(ComponentTypeContext);

  const { loading, fetch } = useScriptureReader({
    ...content,
    contentType: contentType as ScriptureContentType,
  });

  const {
    description,
    language,
    books,
    src: { url, path },
  } = content;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleClick = async (event: React.MouseEvent) => {
    event.stopPropagation();
    if (componentType === 'config') return;
    await fetch();
  };

  const handleCancelAction = () => {
    setIsConfirmModalOpen(false);
  };

  const handleConfirmAction = () => {
    removeContent &&
      removeContent(contentType as ScriptureContentType, content.localLabel);
  };

  return (
    <div
      className={`${styles['container']}  ${styles[componentType]}`}
      onClick={handleClick}
    >
      <div className={styles['labels']}>
        <p className={styles['local-label']}>{content.localLabel}</p>
        <p>
          {description} &#40; {language} &#41;
        </p>
        <div className={'tags-list'}>
          {books.map((book) => (
            <>{'\u0020'}
              <Tag color="#cbc3e3" key={book}>
                {book}
              </Tag>
            </>
          ))}
        </div>
        {path && <p>Local FS: {path}</p>}
        {url && <p>URL: {url}</p>}
      </div>
      {componentType === 'config' && (
        <div className={'btn-group'}>
          <span
            onClick={() => {
              setIsConfirmModalOpen(true);
            }}
          >
            <DeleteIcon />
          </span>
          <span
            onClick={() => {
              setIsEditModalOpen(true);
            }}
          >
            <EditIcon />
          </span>
        </div>
      )}

      <ScriptureContentEditModal
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        initialState={{ ...content }}
      />
      <ScriptureContentConfirmModal
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        onCancel={handleCancelAction}
        onConfirm={handleConfirmAction}
        title="Delete Content"
        message="Are you sure to delete this item?"
      />

      <Spinner show={loading} />
    </div>
  );
}

export default ScriptureContentListItem;
