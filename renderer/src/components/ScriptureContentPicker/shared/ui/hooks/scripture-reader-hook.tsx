import { useState, useContext } from 'react';
import {
  ScriptureContentMeta,
  ScriptureContentPickerCallback,
} from '../../../ScriptureContentPickerInterfaces';
import { ScriptureSourceContext } from '../contexts/scripture-content-picker-context';
import {
  ScriptureReader,
  ScriptureURLReader,
  ScriptureFSReader,
} from '../../utils';

export function useScriptureReader(content: ScriptureContentMeta) {
  const onSelect = useContext(ScriptureSourceContext)
    .onSelect as ScriptureContentPickerCallback;

  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    let reader: ScriptureReader;

    try {
      if (content.src.type === 'url') {
        reader = new ScriptureURLReader();
        await reader.read(content, onSelect);
      } else if (content.src.type === 'fs') {
        reader = new ScriptureFSReader();
        await reader.read(content, onSelect);
      }
      setLoading(false);
    } catch (error) {
      console.error('that is really unexpected error!!!', error);
    }
  };

  return {
    loading,
    fetch,
  };
}

export default useScriptureReader;
