export function scriptureContentPickerInterfaces(): string {
  return 'scripture-content-picker-interfaces';
}

export type ScriptureContentSrcType = 'fs' | 'url';
export type ScriptureContent = {
  description: string;
  language: string;
  src: {
    type: ScriptureContentSrcType;
    path?: string;
    url?: string;
  };
  books: string[];
};

export type ScriptureContentMetaExcludeTypeInfo = ScriptureContent & {
  localLabel: ScriptureContentLocalLabel;
};
export type ScriptureContentMeta = ScriptureContentMetaExcludeTypeInfo & {
  contentType: ScriptureContentType;
};

export type ScriptureContentDetail = ScriptureContentMeta & {
  data: string;
};

export type ScriptureContentLocalLabel = string;
export type ScriptureContentGroup = Record<
  ScriptureContentLocalLabel,
  ScriptureContent
>;

export type ScriptureContentType = string;
export type ScriptureSource = Record<
  ScriptureContentType,
  ScriptureContentGroup
>;

export type ScriptureContentPickerError = unknown;

export type ScriptureContentPickerCallback = (
  content: ScriptureContentDetail,
  error: ScriptureContentPickerError | null
) => unknown;

export type ScriptureContentSourceGroup = Record<
  ScriptureContentLocalLabel,
  string
>;

export type ScriptureSourceContent = Record<
  ScriptureContentType,
  ScriptureContentSourceGroup
>;
