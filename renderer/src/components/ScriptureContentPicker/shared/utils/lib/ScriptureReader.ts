import {
  ScriptureContentMeta,
  ScriptureContentPickerCallback,
} from '../../../scripture-content-picker-interfaces';
import { isBrowser } from './utils';

export abstract class ScriptureReader {
  abstract read(
    content: ScriptureContentMeta,
    callback: ScriptureContentPickerCallback
  ): Promise<void>;
}

export class ScriptureURLReader extends ScriptureReader {
  async read(
    content: ScriptureContentMeta,
    callback: ScriptureContentPickerCallback
  ): Promise<void> {
    let data: unknown = '';
    try {
      const response = await fetch(content.src.url as string);
      data = await (await response.blob()).text();
      callback({ ...content, data: data as string }, null);
    } catch (error) {
      console.error('detected error while reading URL', error);
      callback({ ...content, data: '' }, error);
    }
  }
}

export class ScriptureFSReader extends ScriptureReader {
  async read(
    content: ScriptureContentMeta,
    callback: ScriptureContentPickerCallback
  ): Promise<void> {
    if (!isBrowser()) {
      callback(
        { ...content, data: '' },
        new Error('File access is not allowed in browser')
      );
      return;
    }

    try {
      if (electron) {
        const data = await electron.readFile(content.src.path as string, {
          encoding: 'utf8',
        });
        callback({ ...content, data: data as string }, null);
      }
    } catch (error) {
      console.error('detected error while reading a local file', error);
      callback({ ...content, data: '' }, error);
    }
  }
}
