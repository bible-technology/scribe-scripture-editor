import React, { useState, useContext } from 'react';

import {
  ScriptureSource,
  ScriptureContent,
  ScriptureContentType,
  ScriptureContentGroup,
  ScriptureContentMeta,
  ScriptureContentLocalLabel,
  ScriptureContentMetaExcludeTypeInfo,
} from './scripture-content-picker-interfaces';

import {
  ScriptureContentTypeMenu,
  ScriptureContentList,
  ScriptureContentEditModal,
  ScriptureSourceContext,
  ContentContext,
  ContentContextProvider,
  ComponentTypeContext,
} from './shared/ui';

import AddIcon from '@/illustrations/add-button.svg';

/* eslint-disable-next-line */
export interface ScriptureContentPickerConfigProps {
  source: ScriptureSource;
  setSource: React.Dispatch<React.SetStateAction<ScriptureSource>>;
}

function isScriptureSource(
  source: ScriptureSource | undefined
): source is ScriptureSource {
  return source !== undefined;
}

interface ConfigComponentProps { }

// eslint-disable-next-line no-empty-pattern
export function ConfigComponent({ }: ConfigComponentProps) {
  const { source } = useContext(ScriptureSourceContext);
  const contentTypes = isScriptureSource(source) ? Object.keys(source) : [];
  const { contentType, changeContentType } = useContext(ContentContext);

  const scriptureContentGroup: ScriptureContentGroup =
    contentType && isScriptureSource(source) ? source[contentType] : {};

  const [modalIsOpen, setIsOpen] = useState(false);
  const initialState: ScriptureContentMetaExcludeTypeInfo = {
    localLabel: '',
    description: '',
    language: '',
    src: {
      type: 'fs',
    },
    books: [],
  };

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div className={'container'}>
      <ScriptureContentTypeMenu
        items={contentTypes}
        onSelectMenuItem={changeContentType}
        selectedItem={contentType}
      />
      <div className={'list-wrap'}>
        {contentType && <ScriptureContentList group={scriptureContentGroup} />}
        {contentType && (
          <div className={'btn-wrap'}>
            <span
              onClick={() => {
                openModal();
              }}
            >
              <AddIcon />
            </span>
          </div>
        )}
      </div>
      {contentType && (
        <ScriptureContentEditModal
          isOpen={modalIsOpen}
          setIsOpen={setIsOpen}
          initialState={initialState}
        />
      )}
    </div>
  );
}

export function ScriptureContentPickerConfig({
  source,
  setSource,
}: ScriptureContentPickerConfigProps) {
  const addContent = (
    content: ScriptureContentMeta,
    prevContent: ScriptureContentMetaExcludeTypeInfo
  ) => {
    setSource((prev) => {
      const copy: ScriptureContent & {
        localLabel?: string;
        contentType?: string;
      } = { ...content };
      delete copy.localLabel;
      delete copy.contentType;

      const exists = Object.entries(prev[content.contentType])
        .filter(([key]) => key === prevContent.localLabel);

      if (exists.length > 0) {
        const newContentGroup = Object.fromEntries(
          Object.entries(prev[content.contentType]).map(
            (entry) => {
              if (entry[0] !== prevContent.localLabel) {
                return entry;
              } else {
                return [content.localLabel, copy as ScriptureContent];
              }
            }
          )
        );

        return {
          ...prev,
          [content.contentType]: {
            ...newContentGroup,
          },
        };
      } else {
        const newContentGroup = Object.fromEntries(
          Object.entries(prev[content.contentType]).filter(
            ([key]) => key !== prevContent.localLabel
          )
        );

        return {
          ...prev,
          [content.contentType]: {
            ...newContentGroup,
            [content.localLabel as ScriptureContentLocalLabel]:
              copy as ScriptureContent,
          },
        };
      }
    });
  };

  const removeContent = (
    contentType: ScriptureContentType,
    localLabel: ScriptureContentLocalLabel
  ) => {
    setSource((prev) => {
      const copy: ScriptureContentGroup = { ...prev[contentType] };
      delete copy[localLabel];
      return {
        ...prev,
        [contentType]: copy,
      };
    });
  };

  return (
    <ComponentTypeContext.Provider value="config">
      <ContentContextProvider>
        <ScriptureSourceContext.Provider
          value={{ source, addContent, removeContent }}
        >
          <ConfigComponent />
        </ScriptureSourceContext.Provider>
      </ContentContextProvider>
    </ComponentTypeContext.Provider>
  );
}

export default ScriptureContentPickerConfig;
