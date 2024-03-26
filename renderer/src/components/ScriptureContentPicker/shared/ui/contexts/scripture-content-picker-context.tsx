import { createContext, ReactNode, useReducer } from 'react';
import {
  ScriptureSource,
  ScriptureContentType,
  ScriptureContentMeta,
  ScriptureContentMetaExcludeTypeInfo,
  ScriptureContentLocalLabel,
  ScriptureContentPickerCallback,
} from '../../../scripture-content-picker-interfaces';

export type ComponentType = 'picker' | 'config';

export const ComponentTypeContext = createContext<ComponentType>('picker');

export type ContentContextType = {
  contentType: ScriptureContentType | undefined;
  changeContentType: (contentType: ScriptureContentType) => void;
};

export interface ContentConextProviderProps {
  children?: ReactNode;
}

export type ScriptureSourceContextType = {
  source: ScriptureSource | undefined;
  addContent?:
  | ((
    content: ScriptureContentMeta,
    prevContent: ScriptureContentMetaExcludeTypeInfo
  ) => void)
  | undefined;
  removeContent?:
  | ((
    contentType: ScriptureContentType,
    localLabel: ScriptureContentLocalLabel
  ) => void)
  | undefined;
  onSelect?: ScriptureContentPickerCallback | undefined;
};

export const ScriptureSourceContext = createContext<ScriptureSourceContextType>(
  {
    source: undefined,
  }
);

const initialState: ContentContextType = {
  contentType: undefined,
  changeContentType: (contentType: string) => { },
};

export const ContentContext = createContext<ContentContextType>(initialState);

function reducer(
  state: ContentContextType = initialState,
  action: { type: string; payload: ScriptureContentType }
) {
  if (action.type === 'CHANGE_CONTENT_TYPE') {
    return {
      ...state,
      contentType: action.payload,
    };
  }
  return state;
}

export function ContentContextProvider({
  children,
}: ContentConextProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = {
    contentType: state.contentType,
    changeContentType: (contentType: ScriptureContentType) => {
      dispatch({ type: 'CHANGE_CONTENT_TYPE', payload: contentType });
    },
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}
