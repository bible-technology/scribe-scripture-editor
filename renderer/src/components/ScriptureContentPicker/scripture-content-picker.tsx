import React, { useContext } from 'react';

import {
  ScriptureSource,
  ScriptureContentGroup,
  ScriptureContentPickerCallback,
} from './scripture-content-picker-interfaces';
import {
  ScriptureContentTypeMenu,
  ScriptureContentList,
  ScriptureSourceContext,
  ContentContext,
  ContentContextProvider,
  ComponentTypeContext,
} from './shared/ui';

/* eslint-disable-next-line */
export interface ScriptureContentPickerProps {
  source: ScriptureSource;
  onSelect: ScriptureContentPickerCallback;
}

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

interface PickerComponentProps { }

// eslint-disable-next-line no-empty-pattern
export function PickerComponent({ }: PickerComponentProps) {
  const { source } = useContext(ScriptureSourceContext);
  const contentTypes = isScriptureSource(source) ? Object.keys(source) : [];
  const { contentType, changeContentType } = useContext(ContentContext);

  const scriptureContentGroup: ScriptureContentGroup =
    contentType && isScriptureSource(source) ? source[contentType] : {};

  return (
    <div className={'container'}>
      <ScriptureContentTypeMenu
        items={contentTypes}
        onSelectMenuItem={changeContentType}
        selectedItem={contentType}
      />
      <div className={'list-wrap'}>
        {contentType && <ScriptureContentList group={scriptureContentGroup} />}
      </div>
    </div>
  );
}

export function ScriptureContentPicker({
  source,
  onSelect,
}: ScriptureContentPickerProps) {
  return (
    <ComponentTypeContext.Provider value="picker">
      <ContentContextProvider>
        <ScriptureSourceContext.Provider value={{ source, onSelect }}>
          <PickerComponent />
        </ScriptureSourceContext.Provider>
      </ContentContextProvider>
    </ComponentTypeContext.Provider>
  );
}

export default ScriptureContentPicker;
